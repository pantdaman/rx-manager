# RX Manager Backend

FastAPI backend for the RX Manager application.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
Create a `.env` file with:
```
GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-key.json"
PROJECT_ID="your-google-cloud-project-id"
```

4. Run the development server:
```bash
uvicorn app.main:app --reload --port 8000
```

## API Documentation

Once running, visit:
- http://localhost:8000/docs for Swagger UI
- http://localhost:8000/redoc for ReDoc

## Endpoints

- `POST /api/prescriptions/process`: Process a prescription image
  - Accepts: Image file
  - Returns: Structured prescription data
