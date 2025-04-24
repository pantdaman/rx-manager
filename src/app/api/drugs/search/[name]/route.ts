import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    // First try the backend service
    try {
      const backendResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/drugs/search/${encodeURIComponent(params.name)}`
      );
      
      if (backendResponse.ok) {
        const data = await backendResponse.json();
        return NextResponse.json(data);
      }
    } catch (error) {
      console.log('Backend service not available, using mock data');
    }

    // Mock data for common medicines
    const mockDrugs: Record<string, any> = {
      'paracetamol': {
        brand_name: 'Tylenol',
        generic_name: 'Paracetamol (Acetaminophen)',
        manufacturer: 'Johnson & Johnson',
        active_ingredients: 'Acetaminophen 500mg',
        purpose: 'Pain reliever and fever reducer',
        warnings: 'Do not exceed recommended dose. Avoid alcohol. Consult doctor if symptoms persist.',
        dosage_administration: 'Adults and children 12 years and over: 2 tablets every 4-6 hours as needed',
        pregnancy_risk: 'Category B - No evidence of risk in humans'
      },
      'ibuprofen': {
        brand_name: 'Advil',
        generic_name: 'Ibuprofen',
        manufacturer: 'Pfizer',
        active_ingredients: 'Ibuprofen 200mg',
        purpose: 'Pain reliever, fever reducer, anti-inflammatory',
        warnings: 'May cause stomach bleeding. Do not use if you have heart disease. Consult doctor before use if pregnant.',
        dosage_administration: 'Adults and children 12 years and over: 1 tablet every 4-6 hours while symptoms persist',
        pregnancy_risk: 'Category D - Positive evidence of risk'
      },
      'amoxicillin': {
        brand_name: 'Amoxil',
        generic_name: 'Amoxicillin',
        manufacturer: 'GlaxoSmithKline',
        active_ingredients: 'Amoxicillin trihydrate equivalent to 500mg amoxicillin',
        purpose: 'Antibiotic - treats bacterial infections',
        warnings: 'May cause allergic reactions. Complete the prescribed course. May cause diarrhea.',
        dosage_administration: 'Adults: 250-500mg every 8 hours or as prescribed by doctor',
        pregnancy_risk: 'Category B - No evidence of risk in humans'
      }
    };

    // Convert the drug name to lowercase for case-insensitive matching
    const normalizedName = params.name.toLowerCase();
    
    // Try to find an exact match
    if (mockDrugs[normalizedName]) {
      return NextResponse.json(mockDrugs[normalizedName]);
    }

    // If no exact match, try to find a partial match
    const partialMatch = Object.entries(mockDrugs).find(([key]) => 
      key.includes(normalizedName) || normalizedName.includes(key)
    );

    if (partialMatch) {
      return NextResponse.json(partialMatch[1]);
    }

    // If no match found, return a 404 error
    return NextResponse.json(
      { error: 'Drug information not found' },
      { status: 404 }
    );

  } catch (error) {
    console.error('Error in drug search:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drug information' },
      { status: 500 }
    );
  }
} 