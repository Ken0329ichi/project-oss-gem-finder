import React from 'react';
import GemPlotChart from './charts/GemPlotChart';
import PrVolumeChart from './charts/PrVolumeChart';
import OpenIssuesChart from './charts/OpenIssuesChart';
import RegionChart from './charts/RegionChart';
import GfiLanguagesChart from './charts/GfiLanguagesChart';

export default function DashboardCharts({
  scatterData, scatterMaxStars, setScatterMaxStars,
  selectedLabel, selectedCountry, selectedLicense, selectedLang, gfiOnly,
  selectedRepo, handleScatterClick, setSelectedRepo,
  prScatterData,
  issueBarData,
  pieData, showGlobal, setShowGlobal,
  barData,
  colors,
  PrScatterTooltip, IssueTooltip, PieTooltip, GfiTooltip
}) {
  return (
    <div className="charts-container">
      {/* 散布図①: スター数 vs フォーク数 */}
      <GemPlotChart 
        scatterData={scatterData}
        scatterMaxStars={scatterMaxStars}
        setScatterMaxStars={setScatterMaxStars}
        selectedLabel={selectedLabel}
        selectedCountry={selectedCountry}
        selectedLang={selectedLang}
        selectedRepo={selectedRepo}
        handleScatterClick={handleScatterClick}
        colors={colors}
      />

      {/* 散布図②: スター数 vs オープンPR数 */}
      <PrVolumeChart 
        prScatterData={prScatterData}
        selectedLabel={selectedLabel}
        selectedCountry={selectedCountry}
        selectedLicense={selectedLicense}
        selectedLang={selectedLang}
        scatterMaxStars={scatterMaxStars}
        selectedRepo={selectedRepo}
        handleScatterClick={handleScatterClick}
        PrScatterTooltip={PrScatterTooltip}
        colors={colors}
      />

      {/* 積み上げ横棒グラフ: リポジトリ別のOpen Issues & GFIs */}
      <OpenIssuesChart 
        issueBarData={issueBarData}
        selectedLabel={selectedLabel}
        selectedCountry={selectedCountry}
        selectedLicense={selectedLicense}
        selectedLang={selectedLang}
        gfiOnly={gfiOnly}
        setSelectedRepo={setSelectedRepo}
        IssueTooltip={IssueTooltip}
      />

      <div className="chart-row">
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
    </div>
  );
}
