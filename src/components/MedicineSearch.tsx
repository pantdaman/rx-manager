import { useState, useEffect } from 'react';
import { MedicineSearchResult, MedicineSearchResponse } from '../types/medicine';

interface MedicineSearchProps {
  onSelectMedicine?: (medicine: MedicineSearchResult) => void;
}

export default function MedicineSearch({ onSelectMedicine }: MedicineSearchProps) {
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<MedicineSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchMedicines = async () => {
    if (!searchText.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://apigw.umangapp.in/janAushadhiApi/ws1/searchmedicinebyname', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'VKE9PnbY5k1ZYapR5PyYQ33I26sXTX569Ed7eqyg',
          'deptid': '180',
          'formtrkr': '0',
          'srvid': '1089',
          'subsid': '0',
          'subsid2': '0',
          'tenantid': '',
        },
        body: JSON.stringify({
          tkn: '',
          trkr: Date.now().toString(),
          lang: 'en',
          lat: '28.4576912',
          lon: '77.0454836',
          lac: '90',
          did: '37',
          usag: '90',
          apitrkr: Date.now().toString(),
          usrid: '',
          mode: 'web',
          pltfrm: 'ios',
          formtrkr: '0',
          srvid: '180',
          subsid: '0',
          subsid2: '0',
          deptid: '1089',
          searchText: searchText,
          orderBy: 'MRP ASC',
          pageNo: 1,
          pageSize: 50
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch medicines');
      }

      const data: MedicineSearchResponse = await response.json();
      
      if (data.rs === 'S' && data.pd.success === 'true') {
        setResults(data.pd.data);
      } else {
        setError(data.pd.message || 'Failed to fetch medicines');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchText.trim()) {
        searchMedicines();
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchText]);

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search for medicines..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {loading && (
          <div className="absolute right-3 top-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 p-2 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-4 space-y-4">
          <div className="grid gap-4">
            {results.map((medicine) => (
              <div
                key={medicine.medicineId}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectMedicine?.(medicine)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{medicine.generic_Name}</h3>
                    <p className="text-sm text-gray-600">{medicine.companyName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">MRP: ₹{medicine.mrp}</p>
                    {medicine.savingAmount && (
                      <p className="text-sm text-green-600">
                        Savings: ₹{medicine.savingAmount}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Unit Size: {medicine.unitSize}</p>
                  <p>Item Code: {medicine.itemCode}</p>
                  {medicine.iS_GENERIC === 'true' && (
                    <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Generic
                    </span>
                  )}
                  {medicine.iS_BPPI_PRODUCT === 'true' && (
                    <span className="inline-block mt-1 ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      BPPI Product
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && searchText && results.length === 0 && (
        <div className="mt-4 text-center text-gray-500">
          No medicines found matching your search
        </div>
      )}
    </div>
  );
} 