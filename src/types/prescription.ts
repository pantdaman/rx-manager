export interface Medicine {
  name: string;
  confidence?: number;
  dosage: string;
  frequency: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
  };
  duration: string;
  specialInstructions?: string;
}

export interface PatientInfo {
  name?: string;
  age?: string;
  gender?: string;
  id?: string;
}

export interface DoctorInfo {
  name?: string;
  specialization?: string;
  licenseNumber?: string;
}

export interface PrescriptionData {
  medicines: Medicine[];
  patientInfo: PatientInfo;
  doctorInfo: DoctorInfo;
  diagnosis?: string;
  date?: string;
} 