"""
Endpoints for running what-if supply chain simulations.
"""

import logging
from datetime import datetime
from typing import Annotated, Any, List, Literal
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from ..deps import get_shock_propagator, get_graph_service, get_data_loader, get_gemini_analyst
from ..services.shock_propagation import ShockPropagator
from ..services.graph_service import GraphService
from ..services.gemini_analyst import GeminiAnalyst
from ..models.drug import Drug

# Setup Logging
logger = logging.getLogger("backend.simulate")

router = APIRouter(prefix="/api/v1", tags=["simulate"])


class SimulationRequest(BaseModel):
    """Parameters for a supply chain shock simulation."""
    province: str = Field(..., description="The ID of the province where the shock occurs")
    duration_days: int = Field(..., ge=1, le=180, description="Duration of the disruption in days")
    severity: Literal["warning", "partial_shutdown", "full_shutdown"] = Field(..., description="Intensity of the shock")


class SimulationResult(BaseModel):
    """The outcome of a shock simulation."""
    affected_drugs: List[Drug] = Field(..., description="List of top 10 drugs most affected by the shock")
    propagation_explanation: str = Field(..., description="AI or rule-based explanation of why these drugs are at risk")
    simulated_at: datetime = Field(default_factory=datetime.utcnow)
    # Economic impact estimates (USD millions)
    estimated_stockout_cost_usd_m: float = Field(0.0, description="Estimated cost of stockouts in USD millions")
    emergency_procurement_cost_usd_m: float = Field(0.0, description="Emergency procurement premium cost in USD millions")
    total_economic_impact_usd_m: float = Field(0.0, description="Total estimated economic impact in USD millions")
    cost_by_drug: List[dict] = Field(default_factory=list, description="Per-drug cost breakdown")


@router.post("/simulate", response_model=SimulationResult)
async def post_simulate(
    request: SimulationRequest,
    propagator: Annotated[ShockPropagator, Depends(get_shock_propagator)],
    graph_service: Annotated[GraphService, Depends(get_graph_service)],
    data_loader: Annotated[Any, Depends(get_data_loader)],
    analyst: Annotated[GeminiAnalyst, Depends(get_gemini_analyst)]
) -> SimulationResult:
    """
    Simulates a regional production shock and predicts its impact on the drug supply.
    
    Uses the GNN shock propagation model to estimate risk scores across the network.
    """
    logger.info(f"Simulation Request: province={request.province}, dur={request.duration_days}, sev={request.severity}")
    
    # 1. Validate Province — be lenient: accept province name or ID
    node = graph_service.get_node(request.province)
    if not node or node["type"] != "province":
        # Also try matching by name (case-insensitive)
        all_provinces = graph_service.nodes_by_type("province")
        match = next(
            (p for p in all_provinces if p and p["name"].lower() == request.province.lower()),
            None
        )
        if match:
            request = request.model_copy(update={"province": match["id"]})
        else:
            available = [p["name"] for p in all_provinces if p]
            raise HTTPException(
                status_code=422,
                detail=f"Province '{request.province}' not found. Available: {', '.join(available[:10])}"
            )

    # 2. Run Shock Propagation
    risk_map = propagator.simulate_shock(
        province=request.province,
        duration_days=request.duration_days,
        severity=request.severity
    )
    
    # 3. Filter and Hydrate Top 10
    filtered_risks = sorted(
        [(d_id, score) for d_id, score in risk_map.items() if score > 30],
        key=lambda x: x[1],
        reverse=True
    )[:10]
    
    hydrated_drugs = []
    top_drug_names = []
    for d_id, score in filtered_risks:
        drug = data_loader.get_drug(d_id)
        if drug:
            # Pydantic v2: use model_copy to update immutable fields
            drug = drug.model_copy(update={"current_risk": score})
            hydrated_drugs.append(drug)
            top_drug_names.append(drug.name)

    # 4. Generate Explanation (falls back to rule-based if Gemini unavailable)
    explanation = propagator.propagate_explanation(
        province=request.province,
        duration_days=request.duration_days,
        severity=request.severity,
        top_affected=top_drug_names
    )

    if top_drug_names:
        try:
            explain_prompt = (
                f"Briefly explain in 2-3 sentences why a {request.severity.replace('_', ' ')} "
                f"in {request.province} for {request.duration_days} days affects these drugs: "
                f"{', '.join(top_drug_names)}. Focus on shared API precursors and regional manufacturing concentration."
            )
            explanation = analyst.gemini_client.generate_text(
                prompt=explain_prompt,
                system_instruction="You are a pharmaceutical supply chain analyst. Be concise and factual.",
                temperature=0.1,
                max_output_tokens=200,
                fallback="",
            )
        except Exception as e:
            logger.warning(f"Gemini explanation failed: {e}")

    # 5. Cost Estimation (economic model)
    # Base annual market values (USD million) by therapeutic class — rough proxies
    CLASS_VALUE_USD_M = {
        "antibiotic": 45, "antimicrobial": 45, "anti-infective": 40,
        "analgesic": 60, "anti-inflammatory": 55, "antipyretic": 50,
        "antidiabetic": 80, "cardiovascular": 90, "antihypertensive": 85,
        "anticoagulant": 70, "antihistamine": 30, "antifungal": 35,
        "antiviral": 65, "oncology": 120, "immunology": 110,
        "rare earth": 25, "mineral": 20,
    }
    SEVERITY_MULTIPLIER = {"warning": 0.15, "partial_shutdown": 0.45, "full_shutdown": 0.85}
    sev_mult = SEVERITY_MULTIPLIER.get(request.severity, 0.5)
    duration_factor = min(1.0, request.duration_days / 90)
    emergency_premium = 0.30  # 30% premium for emergency procurement

    cost_by_drug = []
    total_stockout = 0.0
    total_emergency = 0.0

    for drug in hydrated_drugs:
        tc = (drug.therapeutic_class or "").lower()
        base_val = next(
            (v for k, v in CLASS_VALUE_USD_M.items() if k in tc),
            30.0  # default
        )
        risk_factor = (drug.current_risk or 0) / 100.0
        stockout_cost = base_val * risk_factor * sev_mult * duration_factor
        emergency_cost = base_val * risk_factor * sev_mult * emergency_premium * duration_factor
        total_stockout += stockout_cost
        total_emergency += emergency_cost
        cost_by_drug.append({
            "id": drug.id,
            "name": drug.name,
            "stockout_cost_usd_m": round(stockout_cost, 2),
            "emergency_cost_usd_m": round(emergency_cost, 2),
            "total_cost_usd_m": round(stockout_cost + emergency_cost, 2),
        })

    return SimulationResult(
        affected_drugs=hydrated_drugs,
        propagation_explanation=explanation,
        simulated_at=datetime.utcnow(),
        estimated_stockout_cost_usd_m=round(total_stockout, 2),
        emergency_procurement_cost_usd_m=round(total_emergency, 2),
        total_economic_impact_usd_m=round(total_stockout + total_emergency, 2),
        cost_by_drug=cost_by_drug,
    )
