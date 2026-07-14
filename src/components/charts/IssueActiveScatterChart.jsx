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
  IssueTooltip,
  bubbleMode
}) {
  const isEmpty = issueScatterData.length === 0;

  // 1. 動的な中央値 (Median) の計算 (すでに Math.log10 変換されているためそのままでOK)
  const medianIssues = useMemo(() => getMedian(issueScatterData, 'open_issues'), [issueScatterData]);
  const medianGfi = useMemo(() => getMedian(issueScatterData, 'gfi'), [issueScatterData]);

  // 軸の表示ドメイン限界を計算
  const xDomain = useMemo(() => {
    if (isEmpty) return [0, 4];
    return ['dataMin', 'auto'];
  }, [issueScatterData, isEmpty]);

  const yDomain = useMemo(() => {
    if (isEmpty) return [0, 3];
    return ['dataMin', 'auto'];
  }, [issueScatterData, isEmpty]);

  // 厳密な対数 Ticks の配列
  const xTicks = useMemo(() => [
    0, // 1
    1, // 10
    Math.log10(50),
    2, // 100
    Math.log10(500),
    3, // 1000
    4  // 10000
  ], []);

  const yTicks = useMemo(() => [
    0, // 1
    1, // 10
    2, // 100
    3  // 1000
  ], []);

  return (
    <div className="chart-box glass">
      <div className="chart-box-header">
        <div>
          <h3>📊 Open Issues vs Good First Issues (GFI Active Plot)</h3>
          <p className="chart-sub">Repositories in the upper-left have higher ratios of beginner-friendly tasks relative to total issues.</p>
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
                key={`issue-scatter-${selectedLabel}-${selectedCountry}-${selectedLicense}-${selectedLang}-${gfiOnly}-${issueMaxCount}-${bubbleMode}`}
                margin={{ top: 20, right: 30, bottom: 30, left: 40 }}
              >
                {/* 🚀 標準線形軸に tickFormatter と ticks で厳密に対数表記する */}
                <XAxis 
                  type="number" 
                  dataKey="open_issues" 
                  name="Open Issues" 
                  unit="⚠️" 
                  domain={xDomain} 
                  ticks={xTicks}
                  tickFormatter={logTickFormatter} 
                  stroke="#9ca3af" 
                />
                <YAxis 
                  type="number" 
                  dataKey="gfi" 
                  name="Good First Issues" 
                  unit="🌱" 
                  domain={yDomain} 
                  ticks={yTicks}
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
                  {issueScatterData.map((entry, index) => {
                    const radius = bubbleMode 
                      ? Math.min(8, 3 + (entry.contributors || 1) / 15) 
                      : 3;
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={colors[index % colors.length]} 
                        fillOpacity={0.75}
                        r={radius}
                      />
                    );
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
}
