import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function PrVolumeChart({
  prScatterData,
  selectedLabel,
  selectedCountry,
  selectedLicense,
  selectedLang,
  scatterMaxStars,
  setScatterMaxStars,
  selectedRepo,
  handleScatterClick,
  PrScatterTooltip,
  colors
}) {
  const isEmpty = prScatterData.length === 0;

  return (
    <div className="chart-box glass">
      <div className="chart-box-header">
        <div>
          <h3>📊 Stargazers vs Open Pull Requests (PR Volume Plot)</h3>
          <p className="chart-sub">Click on any dot to view repository details. Repositories in the upper-left have high development activity relative to stars (target range: 300+ stars).</p>
        </div>
        <div className="scale-selector-wrapper">
          <label htmlFor="pr-scale-select">Zoom Scale: </label>
          <select 
            id="pr-scale-select"
            value={scatterMaxStars === Infinity ? 'all' : scatterMaxStars}
            onChange={(e) => setScatterMaxStars(e.target.value === 'all' ? Infinity : Number(e.target.value))}
            className="scale-select"
          >
            <option value={10000}>Under 10k Stars (Niche Gems)</option>
            <option value={30000}>Under 30k Stars (Standard Gems)</option>
            <option value={50000}>Under 50k Stars (Mid-Scale)</option>
            <option value="all">All Repositories (Global)</option>
          </select>
        </div>
      </div>
      <div className="chart-wrapper">
        {isEmpty ? (
          <div className="chart-empty-placeholder">
            <span className="empty-icon">📈</span>
            <p className="empty-text">No repositories match the current scale/filters.</p>
            <p className="empty-subtext">Try changing the "Zoom Scale" in the header to a larger range.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart
              key={`pr-scatter-${selectedLabel}-${selectedCountry}-${selectedLicense}-${selectedLang}-${scatterMaxStars}`}
              margin={{ top: 20, right: 30, bottom: 30, left: 40 }}
            >
              <XAxis type="number" dataKey="star" name="Stars" unit="⭐" stroke="#9ca3af" domain={['dataMin - 100', 'auto']} />
              <YAxis type="number" dataKey="pr" name="Open PRs" unit="🚀" stroke="#9ca3af" />
              <ZAxis type="category" dataKey="name" name="Repository" />
              {!selectedRepo && <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<PrScatterTooltip />} />}
              <Scatter 
                name="Repositories" 
                data={prScatterData} 
                fill="#38bdf8"
                onClick={handleScatterClick}
                style={{ cursor: 'pointer' }}
              >
                {prScatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
