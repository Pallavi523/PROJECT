import Question from "../models/question.js";

export const createQuestion = async (req, res) => {
  try {
    const { text, options, type, category } = req.body;
    const newQuestion = new Question({ text, options, type, category });
    const savedQuestion = await newQuestion.save();
    res.status(201).json(savedQuestion);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create question", error: error.message });
  }
};

export const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    res.status(200).json(questions);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve questions", error: error.message });
  }
};

export const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question)
      return res.status(404).json({ message: "Question not found" });
    res.status(200).json(question);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve question", error: error.message });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { text, options, type, category } = req.body;
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      { text, options, type, category },
      { new: true, runValidators: true }
    );
    if (!updatedQuestion)
      return res.status(404).json({ message: "Question not found" });
    res.status(200).json(updatedQuestion);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update question", error: error.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
    if (!deletedQuestion)
      return res.status(404).json({ message: "Question not found" });
    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete question", error: error.message });
  }
};
export const getQuestionsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const questions = await Question.find({ category });

    if (!questions.length) {
      return res
        .status(404)
        .json({ message: "No questions found for this category" });
    }

    res.status(200).json({ questions });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch questions", error: error.message });
  }
};

export const getQuestionsByType = async (req, res) => {
  try {
    const { type } = req.params;

    const questions = await Question.find({ type });

    if (!questions.length) {
      return res
        .status(404)
        .json({ message: "No questions found for this type" });
    }

    res.status(200).json({ questions });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch questions", error: error.message });
  }
};
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Question.distinct("category");

    if (!categories.length) {
      return res.status(404).json({ message: "No categories found" });
    }

    res.status(200).json({ categories });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch categories", error: error.message });
  }
};

export const getQuestionsByCategoryAndType = async (req, res) => {
  try {
    const { category, type } = req.query;

    // Build filter object dynamically
    const filter = {};
    if (category) filter.category = category;
    if (type) filter.type = type;

    // Find questions based on the filter
    const questions = await Question.find(filter);

    if (!questions.length) {
      return res
        .status(404)
        .json({ message: "No questions found for the specified filters" });
    }

    res.status(200).json({ questions });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to fetch questions", error: error.message });
  }
};
