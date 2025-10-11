import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { callPythonService } from "../services/aiService.js";
import path from "path";

export const analyzeDataset = asyncHandler(async (req, res) => {
  const { datasetPath } = req.body;

  if (!datasetPath) {
    return res.status(400).json(
      new ApiResponse(400, null, "datasetPath is required")
    );
  }

  const absolutePath = path.isAbsolute(datasetPath)
    ? datasetPath
    : path.join(process.cwd(), datasetPath);

  const response = await callPythonService("classify", {
    dataset_path: absolutePath
  });

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Analysis completed successfully"));
});
