import axios from 'axios';

export interface AIMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isVoice?: boolean;
  confidence?: number;
  suggestions?: string[];
}

export interface AIResponse {
  message: string;
  confidence: number;
  category: string;
  suggestions?: string[];
  actionItems?: string[];
  relatedTopics?: string[];
}

export interface FarmingContext {
  location?: string;
  cropType?: string;
  season?: string;
  farmSize?: string;
  soilType?: string;
}

// AI Assistant API Service
class AIAssistantService {
  private apiUrl = 'https://api.openai.com/v1/chat/completions';
  private apiKey = 'YOUR_OPENAI_API_KEY'; // Replace with actual API key
  private farmingContext: FarmingContext = {};

  // Set farming context for personalized responses
  setContext(context: FarmingContext) {
    this.farmingContext = { ...this.farmingContext, ...context };
  }

  // Get AI response for farming queries
  async getAIResponse(message: string, conversationHistory: AIMessage[] = []): Promise<AIResponse> {
    try {
      // For now, using enhanced mock responses - replace with actual OpenAI API call
      const response = await this.getMockAIResponse(message);
      return response;

      /* 
      // Actual OpenAI API call (uncomment when API key is available)
      const messages = [
        {
          role: 'system',
          content: this.getSystemPrompt()
        },
        ...conversationHistory.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        {
          role: 'user',
          content: message
        }
      ];

      const response = await axios.post(
        this.apiUrl,
        {
          model: 'gpt-3.5-turbo',
          messages,
          max_tokens: 500,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        message: response.data.choices[0].message.content,
        confidence: 0.85,
        category: this.categorizeQuery(message),
        suggestions: this.generateSuggestions(message)
      };
      */
    } catch (error) {
      console.error('Error getting AI response:', error);
      throw new Error('Failed to get AI response');
    }
  }

  // Enhanced mock AI response with better logic
  private async getMockAIResponse(message: string): Promise<AIResponse> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const lowerMessage = message.toLowerCase();
    const category = this.categorizeQuery(lowerMessage);

    const responses: { [key: string]: AIResponse } = {
      weather: {
        message: `Based on current meteorological data for your area, expect partly cloudy weather with temperatures around 25°C. Humidity at 65% is ideal for most crops. Light winds from the southwest at 12 km/h. Perfect conditions for field operations today. Consider irrigation for water-intensive crops.`,
        confidence: 0.92,
        category: 'weather',
        suggestions: ['Check 7-day forecast', 'Set irrigation schedule', 'Plan field activities'],
        actionItems: ['Monitor soil moisture', 'Adjust planting schedule if needed'],
        relatedTopics: ['Irrigation planning', 'Crop scheduling', 'Weather alerts']
      },
      disease: {
        message: `For accurate disease identification, please upload a clear image of the affected plant parts. I can identify common diseases like bacterial blight, fungal rust, aphid infestations, and viral infections with 85% accuracy. Early detection is crucial for effective treatment.`,
        confidence: 0.88,
        category: 'disease',
        suggestions: ['Upload plant images', 'Learn about preventive measures', 'Contact agricultural expert'],
        actionItems: ['Take clear photos of affected areas', 'Note symptoms and timeline'],
        relatedTopics: ['Preventive spraying', 'Organic treatments', 'Disease resistance varieties']
      },
      market: {
        message: `Current market analysis:\n🍅 Tomato: ₹45/kg (+12% from last week)\n🧅 Onion: ₹32/kg (-8% decline)\n🌾 Rice: ₹52/kg (stable)\n📈 Best selling opportunity for tomatoes in next 2-3 days. Consider holding onions for price recovery.`,
        confidence: 0.90,
        category: 'market',
        suggestions: ['View detailed price trends', 'Set price alerts', 'Find nearby markets'],
        actionItems: ['Plan harvest timing', 'Contact local buyers'],
        relatedTopics: ['Price forecasting', 'Market demand', 'Transportation logistics']
      },
      crop: {
        message: `Your crop monitoring dashboard shows:\n✅ Overall health: Good (82% green index)\n💧 Soil moisture: 68% (optimal range)\n🌡️ Temperature stress: Low\n⚠️ Recommendation: Light irrigation needed for Field 2 within 24 hours. Consider nitrogen supplement for Field 1.`,
        confidence: 0.87,
        category: 'crop',
        suggestions: ['View detailed field analysis', 'Schedule irrigation', 'Plan fertilizer application'],
        actionItems: ['Irrigate Field 2', 'Test soil in Field 1'],
        relatedTopics: ['Soil testing', 'Nutrient management', 'Growth monitoring']
      },
      schemes: {
        message: `Available government schemes for farmers:\n🌱 Drip Irrigation Subsidy (90% subsidy, ₹1.5L max)\n☀️ Solar Pump Scheme (75% subsidy, ₹2L max)\n🛡️ Crop Insurance (98% premium subsidy)\n🚜 Machinery Subsidy (40-80% subsidy)\nWould you like details about any specific scheme?`,
        confidence: 0.93,
        category: 'schemes',
        suggestions: ['View scheme details', 'Check eligibility', 'Start application process'],
        actionItems: ['Gather required documents', 'Visit agriculture office'],
        relatedTopics: ['Subsidy calculation', 'Application deadlines', 'Required documents']
      },
      help: {
        message: `I'm your AI farming assistant! I can help you with:\n🌾 Real-time crop monitoring and health analysis\n🦠 Plant disease identification using AI vision\n📈 Market price trends and selling advice\n🌤️ Weather forecasts and farming recommendations\n🏛️ Government schemes and subsidy information\n💡 Expert farming tips and best practices\n\nWhat would you like to know more about?`,
        confidence: 0.95,
        category: 'general',
        suggestions: ['Crop monitoring', 'Disease detection', 'Market prices', 'Weather forecast'],
        relatedTopics: ['Getting started guide', 'Feature overview', 'Expert consultation']
      }
    };

    // Determine response category and return appropriate response
    if (lowerMessage.includes('weather') || lowerMessage.includes('temperature') || lowerMessage.includes('rain')) {
      return responses.weather;
    } else if (lowerMessage.includes('disease') || lowerMessage.includes('pest') || lowerMessage.includes('infection') || lowerMessage.includes('spots')) {
      return responses.disease;
    } else if (lowerMessage.includes('market') || lowerMessage.includes('price') || lowerMessage.includes('sell') || lowerMessage.includes('buy')) {
      return responses.market;
    } else if (lowerMessage.includes('crop') || lowerMessage.includes('monitor') || lowerMessage.includes('soil') || lowerMessage.includes('field')) {
      return responses.crop;
    } else if (lowerMessage.includes('scheme') || lowerMessage.includes('subsidy') || lowerMessage.includes('government') || lowerMessage.includes('loan')) {
      return responses.schemes;
    } else if (lowerMessage.includes('help') || lowerMessage.includes('assist') || lowerMessage.includes('what') || lowerMessage.includes('how')) {
      return responses.help;
    } else {
      return {
        message: `I understand you're asking about farming. Could you be more specific? I'm specialized in:\n\n🌾 Crop monitoring and analysis\n🦠 Disease identification\n📈 Market trends and pricing\n🌤️ Weather forecasting\n🏛️ Government schemes\n\nTry asking about any of these topics for detailed assistance!`,
        confidence: 0.75,
        category: 'general',
        suggestions: ['Ask about crop health', 'Check weather forecast', 'View market prices', 'Explore government schemes']
      };
    }
  }

  // Process voice input
  async processVoiceInput(audioBlob: Blob): Promise<string> {
    try {
      // Mock voice processing - replace with actual speech-to-text API
      await new Promise(resolve => setTimeout(resolve, 2000));
      return "What is the weather forecast for today?";
    } catch (error) {
      console.error('Error processing voice input:', error);
      throw new Error('Failed to process voice input');
    }
  }

  // Convert text to speech
  async textToSpeech(text: string, language: string = 'en'): Promise<Blob> {
    try {
      // Mock TTS - replace with actual text-to-speech API
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'en' ? 'en-US' : 'hi-IN';
      speechSynthesis.speak(utterance);
      
      // Return empty blob for now
      return new Blob();
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      throw new Error('Failed to convert text to speech');
    }
  }

  // Get farming recommendations
  async getFarmingRecommendations(cropType: string, location: string): Promise<string[]> {
    try {
      const mockRecommendations = [
        `For ${cropType} in ${location}, consider planting in the next 2 weeks`,
        `Soil pH should be maintained between 6.0-7.0 for optimal growth`,
        `Apply organic fertilizer 15 days before sowing`,
        `Install drip irrigation for water efficiency`,
        `Monitor for common pests during flowering stage`
      ];
      
      return mockRecommendations;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw new Error('Failed to get farming recommendations');
    }
  }

  private categorizeQuery(message: string): string {
    const categories = {
      weather: ['weather', 'temperature', 'rain', 'climate', 'forecast'],
      disease: ['disease', 'pest', 'infection', 'spots', 'fungus', 'virus'],
      market: ['market', 'price', 'sell', 'buy', 'cost', 'profit'],
      crop: ['crop', 'plant', 'grow', 'harvest', 'soil', 'field'],
      schemes: ['scheme', 'subsidy', 'government', 'loan', 'support'],
      general: ['help', 'what', 'how', 'when', 'where', 'why']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        return category;
      }
    }
    return 'general';
  }

  private getSystemPrompt(): string {
    return `You are an AI farming assistant specialized in helping farmers with crop monitoring, disease identification, market analysis, weather forecasting, and government schemes. 

Current farming context:
- Location: ${this.farmingContext.location || 'Not specified'}
- Crop type: ${this.farmingContext.cropType || 'Mixed farming'}
- Season: ${this.farmingContext.season || 'Current season'}
- Farm size: ${this.farmingContext.farmSize || 'Not specified'}

Provide helpful, accurate, and actionable advice. Always consider local conditions and practical implementation. Keep responses concise but comprehensive.`;
  }
}

export const aiAssistantService = new AIAssistantService();