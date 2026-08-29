import os
import re
from urllib.parse import urlparse

HIGH_RISK_EXTS = {
    ".exe": "Windows Executable",
    ".scr": "Screen Saver / Executable",
    ".msi": "Windows Installer Package",
    ".bat": "Batch Script",
    ".cmd": "Command Script",
    ".ps1": "PowerShell Script",
    ".jar": "Java Executable Archive",
    ".apk": "Android Application Package"
}

SUSPICIOUS_ARCHIVE_EXTS = {
    ".zip": "Compressed Zip Archive",
    ".rar": "RAR Archive",
    ".7z": "7-Zip Archive",
    ".iso": "Disk Image File",
    ".js": "JavaScript File",
    ".vbs": "VBScript File"
}

DOCUMENT_MACRO_EXTS = {
    ".docm": "Word Macro-Enabled Document",
    ".xlsm": "Excel Macro-Enabled Spreadsheet",
    ".pptm": "PowerPoint Macro-Enabled Presentation"
}

def analyze_download_link(url_string: str) -> dict:
    url_input = url_string.strip()
    if not url_input:
        return {"score": 0, "indicators": [], "download_info": None}

    parsed = urlparse(url_input)
    path = parsed.path
    query = parsed.query

    full_path_query = (path + "?" + query).lower()
    
    # Extract filename from path
    filename = os.path.basename(path)
    if not filename and query:
        # Check query string parameters for filename=...
        match = re.search(r"filename=([^&]+)", query, re.IGNORECASE)
        if match:
            filename = match.group(1)

    if not filename:
        return {"score": 0, "indicators": [], "download_info": None}

    ext = os.path.splitext(filename)[1].lower()
    if not ext:
        return {"score": 0, "indicators": [], "download_info": None}

    indicators = []
    download_score = 0
    file_type_label = None

    if ext in HIGH_RISK_EXTS:
        file_type_label = HIGH_RISK_EXTS[ext]
        score_add = 20
        download_score += score_add
        indicators.append({
            "name": "Executable Download Detected",
            "category": "url",
            "severity": "high",
            "score_impact": score_add,
            "description": f"The URL appears to directly reference an executable file ('{filename}')."
        })

    elif ext in SUSPICIOUS_ARCHIVE_EXTS:
        file_type_label = SUSPICIOUS_ARCHIVE_EXTS[ext]
        score_add = 8
        download_score += score_add
        indicators.append({
            "name": "Archive Download Detected",
            "category": "url",
            "severity": "medium",
            "score_impact": score_add,
            "description": "The URL points to an archive file. Attackers sometimes use archives to conceal malicious content."
        })

    elif ext in DOCUMENT_MACRO_EXTS:
        file_type_label = DOCUMENT_MACRO_EXTS[ext]
        score_add = 12
        download_score += score_add
        indicators.append({
            "name": "Macro Document Download",
            "category": "url",
            "severity": "high",
            "score_impact": score_add,
            "description": "The URL points to an Office document capable of executing automated macros."
        })

    download_info = None
    if file_type_label:
        download_info = {
            "filename": filename,
            "file_type": file_type_label,
            "extension": ext,
            "score_impact": download_score
        }

    return {
        "score": download_score,
        "indicators": indicators,
        "download_info": download_info
    }
