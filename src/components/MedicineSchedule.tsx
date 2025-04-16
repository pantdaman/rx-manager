import React, { useState, useEffect } from 'react';
import { Medicine, PrescriptionData } from '../types/prescription';
import MedicineActions from './MedicineActions';
import PrescriptionUploader from './PrescriptionUploader';

interface MedicineScheduleProps {
  medicines: Medicine[];
  onUploadComplete?: (data: PrescriptionData) => void;
}

const MedicineSchedule: React.FC<MedicineScheduleProps> = ({ medicines, onUploadComplete }) => {
  const [activeReminders, setActiveReminders] = useState<Set<string>>(new Set());
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [showMedicineDetails, setShowMedicineDetails] = useState(false);
  const [showUploader, setShowUploader] = useState(true);

  const handleUploadComplete = (data: PrescriptionData) => {
    if (onUploadComplete) {
      onUploadComplete(data);
    }
    setShowUploader(false);
  };

  // Hide uploader when medicines are loaded
  useEffect(() => {
    if (medicines.length > 0) {
      setShowUploader(false);
    }
  }, [medicines]);

  // Group medicines by their schedule
  const groupedMedicines = medicines.reduce((acc, medicine) => {
    const { frequency } = medicine;
    
    if (frequency.morning) {
      acc.morning.push(medicine);
    }
    if (frequency.afternoon) {
      acc.afternoon.push(medicine);
    }
    if (frequency.evening) {
      acc.evening.push(medicine);
    }
    if (frequency.night) {
      acc.night.push(medicine);
    }
    
    return acc;
  }, {
    morning: [] as Medicine[],
    afternoon: [] as Medicine[],
    evening: [] as Medicine[],
    night: [] as Medicine[]
  });

  const toggleReminder = (medicine: Medicine) => {
    setActiveReminders(prevReminders =>
      new Set(prevReminders).add(medicine.name)
    );
  };

  const handleMedicineClick = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setShowMedicineDetails(true);
  };

  const handleCloseDetails = () => {
    setShowMedicineDetails(false);
    // Don't reset selectedMedicine here to maintain the highlight
  };

  const formatFrequency = (frequency: Medicine['frequency']): string => {
    const times = [];
    if (frequency.morning) times.push('Morning');
    if (frequency.afternoon) times.push('Afternoon'); 
    if (frequency.evening) times.push('Evening');
    if (frequency.night) times.push('Night');
    return times.join(', ');
  };

  const renderMedicineList = (medicines: Medicine[], timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night') => {
    const colorClasses = {
      morning: 'bg-orange-50 border-orange-200',
      afternoon: 'bg-yellow-50 border-yellow-200',
      evening: 'bg-blue-50 border-blue-200',
      night: 'bg-indigo-50 border-indigo-200',
    };

    if (medicines.length === 0) {
      return (
        <div className={`text-gray-500 text-center py-3 ${colorClasses[timeOfDay]}`}>
          No medication
        </div>
      );
    }

    return medicines.map((medicine, index) => (
      <div 
        key={`${medicine.name}-${index}`} 
        className={`py-3 px-4 ${index !== medicines.length - 1 ? 'border-b' : ''} cursor-pointer transition-colors ${colorClasses[timeOfDay]}`}
        onClick={() => handleMedicineClick(medicine)}
      >
        <div className={`flex items-center space-x-2 ${selectedMedicine?.name === medicine.name ? 'bg-blue-100' : 'transparent'} rounded-full shadow-md p-2 w-40 h-10 overflow-hidden transition-colors duration-200`}>
          <h4 className="text-gray-900 font-medium truncate">
            <span>{medicine.name}</span>
          </h4>
        </div>
      </div>
    ));
  };

  const timeSlots = [
    {
      id: 'morning',
      label: 'Morning',
      icon: '🌅',
      color: 'text-orange-900',
      borderColor: 'border-orange-300',
      bgColor: 'bg-orange-50',
      headerBg: 'bg-orange-200',
    },
    {
      id: 'afternoon',
      label: 'Afternoon',
      icon: '☀️',
      color: 'text-yellow-900',
      borderColor: 'border-yellow-300',
      bgColor: 'bg-yellow-50',
      headerBg: 'bg-yellow-200',
    },
    {
      id: 'evening',
      label: 'Evening',
      icon: '🌆',
      color: 'text-blue-900',
      borderColor: 'border-blue-300',
      bgColor: 'bg-blue-50',
      headerBg: 'bg-blue-200',
    },
    {
      id: 'night',
      label: 'Night',
      icon: '🌙',
      color: 'text-indigo-900',
      borderColor: 'border-indigo-300',
      bgColor: 'bg-indigo-50',
      headerBg: 'bg-indigo-200',
    },
  ] as const;

  return (
    <div className="space-y-6">
      {showUploader ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <PrescriptionUploader onUploadComplete={handleUploadComplete} />
        </div>
      ) : (
        <button
          onClick={() => setShowUploader(true)}
          className="w-full bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 flex items-center justify-center gap-2 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg
            className="w-5 h-5"
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
        </button>
      )}

      {/* Medicine Schedule Display */}
      {medicines.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 p-6 border-b border-gray-200">
            Your Daily Medication Schedule
          </h2>
          <p className="text-sm text-gray-600 px-6 pb-4 border-b border-gray-200">
            Click on the medicine tab to find alternatives, locate nearby stores, and get the details of the medicine.
          </p>
          
          <div className="flex divide-x divide-gray-200">
            {timeSlots.map((slot) => (
              <div 
                key={slot.id} 
                className={`flex-1 ${slot.bgColor}`}
              >
                <div className={`py-6 px-4 ${slot.headerBg} border-b ${slot.borderColor}`}>
                  <h3 className="text-xl font-bold flex items-center justify-center" style={{ color: '#000000' }}>
                    <span style={{ color: '#000000' }}>{slot.label}</span>
                    <span className="ml-2">{slot.icon}</span>
                  </h3>
                </div>
                <div className="h-full">
                  {renderMedicineList(groupedMedicines[slot.id], slot.id)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medicine Details Modal */}
      {showMedicineDetails && selectedMedicine && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <MedicineActions
            name={selectedMedicine.name}
            dosage={selectedMedicine.dosage}
            frequency={formatFrequency(selectedMedicine.frequency)}
            duration={selectedMedicine.duration}
            onClose={handleCloseDetails}
          />
        </div>
      )}
    </div>
  );
};

export default MedicineSchedule; 