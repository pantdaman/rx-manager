'use client';

import { useState } from 'react';
import PrescriptionUploader from '../components/PrescriptionUploader';
import { PrescriptionData } from '../types/prescription';
import Sidebar from '../components/Sidebar';
import MedicineActions from '../components/MedicineActions';

export default function Home() {
  const [prescriptionData, setPrescriptionData] = useState<PrescriptionData | null>(null);

  const formatFrequency = (frequency: { morning: boolean; afternoon: boolean; evening: boolean; night: boolean }) => {
    const times = [];
    if (frequency.morning) times.push('Morning');
    if (frequency.afternoon) times.push('Afternoon');
    if (frequency.evening) times.push('Evening');
    if (frequency.night) times.push('Night');
    return times.join(', ');
  };

  return (
    <main className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Prescription Manager
        </h1>

        <Sidebar />

        {!prescriptionData ? (
          <PrescriptionUploader onUploadComplete={setPrescriptionData} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prescriptionData.medicines.map((medicine, index) => (
              <MedicineActions
                key={index}
                name={medicine.name}
                dosage={medicine.dosage}
                frequency={formatFrequency(medicine.frequency)}
                duration={medicine.duration}
                confidence={medicine.confidence}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
