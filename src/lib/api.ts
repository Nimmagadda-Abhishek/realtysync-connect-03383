
const API_BASE_URL = "https://5d68354c8aee.ngrok-free.app/api";



export const apiClient = {
  get: async (endpoint: string) => {
    try {
      console.log("GET →", `${API_BASE_URL}${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });

      const text = await response.text();
      console.log("Raw GET response:", text);

      if (!response.ok) {
        throw new Error(`GET failed: ${response.statusText}`);
      }

      // Try to parse JSON if possible
      try {
        return text ? JSON.parse(text) : {};
      } catch {
        console.warn("GET returned invalid JSON — returning raw text.");
        return { message: text || "Success" };
      }
    } catch (err) {
      console.error("GET error:", err);
      throw err;
    }
  },

  post: async (endpoint: string, data: any) => {
    try {
      console.log("POST →", `${API_BASE_URL}${endpoint}`, "Data:", data);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(data),
      });

      const responseText = await response.text();
      console.log("Raw POST response:", responseText);

      // If response failed (400, 500, etc.)
      if (!response.ok) {
        console.error("POST failed:", response.status, response.statusText, responseText);
        throw new Error(`POST failed: ${response.statusText}`);
      }

      // ✅ Try to parse JSON safely
      try {
        return responseText ? JSON.parse(responseText) : { success: true };
      } catch {
        console.warn("POST returned invalid JSON — returning fallback success.");
        // Handle broken or HTML responses gracefully
        if (
          responseText.startsWith("<!DOCTYPE html") ||
          responseText.startsWith("<html") ||
          responseText.includes("Whitelabel Error")
        ) {
          return { success: false, message: "Server error (HTML response instead of JSON)" };
        }

        // Fallback — assume success since backend probably saved correctly
        return { success: true, message: "Request succeeded but returned invalid JSON" };
      }
    } catch (err) {
      console.error("POST request error:", err);
      throw err;
    }
  },
};
