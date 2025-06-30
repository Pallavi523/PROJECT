import mongoose from "mongoose";
import Assessment from "../models/assessment.js";
import Room from "../models/room.js";
import Candidate from "../models/candidate.js";
export const createRoom = async (req, res) => {
  try {
    const { assessmentId, candidateId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(assessmentId) ||
      !mongoose.Types.ObjectId.isValid(candidateId)
    ) {
      return res.status(400).json({
        message: "Invalid Assessment ID or Candidate ID format",
      });
    }
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    let room = await Room.findOne({ assessmentId });

    if (!room) {
      room = new Room({
        assessmentId,
        candidates: [],
        status: "scheduled",
      });
    }

    const candidateExists = room.candidates.some(
      (c) => c.candidateId.toString() === candidateId
    );

    if (!candidateExists) {
      room.candidates.push({
        candidateId,
        status: "pending",
      });

      await Candidate.findByIdAndUpdate(candidateId, {
        roomId: room._id,
      });
    }

    await room.save();

    res.status(201).json({
      roomId: room._id,
      candidates: room.candidates,
    });
  } catch (error) {
    console.error("Room creation error:", error);
    res.status(500).json({
      message: "Error creating room",
      error: error.message,
    });
  }
};

export const updateCandidateRoomStatus = async (
  roomId,
  candidateId,
  newStatus
) => {
  try {
    const room = await Room.findById(roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    const candidateIndex = room.candidates.findIndex(
      (c) => c.candidateId.toString() === candidateId
    );

    if (candidateIndex === -1) {
      throw new Error("Candidate not found in room");
    }

    room.candidates[candidateIndex].status = newStatus;
    room.candidates[candidateIndex].lastActiveAt = new Date();

    if (newStatus === "active" && !room.candidates[candidateIndex].joinedAt) {
      room.candidates[candidateIndex].joinedAt = new Date();
    }

    let candidateAttemptStatus;
    switch (newStatus) {
      case "active":
        candidateAttemptStatus = "IN_PROGRESS";
        break;
      case "completed":
        candidateAttemptStatus = "COMPLETED";
        break;
      case "error":
        candidateAttemptStatus = "EXPIRED";
        break;
      default:
        candidateAttemptStatus = "NOT_STARTED";
    }

    await Candidate.findByIdAndUpdate(candidateId, {
      attemptStatus: candidateAttemptStatus,
      actualStartTime: newStatus === "active" ? new Date() : undefined,
      isStarted: newStatus === "active" ? true : undefined,
      isCompleted: newStatus === "completed" ? true : undefined,
    });

    if (
      newStatus === "completed" &&
      room.candidates.every((c) => c.status === "completed")
    ) {
      room.status = "completed";
      room.completedAt = new Date();
    }

    await room.save();
    return room;
  } catch (error) {
    console.error("Update candidate status error:", error);
    throw error;
  }
};
export const getRoomDetails = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId).populate({
      path: "assessmentId",
      select: "title description duration",
    });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const candidateDetails = await Promise.all(
      room.candidates.map(async (candidate) => {
        const candidateInfo = await Candidate.findById(candidate.candidateId);
        return {
          ...candidate.toObject(),
          email: candidateInfo?.email,
          fullName: candidateInfo?.fullName,
          attemptStatus: candidateInfo?.attemptStatus,
          scheduledStartTime: candidateInfo?.scheduledStartTime,
          actualStartTime: candidateInfo?.actualStartTime,
        };
      })
    );

    res.json({
      roomId: room._id,
      assessment: room.assessmentId,
      candidates: candidateDetails,
      createdAt: room.createdAt,
      expiresAt: room.expiresAt,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching room details",
      error: error.message,
    });
  }
};

export const updateCandidateStatus = async (req, res) => {
  try {
    const { roomId, candidateId } = req.params;
    const { status, webrtcOffer, actualStartTime, attemptStatus } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const roomCandidate = room.candidates.find(
      (c) => c.candidateId.toString() === candidateId
    );
    if (!roomCandidate) {
      return res.status(404).json({ message: "Candidate not found in room" });
    }

    roomCandidate.status = status;
    if (webrtcOffer) {
      roomCandidate.webrtcOffer = webrtcOffer;
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    if (attemptStatus) {
      candidate.attemptStatus = attemptStatus;
    }
    if (actualStartTime) {
      candidate.actualStartTime = actualStartTime;
    }
    if (status === "active") {
      candidate.isStarted = true;
    }
    if (status === "completed") {
      candidate.isCompleted = true;
    }

    await Promise.all([room.save(), candidate.save()]);

    res.json({
      candidateId,
      status: roomCandidate.status,
      attemptStatus: candidate.attemptStatus,
      isStarted: candidate.isStarted,
      isCompleted: candidate.isCompleted,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating candidate status",
      error: error.message,
    });
  }
};

export const getCandidatesByAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const candidates = await Candidate.find({ assessmentId })
      .select("-magic_link_token")
      .sort({ scheduledStartTime: 1 });

    res.json({
      assessmentId,
      candidates,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching candidates",
      error: error.message,
    });
  }
};
export const getAllRooms = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
      startDate,
      endDate,
    } = req.query;

    // Build query
    const query = {};

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query with pagination
    const rooms = await Room.find(query)
      .populate("assessmentId", "title duration type") // Populate assessment details
      .populate("candidates.candidateId", "name email") // Populate candidate details
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalRooms = await Room.countDocuments(query);

    // Calculate total pages
    const totalPages = Math.ceil(totalRooms / parseInt(limit));

    return res.status(200).json({
      success: true,
      data: {
        rooms,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: totalRooms,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error in getAllRooms:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
