import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }) => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  if (!userInfo?.email) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const PublicRoute = ({ children }) => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

  if (userInfo?.email) {
    return <Navigate to="/hr-dashboard" replace />;
  }

  return children;
};
