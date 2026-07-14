import os
import httpx
from datetime import datetime, timedelta, timezone

class DiscordNotifier:
    def __init__(self):
        self.webhook_url = os.environ.get("DISCORD_WEBHOOK_URL")

    def send_summary(
        self,
        total_targets: int,
        updated_count: int,
        removed_count: int,
        stale_removed_count: int,
        rate_remaining: int,
        safety_brake_triggered: bool
    ):
        """DiscordのWebhookにリッチなEmbedメッセージで実行サマリーを送信"""
        if not self.webhook_url:
            # Webhook URLが登録されていない場合は警告を出さずに何もしない (オプトイン設計)
            print("[Notifier] DISCORD_WEBHOOK_URL is not set. Skipping Discord notification.")
            return

        # 日本時間 (UTC+9) のタイムスタンプを生成
        jst = timezone(timedelta(hours=9))
        now_jst = datetime.now(jst).strftime("%Y-%m-%d %H:%M:%S")

        # ステータスごとのカラーと表示文言の設定
        if safety_brake_triggered:
            status_text = "⚠️ 安全ブレーキ (次回バッチへキャリーオーバー)"
            color = 0xf1c40f  # 黄色
        else:
            status_text = "🟢 正常完了 (全ターゲット同期済)"
            color = 0x2ecc71  # 緑色

        # Discord Webhook のリッチな Embed カードペイロード
        payload = {
            "username": "OSS Gem Crawler Bot",
            "avatar_url": "https://raw.githubusercontent.com/github/explore/main/topics/github/github.png",
            "embeds": [
                {
                    "title": "🚀 OSS Gem Crawler - 実行完了サマリー",
                    "description": "データの定期収集ジョブが完了しました。現在のステータスは以下の通りです。",
                    "color": color,
                    "fields": [
                        {
                            "name": "📊 実行ステータス",
                            "value": status_text,
                            "inline": False
                        },
                        {
                            "name": "📂 データベース総登録数",
                            "value": f"`{total_targets}` 件",
                            "inline": True
                        },
                        {
                            "name": "🔄 今回更新されたリポジトリ数",
                            "value": f"`{updated_count}` 件",
                            "inline": True
                        },
                        {
                            "name": "🧼 クレンジング数 (404/非公開)",
                            "value": f"`{removed_count}` 件",
                            "inline": True
                        },
                        {
                            "name": "🍂 新陳代謝パージ数 (2年無活動)",
                            "value": f"`{stale_removed_count}` 件",
                            "inline": True
                        },
                        {
                            "name": "🔑 API残り制限枠",
                            "value": f"`{rate_remaining}` 回",
                            "inline": True
                        },
                        {
                            "name": "⏰ 完了時刻 (JST)",
                            "value": now_jst,
                            "inline": True
                        }
                    ],
                    "footer": {
                        "text": "OSS Trend & Gem Finder | Powered by GitHub Actions",
                        "icon_url": "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                    }
                }
            ]
        }

        try:
            response = httpx.post(self.webhook_url, json=payload, timeout=10.0)
            if response.status_code == 204:
                print("[Notifier] Discord notification sent successfully.")
            else:
                print(f"[Notifier] Failed to send Discord notification: Status {response.status_code}")
        except Exception as e:
            print(f"[Notifier] Error sending Discord notification: {e}")
