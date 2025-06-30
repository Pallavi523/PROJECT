import React, { useState, useEffect } from "react";
import { Button } from "@/components/common/ui/button";
import MCQInput from "./QuestionInput/MCQInput";
import SubjectiveInput from "./QuestionInput/SubjectiveInput";
import CodingInput from "./QuestionInput/CodingInput";
import { QUESTION_TYPES } from "./assessmentConstants";
import { getWordCount, validateCodingAnswer } from "../../../utils/textUtils";

const QuestionResponse = ({
  question,
  currentIndex,
  totalQuestions,
  onNext,
  onPrevious,
  savedAnswer,
  onAnswerSave,
  isLastQuestion,
}) => {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [startTime] = useState(new Date());
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    let savedValue = "";
    if (savedAnswer) {
      switch (question?.type) {
        case QUESTION_TYPES.MCQ:
          savedValue = savedAnswer.mcqAnswer || "";
          break;
        case QUESTION_TYPES.SUBJECTIVE:
          savedValue = savedAnswer.subjectiveAnswer || "";
          break;
        case QUESTION_TYPES.CODING:
          savedValue = savedAnswer.codingAnswer || "";
          break;
        default:
          savedValue = "";
      }
    }

    setAnswer(savedValue);
    setIsSubmitted(!!savedValue);
    setError("");
  }, [question, savedAnswer]);

  const validateMCQAnswer = () => {
    if (!question.correctOption) return { isCorrect: false, marks: 0 };
    const isCorrect = answer === question.correctOption;
    const marks = isCorrect ? question.marks || 1 : 0;
    return { isCorrect, marks };
  };

  const validateAnswer = () => {
    if (!answer.trim() && !isSubmitted) {
      setError("Please provide an answer before proceeding.");
      return false;
    }

    if (question?.type === QUESTION_TYPES.SUBJECTIVE && answer.trim()) {
      const wordCount = getWordCount(answer);
      if (wordCount > 200) {
        setError(
          `Your answer exceeds 200 words (current: ${wordCount} words). Please shorten your response.`
        );
        return false;
      }
    }

    if (question?.type === QUESTION_TYPES.CODING && answer.trim()) {
      const codingError = validateCodingAnswer(answer);
      if (codingError) {
        setError(codingError);
        return false;
      }
    }

    return true;
  };

  const handleAnswerSubmit = () => {
    if (!validateAnswer()) return;

    const timeTaken = Math.floor((new Date() - startTime) / 1000);
    let marks = 0;

    if (question?.type === QUESTION_TYPES.MCQ) {
      const { marks: mcqMarks } = validateMCQAnswer();
      marks = mcqMarks;
    }

    const responseData = {
      questionId: question.id,
      question: question.text,
      subjectiveAnswer:
        question?.type === QUESTION_TYPES.SUBJECTIVE ? answer : null,
      mcqAnswer: question?.type === QUESTION_TYPES.MCQ ? answer : null,
      codingAnswer: question?.type === QUESTION_TYPES.CODING ? answer : null,
      timeTaken,
      marks,
    };

    console.log("question: ", question);
    console.log("Response Data: ", responseData);
    onAnswerSave(currentIndex, responseData);
    setIsSubmitted(true);
    setError("");
    onNext();
  };

  const renderAnswerInput = () => {
    switch (question?.type) {
      case QUESTION_TYPES.MCQ:
        return (
          <MCQInput
            options={question.options}
            answer={answer}
            onChange={(value) => {
              setAnswer(value);
              setError("");
            }}
          />
        );

      case QUESTION_TYPES.SUBJECTIVE:
        return (
          <SubjectiveInput
            answer={answer}
            onChange={(value) => {
              setAnswer(value);
              setError("");
            }}
          />
        );

      case QUESTION_TYPES.CODING:
        return (
          <CodingInput
            answer={answer}
            onChange={(value) => {
              setAnswer(value);
              setError("");
            }}
          />
        );

      default:
        return (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p>Unsupported question type: {question?.type}</p>
          </div>
        );
    }
  };

  if (!question) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p>Loading question...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium mb-2">
          Question {currentIndex + 1} of {totalQuestions}
        </h2>
        <p className="text-sm text-gray-500 mb-4">Type: {question.type}</p>
        <div className="prose max-w-none mb-4">
          <p className="text-gray-900">{question.text}</p>
        </div>
      </div>

      {renderAnswerInput()}

      {error && !isSubmitted && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={currentIndex === 0}
        >
          Previous
        </Button>
        <Button onClick={handleAnswerSubmit} className="min-w-[100px]">
          {isLastQuestion ? "Save & Review" : "Next"}
        </Button>
      </div>
    </div>
  );
};

export default QuestionResponse;
