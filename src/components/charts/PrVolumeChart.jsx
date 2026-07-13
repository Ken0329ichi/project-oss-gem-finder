import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { getMedian } from '../../utils/formatters';

export default function PrVolumeChart({
  prScatterData,
  selectedLabel,
  selectedCountry,
  selectedLicense,
  selectedLang,
  scatterMaxStars,
  setScatterMaxStars,
  selectedRepo,
  handleScatterClick,
  PrScatterTooltip,
  colors
}) {
  const isEmpty = prScatterData.length === 0;

  // 1. 動的な中央値 (Median) の計算 (ズームやフィルタに連動)
  const medianStars = useMemo(() => getMedian(prScatterData, 'star'), [prScatterData]);
  const medianPrs = useMemo(() => getMedian(prScatterData, 'pr'), [prScatterData]);

  return (
    <div className="chart-box glass">
      <div className="chart-box-header">
        <div>
          <h3>📊 Stargazers vs Open Pull Requests (PR Volume Plot)</h3>
          <p className="chart-sub">Click on any dot to view repository details. Repositories in the upper-left have high development activity relative to stars (target range: 300+ stars).</p>
        </div>
        <div className="scale-selector-wrapper">
          <label htmlFor="pr-scale-select">Zoom Scale: </label>
          <select 
            id="pr-scale-select"
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
      <div className="chart-wrapper" style={{ position: 'relative' }}>
        {isEmpty ? (
          <div className="chart-empty-placeholder">
            <span className="empty-icon">📈</span>
            <p className="empty-text">No repositories match the current scale/filters.</p>
            <p className="empty-subtext">Try changing the "Zoom Scale" in the header to a larger range.</p>
          </div>
        ) : (
          <>
            {/* 四象限マトリクスの背景二つ名ラベル */}
            <div className="quadrant-labels-overlay" style={{ pointerEvents: 'none' }}>
              <span className="q-label q-gems">gems (low-star / active) 💎</span>
              <span className="q-label q-monsters">monsters (high-star / active)</span>
              <span className="q-label q-incubators">incubators (emerging)</span>
              <span className="q-label q-classics">classics / emerging</span>
            </div>

            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart
                key={`pr-scatter-${selectedLabel}-${selectedCountry}-${selectedLicense}-${selectedLang}-${scatterMaxStars}`}
                margin={{ top: 20, right: 30, bottom: 30, left: 40 }}
              >
                <XAxis type="number" dataKey="star" name="Stars" unit="⭐" scale="log" domain={[1, 'auto']} stroke="#9ca3af" />
                <YAxis type="number" dataKey="pr" name="Open PRs" unit="🚀" scale="log" domain={[1, 'auto']} stroke="#9ca3af" />

                
                {/* 動的中央値による四象限破線境界線 */}
                <ReferenceLine x={medianStars} stroke="#8b5cf6" strokeWidth={1} strokeDasharray="3 3" opacity={0.25} />
                <ReferenceLine y={medianPrs} stroke="#8b5cf6" strokeWidth={1} strokeDasharray="3 3" opacity={0.25} />

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
