import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from analyzers.risk_engine import evaluate_risk

def test_safe_classification():
    risk = evaluate_risk("url", url_res={"score": 0, "indicators": []}, redirect_res={"score": 0, "indicators": []})
    assert risk["risk_score"] == 0
    assert risk["risk_level"] == "SAFE"

def test_high_risk_classification():
    url_res = {
        "score": 35,
        "indicators": [
            {"name": "IP Address", "category": "url", "score_impact": 18},
            {"name": "Brand Mismatch", "category": "domain", "score_impact": 16}
        ]
    }
    redirect_res = {
        "score": 15,
        "indicators": [
            {"name": "Cross-Domain Redirect", "category": "redirect", "score_impact": 10}
        ]
    }
    risk = evaluate_risk("url", url_res=url_res, redirect_res=redirect_res)
    assert risk["risk_score"] >= 76
    assert risk["risk_level"] == "HIGH RISK"

def test_score_bounding():
    # Test capping at 100 max
    url_res = {"score": 40, "indicators": [{"name": "A", "category": "url", "score_impact": 40}]}
    redirect_res = {"score": 20, "indicators": [{"name": "B", "category": "redirect", "score_impact": 20}]}
    risk = evaluate_risk("url", url_res=url_res, redirect_res=redirect_res)
    assert risk["risk_score"] == 100
