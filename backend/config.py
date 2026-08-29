import os

# Base Scoring Weights (Maximum contribution per category)
MAX_URL_RISK_SCORE = 40
MAX_MESSAGE_RISK_SCORE = 40
MAX_REDIRECT_RISK_SCORE = 20

# Classification Thresholds
# 0–25 = SAFE
# 26–50 = LOW RISK
# 51–75 = SUSPICIOUS
# 76–100 = HIGH RISK
THRESHOLD_SAFE_MAX = 25
THRESHOLD_LOW_RISK_MAX = 50
THRESHOLD_SUSPICIOUS_MAX = 75

# Brand Impersonation Database with official domains
BRANDS = {
    "paypal": ["paypal.com", "paypal.me", "paypal-corp.com"],
    "google": ["google.com", "google.co.in", "youtube.com", "gmail.com"],
    "amazon": ["amazon.com", "amazon.in", "amazon.co.uk"],
    "apple": ["apple.com", "icloud.com"],
    "microsoft": ["microsoft.com", "live.com", "office.com", "outlook.com", "azure.com"],
    "netflix": ["netflix.com"],
    "instagram": ["instagram.com"],
    "facebook": ["facebook.com", "fb.com"],
    "whatsapp": ["whatsapp.com", "wa.me"],
    "sbi": ["sbi.co.in", "onlinesbi.sbi", "onlinesbi.com", "sbi.co"],
    "hdfc": ["hdfcbank.com", "hdfc.com"],
    "icici": ["icicibank.com", "icicibank.co.in"],
    "axis": ["axisbank.com", "axisbank.co.in"]
}

# Target brand names list
TARGET_BRAND_KEYWORDS = list(BRANDS.keys())

# Character substitutions for Leetspeak / Homoglyph normalization
LEET_MAP = {
    '0': 'o',
    '1': 'l',
    '3': 'e',
    '4': 'a',
    '5': 's',
    '7': 't',
    '8': 'b',
    '@': 'a',
    '$': 's'
}

# Sensitive Brand + Action Keywords
SUSPICIOUS_ACTION_KEYWORDS = [
    "login", "signin", "verify", "verification", "secure", "account",
    "password", "update", "banking", "authentication", "support",
    "confirm", "billing", "suspend", "kyc", "otp", "claim", "reward"
]

# High-Risk / Suspicious TLDs
SUSPICIOUS_TLDS = [
    ".xyz", ".top", ".work", ".click", ".loan", ".zip", ".gq", ".tk", 
    ".ml", ".cf", ".ga", ".club", ".site", ".online", ".tech", ".vip",
    ".fit", ".rest", ".buzz", ".cam", ".kim", ".country", ".surf"
]

# Sensitive Auth & Action Keywords in URL paths or subdomains
SUSPICIOUS_URL_KEYWORDS = [
    "login", "signin", "verify", "verification", "secure", "account",
    "banking", "wallet", "credential", "suspend", "confirm", "billing", "re-activate",
    "webmail", "auth", "validation", "passcode", "otp", "security-alert"
]

# SQLite Database Settings
DB_FILE_PATH = os.path.join(os.path.dirname(__file__), "phishguard.db")

