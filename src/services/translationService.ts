import axios from 'axios';

export interface TranslationResponse {
  translatedText: string;
  detectedSourceLanguage?: string;
}

// Google Cloud Translation API configuration
const TRANSLATION_API_URL = 'https://translation.googleapis.com/language/translate/v2';
const API_KEY = "AIzaSyAoKqopawAWSOLDwa66DzE2Z2lVkZE2CL4";

export const translateText = async (
  text: string, 
  targetLanguage: string, 
  sourceLanguage: string = 'en'
): Promise<string> => {
  try {
  

    const response = await axios.post(`${TRANSLATION_API_URL}?key=${API_KEY}`, {
      q: text,
      source: sourceLanguage,
      target: targetLanguage,
      format: 'text'
    });

    return response.data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Translation API error:', error);
    // Fallback to original text if translation fails
    return text;
  }
};

export const translateMultipleTexts = async (
  texts: string[], 
  targetLanguage: string, 
  sourceLanguage: string = 'en'
): Promise<string[]> => {
  try {
  

    const response = await axios.post(`${TRANSLATION_API_URL}?key=${API_KEY}`, {
      q: texts,
      source: sourceLanguage,
      target: targetLanguage,
      format: 'text'
    });

    return response.data.data.translations.map((t: any) => t.translatedText);
  } catch (error) {
    console.error('Translation API error:', error);
    // Fallback to original texts if translation fails
    return texts;
  }
};

export const detectLanguage = async (text: string): Promise<string> => {
  try {
  

    const response = await axios.post(`https://translation.googleapis.com/language/detect/v2?key=${API_KEY}`, {
      q: text
    });

    return response.data.data.detections[0][0].language;
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en'; // Fallback to English
  }
};