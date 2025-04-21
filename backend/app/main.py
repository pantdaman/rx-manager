from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import base64
from .services.ocr_service import perform_ocr
from .services.llm_service import analyze_prescription
from .api.stores import router as stores_router
from .api.drugs import router as drugs_router
from .api.pdf import router as pdf_router

app = FastAPI(title="RX Manager Demo")

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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
        # Read and encode file
        file_data = await file.read()
        file_base64 = base64.b64encode(file_data).decode('utf-8')
        
        # Determine file type
        is_pdf = file.content_type == 'application/pdf'
        
        # Extract text using specified OCR provider
        text = await perform_ocr(
            file_base64,
            is_pdf=is_pdf,
            ocr_provider=ocrProvider,
            api_key=apiKey
        )
        
        if not text:
            raise HTTPException(status_code=400, detail="Could not extract text from file")
            
        # Analyze with LLM
        result = await analyze_prescription(text)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.get("/")
async def root():
    return {"message": "Welcome to the Medicine Information API"} 