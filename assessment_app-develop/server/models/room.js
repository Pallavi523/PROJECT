import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assessment",
    required: true,
  },
  candidates: [
    {
      candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Candidate",
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "active", "completed", "error"],
        default: "pending",
      },
      webrtcOffer: {
        type: Object,
        default: null,
      },
      joinedAt: {
        type: Date,
        default: null,
      },
      lastActiveAt: {
        type: Date,
        default: null,
      },
    },
  ],
  status: {
    type: String,
    enum: ["scheduled", "active", "completed", "cancelled"],
    default: "scheduled",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 2 * 60 * 60 * 1000), // 2 hours from creation
  },
  startedAt: {
    type: Date,
    default: null,
  },
  completedAt: {
    type: Date,
    default: null,
  },
});

const Room = mongoose.model("Room", RoomSchema);
export default Room;
