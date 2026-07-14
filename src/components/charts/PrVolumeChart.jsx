import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { logTickFormatter } from '../../utils/formatters';

export default function PrVolumeChart({
  prScatterData,
  selectedLabel,
  selectedCountry,
  selectedLicense,
  selectedLang,
  selectedRepo,
  handleScatterClick,
  colors,
  PrScatterTooltip,
  bubbleMode
}) {
  const isEmpty = prScatterData.length === 0;

  // 軸の表示ドメイン限界を計算
  const xDomain = useMemo(() => {
    if (isEmpty) return [2.477, 5];
    return ['dataMin', 'auto'];
  }, [prScatterData, isEmpty]);

  const yDomain = useMemo(() => {
    if (isEmpty) return [0, 4];
    return ['dataMin', 'auto'];
  }, [prScatterData, isEmpty]);

  // 厳密な対数 Ticks の配列
  const xTicks = useMemo(() => [
    Math.log10(300),
    Math.log10(1000),
    Math.log10(5000),
    Math.log10(10000),
    Math.log10(50000),
    Math.log10(100000)
  ], []);

  const yTicks = useMemo(() => [
    0, // 1
    1, // 10
    2, // 100
    3, // 1k
    4  // 10k
  ], []);

  return (
    <div className="chart-box glass">
      <div className="chart-box-header">
        <div>
          <h3>📊 Stargazers vs Open PRs (PR Volume Plot)</h3>
          <p className="chart-sub">Repositories in the upper-left have high development activity relative to stars (target range: 300+ stars).</p>
        </div>
      </div>
      <div className="chart-wrapper" style={{ position: 'relative' }}>
        {isEmpty ? (
          <div className="chart-empty-placeholder">
            <span className="empty-icon">🚀</span>
            <p className="empty-text">No repositories match the current scale/filters.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={380}>
            <ScatterChart
              key={`pr-scatter-${selectedLabel}-${selectedCountry}-${selectedLicense}-${selectedLang}-${bubbleMode}`}
              margin={{ top: 20, right: 30, bottom: 45, left: 55 }}
            >
              {/* 測定器風極薄グリッド格子 */}
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.06} stroke="#ffffff" />

              {/* 🚀 標準線形軸に tickFormatter と ticks で厳密に対数表記する（パープル自発光） */}
              <XAxis 
                type="number" 
                dataKey="star" 
                name="Stars" 
                unit="⭐" 
                domain={xDomain} 
                ticks={xTicks}
                tickFormatter={logTickFormatter} 
                stroke="rgba(139, 92, 246, 0.2)" 
                tick={{ fontSize: '10px', fontFamily: "'Share Tech Mono', 'Outfit', monospace", fill: '#9ca3af' }}
                label={{ 
                  value: '⭐ STARGAZERS / COGNITIVE VOL (認知度)', 
                  position: 'insideBottom', 
                  offset: -25, 
                  style: { fontSize: '10px', fill: '#9ca3af', opacity: 0.5, letterSpacing: '0.05em', fontFamily: "'Outfit', sans-serif", textTransform: 'uppercase' } 
                }}
              />
              <YAxis 
                type="number" 
                dataKey="pr" 
                name="Open PRs" 
                unit="🚀" 
                domain={yDomain} 
                ticks={yTicks}
                tickFormatter={logTickFormatter} 
                stroke="rgba(139, 92, 246, 0.2)" 
                tick={{ fontSize: '10px', fontFamily: "'Share Tech Mono', 'Outfit', monospace", fill: '#9ca3af' }}
                label={{ 
                  value: '🚀 OPEN PRS / DEV CONFLICT (修羅場度)', 
                  angle: -90, 
                  position: 'insideLeft', 
                  offset: -25, 
                  style: { fontSize: '10px', fill: '#9ca3af', opacity: 0.5, letterSpacing: '0.05em', fontFamily: "'Outfit', sans-serif", textTransform: 'uppercase', textAnchor: 'middle' } 
                }}
              />
              
              {!selectedRepo && <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<PrScatterTooltip />} />}
              <Scatter 
                name="Repositories" 
                data={prScatterData} 
                onClick={handleScatterClick}
                style={{ cursor: 'pointer' }}
                line={false}
              >
                {prScatterData.map((entry, index) => {
                  const radius = bubbleMode 
                    ? Math.min(16, 3.5 + Math.sqrt(entry.contributors || 1) * 0.45) 
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
        )}
      </div>
    </div>
  );
}
