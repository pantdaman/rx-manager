'use client';

import { useState } from 'react';
import MedicineSearch from '../../components/MedicineSearch';
import { MedicineSearchResult } from '../../types/medicine';

export default function MedicineSearchPage() {
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineSearchResult | null>(null);

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Medicine Search</h1>
          <p className="mt-2 text-gray-600">Search for medicines in the Jan Aushadhi database</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <MedicineSearch 
            onSelectMedicine={(medicine) => {
              setSelectedMedicine(medicine);
              console.log('Selected medicine:', medicine);
            }}
          />
        </div>

        {selectedMedicine && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Selected Medicine Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900">Basic Information</h3>
                <div className="mt-2 space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium">Medicine Name:</span> {selectedMedicine.medicineName}</p>
                  <p><span className="font-medium">Brand Name:</span> {selectedMedicine.brandName}</p>
                  <p><span className="font-medium">Manufacturer:</span> {selectedMedicine.manufacturer}</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Pricing</h3>
                <div className="mt-2 space-y-2 text-sm">
                  <p className="text-gray-500 line-through">MRP: ₹{selectedMedicine.mrp}</p>
                  <p className="text-green-600 font-medium">Jan Aushadhi Price: ₹{selectedMedicine.janAushadhiPrice}</p>
                  <p className="text-gray-600">
                    Savings: ₹{(selectedMedicine.mrp - selectedMedicine.janAushadhiPrice).toFixed(2)}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Composition</h3>
                <p className="mt-2 text-sm text-gray-600">{selectedMedicine.composition}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Details</h3>
                <div className="mt-2 space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium">Form:</span> {selectedMedicine.form}</p>
                  <p><span className="font-medium">Pack Size:</span> {selectedMedicine.packSize}</p>
                  <p><span className="font-medium">Category:</span> {selectedMedicine.category}</p>
                  <p><span className="font-medium">Therapeutic Category:</span> {selectedMedicine.therapeuticCategory}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 