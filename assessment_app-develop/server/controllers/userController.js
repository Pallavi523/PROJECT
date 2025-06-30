import jwt from "jsonwebtoken";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { transporter } from "../config/passport.js";

dotenv.config();
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const isAdmin = async (req, res, next) => {
  try {
    console.log(req.user);
    const user = await User.findById(req.user.id);
    console.log(user);
    if (!user || user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Admin rights required." });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error checking admin status", error });
  }
};
const verifyTransporter = async () => {
  try {
    // console.log(process.env.SMTP_USER);
    // console.log(process.env.SMTP_PASS);
    await transporter.verify();
    console.log("SMTP connection verified");
  } catch (error) {
    console.error("SMTP verification failed:", error);
    throw error;
  }
};
export const addUser = async (req, res) => {
  const { fullName, email, role } = req.body;

  if (!email.endsWith("@sdettech.com")) {
    return res
      .status(400)
      .json({ message: "Email must end with @sdettech.com" });
  }
  if (!["admin", "hr"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const DEFAULT_PASSWORD = "Sdet_new_" + Math.random().toString(36).slice(-8);

    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      role,
      isDefaultPassword: true,
    });

    await verifyTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Account Creation Invitation",
      html: `
        <h1>Welcome to SDET Tech Assessment Admin Portal   </h1>
        <p>An account has been created for you with the following credentials:</p>
        <p>Email: ${email}</p>
        <p>Temporary Password: ${DEFAULT_PASSWORD}</p>
        <p>Please log in and change your password immediately.</p>
        <p>This is a default password and must be changed upon first login.</p>
      `,
    });

    await user.save();
    res.status(201).json({
      message: "User added successfully. Invitation email sent.",
      email: user.email,
    });
  } catch (error) {
    console.error("Error adding user:", error);
    res
      .status(500)
      .json({ message: "Error adding user", error: error.message });
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;
  console.log(userId);
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValidPassword =
      user.isDefaultPassword ||
      (await bcrypt.compare(currentPassword, user.password));

    if (!isValidPassword) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedNewPassword;
    user.isDefaultPassword = false;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res
      .status(500)
      .json({ message: "Error changing password", error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    console.log(user);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(isPasswordValid);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      token,
      refreshToken,
      mustChangePassword: user.isDefaultPassword,
      user,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Error logging in", error });
  }
};

export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    console.log(user);

    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.status(200).json({ token: newToken, refreshToken: newRefreshToken });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Refresh token expired" });
    }
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

export const getPasswordStatus = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Password status fetched successfully",
      isDefaultPassword: user.isDefaultPassword,
    });
  } catch (error) {
    console.error("Error fetching password status:", error);
    res.status(500).json({
      message: "Error fetching password status",
      error: error.message,
    });
  }
};
export const clearDefaultPassword = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.isDefaultPassword = false;
    await user.save();

    res.status(200).json({
      message: "'isDefaultPassword' field cleared successfully",
    });
  } catch (error) {
    console.error("Error removing 'isDefaultPassword' field:", error);
    res.status(500).json({
      message: "Error removing 'isDefaultPassword' field",
      error: error.message,
    });
  }
};

export const logout = async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const user = await User.findOne({ refreshToken });
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error during logout", error });
  }
};
