import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Store } from '../types/store';
import { MedicineSearchResult, MedicineSearchResponse } from '../types/medicine';
import MedicineSearch from './MedicineSearch';

// Styled Components
const ActionContainer = styled.div`
  padding: 1.5rem;
`;

const ActionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const MedicineName = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
`;

const CloseButton = styled.button`
  padding: 0.5rem;
  border-radius: 0.375rem;
  color: #6b7280;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f3f4f6;
    color: #111827;
  }
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
  gap: 0.5rem;
  padding: 0 0.5rem;
`;

const Tab = styled.button<{ $isActive: boolean }>`
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  color: ${props => props.$isActive ? '#ffffff' : '#6b7280'};
  background-color: ${props => props.$isActive ? '#2563eb' : 'transparent'};
  border-radius: 0.5rem 0.5rem 0 0;
  transition: all 0.2s;
  position: relative;

  &:hover {
    color: ${props => props.$isActive ? '#ffffff' : '#111827'};
    background-color: ${props => props.$isActive ? '#2563eb' : '#f3f4f6'};
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background-color: ${props => props.$isActive ? '#2563eb' : 'transparent'};
  }
`;

const ContentSection = styled.div`
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  margin-bottom: 1rem;
`;

const SectionHeader = styled.div`
  padding: 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #111827;
`;

const SectionContent = styled.div`
  padding: 1rem;
  color: #111827;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;

const InfoItem = styled.div`
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
`;

const InfoLabel = styled.div`
  font-size: 0.875rem;
  color: #374151;
  margin-bottom: 0.25rem;
  font-weight: 500;
`;

const InfoValue = styled.div`
  color: #111827;
  font-weight: 500;
`;

const WarningBox = styled.div`
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1rem 0;
  color: #991b1b;
`;

const StoreCard = styled.div`
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  transition: all 0.2s;

  &:hover {
    border-color: #2563eb;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`;

const StoreName = styled.div`
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
`;

const StoreInfo = styled.div`
  font-size: 0.875rem;
  color: #374151;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
    ring: 2px solid rgba(37, 99, 235, 0.2);
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: #374151;
`;

const ErrorMessage = styled.div`
  color: #991b1b;
  padding: 1rem;
  background: #fee2e2;
  border-radius: 0.5rem;
  margin: 1rem 0;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const PageButton = styled.button<{ $isActive?: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  background-color: ${props => props.$isActive ? '#2563eb' : 'white'};
  color: ${props => props.$isActive ? 'white' : '#374151'};
  border: 1px solid #e5e7eb;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.$isActive ? '#2563eb' : '#f3f4f6'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

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
  storeNo: string;
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
      setCurrentPage(1);
      handleAlternativesSearch(name);
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
        pageNo: "1",
        pageSize: "50"
      };

      console.log('Store Search Request:', {
        url: 'https://apigw.umangapp.in/janAushadhiApi/ws1/findstoredistance',
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
        body: requestBody
      });

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

      console.log('Store Search Response Status:', response.status);
      console.log('Store Search Response Headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('Store Search Response Data:', data);

      if (data.rs === 'S' && data.pd && data.pd.success === 'true') {
        if (data.pd.data && data.pd.data.length > 0) {
          const sortedStores = data.pd.data.sort((a: any, b: any) => 
            parseFloat(a.distanceFromUser) - parseFloat(b.distanceFromUser)
          );
          console.log('Sorted Stores:', sortedStores);
          setStores(sortedStores);
        } else {
          console.log('No stores found in the response data');
          setStoreError('No stores found in this area. Please try a different pincode.');
          setStores([]);
        }
      } else {
        const errorMessage = data.rd || data.pd?.message || 'No stores found in this area';
        console.log('Store Search Error:', errorMessage);
        setStoreError(errorMessage);
        setStores([]);
      }
    } catch (e) {
      console.error('Store Search Error:', e);
      setStoreError('An error occurred while fetching stores. Please try again.');
      setStores([]);
    } finally {
      setLoadingStores(false);
    }
  };

  const getConfidenceColor = (confidence: number | undefined) => {
    if (!confidence) return 'bg-gray-500 text-white';
    if (confidence >= 90) return 'bg-green-600 text-white';
    if (confidence >= 70) return 'bg-yellow-500 text-white';
    return 'bg-red-600 text-white';
  };

  const renderStores = () => {
    console.log('Rendering Stores:', {
      loadingStores,
      storeError,
      stores: stores.length,
      currentStorePage,
      storesPerPage
    });

    if (loadingStores) {
      return <LoadingSpinner>Searching nearby stores...</LoadingSpinner>;
    }

    if (storeError) {
      return <ErrorMessage>{storeError}</ErrorMessage>;
    }

    if (!stores.length) {
      return (
        <div className="space-y-4">
          <SearchInput
            type="text"
            placeholder="Enter pincode to search stores..."
            value={pinCode}
            onChange={(e) => setPinCode(e.target.value)}
          />
          <div className="text-center text-gray-500 p-4">
            Enter a pincode to find nearby stores
          </div>
        </div>
      );
    }

    const startIndex = (currentStorePage - 1) * storesPerPage;
    const endIndex = startIndex + storesPerPage;
    const currentStores = stores.slice(startIndex, endIndex);
    const totalPages = Math.ceil(stores.length / storesPerPage);

    return (
      <div className="space-y-4">
        <SearchInput
          type="text"
          placeholder="Enter pincode to search stores..."
          value={pinCode}
          onChange={(e) => setPinCode(e.target.value)}
        />
        
        {currentStores.map((store, index) => (
          <StoreCard key={index}>
            <StoreName>
              {store.storeName}
              <span className="text-sm text-gray-600 ml-2">
                (Store Code: {store.storeNo})
              </span>
            </StoreName>
            <StoreInfo>
              <div>{store.address}</div>
              <div>Distance: {store.distanceFromUser} km</div>
              <div>Contact: {store.mobileNo}</div>
              {store.emailId && <div>Email: {store.emailId}</div>}
              <div className="mt-2">
                <a
                  href={`https://www.google.com/maps?q=${store.storeLatitude},${store.storeLongitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View on Google Maps
                </a>
              </div>
            </StoreInfo>
          </StoreCard>
        ))}

        {stores.length > storesPerPage && (
          <PaginationContainer>
            <PageButton
              onClick={() => setCurrentStorePage(prev => Math.max(prev - 1, 1))}
              disabled={currentStorePage === 1}
            >
              Previous
            </PageButton>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <PageButton
                key={page}
                $isActive={currentStorePage === page}
                onClick={() => setCurrentStorePage(page)}
              >
                {page}
              </PageButton>
            ))}
            <PageButton
              onClick={() => setCurrentStorePage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentStorePage === totalPages}
            >
              Next
            </PageButton>
          </PaginationContainer>
        )}
      </div>
    );
  };

  const renderDrugInfo = () => {
    if (loadingDrug) {
      return <LoadingSpinner>Loading drug information...</LoadingSpinner>;
    }

    if (drugError) {
      return <ErrorMessage>{drugError}</ErrorMessage>;
    }

    if (!drugInfo) {
      return <div className="text-center text-gray-500">No drug information available</div>;
    }

    return (
      <div>
        <ContentSection>
          <SectionHeader>Medicine Information</SectionHeader>
          <SectionContent>
            <InfoGrid>
              <InfoItem>
                <InfoLabel>Brand Name</InfoLabel>
                <InfoValue>{drugInfo.brand_name || 'N/A'}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Generic Name</InfoLabel>
                <InfoValue>{drugInfo.generic_name || 'N/A'}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Manufacturer</InfoLabel>
                <InfoValue>{drugInfo.manufacturer || 'N/A'}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Active Ingredients</InfoLabel>
                <InfoValue>{drugInfo.active_ingredients || 'N/A'}</InfoValue>
              </InfoItem>
            </InfoGrid>
          </SectionContent>
        </ContentSection>

        <ContentSection>
          <SectionHeader>Purpose</SectionHeader>
          <SectionContent>
            <p>{drugInfo.purpose || 'No purpose information available.'}</p>
          </SectionContent>
        </ContentSection>

        <ContentSection>
          <SectionHeader>Dosage & Administration</SectionHeader>
          <SectionContent>
            <p>{drugInfo.dosage_administration || 'No dosage information available.'}</p>
          </SectionContent>
        </ContentSection>

        {drugInfo.warnings && (
          <WarningBox>
            <strong>⚠️ Warnings:</strong>
            <p>{drugInfo.warnings}</p>
          </WarningBox>
        )}

        <ContentSection>
          <SectionHeader>Pregnancy Risk</SectionHeader>
          <SectionContent>
            <p>{drugInfo.pregnancy_risk || 'No pregnancy risk information available.'}</p>
          </SectionContent>
        </ContentSection>
      </div>
    );
  };

  const renderActionDetails = () => {
    if (selectedAction === 'details') {
      if (loadingDrug) {
        return <LoadingSpinner>Loading drug information...</LoadingSpinner>;
      }

      if (drugError) {
        return <ErrorMessage>{drugError}</ErrorMessage>;
      }

      if (drugInfo) {
        return (
          <div>
            <ContentSection>
              <SectionHeader>Medicine Information</SectionHeader>
              <SectionContent>
                <InfoGrid>
                  <InfoItem>
                    <InfoLabel>Brand Name</InfoLabel>
                    <InfoValue>{drugInfo.brand_name || 'N/A'}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Generic Name</InfoLabel>
                    <InfoValue>{drugInfo.generic_name || 'N/A'}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Manufacturer</InfoLabel>
                    <InfoValue>{drugInfo.manufacturer || 'N/A'}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Active Ingredients</InfoLabel>
                    <InfoValue>{drugInfo.active_ingredients || 'N/A'}</InfoValue>
                  </InfoItem>
                </InfoGrid>
              </SectionContent>
            </ContentSection>

            <ContentSection>
              <SectionHeader>Purpose</SectionHeader>
              <SectionContent>
                <p>{drugInfo.purpose || 'No purpose information available.'}</p>
              </SectionContent>
            </ContentSection>

            <ContentSection>
              <SectionHeader>Dosage & Administration</SectionHeader>
              <SectionContent>
                <p>{drugInfo.dosage_administration || 'No dosage information available.'}</p>
              </SectionContent>
            </ContentSection>

            {drugInfo.warnings && (
              <WarningBox>
                <strong>⚠️ Warnings:</strong>
                <p>{drugInfo.warnings}</p>
              </WarningBox>
            )}

            <ContentSection>
              <SectionHeader>Pregnancy Risk</SectionHeader>
              <SectionContent>
                <p>{drugInfo.pregnancy_risk || 'No pregnancy risk information available.'}</p>
              </SectionContent>
            </ContentSection>
          </div>
        );
      }
    }

    return null;
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

  const handleAlternativesSearch = async (medicineName: string) => {
    setLoadingSearch(true);
    setSearchError(null);
    try {
      const requestBody = {
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
        searchText: medicineName,
        orderBy: 'MRP ASC',
        pageNo: 1,
        pageSize: 50
      };

      console.log('Alternative Medicine Search Request:', {
        url: 'https://apigw.umangapp.in/janAushadhiApi/ws1/searchmedicinebyname',
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
        body: requestBody
      });

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
        body: JSON.stringify(requestBody)
      });

      console.log('Alternative Medicine Search Response Status:', response.status);
      console.log('Alternative Medicine Search Response Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error('Failed to fetch alternatives');
      }

      const data: MedicineSearchResponse = await response.json();
      console.log('Alternative Medicine Search Response Data:', data);
      
      if (data.rs === 'S' && data.pd.success === 'true') {
        setSearchResults(data.pd.data);
        console.log('Alternative Medicine Search Results:', data.pd.data);
      } else {
        setSearchError(data.pd.message || 'Failed to fetch alternatives');
        console.log('Alternative Medicine Search Error:', data.pd.message);
      }
    } catch (err) {
      console.error('Alternative Medicine Search Error:', err);
      setSearchError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoadingSearch(false);
    }
  };

  const renderAlternatives = () => {
    if (loadingSearch) {
      return <LoadingSpinner>Searching for alternatives...</LoadingSpinner>;
    }

    if (searchError) {
      return <ErrorMessage>{searchError}</ErrorMessage>;
    }

    if (!searchResults.length) {
      return <div className="text-center text-gray-500 p-4">No alternatives found</div>;
    }

    const alternativesPerPage = 5;
    const startIndex = (currentPage - 1) * alternativesPerPage;
    const endIndex = startIndex + alternativesPerPage;
    const currentAlternatives = searchResults.slice(startIndex, endIndex);
    const totalPages = Math.ceil(searchResults.length / alternativesPerPage);

    console.log('Pagination Debug:', {
      totalResults: searchResults.length,
      currentPage,
      totalPages,
      startIndex,
      endIndex,
      currentAlternativesLength: currentAlternatives.length
    });

    return (
      <div className="space-y-4">
        {currentAlternatives.map((medicine, index) => (
          <ContentSection key={index}>
            <SectionHeader>{medicine.generic_Name}</SectionHeader>
            <SectionContent>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>Price</InfoLabel>
                  <InfoValue>₹{medicine.mrp}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Manufacturer</InfoLabel>
                  <InfoValue>{medicine.companyName || 'N/A'}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Unit Size</InfoLabel>
                  <InfoValue>{medicine.unitSize || 'N/A'}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Type</InfoLabel>
                  <InfoValue>
                    {medicine.iS_GENERIC === 'true' ? 'Generic' : 'Branded'}
                    {medicine.iS_BPPI_PRODUCT === 'true' && ' (BPPI Product)'}
                  </InfoValue>
                </InfoItem>
              </InfoGrid>
              {medicine.savingAmount && (
                <div className="mt-2 text-green-600">
                  Savings: ₹{medicine.savingAmount}
                  {medicine.savingsPerc && ` (${medicine.savingsPerc}%)`}
                </div>
              )}
            </SectionContent>
          </ContentSection>
        ))}

        {searchResults.length > alternativesPerPage && (
          <PaginationContainer>
            <PageButton
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </PageButton>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <PageButton
                key={page}
                $isActive={currentPage === page}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </PageButton>
            ))}
            <PageButton
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </PageButton>
          </PaginationContainer>
        )}
      </div>
    );
  };

  return (
    <ActionContainer>
      <ActionHeader>
        <MedicineName>{name}</MedicineName>
        {onClose && (
          <CloseButton onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </CloseButton>
        )}
      </ActionHeader>

      <TabContainer>
        <Tab
          $isActive={selectedAction === 'details'}
          onClick={() => setSelectedAction('details')}
        >
          Details
        </Tab>
        <Tab
          $isActive={selectedAction === 'alternatives'}
          onClick={() => setSelectedAction('alternatives')}
        >
          Alternatives
        </Tab>
        <Tab
          $isActive={selectedAction === 'stores'}
          onClick={() => setSelectedAction('stores')}
        >
          Find Stores
        </Tab>
      </TabContainer>

      {renderActionDetails()}
      {selectedAction === 'stores' && renderStores()}
      {selectedAction === 'alternatives' && renderAlternatives()}
    </ActionContainer>
  );
} 