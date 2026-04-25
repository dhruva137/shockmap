#!/bin/bash

# PharmaShield Scaffolding Script
# Creates the project structure with stub files.

PROJECT_NAME="pharmashield"

# Function to create a file with content if it doesn't exist
create_file() {
    local file_path="$1"
    local content="$2"
    if [ ! -f "$file_path" ]; then
        mkdir -p "$(dirname "$file_path")"
        cat > "$file_path" <<EOF
$content
EOF
    fi
}

# Function to create a python stub
create_py_stub() {
    local file_path="$1"
    local description="$2"
    create_file "$file_path" "\"\"\"
$description
\"\"\""
}

# Function to create a dart stub
create_dart_stub() {
    local file_path="$1"
    local class_name="$2"
    create_file "$file_path" "// TODO: Implement $class_name
class $class_name {
  // Add implementation here
}"
}

mkdir -p $PROJECT_NAME
cd $PROJECT_NAME

# Root Files
create_file "README.md" "# PharmaShield

India's pharmaceutical import dependency mapping and early-warning alert system.

![Phase 1 — WIP](https://img.shields.io/badge/Phase%201-WIP-orange)

This project is licensed under the MIT License."

create_file "LICENSE" "MIT License

Copyright (c) 2026 PharmaShield Team

Permission is hereby granted, free of charge, to any person obtaining a copy of this software..."

create_file ".gitignore" "# Python
.env
__pycache__/
*.pyc
venv/

# Flutter
build/
.dart_tool/

# Data
data/raw/*
data/processed/*

# ML
*.pt
!ml/weights/"

create_file ".env.example" "GEMINI_API_KEY=
QDRANT_URL=
QDRANT_API_KEY=
FIREBASE_PROJECT_ID=
BACKEND_URL=http://localhost:8080"

# Backend
create_file "backend/Dockerfile" "FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y gcc g++ && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV PORT=8080
CMD uvicorn app.main:app --host 0.0.0.0 --port \${PORT}"

create_file "backend/render.yaml" "services:
  - type: web
    name: pharmashield-api
    env: docker
    region: singapore
    plan: free
    healthCheckPath: /healthz
    envVars:
      - key: GEMINI_API_KEY
        sync: false
      - key: QDRANT_URL
        sync: false
      - key: QDRANT_API_KEY
        sync: false"

create_file "backend/requirements.txt" "fastapi==0.115.0
uvicorn[standard]==0.32.0
pydantic==2.9.0
pydantic-settings==2.5.2
google-generativeai==0.8.3
qdrant-client==1.12.0
torch==2.4.1
torch-geometric==2.6.1
networkx==3.3
pandas==2.2.3
numpy==1.26.4
python-dotenv==1.0.1
httpx==0.27.2
tenacity==9.0.0
beautifulsoup4==4.12.3
lxml==5.3.0
playwright==1.48.0"

create_py_stub "backend/app/__init__.py" "App initialization module."
create_py_stub "backend/app/main.py" "Main FastAPI application entry point."
create_py_stub "backend/app/config.py" "Configuration management using Pydantic Settings."
create_py_stub "backend/app/deps.py" "Dependency injection for FastAPI."
create_py_stub "backend/app/data_loader.py" "Initial data loading and bootstrapping."

create_py_stub "backend/app/api/__init__.py" "API router registration."
create_py_stub "backend/app/api/graph.py" "Endpoints for supply chain graph visualization."
create_py_stub "backend/app/api/drugs.py" "Endpoints for drug dependency data."
create_py_stub "backend/app/api/alerts.py" "Endpoints for early-warning alerts."
create_py_stub "backend/app/api/query.py" "Endpoints for natural language queries."
create_py_stub "backend/app/api/simulate.py" "Endpoints for shock simulation scenarios."

create_py_stub "backend/app/services/__init__.py" "Business logic services."
create_py_stub "backend/app/services/graph_service.py" "Service for graph operations."
create_py_stub "backend/app/services/criticality.py" "Logic for calculating drug criticality."
create_py_stub "backend/app/services/shock_propagation.py" "Modeling shock propagation in networks."
create_py_stub "backend/app/services/gemini_analyst.py" "Integration with Gemini for analysis."
create_py_stub "backend/app/services/retriever.py" "Vector retrieval from Qdrant."

create_py_stub "backend/app/models/__init__.py" "Pydantic and Database models."
create_py_stub "backend/app/models/drug.py" "Drug dependency model."
create_py_stub "backend/app/models/alert.py" "Alert notification model."
create_py_stub "backend/app/models/graph.py" "Graph node and edge models."

# ML
mkdir -p ml/notebooks
touch ml/notebooks/.gitkeep
create_py_stub "ml/train_gnn.py" "Training script for Graph Neural Network."
create_py_stub "ml/infer_gnn.py" "Inference script for GNN risk prediction."
mkdir -p ml/weights
touch ml/weights/.gitkeep

# Ingestion
create_py_stub "ingestion/__init__.py" "Data ingestion pipelines."
create_py_stub "ingestion/scrape_hebei_epb.py" "Scraper for China Hebei EPB data."
create_py_stub "ingestion/scrape_fda_alerts.py" "Scraper for US FDA drug shortages."
create_py_stub "ingestion/ingest_dgcis.py" "Importer for DGCIS trade data."
create_py_stub "ingestion/ingest_nlem.py" "Importer for NLEM drug list."
create_py_stub "ingestion/shared/__init__.py" "Shared ingestion utilities."
create_py_stub "ingestion/shared/gemini_client.py" "Helper for Gemini extraction."
create_py_stub "ingestion/shared/playwright_helpers.py" "Playwright automation helpers."

# Data
mkdir -p data/seed data/raw data/processed
touch data/seed/.gitkeep data/raw/.gitkeep data/processed/.gitkeep

# Frontend
create_file "frontend/pubspec.yaml" "name: pharmashield_frontend
description: PharmaShield Flutter Web Dashboard
version: 1.0.0+1
environment:
  sdk: '>=3.0.0 <4.0.0'"
create_file "frontend/analysis_options.yaml" "include: package:flutter_lints/rules.yaml"
create_file "frontend/firebase.json" "{}"
create_file "frontend/.firebaserc" "{}"
create_file "frontend/web/index.html" "<!DOCTYPE html><html><body>PharmaShield</body></html>"
create_file "frontend/web/manifest.json" "{}"

create_file "frontend/lib/main.dart" "// TODO: Entry point
void main() {
  // Entry point
}"
create_dart_stub "frontend/lib/app/theme.dart" "AppTheme"
create_dart_stub "frontend/lib/app/router.dart" "AppRouter"
create_dart_stub "frontend/lib/screens/dashboard_screen.dart" "DashboardScreen"
create_dart_stub "frontend/lib/screens/drug_detail_screen.dart" "DrugDetailScreen"
create_dart_stub "frontend/lib/screens/alerts_screen.dart" "AlertsScreen"
create_dart_stub "frontend/lib/screens/query_screen.dart" "QueryScreen"
create_dart_stub "frontend/lib/widgets/india_map.dart" "IndiaMap"
create_dart_stub "frontend/lib/widgets/alert_card.dart" "AlertCard"
create_dart_stub "frontend/lib/widgets/risk_chip.dart" "RiskChip"
create_dart_stub "frontend/lib/widgets/nl_query_bar.dart" "NLQueryBar"
create_dart_stub "frontend/lib/services/api_client.dart" "ApiClient"
create_dart_stub "frontend/lib/models/drug.dart" "Drug"
create_dart_stub "frontend/lib/models/alert.dart" "Alert"
create_dart_stub "frontend/lib/models/graph_node.dart" "GraphNode"

# Deck & Demo
mkdir -p deck
touch deck/.gitkeep
create_file "demo/script.md" "# Demo Script
1. Dashboard Overview
2. Alert Detection
3. NL Query Example"

# Docs
create_file "docs/ARCHITECTURE.md" "# Architecture Overview"
create_file "docs/DATA_SOURCES.md" "# Data Sources Reference"
create_file "docs/PHASE2_ROADMAP.md" "# Phase 2 Roadmap"

echo "Scaffolding complete for PharmaShield."
