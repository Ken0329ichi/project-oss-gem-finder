import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { getMedian, logTickFormatter } from '../../utils/formatters';

export default function IssueActiveScatterChart({
  issueScatterData,
  issueMaxCount,
  selectedLabel,
  selectedCountry,
  selectedLicense,
  selectedLang,
  gfiOnly,
  selectedRepo,
  handleScatterClick,
  colors,
  IssueTooltip
}) {
  const isEmpty = issueScatterData.length === 0;

  // 1. 動的な中央値 (Median) の計算 (すでに Math.log10 変換されているためそのままでOK)
  const medianIssues = useMemo(() => getMedian(issueScatterData, 'open_issues'), [issueScatterData]);
  const medianGfi = useMemo(() => getMedian(issueScatterData, 'gfi'), [issueScatterData]);

  // 軸の表示ドメイン限界を計算
  const xDomain = useMemo(() => {
    if (isEmpty) return [0, 4];
    const maxVal = Math.max(...issueScatterData.map(d => d.open_issues));
    return [0, Math.ceil(maxVal)];
  }, [issueScatterData, isEmpty]);

  const yDomain = useMemo(() => {
    if (isEmpty) return [0, 3];
    const maxVal = Math.max(...issueScatterData.map(d => d.gfi));
    return [0, Math.ceil(maxVal)];
  }, [issueScatterData, isEmpty]);

  return (
    <div className="chart-box glass">
      <div className="chart-box-header">
        <div>
          <h3>📊 Open Issues vs Good First Issues (GFI Active Plot)</h3>
          <p className="chart-sub">Click on any dot to view repository details. Repositories in the upper-left have higher ratios of beginner-friendly tasks relative to total issues.</p>
        </div>
      </div>
      <div className="chart-wrapper" style={{ position: 'relative' }}>
        {isEmpty ? (
          <div className="chart-empty-placeholder">
            <span className="empty-icon">🌱</span>
            <p className="empty-text">No repositories match the current scale/filters.</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart
                key={`issue-scatter-${selectedLabel}-${selectedCountry}-${selectedLicense}-${selectedLang}-${gfiOnly}-${issueMaxCount}`}
                margin={{ top: 20, right: 30, bottom: 30, left: 40 }}
              >
                {/* 🚀 標準線形軸に tickFormatter で綺麗に対数表記する */}
                <XAxis 
                  type="number" 
                  dataKey="open_issues" 
                  name="Open Issues" 
                  unit="⚠️" 
                  domain={xDomain} 
                  tickFormatter={logTickFormatter} 
                  stroke="#9ca3af" 
                />
                <YAxis 
                  type="number" 
                  dataKey="gfi" 
                  name="Good First Issues" 
                  unit="🌱" 
                  domain={yDomain} 
                  tickFormatter={logTickFormatter} 
                  stroke="#9ca3af" 
                />
                <ZAxis type="category" dataKey="name" name="Repository" />
                
                {!selectedRepo && <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<IssueTooltip />} />}

                <Scatter 
                  name="Repositories" 
                  data={issueScatterData} 
                  onClick={handleScatterClick}
                  style={{ cursor: 'pointer' }}
                  line={false}
                >
                  {issueScatterData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={colors[index % colors.length]} 
                      r={3} /* 半径3px固定 */
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
}
