import express from "express";
import { analyzeDataset } from "../controllers/analysis.controller.js";

const router = express.Router();

// POST /api/analyze
router.post("/analyze", analyzeDataset);

export default router;
