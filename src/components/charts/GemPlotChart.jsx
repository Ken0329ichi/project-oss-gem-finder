import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function GemPlotChart({
  scatterData,
  scatterMaxStars,
  setScatterMaxStars,
  selectedLabel,
  selectedCountry,
  selectedLang,
  selectedRepo,
  handleScatterClick,
  colors
}) {
  return (
    <div className="chart-box glass">
      <div className="chart-box-header">
        <div>
          <h3>📊 Stargazers vs Forks Distribution (Gem Plot)</h3>
          <p className="chart-sub">Click on any dot to view repository details. Repositories in the upper-left are highly practical gems.</p>
        </div>
        <div className="scale-selector-wrapper">
          <label htmlFor="scale-select">Zoom Scale: </label>
          <select 
            id="scale-select"
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
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart
            key={`scatter-${selectedLabel}-${selectedCountry}-${selectedLang}-${scatterMaxStars}`}
            margin={{ top: 20, right: 30, bottom: 30, left: 40 }}
          >
            <XAxis type="number" dataKey="star" name="Stars" unit="⭐" stroke="#9ca3af" />
            <YAxis type="number" dataKey="fork" name="Forks" unit="🍴" stroke="#9ca3af" />
            <ZAxis type="category" dataKey="name" name="Repository" />
            {!selectedRepo && <Tooltip cursor={{ strokeDasharray: '3 3' }} />}
            <Scatter 
              name="Repositories" 
              data={scatterData} 
              fill="#10B981"
              onClick={handleScatterClick}
              style={{ cursor: 'pointer' }}
            >
              {scatterData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
