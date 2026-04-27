import sys
from pathlib import Path
from dotenv import load_dotenv

backend_dir = Path("c:/Users/Dhruva P Gowda/Documents/pharmashield/backend").resolve()
sys.path.append(str(backend_dir))
load_dotenv(backend_dir / ".env")

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
response = client.post("/api/v1/simulate", json={
    "province": "Hubei",
    "duration_days": 30,
    "severity": "Warning"  # Invalid!
})
print(response.status_code)
print(response.json())
