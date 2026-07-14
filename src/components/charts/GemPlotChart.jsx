import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { logTickFormatter } from '../../utils/formatters';

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
          {/* ✨ Glowing dots に関する注記テキスト */}
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
        <div className="chart-controls-row" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* 説明ラベルテキスト */}
          <span
            className="toggle-desc"
            style={{
              fontSize: '11px',
              color: '#9ca3af',
              opacity: 0.65,
              fontFamily: "'Outfit', 'Inter', sans-serif",
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap'
            }}
          >
            (Radius reflects contributors count)
          </span>
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
          <ResponsiveContainer width="100%" height={380}>
            <ScatterChart
              key={`scatter-${selectedLabel}-${selectedCountry}-${selectedLang}-${bubbleMode}`}
              margin={{ top: 20, right: 30, bottom: 45, left: 55 }}
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

              {/* 測定器風極薄グリッド格子 */}
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.06} stroke="#ffffff" />

              {/* 🚀 標準線形軸に tickFormatter と ticks で厳密に対数表記する（自発光細線） */}
              <XAxis
                type="number"
                dataKey="star"
                name="Stars"
                unit="⭐"
                domain={xDomain}
                ticks={xTicks}
                tickFormatter={logTickFormatter}
                stroke="rgba(16, 185, 129, 0.2)"
                tick={{ fontSize: '10px', fontFamily: "'Share Tech Mono', 'Outfit', monospace", fill: '#9ca3af' }}
                label={{
                  value: '⭐ STARGAZERS / COGNITIVE VOL (AWARENESS)',
                  position: 'insideBottom',
                  offset: -25,
                  style: { fontSize: '10px', fill: '#9ca3af', opacity: 0.5, letterSpacing: '0.05em', fontFamily: "'Share Tech Mono', 'Outfit', monospace", textTransform: 'uppercase' }
                }}
              />
              <YAxis
                type="number"
                dataKey="fork"
                name="Forks"
                unit="🍴"
                domain={yDomain}
                ticks={yTicks}
                tickFormatter={logTickFormatter}
                stroke="rgba(16, 185, 129, 0.2)"
                tick={{ fontSize: '10px', fontFamily: "'Share Tech Mono', 'Outfit', monospace", fill: '#9ca3af' }}
                label={{
                  value: '🍴 FORKS / PRACTICAL DEV (ADOPTION)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: -25,
                  style: { fontSize: '10px', fill: '#9ca3af', opacity: 0.5, letterSpacing: '0.05em', fontFamily: "'Share Tech Mono', 'Outfit', monospace", textTransform: 'uppercase', textAnchor: 'middle' }
                }}
              />

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
                shape={(props) => {
                  const { cx, cy, payload, index } = props;
                  const style = getDotStyle(payload, index ?? 0);
                  const radius = bubbleMode
                    ? Math.min(45, 3 + Math.sqrt(Math.max(0, (payload.contributors || 1) - 1)) * 2.1)
                    : 3;
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill={style.fill}
                      fillOpacity={style.fillOpacity}
                      stroke={style.stroke}
                      strokeWidth={style.strokeWidth}
                      filter={style.filter}
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
