import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Thermometer, Droplets, Sun, Leaf, Bell, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SensorData {
  temperature: number;
  humidity: number;
  moisture: number;
  light: number;
}

interface Alert {
  message: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  timestamp: Date;
  id: string;
}

const CropMonitor = () => {
  const { translateSync } = useLanguage();
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE = "https://render-syo4.onrender.com";
  const EXTERNAL_SENSOR_API = `${API_BASE}/sensordata`;
  const HEALTH_API = `${API_BASE}/health`;

  const fetchSensorData = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(EXTERNAL_SENSOR_API);
      if (!response.ok) throw new Error('API failed');
      const newData = await response.json();

      setSensorData(newData);
      const newAlerts = generateAlerts(newData);
      updateAlerts(newAlerts);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching sensor data:', err);
      setError('Failed to fetch sensor data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateAlerts = (data: SensorData): string[] => {
    const alerts: string[] = [];
    
    // Only generate alerts when conditions are actually met
    if (data.temperature > 40) {
      alerts.push(`🚨 Critical: High Temperature Alert: ${data.temperature.toFixed(1)}°C (Above 40°C)`);
    } else if (data.temperature > 35) {
      alerts.push(`⚠️ Warning: High Temperature: ${data.temperature.toFixed(1)}°C (Above 35°C)`);
    } else if (data.temperature < 10) {
      alerts.push(`🚨 Critical: Low Temperature Alert: ${data.temperature.toFixed(1)}°C (Below 10°C)`);
    } else if (data.temperature < 15) {
      alerts.push(`⚠️ Warning: Low Temperature: ${data.temperature.toFixed(1)}°C (Below 15°C)`);
    }

    if (data.humidity > 90) {
      alerts.push(`🚨 Critical: High Humidity Alert: ${data.humidity.toFixed(1)}% (Above 90%)`);
    } else if (data.humidity > 80) {
      alerts.push(`⚠️ Warning: High Humidity: ${data.humidity.toFixed(1)}% (Above 80%)`);
    } else if (data.humidity < 30) {
      alerts.push(`🚨 Critical: Low Humidity Alert: ${data.humidity.toFixed(1)}% (Below 30%)`);
    } else if (data.humidity < 50) {
      alerts.push(`⚠️ Warning: Low Humidity: ${data.humidity.toFixed(1)}% (Below 50%)`);
    }

    if (data.moisture > 80) {
      alerts.push(`🚨 Critical: High Soil Moisture Alert: ${data.moisture.toFixed(1)}% (Above 80%)`);
    } else if (data.moisture > 70) {
      alerts.push(`⚠️ Warning: High Soil Moisture: ${data.moisture.toFixed(1)}% (Above 70%)`);
    } else if (data.moisture < 20) {
      alerts.push(`🚨 Critical: Low Soil Moisture Alert: ${data.moisture.toFixed(1)}% (Below 20%)`);
    } else if (data.moisture < 30) {
      alerts.push(`⚠️ Warning: Low Soil Moisture: ${data.moisture.toFixed(1)}% (Below 30%)`);
    }

    if (data.light > 1000) {
      alerts.push(`🚨 Critical: High Light Alert: ${data.light.toFixed(0)} lux (Above 1000 lux)`);
    } else if (data.light > 800) {
      alerts.push(`⚠️ Warning: High Light: ${data.light.toFixed(0)} lux (Above 800 lux)`);
    } else if (data.light < 200) {
      alerts.push(`🚨 Critical: Low Light Alert: ${data.light.toFixed(0)} lux (Below 200 lux)`);
    } else if (data.light < 300) {
      alerts.push(`⚠️ Warning: Low Light: ${data.light.toFixed(0)} lux (Below 300 lux)`);
    }

    // Remove the "all parameters normal" message - only show actual alerts
    return alerts;
  };

  const updateAlerts = (newAlerts: string[]) => {
    if (newAlerts.length === 0) {
      // Don't add any notification if no alerts
      return;
    }

    const alertObjects: Alert[] = newAlerts.map(alert => ({
      message: alert,
      type: classifyAlert(alert),
      timestamp: new Date(),
      id: Date.now() + Math.random().toString(36).substr(2, 9)
    }));

    setAlerts(prev => {
      const updated = [...alertObjects, ...prev];
      return updated.slice(0, 6);
    });
  };

  const classifyAlert = (alert: string): 'critical' | 'warning' | 'info' | 'success' => {
    if (alert.includes('🚨') || alert.includes('Critical')) return 'critical';
    if (alert.includes('⚠️') || alert.includes('Warning')) return 'warning';
    return 'info';
  };

  const clearNotifications = () => {
    setAlerts([]);
  };

  const getAlertStats = () => {
    const critical = alerts.filter(alert => alert.type === 'critical').length;
    const warning = alerts.filter(alert => alert.type === 'warning').length;
    return { critical, warning, normal: 0 };
  };

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 5000);
    return () => clearInterval(interval);
  }, []);

  const getSensorStatus = (type: keyof SensorData, value: number) => {
    switch (type) {
      case 'temperature':
        return value >= 20 && value <= 30 ? 'ideal' : value < 20 || value > 35 ? 'critical' : 'warning';
      case 'humidity':
        return value >= 60 && value <= 80 ? 'ideal' : value < 50 || value > 90 ? 'critical' : 'warning';
      case 'moisture':
        return value >= 40 && value <= 60 ? 'ideal' : value < 30 || value > 70 ? 'critical' : 'warning';
      case 'light':
        return value >= 5000 && value <= 10000 ? 'ideal' : value < 3000 || value > 12000 ? 'critical' : 'warning';
      default:
        return 'unknown';
    }
  };

  const getSensorRange = (type: keyof SensorData) => {
    switch (type) {
      case 'temperature':
        return { min: 0, max: 50, ideal: [20, 30], warning: [15, 35] };
      case 'humidity':
        return { min: 0, max: 100, ideal: [60, 80], warning: [50, 90] };
      case 'moisture':
        return { min: 0, max: 100, ideal: [40, 60], warning: [30, 70] };
      case 'light':
        return { min: 0, max: 15000, ideal: [5000, 10000], warning: [3000, 12000] };
      default:
        return { min: 0, max: 100, ideal: [0, 100], warning: [0, 100] };
    }
  };

  const SensorCard = ({ type, value, label, icon: Icon, color }: {
    type: keyof SensorData;
    value: number;
    label: string;
    icon: React.ComponentType<any>;
    color: string;
  }) => {
    const status = getSensorStatus(type, value);
    const range = getSensorRange(type);
    const percentage = Math.min(Math.max((value - range.min) / (range.max - range.min) * 100, 0), 100);
    
    const isWarning = status === 'warning';
    const isCritical = status === 'critical';
    
    return (
      <Card className={`h-full ${color} text-white rounded-2xl shadow-lg transition-all duration-300 ${
        isCritical ? 'ring-2 ring-red-400' : isWarning ? 'ring-2 ring-yellow-400' : ''
      }`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg font-bold">
            <div className="flex items-center space-x-2">
              <Icon className="h-6 w-6" />
              <span>{label}</span>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              status === 'ideal' ? 'bg-green-400' :
              status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
            }`} />
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="text-center mb-4">
            <motion.p
              key={`${type}-${value}`}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-3xl font-bold"
            >
              {value}{type === 'light' ? ' lux' : type === 'temperature' ? '°C' : '%'}
            </motion.p>
            <p className="text-sm opacity-80 mt-1">
              Status: <span className="font-semibold capitalize">{status}</span>
            </p>
          </div>

          <div className="relative h-4 bg-white/20 rounded-full overflow-hidden mb-2">
            <div className="absolute inset-0 flex">
              <div className="bg-red-500/60 flex-1"></div>
              <div className="bg-yellow-500/60 flex-1"></div>
              <div className="bg-green-500/60 flex-1"></div>
              <div className="bg-yellow-500/60 flex-1"></div>
              <div className="bg-red-500/60 flex-1"></div>
            </div>
            
            <motion.div
              key={`${type}-fill-${percentage}`}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full ${
                status === 'ideal' ? 'bg-white' :
                status === 'warning' ? 'bg-yellow-200' : 'bg-red-200'
              }`}
            />
          </div>

          <div className="flex justify-between text-xs opacity-80">
            <span>{range.min}</span>
            <span className="font-semibold">Ideal</span>
            <span>{range.max}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const AlertNotificationPanel = () => {
    const stats = getAlertStats();
    const alertClasses = {
      critical: 'bg-red-50 border-l-4 border-red-500',
      warning: 'bg-yellow-50 border-l-4 border-yellow-500',
      info: 'bg-blue-50 border-l-4 border-blue-500'
    };

    const alertIcons = {
      critical: '🚨',
      warning: '⚠️',
      info: 'ℹ️'
    };

    return (
      <Card className="bg-white shadow-lg rounded-2xl">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold flex items-center">
              <Bell className="h-5 w-5 mr-2 text-blue-600" />
              Alerts & Notifications
            </CardTitle>
            <Button
              onClick={clearNotifications}
              variant="ghost"
              size="sm"
              className="h-8 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 mb-3 text-center text-xs">
            <div className="bg-red-50 text-red-700 p-1 rounded font-semibold">
              Critical: {stats.critical}
            </div>
            <div className="bg-yellow-50 text-yellow-700 p-1 rounded font-semibold">
              Warning: {stats.warning}
            </div>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="text-gray-500 p-4 text-center bg-gray-50 rounded">
                <div className="text-green-500 text-lg mb-2">✅</div>
                <div className="text-sm">All parameters within normal range</div>
                <div className="text-xs text-gray-400 mt-1">No alerts at this time</div>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded ${alertClasses[alert.type]}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-sm flex-shrink-0">{alertIcons[alert.type]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium break-words">{alert.message}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {alert.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {lastUpdated && (
            <div className="mt-3 text-xs text-gray-500 text-center">
              Updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="h-40 bg-gray-100 rounded-2xl animate-pulse">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="h-6 w-24 bg-gray-300 rounded"></div>
              <div className="h-4 w-4 bg-gray-300 rounded-full"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-gray-300 rounded mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="flex justify-between">
              <div className="h-3 w-8 bg-gray-300 rounded"></div>
              <div className="h-3 w-12 bg-gray-300 rounded"></div>
              <div className="h-3 w-8 bg-gray-300 rounded"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6 p-4 bg-gradient-to-br from-green-50 to-blue-50 min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-green-700 mb-2">
            <span className="inline-block mr-2">🌱</span> Crop Monitor
          </h1>
          <p className="text-gray-600">
            Real-time environmental insights for thriving crops
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {error && !sensorData && (
          <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-2xl border border-red-200">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-red-700 mb-2">Error Fetching Data</h2>
            <p className="text-red-600 text-center mb-4">{error}</p>
            <Button
              onClick={fetchSensorData}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        )}

        {!sensorData ? (
          <LoadingSkeleton />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <SensorCard
                type="temperature"
                value={sensorData.temperature}
                label="Temperature"
                icon={Thermometer}
                color="bg-gradient-to-br from-red-500 to-red-600"
              />
              <SensorCard
                type="humidity"
                value={sensorData.humidity}
                label="Humidity"
                icon={Droplets}
                color="bg-gradient-to-br from-blue-500 to-blue-600"
              />
              <SensorCard
                type="moisture"
                value={sensorData.moisture}
                label="Moisture"
                icon={Leaf}
                color="bg-gradient-to-br from-green-500 to-green-600"
              />
              <SensorCard
                type="light"
                value={sensorData.light}
                label="Light"
                icon={Sun}
                color="bg-gradient-to-br from-yellow-500 to-yellow-600"
              />
            </div>

            <AlertNotificationPanel />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CropMonitor;