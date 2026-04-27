"""Supply Chain Depth Data — read real mock data"""
from typing import Dict, Any
from ..data_loader import DataLoader

class SupplyChainDepthService:
    """Loads and serves detailed supply chain data for provinces"""
    
    def __init__(self, data_loader: DataLoader):
        self.data = data_loader.load_json('supply_chain_depth.json', {})
    
    def get_province_detail(self, province_id: str) -> Dict[str, Any]:
        """Get detailed supply chain data for a province"""
        provinces = self.data.get('provinces', {})
        for name, data in provinces.items():
            if name.lower() == province_id.lower() or data.get('name', '').lower() == province_id.lower():
                return data
        return None
    
    def list_provinces(self):
        """List all provinces with supply chain data"""
        return list(self.data.get('provinces', {}).keys())
    
    def get_key_vendors(self, province_id: str):
        """Get key vendors for a province"""
        detail = self.get_province_detail(province_id)
        if detail:
            return detail.get('key_vendors', [])
        return []
    
    def get_concentration_metrics(self, province_id: str) -> Dict[str, Any]:
        """Get supply concentration metrics for a province"""
        detail = self.get_province_detail(province_id)
        if detail:
            return {
                'supply_concentration_index': detail.get('supply_concentration_index', 0),
                'diversification_score': detail.get('diversification_score', 0),
                'stockpile_buffer_days': detail.get('stockpile_buffer_days', 0),
                'imports_monthly_value_usd_millions': detail.get('imports_monthly_value_usd_millions', 0),
                'recent_disruptions': detail.get('recent_disruptions', 0),
                'geopolitical_risk': detail.get('geopolitical_risk', 0),
            }
        return {}
