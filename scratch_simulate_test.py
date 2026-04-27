import sys
import asyncio
from pathlib import Path

# Add backend to path
sys.path.append(str(Path("c:/Users/Dhruva P Gowda/Documents/pharmashield/backend").resolve()))

from app.api.simulate import SimulationRequest, post_simulate
from app.deps import get_shock_propagator, get_graph_service, get_data_loader, get_gemini_analyst

async def main():
    try:
        req = SimulationRequest(province="Hubei", duration_days=30, severity="warning")
        
        propagator = get_shock_propagator()
        graph_service = get_graph_service()
        data_loader = get_data_loader()
        analyst = get_gemini_analyst()
        
        res = await post_simulate(req, propagator, graph_service, data_loader, analyst)
        print("Success:", res)
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
