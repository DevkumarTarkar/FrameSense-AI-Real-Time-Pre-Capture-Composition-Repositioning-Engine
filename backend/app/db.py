"""
FrameSense AI - SQLite Database Layer for Captured Photos Gallery.
Replaces brittle browser LocalStorage with a durable SQLite storage engine
and on-disk media management.
"""

import hashlib
import json
import logging
import os
import sqlite3
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger("framesense.db")

# Paths for database and file storage
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
UPLOADS_DIR = DATA_DIR / "uploads"
DB_PATH = DATA_DIR / "framesense_gallery.db"


def get_db_connection() -> sqlite3.Connection:
    """Returns a SQLite connection with row factory enabled."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initializes the captures and users tables in SQLite if they do not exist."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS captures (
                id TEXT PRIMARY KEY,
                filename TEXT NOT NULL,
                image_url TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                date TEXT NOT NULL,
                score INTEGER NOT NULL,
                aesthetic REAL NOT NULL,
                grade TEXT NOT NULL,
                verdict TEXT NOT NULL,
                shot_type TEXT DEFAULT 'portrait',
                distance_ft REAL,
                sub_scores TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                full_name TEXT NOT NULL,
                dob TEXT,
                password_hash TEXT NOT NULL,
                role TEXT DEFAULT 'Photographer',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.commit()
    logger.info(f"SQLite Gallery & Auth Database initialized at {DB_PATH}")


def hash_password(password: str) -> str:
    """Securely hash a password using PBKDF2 with SHA-256 and random salt."""
    salt = os.urandom(16).hex()
    pwd_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000).hex()
    return f"{salt}${pwd_hash}"


def verify_password(password: str, hashed: str) -> bool:
    """Verify a plain password against the stored salt$hash string."""
    try:
        salt, pwd_hash = hashed.split("$", 1)
        test_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000).hex()
        return pwd_hash == test_hash
    except Exception:
        return False


def create_user(email: str, full_name: str, dob: str, password: str, role: str = "Photographer") -> Dict[str, Any]:
    """Creates a new user record in SQLite with a hashed password."""
    email_clean = email.strip().lower()
    hashed = hash_password(password)

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO users (email, full_name, dob, password_hash, role)
            VALUES (?, ?, ?, ?, ?)
            """,
            (email_clean, full_name.strip(), dob.strip(), hashed, role),
        )
        user_id = cursor.lastrowid
        conn.commit()

    return {
        "id": user_id,
        "email": email_clean,
        "full_name": full_name.strip(),
        "dob": dob.strip(),
        "role": role,
    }


def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Retrieves a user row by email address."""
    email_clean = email.strip().lower()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (email_clean,))
        row = cursor.fetchone()
        if not row:
            return None
        return dict(row)


def insert_capture(
    capture_id: str,
    filename: str,
    image_url: str,
    timestamp: str,
    date: str,
    score: int,
    aesthetic: float,
    grade: str,
    verdict: str,
    shot_type: str = "portrait",
    distance_ft: Optional[float] = None,
    sub_scores: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Inserts a new capture entry into SQLite."""
    sub_scores_json = json.dumps(sub_scores or {})
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO captures (
                id, filename, image_url, timestamp, date,
                score, aesthetic, grade, verdict, shot_type,
                distance_ft, sub_scores
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                capture_id,
                filename,
                image_url,
                timestamp,
                date,
                score,
                aesthetic,
                grade,
                verdict,
                shot_type,
                distance_ft,
                sub_scores_json,
            ),
        )
        conn.commit()

    return {
        "id": capture_id,
        "filename": filename,
        "image_url": image_url,
        "thumbnail": image_url,
        "timestamp": timestamp,
        "date": date,
        "score": score,
        "aesthetic": aesthetic,
        "grade": grade,
        "verdict": verdict,
        "shot_type": shot_type,
        "distance_ft": distance_ft,
        "sub_scores": sub_scores or {},
    }


def fetch_all_captures(limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
    """Retrieves all captures sorted by creation date descending."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT * FROM captures 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
            """,
            (limit, offset),
        )
        rows = cursor.fetchall()

    results = []
    for r in rows:
        sub_scores_dict = {}
        if r["sub_scores"]:
            try:
                sub_scores_dict = json.loads(r["sub_scores"])
            except Exception:
                sub_scores_dict = {}

        results.append(
            {
                "id": r["id"],
                "filename": r["filename"],
                "image_url": r["image_url"],
                "thumbnail": r["image_url"],
                "timestamp": r["timestamp"],
                "date": r["date"],
                "score": r["score"],
                "aesthetic": r["aesthetic"],
                "grade": r["grade"],
                "verdict": r["verdict"],
                "shot_type": r["shot_type"],
                "distance_ft": r["distance_ft"],
                "sub_scores": sub_scores_dict,
                "created_at": r["created_at"],
            }
        )
    return results


def fetch_capture_by_id(capture_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves a single capture by its ID."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM captures WHERE id = ?", (capture_id,))
        r = cursor.fetchone()
        if not r:
            return None

        sub_scores_dict = {}
        if r["sub_scores"]:
            try:
                sub_scores_dict = json.loads(r["sub_scores"])
            except Exception:
                pass

        return {
            "id": r["id"],
            "filename": r["filename"],
            "image_url": r["image_url"],
            "thumbnail": r["image_url"],
            "timestamp": r["timestamp"],
            "date": r["date"],
            "score": r["score"],
            "aesthetic": r["aesthetic"],
            "grade": r["grade"],
            "verdict": r["verdict"],
            "shot_type": r["shot_type"],
            "distance_ft": r["distance_ft"],
            "sub_scores": sub_scores_dict,
            "created_at": r["created_at"],
        }


def delete_capture_by_id(capture_id: str) -> Optional[str]:
    """
    Deletes a capture row from SQLite and returns its filename
    so the physical file can be removed from disk.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT filename FROM captures WHERE id = ?", (capture_id,))
        row = cursor.fetchone()
        if not row:
            return None
        filename = row["filename"]

        cursor.execute("DELETE FROM captures WHERE id = ?", (capture_id,))
        conn.commit()

        # Delete physical image file
        file_path = UPLOADS_DIR / filename
        if file_path.exists():
            try:
                file_path.unlink()
                logger.info(f"Deleted physical capture file {file_path}")
            except Exception as e:
                logger.warning(f"Could not delete physical file {file_path}: {e}")

        return filename
