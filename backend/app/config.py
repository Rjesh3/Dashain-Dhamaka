import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'dashain.db'}")
SESSION_TOKEN_PEPPER = os.getenv("SESSION_TOKEN_PEPPER", "dashain-dev-pepper")
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174",
    ).split(",")
    if origin.strip()
]
ENVIRONMENT = os.getenv("ENV", "development")

def parse_outcomes():
    return [
        {"id": "10", "label": "10", "points": 10, "weight": 3000},
        {"id": "100", "label": "100", "points": 100, "weight": 2500},
        {"id": "200", "label": "200", "points": 200, "weight": 2000},
        {"id": "500", "label": "500", "points": 500, "weight": 1200},
        {"id": "700", "label": "700", "points": 700, "weight": 700},
        {"id": "1000", "label": "1,000", "points": 1000, "weight": 560},
        {"id": "10000", "label": "10,000", "points": 10000, "weight": 40},
    ]

DEFAULT_OUTCOMES = parse_outcomes()
