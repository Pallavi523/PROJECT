// services/responseService.js
import api from "@/lib/api";

export const createResponse = async (responseData) => {
  try {
    const response = await fetch(`${api}/response/create-response`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(responseData),
    });

    if (!response.ok) {
      throw new Error("Failed to create response");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating response:", error);
    throw error;
  }
};

// services/testAttemptService.js

