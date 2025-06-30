import React from "react";
import { PlusCircle } from "lucide-react";
import { DialogFooter } from "@/components/common/ui/dialog";
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import { Label } from "@/components/common/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/common/ui/select";
import { RadioGroup } from "@/components/common/ui/radio-group";
import { CATEGORIES, QUESTION_TYPES } from "./QuestionTypes";
import MCQOption from "./MCQOption";

const QuestionForm = ({ question, onChange, onSubmit, type = "create" }) => {
  const handleOptionChange = (index, field, value) => {
    const newOptions = question.options.map((opt, i) => ({
      ...opt,
      isCorrect: field === "isCorrect" ? i === index : opt.isCorrect,
    }));
    if (field !== "isCorrect") {
      newOptions[index] = { ...newOptions[index], [field]: value };
    }
    onChange({ ...question, options: newOptions });
  };

  const handleAddOption = () => {
    onChange({
      ...question,
      options: [...question.options, { text: "", isCorrect: false }],
    });
  };

  return (
    <div className="space-y-4 p-6">
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {type === "create" ? "Create New" : "Edit"} Question
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Fill in the details below to {type === "create" ? "create" : "update"}{" "}
          your question
        </p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="text" className="block text-sm font-medium">
            Question Text
          </Label>
          <Input
            id="text"
            value={question.text}
            onChange={(e) => onChange({ ...question, text: e.target.value })}
            className="w-full"
            placeholder="Enter your question here"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="type" className="block text-sm font-medium">
              Question Type
            </Label>
            <Select
              value={question.type}
              onValueChange={(value) =>
                onChange({
                  ...question,
                  type: value,
                  options: value === QUESTION_TYPES.MCQ ? question.options : [],
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Question Type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(QUESTION_TYPES).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="block text-sm font-medium">
              Category
            </Label>
            <Select
              value={question.category}
              onValueChange={(value) =>
                onChange({ ...question, category: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORIES).map(([key, value]) => (
                  <SelectItem key={key} value={value}>
                    {value.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {question.type === QUESTION_TYPES.MCQ && (
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">
                Multiple Choice Options
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                className="hover:bg-gray-100"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Option
              </Button>
            </div>
            <div className="max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <RadioGroup
                value={question.options
                  .findIndex((opt) => opt.isCorrect)
                  .toString()}
                className="space-y-3"
              >
                {question.options.map((option, index) => (
                  <MCQOption
                    key={index}
                    option={option}
                    index={index}
                    onOptionChange={handleOptionChange}
                    onRemove={(index) =>
                      onChange({
                        ...question,
                        options: question.options.filter((_, i) => i !== index),
                      })
                    }
                  />
                ))}
              </RadioGroup>
            </div>
          </div>
        )}
      </div>

      <DialogFooter className="mt-6 pt-4 border-t">
        <Button onClick={onSubmit} className="w-full md:w-auto">
          {type === "create" ? "Create" : "Update"} Question
        </Button>
      </DialogFooter>
    </div>
  );
};

export default QuestionForm;
