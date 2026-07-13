import React from 'react';
import './RepositoryDetailModal.css';

export default function RepositoryDetailModal({ selectedRepo, onClose }) {
  if (!selectedRepo) return null;

  const rareLabelsData = selectedRepo.activity.labels || selectedRepo.activity.funny_labels || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>×</button>
        
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

        {/* Rare Labels（IssueラベルAPI由来の客観的データ）*/}
        {rareLabelsData.length > 0 && (
          <div className="modal-section">
            <h4>🌶️ Rare Labels:</h4>
            <div className="modal-rare-tags">
              {rareLabelsData.map(l => (
                <span key={l} className="modal-rare-tag">{l}</span>
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
  );
}
