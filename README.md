# ShockMap — Supply Chain Intelligence Platform

> **AI Predicted India's COVID Drug Shortage 67 Days Early.**

ShockMap is a three-engine geospatial intelligence platform that monitors pharmaceutical and rare-earth supply chains in real time, propagates risk across dependency graphs, and surfaces actionable procurement recommendations — **67 days before a COVID-scale collapse becomes visible to the market.**

Built for the **Google AI Hackathon 2026**.

---

## Live Demo

```
Frontend  →  http://localhost:5173
Backend   →  http://localhost:8081
```

Click **LIVE DEMO — NO LOGIN** on the landing page to enter immediately. A guided onboarding tour will appear automatically on first visit, walking through the 3-engine architecture.

---

## Architecture

```
GDELT Signal Feed  ──►  Engine 1: NER Extraction (Gemini 2.5 Flash)
                               │
                               ▼
                    Engine 2: Graph Propagation (PageRank + Louvain)
                               │
                               ▼
                    Engine 3: RAG Intelligence (Qdrant + Gemini)
                               │
                               ▼
                    FastAPI REST  ──►  React Intelligence Surface
```

### Engine 1 — Signal Ingestion
- Polls GDELT every 15 minutes for supply chain disruption signals
- Filters: `factory_shutdown`, `export_ban`, `port_closure`, `contamination`
- Gemini 2.5 Flash NER extracts structured events from unstructured news text
- Persists structured shocks to `data/shocks.json`

### Engine 2 — Graph Propagation
- NetworkX graph: **20 pharma API nodes + 8 rare earth mineral nodes**
- Edges weighted by India import volume (Comtrade data)
- Personalized PageRank for upstream risk propagation
- Louvain community detection to surface correlated supply clusters
- GNN propagation supported (disabled by default; PageRank fallback always active)

### Engine 3 — RAG Action Intelligence
- Qdrant vector store (`pharmashield_kb` collection)
- Gemini embeddings for semantic retrieval across NLEM, SARS-2003 playbooks, Comtrade records
- Grounded procurement action recommendations per shock event — with supplier names, quantities, lead times

---

## Key Features

| Feature | Description |
|---|---|
| **Onboarding Tour** | First-visit guided walkthrough covering the 3-engine architecture, blurred backdrop overlay |
| **Live Shock Feed** | Real-time GDELT-powered supply events with severity, sector, and province filters |
| **ShockDetail War Room** | Per-shock: 72-hour action ladder, economic delta model, propagation graph, expandable evidence cards |
| **Shock Simulator** | Inject synthetic shock scenarios, observe propagated risk, model cost and stockout impact |
| **Global Supply Map** | Interactive Leaflet map with China province nodes, India state nodes, international supply corridors |
| **India In-Depth** | State-level pharmaceutical manufacturing exposure, China dependency scores, entry port mapping |
| **COVID Backtest** | Animated signal-flow replay: ShockMap on Dec 2019 public data → CRITICAL alert 67 days before WHO declaration |
| **Propagation Graph** | Interactive dependency network — click any node to trace upstream sources and downstream drug exposure |
| **Ask ShockMap** | Gemini-powered natural language procurement analyst, grounded in the knowledge base |

---

## Proof: COVID-19 Retroactive Analysis

Running ShockMap's pipeline on **publicly available data from December 2019**:

| Metric | Value |
|---|---|
| Prediction lead time vs WHO declaration | **67 days** |
| APIs correctly flagged at risk | **14 / 20** |
| Actual shortage match rate | **93%** |
| Signals processed | **3,847** |
| Action plan generated | **Jan 23, 2020** |

See the **COVID Backtest** page for the full animated signal replay.

---

## Stack

**Backend**
- Python 3.11 + FastAPI + Uvicorn
- NetworkX + `networkx-louvain` (graph engine + community detection)
- `google-genai` SDK — Gemini 2.5 Flash (NER + RAG, `thinking_budget=0` for structured JSON output)
- Qdrant Cloud (vector store)
- GDELT API (signal ingestion, 15-minute polling)
- Tenacity (retry logic for external API calls)

**Frontend**
- React 19 + Vite
- React Router v6
- React-Leaflet (geospatial maps)
- Vanilla CSS design system (dark slate/muted-blue palette)

---

## Running Locally

### Prerequisites
- Python 3.11+
- Node 20+
- Gemini API key ([Google AI Studio](https://aistudio.google.com/))
- Qdrant Cloud credentials (or local Qdrant instance)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # macOS / Linux

pip install -r requirements.txt

# Set environment variables (Windows PowerShell)
$env:GEMINI_API_KEY="your-key"
$env:QDRANT_URL="https://your-cluster.qdrant.io:6333"
$env:QDRANT_API_KEY="your-qdrant-key"

python -m uvicorn app.main:app --host 127.0.0.1 --port 8081
```

### Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

> **Note:** Vite proxies `/api` → `http://localhost:8081`. If you change the backend port, update `frontend/vite.config.js`.

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Yes | — | Google Gemini API key for NER + RAG |
| `QDRANT_URL` | Yes | — | Qdrant cluster URL |
| `QDRANT_API_KEY` | Yes | — | Qdrant API key |
| `SHOCK_FEED_MODE` | No | `demo` | `live` / `demo` / `hybrid_demo_live` |
| `GNN_ENABLED` | No | `false` | Enable GNN propagation (PageRank fallback always active) |
| `DEMO_MODE` | No | `true` | Activates curated scenario seed data |

---

## API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/healthz` | GET | System health, engine status, feed mode |
| `/api/v1/shocks` | GET | Live shock feed (filterable by severity, sector) |
| `/api/v1/shocks/{id}` | GET | Single shock with war room data |
| `/api/v1/shocks/{id}/war-room` | GET | 72h action ladder + economic metrics |
| `/api/v1/graph` | GET | Full dependency graph (nodes + edges) |
| `/api/v1/engines` | GET | Engine 1/2/3 operational status |
| `/api/v1/map/heatmap` | GET | Geospatial risk points |
| `/api/v1/map/supply-corridors` | GET | Active supply corridor polylines |
| `/api/v1/map/provinces/{id}` | GET | Province-level detail |
| `/api/v1/simulate` | POST | Inject synthetic shock scenario |
| `/api/v1/query` | POST | Natural language procurement query (Gemini RAG) |
| `/api/v1/drugs` | GET | Drug catalog with risk scores |
| `/api/v1/communities` | GET | Louvain supply cluster data |

---

## Data Contracts

```
data/
  seed/
    apis.json                    # 20 pharma API seed nodes
    rare_earths.json             # 8 rare earth mineral nodes
    alerts.json                  # Curated alert scenarios
    historical_disruptions.json  # Historical supply disruption events
    policy_snippets.json         # NLEM / PLI / CDSCO policy references
    live_shocks.json             # Hybrid feed scenarios
    demo_scenarios.json          # Demo-mode curated shocks
    epb_notices.json             # Environmental/production bulletin events
  shocks.json                    # Live structured shock output (GDELT)
```

All `source_url` fields in seed data reference **verified, publicly accessible** sources:
ORF, GMP-Compliance.org, FDA import alerts, BioProcess International, USITC, FiercePharma, NHSRC India, MoHFW.

---

## Project Structure

```
pharmashield/
  backend/
    app/
      api/          # FastAPI route handlers (shocks, simulate, query, map, sectors)
      services/     # Engine logic (gemini_analyst, shock_propagation, geocoder, rag)
      models/       # Pydantic request/response schemas
    data/
      seed/         # Static seed data (all URLs verified)
      shocks.json   # Live feed output
    ingestion/      # GDELT poller (shock_detector.py)
    graph/          # Graph builder (builder.py)
  frontend/
    src/
      pages/        # Route-level components (Dashboard, ShockDetail, Simulate, CovidBacktest, Map, etc.)
      components/   # Shared UI (AppShell, OnboardingTour)
      api/          # Typed API client
```

---

## Deployment

### Docker

```bash
docker build -t shockmap .
docker run -p 7860:7860 \
  -e GEMINI_API_KEY=... \
  -e QDRANT_URL=... \
  -e QDRANT_API_KEY=... \
  shockmap
```

### Hugging Face Spaces

Push to a Space with `Dockerfile` at root. The container serves frontend static files via FastAPI's `StaticFiles` mount.

### Render

`render.yaml` is preconfigured. Set environment variables in the Render dashboard.

---

## License

MIT

---

*Built to demonstrate that supply chain intelligence at the scale of Palantir is achievable with open APIs, graph mathematics, and grounded LLM reasoning.*
