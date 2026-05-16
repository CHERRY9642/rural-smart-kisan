import axios from 'axios';

export interface Scheme {
  id: string;
  name: string;
  category: string;
  subsidy: string;
  maxAmount: string;
  status: 'active' | 'closed';
  deadline: string;
  eligibility: string[];
  documents: string[];
  benefits: string[];
  applicationProcess: string[];
  description?: string;
  targetState?: string;
}

export interface AnalysisResult {
  analysis: string;
}


export interface HelpCenter {
  name: string;
  address: string;
  phone: string;
  distance: string;
  email?: string;
  services?: string[];
}

export interface SchemeSearchParams {
  query?: string;
  category?: string;
  state?: string;
  limit?: number;
}

// Government Schemes API Service
class GovernmentSchemesService {
  private baseURL = 'https://api.data.gov.in/resource';
  private apiKey = 'YOUR_DATA_GOV_IN_API_KEY'; // Replace with actual API key

  // Fetch schemes from Government API
  async fetchSchemes(params: SchemeSearchParams = {}): Promise<Scheme[]> {
    try {
      // Using mock data for now - replace with actual API call
      const mockSchemes: Scheme[] = [
        {
          id: 'drip-irrigation',
          name: 'Drip Irrigation Subsidy',
          category: 'Water Management',
          subsidy: '90%',
          maxAmount: '₹1,50,000',
          status: 'active',
          deadline: '2024-03-31',
          eligibility: [
            'Small and marginal farmers',
            'Minimum 0.5 acre land',
            'Valid land documents',
            'Bank account linked to Aadhaar'
          ],
          documents: [
            'Land ownership certificate',
            'Aadhaar card',
            'Bank passbook',
            'Passport size photographs'
          ],
          benefits: [
            'Up to 90% subsidy on drip irrigation systems',
            'Water conservation technology',
            'Increased crop yield',
            'Reduced labor costs'
          ],
          applicationProcess: [
            'Visit nearest agriculture office',
            'Submit required documents',
            'Get technical evaluation done',
            'Receive approval and subsidy'
          ]
        },
        {
          id: 'solar-pump',
          name: 'Solar Water Pump Scheme',
          category: 'Renewable Energy',
          subsidy: '75%',
          maxAmount: '₹2,00,000',
          status: 'active',
          deadline: '2024-04-15',
          eligibility: [
            'Farmers with irrigation needs',
            'Grid connection not available',
            'Minimum 1 acre farmland',
            'No existing subsidy availed'
          ],
          documents: [
            'Land records',
            'Income certificate',
            'Aadhaar card',
            'Bank account details'
          ],
          benefits: [
            '75% subsidy on solar pump installation',
            'Free electricity for 25 years',
            'Environmentally friendly',
            'Low maintenance costs'
          ],
          applicationProcess: [
            'Apply online at government portal',
            'Upload necessary documents',
            'Site inspection by officials',
            'Installation after approval'
          ]
        },
        {
          id: 'crop-insurance',
          name: 'Pradhan Mantri Fasal Bima Yojana',
          category: 'Insurance',
          subsidy: '98%',
          maxAmount: 'Based on crop value',
          status: 'active',
          deadline: 'Before sowing season',
          eligibility: [
            'All farmers including sharecroppers',
            'Enrolled in land records',
            'Growing notified crops',
            'Premium payment before deadline'
          ],
          documents: [
            'Land documents or agreement',
            'Aadhaar card',
            'Bank account details',
            'Sowing certificate'
          ],
          benefits: [
            'Protection against crop loss',
            '98% premium subsidy',
            'Quick claim settlement',
            'Coverage for natural calamities'
          ],
          applicationProcess: [
            'Enroll through bank or CSC',
            'Pay minimal premium',
            'Report loss within 72 hours',
            'Receive compensation'
          ]
        }
      ];

      // Filter schemes based on search parameters
      let filteredSchemes = mockSchemes;
      
      if (params.query) {
        const query = params.query.toLowerCase();
        filteredSchemes = filteredSchemes.filter(scheme =>
          scheme.name.toLowerCase().includes(query) ||
          scheme.category.toLowerCase().includes(query) ||
          scheme.benefits.some(benefit => benefit.toLowerCase().includes(query))
        );
      }

      if (params.category) {
        filteredSchemes = filteredSchemes.filter(scheme =>
          scheme.category.toLowerCase() === params.category?.toLowerCase()
        );
      }

      return filteredSchemes.slice(0, params.limit || 10);
    } catch (error) {
      console.error('Error fetching schemes:', error);
      throw new Error('Failed to fetch government schemes');
    }
  }

  // Fetch help centers
  async fetchHelpCenters(location?: string): Promise<HelpCenter[]> {
    try {
      // Mock data - replace with actual API call
      const mockHelpCenters: HelpCenter[] = [
        {
          name: 'Bangalore Agriculture Office',
          address: 'Vidhana Soudha, Bangalore',
          phone: '+91-80-2234-5678',
          distance: '12 km',
          email: 'agri.bangalore@gov.in',
          services: ['Scheme applications', 'Technical support', 'Documentation']
        },
        {
          name: 'Krishi Vigyan Kendra',
          address: 'UAS Campus, Hebbal',
          phone: '+91-80-2345-6789',
          distance: '8 km',
          email: 'kvk.hebbal@uasbangalore.edu.in',
          services: ['Training programs', 'Technical guidance', 'Soil testing']
        },
        {
          name: 'District Collector Office',
          address: 'Mini Vidhana Soudha',
          phone: '+91-80-3456-7890',
          distance: '15 km',
          email: 'dc.bangalore@gov.in',
          services: ['Revenue matters', 'Land records', 'Subsidy approvals']
        }
      ];

      return mockHelpCenters;
    } catch (error) {
      console.error('Error fetching help centers:', error);
      throw new Error('Failed to fetch help centers');
    }
  }

  // Search schemes with voice query
  async searchSchemesWithVoice(voiceQuery: string): Promise<Scheme[]> {
    try {
      // Process voice query and extract relevant keywords
      const keywords = this.extractKeywords(voiceQuery);
      return await this.fetchSchemes({ query: keywords.join(' ') });
    } catch (error) {
      console.error('Error processing voice query:', error);
      throw new Error('Failed to process voice query');
    }
  }

  // Apply for a scheme
  async applyForScheme(schemeId: string, applicationData: any): Promise<{ success: boolean; applicationId?: string }> {
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        success: true,
        applicationId: `APP${Date.now()}`
      };
    } catch (error) {
      console.error('Error applying for scheme:', error);
      throw new Error('Failed to submit application');
    }
  }

  private extractKeywords(text: string): string[] {
    const keywords = text.toLowerCase().match(/\b\w+\b/g) || [];
    const relevantKeywords = keywords.filter(word => 
      word.length > 3 && 
      !['about', 'tell', 'what', 'how', 'when', 'where', 'can', 'will', 'should'].includes(word)
    );
    return relevantKeywords;
  }

  async analyzeSchemes(formData: FormData): Promise<AnalysisResult> {
    try {
      const response = await axios.post('https://krishischemes-api.onrender.com/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error analyzing schemes:', error);
      throw new Error('Failed to analyze schemes');
    }
  }
}

export const governmentSchemesService = new GovernmentSchemesService();