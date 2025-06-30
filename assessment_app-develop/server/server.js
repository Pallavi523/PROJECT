import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "./config/passport.js";
import connectDB from "./config/db.js";
import routes from "./routes/indexRoutes.js";
import User from "./models/user.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import http from "http";
dotenv.config();
import { Server } from "socket.io";

const app = express();
const PORT = process.env.PORT || 8080;
const httpServer = http.createServer(app);

// connectDB().then(() => seedAdmin());
connectDB();
app.use(helmet());
const allowedOrigins = [
  "http://localhost:5173",
  // "http://sdett.oa.com:5173",
  // "https://eb8d-14-99-178-170.ngrok-free.app",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

// if (process.env.NODE_ENV === "development") {
//   app.use(morgan("dev"));
// }

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 30 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: "error",
      message: "Validation Error",
      details: err.message,
    });
  }

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized Access",
    });
  }

  res.status(500).json({
    status: "error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal Server Error",
  });
};

import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many requests from this IP, please try again later.",
});

// app.use("/api/", limiter);
app.use("/api/v1", routes);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is healthy",
    time: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

app.use(errorHandler);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const startServer = async () => {
  try {
    httpServer.listen(PORT, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
      );
      console.log(`Health check available at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};
const seedAdmin = async () => {
  const adminEmail = "admin1@sdettech.com"; // Update as needed
  const adminPassword = "Admin@123"; // Choose a strong default password

  try {
    // Check if the admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("Admin already exists. Skipping creation.");
      return;
    }
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    console.log(adminPassword, hashedPassword);

    // Create the admin user
    const admin = new User({
      fullName: "Super Admin", // Customize as needed
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      isDefaultPassword: true, // Ensure password change on first login
    });

    await admin.save();
    console.log("Admin user created successfully.", admin);
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    mongoose.connection.close();
  }
};

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});

io.on("connection", (socket) => {
  const roomAdmins = new Map();

  socket.on("join-room", ({ roomId, userId, isAdmin }) => {
    socket.join(roomId);

    socket.userData = { userId, isAdmin, roomId };

    if (isAdmin) {
      roomAdmins.set(roomId, userId);
      console.log(`Admin ${userId} joined room ${roomId}`);
    } else {
      // Notify admin when a candidate joins
      socket.to(roomId).emit("candidate-joined", {
        candidateId: userId,
        timestamp: Date.now(),
      });
    }
  });

  socket.on("webrtc-signal", ({ roomId, fromId, type, signal }) => {
    console.log("Signal received:", { roomId, fromId, type });

    // Broadcast to room (excluding sender)
    socket.to(roomId).emit("webrtc-signal", {
      candidateId: fromId,
      type,
      signal,
    });
  });

  socket.on("disconnecting", () => {
    const { roomId, userId, isAdmin } = socket.userData || {};
    if (roomId) {
      if (isAdmin) {
        roomAdmins.delete(roomId);
      } else {
        socket.to(roomId).emit("candidate-left", {
          candidateId: userId,
        });
      }
    }
  });
});
startServer();

export default app;
