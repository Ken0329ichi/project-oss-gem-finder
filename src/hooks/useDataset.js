import { useState, useEffect, useMemo } from 'react';

export default function useDataset() {
  const [repos, setRepos] = useState([]);
  const [filteredRepos, setFilteredRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatedAt, setUpdatedAt] = useState('');

  // 検索・フィルター条件の状態
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLang, setSelectedLang] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedLicense, setSelectedLicense] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [gfiOnly, setGfiOnly] = useState(false);
  const [minPrs, setMinPrs] = useState(0);          // 最小PR数
  const [maxIssues, setMaxIssues] = useState(1000); // 最大Issue数

  // 1. データセット (data.json) の非同期ロード
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('./data/data.json');
        if (!res.ok) throw new Error('データファイルのロードに失敗しました。');
        const dataset = await res.json();
        const list = dataset.repositories || [];
        setRepos(list);
        setFilteredRepos(list);
        if (dataset.dataset_properties && dataset.dataset_properties.updated_at) {
          setUpdatedAt(dataset.dataset_properties.updated_at);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 2. メモリ上でのフィルタ選択肢抽出
  const languages = useMemo(() => {
    return [...new Set(repos.map(r => r.meta.primary_language).filter(Boolean))].sort();
  }, [repos]);

  const countries = useMemo(() => {
    return [...new Set(repos.map(r => r.meta.detected_country).filter(Boolean))].sort();
  }, [repos]);

  const licenses = useMemo(() => {
    return [...new Set(repos.map(r => r.meta.license).filter(Boolean))].sort();
  }, [repos]);

  const rareLabels = useMemo(() => {
    const countMap = {};
    repos.forEach(r => {
      (r.activity.labels || r.activity.funny_labels || []).forEach(l => {
        countMap[l] = (countMap[l] || 0) + 1;
      });
    });
    return Object.entries(countMap)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 30)
      .map(entry => entry[0]);
  }, [repos]);

  // 3. オンメモリ検索フォールバック
  const inMemorySearch = (list, query) => {
    const q = query.toLowerCase();
    return list.filter(r => 
      r.meta.name.toLowerCase().includes(q) ||
      (r.meta.description && r.meta.description.toLowerCase().includes(q)) ||
      (r.search_keywords || []).some(k => k.toLowerCase().includes(q))
    );
  };

  // 4. Pagefind ＆ フィルター処理
  useEffect(() => {
    const filterData = async () => {
      let result = [...repos];

      if (searchQuery && window.pagefind) {
        try {
          const search = await window.pagefind.search(searchQuery);
          const results = await Promise.all(search.results.map(r => r.data()));
          const matchedUrls = results.map(r => r.url);
          result = result.filter(r => {
            const pathName = `/repos/${r.meta.name.replace('/', '-')}.html`;
            return matchedUrls.some(url => url.endsWith(pathName));
          });
        } catch (e) {
          console.warn("Pagefind search failed, falling back to in-memory search:", e);
          result = inMemorySearch(result, searchQuery);
        }
      } else if (searchQuery) {
        result = inMemorySearch(result, searchQuery);
      }

      if (selectedLang) {
        result = result.filter(r => r.meta.primary_language === selectedLang);
      }
      if (selectedCountry) {
        result = result.filter(r => r.meta.detected_country === selectedCountry);
      }
      if (selectedLicense) {
        result = result.filter(r => r.meta.license === selectedLicense);
      }
      if (selectedLabel) {
        result = result.filter(r => (r.activity.labels || r.activity.funny_labels || []).includes(selectedLabel));
      }
      if (gfiOnly) {
        result = result.filter(r => (r.metrics.good_first_issues || 0) > 0);
      }
      if (minPrs > 0) {
        result = result.filter(r => (r.metrics.open_pull_requests || 0) >= minPrs);
      }
      if (maxIssues < 1000) {
        result = result.filter(r => (r.metrics.open_issues || 0) <= maxIssues);
      }

      setFilteredRepos(result);
    };

    filterData();
  }, [searchQuery, selectedLang, selectedCountry, selectedLicense, selectedLabel, gfiOnly, minPrs, maxIssues, repos]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLang('');
    setSelectedCountry('');
    setSelectedLicense('');
    setSelectedLabel('');
    setGfiOnly(false);
    setMinPrs(0);
    setMaxIssues(1000);
  };

  return {
    repos,
    filteredRepos,
    loading,
    error,
    updatedAt,
    searchQuery,
    setSearchQuery,
    selectedLang,
    setSelectedLang,
    selectedCountry,
    setSelectedCountry,
    selectedLicense,
    setSelectedLicense,
    selectedLabel,
    setSelectedLabel,
    gfiOnly,
    setGfiOnly,
    minPrs,
    setMinPrs,
    maxIssues,
    setMaxIssues,
    languages,
    countries,
    licenses,
    rareLabels,
    clearFilters
  };
}
