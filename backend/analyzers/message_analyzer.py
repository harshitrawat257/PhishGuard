import re
from analyzers.url_analyzer import analyze_url

# Regex patterns for social engineering indicators (English, Hinglish, & Devanagari Hindi)

URGENCY_PATTERNS = [
    # Hinglish & Devanagari Hindi Urgency
    (r"\b(abhi|turant|jaldi|abhi verify|turant click|10 minute me|aaj hi|तुरंत|अभी|जल्दी)\b", 15, "high"),
    # English Urgency
    (r"\b(immediately|urgent|urgently|act now|within 24 hours|within 12 hours|suspended today|due today|act today|expire today|expires today|final notice|final warning|expire|expires|limited time)\b", 12, "high"),
    (r"\b(asap|instant|hurry|last chance|before it'?s too late)\b", 8, "medium")
]

THREAT_PATTERNS = [
    # Hinglish & Devanagari Hindi Threat / Suspension
    (r"\b(account block|account suspend|account band|kyc expire|kyc expired|service deactivate|block ho|band ho|खाता बंद|ब्लॉक|अमान्य)\b", 15, "high"),
    # English Threats
    (r"\b(suspend|suspended|suspension|terminate|terminated|lock|locked|block|blocked|deactivate|deactivated|restrict|restricted|close|closed|legal action|police|warrant)\b", 14, "high"),
    (r"\b(unauthorized access|security breach|suspicious activity|fraudulent|unusual login)\b", 10, "high")
]

CREDENTIAL_PATTERNS = [
    # Hinglish & Devanagari Hindi Credential / OTP Requests
    (r"\b(otp share|password bhejo|pin enter|cvv|login details|verification code|bhejo|share karo|ओटीपी|पासवर्ड|पिन|सत्यापन)\b", 15, "high"),
    # English Credentials
    (r"\b(password|passcode|otp|one time password|pin|ssn|social security|credit card|cvv|banking details|billing details|login details|credentials)\b", 15, "high"),
    (r"\b(verify your account|confirm your identity|update billing|enter details|re-enter)\b", 12, "high")
]

PAYMENT_PATTERNS = [
    # Hinglish & Devanagari Payment Scams
    (r"\b(payment failed|refund claim|processing fee|paisa bhejo|upi payment|bank details|भुगतान|पैसे|रिफंड)\b", 12, "high"),
    # English Payments
    (r"\b(pay now|overdue|unpaid invoice|tax due|customs fee|wire transfer|gift card|crypto|bitcoin|refund pending)\b", 10, "medium")
]

PRIZE_PATTERNS = [
    # Hinglish & Devanagari Prize Scams
    (r"\b(prize jeeta|lottery|cashback mila|reward claim|free gift|इनाम|लॉटरी|जीत गए|पुरस्कार)\b", 12, "high"),
    # English Prizes
    (r"\b(you won|congratulations|selected winner|claim your|free reward|lottery|prize|cash reward|\$1,?000|\$5,?000|\$10,?000)\b", 12, "high")
]

VERIFICATION_PATTERNS = [
    # Hinglish & Devanagari Verification
    (r"\b(kyc update|identity verify|account verify|link par click|satyapan|सत्यापन|अपडेट)\b", 12, "high")
]

GREETING_PATTERNS = [
    (r"^\s*(dear (customer|user|client|member|account holder|sir/madam)|valued customer)\b", 6, "low")
]

# URL Extractor Regex
URL_REGEX = re.compile(r"https?://[^\s<\"'>]+|www\.[^\s<\"'>]+|\b[a-zA-Z0-9.-]+\.(?:com|net|org|xyz|top|site|online|info|tech|tk|ml|ga|cf|gq|work|click|zip)/[^\s<\"'>]*")

def analyze_message(message_text: str) -> dict:
    text_input = message_text.strip()
    if not text_input:
        return {
            "score": 0,
            "indicators": [],
            "extracted_urls": [],
            "url_analysis": None
        }
        
    text_lower = text_input.lower()
    indicators = []
    message_score = 0
    
    # 1. Urgency & Time Pressure (English, Hindi, Hinglish)
    urgency_detected = False
    for pattern, score_add, severity in URGENCY_PATTERNS:
        matches = re.findall(pattern, text_lower)
        if matches and not urgency_detected:
            urgency_detected = True
            message_score += score_add
            indicators.append({
                "name": "Urgency Language",
                "category": "message",
                "severity": severity,
                "score_impact": score_add,
                "description": "The message pressures the user to take immediate action using urgency indicators."
            })

    # 2. Account Suspension & Threats (English, Hindi, Hinglish)
    threat_detected = False
    for pattern, score_add, severity in THREAT_PATTERNS:
        matches = re.findall(pattern, text_lower)
        if matches and not threat_detected:
            threat_detected = True
            message_score += score_add
            indicators.append({
                "name": "Account Suspension Threat",
                "category": "message",
                "severity": severity,
                "score_impact": score_add,
                "description": "The message threatens that the user's account may be blocked or suspended, which is a common social-engineering tactic."
            })

    # 3. Credential & OTP Harvesting (English, Hindi, Hinglish)
    credential_detected = False
    for pattern, score_add, severity in CREDENTIAL_PATTERNS:
        matches = re.findall(pattern, text_lower)
        if matches and not credential_detected:
            credential_detected = True
            message_score += score_add
            indicators.append({
                "name": "Credential & OTP Request",
                "category": "message",
                "severity": severity,
                "score_impact": score_add,
                "description": "The message requests passwords, OTPs, PINs, or sensitive identity/banking verification details."
            })

    # 4. Payment / Overdue Fee Scams (English, Hindi, Hinglish)
    payment_detected = False
    for pattern, score_add, severity in PAYMENT_PATTERNS:
        matches = re.findall(pattern, text_lower)
        if matches and not payment_detected:
            payment_detected = True
            message_score += score_add
            indicators.append({
                "name": "Financial & Payment Demand",
                "category": "message",
                "severity": severity,
                "score_impact": score_add,
                "description": "The message demands unexpected money transfers, UPI payments, or fee claims."
            })

    # 5. Prize / Lottery Scams (English, Hindi, Hinglish)
    prize_detected = False
    for pattern, score_add, severity in PRIZE_PATTERNS:
        matches = re.findall(pattern, text_lower)
        if matches and not prize_detected:
            prize_detected = True
            message_score += score_add
            indicators.append({
                "name": "Prize or Reward Scam Pattern",
                "category": "message",
                "severity": severity,
                "score_impact": score_add,
                "description": "The message claims unexpected lottery winnings, cash rewards, or gift card claims."
            })

    # 6. Actionable Verification Requests
    verification_detected = False
    for pattern, score_add, severity in VERIFICATION_PATTERNS:
        matches = re.findall(pattern, text_lower)
        if matches and not verification_detected:
            verification_detected = True
            message_score += score_add
            indicators.append({
                "name": "Unsolicited Verification Request",
                "category": "message",
                "severity": severity,
                "score_impact": score_add,
                "description": "The message urges mandatory KYC or account verification to prevent service disruption."
            })

    # 7. Generic Impersonal Greeting
    for pattern, score_add, severity in GREETING_PATTERNS:
        if re.search(pattern, text_lower):
            message_score += score_add
            indicators.append({
                "name": "Generic Impersonal Greeting",
                "category": "message",
                "severity": severity,
                "score_impact": score_add,
                "description": "The message uses a generic greeting ('Dear Customer') instead of addressing the recipient by name."
            })
            break

    # 8. Embedded URL Extraction and Sub-Analysis
    extracted_raw_urls = URL_REGEX.findall(text_input)
    url_analysis_result = None
    
    if extracted_raw_urls:
        first_url = extracted_raw_urls[0]
        url_analysis_result = analyze_url(first_url)
        
        indicators.append({
            "name": "Embedded Link Present",
            "category": "message",
            "severity": "medium",
            "score_impact": 5,
            "description": f"The message contains an embedded link pointing to '{first_url}'."
        })
        message_score += 5

    capped_score = min(40, message_score)

    return {
        "score": capped_score,
        "indicators": indicators,
        "extracted_urls": extracted_raw_urls,
        "url_analysis": url_analysis_result
    }

