import React, { useState, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { getMedian } from '../../utils/formatters';

export default function GemPlotChart({
  scatterData,
  scatterMaxStars,
  setScatterMaxStars,
  selectedLabel,
  selectedCountry,
  selectedLang,
  selectedRepo,
  handleScatterClick,
  colors,
  GemTooltip
}) {
  const [viewMode, setViewMode] = useState('dot'); // 'dot' | 'density'
  const isEmpty = scatterData.length === 0;

  // 1. 動的な中央値 (Median) の計算
  const medianStars = useMemo(() => getMedian(scatterData, 'star'), [scatterData]);
  const medianForks = useMemo(() => getMedian(scatterData, 'fork'), [scatterData]);

  return (
    <div className="chart-box glass">
      <div className="chart-box-header">
        <div>
          <h3>📊 Stargazers vs Forks Distribution (Gem Plot)</h3>
          <p className="chart-sub">Click on any dot to view repository details. Repositories in the upper-left are highly practical gems (target range: 300+ stars).</p>
        </div>
        <div className="chart-controls-row">
          {/* View Mode 切り替えトグルボタン */}
          <div className="view-mode-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'dot' ? 'active' : ''}`}
              onClick={() => setViewMode('dot')}
            >
              Dot Plot
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'density' ? 'active' : ''}`}
              onClick={() => setViewMode('density')}
            >
              Density Heatmap
            </button>
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
                key={`scatter-${selectedLabel}-${selectedCountry}-${selectedLang}-${scatterMaxStars}-${viewMode}`}
                margin={{ top: 20, right: 30, bottom: 30, left: 40 }}
              >
                <XAxis type="number" dataKey="star" name="Stars" unit="⭐" stroke="#9ca3af" domain={['dataMin - 100', 'auto']} />
                <YAxis type="number" dataKey="fork" name="Forks" unit="🍴" stroke="#9ca3af" />
                
                {/* 動的中央値による四象限破線境界線 */}
                <ReferenceLine x={medianStars} stroke="#8b5cf6" strokeWidth={1} strokeDasharray="3 3" opacity={0.25} />
                <ReferenceLine y={medianForks} stroke="#8b5cf6" strokeWidth={1} strokeDasharray="3 3" opacity={0.25} />

                {!selectedRepo && (
                  <Tooltip 
                    content={<GemTooltip />} 
                    cursor={{ strokeDasharray: '3 3' }} 
                  />
                )}

                {viewMode === 'dot' ? (
                  /* 1. 通常のドットプロットモード (半径3px固定、すっきりしたデザイン) */
                  <Scatter 
                    name="Repositories" 
                    data={scatterData} 
                    onClick={handleScatterClick}
                    style={{ cursor: 'pointer' }}
                    line={false}
                  >
                    {scatterData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={colors[index % colors.length]} 
                        r={3} 
                      />
                    ))}
                  </Scatter>
                ) : (
                  /* 2. 銀河調ヒート・グロウ（光の重ね合わせ）モード */
                  <Scatter 
                    name="Density Heatmap" 
                    data={scatterData} 
                    onClick={handleScatterClick}
                    style={{ cursor: 'pointer' }}
                    fill="#ec4899"           /* マゼンタ一色 */
                    fillOpacity={0.12}        /* 超高透明度（重ね合わせ用） */
                    className="density-scatter-glow" /* CSSブレンドモード適用 */
                    line={false}
                  >
                    {scatterData.map((entry, index) => (
                      <Cell 
                        key={`cell-density-${index}`} 
                        r={6} /* 半径を少し広げて重ねやすくする */
                      />
                    ))}
                  </Scatter>
                )}
              </ScatterChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
}
