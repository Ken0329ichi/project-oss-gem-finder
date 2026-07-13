import React from 'react';

export default function RepositoryCard({ repo, onClick }) {
  return (
    <div 
      className="repo-card glass"
      onClick={() => onClick(repo)}
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
        <span>⚠️ {repo.metrics.open_issues.toLocaleString()}</span>
        <span>🚀 {(repo.metrics.open_pull_requests || 0).toLocaleString()}</span>
        {repo.metrics.good_first_issues > 0 && (
          <span className="gfi-badge">🌱 GFI: {repo.metrics.good_first_issues}</span>
        )}
      </div>
    </div>
  );
}
