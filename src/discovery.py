import os
from typing import List, Set
from config import TARGETS_PATH, DISCOVERY_LANGUAGES, DISCOVERY_STARS, ALLOWED_LICENSES
from client import BaseGitHubClient

def load_existing_targets() -> Set[str]:
    """既存の targets.txt から有効なターゲット（コメントや空行を除く）をロード"""
    existing = set()
    if os.path.exists(TARGETS_PATH):
        try:
            with open(TARGETS_PATH, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#"):
                        existing.add(line)
        except Exception as e:
            print(f"Warning: Failed to load targets.txt: {e}")
    return existing

def save_new_targets(new_targets: List[str]):
    """新しく発見したターゲットリポジトリを targets.txt の末尾に安全に追記"""
    if not new_targets:
        print("新規ターゲットは発見されませんでした。")
        return

    os.makedirs(os.path.dirname(TARGETS_PATH) or ".", exist_ok=True)
    try:
        with open(TARGETS_PATH, "a", encoding="utf-8") as f:
            f.write("\n")
            f.write("# --- Automatically discovered new targets ---\n")
            for repo in new_targets:
                f.write(f"{repo}\n")
        print(f"[Success] {len(new_targets)} 件の新規ターゲットを {TARGETS_PATH} に追加しました。")
    except Exception as e:
        print(f"Error: Failed to save new targets: {e}")

class GitHubSearchClient(BaseGitHubClient):
    def discover_repositories(self, existing: Set[str]) -> List[str]:
        """GitHub Search APIを使用し、主要言語の人気リポジトリを自動検出（トピック別ループを廃止した超効率版）"""
        discovered = []
        seen = set()

        print("\n--- ターゲット自動探索開始 ---")

        for lang in DISCOVERY_LANGUAGES:
            # 1リクエストで対象言語の人気リポジトリを一網打尽に取得 (最大100件)
            query = f"language:{lang} stars:>{DISCOVERY_STARS}"
            url = f"/search/repositories?q={query}&sort=stars&order=desc&per_page=100"
            
            try:
                response = self.client.get(url)
                self._update_rate_limit(response.headers)
                
                if response.status_code == 200:
                    data = response.json()
                    items = data.get("items", [])
                    print(f"[Discovery] Query: '{query}' -> Found {len(items)} repositories.")
                    
                    for item in items:
                        repo_name = item["full_name"]
                        
                        # Python側でライセンス（MIT/Apache-2.0）を安全にフィルタリング (一括選別)
                        license_info = item.get("license")
                        license_key = license_info.get("key") if license_info else None
                        if license_key not in ALLOWED_LICENSES:
                            continue

                        if repo_name not in existing and repo_name not in seen:
                            discovered.append(repo_name)
                            seen.add(repo_name)
                elif response.status_code == 403:
                    print("[Warning] Search API rate limit hit. Stopping search loop to prevent block.")
                    break
                else:
                    print(f"[Discovery] Failed query '{query}': Status {response.status_code}")
            except Exception as e:
                print(f"Error executing query '{query}': {e}")
        
            # 1回あたりの最大追加バッファに達したらループ終了 (過度なデータ急増の防止)
            if len(discovered) >= 1000:
                print("[Info] Target discovery buffer full (1000). Halting loop.")
                break

        return discovered[:1000]

def main():
    token = os.environ.get("GH_TOKEN")
    if not token:
        print("Error: GH_TOKEN is not set.")
        return

    existing = load_existing_targets()
    print(f"現在の targets.txt 登録数: {len(existing)}")

    # 共通クライアントを継承した探索クライアントを起動
    search_client = GitHubSearchClient(token)
    new_discovered = search_client.discover_repositories(existing)
    save_new_targets(new_discovered)

if __name__ == "__main__":
    main()
