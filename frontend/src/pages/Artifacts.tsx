import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/use-toast';
import { 
  Package,
  Plus,
  Search,
  Star,
  User,
  MapPin,
  Clock,
  Eye,
  Heart,
  ShoppingCart,
  Camera
} from 'lucide-react';
import { ImageUpload } from '@/components/ImageUpload';

interface Artifact {
  id: string;
  name: string;
  price: number;
  category: string;
  seller: string;
  location: string;
  rating: number;
  images: string[];
  description: string;
  condition: string;
  postedAt: Date;
  likes: number;
}

const Artifacts = () => {
  const { translateSync } = useLanguage();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddArtifact, setShowAddArtifact] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [artifactImages, setArtifactImages] = useState<File[]>([]);
  
  const [newArtifact, setNewArtifact] = useState({
    name: '',
    price: '',
    category: 'tools',
    description: '',
    condition: 'excellent'
  });

  // Mock artifacts data
  const [artifacts, setArtifacts] = useState<Artifact[]>([
    {
      id: '1',
      name: 'Vintage Brass Plow',
      price: 15000,
      category: 'tools',
      seller: 'Heritage Farm Tools',
      location: 'Mysore, Karnataka',
      rating: 4.8,
      images: ['🪓'],
      description: 'Authentic vintage brass plow from the 1950s. Well-maintained and functional.',
      condition: 'excellent',
      postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: 23
    },
    {
      id: '2',
      name: 'Traditional Clay Pottery Set',
      price: 2500,
      category: 'pottery',
      seller: 'Kumar Pottery Works',
      location: 'Bangalore, Karnataka',
      rating: 4.6,
      images: ['🏺'],
      description: 'Handmade clay pots and vessels, perfect for traditional cooking and storage.',
      condition: 'good',
      postedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      likes: 18
    },
    {
      id: '3',
      name: 'Antique Seed Storage Jar',
      price: 8500,
      category: 'storage',
      seller: 'Antique Collections',
      location: 'Hassan, Karnataka',
      rating: 4.9,
      images: ['🫙'],
      description: 'Large ceramic jar traditionally used for grain storage. 100+ years old.',
      condition: 'good',
      postedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      likes: 31
    },
    {
      id: '4',
      name: 'Wooden Bullock Cart Model',
      price: 4200,
      category: 'decorative',
      seller: 'Village Crafts',
      location: 'Belgaum, Karnataka',
      rating: 4.5,
      images: ['🛻'],
      description: 'Miniature wooden bullock cart, handcrafted by local artisans.',
      condition: 'excellent',
      postedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      likes: 12
    }
  ]);

  const categories = [
    { id: 'all', name: 'All Categories', icon: '📦' },
    { id: 'tools', name: 'Farm Tools', icon: '🔨' },
    { id: 'pottery', name: 'Pottery', icon: '🏺' },
    { id: 'storage', name: 'Storage', icon: '🫙' },
    { id: 'decorative', name: 'Decorative', icon: '🎨' }
  ];

  const conditions = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
  ];

  const filteredArtifacts = artifacts.filter(artifact => {
    const matchesSearch = artifact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         artifact.seller.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || artifact.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddArtifact = () => {
    if (!newArtifact.name || !newArtifact.price) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const artifact: Artifact = {
      id: Date.now().toString(),
      name: newArtifact.name,
      price: parseFloat(newArtifact.price),
      category: newArtifact.category,
      seller: 'Your Shop', // Mock seller
      location: 'Your Location', // Mock location
      rating: 4.0,
      images: ['📦'], // Mock image
      description: newArtifact.description,
      condition: newArtifact.condition,
      postedAt: new Date(),
      likes: 0
    };

    setArtifacts(prev => [artifact, ...prev]);
    setShowAddArtifact(false);
    setNewArtifact({
      name: '',
      price: '',
      category: 'tools',
      description: '',
      condition: 'excellent'
    });
    setArtifactImages([]);

    toast({
      title: "Artifact listed",
      description: "Your artifact has been listed successfully!",
    });
  };

  const toggleFavorite = (artifactId: string) => {
    setFavorites(prev => {
      const isFavorited = prev.includes(artifactId);
      if (isFavorited) {
        toast({
          title: "Removed from favorites",
          description: "Artifact removed from your favorites.",
        });
        return prev.filter(id => id !== artifactId);
      } else {
        toast({
          title: "Added to favorites",
          description: "Artifact added to your favorites.",
        });
        return [...prev, artifactId];
      }
    });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just posted';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return 'bg-success text-success-foreground';
      case 'good':
        return 'bg-blue-500 text-blue-50';
      case 'fair':
        return 'bg-yellow-500 text-yellow-50';
      case 'poor':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-hero text-primary font-indian mb-2">
            🏺 {translateSync('Artifacts Marketplace')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {translateSync('Buy and sell traditional farming artifacts and tools')}
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center"
        >
          <div className="bg-muted p-1 rounded-lg">
            <Button
              variant={activeTab === 'buy' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('buy')}
              className="relative"
            >
              <motion.div
                animate={{
                  scale: activeTab === 'buy' ? [1, 1.05, 1] : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Buy Artifacts
              </motion.div>
            </Button>
            <Button
              variant={activeTab === 'sell' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('sell')}
              className="relative"
            >
              <motion.div
                animate={{
                  scale: activeTab === 'sell' ? [1, 1.05, 1] : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <Package className="h-4 w-4 mr-2" />
                Sell Artifacts
              </motion.div>
            </Button>
          </div>
        </motion.div>

        {/* Content based on active tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'buy' ? (
            <motion.div
              key="buy"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder={translateSync("Search artifacts...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center space-x-2"
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </Button>
                ))}
              </div>

              {/* Artifacts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredArtifacts.map((artifact, index) => (
                    <motion.div
                      key={artifact.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card className="hover:shadow-glow transition-all">
                        <CardHeader className="text-center pb-2">
                          <div className="text-6xl mb-2">{artifact.images[0]}</div>
                          <CardTitle className="text-lg">{artifact.name}</CardTitle>
                          <div className="flex justify-center space-x-2">
                            <Badge className={getConditionColor(artifact.condition)}>
                              {artifact.condition}
                            </Badge>
                            <Badge variant="outline">{artifact.category}</Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">
                              ₹{artifact.price.toLocaleString()}
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground text-center">
                            {artifact.description}
                          </p>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>{artifact.seller}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 text-yellow-500" />
                                <span>{artifact.rating}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-1 text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>{artifact.location}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{formatTimeAgo(artifact.postedAt)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex space-x-2 pt-2">
                            <Button className="flex-1" size="sm">
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Buy Now
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <motion.div whileTap={{ scale: 0.9 }}>
                              <Button 
                                variant={favorites.includes(artifact.id) ? "default" : "outline"} 
                                size="sm"
                                onClick={() => toggleFavorite(artifact.id)}
                              >
                                <motion.div
                                  animate={{ 
                                    scale: favorites.includes(artifact.id) ? [1, 1.3, 1] : 1,
                                    rotate: favorites.includes(artifact.id) ? [0, 15, -15, 0] : 0 
                                  }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <Heart 
                                    className={`h-4 w-4 ${
                                      favorites.includes(artifact.id) 
                                        ? 'text-red-500 fill-red-500' 
                                        : ''
                                    }`} 
                                  />
                                </motion.div>
                              </Button>
                            </motion.div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="sell"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <Button onClick={() => setShowAddArtifact(true)} size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  List New Artifact
                </Button>
              </div>

              {/* Seller's Listed Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Listed Artifacts</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-8">
                    You haven't listed any artifacts yet. Start by adding your first artifact!
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Artifact Modal */}
        <AnimatePresence>
          {showAddArtifact && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowAddArtifact(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>List New Artifact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Artifact Images */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Artifact Images</Label>
                      <ImageUpload 
                        onImagesChange={setArtifactImages}
                        maxImages={5}
                      />
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Artifact Name *</Label>
                        <Input
                          value={newArtifact.name}
                          onChange={(e) => setNewArtifact({...newArtifact, name: e.target.value})}
                          placeholder="e.g., Vintage Brass Plow"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Category *</Label>
                        <Select 
                          value={newArtifact.category} 
                          onValueChange={(value) => setNewArtifact({...newArtifact, category: value})}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tools">Farm Tools</SelectItem>
                            <SelectItem value="pottery">Pottery</SelectItem>
                            <SelectItem value="storage">Storage</SelectItem>
                            <SelectItem value="decorative">Decorative</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Price and Condition */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Price (₹) *</Label>
                        <Input
                          type="number"
                          value={newArtifact.price}
                          onChange={(e) => setNewArtifact({...newArtifact, price: e.target.value})}
                          placeholder="15000"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Condition *</Label>
                        <Select 
                          value={newArtifact.condition} 
                          onValueChange={(value) => setNewArtifact({...newArtifact, condition: value})}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                          <SelectContent>
                            {conditions.map(condition => (
                              <SelectItem key={condition.value} value={condition.value}>
                                {condition.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <Textarea
                        value={newArtifact.description}
                        onChange={(e) => setNewArtifact({...newArtifact, description: e.target.value})}
                        placeholder="Describe your artifact, its history, condition, and unique features..."
                        rows={4}
                        className="mt-1"
                      />
                    </div>

                    <div className="flex space-x-2 pt-4">
                      <Button onClick={handleAddArtifact} className="flex-1">
                        <Package className="h-4 w-4 mr-2" />
                        List Artifact
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddArtifact(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {activeTab === 'buy' && filteredArtifacts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No artifacts found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or browse different categories
            </p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Artifacts;