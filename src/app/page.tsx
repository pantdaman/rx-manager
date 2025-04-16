'use client';

import React, { useState } from 'react';
import PrescriptionUploader from '../components/PrescriptionUploader';
import MedicineSchedule from '../components/MedicineSchedule';
import { PrescriptionData } from '../types/prescription';
import Sidebar from '../components/Sidebar';
import MedicineActions from '../components/MedicineActions';

// Header Component
const AppHeader = () => (
  <header className="bg-white shadow-sm sticky top-0 z-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center">
          {/* Placeholder Logo - Replace with your actual logo */}
          <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <span className="ml-3 text-xl font-semibold text-gray-900">Prescription Buddy</span>
        </div>
        {/* Add navigation or other header elements here if needed */}
      </div>
    </div>
  </header>
);

export default function Home() {
  const [prescriptionData, setPrescriptionData] = useState<PrescriptionData | null>(null);
  const [pinCode, setPinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stores, setStores] = useState<any[]>([]);

  const formatFrequency = (frequency: { morning: boolean; afternoon: boolean; evening: boolean; night: boolean }) => {
    const times = [];
    if (frequency.morning) times.push('Morning');
    if (frequency.afternoon) times.push('Afternoon');
    if (frequency.evening) times.push('Evening');
    if (frequency.night) times.push('Night');
    return times.join(', ');
  };

  const fetchStores = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('https://apigw.umangapp.in/janAushadhiApi/ws1/findstoredistance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'VKE9PnbY5k1ZYapR5PyYQ33I26sXTX569Ed7eqyg'
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

      if (response.ok) {
        const data = await response.json();
        console.log('Store API Response:', data);
        
        if (data.rs === 'S' && data.pd && data.pd.success === 'true') {
          const sortedStores = data.pd.data.sort((a: any, b: any) => 
            parseFloat(a.distanceFromUser) - parseFloat(b.distanceFromUser)
          );
          setStores(sortedStores);
        } else {
          setError(data.rd || data.pd?.message || 'No stores found in this area');
          setStores([]);
        }
      } else {
        setError('Failed to fetch stores');
        setStores([]);
      }
    } catch (e) {
      console.error('Store API Error:', e);
      setError('An error occurred while fetching stores');
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  const renderStoreDetails = (store: any) => {
    if (!store) return null;
    
    return (
      <div key={store.storeId || store.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-gray-900">{store.storeName || store.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{store.storeContactPerson}</p>
            <p className="text-sm text-gray-600 mt-2">{store.address}</p>
            <p className="text-sm text-gray-500">
              {store.district}, {store.state} - {store.pincode}
            </p>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-gray-900">
              {parseFloat(store.distanceFromUser || '0').toFixed(1)} km away
            </span>
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-4">
          {store.mobileNo && (
            <a 
              href={`tel:${store.mobileNo}`}
              className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call
            </a>
          )}
          
          {store.emailId && (
            <a 
              href={`mailto:${store.emailId}`}
              className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </a>
          )}
          
          {(store.storeLatitude || store.latitude) && (
            <a
              href={`https://www.google.com/maps?q=${store.storeLatitude || store.latitude},${store.storeLongitude || store.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              View Map
            </a>
          )}
        </div>
      </div>
    );
  };

  const handleUploadComplete = (data: PrescriptionData) => {
    setPrescriptionData(data);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AppHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MedicineSchedule 
          medicines={prescriptionData?.medicines || []} 
          onUploadComplete={handleUploadComplete}
        />
      </main>
    </div>
  );
}
