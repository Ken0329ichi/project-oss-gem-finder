import os
import httpx
from typing import List, Set

TARGETS_PATH = "targets.txt"

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

def discover_repositories(token: str, existing: Set[str]) -> List[str]:
    """GitHub Search APIを使用し、主要言語×トピック×ライセンスの総当たりで人気リポジトリを爆速で自動検出"""
    client = httpx.Client(
        base_url="https://api.github.com",
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github.v3+json",
            "X-GitHub-Api-Version": "2022-11-28"
        }
    )

    # 探索対象の主要言語、トピック、および許容ライセンス（APIクエリで完全絞り込み）
    languages = ["python", "go", "rust", "typescript", "javascript", "cpp"]
    topics = ["web", "framework", "database", "cli", "tools", "machine-learning"]
    licenses = ["mit", "apache-2.0"]
    
    discovered = []
    seen = set()

    print("\n--- ターゲット自動探索開始 ---")

    for lang in languages:
        for topic in topics:
            for lic in licenses:
                query = f"language:{lang} topic:{topic} license:{lic} stars:>1000"
                url = f"/search/repositories?q={query}&sort=stars&order=desc&per_page=100"
                
                try:
                    response = client.get(url)
                    if response.status_code == 200:
                        data = response.json()
                        items = data.get("items", [])
                        print(f"[Discovery] Query: '{query}' -> Found {len(items)} repositories.")
                        
                        for item in items:
                            repo_name = item["full_name"]
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
            
            if len(discovered) >= 1000:
                break
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

    new_discovered = discover_repositories(token, existing)
    save_new_targets(new_discovered)

if __name__ == "__main__":
    main()
