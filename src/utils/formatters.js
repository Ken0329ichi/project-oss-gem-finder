// 世界標準UTC時刻へのフォーマットヘルパー
export const formatUTC = (isoString) => {
  if (!isoString) return 'Unknown';
  try {
    const date = new Date(isoString);
    const yyyy = date.getUTCFullYear();
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(date.getUTCDate()).padStart(2, '0');
    const hh = String(date.getUTCHours()).padStart(2, '0');
    const min = String(date.getUTCMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min} UTC`;
  } catch {
    return 'Unknown';
  }
};

// 言語名から対応するDeviconクラス名へのマッピングヘルパー
export const getLanguageIconClass = (lang) => {
  if (!lang) return '';
  const l = lang.toLowerCase().trim();
  
  const mapping = {
    'python': 'devicon-python-plain',
    'javascript': 'devicon-javascript-plain',
    'typescript': 'devicon-typescript-plain',
    'go': 'devicon-go-plain',
    'rust': 'devicon-rust-plain',
    'zig': 'devicon-zig-original',
    'cpp': 'devicon-cplusplus-plain',
    'c++': 'devicon-cplusplus-plain',
    'c': 'devicon-c-plain',
    'ruby': 'devicon-ruby-plain',
    'elixir': 'devicon-elixir-plain',
    'haskell': 'devicon-haskell-plain',
    'julia': 'devicon-julia-plain',
    'scala': 'devicon-scala-plain',
    'shell': 'devicon-bash-plain',
    'bash': 'devicon-bash-plain',
    'lua': 'devicon-lua-plain',
    'kotlin': 'devicon-kotlin-plain',
    'swift': 'devicon-swift-plain',
    'dart': 'devicon-dart-plain',
    'csharp': 'devicon-csharp-plain',
    'c#': 'devicon-csharp-plain',
    'java': 'devicon-java-plain',
    'nim': 'devicon-nim-plain'
  };

  return mapping[l] || '';
};
