import React, { useState } from 'react';
import { formatUTC } from '../utils/formatters';
import ControlPanel from './ControlPanel';
import './Sidebar.css';

export default function Sidebar({
  // フィルター状態
  searchQuery, setSearchQuery,
  selectedLang, setSelectedLang, languages,
  selectedCountry, setSelectedCountry, countries,
  selectedLicense, setSelectedLicense, licenses,
  selectedLabel, setSelectedLabel, rareLabels,
  gfiOnly, setGfiOnly,
  minPrs, setMinPrs,
  maxIssues, setMaxIssues,
  minReleases, setMinReleases,
  clearFilters,
  // タブ制御
  activeTab, setActiveTab,
  filteredCount,
  // フッターデータ
  updatedAt,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* 📱 ハンバーガーボタン（スマホ用） */}
      <button
        className="hamburger-btn"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span className={`hamburger-icon ${menuOpen ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      {/* オーバーレイ（スマホ用） */}
      {menuOpen && (
        <div className="sidebar-overlay" onClick={() => setMenuOpen(false)} />
      )}

      {/* 🗃️ サイドバー本体 */}
      <aside className={`app-sidebar glass ${menuOpen ? 'sidebar-open' : ''}`}>
        {/* 上段: ヘッダー */}
        <div className="sidebar-header">
          <h1 className="sidebar-title">🚀 OSS Gem Finder</h1>
          <p className="sidebar-subtitle">
            Discover hidden gems overshadowed by star counts using objective metrics.
          </p>
        </div>

        {/* タブ切り替えボタン */}
        <div className="sidebar-tabs">
          <button
            className={`tab-btn ${activeTab === 'charts' ? 'active' : ''}`}
            onClick={() => { setActiveTab('charts'); setMenuOpen(false); }}
          >
            📊 Statistics
          </button>
          <button
            className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => { setActiveTab('list'); setMenuOpen(false); }}
          >
            📋 Repository List <span className="count-badge">{filteredCount.toLocaleString()}</span>
          </button>
        </div>

        {/* 中段: コントロールパネル（スクロール可能） */}
        <div className="sidebar-control-area">
          <ControlPanel
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedLang={selectedLang}
            setSelectedLang={setSelectedLang}
            languages={languages}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
            countries={countries}
            selectedLicense={selectedLicense}
            setSelectedLicense={setSelectedLicense}
            licenses={licenses}
            selectedLabel={selectedLabel}
            setSelectedLabel={setSelectedLabel}
            rareLabels={rareLabels}
            gfiOnly={gfiOnly}
            setGfiOnly={setGfiOnly}
            minPrs={minPrs}
            setMinPrs={setMinPrs}
            maxIssues={maxIssues}
            setMaxIssues={setMaxIssues}
            minReleases={minReleases}
            setMinReleases={setMinReleases}
            clearFilters={clearFilters}
          />
        </div>

        {/* 下段: フッター（最下部固定） */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-meta">
            <span className="footer-version">Dataset: {formatUTC(updatedAt)}</span>
            <div className="footer-links-row">
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-license-link"
              >
                CC BY 4.0
              </a>
              <span className="footer-divider">/</span>
              <span className="footer-publisher">ken0329</span>
            </div>
            <a
              href="https://github.com/sponsors/Ken0329ichi"
              target="_blank"
              rel="noopener noreferrer"
              className="donation-link"
            >
              💖 Support on GitHub Sponsors
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
