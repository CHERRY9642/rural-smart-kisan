import dotenv from "dotenv";

dotenv.config();

const required = (key: string, fallback?: string) => {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const config = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  frontendOrigins: (process.env.FRONTEND_ORIGIN ?? "http://localhost:8080,http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean),
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  sensorApiBase: process.env.SENSOR_API_BASE ?? "https://render-syo4.onrender.com",
  diseaseApiBase: process.env.DISEASE_API_BASE ?? "https://krishi-rakshak-2.onrender.com",
  cropRecommendApi: process.env.CROP_RECOMMEND_API ?? "https://krishirecommend-api.onrender.com/recommend",
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY,
  dataGovApiKey: process.env.DATA_GOV_API_KEY
};
