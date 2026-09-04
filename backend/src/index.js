import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load .env from backend, workspace root, or frontend
[
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "backend/.env"),
  path.resolve(process.cwd(), "../backend/.env"),
  path.resolve(process.cwd(), "../.env"),
  path.resolve(process.cwd(), "frontend/.env"),
  path.resolve(process.cwd(), "../frontend/.env"),
].forEach((envPath) => {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
});

import express from "express";
import cors from "cors";
import aiAssistantRouter from "./routes/aiAssistant.js";
import learnAIRouter from "./routes/learnAI.js";
import speakingRouter from "./routes/speaking.js";
import eduVaultRouter from "./routes/eduVault.js";
import eduMentorRouter from "./routes/eduMentor.js";
import eduRoadmapRouter from "./routes/eduRoadmap.js";

const app = express();
const PORT = process.env.PORT || 3001;

// CORS – allow requests from the frontend dev server
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:8081")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin or any localhost origin during dev, plus configured origins
      if (!origin || allowedOrigins.includes(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/ai-assistant", aiAssistantRouter);
app.use("/learn-ai", learnAIRouter);
app.use("/api/learn", learnAIRouter);
app.use("/api/learn-ai", learnAIRouter);
app.use("/api/speaking", speakingRouter);
app.use("/api/eduspeak", speakingRouter);
app.use("/eduspeak", speakingRouter);
app.use("/api/eduvault", eduVaultRouter);
app.use("/api/edumentor", eduMentorRouter);
app.use("/edumentor", eduMentorRouter);
app.use("/api/eduroadmap", eduRoadmapRouter);
app.use("/eduroadmap", eduRoadmapRouter);

app.listen(PORT, () => {
  console.log(`🚀  Backend server running on http://localhost:${PORT}`);
  console.log(`   AI Assistant endpoint: POST http://localhost:${PORT}/ai-assistant`);
  console.log(`   Learn AI endpoints:    POST http://localhost:${PORT}/learn-ai/{material-tool|topic-explain|quiz}`);
  console.log(`   Speaking AI endpoint:  POST http://localhost:${PORT}/api/speaking/analyze`);
  console.log(`   EduVault AI endpoint:  POST http://localhost:${PORT}/api/eduvault/ai-intelligence`);
  console.log(`   EduMentor AI endpoint: POST http://localhost:${PORT}/api/edumentor/chat`);
  console.log(`   EduRoadmap AI endpoint:POST http://localhost:${PORT}/api/eduroadmap/generate`);
});


