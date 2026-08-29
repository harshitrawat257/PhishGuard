from config import (
    THRESHOLD_SAFE_MAX,
    THRESHOLD_LOW_RISK_MAX,
    THRESHOLD_SUSPICIOUS_MAX
)

def evaluate_risk(input_type: str, url_res: dict = None, msg_res: dict = None, redirect_res: dict = None, email_res: dict = None) -> dict:
    url_res = url_res or {"score": 0, "indicators": []}
    msg_res = msg_res or {"score": 0, "indicators": []}
    redirect_res = redirect_res or {"score": 0, "indicators": []}
    email_res = email_res or {"score": 0, "indicators": []}
    
    combined_indicators = []
    seen_indicator_names = set()
    
    def add_indicators(indicators_list):
        for ind in indicators_list:
            name = ind.get("name")
            if name not in seen_indicator_names:
                seen_indicator_names.add(name)
                combined_indicators.append(ind)
    
    domain_comparison = url_res.get("domain_comparison")
    download_info = url_res.get("download_info")
    redirect_chain = None

    if input_type == "url":
        add_indicators(url_res.get("indicators", []))
        add_indicators(redirect_res.get("indicators", []))
        if redirect_res.get("hops", 0) > 0 or url_res.get("is_shortened"):
            redirect_chain = {
                "original_url": url_res.get("raw_url", ""),
                "final_destination": redirect_res.get("final_url", url_res.get("raw_url", "")),
                "hops": redirect_res.get("hops", 0),
                "is_shortened": url_res.get("is_shortened", False)
            }

    elif input_type == "email":
        add_indicators(email_res.get("indicators", []))

    else: # input_type == "message"
        add_indicators(msg_res.get("indicators", []))
        
        embedded_url_res = msg_res.get("url_analysis")
        if embedded_url_res:
            add_indicators(embedded_url_res.get("indicators", []))
            add_indicators(redirect_res.get("indicators", []))
            if not domain_comparison:
                domain_comparison = embedded_url_res.get("domain_comparison")
            if not download_info:
                download_info = embedded_url_res.get("download_info")
            if redirect_res.get("hops", 0) > 0 or embedded_url_res.get("is_shortened"):
                redirect_chain = {
                    "original_url": embedded_url_res.get("raw_url", ""),
                    "final_destination": redirect_res.get("final_url", embedded_url_res.get("raw_url", "")),
                    "hops": redirect_res.get("hops", 0),
                    "is_shortened": embedded_url_res.get("is_shortened", False)
                }

    # Raw points sum across all unique active indicators
    raw_sum = sum(ind.get("score_impact", 0) for ind in combined_indicators)
    
    # Scale raw score sum (max ~55 pts) up to 100, clamped [0, 100]
    if raw_sum > 0:
        scaled_score = min(100, max(0, int(round((raw_sum / 55.0) * 100))))
    else:
        scaled_score = 0

    # Calculate dynamic category sub-scores based on detected indicators
    domain_subscore = sum(ind.get("score_impact", 0) for ind in combined_indicators if ind.get("category") == "domain")
    url_subscore = sum(ind.get("score_impact", 0) for ind in combined_indicators if ind.get("category") == "url")
    msg_subscore = sum(ind.get("score_impact", 0) for ind in combined_indicators if ind.get("category") == "message")
    redirect_subscore = sum(ind.get("score_impact", 0) for ind in combined_indicators if ind.get("category") == "redirect")
    email_subscore = sum(ind.get("score_impact", 0) for ind in combined_indicators if ind.get("category") == "email")

    category_scores = {
        "url_risk": min(100, int(round((url_subscore / 25) * 100))) if url_subscore > 0 else 0,
        "domain_risk": min(100, int(round((domain_subscore / 25) * 100))) if domain_subscore > 0 else 0,
        "message_risk": min(100, int(round((msg_subscore / 30) * 100))) if msg_subscore > 0 else 0,
        "redirect_risk": min(100, int(round((redirect_subscore / 15) * 100))) if redirect_subscore > 0 else 0,
        "email_risk": min(100, int(round((email_subscore / 30) * 100))) if email_subscore > 0 else 0
    }

    # Assign Risk Level based on thresholds
    if scaled_score <= THRESHOLD_SAFE_MAX:
        risk_level = "SAFE"
    elif scaled_score <= THRESHOLD_LOW_RISK_MAX:
        risk_level = "LOW RISK"
    elif scaled_score <= THRESHOLD_SUSPICIOUS_MAX:
        risk_level = "SUSPICIOUS"
    else:
        risk_level = "HIGH RISK"

    # Actionable Recommendation per specification
    if risk_level == "HIGH RISK":
        recommendation = "Do not click this link or provide passwords, OTPs, banking details, or other sensitive information. Visit the organization's official website or application manually."
    elif risk_level == "SUSPICIOUS":
        recommendation = "Verify the sender and destination domain before proceeding."
    elif risk_level == "LOW RISK":
        recommendation = "Some unusual characteristics were found. Confirm the sender before sharing sensitive information."
    else:
        recommendation = "No major phishing indicators were detected. This does not guarantee that the content is completely safe."

    # Filter out zero-impact indicators
    active_indicators = [ind for ind in combined_indicators if ind.get("score_impact", 0) > 0]

    return {
        "risk_score": scaled_score,
        "risk_level": risk_level,
        "category_scores": category_scores,
        "indicators": active_indicators,
        "recommendation": recommendation,
        "domain_comparison": domain_comparison,
        "download_info": download_info,
        "redirect_chain": redirect_chain,
        "parsed_headers": email_res.get("parsed_headers") if input_type == "email" else None
    }
