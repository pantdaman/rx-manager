import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Medicine, PrescriptionData } from '../types/prescription';
import MedicineActions from './MedicineActions';
import PrescriptionUploader from './PrescriptionUploader';
import { Settings, Sun, Moon, Sunrise, Sunset, Upload, X, Check, AlertCircle, Clock, Calendar, Pill, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Plus } from 'lucide-react';
import SettingsModal from './SettingsModal';
import { AppConfig } from '../types/config';
import TranslationDropdown from './TranslationDropdown';
import { translateText } from '../services/translationService';

interface MedicineScheduleProps {
  medicines: Medicine[];
  onUploadComplete?: (data: PrescriptionData) => void;
}

interface TimeSlot {
  id: 'morning' | 'afternoon' | 'evening' | 'night';
  label: string;
  theme: {
    primary: string;
    secondary: string;
    hover: string;
    selected: string;
  };
}

const timeSlots: TimeSlot[] = [
  {
    id: 'morning',
    label: 'Morning',
    theme: {
      primary: '#fff7ed',
      secondary: '#fed7aa',
      hover: '#ffedd5',
      selected: '#fb923c',
    },
  },
  {
    id: 'afternoon',
    label: 'Afternoon',
    theme: {
      primary: '#fefce8',
      secondary: '#fef08a',
      hover: '#fef9c3',
      selected: '#facc15',
    },
  },
  {
    id: 'evening',
    label: 'Evening',
    theme: {
      primary: '#eff6ff',
      secondary: '#bfdbfe',
      hover: '#dbeafe',
      selected: '#60a5fa',
    },
  },
  {
    id: 'night',
    label: 'Night',
    theme: {
      primary: '#eef2ff',
      secondary: '#c7d2fe',
      hover: '#e0e7ff',
      selected: '#818cf8',
    },
  },
];

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const UploadButton = styled.button`
  width: 100%;
  padding: 1rem 1.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #374151;
  transition: background-color 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &:hover {
    background-color: #f9fafb;
  }
`;

const ScheduleContainer = styled.div`
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const ScheduleHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(to right, #f3f4f6, #ffffff);
  border-bottom: 1px solid #e5e7eb;
`;

const HeadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const DisclaimerText = styled.span`
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #4b5563;
  background: #f3f4f6;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
  font-weight: 500;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
`;

const Subtitle = styled.div`
  font-size: 0.875rem;
  color: #1e40af;
  margin-top: 0.5rem;
  background: #dbeafe;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  border: 1px solid #93c5fd;
  font-weight: 500;
  line-height: 1.5;
`;

const TimeSlotGrid = styled.div`
  display: flex;
  border-top: 1px solid #e5e7eb;
`;

const TimeSlotContainer = styled.div<{ theme: TimeSlot['theme'] }>`
  flex: 1;
  background: ${(props: { theme: TimeSlot['theme'] }) => props.theme.primary};
  border-right: 1px solid #e5e7eb;
  padding: 0.5rem;
  
  &:last-child {
    border-right: none;
  }
`;

const TimeSlotHeader = styled.div<{ theme: TimeSlot['theme'] }>`
  padding: 0.5rem;
  background: ${(props: { theme: TimeSlot['theme'] }) => props.theme.secondary};
  border-bottom: 1px solid ${(props: { theme: TimeSlot['theme'] }) => props.theme.secondary};
  text-align: center;
`;

const TimeSlotTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  color: #374151;
  margin: 0;
`;

const MedicineList = styled.div`
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const MedicineCardStyled = styled.div<{ $isSelected: boolean; theme: TimeSlot['theme'] }>`
  background-color: ${props => props.$isSelected ? props.theme.selected : 'white'};
  border: 1px solid ${props => props.$isSelected ? props.theme.primary : '#e5e7eb'};
  border-radius: 0.5rem;
  padding: 0.5rem;
  margin-bottom: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${props => props.$isSelected ? '0 2px 4px -1px rgba(0, 0, 0, 0.1)' : 'none'};

  &:hover {
    background-color: ${props => props.$isSelected ? props.theme.selected : props.theme.hover};
    border-color: ${props => props.theme.primary};
  }
`;

const MedicineCardContent = styled.div<{ $isSelected: boolean }>`
  flex: 1;
  padding: 0.25rem;
  border-radius: 0.375rem;
  background-color: ${props => props.$isSelected ? '#eff6ff' : 'transparent'};
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background-color: ${props => props.$isSelected ? '#eff6ff' : '#f9fafb'};
  }
`;

const MedicineInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
`;

const MedicineName = styled.h4<{ $isSelected: boolean }>`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.$isSelected ? '#2563eb' : '#111827'};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const MedicineDetails = styled.div<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: ${props => props.$isSelected ? '#2563eb' : '#6b7280'};
`;

const MedicineDetailItem = styled.span<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: ${props => props.$isSelected ? '#2563eb' : '#6b7280'};
`;

const DetailLabel = styled.span`
  font-weight: 500;
  color: inherit;
`;

const DetailValue = styled.span`
  color: inherit;
`;

const MedicineDosage = styled.span<{ $isSelected: boolean }>`
  color: ${props => props.$isSelected ? '#2563eb' : '#6b7280'};
`;

const MedicineDuration = styled.span<{ $isSelected: boolean }>`
  color: ${props => props.$isSelected ? '#2563eb' : '#6b7280'};
`;

const MedicineInstructions = styled.p<{ $isSelected: boolean }>`
  font-size: 0.75rem;
  color: ${props => props.$isSelected ? 'rgba(255, 255, 255, 0.9)' : '#6b7280'};
  margin-top: 0.25rem;
  line-height: 1.25;
`;

const ConfidenceBadge = styled.span<{ $confidence: number }>`
  font-size: 0.625rem;
  padding: 0.125rem 0.25rem;
  border-radius: 9999px;
  background-color: ${props => 
    props.$confidence >= 90 ? 'rgba(34, 197, 94, 0.1)' :
    props.$confidence >= 70 ? 'rgba(234, 179, 8, 0.1)' :
    'rgba(239, 68, 68, 0.1)'
  };
  color: ${props => 
    props.$confidence >= 90 ? 'rgb(34, 197, 94)' :
    props.$confidence >= 70 ? 'rgb(234, 179, 8)' :
    'rgb(239, 68, 68)'
  };
`;

const TimeSlot = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background-color: #f3f4f6;
  border-radius: 0.375rem;
`;

const MedicineCard: React.FC<{
  medicine: Medicine;
  isSelected: boolean;
  onClick: () => void;
  theme: TimeSlot['theme'];
}> = ({ medicine, isSelected, onClick, theme }) => {
  return (
    <MedicineCardStyled $isSelected={isSelected} theme={theme} onClick={onClick}>
      <MedicineCardContent $isSelected={isSelected}>
        <MedicineInfo>
          <MedicineName $isSelected={isSelected}>
            {medicine.name}
            {medicine.confidence && (
              <ConfidenceBadge $confidence={medicine.confidence}>
                {medicine.confidence}%
              </ConfidenceBadge>
            )}
          </MedicineName>
          <MedicineDetails $isSelected={isSelected}>
            <MedicineDetailItem $isSelected={isSelected}>
              <DetailLabel>Dosage:</DetailLabel>
              <DetailValue>{medicine.dosage}</DetailValue>
            </MedicineDetailItem>
            <span>•</span>
            <MedicineDetailItem $isSelected={isSelected}>
              <DetailLabel>Duration:</DetailLabel>
              <DetailValue>{medicine.duration}</DetailValue>
            </MedicineDetailItem>
          </MedicineDetails>
        </MedicineInfo>
      </MedicineCardContent>
      {medicine.specialInstructions && (
        <MedicineInstructions $isSelected={isSelected}>
          {medicine.specialInstructions}
        </MedicineInstructions>
      )}
    </MedicineCardStyled>
  );
};

const TimeSlotSection: React.FC<{
  slot: TimeSlot;
  medicines: Medicine[];
  selectedMedicine: Medicine | null;
  onMedicineClick: (medicine: Medicine) => void;
}> = ({ slot, medicines, selectedMedicine, onMedicineClick }) => {
  const getTimeSlotIcon = (id: string) => {
    switch (id) {
      case 'morning':
        return <Sunrise size={20} className="mr-2" />;
      case 'afternoon':
        return <Sun size={20} className="mr-2" />;
      case 'evening':
        return <Sunset size={20} className="mr-2" />;
      case 'night':
        return <Moon size={20} className="mr-2" />;
      default:
        return null;
    }
  };

  return (
    <TimeSlotContainer theme={slot.theme}>
      <TimeSlotHeader theme={slot.theme}>
        <TimeSlotTitle>
          {getTimeSlotIcon(slot.id)}
          {slot.label}
        </TimeSlotTitle>
      </TimeSlotHeader>
      <MedicineList>
        {medicines.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#6b7280' }}>
            No medication
          </div>
        ) : (
          medicines.map((medicine, index) => (
            <MedicineCard
              key={`${medicine.name}-${index}`}
              medicine={medicine}
              isSelected={selectedMedicine?.name === medicine.name}
              onClick={() => onMedicineClick(medicine)}
              theme={slot.theme}
            />
          ))
        )}
      </MedicineList>
    </TimeSlotContainer>
  );
};

const SettingsButton = styled.button`
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  z-index: 1000;

  &:hover {
    background: #f3f4f6;
    transform: scale(1.05);
  }

  svg {
    width: 20px;
    height: 20px;
    color: #4b5563;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const MedicineSchedule: React.FC<MedicineScheduleProps> = ({ medicines, onUploadComplete }) => {
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [showMedicineDetails, setShowMedicineDetails] = useState(false);
  const [showUploader, setShowUploader] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [translatedMedicines, setTranslatedMedicines] = useState<Medicine[]>([]);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [translatedLabels, setTranslatedLabels] = useState<{
    morning: string;
    afternoon: string;
    evening: string;
    night: string;
    uploadNew: string;
    medicineSchedule: string;
    personalizedSchedule: string;
    aiGenerated: string;
    viewDetails: string;
  }>({
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    night: 'Night',
    uploadNew: 'Upload New Prescription',
    medicineSchedule: 'Medicine Schedule',
    personalizedSchedule: 'Your personalized medicine schedule based on your prescription',
    aiGenerated: 'AI-generated extraction. Always confirm with your doctor.',
    viewDetails: 'Click on any medicine to view generic alternatives from Jan Aushadhi, locate nearby Jan Aushadhi stores, and get detailed information.'
  });

  useEffect(() => {
    if (medicines.length > 0) {
      setShowUploader(false);
    }
  }, [medicines]);

  useEffect(() => {
    if (currentLanguage !== 'en' && medicines.length > 0) {
      translateMedicines();
    } else {
      setTranslatedMedicines(medicines);
      setTranslationError(null);
    }
  }, [currentLanguage, medicines]);

  useEffect(() => {
    const translateLabels = async () => {
      if (currentLanguage === 'en') {
        setTranslatedLabels({
          morning: 'Morning',
          afternoon: 'Afternoon',
          evening: 'Evening',
          night: 'Night',
          uploadNew: 'Upload New Prescription',
          medicineSchedule: 'Medicine Schedule',
          personalizedSchedule: 'Your personalized medicine schedule based on your prescription',
          aiGenerated: 'AI-generated extraction. Always confirm with your doctor.',
          viewDetails: 'Click on any medicine to view generic alternatives from Jan Aushadhi, locate nearby Jan Aushadhi stores, and get detailed information.'
        });
        return;
      }

      try {
        const config = JSON.parse(localStorage.getItem('rx-manager-config') || '{"apiKeys":{"googleCloud":{},"openai":{},"anthropic":{}}}');
        
        // Debug check for environment variables
        console.log('All env vars:', {
          translationKey: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY,
          visionKey: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY,
          geminiKey: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_GEMINI_API_KEY
        });
        
        // Check for API key in both config and environment variables
        const hasApiKey = config?.apiKeys?.googleCloud?.translationApiKey || process.env.NEXT_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY;
        console.log("hasApiKey", hasApiKey)
        console.log("process.env.NEXT_PUBLIC_GOOGLE_TRANSLATION_API_KEY", process.env.NEXT_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY)
        if (!hasApiKey) {
          setTranslationError('Please configure Google Cloud API key in settings or set it in environment variables');
          return;
        }

        const labels = await Promise.all([
          translateText('Morning', currentLanguage, config),
          translateText('Afternoon', currentLanguage, config),
          translateText('Evening', currentLanguage, config),
          translateText('Night', currentLanguage, config),
          translateText('Upload New Prescription', currentLanguage, config),
          translateText('Medicine Schedule', currentLanguage, config),
          translateText('Your personalized medicine schedule based on your prescription', currentLanguage, config),
          translateText('AI-generated extraction. Always confirm with your doctor.', currentLanguage, config),
          translateText('Click on any medicine to view generic alternatives from Jan Aushadhi, locate nearby Jan Aushadhi stores, and get detailed information.', currentLanguage, config)
        ]);

        setTranslatedLabels({
          morning: labels[0],
          afternoon: labels[1],
          evening: labels[2],
          night: labels[3],
          uploadNew: labels[4],
          medicineSchedule: labels[5],
          personalizedSchedule: labels[6],
          aiGenerated: labels[7],
          viewDetails: labels[8]
        });
      } catch (error) {
        console.error('Error translating labels:', error);
        setTranslationError('Failed to translate labels. Please check your API configuration.');
      }
    };

    translateLabels();
  }, [currentLanguage]);

  const translateMedicines = async () => {
    try {
      const config = JSON.parse(localStorage.getItem('rx-manager-config') || '{"apiKeys":{"googleCloud":{},"openai":{},"anthropic":{}}}');
      
      // Check for API key in both config and environment variables
      const hasApiKey = config?.apiKeys?.googleCloud?.translationApiKey || process.env.NEXT_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY;
      console.log("1hasApiKey", hasApiKey)
      console.log("1process.env.NEXT_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY", process.env.NEXT_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY)
      if (!hasApiKey) {
        setTranslationError('Please configure Google Cloud API key in settings or set it in environment variables');
        setTranslatedMedicines(medicines);
        return;
      }

      setTranslationError(null);
      const translated = await Promise.all(
        medicines.map(async (medicine) => {
          try {
            return {
              ...medicine,
              name: await translateText(medicine.name, currentLanguage, config),
              dosage: await translateText(medicine.dosage, currentLanguage, config),
              duration: await translateText(medicine.duration, currentLanguage, config),
              specialInstructions: medicine.specialInstructions 
                ? await translateText(medicine.specialInstructions, currentLanguage, config)
                : undefined
            };
          } catch (error) {
            console.error(`Failed to translate medicine ${medicine.name}:`, error);
            // Return original medicine if translation fails
            return medicine;
          }
        })
      );
      setTranslatedMedicines(translated);
    } catch (error) {
      console.error('Translation error:', error);
      setTranslationError('Failed to translate medicines. Please check your API configuration.');
      setTranslatedMedicines(medicines);
    }
  };

  const handleUploadComplete = (data: PrescriptionData) => {
    if (onUploadComplete) {
      onUploadComplete(data);
    }
    setShowUploader(false);
  };

  const handleSaveSettings = (config: AppConfig) => {
    localStorage.setItem('rx-manager-config', JSON.stringify(config));
  };

  const groupedMedicines = medicines.reduce((acc, medicine) => {
    const { frequency } = medicine;
    
    if (frequency.morning) acc.morning.push(medicine);
    if (frequency.afternoon) acc.afternoon.push(medicine);
    if (frequency.evening) acc.evening.push(medicine);
    if (frequency.night) acc.night.push(medicine);
    
    return acc;
  }, {
    morning: [] as Medicine[],
    afternoon: [] as Medicine[],
    evening: [] as Medicine[],
    night: [] as Medicine[]
  });

  const handleMedicineClick = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setShowMedicineDetails(true);
  };

  const handleLanguageChange = async (languageCode: string) => {
    setCurrentLanguage(languageCode);
  };

  return (
    <Container>
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={handleSaveSettings}
      />

      {showUploader ? (
        <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
          <PrescriptionUploader onUploadComplete={handleUploadComplete} />
        </div>
      ) : (
        <UploadButton onClick={() => setShowUploader(true)}>
          {translatedLabels.uploadNew}
        </UploadButton>
      )}

      {medicines.length > 0 && (
        <ScheduleContainer>
          <ScheduleHeader>
            <HeadingContainer>
              <TitleRow>
                <h2 className="text-2xl font-bold text-gray-900">{translatedLabels.medicineSchedule}</h2>
                <HeaderActions>
                  <TranslationDropdown
                    onLanguageChange={handleLanguageChange}
                    currentLanguage={currentLanguage}
                  />
                  <DisclaimerText>
                    {translatedLabels.aiGenerated}
                  </DisclaimerText>
                </HeaderActions>
              </TitleRow>
              {translationError && (
                <div className="mt-2 p-2 bg-red-50 text-red-600 rounded-md text-sm">
                  {translationError}
                </div>
              )}
              <Subtitle>
                {translatedLabels.viewDetails}
              </Subtitle>
            </HeadingContainer>
          </ScheduleHeader>
          
          <TimeSlotGrid>
            {timeSlots.map((slot) => (
              <TimeSlotSection
                key={slot.id}
                slot={{
                  ...slot,
                  label: translatedLabels[slot.id as keyof typeof translatedLabels]
                }}
                medicines={translatedMedicines.filter(medicine => medicine.frequency[slot.id])}
                selectedMedicine={selectedMedicine}
                onMedicineClick={handleMedicineClick}
              />
            ))}
          </TimeSlotGrid>
        </ScheduleContainer>
      )}

      {showMedicineDetails && selectedMedicine && (
        <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <MedicineActions
            name={selectedMedicine.name}
            dosage={selectedMedicine.dosage}
            duration={selectedMedicine.duration}
            confidence={selectedMedicine.confidence}
            frequency={Object.entries(selectedMedicine.frequency)
              .filter(([_, value]) => value)
              .map(([time]) => time.charAt(0).toUpperCase() + time.slice(1))
              .join(', ')}
            onClose={() => setShowMedicineDetails(false)}
          />
        </div>
      )}
    </Container>
  );
};

export default MedicineSchedule; 