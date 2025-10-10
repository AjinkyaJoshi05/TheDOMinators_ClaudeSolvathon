import express from "express";
import { explainDataset } from "../controllers/explain.controller.js";

const router = express.Router();

router.post("/explain", explainDataset);

export default router;
