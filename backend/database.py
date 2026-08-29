import sqlite3
import json
import os
from datetime import datetime, timezone
from config import DB_FILE_PATH

def get_connection():
    conn = sqlite3.connect(DB_FILE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # 1. Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            preferred_language TEXT DEFAULT 'en',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # 2. History table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            input_text TEXT NOT NULL,
            input_type TEXT NOT NULL,
            risk_score INTEGER NOT NULL,
            risk_level TEXT NOT NULL,
            indicators TEXT NOT NULL,
            category_scores TEXT NOT NULL,
            recommendation TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)
    
    # Migration: add user_id column if history table pre-existed without it
    cursor.execute("PRAGMA table_info(history)")
    columns = [col[1] for col in cursor.fetchall()]
    if "user_id" not in columns:
        cursor.execute("ALTER TABLE history ADD COLUMN user_id INTEGER REFERENCES users(id)")

    conn.commit()
    conn.close()

# Auto-initialize database schema on import
init_db()

# User CRUD Operations
def create_user(name: str, email: str, password_hash: str, preferred_language: str = "en") -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    timestamp = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
        INSERT INTO users (name, email, password_hash, preferred_language, created_at)
        VALUES (?, ?, ?, ?, ?)
    """, (name, email.strip().lower(), password_hash, preferred_language, timestamp))
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()
    return {
        "id": user_id,
        "name": name,
        "email": email.strip().lower(),
        "preferred_language": preferred_language,
        "created_at": timestamp
    }

def get_user_by_email(email: str) -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, password_hash, preferred_language, created_at FROM users WHERE LOWER(email) = ?", (email.strip().lower(),))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def get_user_by_id(user_id: int) -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, preferred_language, created_at FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def save_analysis(input_text: str, input_type: str, result: dict, user_id: int = None) -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    
    indicators_json = json.dumps(result.get("indicators", []))
    category_scores_json = json.dumps(result.get("category_scores", {}))
    timestamp = datetime.now(timezone.utc).isoformat()
    
    cursor.execute("""
        INSERT INTO history (user_id, input_text, input_type, risk_score, risk_level, indicators, category_scores, recommendation, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        user_id,
        input_text,
        input_type,
        result.get("risk_score", 0),
        result.get("risk_level", "SAFE"),
        indicators_json,
        category_scores_json,
        result.get("recommendation", ""),
        timestamp
    ))
    
    conn.commit()
    record_id = cursor.lastrowid
    conn.close()
    
    return {
        "id": record_id,
        "user_id": user_id,
        "input_text": input_text,
        "input_type": input_type,
        "risk_score": result.get("risk_score", 0),
        "risk_level": result.get("risk_level", "SAFE"),
        "indicators": result.get("indicators", []),
        "category_scores": result.get("category_scores", {}),
        "recommendation": result.get("recommendation", ""),
        "timestamp": timestamp
    }

def get_history(limit: int = 50, user_id: int = None) -> list:
    conn = get_connection()
    cursor = conn.cursor()
    
    if user_id is not None:
        cursor.execute("""
            SELECT id, user_id, input_text, input_type, risk_score, risk_level, indicators, category_scores, recommendation, timestamp
            FROM history
            WHERE user_id = ?
            ORDER BY id DESC
            LIMIT ?
        """, (user_id, limit))
    else:
        cursor.execute("""
            SELECT id, user_id, input_text, input_type, risk_score, risk_level, indicators, category_scores, recommendation, timestamp
            FROM history
            ORDER BY id DESC
            LIMIT ?
        """, (limit,))
    
    rows = cursor.fetchall()
    conn.close()
    
    history_list = []
    for row in rows:
        history_list.append({
            "id": row["id"],
            "user_id": row["user_id"],
            "input_text": row["input_text"],
            "input_type": row["input_type"],
            "risk_score": row["risk_score"],
            "risk_level": row["risk_level"],
            "indicators": json.loads(row["indicators"]) if row["indicators"] else [],
            "category_scores": json.loads(row["category_scores"]) if row["category_scores"] else {},
            "recommendation": row["recommendation"],
            "timestamp": row["timestamp"]
        })
    
    return history_list

def clear_history(user_id: int = None):
    conn = get_connection()
    cursor = conn.cursor()
    if user_id is not None:
        cursor.execute("DELETE FROM history WHERE user_id = ?", (user_id,))
    else:
        cursor.execute("DELETE FROM history")
    conn.commit()
    conn.close()
    return True


def get_analytics_summary() -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT risk_level, input_type, indicators, timestamp FROM history")
    rows = cursor.fetchall()
    conn.close()

    total_scans = len(rows)
    if total_scans == 0:
        return {
            "total_scans": 0,
            "high_risk": 0,
            "suspicious": 0,
            "safe_low_risk": 0,
            "risk_distribution": {"SAFE": 0, "LOW RISK": 0, "SUSPICIOUS": 0, "HIGH RISK": 0},
            "scan_types": {"URL": 0, "Message": 0, "QR": 0, "Screenshot": 0, "Email": 0},
            "top_indicators": [],
            "recent_trends": []
        }

    high_risk = 0
    suspicious = 0
    safe_low = 0

    risk_dist = {"SAFE": 0, "LOW RISK": 0, "SUSPICIOUS": 0, "HIGH RISK": 0}
    scan_types = {"URL": 0, "Message": 0, "QR": 0, "Screenshot": 0, "Email": 0}
    indicator_counts = {}
    trends_by_date = {}

    for row in rows:
        r_level = row["risk_level"] or "SAFE"
        i_type = (row["input_type"] or "url").lower()

        risk_dist[r_level] = risk_dist.get(r_level, 0) + 1

        if r_level == "HIGH RISK":
            high_risk += 1
        elif r_level == "SUSPICIOUS":
            suspicious += 1
        else:
            safe_low += 1

        if "url" in i_type:
            scan_types["URL"] += 1
        elif "email" in i_type:
            scan_types["Email"] += 1
        elif "qr" in i_type:
            scan_types["QR"] += 1
        elif "screenshot" in i_type:
            scan_types["Screenshot"] += 1
        else:
            scan_types["Message"] += 1

        if row["indicators"]:
            try:
                inds = json.loads(row["indicators"])
                for ind in inds:
                    name = ind.get("name")
                    if name:
                        indicator_counts[name] = indicator_counts.get(name, 0) + 1
            except Exception:
                pass

        # Date grouping for trends
        ts = row["timestamp"] or ""
        date_str = ts.split("T")[0] if "T" in ts else ts.split(" ")[0]
        if not date_str:
            date_str = "Today"

        if date_str not in trends_by_date:
            trends_by_date[date_str] = {"date": date_str, "scans": 0, "high_risk": 0}
        trends_by_date[date_str]["scans"] += 1
        if r_level == "HIGH RISK":
            trends_by_date[date_str]["high_risk"] += 1

    top_indicators = [
        {"name": name, "count": count}
        for name, count in sorted(indicator_counts.items(), key=lambda x: x[1], reverse=True)[:6]
    ]

    recent_trends = list(trends_by_date.values())[-7:]

    return {
        "total_scans": total_scans,
        "high_risk": high_risk,
        "suspicious": suspicious,
        "safe_low_risk": safe_low,
        "risk_distribution": risk_dist,
        "scan_types": scan_types,
        "top_indicators": top_indicators,
        "recent_trends": recent_trends
    }

