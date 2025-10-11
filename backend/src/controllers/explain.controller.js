import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { callPythonService } from "../services/aiService.js";
import path from "path";
import fs from "fs";

function extractExplanation(obj) {
  if (!obj) return null;
  if (typeof obj === "string" && obj.trim()) return obj;  

  if (obj.result && typeof obj.result === "object") {
    const deep = extractExplanation(obj.result);
    if (deep) return deep;
  }
  if (obj.response && typeof obj.response === "object") {
    const deep = extractExplanation(obj.response);
    if (deep) return deep;
  }

  try {
    const pretty = JSON.stringify(obj, null, 2);
    return pretty && pretty !== "{}" ? pretty : null;
  } catch (e) {
    return null;
  }
}

export const explainDataset = asyncHandler(async (req, res) => {
  const rawBody = req.body || {};
  const datasetPathRaw = rawBody.datasetPath ?? rawBody.dataset_path;
  const userPrompt = rawBody.userPrompt ?? rawBody.prompt;

  if (!datasetPathRaw || !userPrompt) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "datasetPath and userPrompt are required"));
  }

  // try resolve incoming path first
  let attempted = [];
  let absolutePath = path.isAbsolute(datasetPathRaw)
    ? datasetPathRaw
    : path.join(process.cwd(), datasetPathRaw);
  attempted.push(absolutePath);

  // if that doesn't exist, try public/temp/<basename>
  if (!fs.existsSync(absolutePath)) {
    const basename = path.basename(datasetPathRaw);
    const alt = path.join(process.cwd(), "public", "temp", basename);
    attempted.push(alt);
    if (fs.existsSync(alt)) {
      absolutePath = alt;
    }
  }

  // If still missing, return a clear error listing attempted paths
  if (!fs.existsSync(absolutePath)) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          null,
          `Dataset file not found. attempted paths:\n${attempted.join("\n")}`
        )
      );
  }

  // Call python/external explain service
  const response = await callPythonService("explain", {
    dataset_path: absolutePath,
    prompt: userPrompt,
  });

  console.debug("explain service raw response:", response);

  const explanationText = extractExplanation(response) ?? "Explanation generated successfully";

  // Return explanation as top-level message plus raw for debug
  return res
    .status(200)
    .json(new ApiResponse(200, { raw: response, explanation: explanationText }, explanationText));
});
      