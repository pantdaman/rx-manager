import { LLMProvider } from '../types/config';
import { PrescriptionData } from '../types/prescription';
import * as jose from 'jose';

const SYSTEM_PROMPT = `You are a medical prescription analyzer. Extract structured information from the given prescription text.
Focus on:
1. Medicine names
2. Dosage information
3. Frequency (morning, afternoon, evening, night)
4. Duration
5. Special instructions

Return the response in the following JSON format:
{
  "medicines": [
    {
      "name": "Medicine Name",
      "confidence": 95,  // Confidence score between 0-100 indicating how sure you are about this medicine's information
      "dosage": "Dosage Amount",
      "frequency": {
        "morning": boolean,
        "afternoon": boolean,
        "evening": boolean,
        "night": boolean
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
}

For each medicine, provide a confidence score between 0-100 that indicates how certain you are about the extracted information. Consider:
- Higher confidence (90-100): Clear, standard medicine names and complete information
- Medium confidence (70-89): Slightly unclear writing but recognizable medicine names
- Lower confidence (<70): Unclear writing, ambiguous names, or missing information`;

export async function analyzePrescription(
  text: string,
  provider: LLMProvider,
  apiKey: string,
  projectId?: string
): Promise<PrescriptionData> {
  switch (provider) {
    case 'google-vertex':
      if (!projectId) throw new Error('Google Cloud Project ID is required');
      return analyzeWithGoogleVertex(text, apiKey, projectId);
    case 'openai':
      return analyzeWithOpenAI(text, apiKey);
    case 'anthropic':
      return analyzeWithAnthropic(text, apiKey);
    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}

async function analyzeWithGoogleVertex(text: string, serviceAccountKey: string, projectId: string): Promise<PrescriptionData> {
  let serviceAccount;
  try {
    console.log('Received service account key:', serviceAccountKey.substring(0, 100) + '...');
    serviceAccount = JSON.parse(serviceAccountKey);
    console.log('Parsed service account:', {
      hasClientEmail: !!serviceAccount.client_email,
      hasPrivateKey: !!serviceAccount.private_key,
      hasPrivateKeyId: !!serviceAccount.private_key_id,
      type: serviceAccount.type
    });
    
    if (!serviceAccount.client_email || !serviceAccount.private_key || !serviceAccount.private_key_id) {
      console.error('Missing required fields:', {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key ? 'present' : 'missing',
        private_key_id: serviceAccount.private_key_id
      });
      throw new Error('Invalid service account key format');
    }
  } catch (error) {
    console.error('Error parsing service account key:', error);
    throw new Error('Invalid service account key. Please make sure you have pasted the correct JSON key file from Google Cloud Console.');
  }

  // Create JWT token
  const now = Math.floor(Date.now() / 1000);
  let token: string;
  try {
    const privateKey = await jose.importPKCS8(serviceAccount.private_key, 'RS256');
    token = await new jose.SignJWT({
      scope: 'https://www.googleapis.com/auth/cloud-platform',
    })
      .setProtectedHeader({ alg: 'RS256', kid: serviceAccount.private_key_id })
      .setIssuedAt(now)
      .setExpirationTime(now + 3600)
      .setIssuer(serviceAccount.client_email)
      .setSubject(serviceAccount.client_email)
      .setAudience('https://oauth2.googleapis.com/token')
      .sign(privateKey);
  } catch (error) {
    console.error('Error creating JWT token:', error);
    throw new Error('Failed to create authentication token');
  }
  
  // Get an access token using the service account
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: token
    }),
  });

  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.json().catch(() => ({}));
    throw new Error(`Failed to get Google Cloud access token: ${errorData.error?.message || tokenResponse.statusText}`);
  }

  const { access_token } = await tokenResponse.json();

  // Make the Vertex AI API call with the access token
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
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
    throw new Error(`Failed to analyze with Google Vertex AI: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return parseGoogleVertexResponse(data);
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

function parseGoogleVertexResponse(data: any): PrescriptionData {
  try {
    const response = JSON.parse(data.candidates[0].content.parts[0].text);
    return response;
  } catch (error) {
    console.error('Error parsing Google Vertex AI response:', error);
    throw new Error('Failed to parse Google Vertex AI response');
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