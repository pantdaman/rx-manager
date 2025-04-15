from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import PyPDF2
import io

router = APIRouter()

@router.post("/extract-text")
async def extract_text(pdf: UploadFile = File(...)):
    try:
        # Validate file type
        if not pdf.filename.endswith('.pdf'):
            raise HTTPException(
                status_code=400,
                detail="File must be a PDF"
            )

        # Read the PDF file
        contents = await pdf.read()
        
        # Validate file size (5MB limit)
        if len(contents) > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="File size must be less than 5MB"
            )
        
        pdf_file = io.BytesIO(contents)
        
        # Create PDF reader object
        try:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid PDF file: {str(e)}"
            )
        
        # Extract text from all pages
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        
        if not text.strip():
            raise HTTPException(
                status_code=400,
                detail="No text could be extracted from the PDF"
            )
        
        return JSONResponse(
            content={"text": text},
            status_code=200
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to extract text from PDF: {str(e)}"
        ) 