import sys
import os
from pathlib import Path
from dotenv import load_dotenv

backend_dir = Path("c:/Users/Dhruva P Gowda/Documents/pharmashield/backend").resolve()
sys.path.append(str(backend_dir))
load_dotenv(backend_dir / ".env")

from fastapi.testclient import TestClient
from app.main import app
import traceback

client = TestClient(app)

try:
    response = client.post("/api/v1/simulate", json={
        "province": "Hubei",
        "duration_days": 30,
        "severity": "warning"
    })
    print(response.status_code)
    print(response.json())
except Exception as e:
    traceback.print_exc()
