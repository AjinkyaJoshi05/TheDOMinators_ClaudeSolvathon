import axios from "axios";
import fs from "fs";
import path from "path";
import { ApiError } from "../utils/ApiError.js";


const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:5000";

export const callPythonService = async (endpoint, payload) => {
  try {
    const response = await axios.post(`${PYTHON_SERVICE_URL}/${endpoint}`, payload, { timeout: 60000 });
    const { file_content, output_format, metadata } = response.data;

    // Save file in Node temp folder
    const filename = `dataset_${Date.now()}.${output_format}`;
    const filepath = path.join(process.cwd(), "public/temp", filename);
    fs.writeFileSync(filepath, file_content);

    return {
      metadata,
      file_url: `/temp/${filename}`
    };
  } catch (error) {
    console.error("Python service error:", error.message);
    throw new ApiError(
      500,
      error.response?.data?.message || `Python service error: ${error.message}`
    );
  }
};
