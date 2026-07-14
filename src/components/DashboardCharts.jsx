import React, { useState } from 'react';
import GemPlotChart from './charts/GemPlotChart';
import PrVolumeChart from './charts/PrVolumeChart';
import IssueActiveScatterChart from './charts/IssueActiveScatterChart';
import RegionChart from './charts/RegionChart';
import GfiLanguagesChart from './charts/GfiLanguagesChart';
import './DashboardCharts.css';

export default function DashboardCharts({
  scatterData,
  issueMaxCount, setIssueMaxCount,
  selectedLabel, selectedCountry, selectedLicense, selectedLang, gfiOnly,
  selectedRepo, handleScatterClick, setSelectedRepo,
  prScatterData,
  issueScatterData,
  pieData, showGlobal, setShowGlobal,
  barData,
  colors,
  PrScatterTooltip, IssueTooltip, PieTooltip, GfiTooltip, GemTooltip
}) {
  // 👥 Show Team Size (Bubble Mode) 状態の管理 (Gem Plot 上のトグルで全散布図と同期)
  const [bubbleMode, setBubbleMode] = useState(false);

  return (
    <div className="charts-container">
      {/* 第1レイヤー（マクロ俯瞰）: 地域シェア ✕ 言語別GFI数 (2カラム横並び) */}
      <div className="chart-row-split">
        {/* ドーナツグラフ: 国別シェア */}
        <RegionChart 
          pieData={pieData}
          showGlobal={showGlobal}
          setShowGlobal={setShowGlobal}
          PieTooltip={PieTooltip}
          colors={colors}
        />

        {/* バーチャート: 言語別の初心者歓迎Issue数 */}
        <GfiLanguagesChart 
          barData={barData}
          GfiTooltip={GfiTooltip}
          colors={colors}
        />
      </div>

      {/* 第2レイヤー（主戦場）: Stargazers vs Forks (全幅) */}
      <div className="chart-row-full">
        <GemPlotChart 
          scatterData={scatterData}
          selectedLabel={selectedLabel}
          selectedCountry={selectedCountry}
          selectedLang={selectedLang}
          selectedRepo={selectedRepo}
          handleScatterClick={handleScatterClick}
          colors={colors}
          GemTooltip={GemTooltip}
          bubbleMode={bubbleMode}
          setBubbleMode={setBubbleMode}
        />
      </div>

      {/* 第3レイヤー（ミクロ深掘り）: PR数 ✕ GFI活性度 (2カラム横並び) */}
      <div className="chart-row-split">
        {/* 散布図②: スター数 vs オープンPR数 */}
        <PrVolumeChart 
          prScatterData={prScatterData}
          selectedLabel={selectedLabel}
          selectedCountry={selectedCountry}
          selectedLicense={selectedLicense}
          selectedLang={selectedLang}
          selectedRepo={selectedRepo}
          handleScatterClick={handleScatterClick}
          PrScatterTooltip={PrScatterTooltip}
          colors={colors}
          bubbleMode={bubbleMode}
        />

        {/* 散布図③: オープンIssue数 vs GFI数 */}
        <IssueActiveScatterChart 
          issueScatterData={issueScatterData}
          selectedLabel={selectedLabel}
          selectedCountry={selectedCountry}
          selectedLicense={selectedLicense}
          selectedLang={selectedLang}
          gfiOnly={gfiOnly}
          issueMaxCount={issueMaxCount}
          setIssueMaxCount={setIssueMaxCount}
          selectedRepo={selectedRepo}
          handleScatterClick={handleScatterClick}
          IssueTooltip={IssueTooltip}
          colors={colors}
          bubbleMode={bubbleMode}
        />
      </div>
    </div>
  );
}
