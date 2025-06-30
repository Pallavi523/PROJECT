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
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import { Loader2, Trash2, Plus, Filter, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Checkbox } from "@/components/common/ui/checkbox";

const QuestionManagementModal = ({ assessmentId, isOpen, onOpenChange }) => {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
 
  const [allQuestions, setAllQuestions] = useState([]);
  const [isSelectingQuestions, setIsSelectingQuestions] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [allQuestionsFilters, setAllQuestionsFilters] = useState({
    type: null,
    category: null,
  });

  const [filters, setFilters] = useState({
    type: null,
    category: null,
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    text: "",
    type: null,
    category: null,
    options: [{ text: "", isCorrect: false }],
  });
  const fetchQuestionsAndCategories = async () => {
    if (!assessmentId || !isOpen) return;

    setIsLoading(true);
    try {
      const categoriesResponse = await fetch(`${api}/question/categories`);
      const categoriesData = await categoriesResponse.json();
      setCategories(categoriesData.categories || []);

      const questionsResponse = await fetch(
        `${api}/assessment/${assessmentId}/questions`
      );
      const questionsData = await questionsResponse.json();
      setQuestions(questionsData.questions || []);
    } catch (error) {
      toast.error(error.message || "Unable to load data");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchQuestionsAndCategories();
  }, [assessmentId, isOpen]);

  const fetchFilteredQuestions = async () => {
    setIsLoading(true);
    try {
      let response;

      if (filters.type && !filters.category) {
        response = await fetch(`${api}/question/type/${filters.type}`);
      } else if (filters.category && !filters.type) {
        response = await fetch(`${api}/question/category/${filters.category}`);
      } else if (filters.type && filters.category) {
        response = await fetch(
          `${api}/question/filter?type=${filters.type}&category=${filters.category}`
        );
      } else {
        response = await fetch(`${api}/assessment/${assessmentId}/questions`);
      }

      if (!response.ok) {
        throw new Error("Failed to fetch filtered questions");
      }

      const data = await response.json();

      setQuestions(data.questions || data || []);
    } catch (error) {
      toast.error(error.message || "Unable to load filtered questions");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllQuestions = async () => {
    setIsLoading(true);
    try {
      let url = `${api}/question/filter`;
      const params = new URLSearchParams();

      if (allQuestionsFilters.type) {
        params.append("type", allQuestionsFilters.type);
      }
      if (allQuestionsFilters.category) {
        params.append("category", allQuestionsFilters.category);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("No questions found for the specified filter");
      }

      const data = await response.json();
      setAllQuestions(data.questions || data || []);
    } catch (error) {
      toast.error(error.message || "Unable to load all questions");
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger all questions fetch when selecting questions or changing filters
  useEffect(() => {
    if (isSelectingQuestions) {
      fetchAllQuestions();
    }
  }, [isSelectingQuestions, allQuestionsFilters]);

  useEffect(() => {
    if (filters.type || filters.category) {
      fetchFilteredQuestions();
    }
  }, [filters]);

  const handleAddQuestion = async () => {
    if (
      !currentQuestion.text ||
      !currentQuestion.type ||
      !currentQuestion.category
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (currentQuestion.type === "MCQ") {
      const validOptions = currentQuestion.options.filter(
        (opt) => opt.text.trim() !== ""
      );
      if (validOptions.length < 2) {
        toast.error(
          "Please add at least two options for Multiple Choice Question"
        );
        return;
      }

      const correctOptions = validOptions.filter((opt) => opt.isCorrect);
      if (correctOptions.length === 0) {
        toast.error("Please select a correct option");
        return;
      }
    }

    try {
      const response = await fetch(
        `${api}/assessment/${assessmentId}/question`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...currentQuestion,
            options:
              currentQuestion.type === "MCQ"
                ? currentQuestion.options.filter(
                    (opt) => opt.text.trim() !== ""
                  )
                : [],
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to add question");

      const newQuestion = await response.json();
      setQuestions([...questions, newQuestion]);

      setCurrentQuestion({
        text: "",
        type: currentQuestion.type,
        category: currentQuestion.category,
        options: [{ text: "", isCorrect: false }],
      });

      toast.success("Question added successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to add question");
    }
  };

  const handleAddSelectedQuestions = async () => {
    if (selectedQuestions.length === 0) {
      toast.error("Please select at least one question");
      return;
    }

    try {
      const response = await fetch(
        `${api}/assessment/${assessmentId}/questions/bulk-add`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionIds: selectedQuestions,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to add selected questions");

      const data = await response.json();
      setQuestions([...questions, ...data.addedQuestions]);
      setIsSelectingQuestions(false);
      setSelectedQuestions([]);
      toast.success(
        `${data.addedQuestions.length} questions added successfully!`
      );

      fetchQuestionsAndCategories();
    } catch (error) {
      toast.error(error.message || "Failed to add selected questions");
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      const response = await fetch(
        `${api}/assessment/${assessmentId}/question/${questionId}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Failed to delete question");

      setQuestions(questions.filter((q) => q._id !== questionId));
      toast.success("Question deleted successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to delete question");
    }
  };

  const renderQuestionForm = () => (
    <div className="space-y-4">
      <Select
        value={currentQuestion.type || ""}
        onValueChange={(value) =>
          setCurrentQuestion((prev) => ({
            ...prev,
            type: value,
            options: value === "MCQ" ? [{ text: "", isCorrect: false }] : [],
          }))
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Question Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="MCQ">Multiple Choice</SelectItem>
          <SelectItem value="Subjective">Subjective</SelectItem>
          <SelectItem value="Coding">Coding</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={currentQuestion.category || ""}
        onValueChange={(value) =>
          setCurrentQuestion((prev) => ({
            ...prev,
            category: value,
          }))
        }
        disabled={!currentQuestion.type}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        placeholder="Question Text"
        value={currentQuestion.text}
        onChange={(e) =>
          setCurrentQuestion((prev) => ({
            ...prev,
            text: e.target.value,
          }))
        }
        disabled={!currentQuestion.category}
      />

      {currentQuestion.type === "MCQ" && currentQuestion.text && (
        <div className="space-y-2">
          {currentQuestion.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                placeholder={`Option ${index + 1}`}
                value={option.text}
                onChange={(e) => {
                  const newOptions = [...currentQuestion.options];
                  newOptions[index].text = e.target.value;
                  setCurrentQuestion((prev) => ({
                    ...prev,
                    options: newOptions,
                  }));
                }}
              />
              <input
                type="checkbox"
                checked={option.isCorrect}
                onChange={() => {
                  const newOptions = currentQuestion.options.map(
                    (opt, idx) => ({
                      ...opt,
                      isCorrect: idx === index,
                    })
                  );
                  setCurrentQuestion((prev) => ({
                    ...prev,
                    options: newOptions,
                  }));
                }}
              />
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() =>
              setCurrentQuestion((prev) => ({
                ...prev,
                options: [...prev.options, { text: "", isCorrect: false }],
              }))
            }
          >
            Add Option
          </Button>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => {
            setIsEditing(false);
            setCurrentQuestion({
              text: "",
              type: null,
              category: null,
              options: [{ text: "", isCorrect: false }],
            });
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleAddQuestion}
          disabled={
            !currentQuestion.text ||
            !currentQuestion.type ||
            !currentQuestion.category
          }
        >
          Add Question
        </Button>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="flex space-x-4 mb-4">
      <Select
        value={filters.type ?? "ALL_TYPES"}
        onValueChange={(value) =>
          setFilters((prev) => ({
            ...prev,
            type: value === "ALL_TYPES" ? null : value,
          }))
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL_TYPES">All Types</SelectItem>
          <SelectItem value="MCQ">Multiple Choice</SelectItem>
          <SelectItem value="Subjective">Subjective</SelectItem>
          <SelectItem value="Coding">Coding</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        onClick={() => {
          setFilters({ type: null, category: null });
          fetchFilteredQuestions();
        }}
      >
        <Filter className="mr-2 h-4 w-4" /> Clear Filters
      </Button>

      <Button variant="secondary" onClick={() => setIsSelectingQuestions(true)}>
        <PlusCircle className="mr-2 h-4 w-4" /> Select Questions
      </Button>
    </div>
  );
  const renderSelectQuestionsModal = () => (
    <Dialog
      open={isSelectingQuestions}
      onOpenChange={(open) => {
        setIsSelectingQuestions(open);
        if (!open) {
          setAllQuestionsFilters({ type: null, category: null });
          setSelectedQuestions([]);
        }
      }}
    >
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Select Questions</DialogTitle>
          <DialogDescription>
            Select questions to add to this assessment
          </DialogDescription>
        </DialogHeader>

        <div className="flex space-x-4 mb-4">
          <Select
            value={allQuestionsFilters.type ?? "ALL_TYPES"}
            onValueChange={(value) =>
              setAllQuestionsFilters((prev) => ({
                ...prev,
                type: value === "ALL_TYPES" ? null : value,
              }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL_TYPES">All Types</SelectItem>
              <SelectItem value="MCQ">Multiple Choice</SelectItem>
              <SelectItem value="Subjective">Subjective</SelectItem>
              <SelectItem value="Coding">Coding</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={allQuestionsFilters.category ?? "ALL_CATEGORIES"}
            onValueChange={(value) =>
              setAllQuestionsFilters((prev) => ({
                ...prev,
                category: value === "ALL_CATEGORIES" ? null : value,
              }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL_CATEGORIES">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setAllQuestionsFilters({ type: null, category: null });
            }}
          >
            <Filter className="mr-2 h-4 w-4" /> Clear Filters
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto pr-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Checkbox
                      checked={
                        selectedQuestions.length === allQuestions.length &&
                        allQuestions.length > 0
                      }
                      onCheckedChange={(checked) => {
                        setSelectedQuestions(
                          checked ? allQuestions.map((q) => q._id) : []
                        );
                      }}
                    />
                  </TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allQuestions.map((question) => (
                  <TableRow key={question._id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedQuestions.includes(question._id)}
                        onCheckedChange={(checked) => {
                          setSelectedQuestions((prev) =>
                            checked
                              ? [...prev, question._id]
                              : prev.filter((id) => id !== question._id)
                          );
                        }}
                      />
                    </TableCell>
                    <TableCell>{question.text}</TableCell>
                    <TableCell>{question.type}</TableCell>
                    <TableCell>{question.category}</TableCell>
                  </TableRow>
                ))}
                {allQuestions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No questions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                {selectedQuestions.length} question(s) selected
              </div>
              <Button
                onClick={handleAddSelectedQuestions}
                disabled={selectedQuestions.length === 0}
              >
                Add Selected Questions
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Manage Assessment Questions</DialogTitle>
            <DialogDescription>
              Add, filter, or remove questions for this assessment
            </DialogDescription>
          </DialogHeader>

          {/* Question Form */}
          <div className="mb-4">
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add New Question
              </Button>
            )}
            {isEditing && renderQuestionForm()}
          </div>

          {renderFilters()}

          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="max-h-[320px] overflow-y-auto pr-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((question) => (
                    <TableRow key={question._id}>
                      <TableCell>{question.text}</TableCell>
                      <TableCell>{question.type}</TableCell>
                      <TableCell>{question.category}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteQuestion(question._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {questions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No questions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {renderSelectQuestionsModal()}
    </>
  );
};

export default QuestionManagementModal;
