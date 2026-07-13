import os

# 📁 ディレクトリとファイルパスの設定
DATA_DIR = "data"
ETAGS_PATH = os.path.join(DATA_DIR, "etags.json")
DATA_PATH = os.path.join(DATA_DIR, "data.json")
TARGETS_PATH = "targets.txt"

# 😂 エンジニア文化特有のクスッとするラベルを見分けるためのフィルター辞書
FUNNY_LABEL_KEYWORDS = {
    "wontfix", "it-works-on-my-machine", "bikeshedding", "shame", "facepalm",
    "magic", "voodoo", "user-error", "pebkac", "picnic", "id10t", "layer-8",
    "design-flaw", "not-a-bug", "works-for-me", "spaghetti", "dumpster-fire"
}

# 🔎 自動探索（Discovery）の設定 (ギークファースト・グローバルスコープ)
DISCOVERY_STARS = 300
DISCOVERY_LANGUAGES = [
    "python", "go", "rust", "zig", "nim", "cpp", "c", 
    "haskell", "ocaml", "clojure", "elixir", "julia", 
    "shell", "lua", "typescript", "javascript", "ruby", 
    "scala", "swift", "kotlin", "dart", "csharp", "java"
]

# 🛡️ 許容するオープンソースライセンス (Python側のフィルタリング用)
ALLOWED_LICENSES = ["mit", "apache-2.0"]
