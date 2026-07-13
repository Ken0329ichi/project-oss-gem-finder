import React, { useState, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { getMedian } from '../../utils/formatters';

// ヒートマップセルのホバー用カスタムTooltip
const DensityTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  return (
    <div style={{ background: 'rgba(15, 20, 30, 0.95)', border: '1px solid rgba(139, 92, 246, 0.4)', borderRadius: '8px', padding: '8px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
      <p style={{ color: '#c4b5fd', fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>📊 Density Segment</p>
      <p style={{ color: '#e2e8f0', fontSize: '0.8rem', margin: '4px 0 0' }}>Stars Range: <strong>{Math.round(data.starMin).toLocaleString()} 〜 {Math.round(data.starMax).toLocaleString()}</strong></p>
      <p style={{ color: '#e2e8f0', fontSize: '0.8rem', margin: '2px 0 0' }}>Forks Range: <strong>{Math.round(data.forkMin).toLocaleString()} 〜 {Math.round(data.forkMax).toLocaleString()}</strong></p>
      <p style={{ color: '#ec4899', fontSize: '0.85rem', fontWeight: 700, margin: '4px 0 0' }}>📂 Repositories: {data.count} 件</p>
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

  // 1. 動的な中央値 (Median) の計算 (ズームやフィルタに連動)
  const medianStars = useMemo(() => getMedian(scatterData, 'star'), [scatterData]);
  const medianForks = useMemo(() => getMedian(scatterData, 'fork'), [scatterData]);

  // 2. 2次元密度ヒートマップ（2D Binning）用のバケットデータ生成
  const densityData = useMemo(() => {
    if (isEmpty) return [];

    const stars = scatterData.map(d => d.star);
    const forks = scatterData.map(d => d.fork);
    const minX = Math.min(...stars);
    const maxX = Math.max(...stars);
    const minY = Math.min(...forks);
    const maxY = Math.max(...forks);

    const gridCount = 10;
    const stepX = (maxX - minX) / gridCount || 1;
    const stepY = (maxY - minY) / gridCount || 1;

    // 10x10 のグリッド初期化
    const bins = [];
    for (let i = 0; i < gridCount; i++) {
      for (let j = 0; j < gridCount; j++) {
        bins.push({
          xIndex: i,
          yIndex: j,
          starMin: minX + i * stepX,
          starMax: minX + (i + 1) * stepX,
          forkMin: minY + j * stepY,
          forkMax: minY + (j + 1) * stepY,
          // 中心のプロット座標
          star: minX + (i + 0.5) * stepX,
          fork: minY + (j + 0.5) * stepY,
          count: 0
        });
      }
    }

    // データカウントの集計
    scatterData.forEach(d => {
      let i = Math.floor((d.star - minX) / stepX);
      let j = Math.floor((d.fork - minY) / stepY);
      if (i >= gridCount) i = gridCount - 1;
      if (j >= gridCount) j = gridCount - 1;
      if (i < 0) i = 0;
      if (j < 0) j = 0;
      const binIndex = i * gridCount + j;
      if (bins[binIndex]) {
        bins[binIndex].count += 1;
      }
    });

    // カウントが0のバケットは除外し、密度の低い順からソートしてマッピング
    return bins.filter(b => b.count > 0);
  }, [scatterData, isEmpty]);

  // 3. 最大・最小カウントに基づきグラデーションカラー（Color Scale）を決定するヘルパー
  const getDensityColor = (count, maxCount) => {
    const ratio = count / (maxCount || 1);
    if (ratio < 0.3) {
      // 低密度: 深海紺 (#0f172a) -> パープル (#7c3aed) のグラデーション
      return `rgba(124, 58, 237, ${0.2 + ratio * 2})`; // ネオンパープルの半透明
    } else if (ratio < 0.7) {
      // 中密度: ネオンパープル (#7c3aed)
      return '#7c3aed';
    } else {
      // 高密度: サイバーマゼンタ (#ec4899)
      return '#ec4899';
    }
  };

  const maxDensityCount = useMemo(() => {
    if (densityData.length === 0) return 0;
    return Math.max(...densityData.map(b => b.count));
  }, [densityData]);

  // 4. 四象限用の各エリアのバウンディング中央座標を計算してラベル表示位置にする
  // X軸、Y軸の範囲
  const minXVal = scatterData.length ? Math.min(...scatterData.map(d => d.star)) : 0;
  const maxXVal = scatterData.length ? Math.max(...scatterData.map(d => d.star)) : 30000;
  const minYVal = scatterData.length ? Math.min(...scatterData.map(d => d.fork)) : 0;
  const maxYVal = scatterData.length ? Math.max(...scatterData.map(d => d.fork)) : 5000;

  // ラベル位置（象限の四隅付近に美しく配置）
  const labelPositions = {
    gems: { star: minXVal + (medianStars - minXVal) * 0.15, fork: maxYVal - (maxYVal - medianForks) * 0.08, text: 'gems (low-star / active) 💎' },
    monsters: { star: maxXVal - (maxXVal - medianStars) * 0.45, fork: maxYVal - (maxYVal - medianForks) * 0.08, text: 'monsters (high-star / active)' },
    incubators: { star: minXVal + (medianStars - minXVal) * 0.15, fork: minYVal + (medianForks - minYVal) * 0.08, text: 'incubators (emerging)' },
    classics: { star: maxXVal - (maxXVal - medianStars) * 0.45, fork: minYVal + (medianForks - minYVal) * 0.08, text: 'classics / emerging' }
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
            {viewMode === 'dot' && (
              <div className="quadrant-labels-overlay" style={{ pointerEvents: 'none' }}>
                <span className="q-label q-gems">gems (low-star / active) 💎</span>
                <span className="q-label q-monsters">monsters (high-star / active)</span>
                <span className="q-label q-incubators">incubators (emerging)</span>
                <span className="q-label q-classics">classics / emerging</span>
              </div>
            )}

            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart
                key={`scatter-${selectedLabel}-${selectedCountry}-${selectedLang}-${scatterMaxStars}-${viewMode}`}
                margin={{ top: 20, right: 30, bottom: 30, left: 40 }}
              >
                <XAxis type="number" dataKey="star" name="Stars" unit="⭐" stroke="#9ca3af" domain={['dataMin - 100', 'auto']} />
                <YAxis type="number" dataKey="fork" name="Forks" unit="🍴" stroke="#9ca3af" />
                <ZAxis type="number" dataKey="count" range={[180, 180]} />
                
                {/* 動的中央値による四象限破線境界線 */}
                {viewMode === 'dot' && (
                  <>
                    <ReferenceLine x={medianStars} stroke="#8b5cf6" strokeWidth={1} strokeDasharray="3 3" opacity={0.35} />
                    <ReferenceLine y={medianForks} stroke="#8b5cf6" strokeWidth={1} strokeDasharray="3 3" opacity={0.35} />
                  </>
                )}

                {!selectedRepo && (
                  <Tooltip 
                    content={viewMode === 'dot' ? <GemTooltip /> : <DensityTooltip />} 
                    cursor={{ strokeDasharray: '3 3' }} 
                  />
                )}

                {viewMode === 'dot' ? (
                  <Scatter 
                    name="Repositories" 
                    data={scatterData} 
                    fill="#10B981"
                    onClick={handleScatterClick}
                    style={{ cursor: 'pointer' }}
                  >
                    {scatterData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Scatter>
                ) : (
                  <Scatter 
                    name="Density Grid" 
                    data={densityData} 
                    shape="square"
                  >
                    {densityData.map((entry, index) => (
                      <Cell key={`cell-density-${index}`} fill={getDensityColor(entry.count, maxDensityCount)} />
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
