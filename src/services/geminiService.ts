import { getGeminiApiKey } from '../utils/config';
import { AppConfig } from '../types/config';

export async function generateGeminiResponse(prompt: string, config: AppConfig): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Google Gemini API key is not configured. Please set it in settings or environment variables.');
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Gemini API error details:', errorData);
      throw new Error(
        `Gemini API error: ${response.statusText}${errorData?.error?.message ? ` - ${errorData.error.message}` : ''}`
      );
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to generate Gemini response');
  }
} 