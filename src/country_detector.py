from typing import Optional

# 🗺️ 所在地(都市・地域名含む)から国名＋国旗絵文字へのマッピング辞書
# 後から主要なIT都市や地域、国名を簡単に追加・調整できます (KISS)
COUNTRY_MAP = {
    # 日本
    "japan": "Japan 🇯🇵", "tokyo": "Japan 🇯🇵", "kyoto": "Japan 🇯🇵", "osaka": "Japan 🇯🇵",
    
    # 米国
    "united states": "United States 🇺🇸", "usa": "United States 🇺🇸", "america": "United States 🇺🇸",
    "california": "United States 🇺🇸", "san francisco": "United States 🇺🇸", "new york": "United States 🇺🇸",
    "seattle": "United States 🇺🇸", "boston": "United States 🇺🇸", "austin": "United States 🇺🇸", "bay area": "United States 🇺🇸",
    
    # 中国
    "china": "China 🇨🇳", "beijing": "China 🇨🇳", "shanghai": "China 🇨🇳", "shenzhen": "China 🇨🇳",
    "hangzhou": "China 🇨🇳", "chengdu": "China 🇨🇳",
    
    # イギリス
    "united kingdom": "United Kingdom 🇬🇧", "uk": "United Kingdom 🇬🇧", "london": "United Kingdom 🇬🇧",
    "england": "United Kingdom 🇬🇧", "great britain": "United Kingdom 🇬🇧",
    
    # ドイツ
    "germany": "Germany 🇩🇪", "deutschland": "Germany 🇩🇪", "berlin": "Germany 🇩🇪", "munich": "Germany 🇩🇪",
    
    # フランス
    "france": "France 🇫🇷", "paris": "France 🇫🇷",
    
    # カナダ
    "canada": "Canada 🇨🇦", "toronto": "Canada 🇨🇦", "vancouver": "Canada 🇨🇦",
    
    # オーストラリア
    "australia": "Australia 🇦🇺", "sydney": "Australia 🇦🇺", "melbourne": "Australia 🇦🇺",
    
    # インド
    "india": "India 🇮🇳", "bangalore": "India 🇮🇳", "mumbai": "India 🇮🇳", "new delhi": "India 🇮🇳",
    
    # ロシア
    "russia": "Russia 🇷🇺", "moscow": "Russia 🇷🇺",
    
    # その他主要IT・OSS活発国
    "korea": "South Korea 🇰🇷", "seoul": "South Korea 🇰🇷",
    "taiwan": "Taiwan 🇹🇼", "taipei": "Taiwan 🇹🇼",
    "singapore": "Singapore 🇸🇬",
    "switzerland": "Switzerland 🇨🇭", "zurich": "Switzerland 🇨🇭",
    "netherlands": "Netherlands 🇳🇱", "amsterdam": "Netherlands 🇳🇱",
    "ukraine": "Ukraine 🇺🇦", "kyiv": "Ukraine 🇺🇦", "kiev": "Ukraine 🇺🇦",
    "sweden": "Sweden 🇸🇪", "stockholm": "Sweden 🇸🇪",
    "finland": "Finland 🇫🇮", "helsinki": "Finland 🇫🇮",
    "israel": "Israel 🇮🇱", "tel aviv": "Israel 🇮🇱"
}

class CountryDetector:
    @staticmethod
    def detect(location: Optional[str]) -> str:
        """所在地文字列から、国名(国旗絵文字付)、または生の所在地テキストを判別して返す"""
        if not location:
            return "Global 🌐"

        loc_clean = location.strip()
        if not loc_clean:
            return "Global 🌐"

        loc_lower = loc_clean.lower()

        # 1. ロケーション文字列の中に辞書のキーワードが含まれているか部分一致スキャン
        for keyword, country_display in COUNTRY_MAP.items():
            if keyword in loc_lower:
                return country_display

        # 2. 辞書にヒットしない場合は、無機質なUnknownにせず、
        # オーナー自身が設定した生のLocationテキストをそのまま返して個性を残します。
        return loc_clean
