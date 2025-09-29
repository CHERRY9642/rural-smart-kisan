import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Leaf,
  Beaker,
  Search,
  Calendar,
  RefreshCw,
  TrendingUp
} from 'lucide-react';

const RECOMMEND_API = "https://krishirecommend-api.onrender.com/recommend";

const CropRecommendation = () => {
  const { toast } = useToast();
  
  const [activeMode, setActiveMode] = useState('recommendation');
  const [formData, setFormData] = useState({
    N: '',
    P: '',
    K: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: '',
    season: 'Spring'
  });
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [crops, setCrops] = useState<any[]>([]);
  const [filteredCrops, setFilteredCrops] = useState<any[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<any>(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [activeSchedule, setActiveSchedule] = useState<string | null>(null);

  useEffect(() => {
    fetch('/crops.json')
      .then(response => response.json())
      .then(data => {
        setCrops(data.crops);
        setFilteredCrops(data.crops);
      })
      .catch(error => {
        console.error("Failed to fetch crops data:", error);
        toast({
          title: "Error",
          description: "Could not load crop schedule data.",
          variant: "destructive"
        });
      });
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    setFormData({ ...formData, [target.id]: target.value });
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, season: value });
  };

  const recommendCrop = async () => {
    for (const [key, value] of Object.entries(formData)) {
      if (value === '') {
        toast({
          title: "Missing Information",
          description: `Please fill in the ${key} field.`,
          variant: "destructive"
        });
        return;
      }
    }

    setLoading(true);
    setRecommendation(null);

    try {
      const payload = {
        ...formData,
        N: parseFloat(formData.N),
        P: parseFloat(formData.P),
        K: parseFloat(formData.K),
        temperature: parseFloat(formData.temperature),
        humidity: parseFloat(formData.humidity),
        ph: parseFloat(formData.ph),
        rainfall: parseFloat(formData.rainfall),
      };

      const response = await fetch(RECOMMEND_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setRecommendation(data);
        toast({
          title: "Recommendation Successful",
          description: `We recommend planting ${data.recommended_crop}.`
        });
      } else {
        throw new Error(data.error || "Failed to get recommendation.");
      }
    } catch (error: any) {      
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query) {
      const filtered = crops.filter(crop => crop.name.toLowerCase().includes(query.toLowerCase()));
      setFilteredCrops(filtered);
    } else {
      setFilteredCrops(crops);
    }
    setSelectedCrop(null);
  };

  const handleCropSelect = (crop: any) => {
    setSelectedCrop(crop);
    setSearchQuery(crop.name);
    setFilteredCrops([]);
  };

  const formatDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  const renderSchedule = (schedule: any[], title: string) => (
    <div>
      <h2 className="text-xl font-semibold text-blue-900 mb-2">{title}</h2>
      <div className="space-y-4">
        {schedule.map((item, index) => (
          <div 
            key={index} 
            className="bg-blue-100 hover:scale-105 hover:shadow-lg transition transform duration-300 rounded-lg p-4 cursor-pointer flex items-start space-x-4"
            onClick={() => setActiveSchedule(activeSchedule === `${title}-${index}` ? null : `${title}-${index}`)}
          >
            <div className="flex-shrink-0">
              <div className="bg-blue-500 text-white w-12 h-12 flex items-center justify-center rounded-full text-sm font-bold animate-pulse">
                {item.days_after_planting}d
              </div>
              <div className="mt-1 text-xs text-center">📅 {formatDate(item.days_after_planting)}</div>
            </div>
            <div className="flex-1">
              <h3 className="text-blue-900 font-semibold">{item.stage}</h3>
              <p className="text-sm text-gray-700">{item.application}</p>
              {activeSchedule === `${title}-${index}` && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="extra-info mt-2 bg-blue-50 p-3 rounded-lg border text-sm text-gray-600"
                >
                  {item.extra_info || 'No additional info available.'}
                </motion.div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6 p-2 md:p-4 lg:p-8 bg-gradient-to-br from-green-50 to-blue-50 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 md:mb-8"
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-green-700 mb-2 md:mb-4 flex items-center justify-center gap-2 md:gap-3">
            <Leaf className="h-10 w-10" />
            Crop Recommendation & Scheduling
          </h1>
        </motion.div>

        <Tabs value={activeMode} onValueChange={(mode) => setActiveMode(mode as string)} className="w-full">
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

          <TabsContent value="recommendation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Beaker className="h-6 w-6" />
                    Soil & Environmental Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="N">🧪 Nitrogen (N)</Label>
                      <Input id="N" type="number" value={formData.N} onChange={handleInputChange} placeholder="e.g. 90" />
                    </div>
                    <div>
                      <Label htmlFor="P">🧪 Phosphorus (P)</Label>
                      <Input id="P" type="number" value={formData.P} onChange={handleInputChange} placeholder="e.g. 40" />
                    </div>
                    <div>
                      <Label htmlFor="K">🧪 Potassium (K)</Label>
                      <Input id="K" type="number" value={formData.K} onChange={handleInputChange} placeholder="e.g. 43" />
                    </div>
                    <div>
                      <Label htmlFor="temperature">🌡 Temperature (°C)</Label>
                      <Input id="temperature" type="number" value={formData.temperature} onChange={handleInputChange} placeholder="e.g. 25.6" />
                    </div>
                    <div>
                      <Label htmlFor="humidity">💧 Humidity (%)</Label>
                      <Input id="humidity" type="number" value={formData.humidity} onChange={handleInputChange} placeholder="e.g. 80" />
                    </div>
                    <div>
                      <Label htmlFor="ph">🌱 Soil pH</Label>
                      <Input id="ph" type="number" value={formData.ph} onChange={handleInputChange} placeholder="e.g. 6.5" />
                    </div>
                    <div>
                      <Label htmlFor="rainfall">🌧 Rainfall (mm)</Label>
                      <Input id="rainfall" type="number" value={formData.rainfall} onChange={handleInputChange} placeholder="e.g. 200" />
                    </div>
                    <div>
                      <Label htmlFor="season">🍂 Season</Label>
                      <Select onValueChange={handleSelectChange} defaultValue={formData.season}>
                        <SelectTrigger id="season">
                          <SelectValue placeholder="Select Season" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Summer">Summer</SelectItem>
                          <SelectItem value="Winter">Winter</SelectItem>
                          <SelectItem value="Autumn">Autumn</SelectItem>
                          <SelectItem value="Spring">Spring</SelectItem>
                          <SelectItem value="Monsoon">Monsoon</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={recommendCrop} disabled={loading} className="w-full">
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />} 
                    Get Recommendation
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-6 w-6" />
                    Recommendation Result
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
                      <span className="ml-2">Analyzing...</span>
                    </div>
                  ) : recommendation ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <div className="text-center">
                        <p className="text-lg font-semibold">Recommended Crop</p>
                        <p className="text-3xl font-bold text-green-600">{recommendation.recommended_crop}</p>
                        <Badge>{recommendation.confidence} Confidence</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold">Soil Analysis</h4>
                          <p>N: {recommendation.soil_analysis.nitrogen}</p>
                          <p>P: {recommendation.soil_analysis.phosphorus}</p>
                          <p>K: {recommendation.soil_analysis.potassium}</p>
                          <p>pH: {recommendation.soil_analysis.ph_level}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold">Weather Conditions</h4>
                          <p>Temp: {recommendation.weather_conditions.temperature}°C</p>
                          <p>Humidity: {recommendation.weather_conditions.humidity}%</p>
                          <p>Rainfall: {recommendation.weather_conditions.rainfall}mm</p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Leaf className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Enter soil and weather data to get a crop recommendation.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="scheduling">
            <div className="w-full bg-white rounded-xl shadow-xl p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">🌿 Crop Scheduler</h1>
              
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search for a crop..."
                  value={searchQuery}
                  onChange={handleScheduleSearch}
                  className="w-full mb-2"
                />
                {searchQuery && filteredCrops.length > 0 && (
                  <Card className="absolute z-10 w-full mt-1">
                    <CardContent className="p-2">
                      {filteredCrops.map(crop => (
                        <div 
                          key={crop.name} 
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleCropSelect(crop)}
                        >
                          {crop.name}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>

              {scheduleLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
                  <span className="ml-2">Loading...</span>
                </div>
              ) : selectedCrop ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p><strong>Crop:</strong> {selectedCrop.name}</p>
                    <p><strong>Season:</strong> {selectedCrop.season}</p>
                    <p><strong>Sowing Period:</strong> {selectedCrop.sowing_period}</p>
                    <p><strong>Harvest Period:</strong> {selectedCrop.harvest_period}</p>
                  </div>
                  {renderSchedule(selectedCrop.fertilizer_schedule, 'Fertilizer Schedule')}
                  <div className="mt-6">
                    {renderSchedule(selectedCrop.pesticide_schedule, 'Pesticide Schedule')}
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Search for a crop to see its detailed schedule.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CropRecommendation;
