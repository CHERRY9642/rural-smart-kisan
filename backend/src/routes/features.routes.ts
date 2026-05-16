import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { requireAuth } from "../auth.js";
import { config } from "../config.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

const fetchJson = async (url: string, init?: RequestInit) => {
  const response = await fetch(url, init);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.detail ?? payload.message ?? `External API failed with status ${response.status}`);
  }

  return payload;
};

router.get("/monitor/sensor-data", requireAuth, async (_req, res, next) => {
  try {
    const data = await fetchJson(`${config.sensorApiBase}/sensordata`);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/monitor/health", requireAuth, async (_req, res, next) => {
  try {
    const data = await fetchJson(`${config.sensorApiBase}/health`);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/disease/analyze", requireAuth, upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const formData = new FormData();
    const fileBuffer = req.file.buffer;
    const arrayBuffer = fileBuffer.buffer.slice(
      fileBuffer.byteOffset,
      fileBuffer.byteOffset + fileBuffer.byteLength
    ) as ArrayBuffer;
    formData.append("image", new Blob([arrayBuffer], { type: req.file.mimetype }), req.file.originalname);

    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === "string") {
        formData.append(key, value);
      }
    }

    const response = await fetch(`${config.diseaseApiBase}/analyze`, {
      method: "POST",
      body: formData
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(response.status).json(payload);
    }

    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.post("/crop/recommend", requireAuth, async (req, res, next) => {
  try {
    const input = z.object({
      N: z.number(),
      P: z.number(),
      K: z.number(),
      temperature: z.number(),
      humidity: z.number(),
      ph: z.number(),
      rainfall: z.number(),
      season: z.string()
    }).parse(req.body);

    const data = await fetchJson(config.cropRecommendApi, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });

    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/weather/geocode", requireAuth, async (req, res, next) => {
  try {
    if (!config.openWeatherApiKey) {
      return res.status(500).json({ message: "OpenWeather API key is not configured" });
    }

    const district = String(req.query.district ?? "");
    const state = String(req.query.state ?? "");
    const url = new URL("https://api.openweathermap.org/geo/1.0/direct");
    url.searchParams.set("q", `${district},${state},IN`);
    url.searchParams.set("limit", "1");
    url.searchParams.set("appid", config.openWeatherApiKey);

    const data = await fetchJson(url.toString());
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/weather", requireAuth, async (req, res, next) => {
  try {
    if (!config.openWeatherApiKey) {
      return res.status(500).json({ message: "OpenWeather API key is not configured" });
    }

    const lat = String(req.query.lat ?? "12.9716");
    const lon = String(req.query.lon ?? "77.5946");

    const currentUrl = new URL("https://api.openweathermap.org/data/2.5/weather");
    currentUrl.searchParams.set("lat", lat);
    currentUrl.searchParams.set("lon", lon);
    currentUrl.searchParams.set("appid", config.openWeatherApiKey);
    currentUrl.searchParams.set("units", "metric");

    const forecastUrl = new URL("https://api.openweathermap.org/data/2.5/forecast");
    forecastUrl.searchParams.set("lat", lat);
    forecastUrl.searchParams.set("lon", lon);
    forecastUrl.searchParams.set("appid", config.openWeatherApiKey);
    forecastUrl.searchParams.set("units", "metric");

    const [current, forecast] = await Promise.all([
      fetchJson(currentUrl.toString()),
      fetchJson(forecastUrl.toString())
    ]);

    res.json({ current, forecast });
  } catch (error) {
    next(error);
  }
});

router.get("/market-trends", requireAuth, async (req, res, next) => {
  try {
    if (!config.dataGovApiKey) {
      return res.status(500).json({ message: "Data.gov.in API key is not configured" });
    }

    const url = new URL("https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070");
    url.searchParams.set("api-key", config.dataGovApiKey);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", String(req.query.limit ?? "1000"));

    for (const key of ["state", "district", "commodity"]) {
      const value = req.query[key];
      if (typeof value === "string" && value) {
        url.searchParams.set(`filters[${key}]`, value);
      }
    }

    const data = await fetchJson(url.toString());
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
