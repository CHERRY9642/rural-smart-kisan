import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { ZodError } from "zod";
import { config } from "./config.js";
import { initDb, pool } from "./db.js";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/products.routes.js";
import orderRoutes from "./routes/orders.routes.js";
import coldStorageRoutes from "./routes/cold-storage.routes.js";
import featureRoutes from "./routes/features.routes.js";

const app = express();

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || config.frontendOrigins.includes(origin)) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));
app.use(express.json({ limit: "2mb" }));
app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cold-storage", coldStorageRoutes);
app.use("/api/features", featureRoutes);

app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof ZodError) {
    return res.status(400).json({ message: "Validation failed", issues: error.flatten() });
  }

  console.error(error);
  res.status(500).json({ message: "Something went wrong" });
});

const start = async () => {
  await initDb();
  const server = app.listen(config.port, () => {
    console.log(`API server running on http://localhost:${config.port}`);
  });

  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${config.port} is already in use. Stop the existing backend process or set PORT to another value in .env.`);
      process.exit(1);
    }

    throw error;
  });
};

process.on("SIGINT", async () => {
  await pool.end();
  process.exit(0);
});

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
