import React from 'react';
import { getLanguageIconClass, cleanRegion } from '../utils/formatters';
import './RepositoryDetailModal.css';


// 言語割合バー（Languages Distribution）
function LanguagesBar({ languages }) {
  if (!languages || typeof languages !== 'object') return null;
  const total = Object.values(languages).reduce((s, v) => s + v, 0);
  if (total === 0) return null;

  const LANG_COLORS = [
    '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
    '#ef4444', '#06b6d4', '#84cc16', '#f97316', '#a78bfa'
  ];

  const entries = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="modal-section">
      <h4>🌐 Languages Distribution</h4>
      {/* スタックバー */}
      <div className="lang-stack-bar">
        {entries.map(([lang, bytes], i) => {
          const pct = ((bytes / total) * 100).toFixed(1);
          return (
            <div
              key={lang}
              className="lang-stack-segment"
              style={{ width: `${pct}%`, background: LANG_COLORS[i % LANG_COLORS.length] }}
              title={`${lang}: ${pct}%`}
            />
          );
        })}
      </div>
      {/* ラベル */}
      <div className="lang-labels">
        {entries.map(([lang, bytes], i) => {
          const pct = ((bytes / total) * 100).toFixed(1);
          return (
            <span key={lang} className="lang-label-item">
              <span className="lang-dot" style={{ background: LANG_COLORS[i % LANG_COLORS.length] }} />
              {lang} <strong>{pct}%</strong>
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function RepositoryDetailModal({ selectedRepo, onClose }) {
  if (!selectedRepo) return null;

  const rareLabelsData = selectedRepo.activity.labels || selectedRepo.activity.funny_labels || [];
  const iconClass = getLanguageIconClass(selectedRepo.meta.primary_language);
  const m = selectedRepo.metrics;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
        {/* うっすら表示される言語背景アイコン */}
        {iconClass && (
          <div className="modal-bg-icon-wrapper">
            <i className={`${iconClass} modal-bg-icon`}></i>
          </div>
        )}
        <button className="close-modal-btn" onClick={onClose}>×</button>

        <div className="modal-header">
          <h2>{selectedRepo.meta.name}</h2>
          <div className="modal-badges">
            <span className="repo-lang-badge">{selectedRepo.meta.primary_language || 'Unknown'}</span>
            <span className="repo-country-badge">{cleanRegion(selectedRepo.meta.detected_country || selectedRepo.meta.owner_location)}</span>
            {selectedRepo.meta.license && (
              <span className="repo-license-badge">⚖️ {selectedRepo.meta.license}</span>
            )}
          </div>
        </div>


        <p className="modal-desc">{selectedRepo.meta.description || 'No description available.'}</p>

        {/* ===== 拡張メトリクスグリッド（9タイル） ===== */}
        <div className="modal-metrics-grid">
          <div className="metric-tile glass">
            <span className="tile-label">⭐ Stargazers</span>
            <span className="tile-val">{m.stargazers.toLocaleString()}</span>
          </div>
          <div className="metric-tile glass">
            <span className="tile-label">🍴 Forks</span>
            <span className="tile-val">{m.forks.toLocaleString()}</span>
          </div>
          <div className="metric-tile glass metric-tile-new">
            <span className="tile-label">👁️ Watching</span>
            <span className="tile-val">{m.watchers != null ? m.watchers.toLocaleString() : '—'}</span>
          </div>
          <div className="metric-tile glass">
            <span className="tile-label">⚠️ Open Issues</span>
            <span className="tile-val">{m.open_issues.toLocaleString()}</span>
          </div>
          <div className="metric-tile glass">
            <span className="tile-label">🌱 Good First Issues</span>
            <span className="tile-val">{m.good_first_issues || 0}</span>
          </div>
          <div className="metric-tile glass">
            <span className="tile-label">🚀 Open PRs</span>
            <span className="tile-val">{(m.open_pull_requests || 0).toLocaleString()}</span>
          </div>
          <div className="metric-tile glass metric-tile-new">
            <span className="tile-label">📦 Total Releases</span>
            <span className="tile-val">{m.total_releases != null ? m.total_releases.toLocaleString() : '—'}</span>
          </div>
          <div className="metric-tile glass metric-tile-new">
            <span className="tile-label">👥 Contributors</span>
            <span className="tile-val">{m.contributors != null ? m.contributors.toLocaleString() : '—'}</span>
          </div>
          <div className="metric-tile glass metric-tile-new">
            <span className="tile-label">🏷️ Version</span>
            <span className="tile-val tile-val-sm">{m.latest_version || '—'}</span>
          </div>
        </div>

        {/* ===== Languages Distribution バー ===== */}
        <LanguagesBar languages={selectedRepo.meta.languages} />

        {/* Rare Labels */}
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
          <a href={`https://github.com/${selectedRepo.meta.name}`} target="_blank" rel="noopener noreferrer" className="btn-primary">
            🐱 View on GitHub
          </a>
          {selectedRepo.meta.homepage_url && (
            <a href={selectedRepo.meta.homepage_url} target="_blank" rel="noopener noreferrer" className="btn-secondary">
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
