import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const authenticate = async (req, res, next) => {
  try {
    const token =
      req.header("Authorization")?.replace("Bearer ", "") ||
      req.cookies.authToken;

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    
    const user = await User.findById(decoded.id).select("-password");
    console.log(user.fullName);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      id: user._id,
      role: user.role,
      email: user.email,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expired. Please refresh your session." });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid token" });
    }
    console.error("Authentication error:", error);
    return res.status(500).json({ message: "Authentication error" });
  }
};

export const authorize = (allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      message: "Access denied",
      requiredRoles: allowedRoles,
    });
  }
  next();
};

export const adminOnly = (req, res, next) => {
  return authorize(["admin"])(req, res, next);
};
