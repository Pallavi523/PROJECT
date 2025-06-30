import Candidate from "../models/candidate.js";
import Assessment from "../models/assessment.js";
import passport from "passport";
import question from "../models/question.js";

export const createAssessment = async (req, res) => {
  try {
    const assessment = new Assessment(req.body);
    await assessment.save();
    res.status(201).json(assessment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
export const getAllAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find();
    res.status(200).json(assessments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id).populate(
      "questions"
    );
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }
    res.status(200).json(assessment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const updateAssessment = async (req, res) => {
  try {
    const updatedAssessment = await Assessment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedAssessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }
    res.status(200).json(updatedAssessment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
export const deleteAssessment = async (req, res) => {
  try {
    const deletedAssessment = await Assessment.findByIdAndDelete(req.params.id);
    if (!deletedAssessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }
    res.status(200).json({ message: "Assessment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getAssessmentId = async (req, res) => {
  try {
    const assessment = await Assessment.findOne(
      { title: req.params.title },
      "_id"
    );

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    res.status(200).json({ _id: assessment._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const addQuestionToAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { text, options, type, category } = req.body;

    const newQuestion = new question({
      text,
      options,
      type,
      category,
    });

    await newQuestion.save();

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    assessment.questions.push(newQuestion._id);
    await assessment.save();

    res.status(201).json({ message: "Question added successfully", question });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const addSelectedQuestionsToAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { questionIds } = req.body;

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid or empty questionIds array" });
    }

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    const questions = await question.find({ _id: { $in: questionIds } });
    if (questions.length !== questionIds.length) {
      return res.status(404).json({ message: "Some questions not found" });
    }

    const newQuestionIds = questionIds.filter(
      (id) => !assessment.questions.includes(id)
    );

    assessment.questions.push(...newQuestionIds);
    await assessment.save();

    res.status(200).json({
      message: "Questions added successfully",
      addedQuestions: newQuestionIds,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const getQuestionsFromAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const assessment = await Assessment.findById(assessmentId).populate(
      "questions"
    );
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    res.status(200).json({ questions: assessment.questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const scheduleCandidate = async (req, res) => {
  try {
    const { email, fullName, assessmentId, scheduledStartTime } = req.body;

    const candidate = new Candidate({
      email,
      fullName,
      assessmentId,
      scheduledStartTime: new Date(scheduledStartTime),
    });

    await candidate.save();

    req.body = { email, assessmentId };
    passport.authenticate("magiclink", {
      action: "requestToken",
    })(req, res, (error) => {
      if (error) {
        console.error("Error during authentication:", error);
        return res
          .status(500)
          .json({ message: "Error sending magic link", error: error.message });
      }
      res.status(201).json({
        message: "Assessment scheduled and link sent successfully",
        candidateId: candidate._id,
      });
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
export const removeQuestionFromAssessment = async (req, res) => {
  try {
    const { assessmentId, questionId } = req.params;

    const assessment = await Assessment.findById(assessmentId);

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }
    const questionIndex = assessment.questions.indexOf(questionId);
    if (questionIndex === -1) {
      return res
        .status(404)
        .json({ message: "Question not found in this assessment" });
    }

    assessment.questions.splice(questionIndex, 1);

    await assessment.save();

    res.status(200).json({
      message: "Question removed successfully from assessment",
      updatedAssessment: assessment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const getDurationFromAssessment = async (req, res) => {
  const { assessmentId } = req.params;

  try {
    const assessment = await Assessment.findById(assessmentId).select(
      "duration"
    );

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    res.json({ duration: assessment.duration });
  } catch (error) {
    console.error("Error fetching assessment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getInstructionFromAssessment = async (req, res) => {
  const { assessmentId } = req.params;

  try {
    const assessment = await Assessment.findById(assessmentId).select(
      "instructions"
    );

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    res.json({ instructions: assessment.instructions });
  } catch (error) {
    console.error("Error fetching assessment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};