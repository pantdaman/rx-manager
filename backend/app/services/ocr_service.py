from google.cloud import vision
import os
from dotenv import load_dotenv
import base64
import PyPDF2
from io import BytesIO
import io
from PIL import Image
import shutil

# Load environment variables
load_dotenv()

# Check if tesseract is installed
def is_tesseract_installed():
    return shutil.which('tesseract') is not None

# Lazy import of pytesseract to avoid errors if not installed
def get_pytesseract():
    try:
        import pytesseract
        return pytesseract
    except ImportError:
        raise Exception(
            "Tesseract Python package not found. Please install it using:\n"
            "python3 -m pip install pytesseract\n"
            "Also ensure Tesseract is installed on your system:\n"
            "- macOS: brew install tesseract\n"
            "- Ubuntu: sudo apt-get install tesseract-ocr"
        )

async def perform_ocr(image_base64: str, is_pdf: bool = False, ocr_provider: str = 'google-vision', api_key: str = None) -> str:
    """
    Perform OCR on the given image or PDF using selected provider.
    
    Args:
        image_base64: Base64 encoded image/PDF data
        is_pdf: Whether the input is a PDF file
        ocr_provider: OCR provider to use ('tesseract' or 'google-vision')
        api_key: API key for Google Vision (required if using google-vision)
    
    Returns:
        Extracted text from the image/PDF
    """
    try:
        print(f"Performing OCR with provider: {ocr_provider}")
        
        
        # Use API key from request or fallback to .env
        final_api_key = api_key or os.getenv('NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY')
        if not final_api_key:
            raise Exception("No API key found in request or environment variables")
            
        print(f"Using API Key: {'Configured' if final_api_key else 'Not found'}")
        print(f"Final API Key: {final_api_key}")
        # Decode the base64 data
        content = base64.b64decode(image_base64)
        
        if is_pdf:
            # Handle PDF files using PyPDF2
            pdf_file = BytesIO(content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            
            # Extract text from each page
            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            
            if not text.strip():
                raise Exception("No text could be extracted from the PDF")
                
            return text
            
        else:
            # Handle image files based on provider
            if ocr_provider == 'tesseract':
                # Check if tesseract is installed
                if not is_tesseract_installed():
                    raise Exception(
                        "Tesseract not found. Please install it on your system:\n"
                        "- macOS: brew install tesseract\n"
                        "- Ubuntu: sudo apt-get install tesseract-ocr"
                    )
                return perform_tesseract_ocr(content)
            elif ocr_provider == 'google-vision':
                return perform_google_vision_ocr(content, final_api_key)
            else:
                raise Exception(f"Unsupported OCR provider: {ocr_provider}")
            
    except Exception as e:
        print(f"Error performing OCR: {str(e)}")
        if "No text detected" in str(e):
            raise Exception("Could not extract any text from the image. Please ensure the image is clear and contains readable text.")
        elif "No text could be extracted" in str(e):
            raise Exception("Could not extract any text from the PDF. The PDF might be scanned or contain only images.")
        else:
            raise Exception(f"Failed to process file: {str(e)}")

def perform_tesseract_ocr(content: bytes) -> str:
    """Perform OCR using Tesseract."""
    try:
        # Get pytesseract module
        pytesseract = get_pytesseract()
        
        # Convert bytes to PIL Image
        image = Image.open(io.BytesIO(content))
        
        # Perform OCR
        text = pytesseract.image_to_string(image)
        
        # Check if we got any text
        if not text.strip():
            raise Exception("No text detected in the image")
            
        return text
        
    except Exception as e:
        print(f"Error in Tesseract OCR: {str(e)}")
        raise

def perform_google_vision_ocr(content: bytes, api_key: str) -> str:
    """Perform OCR using Google Cloud Vision."""
    try:
        # Create a client with API key
        client = vision.ImageAnnotatorClient(
            client_options={"api_key": api_key}
        )
        
        # Create the image object
        image = vision.Image(content=content)
        
        # Perform text detection
        response = client.text_detection(image=image)
        
        # Check for errors in the response
        if response.error.message:
            raise Exception(f"Google Cloud Vision API error: {response.error.message}")
            
        # Get the text annotations
        texts = response.text_annotations
        
        if not texts:
            return ""
            
        # Get the full text (first annotation contains the full text)
        full_text = texts[0].description
        
        # Check if we got any text
        if not full_text.strip():
            raise Exception("No text detected in the image")
            
        return full_text
        
    except Exception as e:
        print(f"Error in Google Vision OCR: {str(e)}")
        raise 