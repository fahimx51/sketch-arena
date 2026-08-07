import express, { Application } from "express";
import cors from "cors";

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health check or API routes
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

export default app;