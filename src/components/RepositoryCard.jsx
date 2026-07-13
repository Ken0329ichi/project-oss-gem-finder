import React from 'react';
import { getLanguageIconClass, cleanRegion } from '../utils/formatters';

export default function RepositoryCard({ repo, onClick }) {
  const iconClass = getLanguageIconClass(repo.meta.primary_language);

  return (
    <div 
      className="repo-card glass"
      onClick={() => onClick(repo)}
    >
      {/* うっすら表示される言語背景アイコン */}
      {iconClass && (
        <div className="card-bg-icon-wrapper">
          <i className={`${iconClass} card-bg-icon`}></i>
        </div>
      )}

      <div className="card-header">
        <span className="repo-lang-badge">{repo.meta.primary_language || 'Unknown'}</span>
        <span className="repo-country-badge">{cleanRegion(repo.meta.detected_country || repo.meta.owner_location)}</span>
      </div>

      <h3>{repo.meta.name}</h3>
      <p className="repo-desc">{repo.meta.description || 'No description available.'}</p>
      
      {/* 主要メトリクス */}
      <div className="repo-metrics-summary">
        <span title="Stargazers">⭐ {repo.metrics.stargazers.toLocaleString()}</span>
        <span title="Forks">🍴 {repo.metrics.forks.toLocaleString()}</span>
        <span title="Watchers">👁️ {repo.metrics.watchers != null ? repo.metrics.watchers.toLocaleString() : '—'}</span>
        <span title="Open Issues">⚠️ {repo.metrics.open_issues.toLocaleString()}</span>
        <span title="Good First Issues">🌱 {repo.metrics.good_first_issues || 0}</span>
        <span title="Open Pull Requests">🚀 {(repo.metrics.open_pull_requests || 0).toLocaleString()}</span>
        <span title="Total Releases">📦 {repo.metrics.total_releases != null ? repo.metrics.total_releases.toLocaleString() : '—'}</span>
      </div>
    </div>

  );
}

