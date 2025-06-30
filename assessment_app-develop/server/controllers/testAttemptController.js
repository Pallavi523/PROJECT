import Response from "../models/response.js";
import TestAttempt from "../models/testAttempts.js";

export const createTestAttempt = async (req, res) => {
  try {
    const { candidateId, assessmentId, responses, endTime } = req.body;

    const savedResponses = await Response.insertMany(responses);

    const responseIds = savedResponses.map((resp) => resp._id);

    const testAttempt = new TestAttempt({
      candidateId,
      assessmentId,
      responses: responseIds,
      endTime,
    });

    await testAttempt.save();

    res.status(201).json({ success: true, testAttempt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTestAttemptById = async (req, res) => {
  try {
    const testAttemptId = req.params.id;
    const testAttempt = await TestAttempt.findById(testAttemptId)
      .populate("candidateId assessmentId responses")
      .exec();
    if (!testAttempt) {
      return res.status(404).json({ message: "Test Attempt not found" });
    }
    res.status(200).json(testAttempt);
  } catch (error) {
    console.error("Error retrieving test attempt:", error);
    res
      .status(500)
      .json({ message: "Error retrieving test attempt", error: error.message });
  }
};
export const getTestAttempt = async (req, res) => {
  try {
    const testAttempts = await TestAttempt.find()
      .populate("candidateId responses")
      .exec();
    if (!testAttempts) {
      return res.status(404).json({ message: "Test Attempt not found" });
    }

    res.status(200).json(testAttempts);
  } catch (error) {
    console.error("Error retrieving test attempt:", error);
    res
      .status(500)
      .json({ message: "Error retrieving test attempt", error: error.message });
  }
};

export const uploadMarks = async (req, res) => {
  try {
    const { testAttemptId, score } = req.body;

    if (!testAttemptId || score === undefined) {
      return res
        .status(400)
        .json({ message: "Test attempt ID and score are required" });
    }
    if (typeof score !== "number" || score < 0) {
      return res.status(400).json({
        message: "Score must be a valid number and cannot be negative",
      });
    }

    const updatedTestAttempt = await TestAttempt.findByIdAndUpdate(
      testAttemptId,
      { score },
      { new: true }
    );

    if (!updatedTestAttempt) {
      return res.status(404).json({ message: "Test Attempt not found" });
    }

    res.status(200).json({
      message: "Marks uploaded successfully",
      testAttempt: updatedTestAttempt,
    });
  } catch (error) {
    console.error("Error uploading marks:", error);
    res
      .status(500)
      .json({ message: "Error uploading marks", error: error.message });
  }
};

export const calculateTotalScore = async (req, res) => {
  try {
    const { testAttemptId } = req.params;

    const testAttempt = await TestAttempt.findById(testAttemptId)
      .populate("responses")
      .exec();

    if (!testAttempt) {
      return res.status(404).json({ message: "Test attempt not found" });
    }

    const allMarksUploaded = testAttempt.responses.every(
      (response) => response.marks !== undefined && response.marks !== null
    );

    if (!allMarksUploaded) {
      return res.status(400).json({
        message:
          "Cannot calculate total score - some responses are still pending marks",
      });
    }

    const totalScore = testAttempt.responses.reduce(
      (sum, response) => sum + response.marks,
      0
    );

    testAttempt.score = totalScore;
    await testAttempt.save();

    res.status(200).json({
      message: "Total score calculated successfully",
      totalScore,
      testAttempt,
    });
  } catch (error) {
    console.error("Error calculating total score:", error);
    res.status(500).json({
      message: "Error calculating total score",
      error: error.message,
    });
  }
};