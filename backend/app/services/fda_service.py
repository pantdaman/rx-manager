import aiohttp
from typing import Dict, List, Optional
import json

class FDAService:
    """Service for interacting with FDA Drug APIs"""
    
    BASE_URL = "https://api.fda.gov/drug"
    
    async def search_drug(self, name: str) -> Dict:
        """
        Search for drug information by name using FDA API
        Returns drug details including active ingredients, usage, warnings etc.
        """
        try:
            async with aiohttp.ClientSession() as session:
                # Search in drug label endpoint
                url = f"{self.BASE_URL}/label.json"
                params = {
                    'search': f'openfda.brand_name:"{name}"+openfda.generic_name:"{name}"',
                    'limit': 1
                }
                
                async with session.get(url, params=params) as response:
                    if response.status == 404:
                        return {"error": "Drug not found"}
                    
                    data = await response.json()
                    
                    if 'results' not in data or not data['results']:
                        return {"error": "No results found"}
                        
                    result = data['results'][0]
                    
                    # Extract relevant information
                    drug_info = {
                        "brand_name": self._get_openfda_field(result, 'brand_name'),
                        "generic_name": self._get_openfda_field(result, 'generic_name'),
                        "manufacturer": self._get_openfda_field(result, 'manufacturer_name'),
                        "product_type": self._get_openfda_field(result, 'product_type'),
                        "route": self._get_openfda_field(result, 'route'),
                        "active_ingredients": self._get_field(result, 'active_ingredient'),
                        "purpose": self._get_field(result, 'purpose'),
                        "warnings": self._get_field(result, 'warnings'),
                        "dosage_administration": self._get_field(result, 'dosage_and_administration'),
                        "pregnancy_risk": self._get_field(result, 'pregnancy'),
                    }
                    
                    return drug_info
                    
        except Exception as e:
            print(f"Error searching FDA drug: {str(e)}")
            return {"error": f"Failed to fetch drug information: {str(e)}"}
    
    async def get_drug_interactions(self, name: str) -> Dict:
        """Get drug interactions information"""
        try:
            async with aiohttp.ClientSession() as session:
                url = f"{self.BASE_URL}/label.json"
                params = {
                    'search': f'openfda.brand_name:"{name}"+openfda.generic_name:"{name}"',
                    'limit': 1
                }
                
                async with session.get(url, params=params) as response:
                    if response.status == 404:
                        return {"error": "Drug not found"}
                    
                    data = await response.json()
                    
                    if 'results' not in data or not data['results']:
                        return {"error": "No results found"}
                        
                    result = data['results'][0]
                    
                    return {
                        "drug_interactions": self._get_field(result, 'drug_interactions'),
                        "contraindications": self._get_field(result, 'contraindications'),
                        "boxed_warnings": self._get_field(result, 'boxed_warning'),
                    }
                    
        except Exception as e:
            print(f"Error fetching drug interactions: {str(e)}")
            return {"error": f"Failed to fetch drug interactions: {str(e)}"}
    
    async def get_adverse_events(self, name: str, limit: int = 10) -> Dict:
        """Get adverse events reports for a drug"""
        try:
            async with aiohttp.ClientSession() as session:
                url = f"{self.BASE_URL}/event.json"
                params = {
                    'search': f'patient.drug.medicinalproduct:"{name}"',
                    'limit': limit
                }
                
                async with session.get(url, params=params) as response:
                    if response.status == 404:
                        return {"error": "No adverse events found"}
                    
                    data = await response.json()
                    
                    if 'results' not in data or not data['results']:
                        return {"error": "No results found"}
                    
                    events = []
                    for result in data['results']:
                        event = {
                            "reaction": [r.get('reactionmeddrapt') for r in result.get('patient', {}).get('reaction', [])],
                            "severity": result.get('serious'),
                            "outcome": result.get('patient', {}).get('reaction', [{}])[0].get('outcome'),
                            "report_date": result.get('receiptdate'),
                        }
                        events.append(event)
                    
                    return {"adverse_events": events}
                    
        except Exception as e:
            print(f"Error fetching adverse events: {str(e)}")
            return {"error": f"Failed to fetch adverse events: {str(e)}"}
    
    def _get_openfda_field(self, data: Dict, field: str) -> Optional[str]:
        """Helper to get field from openfda section"""
        try:
            value = data.get('openfda', {}).get(field, [])
            return value[0] if value else None
        except:
            return None
    
    def _get_field(self, data: Dict, field: str) -> Optional[str]:
        """Helper to get field from main data"""
        try:
            value = data.get(field, [])
            return value[0] if value else None
        except:
            return None 