import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function GfiLanguagesChart({
  barData,
  GfiTooltip,
  colors
}) {
  return (
    <div className="chart-box half-width glass">
      <h3>🌱 Good First Issues Count (Top 10 Languages)</h3>
      <p className="chart-sub">Total GFI count per language across all filtered repositories. Top 10 languages shown.</p>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={barData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <XAxis dataKey="name" stroke="#9ca3af" interval={0} tick={{ fontSize: 10 }} />
            <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} />
            <Tooltip content={<GfiTooltip />} />
            <Bar dataKey="value" fill="#8B5CF6">
              {barData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
