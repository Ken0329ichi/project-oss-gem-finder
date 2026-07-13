import React from 'react';
import GemPlotChart from './charts/GemPlotChart';
import PrVolumeChart from './charts/PrVolumeChart';
import IssueActiveScatterChart from './charts/IssueActiveScatterChart';
import RegionChart from './charts/RegionChart';
import GfiLanguagesChart from './charts/GfiLanguagesChart';

export default function DashboardCharts({
  scatterData, scatterMaxStars, setScatterMaxStars,
  issueMaxCount, setIssueMaxCount,
  selectedLabel, selectedCountry, selectedLicense, selectedLang, gfiOnly,
  selectedRepo, handleScatterClick, setSelectedRepo,
  prScatterData,
  issueScatterData,
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
        setScatterMaxStars={setScatterMaxStars}
        selectedRepo={selectedRepo}
        handleScatterClick={handleScatterClick}
        PrScatterTooltip={PrScatterTooltip}
        colors={colors}
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
