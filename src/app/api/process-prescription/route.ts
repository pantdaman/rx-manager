import { NextResponse } from 'next/server';
import { PrescriptionData } from '../../../types/prescription';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    // TODO: Replace with actual LLM API call
    // For now, we'll use a mock response
    const mockResponse: PrescriptionData = {
      medicines: [
        {
          name: "Sample Medicine",
          dosage: "500mg",
          frequency: {
            morning: true,
            afternoon: false,
            evening: true,
            night: false
          },
          duration: "7 days",
          specialInstructions: "Take after food"
        }
      ],
      patientInfo: {
        name: "John Doe",
        age: "30",
        gender: "Male"
      },
      doctorInfo: {
        name: "Dr. Smith",
        specialization: "General Physician"
      },
      diagnosis: "Sample Diagnosis",
      date: new Date().toISOString()
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('Error processing prescription:', error);
    return NextResponse.json(
      { error: 'Failed to process prescription' },
      { status: 500 }
    );
  }
} 