# 🚀 GitHub OSS Trend & Gem Finder

[![GitHub Pages Site](https://img.shields.io/badge/Live%20Site-GitHub%20Pages-10B981?style=for-the-badge&logo=githubpages&logoColor=white)](https://ken0329ichi.github.io/project-oss-gem-finder/)
[![Sponsor](https://img.shields.io/badge/Sponsor-Ken0329ichi-ea4aaa?style=for-the-badge&logo=githubsponsors&logoColor=white)](https://github.com/sponsors/Ken0329ichi)
[![License: MIT](https://img.shields.io/badge/Code%20License-MIT-blue?style=for-the-badge)](LICENSE)
[![License: CC BY 4.0](https://img.shields.io/badge/Data%20License-CC%20BY%204.0-lightgrey.svg?style=for-the-badge)](https://creativecommons.org/licenses/by/4.0/)

> **Discover hidden OSS gems overshadowed by star counts using objective multi-dimensional metrics.**

👉 **[Launch Web Dashboard (Live Site)](https://ken0329ichi.github.io/project-oss-gem-finder/)**

---

## 🔍 Repository Discovery Criteria

To ensure a high-quality, relevant, and secure dataset of open-source projects, our automated discovery engine scans GitHub using the following strict criteria:

1. **Popularity**: Must have at least **300 stars** (`stars:>=300`).
2. **License**: Must be explicitly licensed under **MIT** or **Apache-2.0** to comply with open-source reuse.
3. **Activity**: Must have recent activity with at least one push in the **last 2 years** (`pushed:>=[2_years_ago]`).
4. **Technology Stack**: Limited to **23 major development languages** to filter out low-level assembly, markup, configuration files, and configuration boilerplates:
   - *Python, Go, Rust, Zig, Nim, C++, C, Haskell, OCaml, Clojure, Elixir, Julia, Shell, Lua, TypeScript, JavaScript, Ruby, Scala, Swift, Kotlin, Dart, C#, Java*.
5. **Exclusion**: Self-repositories of this project are strictly excluded from the dataset to maintain statistical fairness.

> **Note**: Repository stargazers may occasionally drop below 300 over time (due to unstars) after the initial discovery phase.

---

## ✨ Overview

**GitHub OSS Trend & Gem Finder** is an interactive web dashboard designed to unveil hidden, high-quality open-source projects that may be overshadowed by simple star count rankings.

### Key Features
- **Curated Active Repositories**: Comprehensive dataset of active open-source projects across 23 languages (updated within 2 years, MIT / Apache-2.0 licensed).
- **Multi-Dimensional Gem Plot**: Logarithmic scatter plot with 6 stellar magnitude tiers, visualizing Stargazers vs. Value Index (Watch/Star Ratio × Forks).
- **Interactive Dashboard Charts**: Region distribution (donut), GFI languages (bar), and a dynamic **Tech Stack Word Cloud** with adjustable display limits.
- **Dataset Info Modal with Treemap**: Detailed statistics (6 key metrics), language breakdown treemap, and a **one-click JSON dataset download** (CC BY 4.0).
- **Fast Full-Text Search**: Instant filtering powered by Pagefind static search engine.
- **Cyber-Dark Glass UI**: Canvas-powered 60fps scatter plots rendered with Apache ECharts, featuring neon-glow hover effects and glassmorphism design.
- **Open Data Access**: The complete dataset (`data.json`) is freely downloadable under the CC BY 4.0 license directly from the dashboard.

---

## 📄 License & Data Attribution

We apply a dual-licensing model to distinguish between the frontend application code and the collected metadata:

### 1. Frontend Application Code (MIT License)
All HTML, CSS, JavaScript, and compiled assets in this repository are licensed under the **[MIT License](LICENSE)**.

### 2. Dataset / Metrics Database (CC BY 4.0)
The repository metrics dataset (`data/data.json`) is licensed under the **[Creative Commons Attribution 4.0 International License (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/)**.

#### How to Attribute
If you use, modify, or redistribute `data/data.json`, please include the following credit:
- **Creator**: Ken0329ichi
- **Project URL**: [https://github.com/Ken0329ichi/project-oss-gem-finder](https://github.com/Ken0329ichi/project-oss-gem-finder)
- **Live Web App**: [https://ken0329ichi.github.io/project-oss-gem-finder/](https://ken0329ichi.github.io/project-oss-gem-finder/)
- **License Text**: [CC BY 4.0 License](https://creativecommons.org/licenses/by/4.0/)

---

💖 Built & Maintained by **[Ken0329ichi](https://github.com/Ken0329ichi)**. Consider [sponsoring the project](https://github.com/sponsors/Ken0329ichi) to support continuous data updates and hosting!
