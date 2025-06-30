export const getWordCount = (text) => {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
};

export const validateCodingAnswer = (code) => {
  if (!code.trim()) {
    return "Please provide your code solution.";
  }

  if (code.trim() && code.split("\n").length < 3) {
    return "Please provide a complete solution with proper structure.";
  }

  return "";
};
