import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWeather } from '@/hooks/useWeather';
import { useToast } from '@/components/ui/use-toast';
import { 
  ShoppingCart,
  Plus,
  Search,
  MapPin,
  Star,
  Clock,
  User,
  Phone,
  Package,
  Truck,
  CheckCircle,
  Calendar,
  Filter,
  Grid,
  List,
  Heart,
  MessageCircle,
  XCircle,
  Eye,
  Camera,
  ShoppingBag,
  Leaf,
  Beaker,
  Zap,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Sun,
  Wind,
  Thermometer,
  Droplets,
  CloudRain
} from 'lucide-react';

type RecommendationMode = 'recommendation' | 'scheduling';

interface SoilData {
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  pH: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
}

interface CropRecommendation {
  name: string;
  suitability: number;
  season: string;
  description: string;
  requirements: string[];
  expectedYield: string;
  duration: string;
}

interface ScheduleItem {
  id: string;
  crop: string;
  plantingDate: string;
  harvestDate: string;
  status: 'planned' | 'planted' | 'growing' | 'harvested';
  notes: string;
}

const CropRecommendation = () => {
  const { translateSync } = useLanguage();
  const { weatherData, loading: weatherLoading, error: weatherError } = useWeather();
  const { toast } = useToast();
  
  const [activeMode, setActiveMode] = useState<RecommendationMode>('recommendation');
  const [soilData, setSoilData] = useState<SoilData>({
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    pH: ''
  });
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [customLocation, setCustomLocation] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cropSchedule, setCropSchedule] = useState<any>(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  

  // Get user's current location
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Please enter your location manually",
        variant: "destructive"
      });
      return;
    }

    setLocationLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use a geocoding service to get location name
          const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY || 'demo'}`
          );
          const data = await response.json();
          
          if (data.length > 0) {
            setLocationData({
              latitude,
              longitude,
              city: data[0].name,
              country: data[0].country
            });
          } else {
            setLocationData({
              latitude,
              longitude,
              city: 'Unknown',
              country: 'Unknown'
            });
          }
        } catch (error) {
          console.error('Error getting location name:', error);
          setLocationData({
            latitude,
            longitude,
            city: 'Unknown',
            country: 'Unknown'
          });
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationLoading(false);
        toast({
          title: "Location access denied",
          description: "Please enter your location manually",
          variant: "destructive"
        });
      }
    );
  };

  // Mock crop recommendation logic
  const generateRecommendations = () => {
    if (!soilData.nitrogen || !soilData.phosphorus || !soilData.potassium || !soilData.pH || !selectedSeason) {
      toast({
        title: "Missing information",
        description: "Please fill in all soil parameters and select a season",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockRecommendations: CropRecommendation[] = [
        {
          name: "Tomato",
          suitability: 95,
          season: selectedSeason,
          description: "Excellent choice for your soil conditions and climate",
          requirements: ["Well-drained soil", "6-8 hours sunlight", "Regular watering"],
          expectedYield: "4-6 kg per plant",
          duration: "70-80 days"
        },
        {
          name: "Corn",
          suitability: 88,
          season: selectedSeason,
          description: "Good match with high nitrogen requirements",
          requirements: ["Rich nitrogen soil", "Full sun", "Deep watering"],
          expectedYield: "2-3 ears per plant", 
          duration: "90-100 days"
        },
        {
          name: "Beans",
          suitability: 82,
          season: selectedSeason,
          description: "Naturally fixes nitrogen, good for soil health",
          requirements: ["Moderate water", "Support structures", "Well-drained soil"],
          expectedYield: "200-300g per plant",
          duration: "50-60 days"
        }
      ];
      
      setRecommendations(mockRecommendations);
      setLoading(false);
      
      toast({
        title: "Recommendations generated",
        description: `Found ${mockRecommendations.length} suitable crops for your conditions`
      });
    }, 2000);
  };

  const handleScheduleSearch = () => {
    if (!searchQuery) {
      toast({
        title: "Missing information",
        description: "Please enter a crop name",
        variant: "destructive"
      });
      return;
    }

    setScheduleLoading(true);
    setTimeout(() => {
      const schedule = getCropPlan(searchQuery.toLowerCase());
      setCropSchedule(schedule);
      setScheduleLoading(false);
      toast({
        title: "Schedule retrieved",
        description: `Displaying schedule for ${searchQuery}`
      });
    }, 1500);
  };

  

  useEffect(() => {
    if (useCurrentLocation) {
      getCurrentLocation();
    }
  }, [useCurrentLocation]);

  const seasons = [
    { value: 'spring', label: 'Spring (Mar-May)' },
    { value: 'summer', label: 'Summer (Jun-Aug)' },
    { value: 'autumn', label: 'Autumn (Sep-Nov)' },
    { value: 'winter', label: 'Winter (Dec-Feb)' }
  ];

  const getSuitabilityColor = (suitability: number) => {
    if (suitability >= 90) return 'bg-green-500';
    if (suitability >= 75) return 'bg-blue-500';
    if (suitability >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusColor = (status: ScheduleItem['status']) => {
    switch (status) {
      case 'planned': return 'bg-blue-500';
      case 'planted': return 'bg-green-500';
      case 'growing': return 'bg-yellow-500';
      case 'harvested': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  // Get comprehensive crop plan data
  const getCropPlan = (cropName: string) => {
    const plans: Record<string, any> = {
      wheat: {
        timeline: [
          { phase: 'Land Preparation', duration: '15-20 days', activity: 'Plowing, harrowing, leveling' },
          { phase: 'Sowing', duration: '7-10 days', activity: 'Seed sowing with proper spacing' },
          { phase: 'Germination', duration: '7-14 days', activity: 'Watering and monitoring' },
          { phase: 'Tillering', duration: '30-45 days', activity: 'First fertilizer application' },
          { phase: 'Flowering', duration: '20-25 days', activity: 'Disease monitoring' },
          { phase: 'Maturity', duration: '30-35 days', activity: 'Final irrigation stop' },
          { phase: 'Harvesting', duration: '7-10 days', activity: 'Combine harvesting' }
        ],
        treatments: [
          { type: 'Basal Fertilizer', timing: 'At sowing', application: 'NPK 120:60:40 kg/hectare' },
          { type: 'Top Dressing', timing: '21 days after sowing', application: 'Urea 65 kg/hectare' },
          { type: 'Second Top Dressing', timing: '45 days after sowing', application: 'Urea 65 kg/hectare' },
          { type: 'Fungicide', timing: 'Flowering stage', application: 'Tebuconazole 250 ml/hectare' },
          { type: 'Weedicide', timing: '20-25 days after sowing', application: '2,4-D Sodium salt 500g/hectare' }
        ],
        yield: '40-45 Q/Ha',
        revenue: '₹80,000-₹90,000/Ha',
        tips: [
          'Maintain soil moisture during critical growth stages',
          'Monitor for aphids and rust diseases regularly',
          'Harvest when moisture content is 12-14%',
          'Store in well-ventilated areas to prevent fungal growth'
        ]
      },
      rice: {
        timeline: [
          { phase: 'Nursery Preparation', duration: '25-30 days', activity: 'Seed bed preparation and sowing' },
          { phase: 'Land Preparation', duration: '15 days', activity: 'Puddling and leveling' },
          { phase: 'Transplanting', duration: '5-7 days', activity: '2-3 seedlings per hill' },
          { phase: 'Vegetative Growth', duration: '60 days', activity: 'Regular irrigation and fertilization' },
          { phase: 'Reproductive Phase', duration: '35 days', activity: 'Panicle initiation to flowering' },
          { phase: 'Maturity', duration: '20-25 days', activity: 'Grain filling and hardening' },
          { phase: 'Harvesting', duration: '7 days', activity: 'Manual or mechanical harvesting' }
        ],
        treatments: [
          { type: 'Basal Fertilizer', timing: 'Before transplanting', application: 'NPK 120:60:40 kg/hectare' },
          { type: 'First Top Dressing', timing: '21 days after transplanting', application: 'Urea 65 kg/hectare' },
          { type: 'Second Top Dressing', timing: 'Panicle initiation', application: 'Urea 65 kg/hectare' },
          { type: 'Insecticide', timing: 'Vegetative stage', application: 'Chlorpyrifos 2.5 ml/liter' },
          { type: 'Fungicide', timing: 'Flowering', application: 'Tricyclazole 0.6g/liter' }
        ],
        yield: '60-70 Q/Ha',
        revenue: '₹1,20,000-₹1,40,000/Ha',
        tips: [
          'Maintain 2-5 cm water level throughout growth',
          'Control weeds within first 45 days',
          'Apply zinc sulfate if deficiency symptoms appear',
          'Harvest at 80% grain maturity for better quality'
        ]
      },
      tomato: {
        timeline: [
          { phase: 'Nursery', duration: '25-30 days', activity: 'Seed sowing in protected conditions' },
          { phase: 'Land Preparation', duration: '10 days', activity: 'Deep plowing and bed formation' },
          { phase: 'Transplanting', duration: '3-5 days', activity: 'Evening transplanting preferred' },
          { phase: 'Vegetative Growth', duration: '30-40 days', activity: 'Staking and pruning' },
          { phase: 'Flowering', duration: '20-25 days', activity: 'Pollination support' },
          { phase: 'Fruit Development', duration: '40-50 days', activity: 'Regular harvesting' },
          { phase: 'Final Harvest', duration: '15 days', activity: 'Complete fruit picking' }
        ],
        treatments: [
          { type: 'Organic Manure', timing: 'Land preparation', application: '25-30 tonnes FYM/hectare' },
          { type: 'Basal Fertilizer', timing: 'At transplanting', application: 'NPK 120:80:80 kg/hectare' },
          { type: 'Weekly Fertigation', timing: 'After flowering', application: '19:19:19 @ 5g/liter' },
          { type: 'Fungicide Spray', timing: 'Preventive weekly', application: 'Mancozeb 2g/liter' },
          { type: 'Fruit Borer Control', timing: 'Fruiting stage', application: 'Spinosad 0.5ml/liter' }
        ],
        yield: '500-600 Q/Ha',
        revenue: '₹3,00,000-₹4,50,000/Ha',
        tips: [
          'Provide support stakes within 15 days of transplanting',
          'Remove suckers regularly to improve fruit quality',
          'Harvest fruits at breaker stage for better shelf life',
          'Maintain proper spacing for air circulation'
        ]
      }
    };
    return plans[cropName] || plans.wheat;
  };

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6 p-2 md:p-4 lg:p-8 bg-gradient-to-br from-green-50 to-blue-50 min-h-screen">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 md:mb-8"
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-green-700 mb-2 md:mb-4 flex items-center justify-center gap-2 md:gap-3">
            <Leaf className="h-10 w-10" />
            {translateSync('Crop Recommendation & Scheduling')}
          </h1>
          <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            {translateSync('Get personalized crop recommendations based on your soil conditions and plan your farming schedule')}
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Tabs value={activeMode} onValueChange={(mode) => setActiveMode(mode as RecommendationMode)} className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 mb-6">
              <TabsTrigger value="recommendation" className="text-sm md:text-lg font-medium">
                <Search className="h-5 w-5 mr-2" />
                Crop Recommendation
              </TabsTrigger>
              <TabsTrigger value="scheduling" className="text-sm md:text-lg font-medium">
                <Calendar className="h-5 w-5 mr-2" />
                Crop Scheduling
              </TabsTrigger>
            </TabsList>

            {/* Crop Recommendation Tab */}
            <TabsContent value="recommendation" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Beaker className="h-6 w-6" />
                      Soil & Environmental Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Soil Parameters */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nitrogen">Nitrogen (N) %</Label>
                        <Input
                          id="nitrogen"
                          type="number"
                          step="0.1"
                          value={soilData.nitrogen}
                          onChange={(e) => setSoilData({...soilData, nitrogen: e.target.value})}
                          placeholder="e.g., 1.2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phosphorus">Phosphorus (P) %</Label>
                        <Input
                          id="phosphorus"
                          type="number"
                          step="0.1"
                          value={soilData.phosphorus}
                          onChange={(e) => setSoilData({...soilData, phosphorus: e.target.value})}
                          placeholder="e.g., 0.8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="potassium">Potassium (K) %</Label>
                        <Input
                          id="potassium"
                          type="number"
                          step="0.1"
                          value={soilData.potassium}
                          onChange={(e) => setSoilData({...soilData, potassium: e.target.value})}
                          placeholder="e.g., 2.1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ph">pH Level</Label>
                        <Input
                          id="ph"
                          type="number"
                          step="0.1"
                          min="0"
                          max="14"
                          value={soilData.pH}
                          onChange={(e) => setSoilData({...soilData, pH: e.target.value})}
                          placeholder="e.g., 6.5"
                        />
                      </div>
                    </div>

                    {/* Season Selection */}
                    <div>
                      <Label>Growing Season</Label>
                      <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select growing season" />
                        </SelectTrigger>
                        <SelectContent>
                          {seasons.map((season) => (
                            <SelectItem key={season.value} value={season.value}>
                              {season.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Location Section */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location
                      </Label>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="useCurrentLocation"
                          checked={useCurrentLocation}
                          onChange={(e) => setUseCurrentLocation(e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor="useCurrentLocation">Use current location</Label>
                      </div>

                      {useCurrentLocation ? (
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={getCurrentLocation}
                            disabled={locationLoading}
                            variant="outline"
                            size="sm"
                          >
                            {locationLoading ? (
                              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <MapPin className="h-4 w-4 mr-2" />
                            )}
                            Get Location
                          </Button>
                          {locationData && (
                            <span className="text-sm text-gray-600">
                              {locationData.city}, {locationData.country}
                            </span>
                          )}
                        </div>
                      ) : (
                        <Input
                          placeholder="Enter city name"
                          value={customLocation}
                          onChange={(e) => setCustomLocation(e.target.value)}
                        />
                      )}
                    </div>

                    {/* Weather Info */}
                    {weatherData && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <Label className="flex items-center gap-2 mb-2">
                          <CloudRain className="h-4 w-4" />
                          Current Weather
                        </Label>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Thermometer className="h-3 w-3" />
                            {weatherData.current.temp}°C
                          </div>
                          <div className="flex items-center gap-1">
                            <Droplets className="h-3 w-3" />
                            {weatherData.current.humidity}%
                          </div>
                          <div className="flex items-center gap-1">
                            <Wind className="h-3 w-3" />
                            {weatherData.current.windSpeed} km/h
                          </div>
                          <div className="flex items-center gap-1">
                            <Sun className="h-3 w-3" />
                            {weatherData.current.condition}
                          </div>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={generateRecommendations}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      Generate Recommendations
                    </Button>
                  </CardContent>
                </Card>

                {/* Recommendations Results */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-6 w-6" />
                      Crop Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
                        <span className="ml-2">Analyzing your data...</span>
                      </div>
                    ) : recommendations.length > 0 ? (
                      <div className="space-y-4">
                        {recommendations.map((crop, index) => (
                          <motion.div
                            key={crop.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-lg">{crop.name}</h3>
                              <Badge className={`${getSuitabilityColor(crop.suitability)} text-white`}>
                                {crop.suitability}% Match
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-3">{crop.description}</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Expected Yield:</span>
                                <p className="text-gray-600">{crop.expectedYield}</p>
                              </div>
                              <div>
                                <span className="font-medium">Duration:</span>
                                <p className="text-gray-600">{crop.duration}</p>
                              </div>
                            </div>
                            <div className="mt-3">
                              <span className="font-medium">Requirements:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {crop.requirements.map((req, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {req}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Leaf className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Enter your soil data and generate recommendations to see results</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="scheduling">
              <Card>
                <CardHeader>
                  <CardTitle>Search Crop Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex w-full max-w-sm items-center space-x-2">
                    <Input
                      type="text"
                      placeholder="e.g., Wheat, Rice, Tomato"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button type="submit" onClick={handleScheduleSearch} disabled={scheduleLoading}>
                      {scheduleLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      Search
                    </Button>
                  </div>

                  {scheduleLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
                      <span className="ml-2">Fetching schedule...</span>
                    </div>
                  ) : cropSchedule ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 pt-4"
                    >
                      <h3 className="text-xl font-semibold">Schedule for {searchQuery}</h3>
                      <div className="space-y-2">
                        <h4 className="font-semibold">Timeline</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {cropSchedule.timeline.map((item: any, index: number) => (
                            <li key={index}><strong>{item.phase}</strong> ({item.duration}): {item.activity}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold">Treatments</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {cropSchedule.treatments.map((item: any, index: number) => (
                            <li key={index}><strong>{item.type}</strong> ({item.timing}): {item.application}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold">Yield & Revenue</h4>
                        <p><strong>Yield:</strong> {cropSchedule.yield}</p>
                        <p><strong>Revenue:</strong> {cropSchedule.revenue}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold">Tips</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {cropSchedule.tips.map((tip: string, index: number) => (
                            <li key={index}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Search for a crop to see its detailed schedule.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </Layout>
  );
};

export default CropRecommendation;