import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function IssueActiveScatterChart({
  issueScatterData,
  selectedLabel,
  selectedCountry,
  selectedLicense,
  selectedLang,
  gfiOnly,
  selectedRepo,
  handleScatterClick,
  IssueTooltip,
  colors
}) {
  return (
    <div className="chart-box glass">
      <div className="chart-box-header">
        <div>
          <h3>📊 Open Issues vs Good First Issues (GFI Active Plot)</h3>
          <p className="chart-sub">Click on any dot to view repository details. Repositories in the upper-left have higher ratios of beginner-friendly tasks relative to total issues.</p>
        </div>
      </div>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart
            key={`issue-scatter-${selectedLabel}-${selectedCountry}-${selectedLicense}-${selectedLang}-${gfiOnly}`}
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
      </div>
    </div>
  );
}
