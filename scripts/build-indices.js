import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'data.json');
const DIST_REPOS_DIR = path.join(process.cwd(), 'dist', 'repos');

function main() {
  console.log('[Indexer] Pagefind用インデックスHTMLの生成を開始します...');

  if (!fs.existsSync(DATA_PATH)) {
    console.error(`[Error] data.json が見つかりません: ${DATA_PATH}`);
    process.exit(1);
  }

  // 出力先ディレクトリの作成
  fs.mkdirSync(DIST_REPOS_DIR, { recursive: true });

  const rawData = fs.readFileSync(DATA_PATH, 'utf-8');
  const dataset = JSON.parse(rawData);
  const repos = dataset.repositories || [];

  console.log(`[Indexer] ${repos.length} 件のリポジトリのインデックスHTMLを構築中...`);

  repos.forEach((repo) => {
    // owner/nameの「/」がファイル名に使えないため「--」に置換
    const filename = repo.meta.name.replace('/', '--') + '.html';
    const filepath = path.join(DIST_REPOS_DIR, filename);

    // Pagefindが解釈するメタデータと、React展開用のJSON構造をHTMLとして埋め込む
    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title data-pagefind-meta="title">${repo.meta.name}</title>
  <!-- Pagefind用カスタムメタデータ（フィルタ＆ソート表示用） -->
  <meta data-pagefind-meta="owner" content="${repo.meta.owner}">
  <meta data-pagefind-meta="license" content="${repo.meta.license || ''}">
  <meta data-pagefind-meta="language" content="${repo.meta.primary_language || ''}">
  <meta data-pagefind-meta="country" content="${repo.meta.detected_country || ''}">
  <meta data-pagefind-meta="stargazers" content="${repo.metrics.stargazers}">
  <meta data-pagefind-meta="forks" content="${repo.metrics.forks}">
  <meta data-pagefind-meta="good_first_issues" content="${repo.metrics.good_first_issues}">
  <meta data-pagefind-meta="last_committed_at" content="${repo.activity.last_committed_at || ''}">
  <meta data-pagefind-meta="homepage_url" content="${repo.meta.homepage_url || ''}">
  
  <!-- React側で検索結果から元の全データを一撃で復元するためのJSON埋め込み -->
  <script id="repo-data" type="application/json">${JSON.stringify(repo)}</script>
</head>
<body>
  <!-- 検索対象となるテキスト (本文キーワード用インデックス) -->
  <h1>${repo.meta.name}</h1>
  <p>${repo.meta.description || ''}</p>
  <div id="keywords">${(repo.search_keywords || []).join(' ')}</div>
  <div id="labels">${(repo.activity.labels || []).join(' ')}</div>
</body>
</html>
`;

    fs.writeFileSync(filepath, html, 'utf-8');
  });

  console.log(`[Indexer] 完了！ ${repos.length} 個のインデックスHTMLを ${DIST_REPOS_DIR} に出力しました。`);
}

main();
