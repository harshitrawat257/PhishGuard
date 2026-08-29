# 🛡️ PhishGuard AI — Explainable Phishing Link & Suspicious Message Analyzer

> **"Detect. Explain. Protect."**
> A 1-Day Hackathon MVP designed for transparent, explainable detection of phishing links and social-engineering messages.

---

## 📌 Problem Statement Overview (PS10)

Phishing messages and fake websites frequently employ lookalike domains, sub-domain abuse, suspicious URL parameters, safe redirect chains, and urgency/fear-based language to deceive everyday users. Most victims cannot identify subtle warning signs before clicking.

**PhishGuard AI** solves this by providing a unified web application where users can submit either a **suspicious URL** or a **full SMS/WhatsApp/email message**. The system extracts multiple structural and behavioral heuristics, computes a normalized **Risk Score (0–100)**, classifies the risk level (**SAFE**, **LOW RISK**, **SUSPICIOUS**, **HIGH RISK**), and delivers an **explainable breakdown** of *why* the content is unsafe along with immediate **actionable safety guidance**.

---

## 📁 Project Structure

```text
hacksprint/
├── backend/
│   ├── main.py                  # FastAPI application, CORS, and REST API endpoints
│   ├── config.py                # Centralized weights, thresholds, brand lists & TLDs
│   ├── database.py              # SQLite connection, history schema, and CRUD handlers
│   ├── phishguard.db            # Local SQLite database storing analysis history
│   ├── requirements.txt         # Python dependencies (fastapi, uvicorn, httpx, pytest, etc.)
│   ├── analyzers/
│   │   ├── __init__.py
│   │   ├── url_analyzer.py      # Structural URL & brand/domain feature extractor
│   │   ├── redirect_analyzer.py # Asynchronous HTTP redirect hop & protocol inspector
│   │   ├── message_analyzer.py  # Lightweight NLP & social-engineering pattern matcher
│   │   └── risk_engine.py       # Transparent weighted score aggregator & classifier
│   └── tests/
│       ├── __init__.py
│       ├── test_url_analyzer.py # Unit tests for URL heuristics
│       ├── test_message_analyzer.py # Unit tests for message NLP indicators
│       ├── test_risk_engine.py  # Unit tests for score boundary logic
│       └── test_api.py          # FastAPI endpoint integration tests
│
└── frontend/
    ├── index.html               # Main HTML entry point with cyber font imports
    ├── package.json             # React, Vite, Tailwind CSS, Lucide icons configuration
    ├── vite.config.js           # Vite dev server configuration
    ├── tailwind.config.js       # Custom cyber-theme tokens and color schemes
    ├── postcss.config.js        # PostCSS configuration
    └── src/
        ├── App.jsx              # Main React application shell
        ├── main.jsx             # React DOM root renderer
        ├── index.css            # Tailwind directives & glassmorphism custom CSS
        ├── services/
        │   └── api.js           # Axios API client connecting to FastAPI backend
        └── components/
            ├── Navbar.jsx       # Header with shield logo, health status & demo mode toggle
            ├── AnalysisInput.jsx# Tabbed input (URL/Message) with 1-click test presets
            ├── RiskScoreCard.jsx# SVG animated circular risk gauge (0-100) & badge
            ├── RiskBreakdownBars.jsx # Visual horizontal risk category progress bars
            ├── ExplainabilityPanel.jsx # "WHY?" detected indicators list & safety action box
            └── HistoryTable.jsx # SQLite analysis history log with search and filter
```

---

## ⚙️ Setup & Operating Instructions

### Prerequisites
- **Python**: Version `3.10+`
- **Node.js**: Version `18+` or `20+`

---

### 1️⃣ Start Backend Server (Python + FastAPI)

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the FastAPI development server:
   ```bash
   python -m uvicorn main:app --reload --port 8000
   ```
   > Backend API will be available at: `http://localhost:8000`  
   > Interactive API Swagger Documentation: `http://localhost:8000/docs`

---

### 2️⃣ Start Frontend Application (React + Vite)

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install NPM packages:
   ```bash
   npm install
   ```
3. Run Vite dev server:
   ```bash
   npm run dev
   ```
   > Frontend dashboard will be live at: `http://localhost:3000` (or `http://localhost:5173`)

---

## 🧪 Automated Testing Suite

The backend includes a comprehensive `pytest` suite covering URL parsing, brand mismatch detection, message NLP heuristics, composite score scaling, and FastAPI API routes.

To run the complete automated test suite:
```bash
python -m pytest backend/tests/
```

**Expected Output:**
```text
backend/tests/test_api.py .....                                          [ 29%]
backend/tests/test_message_analyzer.py ....                              [ 52%]
backend/tests/test_risk_engine.py ...                                    [ 70%]
backend/tests/test_url_analyzer.py .....                                 [100%]
======================= 17 passed in 7.36s =======================
```

---

## 🚀 Live Demo Mode Instructions

To demonstrate PhishGuard AI during a live hackathon presentation:

1. Launch both the backend (`http://localhost:8000`) and frontend (`http://localhost:3000`).
2. On the top right of the dashboard, observe the **"Engine: Active"** health indicator pill.
3. Click any of the **Quick Demo Test Presets** above the input box:
   - **Legitimate Official Domain**: `https://www.paypal.com/us/signin` → Result: `0/100` (`SAFE`).
   - **Lookalike Phishing Link**: `http://paypal.com.verify-login.account-security.xyz/login` → Result: `87/100` (`HIGH RISK`).
   - **Urgent Bank Fraud SMS**: `ALERT: Your Bank Account will be suspended within 24 hours...` → Result: `92/100` (`HIGH RISK`).
   - **Prize Claim Scam**: `Congratulations! You won a free $1,000 gift card!...` → Result: `82/100` (`HIGH RISK`).
4. Review the real-time **Circular Risk Score Gauge**, **Category Risk Bars**, and the **"WHY?" Explainability Panel** highlighting specific flagged indicators with severity levels.
5. Inspect the **Analysis History** table at the bottom to see past records automatically stored in SQLite.

---

## 🧠 Risk-Scoring Algorithm & Heuristic Engine

PhishGuard AI uses a transparent, weighted scoring engine (`backend/analyzers/risk_engine.py`) that aggregates indicators across four distinct vectors:

| Vector | Max Weight | Key Evaluated Indicators |
|---|---|---|
| **URL Structure** | 40 pts | IP hostname, `@` symbol spoofing, subdomain depth, hyphen abuse, long URL, path depth, percent encoding |
| **Domain & Brand** | 40 pts | Brand mismatch heuristics (e.g. "paypal" in subdomain on non-official domain), suspicious TLDs (`.xyz`, `.top`, `.click`, etc.) |
| **Social Engineering** | 40 pts | Urgency language, account suspension threats, credential/OTP requests, payment demands, prize claims, generic greetings |
| **Redirect Hops** | 20 pts | Multiple HTTP redirects, protocol downgrade (HTTPS → HTTP), cross-domain jump |

### Classification Matrix
- **0 – 25**: `SAFE` (Green) — Content adheres to standard legitimate patterns.
- **26 – 50**: `LOW RISK` (Yellow) — Minor unusual structural traits detected.
- **51 – 75**: `SUSPICIOUS` (Orange) — Multiple warning flags detected; verification advised.
- **76 – 100**: `HIGH RISK` (Red) — Strong phishing or social-engineering indicators present; immediate action warning triggered.

---

## ✅ Completed MVP Features

- [x] **URL Structural Analyzer**: Evaluates IP hostnames, subdomain counts, `@` userinfo spoofing, suspicious TLDs, brand mismatches, and auth keywords.
- [x] **Safe Redirect Analyzer**: Asynchronously traces HTTP redirect chains using `httpx` with strict 3-second timeout protection.
- [x] **Message / NLP Analyzer**: Detects urgency, threats/suspensions, OTP/credential harvesting, payment demands, and prize scams.
- [x] **Transparent Explainability ("WHY?")**: Displays exact detected reasons with severity badges (`High`, `Medium`, `Low`) and score impact points.
- [x] **Actionable Safety Recommendations**: Context-aware guidance tailored to the risk level.
- [x] **Cybersecurity Dashboard UI**: Dark-themed glassmorphism interface built with React, Vite, and Tailwind CSS.
- [x] **SQLite History Persistence**: Stores input, risk score, level, detected indicators, and timestamp with search and clear history functions.
- [x] **1-Click Preset Demo Mode**: Safe pre-populated test cases for live demonstrations.
- [x] **Automated Test Suite**: 17 passing pytest cases covering unit and API logic.

---

## 🔮 Future Development (Post-Hackathon Roadmap)

1. **DNS & WHOIS Domain Age Lookup**: Integrate active WHOIS domain creation age check to flag domains registered within the last 30 days.
2. **Computer Vision Screenshot Similarity**: Capture screenshot of target page using headless Chromium and compute perceptual hash similarity against authentic target login pages.
3. **Browser Extension Integration**: Build a Chrome Extension sidecar that automatically analyzes links on hover before the user clicks.
4. **Community Threat Feed Sync**: Synchronize flagged phishing URLs with PhishTank and Google Safe Browsing APIs.
