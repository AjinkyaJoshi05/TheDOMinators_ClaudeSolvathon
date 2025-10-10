import express from "express";
import { generateSyntheticDataset } from "../controllers/dataset.controller.js";

const router = express.Router();

router.post("/generate", generateSyntheticDataset);

export default router;
