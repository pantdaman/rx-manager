import { useState } from 'react';
import { Medicine } from '../types/prescription';

type MedicineCardProps = Medicine;

export default function MedicineCard({
  name,
  confidence = 95,
  dosage,
  frequency,
  duration,
  specialInstructions
}: MedicineCardProps) {
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const formatFrequency = (freq: typeof frequency) => {
    const times = [];
    if (freq.morning) times.push('Morning');
    if (freq.afternoon) times.push('Afternoon');
    if (freq.evening) times.push('Evening');
    if (freq.night) times.push('Night');
    return times.join(', ');
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b">
        <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
            AI Confidence: {confidence}%
          </span>
        </div>
      </div>

      {/* Medicine Details */}
      <div className="p-4 bg-gray-50">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Dosage</p>
            <p className="font-medium">{dosage}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Frequency</p>
            <p className="font-medium">{formatFrequency(frequency)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Duration</p>
            <p className="font-medium">{duration}</p>
          </div>
        </div>
        {specialInstructions && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">Special Instructions</p>
            <p className="font-medium">{specialInstructions}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t">
        <button
          onClick={() => setIsActionsOpen(!isActionsOpen)}
          className="w-full p-3 text-left text-gray-700 hover:bg-gray-50 focus:outline-none"
        >
          What would you like to do?
        </button>
        {isActionsOpen && (
          <div className="border-t">
            <button className="w-full p-3 text-left text-gray-700 hover:bg-gray-50 border-b">
              Find Alternatives for {name}
            </button>
            <button className="w-full p-3 text-left text-gray-700 hover:bg-gray-50 border-b">
              Locate Nearby Stores for {name}
            </button>
            <button className="w-full p-3 text-left text-gray-700 hover:bg-gray-50">
              Get Detailed Information for {name}
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 