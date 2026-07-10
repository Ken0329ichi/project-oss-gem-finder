import os
import json
import httpx
from typing import Optional, Dict, List
from schema import OpenSSOTDataset, RepositorySchema, RepoMeta, RepoMetrics, RepoActivity, DatasetProperties

# ETagとデータの保存先ディレクトリ
DATA_DIR = "data"
ETAGS_PATH = os.path.join(DATA_DIR, "etags.json")
DATA_PATH = os.path.join(DATA_DIR, "data.json")
TARGETS_PATH = "targets.txt"

# 【単一責任】GitHubとのREST通信とETag（安全装置）の管理に徹するクラス
class GitHubClient:
    def __init__(self, token: str):
        self.client = httpx.Client(
            base_url="https://api.github.com",
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/vnd.github.v3+json"
            }
        )
        self.etags = self._load_etags()

    def _load_etags(self) -> Dict[str, str]:
        if os.path.exists(ETAGS_PATH):
            try:
                with open(ETAGS_PATH, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"Warning: Failed to load etags.json: {e}")
        return {}

    def save_etags(self):
        os.makedirs(DATA_DIR, exist_ok=True)
        with open(ETAGS_PATH, "w", encoding="utf-8") as f:
            json.dump(self.etags, f, indent=2, ensure_ascii=False)

    # ETagを添えて条件付きリクエストを送る関数
    # 戻り値:
    #   - response_json (dict): 更新あり (200 OK)
    #   - "304": 変更なし (304 Not Modified)
    #   - "404": リポジトリ消失・非公開化（クレンジング対象）
    #   - None: その他のエラー
    def fetch_repository(self, repo_name: str) -> Optional[dict]:
        headers = {}
        saved_etag = self.etags.get(repo_name)
        if saved_etag:
            headers["If-None-Match"] = saved_etag
            print(f"[Debug] {repo_name} - Sending If-None-Match: {saved_etag}")

        try:
            response = self.client.get(f"/repos/{repo_name}", headers=headers)
        except Exception as e:
            print(f"Connection Error for {repo_name}: {e}")
            return None

        if response.status_code == 304:
            print(f"[-] {repo_name}: 変更なし (304 Not Modified) - スキップ")
            return "304"

        if response.status_code == 200:
            print(f"[+] {repo_name}: 更新あり (200 OK) - データを取得")
            new_etag = response.headers.get("ETag")
            if new_etag:
                self.etags[repo_name] = new_etag
            return response.json()

        if response.status_code in [403, 404]:
            print(f"[!] {repo_name}: 存在しないか非公開化 (Status: {response.status_code}) - 削除対象")
            # 記憶からETagを削除
            if repo_name in self.etags:
                del self.etags[repo_name]
            return "404"
        
        print(f"[!] {repo_name}: 予期せぬステータスコード {response.status_code}")
        return None

# 【開放閉鎖】ターゲット収集用のベース抽象クラス
class BaseTargetScraper:
    def get_targets(self) -> List[str]:
        raise NotImplementedError

class CuratedTargetScraper(BaseTargetScraper):
    def __init__(self):
        self.targets = self._load_targets()

    def _load_targets(self) -> List[str]:
        if os.path.exists(TARGETS_PATH):
            try:
                with open(TARGETS_PATH, "r", encoding="utf-8") as f:
                    # 空行や、# で始まるコメント行を除外してリスト化
                    return [line.strip() for line in f if line.strip() and not line.strip().startswith("#")]
            except Exception as e:
                print(f"Warning: Failed to load targets.txt: {e}")
        
        # ファイルがない場合のデフォルトフォールバック
        return ["fastapi/fastapi", "tailwindlabs/tailwindcss"]

    def get_targets(self) -> List[str]:
        return self.targets

# 【司令塔】マージ・キャリーオーバー・クレンジングを統合制御
def main():
    token = os.environ.get("GH_TOKEN")
    if not token:
        print("Error: GH_TOKEN is not set. Please set the environment variable GH_TOKEN.")
        return

    # 保存ディレクトリの作成
    os.makedirs(DATA_DIR, exist_ok=True)

    client = GitHubClient(token)
    
    scraper = CuratedTargetScraper()
    targets = scraper.get_targets()

    # クレンジング検証用に環境変数で切り替え可能にする
    if os.environ.get("TEST_CLEANSING") == "true":
        targets.append("nonexistent-user-12345/nonexistent-repo")

    # 1. 前回の data.json（既存データ）をロードしてメモリに保持
    old_data_map = {}
    if os.path.exists(DATA_PATH):
        try:
            with open(DATA_PATH, "r", encoding="utf-8") as f:
                parsed = json.load(f)
                # リポジトリ名をキーにしてマッピング
                for repo in parsed.get("repositories", []):
                    old_data_map[repo["meta"]["name"]] = repo
        except Exception as e:
            print(f"Warning: Failed to load previous data.json: {e}")

    new_repositories = []
    has_updates = False

    # 2. 収集ループの実行
    for repo_name in targets:
        result = client.fetch_repository(repo_name)
        
        if result == "304":
            # 変更なし：前回のデータをそのまま引き継ぐ（キャリーオーバー）
            if repo_name in old_data_map:
                new_repositories.append(old_data_map[repo_name])
                print(f"  -> {repo_name} のデータをキャリーオーバーしました。")
            else:
                print(f"  -> Warning: {repo_name} の前回データが見つかりません。再フェッチを試みます。")
                # 前回のデータがない場合はETagを消して再取得を促す
                if repo_name in client.etags:
                    del client.etags[repo_name]
                # 今回は取得を諦め、次回取得させるか、再度APIを叩く。シンプルにするためスキップ。
                
        elif result == "404":
            # 削除・非公開化：今回のリストからも過去マップからも除外（クレンジング）
            print(f"[Cleanup] Removed {repo_name} from active dataset.")
            has_updates = True
            
        elif isinstance(result, dict):
            # 新規・更新あり：APIから得た生データをPydanticで検証して成形
            try:
                license_spdx = None
                if result.get("license") and isinstance(result["license"], dict):
                    license_spdx = result["license"].get("spdx_id")

                meta = RepoMeta(
                    name=result["full_name"],
                    owner=result["owner"]["login"],
                    description=result.get("description"),
                    license=license_spdx,
                    primary_language=result.get("language")
                )

                metrics = RepoMetrics(
                    stargazers=result["stargazers_count"],
                    forks=result["forks_count"],
                    open_issues=result["open_issues_count"]
                )

                activity = RepoActivity(
                    last_pushed_at=result.get("pushed_at"),
                    last_committed_at=result.get("pushed_at")
                )

                repo_obj = RepositorySchema(
                    id=str(result["id"]),
                    meta=meta,
                    metrics=metrics,
                    activity=activity,
                    search_keywords=result.get("topics", [])
                )

                new_repositories.append(repo_obj.model_dump())
                print(f"  -> {repo_name} のスキーマ検証に成功し、データを追加しました。")
                has_updates = True
            except Exception as e:
                print(f"Schema Validation Error for {repo_name}: {e}")
                # バリデーションエラー時は安全のため古いデータを残す
                if repo_name in old_data_map:
                    new_repositories.append(old_data_map[repo_name])
                    print(f"  -> {repo_name} のスキーマ検証に失敗したため、古いデータを引き継ぎました。")

    # 3. CC BY 4.0のヘッダーとともに最終JSONを書き出し
    dataset_properties = DatasetProperties(
        source_url="https://github.com/ken0329/crawler"
    )
    
    data_payload = OpenSSOTDataset(
        dataset_properties=dataset_properties,
        repositories=new_repositories
    )

    if has_updates or not os.path.exists(DATA_PATH):
        with open(DATA_PATH, "w", encoding="utf-8") as f:
            # Pydantic v2 の model_dump_json を使用
            f.write(data_payload.model_dump_json(indent=2))
        print(f"\n[Success] {DATA_PATH} に {len(new_repositories)} 件のデータを保存しました。")

        # 4. スタンプ帳（ETagの記憶）の保存
        client.save_etags()
        print(f"[Success] {ETAGS_PATH} を更新しました。")
    else:
        print("\n[Skip] データに更新がないため、ファイルの保存とコミットをスキップします。")

if __name__ == "__main__":
    main()
