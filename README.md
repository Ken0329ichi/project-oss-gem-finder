# 🚀 GitHub OSS Trend & Gem Finder

[![GitHub Pages Site](https://img.shields.io/badge/Live%20Site-GitHub%20Pages-10B981?style=for-the-badge&logo=githubpages&logoColor=white)](https://ken0329ichi.github.io/project-oss-gem-finder/)
[![Sponsor](https://img.shields.io/badge/Sponsor-Ken0329ichi-ea4aaa?style=for-the-badge&logo=githubsponsors&logoColor=white)](https://github.com/sponsors/Ken0329ichi)
[![A2A Gateway](https://img.shields.io/badge/A2A%20Gateway-x402%20Enabled-8B5CF6?style=for-the-badge&logo=fastapi&logoColor=white)](https://kenichi.synology.me:8443/a2a/.well-known/agent.json)
[![Protocol: x402](https://img.shields.io/badge/Protocol-x402%20(Base%20USDC)-0052FF?style=for-the-badge&logo=coinbase&logoColor=white)](https://kenichi.synology.me:8443/a2a/llms.txt)
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
- **Curated Active Repositories**: Extensive dataset of active open-source projects across 23 languages (updated within 2 years, MIT / Apache-2.0 licensed).
- **Dual-Mode Gem Plot with Live Toggle**: Seamlessly switch the scatter plot between **[🍴 Stars vs. Forks]** (Historical Adoption) and **[⚡ Stars vs. 90-Day Commits]** (Active Development Momentum) with smooth 60fps animations.
- **Objective Gem Score & 6 Stellar Magnitudes**: Mathematically identifies hidden gems based on 6 core dimensions: Contributors, 90-day Commits, Watchers, Pull Requests, Forks, and Stars.
- **Ambient Heatmap Repository Cards**: Cards feature subtle, glowing cyber-heatmaps (🔥 Supernova, ⚡ Plasma, 💜 Active, 💤 Dormant) reflecting real-time development velocity.
- **10-Dimensional Sorting & Ranking**: Instantly sort projects by Gem Score, 90-Day Commits, Stars, Forks, Contributors, Open PRs, Good First Issues, and more.
- **Interactive Dashboard Charts**: Region distribution (donut), interactive **Language Breakdown Treemap** (toggle between Total Repos & GFI Count, click-to-filter with fixed 23-language neon color palette), and a dynamic **Tech Stack Word Cloud** with adjustable display limits (default 200).
- **Dataset Info Modal with Treemap**: Detailed statistics (6 key metrics), synchronized 23-language breakdown treemap, and a **one-click JSON dataset download** (CC BY 4.0).
- **Fast Full-Text Search**: Ultra-fast Google-style multi-word AND search running natively in browser memory (milliseconds execution).
- **Cyber-Dark Glass UI**: Canvas-powered 60fps scatter plots rendered with Apache ECharts, featuring neon-glow hover effects and glassmorphism design.
- **Open Data Access**: The complete dataset (`data.json`) is freely downloadable under the CC BY 4.0 license directly from the dashboard.

---

## 🤖 Autonomous Agent (A2A) & MCP Interface

This service exposes high-growth GitHub repository intelligence for AI Agents and MCP clients with native **x402 (Base USDC micropayments)**.

### 📡 Public Specifications & Discovery
- **RFC 8615 Agent Card:** `https://kenichi.synology.me:8443/a2a/.well-known/agent.json`
- **llms.txt Specification:** `https://kenichi.synology.me:8443/a2a/llms.txt`
- **OpenAPI 3.0 Schema:** `https://kenichi.synology.me:8443/a2a/openapi.json`
- **MCP SSE Endpoint:** `https://kenichi.synology.me:8443/a2a/sse`

### 💳 x402 Micropayment Protocol
- **Network:** Base (Chain ID: 8453)
- **Settlement Asset:** USDC (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- **Protocol:** HTTP 402 Payment Required
- **Pricing Tiers:**
  - `Tier 0 (Sample)`: Free (`GET /api/v1/gems/sample`)
  - `Tier 1 (Search)`: 0.005 USDC (`GET /api/v1/gems`)
  - `Tier 2 (Trending)`: 0.020 USDC (`GET /api/v1/gems/trending`)
  - `Tier 3 (Dump)`: 1.000 USDC (`GET /api/v1/gems/dump`)

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
