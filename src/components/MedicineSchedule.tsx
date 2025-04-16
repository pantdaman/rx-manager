import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Medicine, PrescriptionData } from '../types/prescription';
import MedicineActions from './MedicineActions';
import PrescriptionUploader from './PrescriptionUploader';

interface MedicineScheduleProps {
  medicines: Medicine[];
  onUploadComplete?: (data: PrescriptionData) => void;
}

interface TimeSlot {
  id: 'morning' | 'afternoon' | 'evening' | 'night';
  label: string;
  icon: string;
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
    icon: '🌅',
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
    icon: '☀️',
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
    icon: '🌆',
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
    icon: '🌙',
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

const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
`;

const Subtitle = styled.p`
  font-size: 0.875rem;
  color: #4b5563;
  margin-top: 0.5rem;
  background-color:rgb(147, 199, 184);
  font-weight: 600;
`;

const TimeSlotGrid = styled.div`
  display: flex;
  border-top: 1px solid #e5e7eb;
`;

const TimeSlotContainer = styled.div<{ theme: TimeSlot['theme'] }>`
  flex: 1;
  background: ${(props: { theme: TimeSlot['theme'] }) => props.theme.primary};
  border-right: 1px solid #e5e7eb;
  
  &:last-child {
    border-right: none;
  }
`;

const TimeSlotHeader = styled.div<{ theme: TimeSlot['theme'] }>`
  padding: 1rem;
  background: ${(props: { theme: TimeSlot['theme'] }) => props.theme.secondary};
  border-bottom: 1px solid ${(props: { theme: TimeSlot['theme'] }) => props.theme.secondary};
  text-align: center;
`;

const TimeSlotTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #374151;
`;

const MedicineList = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const MedicineCardStyled = styled.div<{ isSelected: boolean; theme: TimeSlot['theme'] }>`
  padding: 1rem;
  background: ${(props: { isSelected: boolean; theme: TimeSlot['theme'] }) => 
    props.isSelected ? `linear-gradient(135deg, ${props.theme.selected}, ${props.theme.secondary})` : 'white'};
  border-radius: 0.75rem;
  box-shadow: ${props => props.isSelected ? 
    '0 4px 12px rgba(0, 0, 0, 0.15)' : 
    '0 2px 4px rgba(0, 0, 0, 0.05)'};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: 1px solid ${props => props.isSelected ? props.theme.secondary : '#e5e7eb'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    background: ${props => props.isSelected ? 
      `linear-gradient(135deg, ${props.theme.selected}, ${props.theme.secondary})` : 
      props.theme.hover};
  }
`;

const MedicineCardContent = styled.div<{ $isSelected: boolean }>`
  flex: 1;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background-color: ${props => props.$isSelected ? '#eff6ff' : 'transparent'};
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background-color: ${props => props.$isSelected ? '#eff6ff' : '#f9fafb'};
  }
`;

const MedicineInfo = styled.div`
  flex: 1;
`;

const MedicineName = styled.h4<{ $isSelected: boolean }>`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.$isSelected ? '#2563eb' : '#111827'};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ConfidenceBadge = styled.span<{ $confidence: number }>`
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
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

const MedicineDosage = styled.div<{ $isSelected: boolean }>`
  font-size: 0.875rem;
  color: ${props => props.$isSelected ? '#2563eb' : '#6b7280'};
  margin-top: 0.25rem;
`;

const MedicineDuration = styled.div<{ $isSelected: boolean }>`
  font-size: 0.875rem;
  color: ${props => props.$isSelected ? '#2563eb' : '#6b7280'};
  margin-top: 0.25rem;
`;

const MedicineInstructions = styled.p<{ $isSelected: boolean }>`
  font-size: 0.875rem;
  color: ${props => props.$isSelected ? 'rgba(255, 255, 255, 0.9)' : '#6b7280'};
  margin-top: 0.5rem;
  line-height: 1.25;
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
}> = ({ medicine, isSelected, onClick, theme }) => (
  <MedicineCardStyled isSelected={isSelected} theme={theme} onClick={onClick}>
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
        <MedicineDosage $isSelected={isSelected}>
          {medicine.dosage}
        </MedicineDosage>
        <MedicineDuration $isSelected={isSelected}>
          {medicine.duration}
        </MedicineDuration>
      </MedicineInfo>
    </MedicineCardContent>
    {medicine.specialInstructions && (
      <MedicineInstructions $isSelected={isSelected}>
        {medicine.specialInstructions}
      </MedicineInstructions>
    )}
  </MedicineCardStyled>
);

const TimeSlotSection: React.FC<{
  slot: TimeSlot;
  medicines: Medicine[];
  selectedMedicine: Medicine | null;
  onMedicineClick: (medicine: Medicine) => void;
}> = ({ slot, medicines, selectedMedicine, onMedicineClick }) => (
  <TimeSlotContainer theme={slot.theme}>
    <TimeSlotHeader theme={slot.theme}>
      <TimeSlotTitle>
        <span>{slot.label}</span>
        <span>{slot.icon}</span>
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

const MedicineSchedule: React.FC<MedicineScheduleProps> = ({ medicines, onUploadComplete }) => {
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [showMedicineDetails, setShowMedicineDetails] = useState(false);
  const [showUploader, setShowUploader] = useState(true);

  useEffect(() => {
    if (medicines.length > 0) {
      setShowUploader(false);
    }
  }, [medicines]);

  const handleUploadComplete = (data: PrescriptionData) => {
    if (onUploadComplete) {
      onUploadComplete(data);
    }
    setShowUploader(false);
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

  return (
    <Container>
      {showUploader ? (
        <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
          <PrescriptionUploader onUploadComplete={handleUploadComplete} />
        </div>
      ) : (
        <UploadButton onClick={() => setShowUploader(true)}>
          <svg
            style={{ width: '1.25rem', height: '1.25rem' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Upload New Prescription
        </UploadButton>
      )}

      {medicines.length > 0 && (
        <ScheduleContainer>
          <Header>
            <Title>Your Daily Medication Schedule</Title>
            <Subtitle>
              Click on any medicine to view generic alternatives from Jan Aushadhi , locate nearby Jan Aushadhi stores, and get detailed information.
            </Subtitle>
          </Header>
          
          <TimeSlotGrid>
            {timeSlots.map((slot) => (
              <TimeSlotSection
                key={slot.id}
                slot={slot}
                medicines={groupedMedicines[slot.id]}
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