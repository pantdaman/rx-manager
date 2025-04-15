from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Optional
from ..services.store_service import StoreService

router = APIRouter()
store_service = StoreService()

@router.get("/search")
async def search_stores(
    postal_code: Optional[str] = Query(None, description="Postal code to search for"),
    state: Optional[str] = Query(None, description="State to filter by"),
    district: Optional[str] = Query(None, description="District to filter by")
) -> List[Dict]:
    """
    Search for stores based on postal code, state, and district.
    Returns up to 10 matching stores.
    """
    return store_service.search_stores(postal_code, state, district)

@router.get("/{kendra_code}")
async def get_store_details(kendra_code: str) -> Dict:
    """
    Get detailed information for a specific store by its kendra code
    """
    store = store_service.get_store_details(kendra_code)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    return store 