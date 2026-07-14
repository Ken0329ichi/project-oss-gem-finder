import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// サイバー・ネオンカラーパレット（散布図と統一）
const CYBER_COLORS = [
  '#ec4899', // サイバーマゼンタ
  '#06b6d4', // ネオンシアン
  '#8b5cf6', // エレクトリックパープル
  '#10b981', // ネオンミント
  '#f59e0b', // サイバーアンバー
  '#3b82f6', // ネオンブルー
  '#ec4899',
  '#06b6d4',
  '#8b5cf6',
  '#10b981',
];

const MONO_TICK = {
  fontSize: '10px',
  fontFamily: "'Share Tech Mono', 'Outfit', monospace",
  fill: '#9ca3af',
};

export default function GfiLanguagesChart({
  barData,
  GfiTooltip,
}) {
  return (
    <div className="chart-box half-width glass">
      <h3>🌱 Good First Issues Count (Top 10 Languages)</h3>
      <p className="chart-sub">Total GFI count per language across all filtered repositories. Top 10 languages shown.</p>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={barData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            {/* 極薄の電子格子グリッド */}
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.06} stroke="#ffffff" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="rgba(139, 92, 246, 0.2)"
              tick={MONO_TICK}
              interval={0}
            />
            <YAxis
              stroke="rgba(139, 92, 246, 0.2)"
              tick={MONO_TICK}
            />
            <Tooltip content={<GfiTooltip />} />
            <Bar dataKey="value" radius={[3, 3, 0, 0]}>
              {barData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CYBER_COLORS[index % CYBER_COLORS.length]}
                  opacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
