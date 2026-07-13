import React, { useState, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { getMedian } from '../../utils/formatters';

// 30x30 格子集計セルのホバー用カスタムTooltip
const BinnedDensityTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  return (
    <div style={{ background: 'rgba(15, 20, 30, 0.95)', border: '1px solid rgba(236, 72, 153, 0.4)', borderRadius: '8px', padding: '8px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
      <p style={{ color: '#ec4899', fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>📊 Density Grid Cell</p>
      <p style={{ color: '#e2e8f0', fontSize: '0.8rem', margin: '4px 0 0' }}>Stars Range: <strong>{Math.round(data.starMin).toLocaleString()} 〜 {Math.round(data.starMax).toLocaleString()}</strong></p>
      <p style={{ color: '#e2e8f0', fontSize: '0.8rem', margin: '2px 0 0' }}>Forks Range: <strong>{Math.round(data.forkMin).toLocaleString()} 〜 {Math.round(data.forkMax).toLocaleString()}</strong></p>
      <p style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 700, margin: '4px 0 0' }}>📂 Repositories: {data.count} 件</p>
    </div>
  );
};

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

  // 2. 対数空間上での 30 x 30 格子状集計 (Binned Heatmap) の構築
  const binnedData = useMemo(() => {
    if (isEmpty) return [];

    const starsLog = scatterData.map(d => Math.log10(d.star));
    const forksLog = scatterData.map(d => Math.log10(d.fork));

    const minXLog = 0; // log10(1) = 0
    const maxXLog = Math.max(...starsLog, 1);
    const minYLog = 0; // log10(1) = 0
    const maxYLog = Math.max(...forksLog, 1);

    const gridSize = 30; // 30x30 グリッド
    const stepX = (maxXLog - minXLog) / gridSize || 0.1;
    const stepY = (maxYLog - minYLog) / gridSize || 0.1;

    // 900セルの二次元ビンをフラットに初期化
    const bins = [];
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        bins.push({
          xIndex: i,
          yIndex: j,
          starMin: Math.pow(10, minXLog + i * stepX),
          starMax: Math.pow(10, minXLog + (i + 1) * stepX),
          forkMin: Math.pow(10, minYLog + j * stepY),
          forkMax: Math.pow(10, minYLog + (j + 1) * stepY),
          // セル描画用の実数値座標 (対数セルの中心値)
          star: Math.pow(10, minXLog + (i + 0.5) * stepX),
          fork: Math.pow(10, minYLog + (j + 0.5) * stepY),
          count: 0
        });
      }
    }

    // データのバニング集計
    scatterData.forEach(d => {
      const xVal = Math.log10(d.star);
      const yVal = Math.log10(d.fork);
      let i = Math.floor((xVal - minXLog) / stepX);
      let j = Math.floor((yVal - minYLog) / stepY);
      if (i >= gridSize) i = gridSize - 1;
      if (j >= gridSize) j = gridSize - 1;
      if (i < 0) i = 0;
      if (j < 0) j = 0;
      const binIdx = i * gridSize + j;
      if (bins[binIdx]) {
        bins[binIdx].count += 1;
      }
    });

    // カウントが 0 のビンは非表示にするため除外
    return bins.filter(b => b.count > 0);
  }, [scatterData, isEmpty]);

  // カウント最大値の算出
  const maxBinCount = useMemo(() => {
    if (binnedData.length === 0) return 0;
    return Math.max(...binnedData.map(b => b.count));
  }, [binnedData]);

  // 件数に基づくカラーマッピング（深海紺 ➡️ ネオンパープル ➡️ サイバーマゼンタ）
  const getBinColor = (count) => {
    const ratio = count / (maxBinCount || 1);
    if (ratio < 0.2) {
      return 'rgba(15, 23, 42, 0.6)'; // 低密度: 深海紺・半透明
    } else if (ratio < 0.6) {
      return '#7c3aed';               // 中密度: ネオンパープル
    } else {
      return '#ec4899';               // 高密度: サイバーマゼンタ
    }
  };

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
                {/* 🚀 対数スケール (scale="log") ✕ 0回避 (domain={[1, 'auto']) */}
                <XAxis type="number" dataKey="star" name="Stars" unit="⭐" scale="log" domain={[1, 'auto']} stroke="#9ca3af" />
                <YAxis type="number" dataKey="fork" name="Forks" unit="🍴" scale="log" domain={[1, 'auto']} stroke="#9ca3af" />
                
                {/* ヒートマップ時の格子サイズを均一にするためのZAxis */}
                <ZAxis type="number" dataKey="count" range={viewMode === 'density' ? [120, 120] : [0, 0]} />

                {/* 動的中央値による四象限破線境界線 */}
                <ReferenceLine x={medianStars} stroke="#8b5cf6" strokeWidth={1} strokeDasharray="3 3" opacity={0.25} />
                <ReferenceLine y={medianForks} stroke="#8b5cf6" strokeWidth={1} strokeDasharray="3 3" opacity={0.25} />

                {!selectedRepo && (
                  <Tooltip 
                    content={viewMode === 'dot' ? <GemTooltip /> : <BinnedDensityTooltip />} 
                    cursor={{ strokeDasharray: '3 3' }} 
                  />
                )}

                {viewMode === 'dot' ? (
                  /* 1. 通常のドットプロットモード (半径3px固定、お団子完全排除) */
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
                  /* 2. 真の 30x30 格子状集計ヒートマップ (モザイク等高線、隙間なし) */
                  <Scatter 
                    name="Binned Heatmap" 
                    data={binnedData} 
                    shape="square"
                    line={false}
                  >
                    {binnedData.map((entry, index) => (
                      <Cell 
                        key={`cell-bin-${index}`} 
                        fill={getBinColor(entry.count)} 
                        stroke="none"
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
