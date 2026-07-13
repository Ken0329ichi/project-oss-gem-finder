from typing import List
from config import FUNNY_LABEL_KEYWORDS

class FunnyLabelExtractor:
    @staticmethod
    def extract(graphql_repo: dict) -> List[str]:
        """GraphQLから得たリポジトリデータから、エンジニアのユーモアが滲み出るラベルを抽出してユニーク化"""
        found_labels = set()
        issue_nodes = graphql_repo.get("latestIssues", {}).get("nodes", [])
        
        for issue in issue_nodes:
            label_nodes = issue.get("labels", {}).get("nodes", [])
            for label in label_nodes:
                label_name = label["name"].lower()
                # 判定ロジック: キーワード辞書に含まれるか、特定の警告/エラー関連表現を含むものを検知
                if label_name in FUNNY_LABEL_KEYWORDS or any(kw in label_name for kw in ["wont", "error", "machine", "fault"]):
                    found_labels.add(label["name"]) # 表示用の表記揺れ（大文字小文字）を維持するため元の名前を保存
                    
        return list(found_labels)[:5] # 最大5件に制限（KISS原則）
