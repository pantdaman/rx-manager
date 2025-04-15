from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Medicine(BaseModel):
    name: str
    dosage: str
    frequency: dict
    duration: str
    specialInstructions: Optional[str] = None

class PatientInfo(BaseModel):
    name: Optional[str] = None
    age: Optional[str] = None
    gender: Optional[str] = None

class DoctorInfo(BaseModel):
    name: Optional[str] = None
    specialization: Optional[str] = None

class PrescriptionData(BaseModel):
    medicines: List[Medicine]
    patientInfo: PatientInfo
    doctorInfo: DoctorInfo
    diagnosis: Optional[str] = None
    date: Optional[datetime] = None 