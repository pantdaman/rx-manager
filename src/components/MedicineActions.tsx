import { useState, useEffect } from 'react';
import { Store } from '../types/store';
import { MedicineSearchResult, MedicineSearchResponse } from '../types/medicine';
import MedicineSearch from './MedicineSearch';

interface MedicineActionsProps {
  name: string;
  dosage: string;
  duration: string;
  confidence?: number;
  frequency?: string;
}

interface DrugInfo {
  brand_name?: string;
  generic_name?: string;
  manufacturer?: string;
  active_ingredients?: string;
  purpose?: string;
  warnings?: string;
  dosage_administration?: string;
  pregnancy_risk?: string;
  source?: 'FDA' | 'LLM' | 'Mock';
}

export default function MedicineActions({ 
  name, 
  dosage, 
  duration, 
  confidence, 
  frequency 
}: MedicineActionsProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pinCode, setPinCode] = useState<string>('');
  const [drugInfo, setDrugInfo] = useState<DrugInfo | null>(null);
  const [loadingDrug, setLoadingDrug] = useState(false);
  const [drugError, setDrugError] = useState<string | null>(null);
  const [alternatives, setAlternatives] = useState<MedicineSearchResult[]>([]);
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);
  const [alternativesError, setAlternativesError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [currentStorePage, setCurrentStorePage] = useState(1);
  const storesPerPage = 10;

  useEffect(() => {
    if (selectedAction === 'stores' && pinCode.length === 6) {
      fetchStores();
    } else if (selectedAction === 'details' && name) {
      fetchDrugInfo();
    } else if (selectedAction === 'alternatives' && name) {
      fetchAlternatives();
    }
  }, [selectedAction, pinCode, name]);

  // Function to clean medicine name by removing dosage and other numbers
  const cleanMedicineName = (name: string): string => {
    // Remove common dosage patterns like "50mg", "100mg", etc.
    const cleanedName = name.replace(/\d+\s*(mg|ml|g|tablet|tab|cap|capsule)s?/gi, '').trim();
    // Remove any remaining numbers
    return cleanedName.replace(/\d+/g, '').trim();
  };

  const fetchDrugInfo = async () => {
    setLoadingDrug(true);
    setDrugError(null);
    try {
      // Clean the medicine name
      const cleanedName = cleanMedicineName(name);
      console.log('Cleaned medicine name:', cleanedName);

      // First try the FDA API with cleaned name
      try {
        const fdaResponse = await fetch(`http://localhost:8002/api/drugs/search/${encodeURIComponent(cleanedName)}`);
        
        if (fdaResponse.ok) {
          const data = await fdaResponse.json();
          if (data.detail !== 'Drug not found') {
            setDrugInfo({ ...data, source: 'FDA' });
            return;
          }
        }
      } catch (error) {
        console.log('FDA API error:', error);
      }

      // If FDA API fails, try the LLM service
      try {
        const llmResponse = await fetch('http://localhost:8002/api/drugs/llm-search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ medicine_name: cleanedName }),
        });

        if (llmResponse.ok) {
          const data = await llmResponse.json();
          setDrugInfo({ ...data, source: 'LLM' });
          return;
        }
      } catch (error) {
        console.log('LLM service error:', error);
      }

      // If both FDA and LLM fail, try mock data
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

      // Try to find a match in mock data
      const normalizedName = cleanedName.toLowerCase();
      if (mockDrugs[normalizedName]) {
        setDrugInfo({ ...mockDrugs[normalizedName], source: 'Mock' });
        return;
      }

      // If no match found anywhere, show error
      setDrugError('Drug information not found. Please try a different medicine name.');
    } catch (err) {
      console.error('Error fetching drug info:', err);
      setDrugError('Failed to load drug information. Please try again later.');
    } finally {
      setLoadingDrug(false);
    }
  };

  const fetchStores = async () => {
    if (pinCode.length !== 6) {
      setError('Please enter a valid 6-digit PIN code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://apigw.umangapp.in/janAushadhiApi/ws1/findstoredistance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'VKE9PnbY5k1ZYapR5PyYQ33I26sXTX569Ed7eqyg',
          'deptid': '180',
          'formtrkr': '0',
          'srvid': '1090',
          'subsid': '0',
          'subsid2': '0',
          'tenantid': '',
        },
        body: JSON.stringify({
          tkn: '',
          trkr: Date.now().toString(),
          lang: 'en',
          lat: '12.857247', // Default latitude (can be updated with user's location)
          lon: '77.6081698', // Default longitude (can be updated with user's location)
          lac: '90',
          did: '37',
          usag: '90',
          apitrkr: Date.now().toString(),
          usrid: '',
          mode: 'web',
          pltfrm: 'ios',
          formtrkr: '0',
          srvid: '180',
          subsid: '0',
          subsid2: '0',
          deptid: '1090',
          city: '',
          searchText: pinCode,
          pageNo: '1',
          pageSize: '50'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Store API Response:', data); // Add logging to debug
      
      if (data.rs === 'S' && data.pd.success === 'true') {
        // Sort stores by distance
        const sortedStores = data.pd.data.sort((a: any, b: any) => 
          parseFloat(a.distanceFromUser) - parseFloat(b.distanceFromUser)
        );
        setStores(sortedStores);
      } else {
        setStores([]);
        setError(data.pd.message || 'No stores found in this area');
      }
    } catch (err) {
      console.error('Error in fetchStores:', err);
      setError('Failed to load stores. Please try again later.');
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlternatives = async () => {
    setLoadingAlternatives(true);
    setAlternativesError(null);
    try {
      const response = await fetch('https://apigw.umangapp.in/janAushadhiApi/ws1/searchmedicinebyname', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'VKE9PnbY5k1ZYapR5PyYQ33I26sXTX569Ed7eqyg',
          'deptid': '180',
          'formtrkr': '0',
          'srvid': '1089',
          'subsid': '0',
          'subsid2': '0',
          'tenantid': '',
        },
        body: JSON.stringify({
          tkn: '',
          trkr: Date.now().toString(),
          lang: 'en',
          lat: '28.4576912',
          lon: '77.0454836',
          lac: '90',
          did: '37',
          usag: '90',
          apitrkr: Date.now().toString(),
          usrid: '',
          mode: 'web',
          pltfrm: 'ios',
          formtrkr: '0',
          srvid: '180',
          subsid: '0',
          subsid2: '0',
          deptid: '1089',
          searchText: cleanMedicineName(name),
          orderBy: 'MRP ASC',
          pageNo: 1,
          pageSize: 50
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch alternatives');
      }

      const data: MedicineSearchResponse = await response.json();
      
      if (data.rs === 'S' && data.pd.success === 'true') {
        setAlternatives(data.pd.data);
      } else {
        setAlternativesError(data.pd.message || 'Failed to fetch alternatives');
      }
    } catch (err) {
      setAlternativesError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoadingAlternatives(false);
    }
  };

  const getConfidenceColor = (confidence: number | undefined) => {
    if (!confidence) return 'bg-gray-500 text-white';
    if (confidence >= 90) return 'bg-green-600 text-white';
    if (confidence >= 70) return 'bg-yellow-500 text-white';
    return 'bg-red-600 text-white';
  };

  const renderStoreDetails = (store: any) => (
    <div key={store.storeId} className="p-4 border-b hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{store.storeName}</h3>
              <p className="text-sm text-gray-600 mt-1">{store.storeContactPerson}</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {parseFloat(store.distanceFromUser).toFixed(1)} km away
              </div>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="text-sm text-gray-600">
                <div>{store.address}</div>
                <div className="mt-1 text-gray-500">
                  {store.district}, {store.state} - {store.pincode}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <a 
                href={`tel:${store.mobileNo}`}
                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {store.mobileNo}
              </a>

              {store.emailId && (
                <a 
                  href={`mailto:${store.emailId}`}
                  className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {store.emailId}
                </a>
              )}

              <a
                href={`https://www.google.com/maps?q=${store.storeLatitude},${store.storeLongitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                View on Map
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStores = () => {
    if (loading) {
      return <div className="p-4 text-center">Loading stores...</div>;
    }

    if (error) {
      return <div className="p-4 text-red-600">{error}</div>;
    }

    if (stores.length === 0) {
      return <div className="p-4 text-gray-500">No stores found in this area</div>;
    }

    // Calculate pagination
    const totalPages = Math.ceil(stores.length / storesPerPage);
    const startIndex = (currentStorePage - 1) * storesPerPage;
    const endIndex = startIndex + storesPerPage;
    const currentStores = stores.slice(startIndex, endIndex);

    return (
      <div>
        <div className="max-h-[400px] overflow-y-auto">
          {currentStores.map(renderStoreDetails)}
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, stores.length)} of {stores.length} stores
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentStorePage(prev => Math.max(prev - 1, 1))}
                disabled={currentStorePage === 1}
                className="px-3 py-1 text-sm rounded-md border disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentStorePage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentStorePage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentStorePage === totalPages}
                className="px-3 py-1 text-sm rounded-md border disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDrugInfo = () => {
    if (loadingDrug) {
      return <div className="p-4 text-gray-800">Loading drug information...</div>;
    }

    if (drugError) {
      return <div className="p-4 text-red-600">{drugError}</div>;
    }

    if (!drugInfo) {
      return <div className="p-4 text-gray-800">No drug information available</div>;
    }

    return (
      <div className="p-4">
        {/* Collapsible Drug Information */}
        <details className="group">
          <summary className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">Drug Information</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                drugInfo.source === 'FDA' ? 'bg-blue-500 text-white' :
                drugInfo.source === 'LLM' ? 'bg-blue-500 text-white' :
                'bg-gray-500 text-white'
              }`}>
                Source: {drugInfo.source}
              </span>
            </div>
            <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="mt-2 space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2 text-sm text-gray-800">
                {drugInfo.brand_name && (
                  <div><span className="font-medium">Brand Name:</span> {drugInfo.brand_name}</div>
                )}
                {drugInfo.generic_name && (
                  <div><span className="font-medium">Generic Name:</span> {drugInfo.generic_name}</div>
                )}
                {drugInfo.purpose && (
                  <div><span className="font-medium">Purpose:</span> {drugInfo.purpose}</div>
                )}
              </div>
            </div>

            {drugInfo.manufacturer && (
              <div>
                <h3 className="font-semibold mb-1 text-gray-900">Manufacturer</h3>
                <div className="text-sm text-gray-800">{drugInfo.manufacturer}</div>
              </div>
            )}

            {drugInfo.active_ingredients && (
              <div>
                <h3 className="font-semibold mb-1 text-gray-900">Active Ingredients</h3>
                <div className="text-sm text-gray-800">{drugInfo.active_ingredients}</div>
              </div>
            )}

            {drugInfo.dosage_administration && (
              <div>
                <h3 className="font-semibold mb-1 text-gray-900">Dosage & Administration</h3>
                <div className="text-sm text-gray-800">{drugInfo.dosage_administration}</div>
              </div>
            )}

            {drugInfo.warnings && (
              <div>
                <h3 className="font-semibold mb-1 text-red-600">Warnings</h3>
                <div className="text-sm text-red-600 bg-red-600 p-3 rounded-md">{drugInfo.warnings}</div>
              </div>
            )}

            {drugInfo.pregnancy_risk && (
              <div>
                <h3 className="font-semibold mb-1 text-gray-900">Pregnancy Risk</h3>
                <div className="text-sm text-gray-800">{drugInfo.pregnancy_risk}</div>
              </div>
            )}
          </div>
        </details>
      </div>
    );
  };

  const renderActionDetails = () => {
    switch (selectedAction) {
      case 'alternatives':
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentAlternatives = alternatives.slice(startIndex, endIndex);
        const totalPages = Math.ceil(alternatives.length / itemsPerPage);

        return (
          <div className="p-4">
            <h3 className="font-semibold mb-4">Alternative Medicines for {name}</h3>
            {loadingAlternatives ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Searching for alternatives...</p>
              </div>
            ) : alternativesError ? (
              <div className="p-4 bg-red-50 text-red-600 rounded-md">
                {alternativesError}
              </div>
            ) : alternatives.length === 0 ? (
              <div className="p-4 text-gray-500 text-center">
                No alternatives found for {name}
              </div>
            ) : (
              <div className="space-y-2">
                {currentAlternatives.map((medicine) => (
                  <details key={medicine.medicineId} className="group">
                    <summary className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{medicine.generic_Name}</h4>
                        <p className="text-sm text-gray-600">{medicine.companyName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">₹{medicine.mrp}</p>
                          {medicine.savingAmount && (
                            <p className="text-xs text-green-600">
                              Save ₹{medicine.savingAmount}
                            </p>
                          )}
                        </div>
                        <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </summary>
                    <div className="p-3 space-y-2 text-sm">
                      <div className="flex flex-wrap gap-2">
                        {medicine.iS_GENERIC === 'true' && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            Generic
                          </span>
                        )}
                        {medicine.iS_BPPI_PRODUCT === 'true' && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            BPPI Product
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-gray-600">
                        <div>
                          <span className="font-medium">Unit Size:</span> {medicine.unitSize}
                        </div>
                        <div>
                          <span className="font-medium">Item Code:</span> {medicine.itemCode}
                        </div>
                      </div>
                    </div>
                  </details>
                ))}
                
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-4">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm rounded-md border disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm rounded-md border disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      case 'stores':
        return (
          <div>
            <div className="p-4 border-b">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter PIN code"
                  className="px-3 py-2 border rounded-md w-32 text-sm"
                  maxLength={6}
                />
                <button
                  onClick={fetchStores}
                  disabled={pinCode.length !== 6 || loading}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    pinCode.length === 6 && !loading
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
              {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            </div>
            {loading ? (
              <div className="p-4">Loading stores...</div>
            ) : stores.length === 0 ? (
              <div className="p-4 text-gray-500">
                {pinCode.length === 6 
                  ? 'No stores found in this area'
                  : 'Enter a PIN code to search for nearby stores'}
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                {stores.map(renderStoreDetails)}
              </div>
            )}
          </div>
        );
      case 'details':
        return renderDrugInfo();
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex flex-col gap-3">
        {/* First Row - Medicine Name and Confidence */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{name}</h2>
          <span className={`px-3 py-1 text-sm rounded-full font-medium shadow-sm ${getConfidenceColor(confidence)}`}>
            {confidence ? `${confidence}%` : 'N/A'}
          </span>
        </div>

        {/* Second Row - Dosage, Frequency, Duration */}
        <div className="flex items-center gap-4 text-sm">
          <div className="bg-gray-100 px-3 py-2 rounded-md border border-gray-200">
            <span className="text-gray-700 font-medium">Dosage:</span>{' '}
            <span className="text-gray-900">{dosage}</span>
          </div>
          {frequency && (
            <div className="bg-gray-100 px-3 py-2 rounded-md border border-gray-200">
              <span className="text-gray-700 font-medium">Frequency:</span>{' '}
              <span className="text-gray-900">{frequency}</span>
            </div>
          )}
          <div className="bg-gray-100 px-3 py-2 rounded-md border border-gray-200">
            <span className="text-gray-700 font-medium">Duration:</span>{' '}
            <span className="text-gray-900">{duration}</span>
          </div>
        </div>
      </div>

      <div className="flex mt-3 border rounded-lg overflow-hidden">
        <button
          onClick={() => setSelectedAction(selectedAction === 'alternatives' ? null : 'alternatives')}
          className={`flex-1 px-3 py-2 text-sm font-medium ${
            selectedAction === 'alternatives'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          Alternatives
        </button>
        <button
          onClick={() => setSelectedAction(selectedAction === 'stores' ? null : 'stores')}
          className={`flex-1 px-3 py-2 text-sm font-medium border-l ${
            selectedAction === 'stores'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          Stores
        </button>
        <button
          onClick={() => setSelectedAction(selectedAction === 'details' ? null : 'details')}
          className={`flex-1 px-3 py-2 text-sm font-medium border-l ${
            selectedAction === 'details'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          Details
        </button>
      </div>

      <div className="mt-3">
        {renderActionDetails()}
      </div>
    </div>
  );
} 