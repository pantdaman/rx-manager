'use client';

import React, { useState } from 'react';
import MedicineSchedule from '../components/MedicineSchedule';
import { PrescriptionData } from '../types/prescription';

// Header Component
const AppHeader = () => (
  <header className="bg-white shadow-sm sticky top-0 z-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-20">
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-3">
            {/* Logo Container */}
            <div className="w-[50px] h-[50px] flex items-center justify-center rounded-xl bg-white shadow-md">
              <svg
                viewBox="0 0 24 24"
                width="35"
                height="35"
                fill="none"
                stroke="#FF0000"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 4v16M4 12h16" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">PrescriptAI</span>
          </div>
          <span className="text-sm bg-red-50 text-blue-600 px-3 py-1 rounded-full ml-[52px] font-medium">Your Prescription Companion</span>
        </div>
      </div>
    </div>
  </header>
);

export default function Home() {
  const [prescriptionData, setPrescriptionData] = useState<PrescriptionData | null>(null);

  const handleUploadComplete = (data: PrescriptionData) => {
    setPrescriptionData(data);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MedicineSchedule 
          medicines={prescriptionData?.medicines || []} 
          onUploadComplete={handleUploadComplete}
        />
      </div>
    </main>
  );
}
