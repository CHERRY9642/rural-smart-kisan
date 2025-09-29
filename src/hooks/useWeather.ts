import { useState, useEffect, useCallback } from 'react';
import { fetchWeatherData, WeatherData } from '@/services/weatherService';

export const useWeather = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWeatherData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const data = await fetchWeatherData(latitude, longitude);
            setWeatherData(data);
          },
          async (err) => {
            console.warn(`Geolocation error (${err.code}): ${err.message}`);
            // Fallback to default location if geolocation fails
            const data = await fetchWeatherData();
            setWeatherData(data);
            setError('Could not get location. Showing default weather.');
          },
          { timeout: 10000 }
        );
      } else {
        // Geolocation not supported, use default
        const data = await fetchWeatherData();
        setWeatherData(data);
        setError('Geolocation not supported. Showing default weather.');
      }
    } catch (err) {
      setError('Failed to fetch weather data');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeatherData();

    // Refresh weather data every 30 minutes
    const interval = setInterval(loadWeatherData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadWeatherData]);

  const refetch = async () => {
    await loadWeatherData();
  };

  return { weatherData, loading, error, refetch };
};