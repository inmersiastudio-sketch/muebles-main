import cors from "cors";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";
import pino from "pino";
import cookieParser from "cookie-parser";
import productsRouter from "./routes/products.js";
import storesRouter from "./routes/stores.js";
import openapiRouter from "./routes/openapi.js";
import arRouter from "./routes/ar.js";
import adminProductsRouter from "./routes/adminProducts.js";
import authRouter from "./routes/auth.js";
import adminStatsRouter from "./routes/adminStats.js";
import adminSettingsRouter from "./routes/adminSettings.js";
import adminOrdersRouter from "./routes/adminOrders.js";
import eventsRouter from "./routes/events.js";
import uploadRouter from "./routes/upload.js";
import ai3dRouter from "./routes/ai3d.js";
import proxyRouter from "./routes/proxy.js";
import arRedirectRouter from "./routes/arRedirect.js";
import subscriptionRouter from "./routes/subscription.js";
import webhooksRouter from "./routes/webhooks.js";
import catalogRouter from "./routes/catalog.js";
import inquiriesRouter from "./routes/inquiries.js";
import adminInquiriesRouter from "./routes/adminInquiries.js";
import paymentRouter from "./routes/payment.js";
import { rateLimit } from "./middleware/rateLimit.js";
import { redis } from "./lib/redis.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createServer() {
  const app = express();

  // ensure Redis connection info visible early
  if (redis) {
    console.log("Redis client configured");
  } else {
    console.warn("Redis not configured; rate limiting will be per-process");
  }

  // Necesario para que cookies Secure funcionen detrás de proxy/ingress
  app.set("trust proxy", 1);

  app.use(helmet({
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    contentSecurityPolicy: false,
  }));

  // Pretty logs en desarrollo, JSON en producción
  const isDev = process.env.NODE_ENV !== "production";

  // CORS estricto basado en variable de entorno
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(url => url.trim().replace(/\/$/, ''))
    : ["http://localhost:3000", "http://localhost:3001"];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || isDev) {
          callback(null, true);
        } else if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());
  const logger = isDev
    ? pino({ transport: { target: "pino-pretty", options: { colorize: true, translateTime: "SYS:HH:MM:ss" } } })
    : pino();
  app.use((pinoHttp as any)({ logger }));

  // Rate limiting general para evitar abusos básicos
  const publicLimiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
  const eventsLimiter = rateLimit({ windowMs: 60 * 1000, max: 60 });
  const apiKeyLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    keyGenerator: (req) => req.headers["x-api-key"]?.toString() || req.ip || "unknown",
  });

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use(publicLimiter);

  // ── API Routes ──────────────────────────────────────────────
  app.use("/api/products", productsRouter);
  app.use("/api/stores", storesRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/admin/products", adminProductsRouter);
  app.use("/api/admin/stats", adminStatsRouter);
  app.use("/api/admin/settings", adminSettingsRouter);
  app.use("/api/admin/orders", adminOrdersRouter);
  app.use("/api/admin/ai-3d", ai3dRouter);
  app.use("/api/upload", apiKeyLimiter, uploadRouter);
  app.use("/api/proxy", proxyRouter);
  app.use("/api/short/ar", arRedirectRouter);
  app.use("/api/events", eventsLimiter, eventsRouter);
  app.use("/api/ar", arRouter);
  app.use("/api/subscriptions", subscriptionRouter);
  app.use("/api/payments", paymentRouter);
  app.use("/api/webhooks", webhooksRouter);
  app.use("/api/catalog", catalogRouter); // Rutas públicas de catálogo
  app.use("/api/inquiries", inquiriesRouter); // Sistema de consultas
  app.use("/api/admin/inquiries", adminInquiriesRouter); // Admin inquiry analytics
  app.use("/public", express.static("public"));
  app.use(openapiRouter);

  // ── 404 Handler ─────────────────────────────────────────────
  app.use((req, res) => {
    res.status(404).json({ error: "Not found", path: req.path });
  });

  // ── Global Error Handler (MUST be last) ─────────────────────
  app.use(errorHandler);

  return app;
}
