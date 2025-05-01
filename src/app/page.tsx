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
          <span className="text-sm text-blue-800 ml-[52px]">Your AI Prescription Companion</span>
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
      <div className="min-h-screen w-full bg-gray-100">
        <AppHeader onOpenSettings={() => setShowSettings(true)} />
        {/* Hero Info Section */}
        {!prescriptionData && (
          <section className="relative max-w-7xl mx-auto mt-8 mb-8 px-4 py-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-lg border border-blue-200">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-blue-100 rounded-full opacity-30 pointer-events-none"></div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-5 text-center">How does PrescriptAI work?</h2>
            <div className="flex flex-col md:flex-row items-stretch justify-between gap-6">
              {/* Step 1 */}
              <div className="flex-1 flex flex-col items-center text-center px-2 py-4">
                <div className="w-14 h-14 flex items-center justify-center bg-blue-200 rounded-full mb-3 text-2xl shadow">
                  📤
                </div>
                <span className="font-semibold text-blue-800 mb-1">Upload Prescription</span>
                <span className="text-gray-600 text-sm">Take a photo or upload your prescription to get started.</span>
              </div>
              {/* Step 2: Translation */}
              <div className="flex-1 flex flex-col items-center text-center px-2 py-4">
                <div className="w-14 h-14 flex items-center justify-center bg-blue-200 rounded-full mb-3 text-2xl shadow">
                  📅
                </div>
                <span className="font-semibold text-blue-800 mb-1">Visual Medicine Schedule</span>
                <span className="text-gray-600 text-sm">See your medicines organized in a clear, visual schedule with details.</span>
              </div>
              {/* Step 3 */}

              <div className="flex-1 flex flex-col items-center text-center px-2 py-4">
                <div className="w-14 h-14 flex items-center justify-center bg-blue-200 rounded-full mb-3 text-2xl shadow">
                  🌐
                </div>
                <span className="font-semibold text-blue-800 mb-1">Translation</span>
                <span className="text-gray-600 text-sm">Translate your prescription to your preferred language for better understanding.</span>
              </div>
              {/* Step 4 */}
              <div className="flex-1 flex flex-col items-center text-center px-2 py-4">
                <div className="w-14 h-14 flex items-center justify-center bg-blue-200 rounded-full mb-3 text-2xl shadow">
                  🏥
                </div>
                <span className="font-semibold text-blue-800 mb-1">Find Cheaper Options</span>
                <span className="text-gray-600 text-sm">Locate nearby Jan Aushadhi stores for affordable medicines.</span>
              </div>
            </div>
          </section>
        )}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
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
