export interface Store {
  sr_no: string;
  kendra_code: string;
  name?: string;
  owner_name?: string;
  address: string;
  district: string;
  state: string;
  pin_code: string;
  contact?: string;
  contact_no?: string;
  working_hours?: string;
  status?: string;
  latitude?: string;
  longitude?: string;
}

export interface StoreSearchParams {
  postal_code?: string;
  state?: string;
  district?: string;
}

const API_BASE_URL = 'http://localhost:8002'; // Update this based on your backend URL

export const searchStores = async (params: StoreSearchParams): Promise<Store[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.postal_code) queryParams.append('postal_code', params.postal_code);
    if (params.state) queryParams.append('state', params.state);
    if (params.district) queryParams.append('district', params.district);

    const response = await fetch(`${API_BASE_URL}/api/stores/search?${queryParams.toString()}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to fetch stores');
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching stores:', error);
    throw error; // Re-throw to handle in component
  }
};

export const getStoreDetails = async (kendraCode: string): Promise<Store | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stores/${kendraCode}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to fetch store details');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching store details:', error);
    throw error;
  }
}; 