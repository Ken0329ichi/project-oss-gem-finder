import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { logTickFormatter } from '../../utils/formatters';

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
          <ResponsiveContainer width="100%" height={380}>
            <ScatterChart
              key={`issue-scatter-${selectedLabel}-${selectedCountry}-${selectedLicense}-${selectedLang}-${gfiOnly}-${issueMaxCount}-${bubbleMode}`}
              margin={{ top: 20, right: 30, bottom: 45, left: 55 }}
            >
              {/* 測定器風極薄グリッド格子 */}
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.06} stroke="#ffffff" />

              {/* 🚀 標準線形軸に tickFormatter と ticks で厳密に対数表記する（パープル自発光） */}
              <XAxis
                type="number"
                dataKey="open_issues"
                name="Open Issues"
                unit="⚠️"
                domain={xDomain}
                ticks={xTicks}
                tickFormatter={logTickFormatter}
                stroke="rgba(139, 92, 246, 0.2)"
                tick={{ fontSize: '10px', fontFamily: "'Share Tech Mono', 'Outfit', monospace", fill: '#9ca3af' }}
                label={{
                  value: '⚠️ OPEN ISSUES / MAINTENANCE DEBT (BACKLOG)',
                  position: 'insideBottom',
                  offset: -25,
                  style: { fontSize: '10px', fill: '#9ca3af', opacity: 0.5, letterSpacing: '0.05em', fontFamily: "'Share Tech Mono', 'Outfit', monospace", textTransform: 'uppercase' }
                }}
              />
              <YAxis
                type="number"
                dataKey="gfi"
                name="Good First Issues"
                unit="🌱"
                domain={yDomain}
                ticks={yTicks}
                tickFormatter={logTickFormatter}
                stroke="rgba(139, 92, 246, 0.2)"
                tick={{ fontSize: '10px', fontFamily: "'Share Tech Mono', 'Outfit', monospace", fill: '#9ca3af' }}
                label={{
                  value: '🌱 GOOD FIRST ISSUES (ACCESSIBILITY)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: -25,
                  style: { fontSize: '10px', fill: '#9ca3af', opacity: 0.5, letterSpacing: '0.05em', fontFamily: "'Share Tech Mono', 'Outfit', monospace", textTransform: 'uppercase', textAnchor: 'middle' }
                }}
              />
              <ZAxis type="category" dataKey="name" name="Repository" />

              {!selectedRepo && <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<IssueTooltip />} />}
              <Scatter
                name="Repositories"
                data={issueScatterData}
                onClick={handleScatterClick}
                style={{ cursor: 'pointer' }}
                line={false}
                shape={(props) => {
                  const { cx, cy, payload } = props;
                  const dataIndex = issueScatterData.indexOf(payload);
                  const fill = colors[(dataIndex >= 0 ? dataIndex : 0) % colors.length];
                  const radius = bubbleMode
                    ? Math.min(6, 3 + Math.sqrt(Math.max(0, (payload.contributors || 1) - 1)) * 0.22)
                    : 3;
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill={fill}
                      fillOpacity={0.75}
                      style={{ cursor: 'pointer' }}
                    />
                  );
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
