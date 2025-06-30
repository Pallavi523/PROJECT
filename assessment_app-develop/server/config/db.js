import mongoose from "mongoose";
mongoose.set("strictPopulate", false);
const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true,
      tls: true,
      dbName: "test",
    };

    await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`MongoDB Connected Successfully`);

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected successfully");
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });
  } catch (error) {
    console.error("MongoDB connection error details:", {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack,
    });

    if (error.name === "MongoNetworkError") {
      console.log("Network error detected. Please check:");
      console.log("1. Network connectivity");
      console.log("2. MongoDB Atlas IP whitelist");
      console.log("3. Firewall settings");
    }

    throw error;
  }
};

export default connectDB;