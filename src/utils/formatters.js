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

// ===================================================
// 🌏 cleanRegion: カオスな所在地文字列の正規化ヘルパー
// 優先1: 特殊カテゴリ → 優先2: 地理マッピング → 優先3: Global 🌐
// ===================================================
export const cleanRegion = (rawLocation) => {
  if (!rawLocation || rawLocation === 'null' || rawLocation === 'undefined') return 'Global 🌐';
  const l = rawLocation.toLowerCase().trim();
  if (!l) return 'Global 🌐';

  // 2文字のISO国コードに対する完全一致（最優先）
  const countryCodes = {
    'us': '🇺🇸 United States',
    'cn': '🇨🇳 China',
    'jp': '🇯🇵 Japan',
    'gb': '🇬🇧 United Kingdom',
    'uk': '🇬🇧 United Kingdom',
    'de': '🇩🇪 Germany',
    'fr': '🇫🇷 France',
    'es': '🇪🇸 Spain',
    'ca': '🇨🇦 Canada',
    'nl': '🇳🇱 Netherlands',
    'br': '🇧🇷 Brazil',
    'it': '🇮🇹 Italy',
    'cz': '🇨🇿 Czechia',
    'nz': '🇳🇿 New Zealand',
    'au': '🇦🇺 Australia',
    'ru': '🇷🇺 Russia',
    'in': '🇮🇳 India',
    'kr': '🇰🇷 South Korea',
    'sg': '🇸🇬 Singapore',
    'ch': '🇨🇭 Switzerland',
    'se': '🇸🇪 Sweden',
    'pl': '🇵🇱 Poland',
    'ua': '🇺🇦 Ukraine',
    'pt': '🇵🇹 Portugal',
    'fi': '🇫🇮 Finland',
    'no': '🇳🇴 Norway',
    'dk': '🇩🇰 Denmark',
    'at': '🇦🇹 Austria',
    'be': '🇧🇪 Belgium',
    'il': '🇮🇱 Israel',
    'tr': '🇹🇷 Turkey',
    'bg': '🇧🇬 Bulgaria',
    'ro': '🇷🇴 Romania',
    'id': '🇮🇩 Indonesia',
    'vn': '🇻🇳 Vietnam',
    'tw': '🇹🇼 Taiwan',
    'mx': '🇲🇽 Mexico',
    'ar': '🇦🇷 Argentina'
  };
  if (countryCodes[l]) return countryCodes[l];

  // 優先1: 特殊カテゴリ（ユーモア・テック的ジョーク）

  const localhostKw = ['127.0.0.1', '::1', '/dev/tty', 'your computer', 'your home', 'terminal & browser'];
  if (localhostKw.some(k => l.includes(k)) || l.startsWith('0x')) return '💻 Localhost';

  const depsKw = ['node_modules', 'pkg.devdependencies', '$gopath', '9th ring', 'ctrl+shift', 'elixir-lang', '@argoproj'];
  if (depsKw.some(k => l.includes(k))) return '📦 Depended Depths';

  const cyberKw = ['cyberspace', 'the cloud', 'the internet', 'www', 'https://', 'http://', '☁️'];
  if (cyberKw.some(k => l.includes(k))) return '☁️ Cyberspace';

  const spaceKw = ['mars', 'the moon', 'the future', 'celadon city', 'gotham city', "r'lyeh", 'wildest dream', 'eigens are valued'];
  if (spaceKw.some(k => l.includes(k))) return '🚀 Deep Space';

  // 優先2: 地理マッピング（都市名・略称→国旗付き正式名称）
  const geoMap = [
    { flag: '🇺🇸 United States', keys: ['united states', 'u.s.a', ' usa', ',usa', 'ann arbor', 'michigan', 'bellevue', 'washington', 'berkeley', 'bethlehem', 'carrboro', 'chicago', 'colorado', 'cupertino', 'dallas', 'texas', 'denver', 'florida', 'houston', 'irvine', 'kirkland', 'los angeles', 'los gatos', 'mountain view', 'new york', 'nyc', 'pittsburgh', 'portland', 'oregon', 'redmond', 'san diego', 'san jose', 'santa monica', 'st. paul', 'stanford', 'utah', 'socal', 'san francisco', 'sfo', 'seattle', '2788 san tomas'] },
    { flag: '🇨🇳 China', keys: ['china', ' cn,', 'prc', 'guangzhou', 'guangdong', 'hong kong', 'wuhan', 'hubei', "xi'an", '北京', '长沙', 'beijing', 'shanghai', 'shenzhen', 'chengdu'] },
    { flag: '🇯🇵 Japan', keys: ['japan', ' jp,', ',jp', 'tokyo', 'osaka', 'kyoto'] },
    { flag: '🇬🇧 United Kingdom', keys: ['united kingdom', 'uk,', ' uk', 'england', 'london', 'edinburgh', 'scotland', 'oxfordshire', 'cambridge', 'manchester', 'bristol'] },
    { flag: '🇩🇪 Germany', keys: ['germany', 'deutschland', 'berlin', 'munich', 'münchen', 'hamburg', 'frankfurt', 'cologne'] },
    { flag: '🇫🇷 France', keys: ['france', 'paris', 'lyon', 'toulouse', 'bordeaux'] },
    { flag: '🇪🇸 Spain', keys: ['spain', 'españa', 'barcelona', 'madrid', 'galicia', 'seville', 'valencia'] },
    { flag: '🇨🇦 Canada', keys: ['canada', 'toronto', 'vancouver', 'montreal', 'ottawa'] },
    { flag: '🇳🇱 Netherlands', keys: ['netherlands', 'holland', 'amsterdam', 'rotterdam', 'utrecht'] },
    { flag: '🇧🇷 Brazil', keys: ['brazil', 'brasil', 'são paulo', 'sao paulo', 'rio de janeiro', 'brasilia'] },
    { flag: '🇮🇹 Italy', keys: ['italy', 'italia', 'rome', 'milan', 'naples', 'turin'] },
    { flag: '🇨🇿 Czechia', keys: ['czech', 'czechia', 'brno', 'prague', 'Praha'] },
    { flag: '🇳🇿 New Zealand', keys: ['new zealand', 'auckland', 'wellington'] },
    { flag: '🇦🇺 Australia', keys: ['australia', 'sydney', 'melbourne', 'brisbane', 'perth'] },
    { flag: '🇷🇺 Russia', keys: ['russia', 'moscow', 'saint petersburg', 'novosibirsk'] },
    { flag: '🇮🇳 India', keys: ['india', 'bangalore', 'bengaluru', 'mumbai', 'delhi', 'pune', 'hyderabad', 'chennai'] },
    { flag: '🇰🇷 South Korea', keys: ['korea', 'seoul', 'busan', 'daejeon'] },
    { flag: '🇸🇬 Singapore', keys: ['singapore'] },
    { flag: '🇨🇭 Switzerland', keys: ['switzerland', 'swiss', 'zurich', 'zürich', 'geneva', 'bern'] },
    { flag: '🇸🇪 Sweden', keys: ['sweden', 'stockholm', 'gothenburg', 'malmö'] },
    { flag: '🇵🇱 Poland', keys: ['poland', 'polska', 'warsaw', 'kraków', 'wrocław'] },
    { flag: '🇺🇦 Ukraine', keys: ['ukraine', 'kyiv', 'kharkiv', 'odessa'] },
    { flag: '🇵🇹 Portugal', keys: ['portugal', 'lisbon', 'porto'] },
    { flag: '🇫🇮 Finland', keys: ['finland', 'helsinki', 'espoo'] },
    { flag: '🇳🇴 Norway', keys: ['norway', 'oslo', 'bergen'] },
    { flag: '🇩🇰 Denmark', keys: ['denmark', 'copenhagen', 'aarhus'] },
    { flag: '🇦🇹 Austria', keys: ['austria', 'vienna', 'wien', 'graz'] },
    { flag: '🇧🇪 Belgium', keys: ['belgium', 'brussels', 'ghent', 'antwerp'] },
    { flag: '🇮🇱 Israel', keys: ['israel', 'tel aviv', 'jerusalem', 'haifa'] },
    { flag: '🇹🇷 Turkey', keys: ['turkey', 'istanbul', 'ankara', 'izmir'] },
    { flag: '🇧🇬 Bulgaria', keys: ['bulgaria', 'sofia', 'plovdiv'] },
    { flag: '🇷🇴 Romania', keys: ['romania', 'bucharest', 'cluj', 'timisoara'] },
    { flag: '🇮🇩 Indonesia', keys: ['indonesia', 'jakarta', 'bali', 'surabaya'] },
    { flag: '🇻🇳 Vietnam', keys: ['vietnam', 'hanoi', 'ho chi minh', 'saigon'] },
    { flag: '🇹🇼 Taiwan', keys: ['taiwan', 'taipei'] },
    { flag: '🇲🇽 Mexico', keys: ['mexico', 'ciudad de mexico', 'guadalajara', 'monterrey'] },
    { flag: '🇦🇷 Argentina', keys: ['argentina', 'buenos aires', 'córdoba'] },
  ];

  for (const { flag, keys } of geoMap) {
    if (keys.some(k => l.includes(k))) return flag;
  }

  // 優先3: フォールバック
  return 'Global 🌐';
};

// ===================================================
// 📊 getMedian: 数値配列の中央値を動的に計算するヘルパー
// ===================================================
export const getMedian = (arr, key) => {
  if (!arr || arr.length === 0) return 0;
  const values = arr
    .map(item => item[key])
    .filter(v => typeof v === 'number' && !isNaN(v))
    .sort((a, b) => a - b);
  if (values.length === 0) return 0;
  const half = Math.floor(values.length / 2);
  if (values.length % 2 !== 0) {
    return values[half];
  }
  return (values[half - 1] + values[half]) / 2;
};

// ===================================================
// 📊 logTickFormatter: 対数（10^x）軸の目盛りラベルのフォーマッター
// ===================================================
export const logTickFormatter = (value) => {
  if (value < 0) return '0';
  if (value === 0) return '1';
  // 浮動小数点の誤差を考慮し、整数値に近い場合のみラベルを出力
  const rounded = Math.round(value * 10) / 10;
  if (rounded % 1 === 0) {
    const power = Math.round(rounded);
    const val = Math.pow(10, power);
    if (val >= 1000) {
      return (val / 1000).toLocaleString() + 'k';
    }
    return val.toLocaleString();
  }
  return '';
};



