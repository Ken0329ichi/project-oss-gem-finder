import os
import json
from typing import Optional, Dict, List
from datetime import datetime, timezone
from schema import OpenSSOTDataset, RepositorySchema, RepoMeta, RepoMetrics, RepoActivity, DatasetProperties
from config import DATA_DIR, DATA_PATH, TARGETS_PATH
from client import GitHubRestClient, GitHubGraphQLClient
from country_detector import CountryDetector
from notifier import DiscordNotifier

def load_targets() -> List[str]:
    """targets.txtからクロール対象リポジトリを読み込む"""
    if os.path.exists(TARGETS_PATH):
        try:
            with open(TARGETS_PATH, "r", encoding="utf-8") as f:
                return [line.strip() for line in f if line.strip() and not line.strip().startswith("#")]
        except Exception as e:
            print(f"Warning: Failed to load targets.txt: {e}")
    return ["fastapi/fastapi", "tailwindlabs/tailwindcss"]

def is_stale_commit(commit_date_str: Optional[str]) -> bool:
    """最終コミット日時が2年以上前（活動停止状態）かどうかを判定"""
    if not commit_date_str:
        return False
    try:
        dt_str = commit_date_str.replace("Z", "+00:00")
        committed_dt = datetime.fromisoformat(dt_str)
        now_utc = datetime.now(timezone.utc)
        return (now_utc - committed_dt).days > (365 * 2)
    except Exception as e:
        print(f"Warning: Failed to parse commit date '{commit_date_str}': {e}")
    return False

def main():
    token = os.environ.get("GH_TOKEN")
    if not token:
        print("Error: GH_TOKEN is not set. Please set the environment variable GH_TOKEN.")
        return

    os.makedirs(DATA_DIR, exist_ok=True)
    
    # REST(防衛用304判定)とGraphQL(ディープフェッチ用)のクライアントを初期化
    rest_client = GitHubRestClient(token)
    graphql_client = GitHubGraphQLClient(token)
    notifier = DiscordNotifier()
    
    targets = load_targets()

    # 1. 前回の data.json（既存データ）をロードしてメモリに保持
    old_data_map = {}
    if os.path.exists(DATA_PATH):
        try:
            with open(DATA_PATH, "r", encoding="utf-8") as f:
                parsed = json.load(f)
                for repo in parsed.get("repositories", []):
                    old_data_map[repo["meta"]["name"]] = repo
        except Exception as e:
            print(f"Warning: Failed to load previous data.json: {e}")

    new_repositories = []
    has_updates = False
    
    # 統計情報の初期化 (Discord通知用)
    updated_count = 0
    removed_count = 0        # 404/非公開によるクレンジング数
    stale_removed_count = 0  # 2年無活動による新陳代謝パージ数
    safety_brake_triggered = False

    # 新陳代謝後に生き残るアクティブなターゲットリスト
    active_targets = []

    # 2. 収集ループの実行
    for idx, repo_name in enumerate(targets):
        # 安全ブレーキ：RESTクライアントのAPI残り枠が危険域に達したら離脱 (500未満で離脱に変更)
        if rest_client.rate_remaining < 500:
            print(f"\n[SafetyBrake] API残り枠が危険域（残り {rest_client.rate_remaining}）に達したため、処理を一時中断し、残りは次回に持ち越します。")
            safety_brake_triggered = True
            has_updates = True
            active_targets.extend(targets[idx:])
            break

        # 第1関門: REST API で ETag を用いた304条件付きリクエストを送信 (API節約の防衛)
        rest_result = rest_client.fetch_repository(repo_name)
        
        if rest_result == "304":
            # 変更なし：前回のデータを引き継ぐが、新陳代謝（コミット2年停止）をキャッシュでチェック
            if repo_name in old_data_map:
                cached_repo = old_data_map[repo_name]
                cached_commit = cached_repo.get("activity", {}).get("last_committed_at")
                
                if is_stale_commit(cached_commit):
                    print(f"[Metabolism] Removed stale repository {repo_name} (No commits since {cached_commit})")
                    stale_removed_count += 1
                    has_updates = True
                    if repo_name in rest_client.etags:
                        del rest_client.etags[repo_name]
                else:
                    new_repositories.append(cached_repo)
                    active_targets.append(repo_name)
                    print(f"  -> {repo_name} のデータをキャリーオーバーしました。")
            continue
                
        elif rest_result == "404":
            # 削除・非公開化：クレンジング
            print(f"[Cleanup] Removed {repo_name} from active dataset.")
            removed_count += 1
            has_updates = True
            continue
            
        elif isinstance(rest_result, dict):
            # 新規または更新あり！第2関門: GraphQLを叩いて深掘りデータ(最新Issueラベル等)を一本釣りする
            if "/" not in repo_name:
                continue
            owner, name = repo_name.split("/", 1)
            
            print(f"  -> {repo_name}: 更新検知。GraphQLでディープフェッチを実行します...")
            deep_result = graphql_client.fetch_repository_deep(owner, name)
            
            if isinstance(deep_result, dict):
                try:
                    # 最終コミット日付による新陳代謝（2年無活動パージ）
                    commit_date = deep_result.get("defaultBranchRef", {}).get("target", {}).get("committedDate")
                    if is_stale_commit(commit_date):
                        print(f"[Metabolism] Removed stale repository {repo_name} (No commits since {commit_date})")
                        stale_removed_count += 1
                        has_updates = True
                        if repo_name in rest_client.etags:
                            del rest_client.etags[repo_name]
                        continue

                    # 最新のオープンIssueから生ラベルを抽出し、重複排除（一意化）かつソートして保存
                    extracted_labels = []
                    latest_issues = deep_result.get("latestIssues", {})
                    if latest_issues and latest_issues.get("nodes"):
                        for issue_node in latest_issues["nodes"]:
                            labels_data = issue_node.get("labels", {})
                            if labels_data and labels_data.get("nodes"):
                                for label_node in labels_data["nodes"]:
                                    label_name = label_node.get("name")
                                    if label_name:
                                        extracted_labels.append(label_name)
                    
                    labels = sorted(list(set(extracted_labels)))
                    if labels:
                        print(f"  [🏷️ Labels Found] {repo_name}: {labels}")

                    # 国別情報の取得と自動判定 (追加API消費ゼロ)
                    owner_location = None
                    if deep_result.get("owner"):
                        owner_location = deep_result["owner"].get("location")
                    
                    detected_country = CountryDetector.detect(owner_location)
                    if owner_location:
                        print(f"  [🌍 Location Info] {repo_name}: Raw='{owner_location}' -> Detected='{detected_country}'")
                    else:
                        print(f"  [🌍 Location Info] {repo_name}: Location not set -> '{detected_country}'")

                    # ホームページURL of 抽出
                    homepage_url = deep_result.get("homepageUrl")

                    # 初心者向けIssue数の抽出
                    good_first_issues = 0
                    if deep_result.get("goodFirstIssues"):
                        good_first_issues = deep_result["goodFirstIssues"].get("totalCount", 0)

                    # オープンPR数の抽出
                    open_pull_requests = 0
                    if deep_result.get("openPullRequests"):
                        open_pull_requests = deep_result["openPullRequests"].get("totalCount", 0)

                    # GraphQLのレスポンスデータをPydanticスキーマにマッピング
                    lic = deep_result.get("licenseInfo")
                    lang = deep_result.get("primaryLanguage")
                    topics = [node["topic"]["name"] for node in deep_result.get("repositoryTopics", {}).get("nodes", [])]

                    meta = RepoMeta(
                        name=deep_result["nameWithOwner"],
                        owner=owner,
                        description=deep_result.get("description"),
                        license=lic.get("spdxId") if lic else None,
                        primary_language=lang.get("name") if lang else None,
                        owner_location=owner_location,
                        detected_country=detected_country,
                        homepage_url=homepage_url
                    )

                    metrics = RepoMetrics(
                        stargazers=deep_result["stargazerCount"],
                        forks=deep_result["forkCount"],
                        open_issues=deep_result["issues"]["totalCount"],
                        good_first_issues=good_first_issues,
                        open_pull_requests=open_pull_requests
                    )

                    activity = RepoActivity(
                        last_pushed_at=deep_result.get("pushedAt"),
                        last_committed_at=commit_date,
                        labels=labels
                    )

                    repo_obj = RepositorySchema(
                        id=str(deep_result["id"]),
                        meta=meta,
                        metrics=metrics,
                        activity=activity,
                        search_keywords=topics
                    )

                    new_repositories.append(repo_obj.model_dump())
                    active_targets.append(repo_name)
                    print(f"  -> {repo_name} のディープフェッチおよびスキーマ検証に成功しました。")
                    updated_count += 1
                    has_updates = True
                except Exception as e:
                    print(f"Schema Validation Error for {repo_name}: {e}")
                    # バリデーションエラー時は安全のため古いデータを残す
                    if repo_name in old_data_map:
                        new_repositories.append(old_data_map[repo_name])
                        active_targets.append(repo_name)
            else:
                # GraphQL通信失敗時はRESTの基本データでフォールバックするか、古いデータを残す
                print(f"[Warning] GraphQL fetch failed for {repo_name}. Using cached data.")
                if repo_name in old_data_map:
                    new_repositories.append(old_data_map[repo_name])
                    active_targets.append(repo_name)

    # 3. CC BY 4.0のヘッダーとともに最終JSONを書き出し
    dataset_properties = DatasetProperties(source_url="https://github.com/ken0329/crawler")
    data_payload = OpenSSOTDataset(
        dataset_properties=dataset_properties,
        repositories=new_repositories
    )

    if has_updates or not os.path.exists(DATA_PATH):
        with open(DATA_PATH, "w", encoding="utf-8") as f:
            f.write(data_payload.model_dump_json(indent=2))
        print(f"\n[Success] {DATA_PATH} に {len(new_repositories)} 件のデータを保存しました。")
        # RESTクライアントのETagデータを保存
        rest_client.save_etags()
        print(f"[Success] キャッシュETagsを更新しました。")
        
        # 新陳代謝：生きたアクティブなターゲットのみを targets.txt に書き戻し同期
        try:
            with open(TARGETS_PATH, "w", encoding="utf-8") as f:
                f.write("# --- Active Repositories List (Auto-cleansed) ---\n")
                for repo in active_targets:
                    f.write(f"{repo}\n")
            print(f"[Success] {TARGETS_PATH} のアクティブリストを同期更新しました (生存件数: {len(active_targets)})。")
        except Exception as e:
            print(f"Error updating targets.txt: {e}")
    else:
        print("\n[Skip] データに更新がないため、ファイルの保存とコミットをスキップします。")

    # 4. Discordへの完了サマリー通知 (オプトイン)
    final_rate = min(rest_client.rate_remaining, graphql_client.rate_remaining)
    notifier.send_summary(
        total_targets=len(new_repositories),
        updated_count=updated_count,
        removed_count=removed_count,
        stale_removed_count=stale_removed_count,
        rate_remaining=final_rate,
        safety_brake_triggered=safety_brake_triggered
    )

if __name__ == "__main__":
    main()
