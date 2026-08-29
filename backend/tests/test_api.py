import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from main import app
from analyzers.risk_engine import evaluate_risk

client = TestClient(app)

def test_01_normal_example_domain():
    res = client.post("/analyze/url", json={"url": "https://example.com"})
    assert res.status_code == 200
    data = res.json()
    assert data["risk_level"] == "SAFE"

def test_02_very_long_url():
    long_url = "https://example.com/" + "a" * 80
    res = client.post("/analyze/url", json={"url": long_url})
    assert res.status_code == 200
    indicators = [i["name"] for i in res.json()["indicators"]]
    assert "Unusually Long URL" in indicators

def test_03_ip_address_url():
    res = client.post("/analyze/url", json={"url": "http://192.168.1.1/login"})
    assert res.status_code == 200
    indicators = [i["name"] for i in res.json()["indicators"]]
    assert "IP Address Hostname" in indicators

def test_04_url_with_at_symbol():
    res = client.post("/analyze/url", json={"url": "http://google.com@evil-site.com"})
    assert res.status_code == 200
    indicators = [i["name"] for i in res.json()["indicators"]]
    assert "Userinfo '@' Symbol Spoofing" in indicators

def test_05_encoded_url():
    res = client.post("/analyze/url", json={"url": "http://example.com/%20%21%23%24"})
    assert res.status_code == 200
    indicators = [i["name"] for i in res.json()["indicators"]]
    assert "Percent-Encoded Obfuscation" in indicators

def test_06_brand_lookalike_domain():
    res = client.post("/analyze/url", json={"url": "http://paypa1-secure-login.test/account/verify"})
    assert res.status_code == 200
    data = res.json()
    indicators = [i["name"] for i in data["indicators"]]
    assert "Possible Brand Impersonation" in indicators
    assert data["risk_level"] in ["SUSPICIOUS", "HIGH RISK"]

def test_07_english_urgency_message():
    res = client.post("/analyze/message", json={"message": "Act immediately! Your service will expire today."})
    assert res.status_code == 200
    indicators = [i["name"] for i in res.json()["indicators"]]
    assert "Urgency Language" in indicators

def test_08_hinglish_urgency_message():
    res = client.post("/analyze/message", json={"message": "Turant verify karo varna account suspend ho jayega."})
    assert res.status_code == 200
    indicators = [i["name"] for i in res.json()["indicators"]]
    assert "Urgency Language" in indicators or "Account Suspension Threat" in indicators

def test_09_otp_request():
    res = client.post("/analyze/message", json={"message": "OTP share karo immediately to complete verification."})
    assert res.status_code == 200
    indicators = [i["name"] for i in res.json()["indicators"]]
    assert "Credential & OTP Request" in indicators

def test_10_prize_scam():
    res = client.post("/analyze/message", json={"message": "Congratulations! You won a lottery of $1,000. Claim your reward now."})
    assert res.status_code == 200
    indicators = [i["name"] for i in res.json()["indicators"]]
    assert "Prize or Reward Scam Pattern" in indicators

def test_11_account_suspension():
    res = client.post("/analyze/message", json={"message": "Your SBI account block ho jayega within 24 hours."})
    assert res.status_code == 200
    indicators = [i["name"] for i in res.json()["indicators"]]
    assert "Account Suspension Threat" in indicators

def test_12_message_containing_suspicious_url():
    res = client.post("/analyze/message", json={"message": "Your account is blocked. Verify at http://paypa1-secure.test"})
    assert res.status_code == 200
    data = res.json()
    assert len(data["indicators"]) >= 2

def test_13_empty_input_validation():
    res1 = client.post("/analyze/url", json={"url": "   "})
    assert res1.status_code == 400
    res2 = client.post("/analyze/message", json={"message": ""})
    assert res2.status_code == 400

def test_14_malformed_url_handling():
    res = client.post("/analyze/url", json={"url": "httptp:///not-a-valid-url"})
    assert res.status_code == 200
    assert "risk_score" in res.json()

def test_16_email_header_matching_sender():
    header = 'From: "Legit Support" <support@example.com>\nReply-To: support@example.com\nAuthentication-Results: spf=pass; dkim=pass;'
    res = client.post("/analyze/email-header", json={"header_text": header})
    assert res.status_code == 200
    assert res.json()["risk_level"] == "SAFE"

def test_17_email_header_mismatch_and_auth_fail():
    header = 'From: "PayPal Security" <security@example.test>\nReply-To: support@different-phish.test\nReturn-Path: bounce@unknown-sender.test\nAuthentication-Results: spf=fail; dkim=fail; dmarc=fail;'
    res = client.post("/analyze/email-header", json={"header_text": header})
    assert res.status_code == 200
    data = res.json()
    indicators = [i["name"] for i in data["indicators"]]
    assert "Sender Domain Mismatch" in indicators
    assert "SPF Failed" in indicators
    assert "DMARC Failed" in indicators

def test_18_shortener_url_detection():
    res = client.post("/analyze/url", json={"url": "https://bit.ly/example-test"})
    assert res.status_code == 200
    indicators = [i["name"] for i in res.json()["indicators"]]
    assert "Shortened URL Service" in indicators

def test_19_file_download_detection():
    res1 = client.post("/analyze/url", json={"url": "https://secure-update.test/KYC_Update.apk"})
    assert res1.status_code == 200
    assert any(i["name"] == "Executable Download Detected" for i in res1.json()["indicators"])

    res2 = client.post("/analyze/url", json={"url": "https://secure-update.test/statement.zip"})
    assert res2.status_code == 200
    assert any(i["name"] == "Archive Download Detected" for i in res2.json()["indicators"])

import uuid

def test_21_signup_and_login():
    unique_email = f"pratham.test_{uuid.uuid4().hex[:8]}@example.com"
    signup_data = {
        "name": "Pratham",
        "email": unique_email,
        "password": "Password123",
        "preferred_language": "en"
    }
    res = client.post("/auth/signup", json=signup_data)
    assert res.status_code == 200
    res_data = res.json()
    assert "access_token" in res_data
    assert res_data["user"]["name"] == "Pratham"

    # Duplicate signup fails
    res_dup = client.post("/auth/signup", json=signup_data)
    assert res_dup.status_code == 400

    # Login with wrong password
    res_wrong = client.post("/auth/login", json={"email": unique_email, "password": "wrongpassword"})
    assert res_wrong.status_code == 401

    # Login with correct password
    res_login = client.post("/auth/login", json={"email": unique_email, "password": signup_data["password"]})
    assert res_login.status_code == 200
    token = res_login.json()["access_token"]

    # Verify /auth/me
    headers = {"Authorization": f"Bearer {token}"}
    res_me = client.get("/auth/me", headers=headers)
    assert res_me.status_code == 200
    assert res_me.json()["email"] == unique_email

def test_22_authenticated_scan_history_isolation():
    unique_email = f"isolation.test_{uuid.uuid4().hex[:8]}@example.com"
    signup_res = client.post("/auth/signup", json={
        "name": "IsolationUser",
        "email": unique_email,
        "password": "Password123"
    })
    token = signup_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    scan_res = client.post("/analyze/url", json={"url": "https://auth-test.example.com"}, headers=headers)
    assert scan_res.status_code == 200

    hist_res = client.get("/history", headers=headers)
    assert hist_res.status_code == 200
    assert len(hist_res.json()) >= 1
    assert hist_res.json()[0]["input_text"] == "https://auth-test.example.com"





