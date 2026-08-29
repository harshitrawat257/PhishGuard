import re
from urllib.parse import urlparse
from config import BRANDS

def analyze_email_header(raw_header_text: str) -> dict:
    text_input = raw_header_text.strip()
    if not text_input:
        return {
            "score": 0,
            "indicators": [],
            "parsed_headers": {}
        }
        
    indicators = []
    header_score = 0

    # Basic header extraction
    def extract_header_value(header_name: str) -> str:
        pattern = rf"^{header_name}:\s*(.+)$"
        match = re.search(pattern, text_input, re.MULTILINE | re.IGNORECASE)
        return match.group(1).strip() if match else ""

    from_header = extract_header_value("From")
    reply_to_header = extract_header_value("Reply-To")
    return_path_header = extract_header_value("Return-Path")
    auth_results_header = extract_header_value("Authentication-Results")
    spf_header = extract_header_value("Received-SPF")

    # Extract email addresses and domains
    def parse_email_and_domain(header_val: str):
        if not header_val:
            return "", "", ""
        # Match display name if present e.g. "PayPal Security" <security@domain.com>
        display_match = re.search(r"[\"']?([^\"'<]+)[\"']?\s*<([^>]+)>", header_val)
        if display_match:
            display_name = display_match.group(1).strip()
            email_addr = display_match.group(2).strip()
        else:
            display_name = ""
            email_addr = header_val.strip("<> ")

        domain_match = re.search(r"@([\w\.-]+\.[\w]+)", email_addr)
        domain = domain_match.group(1).lower() if domain_match else ""
        return display_name, email_addr, domain

    from_name, from_email, from_domain = parse_email_and_domain(from_header)
    reply_name, reply_email, reply_domain = parse_email_and_domain(reply_to_header)
    return_name, return_email, return_domain = parse_email_and_domain(return_path_header)

    parsed_headers = {
        "from": from_header,
        "from_domain": from_domain,
        "reply_to_domain": reply_domain,
        "return_path_domain": return_domain
    }

    # 1. From vs Reply-To Domain Mismatch
    if from_domain and reply_domain and from_domain != reply_domain:
        score_add = 15
        header_score += score_add
        indicators.append({
            "name": "Sender Domain Mismatch",
            "category": "email",
            "severity": "high",
            "score_impact": score_add,
            "description": f"The visible sender address ('{from_domain}') and Reply-To address ('{reply_domain}') use different domains."
        })

    # 2. From vs Return-Path Domain Mismatch
    if from_domain and return_domain and from_domain != return_domain:
        score_add = 12
        header_score += score_add
        indicators.append({
            "name": "Return-Path Domain Mismatch",
            "category": "email",
            "severity": "medium",
            "score_impact": score_add,
            "description": f"The visible sender domain ('{from_domain}') differs from Return-Path bounce domain ('{return_domain}')."
        })

    # Combine header text for authentication checks
    full_text_lower = text_input.lower()

    # 3. SPF Failed Check
    if "spf=fail" in full_text_lower or "spf=softfail" in full_text_lower or (spf_header and "fail" in spf_header.lower()):
        score_add = 15
        header_score += score_add
        indicators.append({
            "name": "SPF Failed",
            "category": "email",
            "severity": "high",
            "score_impact": score_add,
            "description": "The sending server was not authorized by the domain's SPF policy."
        })

    # 4. DKIM Failed Check
    if "dkim=fail" in full_text_lower:
        score_add = 12
        header_score += score_add
        indicators.append({
            "name": "DKIM Failed",
            "category": "email",
            "severity": "medium",
            "score_impact": score_add,
            "description": "The email's digital signature could not be validated."
        })

    # 5. DMARC Failed Check
    if "dmarc=fail" in full_text_lower:
        score_add = 18
        header_score += score_add
        indicators.append({
            "name": "DMARC Failed",
            "category": "email",
            "severity": "high",
            "score_impact": score_add,
            "description": "The sender failed domain-based email authentication (DMARC)."
        })

    # 6. Display Name Brand Impersonation
    if from_name:
        for brand, official_domains in BRANDS.items():
            if brand.lower() in from_name.lower():
                is_official = any(from_domain == off_dom or from_domain.endswith(f".{off_dom}") for off_dom in official_domains)
                if not is_official:
                    score_add = 15
                    header_score += score_add
                    indicators.append({
                        "name": "Display Name Impersonation",
                        "category": "email",
                        "severity": "high",
                        "score_impact": score_add,
                        "description": f"The sender display name mentions '{from_name}' but the email domain is '{from_domain}'."
                    })
                    break

    capped_score = min(50, header_score)

    return {
        "score": capped_score,
        "indicators": indicators,
        "parsed_headers": parsed_headers
    }
