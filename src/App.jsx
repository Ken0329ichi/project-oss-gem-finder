import React, { useState, useMemo } from 'react';
import useDataset from './hooks/useDataset';
import Sidebar from './components/Sidebar';
import RepositoryGrid from './components/RepositoryGrid';
import RepositoryDetailModal from './components/RepositoryDetailModal';
import DashboardCharts from './components/DashboardCharts';
import './App.css';

// チャート用の配色パレット（サイバーネオン調）
const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444', '#6B7280'];

// GFIバーチャート用カスタムTooltip
const GfiTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: 'rgba(15, 20, 30, 0.95)', border: '1px solid rgba(139, 92, 246, 0.4)', borderRadius: '8px', padding: '8px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
      <p style={{ color: '#c4b5fd', fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>{payload[0].payload.name}</p>
      <p style={{ color: '#e2e8f0', fontSize: '0.8rem', margin: '2px 0 0' }}>🌱 GFI Count: <strong>{payload[0].value.toLocaleString()}</strong></p>
    </div>
  );
};

// PieChart用カスタムTooltip
const PieTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: 'rgba(15, 20, 30, 0.95)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', padding: '8px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
      <p style={{ color: '#6ee7b7', fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>{payload[0].name}</p>
      <p style={{ color: '#e2e8f0', fontSize: '0.8rem', margin: '2px 0 0' }}>Repositories: <strong>{payload[0].value.toLocaleString()}</strong></p>
    </div>
  );
};

// Issue & GFI散布図用カスタムTooltip
const IssueTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  const gfiPercent = data.open_issues > 0 ? Math.round((data.gfi / data.open_issues) * 100) : 0;
  return (
    <div style={{ background: 'rgba(15, 20, 30, 0.95)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', padding: '8px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
      <p style={{ color: '#6ee7b7', fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>{data.name}</p>
      <p style={{ color: '#e2e8f0', fontSize: '0.8rem', margin: '4px 0 0' }}>Total Open Issues: <strong>{data.open_issues.toLocaleString()}</strong> ⚠️</p>
      <p style={{ color: '#34d399', fontSize: '0.8rem', margin: '2px 0 0' }}>🌱 Good First Issues: <strong>{data.gfi.toLocaleString()}</strong> ({gfiPercent}%)</p>
    </div>
  );
};

// PR Scatter用カスタムTooltip
const PrScatterTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  return (
    <div style={{ background: 'rgba(15, 20, 30, 0.95)', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '8px', padding: '8px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
      <p style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>{data.name}</p>
      <p style={{ color: '#e2e8f0', fontSize: '0.8rem', margin: '4px 0 0' }}>Stars: <strong>{data.star.toLocaleString()}</strong> ⭐</p>
      <p style={{ color: '#6ee7b7', fontSize: '0.8rem', margin: '2px 0 0' }}>Open PRs: <strong>{data.pr.toLocaleString()}</strong> 🚀</p>
      <p style={{ color: '#a78bfa', fontSize: '0.8rem', margin: '2px 0 0' }}>👥 Contributors (Activity Group): <strong>{data.contributors != null && data.contributors !== 1 ? data.contributors.toLocaleString() : '—'}</strong></p>
    </div>
  );
};


// Gem Plot (Stars vs Forks) 用カスタムTooltip (統一デザイン)
const GemTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  return (
    <div style={{ background: 'rgba(15, 20, 30, 0.95)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', padding: '8px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
      <p style={{ color: '#6ee7b7', fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>{data.name}</p>
      <p style={{ color: '#e2e8f0', fontSize: '0.8rem', margin: '4px 0 0' }}>Stars: <strong>{data.star.toLocaleString()}</strong> ⭐</p>
      <p style={{ color: '#6ee7b7', fontSize: '0.8rem', margin: '2px 0 0' }}>Forks: <strong>{data.fork.toLocaleString()}</strong> 🍴</p>
    </div>
  );
};


export default function App() {
  const {
    filteredRepos, loading, error, updatedAt,
    searchQuery, setSearchQuery,
    selectedLang, setSelectedLang, languages,
    selectedCountry, setSelectedCountry, countries,
    selectedLicense, setSelectedLicense, licenses,
    selectedLabel, setSelectedLabel, rareLabels,
    gfiOnly, setGfiOnly,
    minPrs, setMinPrs,
    maxIssues, setMaxIssues,
    minReleases, setMinReleases,
    clearFilters
  } = useDataset();

  // UI状態
  const [activeTab, setActiveTab] = useState('charts');
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [scatterMaxStars, setScatterMaxStars] = useState(30000);
  const [issueMaxCount, setIssueMaxCount] = useState(500);
  const [showGlobal, setShowGlobal] = useState(true);

  // グラフ用データ
  const scatterData = useMemo(() => {
    let list = filteredRepos;
    if (scatterMaxStars !== Infinity) list = list.filter(r => r.metrics.stargazers < scatterMaxStars);
    return list.slice(0, 200).map(r => ({
      name: r.meta.name,
      star: Math.max(1, r.metrics.stargazers),
      fork: Math.max(1, r.metrics.forks),
      lang: r.meta.primary_language || 'Unknown',
      rawRepo: r
    }));
  }, [filteredRepos, scatterMaxStars]);

  const pieData = useMemo(() => {
    const counts = {};
    filteredRepos.forEach(r => { const c = r.meta.detected_country || 'Global 🌐'; counts[c] = (counts[c] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).filter(({ name }) => showGlobal || name !== 'Global 🌐').sort((a, b) => b.value - a.value).slice(0, 6);
  }, [filteredRepos, showGlobal]);

  const barData = useMemo(() => {
    const langIssues = {};
    filteredRepos.forEach(r => { const lang = r.meta.primary_language || 'Other'; langIssues[lang] = (langIssues[lang] || 0) + (r.metrics.good_first_issues || 0); });
    return Object.entries(langIssues).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
  }, [filteredRepos]);

  const issueScatterData = useMemo(() => {
    let list = filteredRepos;
    if (issueMaxCount !== Infinity) list = list.filter(r => r.metrics.open_issues < issueMaxCount);
    return list.slice(0, 200).map(r => ({
      name: r.meta.name,
      open_issues: Math.max(1, r.metrics.open_issues),
      gfi: Math.max(1, r.metrics.good_first_issues || 0),
      lang: r.meta.primary_language || 'Unknown',
      rawRepo: r
    }));
  }, [filteredRepos, issueMaxCount]);

  const prScatterData = useMemo(() => {
    let list = filteredRepos;
    if (scatterMaxStars !== Infinity) list = list.filter(r => r.metrics.stargazers < scatterMaxStars);
    return list.slice(0, 200).map(r => ({
      name: r.meta.name,
      star: Math.max(1, r.metrics.stargazers),
      pr: Math.max(1, r.metrics.open_pull_requests || 0),
      contributors: r.metrics.contributors || 1, // 3次元用の貢献者数
      lang: r.meta.primary_language || 'Unknown',
      rawRepo: r
    }));
  }, [filteredRepos, scatterMaxStars]);



  const handleScatterClick = (data) => {
    const repo = data?.payload?.rawRepo || data?.rawRepo;
    if (repo) setSelectedRepo(repo);
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
      {/* 🗃️ 左固定サイドバー */}
      <Sidebar
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        selectedLang={selectedLang} setSelectedLang={setSelectedLang} languages={languages}
        selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry} countries={countries}
        selectedLicense={selectedLicense} setSelectedLicense={setSelectedLicense} licenses={licenses}
        selectedLabel={selectedLabel} setSelectedLabel={setSelectedLabel} rareLabels={rareLabels}
        gfiOnly={gfiOnly} setGfiOnly={setGfiOnly}
        minPrs={minPrs} setMinPrs={setMinPrs}
        maxIssues={maxIssues} setMaxIssues={setMaxIssues}
        minReleases={minReleases} setMinReleases={setMinReleases}
        clearFilters={clearFilters}
        activeTab={activeTab} setActiveTab={setActiveTab}
        filteredCount={filteredRepos.length}
        updatedAt={updatedAt}
      />

      {/* 📋 右メインコンテンツ（独立スクロール） */}
      <main className="main-content">
        {activeTab === 'list' ? (
          <RepositoryGrid
            filteredRepos={filteredRepos}
            onCardClick={setSelectedRepo}
          />
        ) : (
          <DashboardCharts
            scatterData={scatterData}
            scatterMaxStars={scatterMaxStars}
            setScatterMaxStars={setScatterMaxStars}
            issueMaxCount={issueMaxCount}
            setIssueMaxCount={setIssueMaxCount}
            selectedLabel={selectedLabel}
            selectedCountry={selectedCountry}
            selectedLicense={selectedLicense}
            selectedLang={selectedLang}
            gfiOnly={gfiOnly}
            selectedRepo={selectedRepo}
            handleScatterClick={handleScatterClick}
            setSelectedRepo={setSelectedRepo}
            prScatterData={prScatterData}
            issueScatterData={issueScatterData}
            pieData={pieData}
            showGlobal={showGlobal}
            setShowGlobal={setShowGlobal}
            barData={barData}
            colors={COLORS}
            PrScatterTooltip={PrScatterTooltip}
            IssueTooltip={IssueTooltip}
            PieTooltip={PieTooltip}
            GfiTooltip={GfiTooltip}
            GemTooltip={GemTooltip}
          />
        )}
      </main>

      {/* 🔍 詳細モーダル */}
      <RepositoryDetailModal
        selectedRepo={selectedRepo}
        onClose={() => setSelectedRepo(null)}
      />
    </div>
  );
}
