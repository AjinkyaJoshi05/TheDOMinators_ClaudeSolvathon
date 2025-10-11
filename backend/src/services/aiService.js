import axios from "axios";
import { ApiError } from "../utils/ApiError.js";

export const callPythonService = async (endpoint, payload) => {
  try {
    const url = `${process.env.PYTHON_SERVICE_URL}/${endpoint}`;
    const res = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 30000, // 30 seconds timeout
    });

    const data = res.data;

    // Validate response
    if (
      !data ||
      !("status" in data) ||
      data.status !== "success" ||
      !("data" in data) ||
      !data.data
    ) {
      console.error("❌ Invalid response from Python service:", data);
      throw new ApiError(
        500,
        "Python service returned an invalid or malformed response."
      );
    }

    // Return only the inner data
    return data.data;

  } catch (err) {
    console.error("⚠️ Python service error:", err.message);
    if (err.response) {
      console.error("Response data:", err.response.data);
    }
    throw new ApiError(500, `Python Service Error: ${err.message}`);
  }
};
