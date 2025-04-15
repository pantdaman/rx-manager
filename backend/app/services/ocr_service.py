from google.cloud import vision
import os
from dotenv import load_dotenv
import base64
import PyPDF2
from io import BytesIO

# Load environment variables
load_dotenv()

async def perform_ocr(image_base64: str, is_pdf: bool = False) -> str:
    """
    Perform OCR on the given image or PDF using Google Cloud Vision API.
    
    Args:
        image_base64: Base64 encoded image/PDF data
        is_pdf: Whether the input is a PDF file
    
    Returns:
        Extracted text from the image/PDF
    """
    try:
        # Decode the base64 data
        content = base64.b64decode(image_base64)
        
        if is_pdf:
            # Handle PDF files
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
            # Handle image files
            api_key = os.getenv('GOOGLE_API_KEY')
            if not api_key:
                raise Exception("GOOGLE_API_KEY environment variable not set")

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
        print(f"Error performing OCR: {str(e)}")
        # Provide more specific error messages
        if "GOOGLE_API_KEY" in str(e):
            raise Exception("Google Cloud Vision API key is not configured. Please set the GOOGLE_API_KEY environment variable.")
        elif "No text detected" in str(e):
            raise Exception("Could not extract any text from the image. Please ensure the image is clear and contains readable text.")
        elif "No text could be extracted" in str(e):
            raise Exception("Could not extract any text from the PDF. The PDF might be scanned or contain only images.")
        else:
            raise Exception(f"Failed to process file: {str(e)}") 