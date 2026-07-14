import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// サイバー・ネオンカラーパレット（散布図と統一）
const CYBER_COLORS = [
  '#ec4899', // サイバーマゼンタ
  '#06b6d4', // ネオンシアン
  '#8b5cf6', // エレクトリックパープル
  '#10b981', // ネオンミント
  '#f59e0b', // サイバーアンバー
  '#3b82f6', // ネオンブルー
];

export default function RegionChart({
  pieData,
  showGlobal,
  setShowGlobal,
  PieTooltip,
}) {
  return (
    <div className="chart-box half-width glass">
      <div className="chart-box-header">
        <div>
          <h3>🍩 Region Distribution</h3>
          <p className="chart-sub">Top 6 most represented regions. Toggle to hide Global (undetected) entries.</p>
        </div>
        <button
          className={`toggle-global-btn ${showGlobal ? '' : 'active'}`}
          onClick={() => setShowGlobal(v => !v)}
          title="Toggle Global repositories"
        >
          {showGlobal ? '🌐 Hide Global' : '🌐 Show Global'}
        </button>
      </div>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={5}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CYBER_COLORS[index % CYBER_COLORS.length]}
                  opacity={0.85}
                />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
