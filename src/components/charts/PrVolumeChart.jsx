import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { getMedian, logTickFormatter } from '../../utils/formatters';

export default function PrVolumeChart({
  prScatterData,
  scatterMaxStars,
  selectedLabel,
  selectedCountry,
  selectedLicense,
  selectedLang,
  selectedRepo,
  handleScatterClick,
  colors,
  PrScatterTooltip
}) {
  const isEmpty = prScatterData.length === 0;

  // 1. 動的な中央値 (Median) の計算 (すでに Math.log10 変換されているためそのままでOK)
  const medianStars = useMemo(() => getMedian(prScatterData, 'star'), [prScatterData]);
  const medianPrs = useMemo(() => getMedian(prScatterData, 'pr'), [prScatterData]);

  // 軸の表示ドメイン限界を計算
  const xDomain = useMemo(() => {
    if (isEmpty) return [0, 5];
    const maxVal = Math.max(...prScatterData.map(d => d.star));
    return [0, Math.ceil(maxVal)];
  }, [prScatterData, isEmpty]);

  const yDomain = useMemo(() => {
    if (isEmpty) return [0, 4];
    const maxVal = Math.max(...prScatterData.map(d => d.pr));
    return [0, Math.ceil(maxVal)];
  }, [prScatterData, isEmpty]);

  return (
    <div className="chart-box glass">
      <div className="chart-box-header">
        <div>
          <h3>📊 Stargazers vs Open Pull Requests (PR Volume Plot)</h3>
          <p className="chart-sub">Click on any dot to view repository details. Repositories in the upper-left have high development activity relative to stars (target range: 300+ stars).</p>
        </div>
      </div>
      <div className="chart-wrapper" style={{ position: 'relative' }}>
        {isEmpty ? (
          <div className="chart-empty-placeholder">
            <span className="empty-icon">🚀</span>
            <p className="empty-text">No repositories match the current scale/filters.</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart
                key={`pr-scatter-${selectedLabel}-${selectedCountry}-${selectedLicense}-${selectedLang}-${scatterMaxStars}`}
                margin={{ top: 20, right: 30, bottom: 30, left: 40 }}
              >
                {/* 🚀 標準線形軸に tickFormatter で綺麗に対数表記する */}
                <XAxis 
                  type="number" 
                  dataKey="star" 
                  name="Stars" 
                  unit="⭐" 
                  domain={xDomain} 
                  tickFormatter={logTickFormatter} 
                  stroke="#9ca3af" 
                />
                <YAxis 
                  type="number" 
                  dataKey="pr" 
                  name="Open PRs" 
                  unit="🚀" 
                  domain={yDomain} 
                  tickFormatter={logTickFormatter} 
                  stroke="#9ca3af" 
                />
                
                {!selectedRepo && <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<PrScatterTooltip />} />}

                <Scatter 
                  name="Repositories" 
                  data={prScatterData} 
                  onClick={handleScatterClick}
                  style={{ cursor: 'pointer' }}
                  line={false}
                >
                  {prScatterData.map((entry, index) => (
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
