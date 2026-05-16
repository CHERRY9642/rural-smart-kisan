import { API_BASE_URL, apiRequest, session } from "./apiClient";

export const featureService = {
  getSensorData<T>() {
    return apiRequest<T>("/features/monitor/sensor-data");
  },

  recommendCrop<T>(payload: unknown) {
    return apiRequest<T>("/features/crop/recommend", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  analyzeDisease<T>(formData: FormData) {
    return fetch(`${API_BASE_URL}/features/disease/analyze`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.getToken()}`
      },
      body: formData
    }).then(async (response) => {
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.detail ?? payload.message ?? "Analysis failed");
      }
      return payload as T;
    });
  },

  getWeatherRaw<T>(lat: number, lon: number) {
    return apiRequest<T>(`/features/weather?lat=${lat}&lon=${lon}`);
  },

  geocode<T>(district: string, state: string) {
    return apiRequest<T>(`/features/weather/geocode?district=${encodeURIComponent(district)}&state=${encodeURIComponent(state)}`);
  },

  getMarketTrends<T>(params: Record<string, string | number | undefined>) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") search.set(key, String(value));
    });
    return apiRequest<T>(`/features/market-trends?${search.toString()}`);
  }
};
