import React from "react";
import { WORD_LIMIT } from "../assessmentConstants";
import { getWordCount } from "../../../../utils/textUtils";
import { toast } from "sonner";

const SubjectiveInput = ({ answer, onChange }) => {
  const handleSubjectiveInput = (text) => {
    const wordCount = getWordCount(text);
    if (wordCount <= WORD_LIMIT) {
      onChange(text);
    } else {
      toast.warning(`You cannot write more than ${WORD_LIMIT} words.`);
    }
  };

  return (
    <div className="space-y-2">
      <textarea
        className="w-full p-3 border rounded-md min-h-[200px] resize-y bg-gray-50"
        value={answer}
        onChange={(e) => handleSubjectiveInput(e.target.value)}
        placeholder={`Write your answer here (maximum ${WORD_LIMIT} words)...`}
        spellCheck={true}
      />
      <p className="text-sm text-gray-500">
        Words: {getWordCount(answer)} / {WORD_LIMIT}
      </p>
    </div>
  );
};

export default SubjectiveInput;
