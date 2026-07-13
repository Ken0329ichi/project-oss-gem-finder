from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone

# 1. サイトの門構え（CC BY 4.0の法的宣言とメタデータ）
class DatasetProperties(BaseModel):
    title: str = "OpenSSOT GitHub Archive"
    publisher: str = "ken0329"
    source_url: str
    license: str = "CC-BY-4.0"
    license_url: str = "https://creativecommons.org/licenses/by/4.0/"
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# 2. 各リポジトリの不変な属性
class RepoMeta(BaseModel):
    name: str
    owner: str
    description: Optional[str] = None
    license: Optional[str] = None
    primary_language: Optional[str] = None
    owner_location: Optional[str] = None
    detected_country: Optional[str] = None

# 3. 各リポジトリの数値指標
class RepoMetrics(BaseModel):
    stargazers: int
    forks: int
    open_issues: int

# 4. 各リポジトリの生存確認アクティビティ
class RepoActivity(BaseModel):
    last_committed_at: Optional[datetime] = None
    last_pushed_at: Optional[datetime] = None
    funny_labels: List[str] = Field(default_factory=list)

# 5. これらを統合したリポジトリ1件分の塊
class RepositorySchema(BaseModel):
    id: str
    meta: RepoMeta
    metrics: RepoMetrics
    activity: RepoActivity
    search_keywords: List[str]

# 6. 最終的に data.json として吐き出される全体の形
class OpenSSOTDataset(BaseModel):
    dataset_properties: DatasetProperties
    repositories: List[RepositorySchema]
