import "dotenv/config";
import express from "express";
import cors from "cors";
import aiAssistantRouter from "./routes/aiAssistant.js";

const app = express();
const PORT = process.env.PORT || 3001;

// CORS – allow requests from the frontend dev server
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:8081")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman) and listed origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Routes
app.use("/ai-assistant", aiAssistantRouter);

app.listen(PORT, () => {
  console.log(`🚀  Backend server running on http://localhost:${PORT}`);
  console.log(`   AI Assistant endpoint: POST http://localhost:${PORT}/ai-assistant`);
});
