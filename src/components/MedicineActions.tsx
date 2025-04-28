import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Store } from '../types/store';
import { MedicineSearchResult, MedicineSearchResponse } from '../types/medicine';
import MedicineSearch from './MedicineSearch';
import { translateText } from '../services/translationService';
import { Languages, Settings, X } from 'lucide-react';
import SettingsModal from './SettingsModal';
import { AppConfig } from '../types/config';

console.log("Build-time env:", process.env.NEXT_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY);

// Types
interface TranslatedLabels {
  medicineInformation?: string;
  purpose?: string;
  dosageAdministration?: string;
  warnings?: string;
  pregnancyRisk?: string;
  brandName?: string;
  genericName?: string;
  manufacturer?: string;
  activeIngredients?: string;
  previous?: string;
  next?: string;
  [key: string]: string | undefined;
}

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

const MedicineNameTab = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: #f3f4f6;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  margin-bottom: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  width: 100%;
`;

const MedicineNameText = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CloseButton = styled.button`
  padding: 0.25rem;
  border-radius: 0.375rem;
  color: #6b7280;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e5e7eb;
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
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

const SectionHeader = styled.div`
  padding: 0.5rem 0.75rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #111827;
  font-size: 0.875rem;
`;

const SectionContent = styled.div`
  padding: 0.5rem 0.75rem;
  color: #111827;
  font-size: 0.875rem;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
`;

const InfoItem = styled.div`
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
`;

const InfoLabel = styled.div`
  font-size: 0.75rem;
  color: #374151;
  margin-bottom: 0.125rem;
  font-weight: 500;
`;

const InfoValue = styled.div`
  color: #111827;
  font-weight: 500;
  font-size: 0.875rem;
`;

const WarningBox = styled.div`
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1rem 0;
  color: #991b1b;
  font-size: 0.875rem;
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
  color: #111827;
  
  &::placeholder {
    color: #6b7280;
  }
  
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

const ConfidenceBadge = styled.span<{ $confidence: number | undefined }>`
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  background-color: ${props => {
    if (!props.$confidence) return 'bg-gray-500 text-white';
    if (props.$confidence >= 90) return 'bg-green-600 text-white';
    if (props.$confidence >= 70) return 'bg-yellow-500 text-white';
    return 'bg-red-600 text-white';
  }};
  font-size: 0.75rem;
  font-weight: 500;
`;

const TranslateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #e5e7eb;
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`;

const LanguageSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  margin-right: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  background-color: white;
`;

const TranslateContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const SettingsButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #e5e7eb;
  }

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`;

const Disclaimer = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #f3f4f6;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #6b7280;
`;

const FDAStatus = styled.div<{ $approved: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${props => props.$approved ? '#dcfce7' : '#fee2e2'};
  color: ${props => props.$approved ? '#166534' : '#991b1b'};
  margin-bottom: 1rem;
`;

const SourceBadge = styled.span<{ $source: 'FDA' | 'LLM' | 'Mock' }>`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-left: 0.5rem;
  background-color: ${props => {
    switch (props.$source) {
      case 'FDA':
        return '#dcfce7';
      case 'LLM':
        return '#fef3c7';
      case 'Mock':
        return '#e5e7eb';
      default:
        return '#fef3c7';
    }
  }};
  color: ${props => {
    switch (props.$source) {
      case 'FDA':
        return '#166534';
      case 'LLM':
        return '#92400e';
      case 'Mock':
        return '#374151';
      default:
        return '#92400e';
    }
  }};
`;

const DisclaimerText = styled.span`
  font-size: 0.85rem;
  color:rgb(8, 11, 16);
  margin-left: 0.5rem;
  font-style: italic;
  background-color:rgb(235, 218, 137);
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
  fdaApproved: boolean;
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://rx-manager-backend-193388977136.us-central1.run.app';
console.log('API_URL:', API_URL);
const MedicineActions: React.FC<MedicineActionsProps> = ({
  name,
  dosage,
  duration,
  confidence,
  frequency,
  showStoreLocator,
  onClose
}) => {
  const [selectedAction, setSelectedAction] = useState<string>('details');
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
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [translating, setTranslating] = useState<boolean>(false);
  const [translatedDrugInfo, setTranslatedDrugInfo] = useState<DrugInfo | null>(null);
  const [translatedStores, setTranslatedStores] = useState<StoreLocation[]>([]);
  const [translatedAlternatives, setTranslatedAlternatives] = useState<MedicineSearchResult[]>([]);
  const [translatedLabels, setTranslatedLabels] = useState<TranslatedLabels>({
    medicineInformation: 'Medicine Information',
    purpose: 'Purpose',
    dosageAdministration: 'Dosage & Administration',
    warnings: 'Warnings',
    pregnancyRisk: 'Pregnancy Risk',
    brandName: 'Brand Name',
    genericName: 'Generic Name',
    manufacturer: 'Manufacturer',
    activeIngredients: 'Active Ingredients'
  });
  const [translatedStoreLabels, setTranslatedStoreLabels] = useState<TranslatedLabels>({
    storeName: 'Store Name',
    storeCode: 'Store Code',
    distance: 'Distance',
    contact: 'Contact',
    email: 'Email',
    viewOnMaps: 'View on Google Maps',
    enterPincode: 'Enter pincode to search stores...',
    searchingStores: 'Searching nearby stores...',
    noStoresFound: 'No stores found in this area',
    previous: 'Previous',
    next: 'Next'
  });
  const [translatedAlternativeLabels, setTranslatedAlternativeLabels] = useState<TranslatedLabels>({
    price: 'Price',
    manufacturer: 'Manufacturer',
    unitSize: 'Unit Size',
    type: 'Type',
    generic: 'Generic',
    branded: 'Branded',
    bppiProduct: 'BPPI Product',
    savings: 'Savings',
    searchingAlternatives: 'Searching for alternatives...',
    noAlternativesFound: 'No alternatives found',
    previous: 'Previous',
    next: 'Next'
  });
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const languages = [
    { code: 'hi', name: 'Hindi' },
    { code: 'bn', name: 'Bengali' },
    { code: 'te', name: 'Telugu' },
    { code: 'ta', name: 'Tamil' },
    { code: 'mr', name: 'Marathi' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'pa', name: 'Punjabi' },
    { code: 'or', name: 'Odia' },
    { code: 'ur', name: 'Urdu' },
    { code: 'as', name: 'Assamese' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'ru', name: 'Russian' }
  ];

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

  useEffect(() => {
    console.log('Language changed to:', currentLanguage);
    if (currentLanguage && drugInfo) {
      handleTranslate(currentLanguage);
    }
  }, [currentLanguage, drugInfo]);

  useEffect(() => {
    console.log('Selected action changed to:', selectedAction);
    if (currentLanguage !== 'en') {
      handleTranslate(currentLanguage);
    }
  }, [selectedAction]);

  useEffect(() => {
    const translateDrugInfo = async () => {
      if (!drugInfo || currentLanguage === 'en') {
        setTranslatedDrugInfo(drugInfo);
        return;
      }

      try {
        const config = JSON.parse(localStorage.getItem('rx-manager-config') || '{"apiKeys":{"googleCloud":{},"openai":{},"anthropic":{}}}');
        
        // Check for API key in both config and environment variables
        const hasApiKey = config?.apiKeys?.googleCloud?.translationApiKey || process.env.NEXT_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY;
        if (!hasApiKey) {
          console.error('Google Cloud API key not configured for translation');
          setTranslatedDrugInfo(drugInfo);
          return;
        }

        // Translate labels
        const labels = await Promise.all([
          translateText('Medicine Information', currentLanguage, config),
          translateText('Purpose', currentLanguage, config),
          translateText('Dosage & Administration', currentLanguage, config),
          translateText('Warnings', currentLanguage, config),
          translateText('Pregnancy Risk', currentLanguage, config),
          translateText('Brand Name', currentLanguage, config),
          translateText('Generic Name', currentLanguage, config),
          translateText('Manufacturer', currentLanguage, config),
          translateText('Active Ingredients', currentLanguage, config)
        ]);

        setTranslatedLabels({
          medicineInformation: labels[0],
          purpose: labels[1],
          dosageAdministration: labels[2],
          warnings: labels[3],
          pregnancyRisk: labels[4],
          brandName: labels[5],
          genericName: labels[6],
          manufacturer: labels[7],
          activeIngredients: labels[8]
        });

        const translatedInfo = {
          ...drugInfo,
          brand_name: drugInfo.brand_name ? await translateText(drugInfo.brand_name, currentLanguage, config) : 'N/A',
          generic_name: drugInfo.generic_name ? await translateText(drugInfo.generic_name, currentLanguage, config) : 'N/A',
          manufacturer: drugInfo.manufacturer ? await translateText(drugInfo.manufacturer, currentLanguage, config) : 'N/A',
          active_ingredients: drugInfo.active_ingredients ? await translateText(drugInfo.active_ingredients, currentLanguage, config) : 'N/A',
          purpose: drugInfo.purpose ? await translateText(drugInfo.purpose, currentLanguage, config) : 'No purpose information available.',
          dosage_administration: drugInfo.dosage_administration ? await translateText(drugInfo.dosage_administration, currentLanguage, config) : 'No dosage information available.',
          warnings: drugInfo.warnings ? await translateText(drugInfo.warnings, currentLanguage, config) : undefined,
          pregnancy_risk: drugInfo.pregnancy_risk ? await translateText(drugInfo.pregnancy_risk, currentLanguage, config) : 'No pregnancy risk information available.',
          fdaApproved: drugInfo.fdaApproved
        };

        setTranslatedDrugInfo(translatedInfo);
      } catch (error) {
        console.error('Error translating drug info:', error);
        setTranslatedDrugInfo(drugInfo);
      }
    };

    translateDrugInfo();
  }, [drugInfo, currentLanguage]);

  useEffect(() => {
    const translateLabels = async () => {
      if (currentLanguage === 'en') {
        setTranslatedLabels({
          medicineInformation: 'Medicine Information',
          purpose: 'Purpose',
          dosageAdministration: 'Dosage & Administration',
          warnings: 'Warnings',
          pregnancyRisk: 'Pregnancy Risk',
          brandName: 'Brand Name',
          genericName: 'Generic Name',
          manufacturer: 'Manufacturer',
          activeIngredients: 'Active Ingredients'
        });
        return;
      }

      try {
        const config = JSON.parse(localStorage.getItem('rx-manager-config') || '{"apiKeys":{"googleCloud":{},"openai":{},"anthropic":{}}}');
        
        // Check for API key in both config and environment variables
        const hasApiKey = config?.apiKeys?.googleCloud?.translationApiKey || process.env.NEXT_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY;
        if (!hasApiKey) {
          console.error('Google Cloud API key not configured for translation');
          setTranslatedLabels({
            medicineInformation: 'Medicine Information',
            purpose: 'Purpose',
            dosageAdministration: 'Dosage & Administration',
            warnings: 'Warnings',
            pregnancyRisk: 'Pregnancy Risk',
            brandName: 'Brand Name',
            genericName: 'Generic Name',
            manufacturer: 'Manufacturer',
            activeIngredients: 'Active Ingredients'
          });
          return;
        }

        const labels = await Promise.all([
          translateText('Medicine Information', currentLanguage, config),
          translateText('Purpose', currentLanguage, config),
          translateText('Dosage & Administration', currentLanguage, config),
          translateText('Warnings', currentLanguage, config),
          translateText('Pregnancy Risk', currentLanguage, config),
          translateText('Brand Name', currentLanguage, config),
          translateText('Generic Name', currentLanguage, config),
          translateText('Manufacturer', currentLanguage, config),
          translateText('Active Ingredients', currentLanguage, config)
        ]);

        setTranslatedLabels({
          medicineInformation: labels[0],
          purpose: labels[1],
          dosageAdministration: labels[2],
          warnings: labels[3],
          pregnancyRisk: labels[4],
          brandName: labels[5],
          genericName: labels[6],
          manufacturer: labels[7],
          activeIngredients: labels[8]
        });
      } catch (error) {
        console.error('Error translating labels:', error);
      }
    };

    translateLabels();
  }, [currentLanguage]);

  useEffect(() => {
    if (stores.length > 0) {
      translateStores(stores, currentLanguage);
    }
    if (searchResults.length > 0) {
      translateAlternatives(searchResults, currentLanguage);
    }
  }, [currentLanguage, stores, searchResults]);

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
        const fdaResponse = await fetch(`${API_URL}/api/drugs/search/${encodeURIComponent(cleanedName)}`);
        
        if (fdaResponse.ok) {
          const data = await fdaResponse.json();
          if (data.detail !== 'Drug not found') {
            setDrugInfo({ ...data, source: 'FDA', fdaApproved: true });
            return;
          }
        }
      } catch (error) {
        console.log('FDA API error:', error);
      }

      // If FDA API fails, try the LLM service
      try {
        const llmResponse = await fetch(`${API_URL}/api/drugs/llm-search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ medicine_name: cleanedName }),
        });

        if (llmResponse.ok) {
          const data = await llmResponse.json();
          setDrugInfo({ ...data, source: 'LLM', fdaApproved: false });
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
        setDrugInfo({ ...mockDrugs[normalizedName], source: 'Mock', fdaApproved: false });
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
    if (loadingStores) {
      return <LoadingSpinner>{translatedStoreLabels.searchingStores}</LoadingSpinner>;
    }

    if (storeError) {
      return <ErrorMessage>{storeError}</ErrorMessage>;
    }

    const storesToDisplay = translatedStores.length > 0 ? translatedStores : stores;

    if (!storesToDisplay.length) {
      return (
        <div className="space-y-4">
          <SearchInput
            type="text"
            placeholder={translatedStoreLabels.enterPincode}
            value={pinCode}
            onChange={(e) => setPinCode(e.target.value)}
          />
          <div className="text-center text-gray-500 p-4">
            {translatedStoreLabels.noStoresFound}
          </div>
        </div>
      );
    }

    const startIndex = (currentStorePage - 1) * storesPerPage;
    const endIndex = startIndex + storesPerPage;
    const currentStores = storesToDisplay.slice(startIndex, endIndex);
    const totalPages = Math.ceil(storesToDisplay.length / storesPerPage);

    return (
      <div className="space-y-4">
        <SearchInput
          type="text"
          placeholder={translatedStoreLabels.enterPincode}
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
                  {translatedStoreLabels.viewOnMaps}
                </a>
              </div>
            </StoreInfo>
          </StoreCard>
        ))}

        {storesToDisplay.length > storesPerPage && (
          <PaginationContainer>
            <PageButton
              onClick={() => setCurrentStorePage(prev => Math.max(prev - 1, 1))}
              disabled={currentStorePage === 1}
            >
              {translatedStoreLabels.previous}
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
              {translatedStoreLabels.next}
            </PageButton>
          </PaginationContainer>
        )}
      </div>
    );
  };

  const handleTranslate = async (selectedLanguage: string) => {
    if (selectedLanguage === 'en') {
      // Reset to English
      setTranslatedDrugInfo(null);
      setTranslatedStores([]);
      setTranslatedAlternatives([]);
      setTranslatedLabels({
        medicineInformation: 'Medicine Information',
        purpose: 'Purpose',
        dosageAdministration: 'Dosage & Administration',
        warnings: 'Warnings',
        pregnancyRisk: 'Pregnancy Risk',
        brandName: 'Brand Name',
        genericName: 'Generic Name',
        manufacturer: 'Manufacturer',
        activeIngredients: 'Active Ingredients'
      });
      setTranslatedStoreLabels({
        storeName: 'Store Name',
        storeCode: 'Store Code',
        distance: 'Distance',
        contact: 'Contact',
        email: 'Email',
        viewOnMaps: 'View on Google Maps',
        enterPincode: 'Enter pincode to search stores...',
        searchingStores: 'Searching nearby stores...',
        noStoresFound: 'No stores found in this area',
        previous: 'Previous',
        next: 'Next'
      });
      setTranslatedAlternativeLabels({
        price: 'Price',
        manufacturer: 'Manufacturer',
        unitSize: 'Unit Size',
        type: 'Type',
        generic: 'Generic',
        branded: 'Branded',
        bppiProduct: 'BPPI Product',
        savings: 'Savings',
        searchingAlternatives: 'Searching for alternatives...',
        noAlternativesFound: 'No alternatives found',
        previous: 'Previous',
        next: 'Next'
      });
      return;
    }

    setTranslating(true);
    try {
      const config = JSON.parse(localStorage.getItem('rx-manager-config') || '{"apiKeys":{"googleCloud":{},"openai":{},"anthropic":{}}}');
      
      // Check for API key in both config and environment variables
      const hasApiKey = config?.apiKeys?.googleCloud?.translationApiKey || process.env.NEXT_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY;
      if (!hasApiKey) {
        alert('Please configure Google Cloud API key in settings first');
        return;
      }

      // Translate all content in parallel
      await Promise.all([
        // Translate drug info
        (async () => {
          if (drugInfo) {
            const [
              medicineInfo, purpose, dosageAdmin, warnings, pregnancyRisk,
              brandName, genericName, mfr, activeIng
            ] = await Promise.all([
              translateText('Medicine Information', selectedLanguage, config),
              translateText('Purpose', selectedLanguage, config),
              translateText('Dosage & Administration', selectedLanguage, config),
              translateText('Warnings', selectedLanguage, config),
              translateText('Pregnancy Risk', selectedLanguage, config),
              translateText('Brand Name', selectedLanguage, config),
              translateText('Generic Name', selectedLanguage, config),
              translateText('Manufacturer', selectedLanguage, config),
              translateText('Active Ingredients', selectedLanguage, config)
            ]);

            setTranslatedLabels({
              medicineInformation: medicineInfo,
              purpose: purpose,
              dosageAdministration: dosageAdmin,
              warnings: warnings,
              pregnancyRisk: pregnancyRisk,
              brandName: brandName,
              genericName: genericName,
              manufacturer: mfr,
              activeIngredients: activeIng
            });

            const translatedInfo = {
              ...drugInfo,
              brand_name: drugInfo.brand_name ? await translateText(drugInfo.brand_name, selectedLanguage, config) : 'N/A',
              generic_name: drugInfo.generic_name ? await translateText(drugInfo.generic_name, selectedLanguage, config) : 'N/A',
              manufacturer: drugInfo.manufacturer ? await translateText(drugInfo.manufacturer, selectedLanguage, config) : 'N/A',
              active_ingredients: drugInfo.active_ingredients ? await translateText(drugInfo.active_ingredients, selectedLanguage, config) : 'N/A',
              purpose: drugInfo.purpose ? await translateText(drugInfo.purpose, selectedLanguage, config) : 'No purpose information available.',
              dosage_administration: drugInfo.dosage_administration ? await translateText(drugInfo.dosage_administration, selectedLanguage, config) : 'No dosage information available.',
              warnings: drugInfo.warnings ? await translateText(drugInfo.warnings, selectedLanguage, config) : undefined,
              pregnancy_risk: drugInfo.pregnancy_risk ? await translateText(drugInfo.pregnancy_risk, selectedLanguage, config) : 'No pregnancy risk information available.',
              fdaApproved: drugInfo.fdaApproved
            };

            setTranslatedDrugInfo(translatedInfo);
          }
        })(),

        // Translate stores
        (async () => {
          if (stores.length > 0) {
            const translatedStores = await Promise.all(stores.map(async (store) => ({
              ...store,
              storeName: await translateText(store.storeName, selectedLanguage, config),
              address: await translateText(store.address, selectedLanguage, config),
              district: await translateText(store.district, selectedLanguage, config),
              state: await translateText(store.state, selectedLanguage, config)
            })));

            setTranslatedStores(translatedStores);

            const [
              storeName, storeCode, distance, contact, email,
              viewOnMaps, enterPincode, searchingStores, noStores,
              prev, next
            ] = await Promise.all([
              translateText('Store Name', selectedLanguage, config),
              translateText('Store Code', selectedLanguage, config),
              translateText('Distance', selectedLanguage, config),
              translateText('Contact', selectedLanguage, config),
              translateText('Email', selectedLanguage, config),
              translateText('View on Google Maps', selectedLanguage, config),
              translateText('Enter pincode to search stores...', selectedLanguage, config),
              translateText('Searching nearby stores...', selectedLanguage, config),
              translateText('No stores found in this area', selectedLanguage, config),
              translateText('Previous', selectedLanguage, config),
              translateText('Next', selectedLanguage, config)
            ]);

            setTranslatedStoreLabels({
              storeName,
              storeCode,
              distance,
              contact,
              email,
              viewOnMaps,
              enterPincode,
              searchingStores,
              noStoresFound: noStores,
              previous: prev,
              next
            });
          }
        })(),

        // Translate alternatives
        (async () => {
          if (searchResults.length > 0) {
            const translatedAlternatives = await Promise.all(searchResults.map(async (alt) => ({
              ...alt,
              generic_Name: await translateText(alt.generic_Name, selectedLanguage, config),
              companyName: alt.companyName ? await translateText(alt.companyName, selectedLanguage, config) : 'N/A',
              unitSize: alt.unitSize ? await translateText(alt.unitSize, selectedLanguage, config) : 'N/A'
            })));

            setTranslatedAlternatives(translatedAlternatives);

            const [
              price, mfr, unitSize, type, generic, branded,
              bppi, savings, searching, noResults, prev, next
            ] = await Promise.all([
              translateText('Price', selectedLanguage, config),
              translateText('Manufacturer', selectedLanguage, config),
              translateText('Unit Size', selectedLanguage, config),
              translateText('Type', selectedLanguage, config),
              translateText('Generic', selectedLanguage, config),
              translateText('Branded', selectedLanguage, config),
              translateText('BPPI Product', selectedLanguage, config),
              translateText('Savings', selectedLanguage, config),
              translateText('Searching for alternatives...', selectedLanguage, config),
              translateText('No alternatives found', selectedLanguage, config),
              translateText('Previous', selectedLanguage, config),
              translateText('Next', selectedLanguage, config)
            ]);

            setTranslatedAlternativeLabels({
              price,
              manufacturer: mfr,
              unitSize,
              type,
              generic,
              branded,
              bppiProduct: bppi,
              savings,
              searchingAlternatives: searching,
              noAlternativesFound: noResults,
              previous: prev,
              next
            });
          }
        })()
      ]);

    } catch (error) {
      console.error('Error translating:', error);
      alert('Translation failed. Please try again.');
    } finally {
      setTranslating(false);
    }
  };

  const renderActionContent = () => {
    return (
      <div>
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

        <TranslateContainer>
          <LanguageSelect
            value={currentLanguage}
            onChange={(e) => {
              const newLanguage = e.target.value;
              setCurrentLanguage(newLanguage);
              handleTranslate(newLanguage);
            }}
          >
            <option value="en">English</option>
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </LanguageSelect>
          <TranslateButton 
            onClick={() => handleTranslate(currentLanguage)}
            disabled={currentLanguage === 'en' || translating}
          >
            <Languages />
            {translating ? 'Translating...' : 'Translate'}
          </TranslateButton>
        </TranslateContainer>

        {translating && (
          <div className="mb-4 p-2 bg-blue-50 text-blue-700 rounded-md text-sm">
            Translating content...
          </div>
        )}

        {selectedAction === 'details' && renderDrugInfo()}
        {selectedAction === 'alternatives' && renderAlternatives()}
        {selectedAction === 'stores' && renderStores()}
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

    const infoToDisplay = translatedDrugInfo || drugInfo;
    const labels = translatedLabels;

    return (
      <div>
        <ContentSection>
          <SectionHeader>
            {labels.medicineInformation}
            <SourceBadge $source={infoToDisplay.source || 'LLM'}>
              {infoToDisplay.source || 'LLM'}
            </SourceBadge>
            <DisclaimerText>
            AI-generated extraction.Please verify with your healthcare provider
            </DisclaimerText>
          </SectionHeader>
          <SectionContent>
            <InfoGrid>
              <InfoItem>
                <InfoLabel>{labels.brandName}</InfoLabel>
                <InfoValue>{infoToDisplay.brand_name || 'N/A'}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>{labels.genericName}</InfoLabel>
                <InfoValue>{infoToDisplay.generic_name || 'N/A'}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>{labels.manufacturer}</InfoLabel>
                <InfoValue>{infoToDisplay.manufacturer || 'N/A'}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>{labels.activeIngredients}</InfoLabel>
                <InfoValue>{infoToDisplay.active_ingredients || 'N/A'}</InfoValue>
              </InfoItem>
            </InfoGrid>
          </SectionContent>
        </ContentSection>

        <ContentSection>
          <SectionHeader>{labels.purpose}</SectionHeader>
          <SectionContent>
            <p>{infoToDisplay.purpose || 'No purpose information available.'}</p>
          </SectionContent>
        </ContentSection>

        <ContentSection>
          <SectionHeader>{labels.dosageAdministration}</SectionHeader>
          <SectionContent>
            <p>{infoToDisplay.dosage_administration || 'No dosage information available.'}</p>
          </SectionContent>
        </ContentSection>

        {infoToDisplay.warnings && (
          <WarningBox>
            <strong>⚠️ {labels.warnings}:</strong>
            <p>{infoToDisplay.warnings}</p>
          </WarningBox>
        )}

        <ContentSection>
          <SectionHeader>{labels.pregnancyRisk}</SectionHeader>
          <SectionContent>
            <p>{infoToDisplay.pregnancy_risk || 'No pregnancy risk information available.'}</p>
          </SectionContent>
        </ContentSection>

        <Disclaimer>
          <strong>Important:</strong> This information is for reference only. Always consult with your healthcare provider before making any medical decisions or taking any medication.
        </Disclaimer>
      </div>
    );
  };

  const renderAlternatives = () => {
    if (loadingSearch) {
      return <LoadingSpinner>{translatedAlternativeLabels.searchingAlternatives}</LoadingSpinner>;
    }

    if (searchError) {
      return <ErrorMessage>{searchError}</ErrorMessage>;
    }

    const alternativesToDisplay = translatedAlternatives.length > 0 ? translatedAlternatives : searchResults;

    if (!alternativesToDisplay.length) {
      return <div className="text-center text-gray-500 p-2">{translatedAlternativeLabels.noAlternativesFound}</div>;
    }

    const alternativesPerPage = 5;
    const startIndex = (currentPage - 1) * alternativesPerPage;
    const endIndex = startIndex + alternativesPerPage;
    const currentAlternatives = alternativesToDisplay.slice(startIndex, endIndex);
    const totalPages = Math.ceil(alternativesToDisplay.length / alternativesPerPage);

    return (
      <div className="space-y-2">
        {currentAlternatives.map((medicine, index) => (
          <ContentSection key={index}>
            <SectionHeader>{medicine.generic_Name}</SectionHeader>
            <SectionContent>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>{translatedAlternativeLabels.price}</InfoLabel>
                  <InfoValue>₹{medicine.mrp}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>{translatedAlternativeLabels.manufacturer}</InfoLabel>
                  <InfoValue>{medicine.companyName || 'N/A'}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>{translatedAlternativeLabels.unitSize}</InfoLabel>
                  <InfoValue>{medicine.unitSize || 'N/A'}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>{translatedAlternativeLabels.type}</InfoLabel>
                  <InfoValue>
                    {medicine.iS_GENERIC === 'true' ? translatedAlternativeLabels.generic : translatedAlternativeLabels.branded}
                    {medicine.iS_BPPI_PRODUCT === 'true' && translatedAlternativeLabels.bppiProduct}
                  </InfoValue>
                </InfoItem>
              </InfoGrid>
              {medicine.savingAmount && (
                <div className="mt-1 text-green-600 text-sm">
                  {translatedAlternativeLabels.savings}: ₹{medicine.savingAmount}
                  {medicine.savingsPerc && ` (${medicine.savingsPerc}%)`}
                </div>
              )}
            </SectionContent>
          </ContentSection>
        ))}

        {alternativesToDisplay.length > alternativesPerPage && (
          <PaginationContainer>
            <PageButton
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              {translatedAlternativeLabels.previous}
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
              {translatedAlternativeLabels.next}
            </PageButton>
          </PaginationContainer>
        )}
      </div>
    );
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
    setSelectedAction(action as 'details' | 'alternatives' | 'stores');
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

  const translateStores = async (stores: StoreLocation[], language: string) => {
    if (language === 'en') {
      setTranslatedStores(stores);
      return;
    }

    try {
      const config = JSON.parse(localStorage.getItem('rx-manager-config') || '{"apiKeys":{"googleCloud":{},"openai":{},"anthropic":{}}}');
      if (!config.apiKeys.googleCloud.translationApiKey) return;

      const translatedStores = await Promise.all(stores.map(async (store) => ({
        ...store,
        storeName: await translateText(store.storeName, language, config),
        address: await translateText(store.address, language, config),
        district: await translateText(store.district, language, config),
        state: await translateText(store.state, language, config)
      })));

      setTranslatedStores(translatedStores);

      // Translate store labels
      const labels = await Promise.all([
        translateText('Store Name', language, config),
        translateText('Store Code', language, config),
        translateText('Distance', language, config),
        translateText('Contact', language, config),
        translateText('Email', language, config),
        translateText('View on Google Maps', language, config),
        translateText('Enter pincode to search stores...', language, config),
        translateText('Searching nearby stores...', language, config),
        translateText('No stores found in this area', language, config),
        translateText('Previous', language, config),
        translateText('Next', language, config)
      ]);

      setTranslatedStoreLabels({
        storeName: labels[0],
        storeCode: labels[1],
        distance: labels[2],
        contact: labels[3],
        email: labels[4],
        viewOnMaps: labels[5],
        enterPincode: labels[6],
        searchingStores: labels[7],
        noStoresFound: labels[8],
        previous: labels[9],
        next: labels[10]
      });
    } catch (error) {
      console.error('Error translating stores:', error);
    }
  };

  const translateAlternatives = async (alternatives: MedicineSearchResult[], language: string) => {
    if (language === 'en') {
      setTranslatedAlternatives(alternatives);
      return;
    }

    try {
      const config = JSON.parse(localStorage.getItem('rx-manager-config') || '{"apiKeys":{"googleCloud":{},"openai":{},"anthropic":{}}}');
      if (!config.apiKeys.googleCloud.translationApiKey) return;

      const translatedAlternatives = await Promise.all(alternatives.map(async (alt) => ({
        ...alt,
        generic_Name: await translateText(alt.generic_Name, language, config),
        companyName: alt.companyName ? await translateText(alt.companyName, language, config) : 'N/A',
        unitSize: alt.unitSize ? await translateText(alt.unitSize, language, config) : 'N/A'
      })));

      setTranslatedAlternatives(translatedAlternatives);

      // Translate alternative labels
      const labels = await Promise.all([
        translateText('Price', language, config),
        translateText('Manufacturer', language, config),
        translateText('Unit Size', language, config),
        translateText('Type', language, config),
        translateText('Generic', language, config),
        translateText('Branded', language, config),
        translateText('BPPI Product', language, config),
        translateText('Savings', language, config),
        translateText('Searching for alternatives...', language, config),
        translateText('No alternatives found', language, config),
        translateText('Previous', language, config),
        translateText('Next', language, config)
      ]);

      setTranslatedAlternativeLabels({
        price: labels[0],
        manufacturer: labels[1],
        unitSize: labels[2],
        type: labels[3],
        generic: labels[4],
        branded: labels[5],
        bppiProduct: labels[6],
        savings: labels[7],
        searchingAlternatives: labels[8],
        noAlternativesFound: labels[9],
        previous: labels[10],
        next: labels[11]
      });
    } catch (error) {
      console.error('Error translating alternatives:', error);
    }
  };

  const handleLanguageChange = async (language: string) => {
    setCurrentLanguage(language);
    if (language === 'en') {
      setTranslatedDrugInfo(null);
      setTranslatedStores([]);
      setTranslatedAlternatives([]);
      return;
    }
    setTranslating(true);
    try {
      await translateContent(language);
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setTranslating(false);
    }
  };

  const translateContent = async (language: string) => {
    if (drugInfo) {
      const translatedInfo = { ...drugInfo };
      translatedInfo.brand_name = await translateText(drugInfo.brand_name, language, 'text');
      translatedInfo.generic_name = await translateText(drugInfo.generic_name, language, 'text');
      translatedInfo.manufacturer = await translateText(drugInfo.manufacturer, language, 'text');
      translatedInfo.active_ingredients = await translateText(drugInfo.active_ingredients, language, 'text');
      translatedInfo.purpose = await translateText(drugInfo.purpose, language, 'text');
      translatedInfo.dosage_administration = await translateText(drugInfo.dosage_administration, language, 'text');
      if (drugInfo.warnings) {
        translatedInfo.warnings = await translateText(drugInfo.warnings, language, 'text');
      }
      if (drugInfo.pregnancy_risk) {
        translatedInfo.pregnancy_risk = await translateText(drugInfo.pregnancy_risk, language, 'text');
      }
      setTranslatedDrugInfo(translatedInfo);
    }

    if (stores.length > 0) {
      const translatedStoresList = await Promise.all(
        stores.map(async (store) => ({
          ...store,
          name: await translateText(store.name, language, 'text'),
          address: await translateText(store.address, language, 'text')
        }))
      );
      setTranslatedStores(translatedStoresList);
    }

    if (searchResults.length > 0) {
      const translatedAlternativesList = await Promise.all(
        searchResults.map(async (alt) => ({
          ...alt,
          name: await translateText(alt.name, language, 'text'),
          description: await translateText(alt.description, language, 'text')
        }))
      );
      setTranslatedAlternatives(translatedAlternativesList);
    }
  };

  const translateLabels = async (labels: TranslatedLabels, language: string): Promise<TranslatedLabels> => {
    const translatedLabels: TranslatedLabels = {};
    for (const [key, value] of Object.entries(labels)) {
      if (value) {
        translatedLabels[key] = await translateText(value, language, 'text');
      }
    }
    return translatedLabels;
  };

  return (
    <ActionContainer>
      <ActionHeader>
        <MedicineNameTab>
          <MedicineNameText>
            {name}
            {confidence && (
              <span className="text-sm font-normal text-gray-500">
                ({confidence}% confidence)
              </span>
            )}
          </MedicineNameText>
          <ButtonGroup>
            <CloseButton onClick={onClose}>×</CloseButton>
          </ButtonGroup>
        </MedicineNameTab>
      </ActionHeader>

      {renderActionContent()}

      {showSettings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onSave={(config: AppConfig) => {
            localStorage.setItem('rx-manager-config', JSON.stringify(config));
            setShowSettings(false);
          }}
        />
      )}
    </ActionContainer>
  );
};

export default MedicineActions; 