# OSS Gem Finder — ワークスペースルール

このファイルは `g:/マイドライブ/_dev/02_project_oss_gem_finder` ワークスペース専用のルールです。
Eveはこのルールをすべての作業で厳守してください。

---

## 1. デプロイポリシー（最重要）

- **GitHub Pages への自動デプロイは禁止**。`.github/workflows/deploy.yml` のトリガーは `workflow_dispatch`（手動実行のみ）に固定すること。
- `main` へ push しても deploy ジョブが自動起動してはいけない。
- 本番公開するときは Ken が GitHub Actions タブの「Run workflow」ボタンを手動で押す。
- デプロイ前に必ず GitHub リポジトリ設定で Pages を「GitHub Actions」ソースに有効化するよう Ken に案内すること。

---

## 2. フロントエンド開発ルール

### ローカル開発環境
- 開発サーバー: `wsl sudo docker compose -f docker/frontend/compose.local.yml up -d`
- アクセス URL: `http://localhost:5173/`
- 接続できない場合は、`wsl sudo docker ps` でコンテナ状態を確認し、必要なら再起動する。
- `wsl curl -I http://localhost:5173` で疎通を確認してからブラウザ検証に進む。

### ファイル構成
- メインロジック: `src/App.jsx`
- スタイル: `src/App.css`（Vanilla CSS、TailwindCSS は使用しない）
- チャートライブラリ: Recharts v2

### 変更後の手順
```
git add src/App.jsx src/App.css
git commit -m "feat|fix|chore: <内容>"
git pull --rebase
git push origin main
```

---

## 3. Recharts 使用上の注意点・パターン集

### ツールチップ残留バグへの対処
フィルター（selectedLabel / selectedCountry / selectedLang / scatterMaxStars）が変わったとき、
Recharts の `<Tooltip>` は内部状態を保持し続けてツールチップが残留する。
**対策: `<ScatterChart>` に `key` プロップを付与してフィルター変更時に強制リマウント**

```jsx
<ScatterChart
  key={`scatter-${selectedLabel}-${selectedCountry}-${selectedLang}-${scatterMaxStars}`}
>
```

### モーダル表示中のツールチップ非表示
モーダル（`selectedRepo`）が開いているとき、散布図のツールチップを非表示にする。

```jsx
{!selectedRepo && <Tooltip cursor={{ strokeDasharray: '3 3' }} />}
```

### ダークテーマ対応カスタム Tooltip
Recharts デフォルトの Tooltip は白背景で暗いテーマに合わない。
必ずカスタム Tooltip コンポーネントを定義して `content={<CustomTooltip />}` で渡す。

---

## 4. UI/UX 設計ルール

### フィルター UI の選択基準
| 選択肢の数 | 推奨 UI |
|---|---|
| 2〜5件程度 | トグルチップボタン（license-chip スタイル） |
| 多数（10件以上） | セレクトボックス |

- ライセンスフィルター（MIT / Apache-2.0 の2種）は **トグルチップ形式**を維持すること。
- GFIフィルター（All / Has GFI）は **トグルチップ形式**を維持すること。

### アイコン統一ルール
- Rare Labels のアイコンは **🌶️** に統一（🍂 は使用しない）
- Good First Issues のアイコンは **🌱** に統一

### コントロールパネル
- 必ずセクションヘッダー「🔍 Explore & Filter」と説明文を表示すること。
- フィルターが1件でも適用中は「✕ Clear All Filters」ボタンを表示する。
- パネル全体にグリーンネオン系の枠線（`rgba(16, 185, 129, 0.15)`）を付与して視認性を確保。

### 詳細モーダル（ドリルダウン）
- `🌶️ Rare Labels:` セクションは `Topics & Keywords` の直上に配置。
- `activity.labels` → `activity.funny_labels` の優先順でフォールバックして取得。
- ラベルが0件の場合はセクションごと非表示（条件付きレンダリング）。
- バッジスタイル: アンバー系（`#f59e0b`、`border: 1px solid rgba(245,158,11,0.3)`）

### Region Distribution
- 上位6カ国に制限していることを「Top 6 most represented regions.」で明示すること。
- `showGlobal` ステートで「Global 🌐（国籍未検出）」の表示/非表示をトグル可能にする。
- `pieData` の `useMemo` 依存配列には `[filteredRepos, showGlobal]` を含めること。

---

## 5. データ構造のキー名

`data/data.json` 内の各リポジトリオブジェクトの主要フィールド:

```
repo.meta.name               // "owner/repo" 形式
repo.meta.description        // 説明文
repo.meta.primary_language   // 主言語
repo.meta.detected_country   // 国名（未検出時は null → 表示は "Global 🌐"）
repo.meta.license            // "MIT" / "Apache-2.0"
repo.meta.homepage_url       // 公式サイト URL（任意）
repo.metrics.stargazers      // スター数
repo.metrics.forks           // フォーク数
repo.metrics.open_issues     // オープン Issue 数
repo.metrics.good_first_issues  // GFI 数
repo.activity.labels         // Issueラベル配列（主要フィールド）
repo.activity.funny_labels   // 旧フィールド名（フォールバック用）
repo.activity.last_committed_at
repo.activity.last_pushed_at
repo.search_keywords         // 検索キーワード配列
```

---

## 6. 削除・破壊的操作の禁止

- `rm`, `del`, `rmdir` 等の削除コマンドは原則禁止。
- `data/data.json` および `data/etags.json` を直接編集・削除しないこと。
- クローラー関連のPythonスクリプト（`src/`配下）を無断で変更しないこと。
