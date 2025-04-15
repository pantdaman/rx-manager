from fastapi import APIRouter, HTTPException
from typing import Dict
from ..services.fda_service import FDAService
from pydantic import BaseModel
from typing import Optional
import requests
from ..services.llm_service import analyze_drug_info

router = APIRouter()
fda_service = FDAService()

class DrugSearchResponse(BaseModel):
    brand_name: Optional[str] = None
    generic_name: Optional[str] = None
    manufacturer: Optional[str] = None
    active_ingredients: Optional[str] = None
    purpose: Optional[str] = None
    warnings: Optional[str] = None
    dosage_administration: Optional[str] = None
    pregnancy_risk: Optional[str] = None

class LLMSearchRequest(BaseModel):
    medicine_name: str

@router.get("/search/{name}")
async def search_drug(name: str) -> Dict:
    """
    Search for drug information by name
    Returns comprehensive drug details from FDA database
    """
    drug_info = await fda_service.search_drug(name)
    if "error" in drug_info:
        raise HTTPException(status_code=404, detail=drug_info["error"])
    return drug_info

@router.get("/interactions/{name}")
async def get_drug_interactions(name: str) -> Dict:
    """
    Get drug interactions and warnings
    """
    interactions = await fda_service.get_drug_interactions(name)
    if "error" in interactions:
        raise HTTPException(status_code=404, detail=interactions["error"])
    return interactions

@router.get("/adverse-events/{name}")
async def get_adverse_events(name: str, limit: int = 10) -> Dict:
    """
    Get reported adverse events for a drug
    """
    events = await fda_service.get_adverse_events(name, limit)
    if "error" in events:
        raise HTTPException(status_code=404, detail=events["error"])
    return events

@router.get("/search/{drug_name}", response_model=DrugSearchResponse)
async def search_drug(drug_name: str):
    """
    Search for drug information using FDA API
    """
    try:
        # Clean and prepare the drug name for search
        cleaned_name = drug_name.strip().upper()
        
        # Generate different variations of the drug name
        name_variations = [
            cleaned_name,
            cleaned_name.split()[0],  # First word only
            cleaned_name.replace(' ', ''),  # Remove spaces
            cleaned_name.replace('-', ''),  # Remove hyphens
            cleaned_name.split('-')[0],  # First part before hyphen
            cleaned_name.split()[0] + ' ' + cleaned_name.split()[-1] if len(cleaned_name.split()) > 1 else cleaned_name  # First and last word
        ]
        
        # Try different search patterns for each name variation
        search_patterns = [
            f"brand_name:{name}",
            f"generic_name:{name}",
            f"substance_name:{name}",
            f"product_ndc:{name}"
        ]
        
        for name_var in name_variations:
            for pattern in search_patterns:
                try:
                    response = requests.get(
                        f"https://api.fda.gov/drug/label.json?search={pattern.format(name=name_var)}&limit=1",
                        timeout=10
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        if data.get('results'):
                            drug = data['results'][0]
                            return {
                                "brand_name": drug.get('brand_name', [''])[0] if drug.get('brand_name') else None,
                                "generic_name": drug.get('generic_name', [''])[0] if drug.get('generic_name') else None,
                                "manufacturer": drug.get('manufacturer_name', [''])[0] if drug.get('manufacturer_name') else None,
                                "active_ingredients": drug.get('active_ingredient', [''])[0] if drug.get('active_ingredient') else None,
                                "purpose": drug.get('purpose', [''])[0] if drug.get('purpose') else None,
                                "warnings": drug.get('warnings', [''])[0] if drug.get('warnings') else None,
                                "dosage_administration": drug.get('dosage_and_administration', [''])[0] if drug.get('dosage_and_administration') else None,
                                "pregnancy_risk": drug.get('pregnancy', [''])[0] if drug.get('pregnancy') else None
                            }
                except requests.exceptions.RequestException:
                    continue
        
        # If no results found with any pattern, try the LLM service
        try:
            drug_info = await analyze_drug_info(drug_name)
            return drug_info
        except Exception as llm_error:
            print(f"LLM fallback error: {str(llm_error)}")
            raise HTTPException(status_code=404, detail="Drug not found in FDA database and LLM service failed")
            
    except requests.exceptions.RequestException as e:
        print(f"FDA API request error: {str(e)}")
        # If FDA API fails, try the LLM service
        try:
            drug_info = await analyze_drug_info(drug_name)
            return drug_info
        except Exception as llm_error:
            print(f"LLM fallback error: {str(llm_error)}")
            raise HTTPException(status_code=500, detail="Failed to fetch drug information")
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/llm-search", response_model=DrugSearchResponse)
async def llm_search(request: LLMSearchRequest):
    """
    Search for drug information using LLM when FDA API fails
    """
    try:
        # Use LLM to analyze drug information
        drug_info = await analyze_drug_info(request.medicine_name)
        return drug_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 