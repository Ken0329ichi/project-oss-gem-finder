import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function OpenIssuesChart({
  issueBarData,
  selectedLabel,
  selectedCountry,
  selectedLicense,
  selectedLang,
  gfiOnly,
  setSelectedRepo,
  IssueTooltip
}) {
  return (
    <div className="chart-box glass">
      <div className="chart-box-header">
        <div>
          <h3>🌱 Top Repositories by Open Issues & GFIs</h3>
          <p className="chart-sub">Open Issues stacked with Good First Issues. Top 10 repositories shown. Connects to language, region, and license filters.</p>
        </div>
      </div>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            key={`issue-bar-${selectedLabel}-${selectedCountry}-${selectedLicense}-${selectedLang}-${gfiOnly}`}
            data={issueBarData}
            layout="vertical"
            margin={{ top: 20, right: 30, bottom: 10, left: 110 }}
            onClick={(data) => {
              const repo = data?.activePayload?.[0]?.payload?.rawRepo;
              if (repo) setSelectedRepo(repo);
            }}
            style={{ cursor: 'pointer' }}
          >
            <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 10 }} />
            <YAxis type="category" dataKey="name" stroke="#9ca3af" tick={{ fontSize: 9 }} width={100} />
            <Tooltip content={<IssueTooltip />} />
            <Legend />
            <Bar dataKey="gfi" name="Good First Issues" stackId="a" fill="#10B981" />
            <Bar dataKey="other" name="Other Open Issues" stackId="a" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
