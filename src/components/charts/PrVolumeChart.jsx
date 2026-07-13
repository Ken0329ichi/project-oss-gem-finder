import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function PrVolumeChart({
  prScatterData,
  selectedLabel,
  selectedCountry,
  selectedLicense,
  selectedLang,
  scatterMaxStars,
  selectedRepo,
  handleScatterClick,
  PrScatterTooltip,
  colors
}) {
  return (
    <div className="chart-box glass">
      <div className="chart-box-header">
        <div>
          <h3>📊 Stargazers vs Open Pull Requests (PR Volume Plot)</h3>
          <p className="chart-sub">Click on any dot to view repository details. Repositories in the upper-left have high development activity relative to stars.</p>
        </div>
      </div>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart
            key={`pr-scatter-${selectedLabel}-${selectedCountry}-${selectedLicense}-${selectedLang}-${scatterMaxStars}`}
            margin={{ top: 20, right: 30, bottom: 30, left: 40 }}
          >
            <XAxis type="number" dataKey="star" name="Stars" unit="⭐" stroke="#9ca3af" />
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
      </div>
    </div>
  );
}
