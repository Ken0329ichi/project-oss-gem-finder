import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function IssueActiveScatterChart({
  issueScatterData,
  selectedLabel,
  selectedCountry,
  selectedLicense,
  selectedLang,
  gfiOnly,
  issueMaxCount,
  setIssueMaxCount,
  selectedRepo,
  handleScatterClick,
  IssueTooltip,
  colors
}) {
  const isEmpty = issueScatterData.length === 0;

  return (
    <div className="chart-box glass">
      <div className="chart-box-header">
        <div>
          <h3>📊 Open Issues vs Good First Issues (GFI Active Plot)</h3>
          <p className="chart-sub">Click on any dot to view repository details. Repositories in the upper-left have higher ratios of beginner-friendly tasks relative to total issues.</p>
        </div>
        <div className="scale-selector-wrapper">
          <label htmlFor="issue-scale-select">Zoom Scale: </label>
          <select 
            id="issue-scale-select"
            value={issueMaxCount === Infinity ? 'all' : issueMaxCount}
            onChange={(e) => setIssueMaxCount(e.target.value === 'all' ? Infinity : Number(e.target.value))}
            className="scale-select"
          >
            <option value={100}>Under 100 Issues (Niche/Clean)</option>
            <option value={500}>Under 500 Issues (Standard)</option>
            <option value={1000}>Under 1000 Issues (Mid-Scale)</option>
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
              key={`issue-scatter-${selectedLabel}-${selectedCountry}-${selectedLicense}-${selectedLang}-${gfiOnly}-${issueMaxCount}`}
              margin={{ top: 20, right: 30, bottom: 30, left: 40 }}
            >
              <XAxis type="number" dataKey="open_issues" name="Open Issues" unit="⚠️" stroke="#9ca3af" />
              <YAxis type="number" dataKey="gfi" name="Good First Issues" unit="🌱" stroke="#9ca3af" />
              <ZAxis type="category" dataKey="name" name="Repository" />
              {!selectedRepo && <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<IssueTooltip />} />}
              <Scatter 
                name="Repositories" 
                data={issueScatterData} 
                fill="#10B981"
                onClick={handleScatterClick}
                style={{ cursor: 'pointer' }}
              >
                {issueScatterData.map((entry, index) => (
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
