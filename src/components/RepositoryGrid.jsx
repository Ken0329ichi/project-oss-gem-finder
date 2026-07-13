import React from 'react';
import RepositoryCard from './RepositoryCard';

export default function RepositoryGrid({ filteredRepos, onCardClick }) {
  if (filteredRepos.length === 0) {
    return (
      <div className="no-results glass">
        <p>🔍 No repositories found matching the criteria.</p>
      </div>
    );
  }

  return (
    <div className="repo-grid">
      {filteredRepos.map(repo => (
        <RepositoryCard 
          key={repo.id} 
          repo={repo} 
          onClick={onCardClick} 
        />
      ))}
    </div>
  );
}
