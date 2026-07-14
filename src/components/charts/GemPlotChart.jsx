import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { getMedian, logTickFormatter } from '../../utils/formatters';

export default function GemPlotChart({
  scatterData,
  selectedLabel,
  selectedCountry,
  selectedLang,
  selectedRepo,
  handleScatterClick,
  colors,
  GemTooltip,
  bubbleMode,
  setBubbleMode
}) {
  const isEmpty = scatterData.length === 0;

  // 1. 対数化されたデータから正確な中央値 (Median) を算出
  const medianStars = useMemo(() => getMedian(scatterData, 'star'), [scatterData]);
  const medianForks = useMemo(() => getMedian(scatterData, 'fork'), [scatterData]);

  // 軸の表示ドメイン限界を計算
  const xDomain = useMemo(() => {
    if (isEmpty) return [2.477, 5];
    return ['dataMin', 'auto'];
  }, [scatterData, isEmpty]);

  const yDomain = useMemo(() => {
    if (isEmpty) return [0, 5];
    return ['dataMin', 'auto'];
  }, [scatterData, isEmpty]);

  // 厳密な対数 Ticks の配列 (300, 1k, 5k, 10k, 50k, 100k)
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
    4, // 10k
    5  // 100k
  ], []);

  // 自発光（Glow）エフェクトのスタイリング
  const getDotStyle = (entry, index) => {
    const baseColor = colors[index % colors.length];
    // スター数に対するウォッチ数比率 (watchRatio) に応じて輝度とネオンフィルターを動的適用
    const isGlowing = entry.watchRatio > 0.02; // 比率が2%を超える人気の原石
    
    return {
      fill: baseColor, 
      filter: isGlowing ? 'url(#glow)' : undefined,
      fillOpacity: isGlowing ? 0.95 : 0.45, // 自発光対象はハッキリ明るく、他は半透明にしてノイズ引き算
      stroke: isGlowing ? baseColor : 'none',
      strokeWidth: isGlowing ? 1.5 : 0
    };
  };

  return (
    <div className="chart-box glass">
      <div className="chart-box-header">
        <div>
          <h3>📊 Stargazers vs Forks Distribution (Gem Plot)</h3>
          <p className="chart-sub" style={{ marginBottom: '0.25rem' }}>
            Repositories in the upper-left are highly practical gems (target range: 300+ stars).
          </p>
          {/* ✨ Glowing dots に関する注記テキストの追加 */}
          <p 
            className="glow-note"
            style={{ 
              fontSize: '11px', 
              color: '#34d399', 
              opacity: 0.6, 
              margin: '0 0 1rem 0', 
              fontFamily: "'Outfit', 'Inter', sans-serif",
              letterSpacing: '0.02em'
            }}
          >
            ✨ Glowing dots represent high developer interest (Watchers-to-Stars ratio).
          </p>
        </div>
        <div className="chart-controls-row">
          {/* 👥 BUBBLE MODE (Show Team Size) トグルのグラフ直上配置 */}
          <button 
            className={`toggle-btn ${bubbleMode ? 'active' : ''}`}
            onClick={() => setBubbleMode(!bubbleMode)}
            title="Toggle Bubble Mode (Radius by Contributors count)"
          >
            👥 Show Team Size
          </button>
        </div>
      </div>
      <div className="chart-wrapper" style={{ position: 'relative' }}>
        {isEmpty ? (
          <div className="chart-empty-placeholder">
            <span className="empty-icon">📈</span>
            <p className="empty-text">No repositories match the current scale/filters.</p>
          </div>
        ) : (
          <>
            {/* 四象限マトリクスの背景二つ名ラベル (opacity: 0.35 で背景へしっかり沈める) */}
            <div className="quadrant-labels-overlay" style={{ pointerEvents: 'none', opacity: 0.35 }}>
              <span className="q-label q-gems">gems (low-star / active) 💎</span>
              <span className="q-label q-monsters">monsters (high-star / active)</span>
              <span className="q-label q-incubators">incubators (emerging)</span>
              <span className="q-label q-classics">classics / emerging</span>
            </div>

            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart
                key={`scatter-${selectedLabel}-${selectedCountry}-${selectedLang}-${bubbleMode}`}
                margin={{ top: 20, right: 30, bottom: 30, left: 40 }}
              >
                <defs>
                  {/* SVGネオングロウ用フィルターの定義 */}
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComponentTransfer in="blur" result="boost">
                      <feFuncA type="linear" slope="1.5" />
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode in="boost" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* 🚀 標準線形軸に tickFormatter と ticks で厳密に対数表記する（デッドスペース排除） */}
                <XAxis 
                  type="number" 
                  dataKey="star" 
                  name="Stars" 
                  unit="⭐" 
                  domain={xDomain} 
                  ticks={xTicks}
                  tickFormatter={logTickFormatter} 
                  stroke="#9ca3af" 
                />
                <YAxis 
                  type="number" 
                  dataKey="fork" 
                  name="Forks" 
                  unit="🍴" 
                  domain={yDomain} 
                  ticks={yTicks}
                  tickFormatter={logTickFormatter} 
                  stroke="#9ca3af" 
                />
                
                {/* 動的中央値による四象限破線境界線 */}
                <ReferenceLine x={medianStars} stroke="#8b5cf6" strokeWidth={1} strokeDasharray="3 3" opacity={0.25} />
                <ReferenceLine y={medianForks} stroke="#8b5cf6" strokeWidth={1} strokeDasharray="3 3" opacity={0.25} />

                {!selectedRepo && (
                  <Tooltip 
                    content={<GemTooltip />} 
                    cursor={{ strokeDasharray: '3 3' }} 
                  />
                )}

                <Scatter 
                  name="Repositories" 
                  data={scatterData} 
                  onClick={handleScatterClick}
                  style={{ cursor: 'pointer' }}
                  line={false}
                >
                  {scatterData.map((entry, index) => {
                    const style = getDotStyle(entry, index);
                    // Bubble Mode ON時は contributors数に応じて半径を 3px 〜 16px の間で平方根スケールにより動的変化
                    // これによりチームサイズのコントラスト（3px ➡️ 最大16px）が劇的に認識しやすくなります
                    const radius = bubbleMode 
                      ? Math.min(16, 3.5 + Math.sqrt(entry.contributors || 1) * 0.45) 
                      : 3;
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        r={radius} 
                        {...style}
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
