import re
import difflib
from urllib.parse import urlparse, unquote
from config import (
    BRANDS,
    LEET_MAP,
    SUSPICIOUS_TLDS,
    SUSPICIOUS_URL_KEYWORDS,
    SUSPICIOUS_ACTION_KEYWORDS
)
from analyzers.file_analyzer import analyze_download_link

IP_REGEX = re.compile(r"^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$")

SHORTENER_DOMAINS = {
    "bit.ly", "tinyurl.com", "t.co", "is.gd",
    "buff.ly", "cutt.ly", "shorturl.at", "ow.ly", "rb.gy"
}

def normalize_leetspeak(text: str) -> str:
    """Replaces common leetspeak homoglyphs (0->o, 1->l, 3->e, 5->s, etc.) with standard characters."""
    normalized = text.replace("rn", "m")
    return "".join(LEET_MAP.get(ch, ch) for ch in normalized)

def analyze_url(url_string: str) -> dict:
    url_input = url_string.strip()
    if not url_input:
        return {"raw_url": "", "score": 0, "indicators": [], "domain_comparison": None, "download_info": None, "is_shortened": False}
    
    # Auto-prepend http:// if missing scheme for parsing
    has_scheme = re.match(r"^https?://", url_input, re.IGNORECASE)
    parse_target = url_input if has_scheme else f"http://{url_input}"
    
    parsed = urlparse(parse_target)
    netloc = parsed.netloc or parsed.path.split("/")[0]
    
    hostname = netloc.split(":")[0].lower()
    path = parsed.path.lower()
    full_str = url_input.lower()
    
    indicators = []
    total_url_score = 0
    
    # 0. Shortened URL Detection
    is_shortened = False
    clean_host = hostname.lower()
    if clean_host in SHORTENER_DOMAINS or any(clean_host.endswith(f".{d}") for d in SHORTENER_DOMAINS):
        is_shortened = True
        score_add = 10
        total_url_score += score_add
        indicators.append({
            "name": "Shortened URL Service",
            "category": "url",
            "severity": "medium",
            "score_impact": score_add,
            "description": "Uses a URL shortening service which obscures the real destination host."
        })

    # 1. IP Address Hostname
    if IP_REGEX.match(hostname):
        score_add = 18
        total_url_score += score_add
        indicators.append({
            "name": "IP Address Hostname",
            "category": "url",
            "severity": "high",
            "score_impact": score_add,
            "description": f"The URL uses an IP address ('{hostname}') instead of a standard domain name to obscure its destination."
        })
        
    # 2. Presence of '@' Symbol (Userinfo Spoofing)
    if "@" in parse_target:
        score_add = 15
        total_url_score += score_add
        indicators.append({
            "name": "Userinfo '@' Symbol Spoofing",
            "category": "url",
            "severity": "high",
            "score_impact": score_add,
            "description": "The URL contains an '@' symbol, which causes browsers to ignore preceding characters and navigate to an untrusted host."
        })

    # 3. Domain & Subdomain Structure
    domain_parts = [p for p in hostname.split(".") if p]
    subdomain_count = max(0, len(domain_parts) - 2) if len(domain_parts) >= 2 else 0
    
    if subdomain_count >= 3:
        score_add = 12
        total_url_score += score_add
        indicators.append({
            "name": "Excessive Subdomains",
            "category": "domain",
            "severity": "high",
            "score_impact": score_add,
            "description": f"The domain has {subdomain_count + 1} subdomain levels ('{hostname}'), often used to disguise fake sites as legitimate domains."
        })
    elif subdomain_count == 2:
        score_add = 6
        total_url_score += score_add
        indicators.append({
            "name": "Multiple Subdomains",
            "category": "domain",
            "severity": "medium",
            "score_impact": score_add,
            "description": f"The URL uses multiple subdomain levels ('{hostname}')."
        })

    # 4. Suspicious TLD / Top-Level Domain
    tld_match = False
    for stld in SUSPICIOUS_TLDS:
        if hostname.endswith(stld):
            tld_match = True
            score_add = 14
            total_url_score += score_add
            indicators.append({
                "name": "High-Risk Top-Level Domain (TLD)",
                "category": "domain",
                "severity": "high",
                "score_impact": score_add,
                "description": f"The URL uses a high-risk TLD ('{stld}') frequently associated with low-cost disposable phishing domains."
            })
            break

    # 5. Brand Impersonation & Side-by-Side Domain Comparison
    registered_domain = ".".join(domain_parts[-2:]) if len(domain_parts) >= 2 else hostname
    normalized_hostname = normalize_leetspeak(hostname)
    normalized_full_str = normalize_leetspeak(full_str)
    
    brand_impersonation_detected = False
    domain_comparison = None
    
    for brand, official_domains in BRANDS.items():
        if brand_impersonation_detected:
            break
            
        is_official = any(
            registered_domain == off_dom or registered_domain.endswith(f".{off_dom}")
            for off_dom in official_domains
        )
        
        if is_official:
            continue
            
        brand_in_hostname = (brand in hostname) or (brand in normalized_hostname)
        brand_in_url = (brand in full_str) or (brand in normalized_full_str)
        
        fuzzy_match = False
        best_ratio = 0.0
        for part in re.split(r"[-._]", normalized_hostname):
            if len(part) >= 4 and len(brand) >= 4:
                ratio = difflib.SequenceMatcher(None, brand, part).ratio()
                if ratio > best_ratio:
                    best_ratio = ratio
                if 0.80 <= ratio < 1.0:
                    fuzzy_match = True
                    break
        
        if brand_in_hostname or brand_in_url or fuzzy_match:
            brand_impersonation_detected = True
            score_add = 20
            total_url_score += score_add
            indicators.append({
                "name": "Possible Brand Impersonation",
                "category": "domain",
                "severity": "high",
                "score_impact": score_add,
                "description": f"The domain resembles {brand.title()} but does not appear to be an official {brand.title()} domain."
            })

            # Build Domain Side-by-Side Comparison details
            official_dom = official_domains[0]
            sim_calc = int(round(best_ratio * 100)) if best_ratio > 0 else (92 if brand_in_hostname else 85)
            domain_comparison = {
                "submitted_domain": registered_domain,
                "official_domain": official_dom,
                "brand": brand.title(),
                "similarity": min(99, max(60, sim_calc))
            }

    # 6. Hyphen Abuse in Domain
    hyphen_count = hostname.count("-")
    if hyphen_count >= 3:
        score_add = 10
        total_url_score += score_add
        indicators.append({
            "name": "Excessive Hyphens in Domain",
            "category": "domain",
            "severity": "medium",
            "score_impact": score_add,
            "description": f"The domain contains {hyphen_count} hyphens ('{hostname}'), a common tactic in typo-squatted phishing links."
        })

    # 7. Sensitive Auth/Security Keywords
    matched_keywords = [kw for kw in SUSPICIOUS_URL_KEYWORDS if kw in path or kw in hostname]
    if matched_keywords:
        score_add = 8 if len(matched_keywords) == 1 else 12
        total_url_score += score_add
        indicators.append({
            "name": "Authentication & Security Keywords",
            "category": "url",
            "severity": "medium" if len(matched_keywords) == 1 else "high",
            "score_impact": score_add,
            "description": f"The URL contains sensitive targets/keywords: {', '.join(matched_keywords)}."
        })

    # 8. URL Length & Path Depth
    if len(url_input) > 75:
        score_add = 7
        total_url_score += score_add
        indicators.append({
            "name": "Unusually Long URL",
            "category": "url",
            "severity": "low",
            "score_impact": score_add,
            "description": f"The URL is exceptionally long ({len(url_input)} chars), often used to hide the true target domain on mobile browsers."
        })
        
    path_depth = len([segment for segment in path.split("/") if segment])
    if path_depth >= 4:
        score_add = 5
        total_url_score += score_add
        indicators.append({
            "name": "Excessive Path Segments",
            "category": "url",
            "severity": "low",
            "score_impact": score_add,
            "description": f"The URL path contains {path_depth} deep subdirectories, increasing obfuscation."
        })

    # 9. Encoded / Hex Characters in Path
    if "%" in path or "%" in netloc:
        decoded = unquote(url_input)
        if decoded != url_input:
            score_add = 6
            total_url_score += score_add
            indicators.append({
                "name": "Percent-Encoded Obfuscation",
                "category": "url",
                "severity": "low",
                "score_impact": score_add,
                "description": "The URL contains percent-encoded characters used to bypass simple text-based filters."
            })

    # 10. File Download Analysis Integration
    file_res = analyze_download_link(url_input)
    if file_res and file_res.get("indicators"):
        indicators.extend(file_res["indicators"])
        total_url_score += file_res["score"]

    download_info = file_res.get("download_info") if file_res else None

    # Cap maximum URL sub-score at 45 points
    capped_score = min(45, total_url_score)

    return {
        "raw_url": url_input,
        "hostname": hostname,
        "score": capped_score,
        "indicators": indicators,
        "domain_comparison": domain_comparison,
        "download_info": download_info,
        "is_shortened": is_shortened
    }
