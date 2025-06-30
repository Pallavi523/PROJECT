import React from "react";

const MCQInput = ({ options, answer, onChange }) => {
  return (
    <div className="space-y-2">
      {options.map((option, idx) => (
        <div
          key={idx}
          className={`p-3 rounded-md cursor-pointer ${
            answer === option.text
              ? "bg-blue-100 text-blue-600 border-2 border-blue-500"
              : "hover:bg-gray-100 border border-gray-200"
          }`}
          onClick={() => onChange(option.text)}
        >
          {option.text}
        </div>
      ))}
    </div>
  );
};

export default MCQInput;
