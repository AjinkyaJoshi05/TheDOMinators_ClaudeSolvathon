// backend/src/controllers/explain.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { callPythonService } from "../services/aiService.js";
import path from "path";

export const explainDataset = asyncHandler(async (req, res) => {
  const { datasetPath, userPrompt } = req.body;

  if (!datasetPath || !userPrompt) {
    return res.status(400).json(
      new ApiResponse(400, null, "datasetPath and userPrompt are required")
    );
  }

  // Ensure absolute path
  const absolutePath = path.isAbsolute(datasetPath)
    ? datasetPath
    : path.join(process.cwd(), datasetPath);

  const response = await callPythonService("explain", {
    dataset_path: absolutePath,
    prompt: userPrompt,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Explanation generated successfully"));
});
