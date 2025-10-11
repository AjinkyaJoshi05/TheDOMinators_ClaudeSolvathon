import fs from "fs";
import path from "path";
import { asyncHandler } from "../utils/asyncHandler.js";
import { callPythonService } from "../services/aiService.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const NODE_TEMP_FOLDER = path.join(process.cwd(), "public", "temp");
const FILE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Helper: clean old dataset files
function cleanupOldFiles() {
  if (!fs.existsSync(NODE_TEMP_FOLDER)) return;
  const now = Date.now();
  fs.readdirSync(NODE_TEMP_FOLDER).forEach(file => {
    const filePath = path.join(NODE_TEMP_FOLDER, file);
    const stats = fs.statSync(filePath);
    if (now - stats.mtimeMs > FILE_EXPIRATION_MS) {
      fs.unlinkSync(filePath);
      console.log(`🧹 Deleted old dataset: ${file}`);
    }
  });
}

export const generateSyntheticDataset = asyncHandler(async (req, res) => {
  const {
    rows = 10,
    missingPct = 0,
    eventType = "WIMP-like",
    fileType = "JSON",
    mock = false, // ✅ default false
  } = req.body;

  cleanupOldFiles();

  const response = await callPythonService("simulate", {
    rows,
    missingPct,
    eventType,
    fileType,
    mock,
  });

  if (!response || !response.metadata || !response.data) {
    return res.status(500).json(
      new ApiResponse(500, null, "Python service returned invalid response.")
    );
  }

  if (!fs.existsSync(NODE_TEMP_FOLDER)) {
    fs.mkdirSync(NODE_TEMP_FOLDER, { recursive: true });
  }

  const datasetId = `dataset_${Date.now()}`;
  const extension = response.metadata.format || fileType.toLowerCase();
  const filename = `${datasetId}.${extension}`;
  const filepath = path.join(NODE_TEMP_FOLDER, filename);

  // Save dataset file in Node temp folder
  fs.writeFileSync(filepath, response.data, "utf-8");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        metadata: response.metadata,
        file_url: `/temp/${filename}`, // ✅ frontend will use backend host
      },
      "Synthetic dataset generated and stored successfully."
    )
  );
});
