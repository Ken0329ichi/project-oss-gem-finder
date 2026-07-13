import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RegionChart({
  pieData,
  showGlobal,
  setShowGlobal,
  PieTooltip,
  colors
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
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
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
