import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from analyzers.message_analyzer import analyze_message

def test_legitimate_message():
    res = analyze_message("Hi Sarah, see you at the coffee shop at 4 PM today!")
    assert res["score"] == 0
    assert len(res["indicators"]) == 0

def test_urgency_and_threat_message():
    msg = "ALERT: Your account will be suspended within 24 hours. Act immediately to prevent locking."
    res = analyze_message(msg)
    names = [ind["name"] for ind in res["indicators"]]
    assert "Urgency Language" in names or "Urgency & Time Pressure" in names
    assert "Account Suspension Threat" in names or "Account Suspension & Threat Language" in names

def test_credential_and_otp_request():
    msg = "Dear Customer, please verify your account and enter your password and OTP immediately."
    res = analyze_message(msg)
    names = [ind["name"] for ind in res["indicators"]]
    assert "Credential & OTP Request" in names or "Credential & Sensitive Info Request" in names
    assert "Generic Impersonal Greeting" in names

def test_prize_scam_message():
    msg = "Congratulations! You won a free $1,000 gift card! Claim your reward immediately."
    res = analyze_message(msg)
    names = [ind["name"] for ind in res["indicators"]]
    assert "Prize or Reward Scam Pattern" in names

