"""
Twilio SMS service for sending landslide alert notifications.

Sends an SMS to the configured phone number whenever a HIGH or MEDIUM
risk alert is generated and saved to history.
"""
from app.config import Config


def send_alert_sms(alert):
    """
    Send an SMS notification for a landslide alert.

    Args:
        alert: dict with keys like risk_level, zone_name, probability, timestamp
    """
    sid = Config.TWILIO_ACCOUNT_SID
    token = Config.TWILIO_AUTH_TOKEN
    from_number = Config.TWILIO_PHONE_NUMBER
    to_number = Config.ALERT_PHONE_NUMBER

    # Skip if Twilio is not configured
    print(f"  [SMS Debug] SID length: {len(sid) if sid else 0}, Token length: {len(token) if token else 0}")
    print(f"  [SMS Debug] From: {from_number}, To: {to_number}")
    if not all([sid, token, from_number, to_number]):
        print("  ⚠ Twilio not configured — skipping SMS")
        return False

    risk = alert.get('risk_level', 'UNKNOWN')
    zone = alert.get('zone_name', 'Unknown Location')
    prob = alert.get('probability', 0)
    emoji = '🔴' if risk == 'HIGH' else '🟡'

    message_body = (
        f"{emoji} LANDSLIDE ALERT — {risk} RISK\n\n"
        f"📍 Location: {zone}\n"
        f"📊 Probability: {prob}%\n"
        f"🕐 Time: {alert.get('timestamp', 'N/A')}\n"
        f"💡 Action: {alert.get('recommendation', 'Monitor closely')}\n\n"
        f"— Landslide AI v3.0"
    )

    try:
        from twilio.rest import Client
        client = Client(sid, token)
        msg = client.messages.create(
            body=message_body,
            from_=from_number,
            to=to_number,
        )
        print(f"  ✓ SMS sent to {to_number} (SID: {msg.sid})")
        return True
    except Exception as e:
        print(f"  ✗ SMS failed: {e}")
        return False
