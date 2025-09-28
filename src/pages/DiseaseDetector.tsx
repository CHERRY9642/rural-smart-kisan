
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { 
  Image as ImageIcon, 
  Upload, 
  Camera as CameraIcon, 
  X, 
  ChevronLeft,
  Microscope,
  Scan,
  Brain,
  Globe
} from 'lucide-react';
import { useLanguage, languages } from '@/contexts/LanguageContext';
import AnalysisReport from '@/components/AnalysisReport';
import LoadingReport from '@/components/LoadingReport';

// Import crop images
import riceImage from '@/assets/crops/rice.jpg';
import cottonImage from '@/assets/crops/cotton.jpg';
import hotpepperImage from '@/assets/crops/hotpepper.jpg';
import cornImage from '@/assets/crops/corn.jpg';
import tomatoImage from '@/assets/crops/tomato.jpg';
import onionImage from '@/assets/crops/onion.jpg';
import potatoImage from '@/assets/crops/potato.jpg';
import grapesImage from '@/assets/crops/grapes.jpg';

// Import disease reference images
import riceBlightImage from '@/assets/diseases/rice-blight.jpg';
import tomatoBlightImage from '@/assets/diseases/tomato-blight.jpg';
import cornSpotImage from '@/assets/diseases/corn-spot.jpg';
import cottonBollwormImage from '@/assets/diseases/cotton-bollworm.jpg';

type DetectorMode = 'normal' | 'advanced' | 'hyperspectral';

interface Crop {
  id: string;
  name: string;
  image: string;
  diseases: { name: string; image: string; description: string }[];
}

interface Metadata {
  crop_type: string;
  language: string;
  ai_source: string;
  confidence: string;
  timestamp: string;
}

const crops: Crop[] = [
  {
    id: 'wheat',
    name: 'Wheat',
    image: '/src/assets/commodities/wheat.jpg',
    diseases: [
      { name: 'Leaf Rust', image: riceBlightImage, description: 'Orange-red pustules on leaf surfaces' },
      { name: 'Powdery Mildew', image: tomatoBlightImage, description: 'White powdery coating on leaves' }
    ]
  },
  {
    id: 'rice',
    name: 'Rice',
    image: riceImage,
    diseases: [
      { name: 'Bacterial Leaf Blight', image: riceBlightImage, description: 'Yellow to brown streaks on leaves' },
      { name: 'Brown Spot', image: cornSpotImage, description: 'Dark brown spots with lighter centers' }
    ]
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane',
    image: cornImage,
    diseases: [
      { name: 'Red Rot', image: tomatoBlightImage, description: 'Reddish discoloration in stem' },
      { name: 'Smut Disease', image: cornSpotImage, description: 'Black spore masses on shoots' }
    ]
  },
  {
    id: 'cotton',
    name: 'Cotton',
    image: cottonImage,
    diseases: [
      { name: 'Bollworm Infestation', image: cottonBollwormImage, description: 'Holes and damage in cotton bolls' },
      { name: 'Leaf Curl Virus', image: riceBlightImage, description: 'Curling and yellowing of leaves' }
    ]
  },
  {
    id: 'pulses',
    name: 'Pulses',
    image: '/src/assets/commodities/beans.jpg',
    diseases: [
      { name: 'Pod Borer', image: cottonBollwormImage, description: 'Damage to developing pods' },
      { name: 'Wilt Disease', image: tomatoBlightImage, description: 'Wilting and yellowing of plants' }
    ]
  }
];

const DiseaseDetector: React.FC = () => {
  const { translateSync, currentLanguage } = useLanguage();
  const [mode, setMode] = useState<DetectorMode>('normal');
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [analysisMetadata, setAnalysisMetadata] = useState<Metadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(currentLanguage.code);
  const [apiStatus, setApiStatus] = useState<string>('Checking API status...');
  const videoRef = useRef<HTMLVideoElement>(null);

  const API_BASE_URL = 'https://krishi-rakshak-2.onrender.com';

  useEffect(() => {
    const checkAPIStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.status === 'healthy') {
          setApiStatus(`✅ API is healthy | Gemini Available: ${data.gemini_available}`);
        } else {
          setApiStatus('⚠ API is running but health check failed');
        }
      } catch (error) {
        console.error('API Status Error:', error);
        setApiStatus('❌ Cannot connect to API');
      }
    };
    checkAPIStatus();
    const interval = setInterval(checkAPIStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const modeConfig = {
    normal: { icon: Brain, label: 'Normal', color: 'bg-primary' },
    advanced: { icon: Microscope, label: 'Advanced', color: 'bg-secondary' },
    hyperspectral: { icon: Scan, label: 'Hyperspectral', color: 'bg-accent' }
  };

  const handleCameraOpen = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOpen(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Could not access camera. Please ensure you have a camera and have granted permissions.");
    }
  };

  const handleCapturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "captured_image.png", { type: "image/png" });
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            handleCameraClose();
          }
        }, 'image/png');
      }
    }
  };

  const handleCameraClose = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.gif'] },
    multiple: false,
  });

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  const handleAnalyze = async () => {
    if (!selectedImage || !selectedCrop) return;
    
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    setAnalysisMetadata(null);

    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('crop_type', selectedCrop.name);
    formData.append('language', languages.find(l => l.code === selectedLanguage)?.name || 'English');
    formData.append('use_ai', 'true');

    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Analysis failed with status ' + response.status }));
        throw new Error(errorData.detail || 'Something went wrong');
      }

      const result = await response.json();

      if (result.success) {
        setAnalysisResult(result.analysis);
        setAnalysisMetadata(result.metadata);
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetState = () => {
    setSelectedCrop(null);
    setSelectedImage(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setAnalysisMetadata(null);
    setError(null);
    setIsAnalyzing(false);
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3 mb-6"
        >
          <motion.h1 
            className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
            animate={{ 
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Crop Disease Detection
          </motion.h1>
          <motion.p 
            className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Identify and diagnose crop diseases using advanced AI technology. Upload images of your crops to get instant analysis and treatment recommendations.
          </motion.p>
          <Badge variant="outline">{apiStatus}</Badge>
        </motion.div>

        <Card>
          <CardContent className="p-2 sm:p-3">
            <div className="flex justify-center space-x-0.5 sm:space-x-1">
              {Object.entries(modeConfig).map(([key, config]) => (
                <motion.button
                  key={key}
                  className={`relative px-2 sm:px-3 py-1.5 sm:py-2 rounded-md font-medium transition-all text-xs sm:text-sm ${
                    mode === key ? 'text-white' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => {
                    setMode(key as DetectorMode);
                    resetState();
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {mode === key && (
                    <motion.div
                      className={`absolute inset-0 rounded-md ${config.color}`}
                      layoutId="activeMode"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                  <div className="relative flex items-center space-x-1 sm:space-x-2">
                    <config.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{config.label}</span>
                    <span className="sm:hidden">{config.label.slice(0, 4)}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>

        <AnimatePresence mode="wait">
          {mode === 'normal' && !selectedCrop && (
            <motion.div
              key="crop-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Select the crop you are having issues with</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                    {crops.map((crop) => (
                      <motion.button
                        key={crop.id}
                        className="p-2 sm:p-3 border rounded-lg hover:border-primary transition-colors"
                        onClick={() => setSelectedCrop(crop)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="aspect-square rounded-lg overflow-hidden mb-2 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto">
                          <img
                            src={crop.image}
                            alt={crop.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="font-medium text-center text-xs sm:text-sm">{crop.name}</h3>
                      </motion.button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {mode === 'normal' && selectedCrop && (
            <motion.div
              key="normal-analysis"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6"
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center space-x-2">
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={resetState}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <CardTitle className="text-primary">Upload Image</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Language" />
                            </SelectTrigger>
                            <SelectContent>
                                {languages.map(lang => (
                                    <SelectItem key={lang.code} value={lang.code}>
                                        <div className="flex items-center gap-2">
                                            <span>{lang.flag}</span>
                                            <span>{lang.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm">Drop images here or click to browse</p>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={handleCameraOpen}
                      className="flex-1"
                    >
                      <CameraIcon className="w-4 h-4 mr-2" />
                      Open Camera
                    </Button>
                    {isCameraOpen && (
                      <Button
                        onClick={handleCapturePhoto}
                        className="flex-1"
                      >
                        📸 Capture
                      </Button>
                    )}
                  </div>

                  {isCameraOpen && (
                    <div className="relative flex justify-center">
                      <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg max-h-64 max-w-sm" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleCameraClose}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {previewUrl && (
                    <div className="relative flex justify-center">
                      <img src={previewUrl} alt="Preview" className="w-full rounded-lg max-h-64 max-w-sm object-cover" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  <Button
                    onClick={handleAnalyze}
                    className="w-full"
                    disabled={!selectedImage || isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
                        <span>🧠 Predicting...</span>
                      </div>
                    ) : (
                      <span>🧠 Predict</span>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">AI/ML Prediction Output</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isAnalyzing && <LoadingReport />}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive"
                    >
                      <h3 className="font-medium mb-2">Error</h3>
                      <p className="text-sm">{error}</p>
                    </motion.div>
                  )}
                  
                  {analysisResult && analysisMetadata && !isAnalyzing && (
                    <AnalysisReport analysis={analysisResult} metadata={analysisMetadata} />
                  )}

                  {!analysisResult && !error && !isAnalyzing && (
                    <div>
                      <h3 className="font-medium mb-3">Common {selectedCrop.name} Issues:</h3>
                      <div className="space-y-3">
                        {selectedCrop.diseases.length > 0 ? (
                          selectedCrop.diseases.map((disease, index) => (
                            <div key={index} className="flex space-x-3 p-3 border rounded-lg">
                              <img
                                src={disease.image}
                                alt={disease.name}
                                className="w-12 h-12 rounded object-cover"
                              />
                              <div>
                                <h4 className="font-medium text-sm">{disease.name}</h4>
                                <p className="text-xs text-muted-foreground">{disease.description}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No common diseases data available for {selectedCrop.name}</p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Advanced Mode */}
          {mode === 'advanced' && (
            <motion.div
              key="advanced-mode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6"
            >
              <Card className="border-secondary/20 bg-secondary/5">
                <CardHeader>
                  <CardTitle className="text-secondary">Advanced Crop Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Upload your crop images directly for advanced AI analysis
                  </div>
                  
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragActive ? 'border-secondary bg-secondary/5' : 'border-secondary/30 hover:border-secondary/50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="mx-auto h-10 w-10 text-secondary mb-3" />
                    <p className="text-lg font-medium text-secondary">Drop crop images here or click to browse</p>
                    <p className="text-sm text-muted-foreground mt-2">Advanced analysis with detailed reports</p>
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    Capture from camera:
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={handleCameraOpen}
                      className="flex-1 border-secondary/30 text-secondary hover:bg-secondary/10"
                    >
                      <CameraIcon className="w-4 h-4 mr-2" />
                      Open Camera
                    </Button>
                    {isCameraOpen && (
                      <Button
                        onClick={handleCapturePhoto}
                        className="flex-1 bg-secondary hover:bg-secondary/90"
                      >
                        📸 Capture
                      </Button>
                    )}
                  </div>


                  {isCameraOpen && (
                    <div className="relative">
                      <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg max-h-64" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 bg-background/80"
                        onClick={handleCameraClose}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {previewUrl && (
                    <div className="relative">
                      <img src={previewUrl} alt="Preview" className="w-full rounded-lg max-h-64 object-cover" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 bg-background/80"
                        onClick={handleRemoveImage}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  <Button
                    onClick={handleAnalyze}
                    className="w-full bg-secondary hover:bg-secondary/90"
                    disabled={!selectedImage || isAnalyzing}
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Run Advanced Analysis'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-secondary/20 bg-secondary/5">
                <CardHeader>
                  <CardTitle className="text-secondary">Advanced Results</CardTitle>
                </CardHeader>
                <CardContent>
                  {isAnalyzing && (
                    <div className="space-y-4 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  )}
                  {analysisResult && !isAnalyzing && (
                    <div className="space-y-4">
                      <Badge className="bg-secondary hover:bg-secondary/90">Advanced Analysis Complete</Badge>
                      <p className="text-sm">{analysisResult}</p>
                    </div>
                  )}
                  {!analysisResult && !isAnalyzing && (
                    <p className="text-sm text-muted-foreground">Upload an image to see advanced analysis results</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Hyperspectral Mode */}
          {mode === 'hyperspectral' && (
            <motion.div
              key="hyperspectral-mode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-accent-foreground">Hyperspectral Imaging</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Upload hyperspectral images for specialized analysis
                  </div>
                  
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragActive ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Scan className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">Drop hyperspectral images here</p>
                    <p className="text-sm text-muted-foreground mt-2">No crop selection required</p>
                  </div>

                  {previewUrl && (
                    <div className="relative">
                      <img src={previewUrl} alt="Preview" className="w-full rounded-lg" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  <Button
                    onClick={handleAnalyze}
                    className="w-full bg-accent hover:bg-accent/90"
                    disabled={!selectedImage || isAnalyzing}
                  >
                    {isAnalyzing ? 'Processing Hyperspectral Data...' : 'Analyze Hyperspectral Image'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-accent-foreground">Hyperspectral Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  {isAnalyzing && (
                    <div className="space-y-4 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  )}
                  {analysisResult && !isAnalyzing && (
                    <div className="space-y-4">
                      <Badge className="bg-accent hover:bg-accent/90">Hyperspectral Complete</Badge>
                      <p className="text-sm">{analysisResult}</p>
                    </div>
                  )}
                  {!analysisResult && !isAnalyzing && (
                    <p className="text-sm text-muted-foreground">Upload a hyperspectral image to see detailed spectral analysis</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default DiseaseDetector;
