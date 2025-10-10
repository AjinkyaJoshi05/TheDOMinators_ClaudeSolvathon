import express from "express";
import { analyzeEvents } from "../controllers/analysis.controller.js";

const router = express.Router();

router.post("/", analyzeEvents); // POST /api/analysis

export default router;
