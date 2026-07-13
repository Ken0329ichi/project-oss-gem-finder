import React from 'react';

export default function ControlPanel({
  searchQuery, setSearchQuery,
  selectedLang, setSelectedLang, languages,
  selectedCountry, setSelectedCountry, countries,
  selectedLicense, setSelectedLicense, licenses,
  selectedLabel, setSelectedLabel, rareLabels,
  gfiOnly, setGfiOnly,
  clearFilters
}) {
  const hasActiveFilters = searchQuery || selectedLang || selectedCountry || selectedLicense || selectedLabel || gfiOnly;

  return (
    <section className="control-panel glass">
      {/* コントロールパネルのセクションヘッダー */}
      <div className="control-panel-header">
        <div>
          <h2 className="control-panel-title">🔍 Explore & Filter</h2>
          <p className="control-panel-desc">
            Search repositories by keyword, or narrow down by language, region, and license.
            Click <strong>Rare Labels</strong> below to surface niche repositories.
          </p>
        </div>
        {hasActiveFilters && (
          <button className="clear-btn-top" onClick={clearFilters}>✕ Clear All Filters</button>
        )}
      </div>

      <div className="search-bar-wrapper">
        <span className="search-icon">🔍</span>
        <input 
          type="text" 
          placeholder="Search by name, description, topics, or labels..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="filters-wrapper">
        <div className="filter-group">
          <label className="filter-label">Language</label>
          <select value={selectedLang} onChange={(e) => setSelectedLang(e.target.value)} className="filter-select">
            <option value="">All Languages</option>
            {languages.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Region</label>
          <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} className="filter-select">
            <option value="">All Regions</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">License</label>
          <div className="license-chips">
            <button
              className={`license-chip ${selectedLicense === '' ? 'active' : ''}`}
              onClick={() => setSelectedLicense('')}
            >All</button>
            {licenses.map(l => (
              <button
                key={l}
                className={`license-chip ${selectedLicense === l ? 'active' : ''}`}
                onClick={() => setSelectedLicense(selectedLicense === l ? '' : l)}
              >{l}</button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">Good First Issues</label>
          <div className="license-chips">
            <button
              className={`license-chip gfi-chip ${!gfiOnly ? 'active' : ''}`}
              onClick={() => setGfiOnly(false)}
            >All</button>
            <button
              className={`license-chip gfi-chip ${gfiOnly ? 'active' : ''}`}
              onClick={() => setGfiOnly(!gfiOnly)}
            >🌱 Has GFI</button>
          </div>
        </div>
      </div>

      {/* 激レアタグクラウド */}
      <div className="rare-tags-container">
        <div className="rare-tags-header">
          <span className="tags-title">Rare Labels 🌶️:</span>
          <span className="tags-subtitle">Custom descriptors collected from active issues. Click to discover niche/specific gems.</span>
        </div>
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
  );
}
