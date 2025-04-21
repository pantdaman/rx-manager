import google.generativeai as genai
import json
import os
from typing import Dict, Any, Optional
from dotenv import load_dotenv
from ..models.prescription import PrescriptionData

# Load environment variables
load_dotenv()

SYSTEM_PROMPT = """You are a medical prescription analyzer. Extract structured information from the given prescription text.


Focus on:
1. Medicine names
2. Dosage information
3. Frequency (morning, afternoon, evening, night)
4. Duration
5. Special instructions

IMPORTANT: You must respond with ONLY a valid JSON object in the following format, with no additional text or explanations:

{
  "medicines": [
    {
      "name": "Medicine Name",
      "confidence": 95,  # Confidence score between 0-100 indicating how sure you are about this medicine's information
      "dosage": "Dosage Amount",
      "frequency": {
        "morning": true/false,
        "afternoon": true/false,
        "evening": true/false,
        "night": true/false
      },
      "duration": "Duration Period",
      "specialInstructions": "Any special instructions"
    }
  ],
  "patientInfo": {
    "name": "Patient Name if available",
    "age": "Patient Age if available",
    "gender": "Patient Gender if available"
  },
  "doctorInfo": {
    "name": "Doctor Name if available",
    "specialization": "Specialization if available"
  }
}

For each medicine, provide a confidence score between 0-100 that indicates how certain you are about the extracted information. Consider:
- Higher confidence (90-100): Clear, standard medicine names and complete information
- Medium confidence (70-89): Slightly unclear writing but recognizable medicine names
- Lower confidence (<70): Unclear writing, ambiguous names, or missing information"""

def list_available_models():
    """List all available models from the Gemini API."""
    try:
        api_key = os.getenv('GOOGLE_API_KEY')
        if not api_key:
            raise Exception("GOOGLE_API_KEY environment variable not set")
        
        genai.configure(api_key=api_key)
        for m in genai.list_models():
            print(f"Model: {m.name}")
            print(f"Supported methods: {m.supported_generation_methods}")
            print("---")
    except Exception as e:
        print(f"Error listing models: {str(e)}")

async def analyze_prescription(text: str) -> PrescriptionData:
    """
    Analyze prescription text using Google's Gemini 2.0 Flash model.
    
    Args:
        text: The prescription text to analyze
    
    Returns:
        Structured prescription data
    """
    try:
        # Get the API key
        api_key = os.getenv('GOOGLE_API_KEY')
        if not api_key:
            raise Exception("GOOGLE_API_KEY environment variable not set")

        # Configure the Gemini API with API key
        genai.configure(api_key=api_key)
        
        # Create the model - using gemini-2.0-flash
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Create the prompt
        prompt = f"{SYSTEM_PROMPT}\n\nPrescription text:\n{text}\n\nRemember: Respond with ONLY the JSON object, no additional text."
        
        # Generate response
        response = model.generate_content(prompt)
        
        # Check if response is empty
        if not response.text:
            raise Exception("Empty response from Gemini")
            
        # Print the raw response for debugging
        print(f"Raw Gemini response: {response.text}")
        
        # Clean the response text
        cleaned_text = response.text.strip()
        # Remove any markdown code block markers if present
        cleaned_text = cleaned_text.replace('```json', '').replace('```', '').strip()
        
        # Try to parse the response
        try:
            result = json.loads(cleaned_text)
        except json.JSONDecodeError as e:
            print(f"Failed to parse JSON: {e}")
            print(f"Cleaned response text: {cleaned_text}")
            raise Exception(f"Invalid JSON response from Gemini: {str(e)}")
        
        # Validate the result structure
        if not isinstance(result, dict):
            raise Exception("Response is not a JSON object")
            
        if "medicines" not in result:
            raise Exception("Response missing 'medicines' field")
            
        # Ensure each medicine has a confidence score
        for medicine in result["medicines"]:
            if "confidence" not in medicine:
                # Add a default confidence score if missing
                medicine["confidence"] = 70  # Medium confidence as default
        
        return result

    except Exception as e:
        print(f"Error in analyze_prescription: {str(e)}")
        raise 

async def analyze_drug_info(medicine_name: str) -> Dict[str, Optional[str]]:
    """
    Analyze drug information using Gemini 2.0 Flash
    """
    try:
        # Configure the Gemini API
        api_key = os.getenv('GOOGLE_API_KEY')
        if not api_key:
            raise Exception("GOOGLE_API_KEY environment variable not set")
        
        genai.configure(api_key=api_key)
        
        # Use the correct model name - gemini-2.0-flash
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        prompt = f"""
        You are a medical information assistant. Please provide a concise summary about the medicine/drug: {medicine_name}
        
        Format your response as a JSON object with the following fields:
        {{
            "brand_name": "Brand name (if known)",
            "generic_name": "Generic name",
            "manufacturer": "Manufacturer (if known)",
            "active_ingredients": "Key active ingredients",
            "purpose": "Main medical use (1-2 sentences)",
            "warnings": "Key warnings (1-2 sentences)",
            "dosage_administration": "Standard dosage (1 sentence)",
            "pregnancy_risk": "Pregnancy category (if known)"
        }}
        
        Guidelines:
        1. Keep all responses brief and to the point
        2. Focus on essential information only
        3. Use simple, clear language
        4. If unsure about any field, use null
        5. Maximum 2 sentences per field
        """
        
        # Generate response and ensure we get the text
        response = model.generate_content(prompt)
        
        # Print the raw response for debugging
        print(f"Raw Gemini response: {response.text}")
        
        # Parse the response text as JSON
        try:
            # Clean the response text
            cleaned_text = response.text.strip()
            # Remove any markdown code block markers if present
            cleaned_text = cleaned_text.replace('```json', '').replace('```', '').strip()
            
            drug_info = json.loads(cleaned_text)
            
            # Ensure all fields are concise
            for key in drug_info:
                if drug_info[key] and isinstance(drug_info[key], str):
                    # Split into sentences and take first 2
                    sentences = drug_info[key].split('.')
                    drug_info[key] = '. '.join(sentences[:2]).strip()
            
            return drug_info
        except json.JSONDecodeError as e:
            print(f"Failed to parse JSON: {e}")
            print(f"Cleaned response text: {cleaned_text}")
            # If JSON parsing fails, return a structured response with the raw information
            return {
                "brand_name": None,
                "generic_name": medicine_name,
                "manufacturer": None,
                "active_ingredients": None,
                "purpose": response.text,
                "warnings": "Consult your healthcare provider for accurate information about this medication.",
                "dosage_administration": "Dosage should be determined by a healthcare provider.",
                "pregnancy_risk": "Consult your healthcare provider for information about use during pregnancy."
            }
        
    except Exception as e:
        print(f"Error in analyze_drug_info: {str(e)}")
        raise 