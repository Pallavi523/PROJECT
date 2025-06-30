import api from "@/lib/api";
import Cookies from "js-cookie";

export const refreshAuthToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    const response = await fetch(`${api}/user/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      Cookies.set("authToken", data.token, { expires: 1 });
      return data.token;
    } else {
      throw new Error("Failed to refresh token");
    }
  } catch (error) {
    console.error("Token refresh error:", error);
    return null;
  }
};

export const fetchWithTokenRetry = async (url, options) => {
  const authToken = localStorage.getItem("authToken");

  const fetchOptions = {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${authToken}`,
    },
  };

  let response = await fetch(url, fetchOptions);

  // If token is expired, try to refresh
  if (response.status === 401) {
    const newToken = await refreshAuthToken();

    if (newToken) {
      // Retry the fetch with new token
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
        },
      });
    } else {
      // If refresh fails, redirect to login
      window.location.href = "/login";
      return response;
    }
  }

  return response;
};
