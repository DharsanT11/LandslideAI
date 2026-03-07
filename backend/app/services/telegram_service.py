"""
Telegram Bot service for sending landslide alert notifications.

Sends a Telegram message to the configured CHAT_ID whenever a HIGH or MEDIUM
risk alert is generated and saved to history.
"""
import requests
from app.config import Config

def send_telegram_alert(alert):
    """
    Send a Telegram push notification for a landslide alert.

    Args:
        alert: dict with keys like risk_level, zone_name, probability, timestamp
    """
    token = Config.TELEGRAM_BOT_TOKEN
    chat_id = Config.TELEGRAM_CHAT_ID

    # Skip if Telegram is not fully configured
    if not all([token, chat_id]):
        print("  ⚠ Telegram not fully configured (missing token or chat_id) — skipping message")
        return False

    risk = alert.get('risk_level', 'UNKNOWN')
    zone = alert.get('zone_name', 'Unknown Location')
    prob = alert.get('probability', 0)
    emoji = '🔴' if risk == 'HIGH' else '🟡'

    message_body = (
        f"{emoji} *LANDSLIDE ALERT — {risk} RISK*\n\n"
        f"📍 *Location:* {zone}\n"
        f"📊 *Probability:* {prob}%\n"
        f"🕐 *Time:* {alert.get('timestamp', 'N/A')}\n"
        f"💡 *Action:* {alert.get('recommendation', 'Monitor closely')}\n\n"
        f"— *Landslide AI v3.0*"
    )

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message_body,
        "parse_mode": "Markdown"
    }

    try:
        resp = requests.post(url, json=payload, timeout=5)
        resp.raise_for_status()
        print(f"  ✓ Telegram message sent to {chat_id}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"  ✗ Telegram failed: {e}")
        # Print the response body if available for easier debugging
        if hasattr(e, 'response') and e.response is not None:
             print(f"    Reason: {e.response.text}")
        return False
