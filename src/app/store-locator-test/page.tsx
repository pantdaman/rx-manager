'use client';

import { useState } from 'react';

interface Store {
  storeId: string;
  storeNo: string;
  storeName: string;
  storeContactPerson: string;
  storeAreaName: string | null;
  address: string;
  district: string;
  state: string;
  pincode: string;
  emailId: string;
  mobileNo: string;
  fileNo: string | null;
  dateOfOpening: string | null;
  category: string | null;
  organisation: string | null;
  storeTime: string | null;
  distanceFromUser: string;
  storeLatitude: string;
  storeLongitude: string;
  stockStatus: string;
}

export default function StoreLocatorTest() {
  const [pinCode, setPinCode] = useState('');
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStores = async () => {
    setLoading(true);
    setError('');
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

      console.log('Request payload:', JSON.stringify(requestBody, null, 2));

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

      const data = await response.json();
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      console.log('Store API Response:', data);

      if (data.rs === 'S' && data.pd && data.pd.success === 'true') {
        const sortedStores = data.pd.data.sort((a: Store, b: Store) => 
          parseFloat(a.distanceFromUser) - parseFloat(b.distanceFromUser)
        );
        setStores(sortedStores);
      } else {
        setError(data.rd || data.pd?.message || 'No stores found in this area');
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

  const renderStoreDetails = (store: Store) => (
    <div key={store.storeId} className="bg-white rounded-lg shadow-md p-4 mb-4">
      <details className="cursor-pointer">
        <summary className="font-semibold text-lg flex justify-between items-center">
          <span>{store.storeName}</span>
          <span className="text-sm text-gray-600">
            {parseFloat(store.distanceFromUser).toFixed(2)} km away
          </span>
        </summary>
        <div className="mt-4 space-y-2">
          <p className="text-gray-700">
            <span className="font-medium">Contact Person:</span> {store.storeContactPerson}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Stock Status:</span>
            <span className={store.stockStatus === 'Yes' ? 'text-green-600' : 'text-red-600'}>
              {' '}{store.stockStatus}
            </span>
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Address:</span> {store.address}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {store.mobileNo && (
              <a
                href={`tel:${store.mobileNo}`}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200"
              >
                📞 Call
              </a>
            )}
            {store.emailId && (
              <a
                href={`mailto:${store.emailId}`}
                className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200"
              >
                ✉️ Email
              </a>
            )}
          </div>
        </div>
      </details>
    </div>
  );

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Store Locator Test</h1>
      
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={pinCode}
          onChange={(e) => setPinCode(e.target.value)}
          placeholder="Enter PIN code"
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={fetchStores}
          disabled={loading || !pinCode}
          className={`px-4 py-2 rounded ${
            loading || !pinCode
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {stores.map(renderStoreDetails)}
      </div>
    </div>
  );
} 