import axios from "axios";
import { ApiError } from "../utils/ApiError.js";

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:5000";

/**
 * Calls the Python FastAPI microservice
 * @param {string} endpoint - Python endpoint ('simulate', 'classify', 'explain')
 * @param {object} payload - JSON payload to send
 */
export const callPythonService = async (endpoint, payload) => {
  try {
    console.log("🚀 Sending to Python:", payload);

    const response = await axios.post(`${PYTHON_SERVICE_URL}/${endpoint}`, payload, {
      timeout: 120000, // increase timeout for long requests
      headers: { "Content-Type": "application/json" },
    });

    return response.data;

  } catch (error) {
    console.error("❌ Python service error:", error.response?.data || error.message);
    throw new ApiError(
      500,
      error.response?.data?.error || `Python service error: ${error.message}`
    );
  }
};
