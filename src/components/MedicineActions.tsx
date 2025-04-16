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
  showStoreLocator?: boolean;
  onClose?: () => void;
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

interface Medicine {
  name: string;
  dosage: string;
  duration: string;
  confidence: number;
  frequency?: string;
  alternatives: Array<{
    name: string;
    description: string;
    price: number;
  }>;
  manufacturer: string;
  category: string;
  description: string;
}

interface StoreLocation {
  storeId: string;
  storeName: string;
  storeContactPerson: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  distanceFromUser: string;
  mobileNo: string;
  emailId?: string;
  storeLatitude: string;
  storeLongitude: string;
}

interface Action {
  type: 'search' | 'store' | 'details' | 'alternatives' | 'stores' | null;
}

export default function MedicineActions({ 
  name, 
  dosage, 
  duration, 
  confidence, 
  frequency, 
  showStoreLocator, 
  onClose
}: MedicineActionsProps) {
  const [selectedAction, setSelectedAction] = useState<'search' | 'store' | 'details' | 'alternatives' | 'stores' | null>(null);
  const [stores, setStores] = useState<StoreLocation[]>([]);
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
  const storesPerPage = 5;
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [pincode, setPincode] = useState('');
  const [activeTab, setActiveTab] = useState<'alternatives' | 'details'>('alternatives');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<MedicineSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchingStores, setIsSearchingStores] = useState(false);
  const [storeError, setStoreError] = useState<string | null>(null);
  const [loadingStores, setLoadingStores] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  useEffect(() => {
    console.log('useEffect triggered:', { selectedAction, pinCode, name, currentStorePage });
    if (selectedAction === 'stores' && pinCode.length === 6) {
      console.log('useEffect calling fetchStores for page:', currentStorePage);
      fetchStores(pinCode, currentStorePage);
    } else if (selectedAction === 'details' && name) {
      fetchDrugInfo();
    } else if (selectedAction === 'alternatives' && name) {
      fetchAlternatives();
    }
  }, [selectedAction, pinCode, name, currentStorePage]);

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

  const fetchStores = async (pinCode: string, page: number = 1) => {
    setLoadingStores(true);
    setStoreError(null);
    try {
      const requestBody = {
        tkn: "",
        trkr: "213132",
        lang: "en",
        lat: "12.857247",
        lon: "77.6081698",
        lac: "90",
        did: "37",
        usag: "90",
        apitrkr: "123234",
        usrid: "",
        mode: "web",
        pltfrm: "ios",
        formtrkr: "0",
        srvid: "180",
        subsid: "0",
        subsid2: "0",
        deptid: "1090",
        city: "",
        searchText: pinCode,
        pageNo: page.toString(),
        pageSize: storesPerPage.toString()
      };

      console.log('Request payload:', JSON.stringify(requestBody, null, 2));

      const response = await fetch('https://apigw.umangapp.in/janAushadhiApi/ws1/findstoredistance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-api-key': 'VKE9PnbY5k1ZYapR5PyYQ33I26sXTX569Ed7eqyg',
          'deptid': '180',
          'formtrkr': '0',
          'srvid': '1090',
          'subsid': '0',
          'subsid2': '0',
          'tenantid': ''
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      console.log('Store API Response:', data);

      if (data.rs === 'S' && data.pd && data.pd.success === 'true') {
        const sortedStores = data.pd.data.sort((a: any, b: any) => 
          parseFloat(a.distanceFromUser) - parseFloat(b.distanceFromUser)
        );
        setStores(sortedStores);
      } else {
        setStoreError(data.rd || data.pd?.message || 'No stores found in this area');
        setStores([]);
      }
    } catch (e) {
      console.error('Store API Error:', e);
      setStoreError('An error occurred while fetching stores');
      setStores([]);
    } finally {
      setLoadingStores(false);
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
    <details key={store.storeId} className="group">
      <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
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
        <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-4 pb-4 space-y-3">
        <div className="flex items-start gap-2">

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
    </details>
  );

  const renderStores = () => {
    if (loadingStores) {
      return (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (storeError) {
      return <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">{storeError}</div>;
    }

    if (stores.length === 0 && !loadingStores) {
      return <div className="text-center text-gray-500 py-4">No stores found for this pincode.</div>;
    }

    const hasNextPage = stores.length === storesPerPage;
    const hasPreviousPage = currentStorePage > 1;

    return (
      <div className="space-y-4">
        {stores.map((store) => renderStoreDetails(store))}

        {/* Pagination Controls */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <button
            onClick={() => handleStorePageChange(currentStorePage - 1)}
            disabled={!hasPreviousPage}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {currentStorePage}</span>
          <button
            onClick={() => handleStorePageChange(currentStorePage + 1)}
            disabled={!hasNextPage}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
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

  const renderActionDetails = (action: Action) => {
    if (!action || !action.type) return null;

    switch (action.type) {
      case 'search':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter medicine name"
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                disabled={loadingSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              >
                {loadingSearch ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </div>
                ) : 'Search'}
              </button>
            </div>
            {searchError && (
              <div className="p-2 bg-red-50 text-red-600 rounded-md text-sm">
                {searchError}
              </div>
            )}
            {loadingSearch && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}
            {searchResults.length > 0 && (
              <div className="space-y-4">
                {searchResults.map((result) => (
                  <div key={result.medicineId} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{result.generic_Name}</h3>
                        <p className="text-sm text-gray-500">{result.companyName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">₹{result.mrp}</p>
                        <p className="text-sm text-gray-500">{result.unitSize}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'store':
      case 'stores':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                placeholder="Enter 6-digit PIN code"
                maxLength={6}
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleStoreSearch}
                disabled={loadingStores}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              >
                {loadingStores ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </div>
                ) : 'Search Stores'}
              </button>
            </div>
            <div className="mt-4"> 
              {renderStores()}
            </div>
          </div>
        );

      case 'details':
        return (
          <div className="space-y-6">
            {loadingDrug && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            )}
            {!loadingDrug && drugInfo && (
              <>
                {/* Medicine Information */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Medicine Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {drugInfo.brand_name && (
                      <div>
                        <p className="text-sm text-gray-500">Brand Name</p>
                        <p className="font-medium text-gray-900">{drugInfo.brand_name}</p>
                      </div>
                    )}
                    {drugInfo.generic_name && (
                      <div>
                        <p className="text-sm text-gray-500">Generic Name</p>
                        <p className="font-medium text-gray-900">{drugInfo.generic_name}</p>
                      </div>
                    )}
                    {drugInfo.manufacturer && (
                      <div>
                        <p className="text-sm text-gray-500">Manufacturer</p>
                        <p className="font-medium text-gray-900">{drugInfo.manufacturer}</p>
                      </div>
                    )}
                    {drugInfo.active_ingredients && (
                      <div>
                        <p className="text-sm text-gray-500">Active Ingredients</p>
                        <p className="font-medium text-gray-900">{drugInfo.active_ingredients}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Purpose */}
                {drugInfo.purpose && (
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Purpose</h3>
                    <p className="text-gray-700">{drugInfo.purpose}</p>
                  </div>
                )}

                {/* Dosage & Administration */}
                {drugInfo.dosage_administration && (
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Dosage & Administration</h3>
                    <p className="text-gray-700">{drugInfo.dosage_administration}</p>
                  </div>
                )}

                {/* Warnings */}
                {drugInfo.warnings && (
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-red-200 bg-red-50">
                    <h3 className="text-lg font-medium text-red-900 mb-3">Warnings</h3>
                    <p className="text-red-700">{drugInfo.warnings}</p>
                  </div>
                )}

                {/* Pregnancy Risk */}
                {drugInfo.pregnancy_risk && (
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Pregnancy Risk</h3>
                    <p className="text-gray-700">{drugInfo.pregnancy_risk}</p>
                  </div>
                )}
              </>
            )}
            {drugError && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                {drugError}
              </div>
            )}
            {!loadingDrug && !drugError && !drugInfo && (
              <div className="text-center text-gray-500">
                No drug information available
              </div>
            )}
          </div>
        );

      case 'alternatives':
        return (
          <div className="space-y-4">
            {loadingAlternatives && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            )}
            {!loadingAlternatives && alternativesError && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                {alternativesError}
              </div>
            )}
            {!loadingAlternatives && !alternativesError && alternatives.length === 0 && (
              <div className="text-center text-gray-500">
                No alternatives found for {name}
              </div>
            )}
            {!loadingAlternatives && alternatives.length > 0 && (
              <div className="space-y-4">
                {alternatives.map((alt) => (
                  <div key={alt.medicineId} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{alt.generic_Name}</h3>
                        <p className="text-sm text-gray-500">{alt.companyName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">₹{alt.mrp}</p>
                        <p className="text-sm text-gray-500">{alt.unitSize}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const handleUploadClick = () => {
    // Handle prescription upload
  };

  const handleSearchStores = () => {
    setCurrentStorePage(1);
    setError(null);
    if (pinCode.length === 6) {
      fetchStores(pinCode, 1);
    } else {
      setError('Please enter a valid 6-digit pincode.');
    }
  };

  const handleStorePageChange = (newPage: number) => {
    setCurrentStorePage(newPage);
  };

  // Add log when tab changes
  const handleTabChange = (action: string) => {
    console.log('Tab changed to:', action);
    setSelectedAction(action as 'search' | 'store' | 'details' | 'alternatives' | 'stores' | null);
  };

  const handleSearch = async () => {
    setLoadingSearch(true);
    setSearchError(null);
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
          searchText: searchQuery,
          orderBy: 'MRP ASC',
          pageNo: 1,
          pageSize: 50
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }

      const data: MedicineSearchResponse = await response.json();
      
      if (data.rs === 'S' && data.pd.success === 'true') {
        setSearchResults(data.pd.data);
      } else {
        setSearchError(data.pd.message || 'Failed to fetch search results');
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleStoreSearch = async () => {
    setIsSearchingStores(true);
    setStoreError(null);
    try {
      const response = await fetch('https://apigw.umangapp.in/janAushadhiApi/ws1/findstoredistance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-api-key': 'VKE9PnbY5k1ZYapR5PyYQ33I26sXTX569Ed7eqyg',
          'deptid': '180',
          'formtrkr': '0',
          'srvid': '1090',
          'subsid': '0',
          'subsid2': '0',
          'tenantid': ''
        },
        body: JSON.stringify({
          tkn: "",
          trkr: "213132",
          lang: "en",
          lat: "12.857247",
          lon: "77.6081698",
          lac: "90",
          did: "37",
          usag: "90",
          apitrkr: "123234",
          usrid: "",
          mode: "web",
          pltfrm: "ios",
          formtrkr: "0",
          srvid: "180",
          subsid: "0",
          subsid2: "0",
          deptid: "1090",
          city: "",
          searchText: pinCode,
          pageNo: "1",
          pageSize: "50"
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stores');
      }

      const data = await response.json();
      
      if (data.rs === 'S' && data.pd && data.pd.success === 'true') {
        setStores(data.pd.data);
      } else {
        setStoreError(data.rd || data.pd?.message || 'No stores found in this area');
        setStores([]);
      }
    } catch (err) {
      console.error('Error fetching stores:', err);
      setStoreError('An error occurred while fetching stores');
      setStores([]);
    } finally {
      setIsSearchingStores(false);
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

        <div className="flex mt-3 border rounded-lg overflow-hidden">
          <button
            onClick={() => handleTabChange('alternatives')}
            className={`flex-1 px-3 py-2 text-sm font-medium ${
              selectedAction === 'alternatives'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Alternatives
          </button>
          <button
            onClick={() => handleTabChange('details')}
            className={`flex-1 px-3 py-2 text-sm font-medium border-l ${
              selectedAction === 'details'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => handleTabChange('stores')}
            className={`flex-1 px-3 py-2 text-sm font-medium border-l ${
              selectedAction === 'stores'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Stores
          </button>
        </div>

        <div className="mt-3">
          {renderActionDetails({ type: selectedAction })}
        </div>
      </div>
    </div>
  );
} 