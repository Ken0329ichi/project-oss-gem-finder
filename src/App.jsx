import React, { useState, useEffect, useMemo } from 'react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, 
  BarChart, Bar, Legend, CartesianGrid 
} from 'recharts';
import './App.css';

// チャート用の配色パレット（サイバーネオン調）
const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444', '#6B7280'];

export default function App() {
  const [repos, setRepos] = useState([]);
  const [filteredRepos, setFilteredRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 検索・フィルター条件の状態
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLang, setSelectedLang] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedLicense, setSelectedLicense] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');

  // UI状態
  const [activeTab, setActiveTab] = useState('charts'); // 'list' or 'charts'
  const [selectedRepo, setSelectedRepo] = useState(null); // 詳細モーダル用

  // 1. データセット (data.json) の非同期ロード
  useEffect(() => {
    const loadData = async () => {
      try {
        // Vite開発環境および本番の相対ルートパスからdata.jsonをフェッチ
        const res = await fetch('./data/data.json');
        if (!res.ok) throw new Error('データファイルのロードに失敗しました。');
        const dataset = await res.json();
        const list = dataset.repositories || [];
        setRepos(list);
        setFilteredRepos(list);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 2. メモリ上でのフィルタ集計（セレクトボックスの選択肢抽出）
  const languages = useMemo(() => {
    return [...new Set(repos.map(r => r.meta.primary_language).filter(Boolean))].sort();
  }, [repos]);

  const countries = useMemo(() => {
    return [...new Set(repos.map(r => r.meta.detected_country).filter(Boolean))].sort();
  }, [repos]);

  const licenses = useMemo(() => {
    return [...new Set(repos.map(r => r.meta.license).filter(Boolean))].sort();
  }, [repos]);

  // 3. 激レアラベル（出現頻度が少ないラベルTop30）の自動集計
  const rareLabels = useMemo(() => {
    const countMap = {};
    repos.forEach(r => {
      (r.activity.labels || []).forEach(l => {
        countMap[l] = (countMap[l] || 0) + 1;
      });
    });
    // 出現数が少ない順にソートし、上位30個を「レアラベル」とする
    return Object.entries(countMap)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 30)
      .map(entry => entry[0]);
  }, [repos]);

  // 4. Pagefind API ＆ オンメモリハイブリッド検索フィルタ処理
  useEffect(() => {
    const filterData = async () => {
      let result = [...repos];

      // Pagefind インデックスによる爆速検索 (本番環境用)
      if (searchQuery && window.pagefind) {
        try {
          const search = await window.pagefind.search(searchQuery);
          const results = await Promise.all(search.results.map(r => r.data()));
          
          // 検索結果に合致したリポジトリ名(title)で元データを引き当てる
          const matchedNames = new Set(results.map(res => res.meta.title));
          result = result.filter(r => matchedNames.has(r.meta.name));
        } catch (err) {
          console.warn('Pagefind search failed. Falling back to in-memory search.', err);
          result = inMemorySearch(result, searchQuery);
        }
      } else if (searchQuery) {
        // ローカル開発環境等でのメモリ検索フォールバック
        result = inMemorySearch(result, searchQuery);
      }

      // ドロップダウンフィルターの適用
      if (selectedLang) {
        result = result.filter(r => r.meta.primary_language === selectedLang);
      }
      if (selectedCountry) {
        result = result.filter(r => r.meta.detected_country === selectedCountry);
      }
      if (selectedLicense) {
        result = result.filter(r => r.meta.license === selectedLicense);
      }
      if (selectedLabel) {
        result = result.filter(r => (r.activity.labels || []).includes(selectedLabel));
      }

      setFilteredRepos(result);
    };

    filterData();
  }, [searchQuery, selectedLang, selectedCountry, selectedLicense, selectedLabel, repos]);

  const inMemorySearch = (list, query) => {
    const q = query.toLowerCase();
    return list.filter(r => 
      r.meta.name.toLowerCase().includes(q) ||
      (r.meta.description && r.meta.description.toLowerCase().includes(q)) ||
      (r.search_keywords || []).some(k => k.toLowerCase().includes(q))
    );
  };

  // 5. チャート用集計データの生成
  // チャート①: スター数 vs フォーク数の分布 (Scatter Chart)
  const scatterData = useMemo(() => {
    return filteredRepos.slice(0, 200).map(r => ({
      name: r.meta.name,
      star: r.metrics.stargazers,
      fork: r.metrics.forks,
      lang: r.meta.primary_language || 'Unknown'
    }));
  }, [filteredRepos]);

  // チャート②: 国別シェアの集計 (Pie Chart)
  const pieData = useMemo(() => {
    const counts = {};
    filteredRepos.forEach(r => {
      const country = r.meta.detected_country || 'Global 🌐';
      counts[country] = (counts[country] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // 上位6カ国
  }, [filteredRepos]);

  // チャート③: 初心者歓迎(Good First Issue)の言語別総数 (Bar Chart)
  const barData = useMemo(() => {
    const langIssues = {};
    filteredRepos.forEach(r => {
      const lang = r.meta.primary_language || 'Other';
      const languagesCount = r.metrics.good_first_issues || 0;
      langIssues[lang] = (langIssues[lang] || 0) + languagesCount;
    });
    return Object.entries(langIssues)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // 上位10言語
  }, [filteredRepos]);

  // フィルター初期化
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLang('');
    setSelectedCountry('');
    setSelectedLicense('');
    setSelectedLabel('');
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>📊 OSS Gem Finder: Building database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>⚠️ Error occurred: {error}</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* 🚀 ヘッダー */}
      <header className="app-header">
        <div className="header-content">
          <h1>🚀 OSS Gem Finder</h1>
          <p>Discover hidden gems and highly practical repositories overshadowed by star counts using objective metrics.</p>
        </div>
        
        {/* タブ切り替え */}
        <div className="tab-buttons">
          <button 
            className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            📋 Repository List ({filteredRepos.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'charts' ? 'active' : ''}`}
            onClick={() => setActiveTab('charts')}
          >
            📊 Statistics Dashboard
          </button>
        </div>
      </header>

      {/* 🔍 フィルター＆検索コントロールパネル */}
      <section className="control-panel glass">
        <div className="search-bar-wrapper">
          <input 
            type="text" 
            placeholder="Incremental search by name, description, topics, or labels..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          { (searchQuery || selectedLang || selectedCountry || selectedLicense || selectedLabel) && (
            <button className="clear-btn" onClick={clearFilters}>Clear</button>
          )}
        </div>

        <div className="filters-wrapper">
          <select value={selectedLang} onChange={(e) => setSelectedLang(e.target.value)} className="filter-select">
            <option value="">All Languages</option>
            {languages.map(l => <option key={l} value={l}>{l}</option>)}
          </select>

          <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} className="filter-select">
            <option value="">All Regions / Countries</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select value={selectedLicense} onChange={(e) => setSelectedLicense(e.target.value)} className="filter-select">
            <option value="">All Licenses</option>
            {licenses.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {/* 激レアタグクラウド */}
        <div className="rare-tags-container">
          <span className="tags-title">Rare Labels 🍂:</span>
          <div className="tags-wrapper">
            {rareLabels.map(label => (
              <button 
                key={label} 
                className={`tag-chip ${selectedLabel === label ? 'active' : ''}`}
                onClick={() => setSelectedLabel(selectedLabel === label ? '' : label)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 📋 コンテンツ表示 */}
      <main className="main-content">
        {activeTab === 'list' ? (
          <div className="repo-grid">
            {filteredRepos.length > 0 ? (
              filteredRepos.map(repo => (
                <div 
                  key={repo.id} 
                  className="repo-card glass"
                  onClick={() => setSelectedRepo(repo)}
                >
                  <div className="card-header">
                    <span className="repo-lang-badge">{repo.meta.primary_language || 'Unknown'}</span>
                    <span className="repo-country-badge">{repo.meta.detected_country || 'Global 🌐'}</span>
                  </div>
                  <h3>{repo.meta.name}</h3>
                  <p className="repo-desc">{repo.meta.description || 'No description available.'}</p>
                  
                  {/* 主要メトリクス */}
                  <div className="repo-metrics-summary">
                    <span>⭐ {repo.metrics.stargazers.toLocaleString()}</span>
                    <span>🍴 {repo.metrics.forks.toLocaleString()}</span>
                    {repo.metrics.good_first_issues > 0 && (
                      <span className="gfi-badge">🌱 GFI: {repo.metrics.good_first_issues}</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results glass">
                <p>🔍 No repositories found matching the criteria.</p>
              </div>
            )}
          </div>
        ) : (
          /* 📊 チャートタブ */
          <div className="charts-container">
            {/* 散布図: スター数 vs フォーク数 */}
            <div className="chart-box glass">
              <h3>📊 Stargazers vs Forks Distribution (Gem Plot)</h3>
              <p className="chart-sub">Repositories in the upper-left represent highly practical gems with outstanding fork rates relative to their stargazers.</p>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={350}>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <XAxis type="number" dataKey="star" name="Stars" unit="⭐" stroke="#9ca3af" />
                    <YAxis type="number" dataKey="fork" name="Forks" unit="🍴" stroke="#9ca3af" />
                    <ZAxis type="category" dataKey="name" name="Repository" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Repositories" data={scatterData} fill="#10B981">
                      {scatterData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-row">
              {/* ドーナツグラフ: 国別シェア */}
              <div className="chart-box half-width glass">
                <h3>🍩 Region Distribution</h3>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* バーチャート: 言語別の初心者歓迎Issue数 */}
              <div className="chart-box half-width glass">
                <h3>🌱 Good First Issues Count (Top 10 Languages)</h3>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={barData}>
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8B5CF6">
                        {barData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 🔍 詳細モーダル (1画面完結型SPA) */}
      {selectedRepo && (
        <div className="modal-overlay" onClick={() => setSelectedRepo(null)}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setSelectedRepo(null)}>×</button>
            
            <div className="modal-header">
              <h2>{selectedRepo.meta.name}</h2>
              <div className="modal-badges">
                <span className="repo-lang-badge">{selectedRepo.meta.primary_language || 'Unknown'}</span>
                <span className="repo-country-badge">{selectedRepo.meta.detected_country || 'Global 🌐'}</span>
                {selectedRepo.meta.license && (
                  <span className="repo-license-badge">⚖️ {selectedRepo.meta.license}</span>
                )}
              </div>
            </div>

            <p className="modal-desc">{selectedRepo.meta.description || 'No description available.'}</p>

            {/* 数値メトリクス */}
            <div className="modal-metrics-grid">
              <div className="metric-tile glass">
                <span className="tile-label">⭐ Stargazers</span>
                <span className="tile-val">{selectedRepo.metrics.stargazers.toLocaleString()}</span>
              </div>
              <div className="metric-tile glass">
                <span className="tile-label">🍴 Forks</span>
                <span className="tile-val">{selectedRepo.metrics.forks.toLocaleString()}</span>
              </div>
              <div className="metric-tile glass">
                <span className="tile-label">⚠️ Open Issues</span>
                <span className="tile-val">{selectedRepo.metrics.open_issues.toLocaleString()}</span>
              </div>
              <div className="metric-tile glass">
                <span className="tile-label">🌱 Good First Issues</span>
                <span className="tile-val">{selectedRepo.metrics.good_first_issues}</span>
              </div>
            </div>

            {/* 生ラベル一覧 */}
            {selectedRepo.activity.labels && selectedRepo.activity.labels.length > 0 && (
              <div className="modal-section">
                <h4>🏷️ Active Raw Labels:</h4>
                <div className="modal-tags">
                  {selectedRepo.activity.labels.map(l => (
                    <span key={l} className="modal-tag">{l}</span>
                  ))}
                </div>
              </div>
            )}

            {/* 探索キーワード */}
            {selectedRepo.search_keywords && selectedRepo.search_keywords.length > 0 && (
              <div className="modal-section">
                <h4>🔑 Topics & Keywords:</h4>
                <div className="modal-tags">
                  {selectedRepo.search_keywords.map(k => (
                    <span key={k} className="modal-topic">{k}</span>
                  ))}
                </div>
              </div>
            )}

            {/* 外部リンク */}
            <div className="modal-links">
              <a 
                href={`https://github.com/${selectedRepo.meta.name}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-primary"
              >
                🐱 View on GitHub
              </a>
              {selectedRepo.meta.homepage_url && (
                <a 
                  href={selectedRepo.meta.homepage_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-secondary"
                >
                  🌐 Visit Website
                </a>
              )}
            </div>

            <div className="modal-footer">
              <span>Last Commit: {selectedRepo.activity.last_committed_at ? new Date(selectedRepo.activity.last_committed_at).toLocaleDateString() : 'Unknown'}</span>
              <span>Last Push: {selectedRepo.activity.last_pushed_at ? new Date(selectedRepo.activity.last_pushed_at).toLocaleDateString() : 'Unknown'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
