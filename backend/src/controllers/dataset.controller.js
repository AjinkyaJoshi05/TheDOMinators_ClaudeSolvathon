import { asyncHandler } from "../utils/asyncHandler.js";
import { callPythonService } from "../services/aiService.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const generateSyntheticDataset = asyncHandler(async (req, res) => {
  const {
    num_events = 1000,
    include_noise = true,
    missing_rate = 0.05,
    particle_types = ["WIMP-like","Axion-like","Background"],
    output_format = "csv",  // default CSV
    seed = null
  } = req.body;

  const response = await callPythonService("simulate", {
    num_events,
    include_noise,
    missing_rate,
    particle_types,
    output_format,
    seed
  });

  return res.status(200).json(
    new ApiResponse(200, response, "Synthetic dataset generated successfully")
  );
});
