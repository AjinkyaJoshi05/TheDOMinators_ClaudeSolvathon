import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { callPythonService } from "../services/aiService.js";

export const analyzeEvents = asyncHandler(async (req, res) => {
  const inputData = req.body;

  if (!inputData || Object.keys(inputData).length === 0) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "No data provided for analysis"));
  }

  // Call Python microservice
  const analysisResult = await callPythonService("classify", inputData);

  return res
    .status(200)
    .json(new ApiResponse(200, analysisResult, "Analysis completed successfully"));
});
