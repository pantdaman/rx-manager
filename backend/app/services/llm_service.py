import google.generativeai as genai
import json
import os
from typing import Dict, Any, Optional
from dotenv import load_dotenv
from ..models.prescription import PrescriptionData

# Load environment variables
load_dotenv()

SYSTEM_PROMPT = """You are a medical prescription analyzer. If the prescription text is not in English, first translate it to English. Then, extract structured information from the English text in the following JSON format:

Focus on:
1. Medicine names
2. Dosage information
3. Frequency (morning, afternoon, evening, night)
4. Duration (if specified)
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
      "duration": "Duration Period",  # Can be null if not specified
      "specialInstructions": "Any special instructions"  # Can be null if not specified
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
- Lower confidence (<70): Unclear writing, ambiguous names, or missing information

If any field is not clearly specified in the prescription, use null for that field."""

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
    Analyze prescription text using Gemini 2.0 Flash
    """
    try:
        # Configure the Gemini API
        api_key = os.getenv('NEXT_PUBLIC_GOOGLE_CLOUD_GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
        if not api_key:
            raise Exception("NEXT_PUBLIC_GOOGLE_CLOUD_GEMINI_API_KEY or GOOGLE_API_KEY environment variable not set")
        
        genai.configure(api_key=api_key)
        
        # Use the correct model name - gemini-2.0-flash
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Generate response
        response = model.generate_content(SYSTEM_PROMPT + "\n\nPrescription text:\n" + text)
        
        # Parse response
        try:
            # Clean the response text
            cleaned_text = response.text.strip()
            # Remove any markdown code block markers
            cleaned_text = cleaned_text.replace('```json', '').replace('```', '').strip()
            
            # Print the cleaned text for debugging
            print(f"Cleaned LLM response: {cleaned_text}")
            
            result = json.loads(cleaned_text)
            
            # Ensure all required fields are present and handle missing fields
            if 'medicines' in result:
                for medicine in result['medicines']:
                    # Ensure required fields
                    medicine['name'] = medicine.get('name', 'Unknown Medicine')
                    medicine['frequency'] = medicine.get('frequency', {
                        'morning': False,
                        'afternoon': False,
                        'evening': False,
                        'night': False
                    })
                    # Make optional fields explicit
                    medicine['dosage'] = medicine.get('dosage')
                    medicine['duration'] = medicine.get('duration')
                    medicine['specialInstructions'] = medicine.get('specialInstructions')
                    medicine['confidence'] = medicine.get('confidence')
            
            # Ensure patient and doctor info
            result['patientInfo'] = result.get('patientInfo', {})
            result['doctorInfo'] = result.get('doctorInfo', {})
            
            if not isinstance(result, dict):
                raise Exception("Response is not a JSON object")
                
            # Convert to PrescriptionData model
            return PrescriptionData(**result)
        except json.JSONDecodeError as e:
            print(f"Error parsing LLM response: {str(e)}")
            print(f"Raw response: {response.text}")
            # Return a default structure instead of raising an error
            return PrescriptionData(
                medicines=[],
                patientInfo={},
                doctorInfo={}
            )
    except Exception as e:
        print(f"Error in analyze_prescription: {str(e)}")
        raise

async def analyze_drug_info(medicine_name: str) -> Dict[str, Optional[str]]:
    """
    Analyze drug information using Gemini 2.0 Flash
    """
    try:
        # Configure the Gemini API
        api_key = os.getenv('NEXT_PUBLIC_GOOGLE_CLOUD_GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
        if not api_key:
            raise Exception("NEXT_PUBLIC_GOOGLE_CLOUD_GEMINI_API_KEY or GOOGLE_API_KEY environment variable not set")
        
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