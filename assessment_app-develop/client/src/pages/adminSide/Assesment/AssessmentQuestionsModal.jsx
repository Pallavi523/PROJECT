import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/common/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/common/ui/table";
import { Badge } from "@/components/common/ui/badge";
import { Loader2, FileQuestion } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

const QuestionTypeBadge = ({ type }) => {
  const badgeVariants = {
    MCQ: "bg-blue-100 text-blue-800",
    Subjective: "bg-green-100 text-green-800",
    Coding: "bg-purple-100 text-purple-800",
    default: "bg-gray-100 text-gray-800",
  };

  return (
    <Badge
      className={`${badgeVariants[type] || badgeVariants["default"]} px-2 py-1`}
    >
      {type}
    </Badge>
  );
};

const AssessmentQuestionsModal = ({ assessmentId, isOpen, onOpenChange }) => {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!assessmentId || !isOpen) return;

      setIsLoading(true);
      try {
        const response = await fetch(
          `${api}/assessment/${assessmentId}/questions`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch questions");
        }

        const data = await response.json();
        setQuestions(data.questions || []);
      } catch (error) {
        toast.error(error.message || "Unable to load questions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [assessmentId, isOpen]);

  const renderQuestionContent = (question) => {
    if (question.type === "MCQ") {
      return (
        <ul className="space-y-1 text-sm">
          {question.options.map((option, idx) => (
            <li
              key={idx}
              className={`
                p-2 rounded
                ${
                  option.isCorrect ? "bg-green-50 text-green-800" : "bg-gray-50"
                }
              `}
            >
              {option.text}
              {option.isCorrect && (
                <span className="ml-2 text-xs text-green-600">
                  (Correct Answer)
                </span>
              )}
            </li>
          ))}
        </ul>
      );
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileQuestion className="h-6 w-6" />
            Assessment Questions
          </DialogTitle>
          <DialogDescription>
            Total Questions: {questions.length}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto pr-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead className="w-1/2">Question</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question, index) => (
                  <TableRow key={question._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <p className="font-medium">{question.text}</p>
                        {renderQuestionContent(question)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <QuestionTypeBadge type={question.type} />
                    </TableCell>
                    <TableCell>{question.category}</TableCell>
                  </TableRow>
                ))}
                {questions.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-gray-500"
                    >
                      No questions found for this assessment
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AssessmentQuestionsModal;
