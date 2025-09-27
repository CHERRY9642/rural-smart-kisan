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
              <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/crop-monitor" element={<CropMonitor />} />
          <Route path="/crop-recommendation" element={<CropRecommendation />} />
          <Route path="/disease-detector" element={<DiseaseDetector />} />
              <Route path="/market-trends" element={<MarketTrends />} />
              <Route path="/government-schemes" element={<GovernmentSchemes />} />
              
              <Route path="/grocery-marketplace" element={<GroceryMarketplace />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/cold-storage" element={<ColdStorage />} />
              <Route path="/community" element={<Community />} />
              <Route path="/help" element={<Help />} />
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
