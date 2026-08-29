import sys
import os
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(__file__))

from database import (
    init_db, save_analysis, get_history, clear_history, get_analytics_summary,
    create_user, get_user_by_email, get_user_by_id
)
from auth import (
    hash_password, verify_password, create_access_token,
    get_optional_user_id, get_required_current_user_id
)
from analyzers.url_analyzer import analyze_url
from analyzers.redirect_analyzer import analyze_redirects
from analyzers.message_analyzer import analyze_message
from analyzers.email_header_analyzer import analyze_email_header
from analyzers.risk_engine import evaluate_risk


app = FastAPI(
    title="PhishGuard AI API",
    description="Explainable Phishing Link & Suspicious Message Heuristic Analyzer API",
    version="1.0.0"
)

# Enable CORS for local React / Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

class URLRequest(BaseModel):

    url: str = Field(..., example="http://login-paypal-verify-account.xyz/banking")

class MessageRequest(BaseModel):
    message: str = Field(..., example="Your account will be suspended today. Click http://secure-update-billing.tk to verify immediately.")

class EmailHeaderRequest(BaseModel):
    header_text: str = Field(..., example="From: 'PayPal Security' <security@example.test>\nReply-To: support@different-domain.test\nAuthentication-Results: spf=fail; dkim=fail; dmarc=fail;")

class SignupRequest(BaseModel):
    name: str = Field(..., example="Pratham")
    email: str = Field(..., example="pratham@example.com")
    password: str = Field(..., example="secret1234")
    preferred_language: str = Field("en", example="en")

class LoginRequest(BaseModel):
    email: str = Field(..., example="pratham@example.com")
    password: str = Field(..., example="secret1234")

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "PhishGuard AI Engine",
        "version": "1.0.0",
        "database": "sqlite"
    }

# Authentication Endpoints
@app.post("/auth/signup")
def signup_endpoint(req: SignupRequest):
    name = req.name.strip()
    email = req.email.strip().lower()
    password = req.password
    lang = req.preferred_language or "en"

    if not name:
        raise HTTPException(status_code=400, detail="Full name is required.")
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Enter a valid email address.")
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    existing = get_user_by_email(email)
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    pwd_hash = hash_password(password)
    new_user = create_user(name=name, email=email, password_hash=pwd_hash, preferred_language=lang)

    access_token = create_access_token(data={"sub": str(new_user["id"]), "email": new_user["email"]})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user
    }

@app.post("/auth/login")
def login_endpoint(req: LoginRequest):
    email = req.email.strip().lower()
    password = req.password

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required.")

    user = get_user_by_email(email)
    if not user or not verify_password(password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    user_info = {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "preferred_language": user["preferred_language"],
        "created_at": user["created_at"]
    }
    access_token = create_access_token(data={"sub": str(user["id"]), "email": user["email"]})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_info
    }

@app.get("/auth/me")
def get_current_user_endpoint(authorization: str = Header(None)):
    uid = get_required_current_user_id(authorization)
    user = get_user_by_id(uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user


@app.post("/analyze/url")
async def analyze_url_endpoint(req: URLRequest, authorization: str = Header(None)):
    url_input = req.url.strip()
    if not url_input:
        raise HTTPException(status_code=400, detail="URL input cannot be empty.")
        
    user_id = get_optional_user_id(authorization)
    url_res = analyze_url(url_input)
    redirect_res = await analyze_redirects(url_input)
    
    risk = evaluate_risk("url", url_res=url_res, redirect_res=redirect_res)
    
    result = {
        "input_text": url_input,
        "input_type": "url",
        "risk_score": risk["risk_score"],
        "risk_level": risk["risk_level"],
        "category_scores": risk["category_scores"],
        "indicators": risk["indicators"],
        "recommendation": risk["recommendation"],
        "domain_comparison": risk.get("domain_comparison"),
        "download_info": risk.get("download_info"),
        "redirect_chain": risk.get("redirect_chain"),
        "redirect_hops": redirect_res.get("hops", 0),
        "final_url": redirect_res.get("final_url", url_input)
    }
    
    saved_record = save_analysis(url_input, "url", result, user_id=user_id)
    return saved_record

@app.post("/analyze/message")
async def analyze_message_endpoint(req: MessageRequest, authorization: str = Header(None)):
    msg_input = req.message.strip()
    if not msg_input:
        raise HTTPException(status_code=400, detail="Message input cannot be empty.")
        
    user_id = get_optional_user_id(authorization)
    msg_res = analyze_message(msg_input)
    
    redirect_res = {"score": 0, "indicators": [], "hops": 0}
    embedded_url_res = msg_res.get("url_analysis")
    if embedded_url_res and embedded_url_res.get("raw_url"):
        redirect_res = await analyze_redirects(embedded_url_res["raw_url"])
        
    risk = evaluate_risk("message", msg_res=msg_res, redirect_res=redirect_res)
    
    result = {
        "input_text": msg_input,
        "input_type": "message",
        "risk_score": risk["risk_score"],
        "risk_level": risk["risk_level"],
        "category_scores": risk["category_scores"],
        "indicators": risk["indicators"],
        "recommendation": risk["recommendation"],
        "domain_comparison": risk.get("domain_comparison"),
        "download_info": risk.get("download_info"),
        "redirect_chain": risk.get("redirect_chain"),
        "extracted_urls": msg_res.get("extracted_urls", []),
        "redirect_hops": redirect_res.get("hops", 0)
    }
    
    saved_record = save_analysis(msg_input, "message", result, user_id=user_id)
    return saved_record

@app.post("/analyze/email-header")
async def analyze_email_header_endpoint(req: EmailHeaderRequest, authorization: str = Header(None)):
    header_input = req.header_text.strip()
    if not header_input:
        raise HTTPException(status_code=400, detail="Email header input cannot be empty.")

    user_id = get_optional_user_id(authorization)
    email_res = analyze_email_header(header_input)
    risk = evaluate_risk("email", email_res=email_res)

    result = {
        "input_text": header_input,
        "input_type": "email",
        "risk_score": risk["risk_score"],
        "risk_level": risk["risk_level"],
        "category_scores": risk["category_scores"],
        "indicators": risk["indicators"],
        "recommendation": risk["recommendation"],
        "parsed_headers": risk.get("parsed_headers")
    }

    saved_record = save_analysis(header_input, "email", result, user_id=user_id)
    return saved_record

@app.get("/analytics")
def get_analytics_endpoint():
    return get_analytics_summary()

@app.get("/history")
def get_history_endpoint(limit: int = 50, authorization: str = Header(None)):
    user_id = get_optional_user_id(authorization)
    return get_history(limit=limit, user_id=user_id)

@app.delete("/history")
def clear_history_endpoint(authorization: str = Header(None)):
    user_id = get_optional_user_id(authorization)
    clear_history(user_id=user_id)
    return {"message": "History cleared successfully."}


@app.get("/demo-examples")
def get_demo_examples():
    return [
        {
            "id": "safe_url",
            "type": "url",
            "title": "Safe Example Domain",
            "input": "https://example.com",
            "expected_level": "SAFE"
        },
        {
            "id": "shortened_url",
            "type": "url",
            "title": "Shortened Lookalike Link",
            "input": "https://bit.ly/paypa1-login-verify",
            "expected_level": "HIGH RISK"
        },
        {
            "id": "suspicious_file",
            "type": "url",
            "title": "Malicious Executable Download",
            "input": "https://secure-update-billing.test/KYC_Update.apk",
            "expected_level": "HIGH RISK"
        },
        {
            "id": "hinglish_scam",
            "type": "message",
            "title": "Hinglish SMS Scam",
            "input": "Your SBI account block ho jayega. KYC abhi update karo aur is link par click karo: https://sbi-secure-account.test/verify",
            "expected_level": "HIGH RISK"
        },
        {
            "id": "email_header_scam",
            "type": "email",
            "title": "Email Spoof & Auth Fail Header",
            "input": "From: \"PayPal Support\" <security@example.test>\nReply-To: support@different-phish.test\nReturn-Path: bounce@unknown-sender.test\nAuthentication-Results: spf=fail; dkim=fail; dmarc=fail;",
            "expected_level": "HIGH RISK"
        }
    ]



from fastapi.staticfiles import StaticFiles

from fastapi.responses import FileResponse

# Check for compiled frontend dist folder
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")

if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Allow FastAPI to handle API endpoints and swagger docs
        if full_path.startswith("health") or full_path.startswith("analyze") or full_path.startswith("history") or full_path.startswith("demo-examples") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            raise HTTPException(status_code=404, detail="Not Found")
        
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))

