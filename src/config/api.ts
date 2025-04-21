// Firebase Functions endpoints
const FIREBASE_REGION = 'us-central1';
const PROJECT_ID = 'prescriptai';

export const API_ENDPOINTS = {
  SEARCH_DRUGS: `https://${FIREBASE_REGION}-${PROJECT_ID}.cloudfunctions.net/search_drugs`,
  PROCESS_PRESCRIPTION: `https://${FIREBASE_REGION}-${PROJECT_ID}.cloudfunctions.net/process_prescription`,
  SEARCH_STORES: `https://${FIREBASE_REGION}-${PROJECT_ID}.cloudfunctions.net/search_stores`,
};

export const getApiUrl = (endpoint: keyof typeof API_ENDPOINTS) => {
  return API_ENDPOINTS[endpoint];
}; 