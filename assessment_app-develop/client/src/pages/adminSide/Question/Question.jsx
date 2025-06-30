import React, { useState, useEffect, memo } from "react";
import { Plus } from "lucide-react";
import { toast, Toaster } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/common/ui/dialog";
import { Button } from "@/components/common/ui/button";
import useQuestions from "@/hooks/useQuestion.js";
import QuestionForm from "./QuestionFrom";
import { CATEGORIES, QUESTION_TYPES } from "./QuestionTypes";
import QuestionsTable from "./QuestionTable";

const Questions = () => {
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    options: [],
    type: QUESTION_TYPES.MCQ,
    category: CATEGORIES.OTHER,
  });
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const {
    questions,
    fetchQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
  } = useQuestions();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleCreateQuestion = async () => {
    if (await createQuestion(newQuestion)) {
      setNewQuestion({
        text: "",
        options: [],
        type: QUESTION_TYPES.MCQ,
        category: CATEGORIES.OTHER,
      });
      setIsCreateDialogOpen(false);
      toast.success("Question created successfully!");
    }
  };

  const handleEditQuestion = async () => {
    if (await updateQuestion(editingQuestion)) {
      setEditingQuestion(null);
      setIsEditDialogOpen(false);
      toast.success("Question updated successfully!");
    }
  };

  const handleStartEdit = (question) => {
    setEditingQuestion({ ...question });
    setIsEditDialogOpen(true);
  };

  const resetDialogs = () => {
    setNewQuestion({
      text: "",
      options: [],
      type: QUESTION_TYPES.MCQ,
      category: CATEGORIES.OTHER,
    });
    setEditingQuestion(null);
  };

  return (
    <div className="min-h-screen bg-blue-800">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Questions</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage and organize your question bank
              </p>
            </div>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" /> Create Question
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <QuestionForm
                  question={newQuestion}
                  onChange={setNewQuestion}
                  onSubmit={handleCreateQuestion}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <QuestionsTable
            questions={questions}
            onEdit={handleStartEdit}
            onDelete={deleteQuestion}
          />
        </div>

        <Dialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) resetDialogs();
          }}
        >
          <DialogContent className="max-w-xl">
            {editingQuestion && (
              <QuestionForm
                question={editingQuestion}
                onChange={setEditingQuestion}
                onSubmit={handleEditQuestion}
                type="edit"
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
      <Toaster
        position="top-right"
        closeButton
        className="bg-white shadow-lg"
      />
    </div>
  );
};

export default Questions;
