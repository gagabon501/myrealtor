import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import complianceRoutes from "./routes/complianceRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const corsOrigin =
  process.env.CORS_ORIGINS && process.env.CORS_ORIGINS.trim().length > 0
    ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
    : (origin, callback) => callback(null, true); // reflect any origin

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.options(/.*/, cors({ origin: corsOrigin, credentials: true }));
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const uploadsRoot =
  process.env.UPLOADS_ROOT || path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsRoot)) {
  fs.mkdirSync(uploadsRoot, { recursive: true });
}
app.use("/uploads", express.static(uploadsRoot));

app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/compliance", complianceRoutes);
app.use("/api/users", userRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(errorHandler);

export default app;
