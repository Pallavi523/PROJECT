import Response from "../models/response.js";


export const createResponse = async (req, res) => {
  try {
    const {
      questionId,
      question,
      subjectiveAnswer,
      mcqAnswer,
      codingAnswer,
      timeTaken,
    } = req.body;
    if (!(subjectiveAnswer || mcqAnswer || codingAnswer)) {
      return res
        .status(400)
        .json({ message: "One type of answer is required" });
    }
    if (timeTaken === undefined) {
      return res.status(400).json({ message: "Time taken is required" });
    }

    const newResponseData = {
      questions: questionId,
      question,
      timeTaken,
      subjectiveAnswer,
      mcqAnswer,
      codingAnswer,
    };

    const newResponse = new Response(newResponseData);
    const savedResponse = await newResponse.save();

    res.status(201).json({
      message: "Response created successfully",
      response: savedResponse,
    });
  } catch (error) {
    console.error("Error creating response:", error);
    res
      .status(500)
      .json({ message: "Error creating response", error: error.message });
  }
};


export const getResponseById = async (req, res) => {
  try {
    const response = await Response.findById(req.params.id).populate(
      "questions"
    );
    if (!response) {
      return res.status(404).json({ message: "Response not found" });
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error retrieving response:", error);
    res
      .status(500)
      .json({ message: "Error retrieving response", error: error.message });
  }
};
export const updateResponseById = async (req, res) => {
  try {
    const { subjectiveAnswer, mcqAnswer, codingAnswer, timeTaken, marks } =
      req.body;

    const updatedData = {
      ...(subjectiveAnswer && { subjectiveAnswer }),
      ...(mcqAnswer && { mcqAnswer }),
      ...(codingAnswer && { codingAnswer }),
      ...(timeTaken !== undefined && { timeTaken }),
      ...(marks !== undefined && { marks }),
    };

    const updatedResponse = await Response.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    if (!updatedResponse) {
      return res.status(404).json({ message: "Response not found" });
    }

    res.status(200).json({
      message: "Response updated successfully",
      response: updatedResponse,
    });
  } catch (error) {
    console.error("Error updating response:", error);
    res
      .status(500)
      .json({ message: "Error updating response", error: error.message });
  }
};
export const deleteResponseById = async (req, res) => {
  try {
    const deletedResponse = await Response.findByIdAndDelete(req.params.id);

    if (!deletedResponse) {
      return res.status(404).json({ message: "Response not found" });
    }

    res.status(200).json({ message: "Response deleted successfully" });
  } catch (error) {
    console.error("Error deleting response:", error);
    res
      .status(500)
      .json({ message: "Error deleting response", error: error.message });
  }
};
export const getAllResponses = async (req, res) => {
  try {
    const responses = await Response.find().populate("questions");
    res.status(200).json(responses);
  } catch (error) {
    console.error("Error retrieving responses:", error);
    res
      .status(500)
      .json({ message: "Error retrieving responses", error: error.message });
  }
};
export const uploadMarks = async (req, res) => {
  try {
    const { responseId, marks } = req.body;

    if (!responseId) {
      return res.status(400).json({ message: "Response ID is required" });
    }
    if (marks === undefined || typeof marks !== "number") {
      return res
        .status(400)
        .json({ message: "Marks should be a valid number" });
    }
    const updatedResponse = await Response.findByIdAndUpdate(
      responseId,
      { marks },
      { new: true }
    );

    if (!updatedResponse) {
      return res.status(404).json({ message: "Response not found" });
    }

    res.status(200).json({
      message: "Marks updated successfully",
      response: updatedResponse,
    });
  } catch (error) {
    console.error("Error updating marks:", error);
    res
      .status(500)
      .json({ message: "Error updating marks", error: error.message });
  }
};
