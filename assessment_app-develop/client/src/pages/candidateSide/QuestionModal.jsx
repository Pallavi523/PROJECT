import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/common/ui/dialog";
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import { Label } from "@/components/common/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import { Checkbox } from "@/components/common/ui/checkbox";
import { Toaster, toast } from "sonner";
import api from "@/lib/api";

const QuestionModal = ({
  assessmentId,
  isOpen,
  onOpenChange,
  onQuestionAdded,
  existingQuestions,
}) => {
  const [questionData, setQuestionData] = useState({
    text: "",
    type: "MCQ",
    category: "",
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
  });

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...questionData.options];
    if (field === "isCorrect") {
      if (value) {
        newOptions.forEach((opt, i) => {
          if (i !== index) opt.isCorrect = false;
        });
      }
      newOptions[index].isCorrect = value;
    } else {
      newOptions[index][field] = value;
    }
    setQuestionData((prev) => ({ ...prev, options: newOptions }));
  };

  const handleSubmit = async () => {
    if (!questionData.text.trim()) {
      toast.error("Question text is required");
      return;
    }

    const validOptions = questionData.options.filter((opt) => opt.text.trim());
    if (validOptions.length < 2) {
      toast.error("At least two options are required");
      return;
    }

    const hasCorrectOption = questionData.options.some((opt) => opt.isCorrect);
    if (!hasCorrectOption) {
      toast.error("Please mark at least one option as correct");
      return;
    }

    try {
      const response = await fetch(
        `${api}/assessment/${assessmentId}/question`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...questionData,
            options: validOptions,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add question");
      }

      const newQuestion = await response.json();

      setQuestionData({
        text: "",
        type: "MCQ",
        category: "",
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
      });

      onQuestionAdded(newQuestion);

      toast.success("Question added successfully!");
      onOpenChange(false);
    } catch (error) {
      toast.error(error.message || "Failed to add question");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Question</DialogTitle>
          <DialogDescription>
            Create a new question for this assessment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Question Text */}
          <div>
            <Label>Question Text</Label>
            <Input
              placeholder="Enter question text"
              value={questionData.text}
              onChange={(e) =>
                setQuestionData((prev) => ({
                  ...prev,
                  text: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <Label>Question Type</Label>
            <Select
              value={questionData.type}
              onValueChange={(value) =>
                setQuestionData((prev) => ({
                  ...prev,
                  type: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select question type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MCQ">Multiple Choice</SelectItem>
                <SelectItem value="CODING">Coding</SelectItem>
                <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Category</Label>
            <Input
              placeholder="Enter category (e.g., Core Java, React, etc.)"
              value={questionData.category}
              onChange={(e) =>
                setQuestionData((prev) => ({
                  ...prev,
                  category: e.target.value,
                }))
              }
            />
          </div>

          {questionData.type === "MCQ" && (
            <div className="space-y-2">
              <Label>Options</Label>
              {questionData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option.text}
                    onChange={(e) =>
                      handleOptionChange(index, "text", e.target.value)
                    }
                    className="flex-grow"
                  />
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={option.isCorrect}
                      onCheckedChange={(checked) =>
                        handleOptionChange(index, "isCorrect", checked)
                      }
                    />
                    <Label>Correct</Label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Question</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionModal;
