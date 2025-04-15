import PyPDF2
import re
from typing import List, Dict, Optional
import json
from pathlib import Path
import os

class StoreService:
    def __init__(self):
        self.stores = self.load_stores()
        self.stores_cache = None
        self.pdf_path = os.path.join(os.path.dirname(__file__), '../data/stores.pdf')
        self.json_path = os.path.join(os.path.dirname(__file__), '../data/stores.json')
        
    def load_stores_from_pdf(self) -> List[Dict]:
        """Load and parse store information from PDF."""
        if self.stores_cache is not None:
            return self.stores_cache

        stores = []
        try:
            with open(self.pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                
                for page in pdf_reader.pages:
                    text = page.extract_text()
                    # Assuming each store entry has a pattern like:
                    # Store Name | Address | Postal Code | Phone
                    store_entries = re.findall(r'(.*?)\|(.*?)\|(\d{6})\|(.*?)(?=\n|$)', text)
                    
                    for entry in store_entries:
                        stores.append({
                            'name': entry[0].strip(),
                            'address': entry[1].strip(),
                            'postal_code': entry[2].strip(),
                            'phone': entry[3].strip()
                        })
            
            self.stores_cache = stores
            return stores
        except Exception as e:
            print(f"Error loading PDF: {str(e)}")
            return []

    def load_stores(self) -> List[Dict]:
        """Load store data from JSON file"""
        json_path = os.path.join(os.path.dirname(__file__), "../data/stores.json")
        try:
            with open(json_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading stores: {e}")
            return []

    def search_stores(self, postal_code: Optional[str] = None, 
                     state: Optional[str] = None, 
                     district: Optional[str] = None) -> List[Dict]:
        """
        Search stores based on postal code, state, and district
        Returns up to 10 matching stores
        """
        filtered_stores = self.stores

        if postal_code:
            # First try exact match
            exact_matches = [s for s in filtered_stores if s['pin_code'] == postal_code]
            if exact_matches:
                filtered_stores = exact_matches
            else:
                # Try matching first 3 digits
                prefix = postal_code[:3]
                filtered_stores = [s for s in filtered_stores if s['pin_code'].startswith(prefix)]

        if state:
            filtered_stores = [s for s in filtered_stores if s['state'].lower() == state.lower()]

        if district:
            filtered_stores = [s for s in filtered_stores if s['district'].lower() == district.lower()]

        return filtered_stores[:10]

    def get_store_details(self, kendra_code: str) -> Optional[Dict]:
        """Get detailed information for a specific store by kendra_code"""
        for store in self.stores:
            if store['kendra_code'] == kendra_code:
                return store
        return None 