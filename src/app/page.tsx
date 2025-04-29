'use client';

import React, { useState } from 'react';
import MedicineSchedule from '../components/MedicineSchedule';
import { PrescriptionData } from '../types/prescription';
import SettingsModal from '../components/SettingsModal';
import { AppConfig } from '../types/config';
import { Stethoscope, Settings } from 'lucide-react';

// Header Component
const AppHeader = ({ onOpenSettings }: { onOpenSettings: () => void }) => (
  <header className="bg-white shadow-sm sticky top-0 z-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-20">
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-2">
            {/* Logo Container */}
            <div className="w-[45px] h-[45px] flex items-center justify-center rounded-xl bg-gradient-to-br from-white-600 to-blue-700 shadow-md">
              <div className="w-9 h-10 flex items-center justify-center text-red-700 text-3xl font-bold">✚</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-gray-900 tracking-tight">PrescriptAI</span>
            </div>
          </div>
          <span className="text-sm text-blue-800 ml-[52px]">Your Prescription Companion</span>
        </div>
        
        {/* <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 border border-gray-200 hover:border-gray-300"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium">Settings</span>
        </button> */}
      </div>
    </div>
  </header>
);

export default function Home() {
  const [prescriptionData, setPrescriptionData] = useState<PrescriptionData | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const handleUploadComplete = (data: PrescriptionData) => {
    setPrescriptionData(data);
  };

  const handleSaveSettings = (config: AppConfig) => {
    localStorage.setItem('rx-manager-config', JSON.stringify(config));
    setShowSettings(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AppHeader onOpenSettings={() => setShowSettings(true)} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MedicineSchedule 
          medicines={prescriptionData?.medicines || []} 
          onUploadComplete={handleUploadComplete}
        />
      </main>
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
