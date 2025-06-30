export const transformAssessmentData = (data) => {
  const transformedAssessment = {
    title: data.title || "Assessment",
    questions: (data.questions || []).map((question) => ({
      id: question._id || "",
      text: question.text || "",
      type: question.type || "",
      options: (question.options || []).map((option) => ({
        id: option._id || "",
        text: option.text || "",
      })),
    })),
  };

  const transformedQuestions = transformedAssessment.questions.map((question) =>
    question.options.map((option) => option.text)
  );

  return {
    transformedAssessment,
    transformedQuestions,
  };
};
