from fastapi import APIRouter, UploadFile, File, HTTPException
from ..services.ocr_service import perform_ocr
from ..services.llm_service import analyze_prescription
from ..models.prescription import PrescriptionData
import base64

router = APIRouter()

@router.post("/process", response_model=PrescriptionData)
async def process_prescription(file: UploadFile = File(...)) -> PrescriptionData:
    """
    Process a prescription image:
    1. Perform OCR to extract text
    2. Analyze the text using LLM to extract structured data
    """
    try:
        # Read the image file
        image_data = await file.read()
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        # Perform OCR
        text = await perform_ocr(image_base64)
        if not text:
            raise HTTPException(status_code=400, detail="Failed to extract text from image")
            
        # Analyze text with LLM
        prescription_data = await analyze_prescription(text)
        return prescription_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 