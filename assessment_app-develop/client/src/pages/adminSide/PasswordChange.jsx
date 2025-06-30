import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import Cookies from "js-cookie";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [error, setError] = useState("");
  const [isDefaultPasswordUser, setIsDefaultPasswordUser] = useState(false);

  useEffect(() => {
    const checkPasswordStatus = async () => {
        const token = localStorage.getItem("authToken");
        console.log(token);
        
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const response = await fetch(`${api}/user/password-status`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (data.isDefaultPassword) {
          setIsDefaultPasswordUser(true);
        } else {
          navigate("/hr-dashboard");
        }
      } catch (error) {
        console.error("Error checking password status:", error);
        navigate("/login");
      }
    };

    checkPasswordStatus();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmNewPassword
    ) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      setError("New passwords do not match");
      return;
    }
    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      return;
    }

    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch(`${api}/user/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Password change failed");
      }

      // Update local storage and cookies with new token if provided
      if (data.token) {
        localStorage.setItem("authToken", data.token);
        Cookies.set("authToken", data.token, { expires: 1 });
      }

      // Clear default password flag in backend
      await fetch(`${api}/user/clear-default-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Redirect to HR dashboard
      navigate("/hr-dashboard");
    } catch (error) {
      console.error("Password change error:", error);
      setError(error.message || "An error occurred during password change.");
    }
  };

  // If not a default password user, don't render the change password page
  if (!isDefaultPasswordUser) {
    return null;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-800 via-white to-blue-800">
      <div className="w-96 bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-center text-2xl font-bold text-black mb-6">
            Change Your Password
          </h2>

          <form onSubmit={handleChangePassword}>
            <div className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="text-red-500 text-sm text-center mb-4">
                  {error}
                </div>
              )}

              {/* Current Password */}
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-400 mb-1"
                >
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  placeholder="Enter current password"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* New Password */}
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-400 mb-1"
                >
                  New Password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Confirm New Password */}
              <div>
                <label
                  htmlFor="confirmNewPassword"
                  className="block text-sm font-medium text-gray-400 mb-1"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={formData.confirmNewPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Change Password Button */}
            <div className="mt-6">
              <button
                type="submit"
                className="w-full bg-blue-800 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300"
              >
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
