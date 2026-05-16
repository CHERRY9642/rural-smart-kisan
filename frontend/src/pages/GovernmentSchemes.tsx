import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/components/ui/use-toast';
import { governmentSchemesService, Scheme, HelpCenter, AnalysisResult } from '@/services/governmentSchemesService';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Building2, 
  Search,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  FileText,
  Users,
  Banknote,
  Rocket
} from 'lucide-react';

const GovernmentSchemes = () => {
  const { translateSync } = useLanguage();
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [pincode, setPincode] = useState('');
  const [cropType, setCropType] = useState('Rice');
  const [language, setLanguage] = useState('English');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [parsedSchemes, setParsedSchemes] = useState<any[]>([]);
  const [selectedScheme, setSelectedScheme] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [helpCenters, setHelpCenters] = useState<HelpCenter[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('agritech_current_user') || 'null');
    if (user) {
      setState(user.state || '');
      setDistrict(user.district || '');
    }
    
    const loadInitialData = async () => {
      try {
        const [schemesData, helpCentersData] = await Promise.all([
          governmentSchemesService.fetchSchemes(),
          governmentSchemesService.fetchHelpCenters()
        ]);
        setSchemes(schemesData);
        setHelpCenters(helpCentersData);
      } catch (error) {
        toast({
          title: translateSync("Error"),
          description: translateSync("Failed to load initial data. Please try again."),
          variant: "destructive"
        });
      }
    };

    loadInitialData();
  }, [toast, translateSync]);

  const analyzeSchemes = async () => {
    setLoading(true);
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append('state', state);
    formData.append('district', district);
    formData.append('pincode', pincode);
    formData.append('crop_type', cropType);
    formData.append('language', language);

    try {
      const result = await governmentSchemesService.analyzeSchemes(formData);
      setAnalysisResult(result);

      const lines = result.analysis.split('\n');
      const schemes: any[] = [];
      let currentScheme: any = null;

      for (const line of lines) {
        if (line.trim().length === 0) continue;

        // Check if the line is a scheme title (all caps)
        if (line.toUpperCase() === line && line.trim().length > 0) {
          if (currentScheme) {
            schemes.push(currentScheme);
          }
          currentScheme = { title: line.trim(), content: '' };
        } else if (currentScheme) {
          currentScheme.content += line + '\n';
        }
      }

      if (currentScheme) {
        schemes.push(currentScheme);
      }

      setParsedSchemes(schemes);
      if (schemes.length > 0) {
        setSelectedScheme(schemes[0]);
      }

    } catch (error) {
      toast({
        title: translateSync("Analysis Error"),
        description: translateSync("Failed to analyze schemes. Please try again."),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderAnalysisResult = () => {
    if (!parsedSchemes.length) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>{translateSync("Analysis Results")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={(value) => setSelectedScheme(parsedSchemes.find(s => s.title === value))}>
            <SelectTrigger>
              <SelectValue placeholder={translateSync("Select a scheme")} />
            </SelectTrigger>
            <SelectContent>
              {parsedSchemes.map((scheme, index) => (
                <SelectItem key={index} value={scheme.title}>{scheme.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedScheme && (
            <div className="mt-4">
              <h3 className="font-bold">{selectedScheme.title}</h3>
              <pre className="whitespace-pre-wrap font-sans">{selectedScheme.content}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-hero text-primary font-indian mb-2">
            🏛️ {translateSync('Government Schemes')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {translateSync('Find relevant government schemes based on your profile and needs')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Rocket className="h-5 w-5 text-primary" />
                <span>{translateSync('Analyze Schemes')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">{translateSync('State')}</Label>
                  <Input id="state" value={state} onChange={(e) => setState(e.target.value)} placeholder={translateSync('e.g. Telangana')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">{translateSync('District')}</Label>
                  <Input id="district" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder={translateSync('e.g. Hyderabad')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">{translateSync('Pincode')}</Label>
                  <Input id="pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder={translateSync('e.g. 500001')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cropType">{translateSync('Crop Type')}</Label>
                  <Select value={cropType} onValueChange={setCropType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Rice">{translateSync('Rice')}</SelectItem>
                      <SelectItem value="Wheat">{translateSync('Wheat')}</SelectItem>
                      <SelectItem value="Tomato">{translateSync('Tomato')}</SelectItem>
                      <SelectItem value="Cotton">{translateSync('Cotton')}</SelectItem>
                      <SelectItem value="Sugarcane">{translateSync('Sugarcane')}</SelectItem>
                      <SelectItem value="Potato">{translateSync('Potato')}</SelectItem>
                      <SelectItem value="Pulses">{translateSync('Pulses')}</SelectItem>
                      <SelectItem value="other">{translateSync('Other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">{translateSync('Output Language')}</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Hindi">Hindi</SelectItem>
                      <SelectItem value="Bengali">Bengali</SelectItem>
                      <SelectItem value="Tamil">Tamil</SelectItem>
                      <SelectItem value="Telugu">Telugu</SelectItem>
                      <SelectItem value="Marathi">Marathi</SelectItem>
                      <SelectItem value="Gujarati">Gujarati</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={analyzeSchemes} disabled={loading} className="w-full">
                {loading ? translateSync('Analyzing...') : translateSync('Get Schemes')}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {loading && (
          <div className="text-center">
            <p>{translateSync('Fetching schemes...')}</p>
          </div>
        )}

        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {renderAnalysisResult()}
          </motion.div>
        )}

        {/* Help Centers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>{translateSync('Nearest Help Centers')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {helpCenters.map((center, index) => (
                  <motion.div
                    key={center.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start justify-between p-4 bg-accent/5 rounded-lg hover:bg-accent/10 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{center.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {center.address}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{center.phone}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{center.distance}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button variant="outline" size="sm">
                        {translateSync('Call')}
                      </Button>
                      <Button variant="outline" size="sm">
                        {translateSync('Directions')}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default GovernmentSchemes;