import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from analyzers.url_analyzer import analyze_url

def test_legitimate_url():
    res = analyze_url("https://www.google.com/search?q=test")
    assert res["score"] == 0
    assert len(res["indicators"]) == 0

def test_ip_address_url():
    res = analyze_url("http://192.168.1.1/login")
    assert any(ind["name"] == "IP Address Hostname" for ind in res["indicators"])
    assert res["score"] >= 15

def test_suspicious_tld_and_subdomains():
    res = analyze_url("http://paypal.com.verify-login.security-update.xyz/login")
    names = [ind["name"] for ind in res["indicators"]]
    assert "High-Risk Top-Level Domain (TLD)" in names
    assert "Excessive Subdomains" in names
    assert "Possible Brand Impersonation" in names or "Brand Name Mismatch" in names


def test_at_symbol_spoofing():
    res = analyze_url("http://google.com@evil-phish.com/auth")
    assert any(ind["name"] == "Userinfo '@' Symbol Spoofing" for ind in res["indicators"])

def test_hyphen_abuse_and_long_url():
    res = analyze_url("http://login-paypal-security-check-update-billing-verification.com/path1/path2/path3/path4/path5")
    assert any(ind["name"] == "Excessive Hyphens in Domain" for ind in res["indicators"])
    assert any(ind["name"] == "Unusually Long URL" for ind in res["indicators"])
