from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import base64
from .services.ocr_service import perform_ocr
from .services.llm_service import analyze_prescription
from .api.stores import router as stores_router
from .api.drugs import router as drugs_router
from .api.pdf import router as pdf_router
from dotenv import load_dotenv
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = FastAPI(title="RX Manager Demo")

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "https://prescriptai.in",  # Custom domain
        "https://*.prescriptai.in",  # Any subdomain
        "https://rx-manager-frontend-193388977136.us-central1.run.app"  # Google Cloud URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(stores_router, prefix="/api/stores", tags=["stores"])
app.include_router(drugs_router, prefix="/api/drugs", tags=["drugs"])
app.include_router(pdf_router, prefix="/api", tags=["pdf"])

@app.post("/api/analyze-prescription")
async def analyze_prescription_image(
    file: UploadFile = File(...),
    ocrProvider: str = Form(default='google-vision'),
    apiKey: str = Form(default=None)
):
    """
    Process a prescription image or PDF:
    1. Extract text using OCR or PDF text extraction
    2. Analyze text using Gemini Pro
    """
    try:
        logger.info("Received prescription analysis request")
        logger.info(f"OCR Provider: {ocrProvider}")
        logger.info(f"API Key provided: {apiKey is not None}")
        
        # Read and encode file
        file_data = await file.read()
        logger.info(f"File size: {len(file_data)} bytes")
        
        # Convert to base64
        image_base64 = base64.b64encode(file_data).decode('utf-8')
        logger.info("File converted to base64")
        
        # Perform OCR
        logger.info("Starting OCR process")
        ocr_text = await perform_ocr(
            image_base64=image_base64,
            is_pdf=file.filename.lower().endswith('.pdf'),
            ocr_provider=ocrProvider,
            api_key=apiKey
        )
        logger.info(f"OCR completed. Text length: {len(ocr_text)}")
        
        # Analyze prescription
        logger.info("Starting prescription analysis")
        result = await analyze_prescription(ocr_text)
        logger.info("Prescription analysis completed")
        
        return result
    except Exception as e:
        logger.error(f"Error processing prescription: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.get("/")
async def root():
    return {"message": "Welcome to RX Manager API"} 