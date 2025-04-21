import { LLMProvider } from '../types/config';
import { PrescriptionData } from '../types/prescription';
import * as jose from 'jose';
import { getApiUrl } from '../config/api';

const SYSTEM_PROMPT = `You are a medical prescription analyzer. Extract structured information from the given prescription text.

Focus on:
1. Medicine names
2. Dosage information
3. Frequency (morning, afternoon, evening, night)
4. Duration
5. Special instructions

IMPORTANT: You must respond with ONLY a valid JSON object in the following format, with no additional text or explanations:

{
  "medicines": [
    {
      "name": "Medicine Name",
      "confidence": 95,  # Confidence score between 0-100 indicating how sure you are about this medicine's information
      "dosage": "Dosage Amount",
      "frequency": {
        "morning": true/false,
        "afternoon": true/false,
        "evening": true/false,
        "night": true/false
      },
      "duration": "Duration Period",
      "specialInstructions": "Any special instructions"
    }
  ],
  "patientInfo": {
    "name": "Patient Name if available",
    "age": "Patient Age if available",
    "gender": "Patient Gender if available"
  },
  "doctorInfo": {
    "name": "Doctor Name if available",
    "specialization": "Specialization if available"
  }
}`;

export async function analyzePrescription(
  text: string,
  provider: LLMProvider,
  apiKey: string
): Promise<PrescriptionData> {
  switch (provider) {
    case 'google':
      return analyzeWithGoogle(text, apiKey);
    case 'openai':
      return analyzeWithOpenAI(text, apiKey);
    case 'anthropic':
      return analyzeWithAnthropic(text, apiKey);
    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}

async function analyzeWithGoogle(text: string, apiKey: string): Promise<PrescriptionData> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{
            text: `${SYSTEM_PROMPT}\n\nPrescription text:\n${text}\n\nProvide the response in the exact JSON format specified above.`
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        }
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Failed to analyze with Google Gemini: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return parseGoogleResponse(data);
}

async function analyzeWithOpenAI(text: string, apiKey: string): Promise<PrescriptionData> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Analyze this prescription and provide the response in the exact JSON format specified above:\n\n${text}` }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Failed to analyze with OpenAI: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return parseOpenAIResponse(data);
}

async function analyzeWithAnthropic(text: string, apiKey: string): Promise<PrescriptionData> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-opus-20240229',
      messages: [
        {
          role: 'user',
          content: `${SYSTEM_PROMPT}\n\nAnalyze this prescription and provide the response in the exact JSON format specified above:\n\n${text}`
        }
      ],
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Failed to analyze with Anthropic: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return parseAnthropicResponse(data);
}

function parseGoogleResponse(data: any): PrescriptionData {
  try {
    const response = JSON.parse(data.candidates[0].content.parts[0].text);
    return response;
  } catch (error) {
    console.error('Error parsing Google Gemini response:', error);
    throw new Error('Failed to parse Google Gemini response');
  }
}

function parseOpenAIResponse(data: any): PrescriptionData {
  try {
    const response = JSON.parse(data.choices[0].message.content);
    return response;
  } catch (error) {
    console.error('Error parsing OpenAI response:', error);
    throw new Error('Failed to parse OpenAI response');
  }
}

function parseAnthropicResponse(data: any): PrescriptionData {
  try {
    const response = JSON.parse(data.content[0].text);
    return response;
  } catch (error) {
    console.error('Error parsing Anthropic response:', error);
    throw new Error('Failed to parse Anthropic response');
  }
}

export async function searchDrugs(name: string) {
  try {
    const response = await fetch(`${getApiUrl('SEARCH_DRUGS')}?name=${encodeURIComponent(name)}`);
    if (!response.ok) {
      throw new Error('Failed to search drugs');
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching drugs:', error);
    throw error;
  }
}

export async function processPrescription(file: File) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(getApiUrl('PROCESS_PRESCRIPTION'), {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to process prescription');
    }

    return await response.json();
  } catch (error) {
    console.error('Error processing prescription:', error);
    throw error;
  }
}

export async function searchStores(latitude: number, longitude: number) {
  try {
    const response = await fetch(
      `${getApiUrl('SEARCH_STORES')}?latitude=${latitude}&longitude=${longitude}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to search stores');
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching stores:', error);
    throw error;
  }
} 