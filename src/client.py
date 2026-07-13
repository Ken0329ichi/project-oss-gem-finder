import os
import json
import httpx
from typing import Optional, Dict
from config import ETAGS_PATH

class BaseGitHubClient:
    def __init__(self, token: str):
        # 共通のHTTPクライアント初期化とヘッダー設定 (DRY)
        self.client = httpx.Client(
            base_url="https://api.github.com",
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/vnd.github.v3+json",
                "X-GitHub-Api-Version": "2022-11-28"
            }
        )
        self.rate_remaining = 5000  # デフォルト制限値

    def _update_rate_limit(self, headers):
        # レスポンスヘッダーからAPIの残り枠数を抽出して更新
        remaining = headers.get("X-RateLimit-Remaining")
        if remaining is not None:
            self.rate_remaining = int(remaining)

class GitHubRestClient(BaseGitHubClient):
    def __init__(self, token: str):
        super().__init__(token)
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
        os.makedirs(os.path.dirname(ETAGS_PATH) or ".", exist_ok=True)
        with open(ETAGS_PATH, "w", encoding="utf-8") as f:
            json.dump(self.etags, f, indent=2, ensure_ascii=False)

    def fetch_repository(self, repo_name: str) -> Optional[dict]:
        """REST APIを使用して条件付きリクエスト(304判定)を送信"""
        headers = {}
        saved_etag = self.etags.get(repo_name)
        if saved_etag:
            headers["If-None-Match"] = saved_etag
            print(f"[Debug] {repo_name} - Sending If-None-Match: {saved_etag}")

        try:
            response = self.client.get(f"/repos/{repo_name}", headers=headers)
            self._update_rate_limit(response.headers)
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
            if repo_name in self.etags:
                del self.etags[repo_name]
            return "404"
        
        print(f"[!] {repo_name}: 予期せぬステータスコード {response.status_code}")
        return None

class GitHubGraphQLClient(BaseGitHubClient):
    def __init__(self, token: str):
        super().__init__(token)
        self.query = self._load_query()

    def _load_query(self) -> str:
        # queries/funny_labels.graphql からクエリ文字列を読み込む
        query_path = os.path.join(os.path.dirname(__file__), "queries", "funny_labels.graphql")
        try:
            with open(query_path, "r", encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            print(f"Error: Failed to load GraphQL query from {query_path}: {e}")
            return ""

    def fetch_repository_deep(self, owner: str, name: str) -> Optional[dict]:
        """GraphQLを使用して、メタデータ・メトリクス・最新Issueのラベルを1発取得"""
        if not self.query:
            print("[!] GraphQL query is empty. Cannot fetch.")
            return None

        variables = {"owner": owner, "name": name}
        try:
            response = self.client.post("/graphql", json={"query": self.query, "variables": variables})
            self._update_rate_limit(response.headers)
            
            if response.status_code == 200:
                res_json = response.json()
                if "errors" in res_json:
                    print(f"[!] GraphQL Error for {owner}/{name}: {res_json['errors'][0]['message']}")
                    # リポジトリが見つからないエラーの場合は404扱いにします
                    return "404" if "Could not resolve to a Repository" in res_json['errors'][0]['message'] else None
                return res_json.get("data", {}).get("repository")
            elif response.status_code in [403, 404]:
                return "404"
            else:
                print(f"[!] GraphQL Request Failed: Status {response.status_code}")
        except Exception as e:
            print(f"Connection Error for {owner}/{name}: {e}")
        return None
