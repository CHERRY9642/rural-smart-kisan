import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PlanProvider } from "@/contexts/PlanContext";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import CropMonitor from "./pages/CropMonitor";
import CropRecommendation from "./pages/CropRecommendation";
import DiseaseDetector from "./pages/DiseaseDetector";
import MarketTrends from "./pages/MarketTrends";
import GovernmentSchemes from "./pages/GovernmentSchemes";
import Settings from "./pages/Settings";
import GroceryMarketplace from "./pages/GroceryMarketplace";
import Orders from "./pages/Orders";
import Artifacts from "./pages/Artifacts";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import ColdStorage from "./pages/ColdStorage";
import Community from "./pages/Community";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <PlanProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/crop-monitor" element={<ProtectedRoute><CropMonitor /></ProtectedRoute>} />
              <Route path="/crop-recommendation" element={<ProtectedRoute><CropRecommendation /></ProtectedRoute>} />
              <Route path="/disease-detector" element={<ProtectedRoute><DiseaseDetector /></ProtectedRoute>} />
              <Route path="/market-trends" element={<ProtectedRoute><MarketTrends /></ProtectedRoute>} />
              <Route path="/government-schemes" element={<ProtectedRoute><GovernmentSchemes /></ProtectedRoute>} />
              <Route path="/grocery-marketplace" element={<ProtectedRoute><GroceryMarketplace /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/cold-storage" element={<ProtectedRoute><ColdStorage /></ProtectedRoute>} />
              <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
              <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </PlanProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
