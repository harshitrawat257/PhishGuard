import httpx
import re
import ipaddress
from urllib.parse import urlparse

def is_ssrf_blocked_host(hostname: str) -> bool:
    """Checks if hostname is a internal/private IP or reserved domain to prevent SSRF vulnerabilities."""
    clean_host = hostname.split(":")[0].lower()
    
    if clean_host in ("localhost", "127.0.0.1", "::1", "metadata.google.internal"):
        return True
    if clean_host.endswith(".local") or clean_host.endswith(".internal"):
        return True
        
    try:
        ip = ipaddress.ip_address(clean_host)
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_multicast or ip.is_reserved:
            return True
    except ValueError:
        # Not a raw IP literal
        pass
        
    return False

async def analyze_redirects(url_string: str) -> dict:
    url_input = url_string.strip()
    if not url_input:
        return {"score": 0, "indicators": [], "hops": 0, "final_url": url_input}
        
    has_scheme = re.match(r"^https?://", url_input, re.IGNORECASE)
    target_url = url_input if has_scheme else f"http://{url_input}"
    
    parsed = urlparse(target_url)
    hostname = parsed.netloc.split(":")[0].lower()
    
    # SSRF Protection Check
    if is_ssrf_blocked_host(hostname):
        return {
            "score": 0,
            "indicators": [{
                "name": "Local Network Target (SSRF Shield)",
                "category": "redirect",
                "severity": "medium",
                "score_impact": 0,
                "description": "Outgoing HTTP redirect trace bypassed for local/private network host."
            }],
            "hops": 0,
            "final_url": target_url
        }

    indicators = []
    redirect_score = 0
    hop_count = 0
    final_url = target_url
    
    try:
        # Use httpx with short timeout to safely inspect redirects without executing payloads
        async with httpx.AsyncClient(timeout=3.0, follow_redirects=True, max_redirects=5) as client:
            try:
                response = await client.head(target_url, headers={"User-Agent": "PhishGuard-Analyzer/1.0"})
            except (httpx.HTTPStatusError, httpx.RequestError):
                response = await client.get(target_url, headers={"User-Agent": "PhishGuard-Analyzer/1.0"})
                
            history = response.history
            hop_count = len(history)
            final_url = str(response.url)
            
            if hop_count > 0:
                # 1. Multiple Redirect Hops
                if hop_count >= 2:
                    score_add = 12
                    redirect_score += score_add
                    indicators.append({
                        "name": "Multiple Redirect Hops",
                        "category": "redirect",
                        "severity": "high",
                        "score_impact": score_add,
                        "description": f"The URL performs {hop_count} redirect hops before landing on the final destination ('{final_url}')."
                    })
                elif hop_count == 1:
                    score_add = 6
                    redirect_score += score_add
                    indicators.append({
                        "name": "HTTP Redirect Detected",
                        "category": "redirect",
                        "severity": "low",
                        "score_impact": score_add,
                        "description": f"The link redirects to another destination: '{final_url}'."
                    })
                    
                # 2. Domain Jump / Cross-Domain Redirect
                initial_host = urlparse(target_url).netloc.split(":")[0].lower()
                final_host = urlparse(final_url).netloc.split(":")[0].lower()
                
                initial_domain = ".".join(initial_host.split(".")[-2:]) if "." in initial_host else initial_host
                final_domain = ".".join(final_host.split(".")[-2:]) if "." in final_host else final_host
                
                if initial_domain and final_domain and initial_domain != final_domain:
                    score_add = 10
                    redirect_score += score_add
                    indicators.append({
                        "name": "Cross-Domain Redirect Jump",
                        "category": "redirect",
                        "severity": "high",
                        "score_impact": score_add,
                        "description": f"The URL redirects from initial domain '{initial_domain}' to a different domain '{final_domain}'."
                    })
                    
                # 3. Protocol Downgrade (HTTPS to HTTP)
                if target_url.startswith("https://") and final_url.startswith("http://"):
                    score_add = 12
                    redirect_score += score_add
                    indicators.append({
                        "name": "SSL/TLS Protocol Downgrade",
                        "category": "redirect",
                        "severity": "high",
                        "score_impact": score_add,
                        "description": "The URL redirects from encrypted HTTPS to insecure HTTP."
                    })

    except httpx.TimeoutException:
        # Timeout safety fallback
        indicators.append({
            "name": "Redirect Analysis Timeout",
            "category": "redirect",
            "severity": "low",
            "score_impact": 0,
            "description": "The target domain took too long to respond during redirect verification (safely aborted after 3s)."
        })
    except Exception:
        # Non-fatal safe failure
        pass
        
    capped_score = min(20, redirect_score)
    
    return {
        "score": capped_score,
        "indicators": indicators,
        "hops": hop_count,
        "final_url": final_url
    }

