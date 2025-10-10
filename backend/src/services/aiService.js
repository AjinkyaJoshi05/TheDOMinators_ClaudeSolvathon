import axios from "axios";
import ApiError from "../utils/ApiError.js";

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:5000";

export const callPythonService = async (endpoint, payload) => {
  try {
    const response = await axios.post(`${PYTHON_SERVICE_URL}/${endpoint}`, payload, {
      timeout: 10000, // 10 seconds
    });
    return response.data;
  } catch (error) {
    console.error("Python service error:", error.message);
    throw new ApiError(
      500,
      error.response?.data?.message || `Python service error: ${error.message}`
    );
  }
};
