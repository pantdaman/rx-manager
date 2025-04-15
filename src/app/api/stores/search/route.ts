import { NextResponse } from 'next/server';

// Hardcoded store data
const mockStores = [
  {
    kendra_code: 'JK001',
    sr_no: '1',
    owner_name: 'Rajesh Kumar',
    address: '123, Main Street, Gandhi Nagar',
    district: 'Jammu',
    state: 'Jammu & Kashmir',
    pin_code: '180001',
    contact_no: '9876543210'
  },
  {
    kendra_code: 'DL002',
    sr_no: '2',
    owner_name: 'Priya Singh',
    address: '45, Market Road, Connaught Place',
    district: 'New Delhi',
    state: 'Delhi',
    pin_code: '110001',
    contact_no: '9876543211'
  },
  {
    kendra_code: 'MH003',
    sr_no: '3',
    owner_name: 'Amit Patel',
    address: '78, Link Road, Andheri West',
    district: 'Mumbai',
    state: 'Maharashtra',
    pin_code: '400053',
    contact_no: '9876543212'
  },
  // Adding more test data with different PIN codes
  {
    kendra_code: 'MH004',
    sr_no: '4',
    owner_name: 'Suresh Shah',
    address: '15, Market Road, Andheri East',
    district: 'Mumbai',
    state: 'Maharashtra',
    pin_code: '400069',
    contact_no: '9876543213'
  },
  {
    kendra_code: 'MH005',
    sr_no: '5',
    owner_name: 'Rahul Desai',
    address: '45, Link Road, Borivali West',
    district: 'Mumbai',
    state: 'Maharashtra',
    pin_code: '400092',
    contact_no: '9876543214'
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pinCode = searchParams.get('pin_code');
    
    console.log('Searching for stores with PIN code:', pinCode);

    if (!pinCode) {
      console.log('No PIN code provided');
      return NextResponse.json(
        { error: 'Postal code is required' },
        { status: 400 }
      );
    }

    // Filter stores based on PIN code
    let filteredStores = mockStores;
    
    // First try exact PIN code match
    const exactMatches = mockStores.filter(store => store.pin_code === pinCode);
    
    if (exactMatches.length > 0) {
      console.log('Found exact matches:', exactMatches.length);
      filteredStores = exactMatches;
    } else {
      // If no exact matches, try matching first 3 digits for nearby areas
      const areaPrefix = pinCode.slice(0, 3);
      filteredStores = mockStores.filter(store => store.pin_code.startsWith(areaPrefix));
      console.log('Found nearby matches:', filteredStores.length);
    }

    console.log('Returning filtered stores:', filteredStores);
    return NextResponse.json(filteredStores);
  } catch (error) {
    console.error('Error in store search:', error);
    return NextResponse.json(
      { error: 'Failed to search stores' },
      { status: 500 }
    );
  }
} 