import Candidate from "../models/candidate.js";

// Get all candidates
export const getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find()
      .populate("assessmentId")
      .populate({ path: "roomId", select: "_id" });
    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve candidates",
      error: error.message,
    });
  }
};
export const Warnings = async (req, res) => {
  const {
    candidateId,
    warningType,
    message,
    timestamp,
    warningCount,
    attemptStatus,
  } = req.body;
  try {
    const candidate = await Candidate.findById(candidateId);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    candidate.attemptStatus = attemptStatus;

    candidate.warnings.push({
      warningType,
      message,
      timestamp,
      warningCount,
    });

    await candidate.save();

    res.status(200).json({ message: "Warning saved successfully" });
  } catch (error) {
    console.error("Error saving warning:", error);
    res.status(500).json({ message: "Failed to save warning", error });
  }
};

// Get candidate by ID
export const getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate("assessmentId")
      .populate("roomId");

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.status(200).json(candidate);
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve candidate",
      error: error.message,
    });
  }
};

// Update candidate
export const updateCandidate = async (req, res) => {
  try {
    const updatedCandidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("assessmentId")
      .populate("roomId");

    if (!updatedCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.status(200).json(updatedCandidate);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update candidate",
      error: error.message,
    });
  }
};

// Delete candidate
export const deleteCandidate = async (req, res) => {
  try {
    const deletedCandidate = await Candidate.findByIdAndDelete(req.params.id);

    if (!deletedCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.status(200).json({ message: "Candidate deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete candidate",
      error: error.message,
    });
  }
};

// Get candidates by assessment ID
export const getCandidatesByAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const candidates = await Candidate.find({ assessmentId })
      .populate("assessmentId")
      .populate("roomId");

    if (!candidates.length) {
      return res.status(404).json({
        message: "No candidates found for this assessment",
      });
    }

    res.status(200).json({ candidates });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch candidates",
      error: error.message,
    });
  }
};

// Get candidates by attempt status
export const getCandidatesByStatus = async (req, res) => {
  try {
    const { attemptStatus } = req.params;
    const candidates = await Candidate.find({ attemptStatus })
      .populate("assessmentId")
      .populate("roomId");

    if (!candidates.length) {
      return res.status(404).json({
        message: "No candidates found with this status",
      });
    }

    res.status(200).json({ candidates });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch candidates",
      error: error.message,
    });
  }
};

export const startAssessment = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    if (candidate.isCompleted) {
      return res.status(400).json({
        message: "Assessment already completed",
      });
    }

    const currentTime = new Date();
    if (currentTime < candidate.scheduledStartTime) {
      return res.status(400).json({
        message: "Assessment cannot be started before scheduled time",
      });
    }

    candidate.isStarted = true;
    candidate.actualStartTime = currentTime;
    candidate.attemptStatus = "IN_PROGRESS";

    await candidate.save();

    res.status(200).json({
      message: "Assessment started successfully",
      candidate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to start assessment",
      error: error.message,
    });
  }
};

export const completeAssessment = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    if (!candidate.isStarted) {
      return res.status(400).json({
        message: "Assessment has not been started",
      });
    }

    if (candidate.isCompleted) {
      return res.status(400).json({
        message: "Assessment already completed",
      });
    }

    candidate.isCompleted = true;
    candidate.attemptStatus = "COMPLETED";

    await candidate.save();

    res.status(200).json({
      message: "Assessment completed successfully",
      candidate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to complete assessment",
      error: error.message,
    });
  }
};
export const getFilteredCandidates = async (req, res) => {
  try {
    const { assessmentId, attemptStatus, startDate, endDate, isCompleted } =
      req.query;

    const filter = {};
    if (assessmentId) filter.assessmentId = assessmentId;
    if (attemptStatus) filter.attemptStatus = attemptStatus;
    if (isCompleted !== undefined) filter.isCompleted = isCompleted;

    if (startDate || endDate) {
      filter.scheduledStartTime = {};
      if (startDate) filter.scheduledStartTime.$gte = new Date(startDate);
      if (endDate) filter.scheduledStartTime.$lte = new Date(endDate);
    }

    const candidates = await Candidate.find(filter)
      .populate("assessmentId")
      .populate("roomId");

    if (!candidates.length) {
      return res.status(404).json({
        message: "No candidates found for the specified filters",
      });
    }

    res.status(200).json({ candidates });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch candidates",
      error: error.message,
    });
  }
};
