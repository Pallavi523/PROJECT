import React from "react";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import QuestionResponse from "../QuestionResponse";
import SubmitScreen from "../SubmitScreen/SubmitScreen";
import { PROCTOR_STATUS } from "../assessmentConstants";

const AssessmentContent = ({
  isLoading,
  proctorStatus,
  errorMessage,
  assessment,
  questions,
  showSubmitScreen,
  currentIndex,
  responses,
  isSubmitting,
  onSubmit,
  onAnswerSave,
  setShowSubmitScreen,
  setCurrentIndex,
}) => {
  if (isLoading) {
    return <LoadingState />;
  }

  if (proctorStatus === PROCTOR_STATUS.ERROR) {
    return <ErrorState message={errorMessage} />;
  }

  if (!assessment || questions.length === 0) {
    return <p>No questions available for this assessment.</p>;
  }

  if (showSubmitScreen) {
    return (
      <SubmitScreen
        totalQuestions={questions.length}
        answeredQuestions={responses.filter((r) => r !== null).length}
        onReview={() => {
          setShowSubmitScreen(false);
          setCurrentIndex(questions.length - 1);
        }}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
      />
    );
  }

  return (
    <QuestionResponse
      question={assessment.questions[currentIndex]}
      currentIndex={currentIndex}
      totalQuestions={questions.length}
      onNext={() => {
        if (currentIndex === questions.length - 1) {
          setShowSubmitScreen(true);
        } else {
          setCurrentIndex((prev) => prev + 1);
        }
      }}
      onPrevious={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev))}
      savedAnswer={responses[currentIndex]}
      onAnswerSave={onAnswerSave}
      isLastQuestion={currentIndex === questions.length - 1}
    />
  );
};

export default AssessmentContent;
