import api from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";
const useQuestions = () => {
  const [questions, setQuestions] = useState([]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${api}/question/get-all-question`);
      if (!response.ok)
        throw new Error((await response.text()) || "Failed to fetch questions");
      const data = await response.json();
      setQuestions(data || []);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const createQuestion = async (question) => {
    try {
      const response = await fetch(`${api}/question/create-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(question),
      });
      if (!response.ok) throw new Error("Failed to create question");
      const created = await response.json();
      setQuestions((prev) => [...prev, created]);
      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  };

  const updateQuestion = async (question) => {
    try {
      const response = await fetch(
        `${api}/question/update-question/${question._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(question),
        }
      );
      if (!response.ok) throw new Error("Failed to update question");
      const updated = await response.json();
      setQuestions((prev) =>
        prev.map((q) => (q._id === updated._id ? updated : q))
      );
      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  };

  const deleteQuestion = async (id) => {
    try {
      const response = await fetch(`${api}/question/delete-question/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete question");
      setQuestions((prev) => prev.filter((q) => q._id !== id));
      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  };

  return {
    questions,
    fetchQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
  };
};
export default useQuestions;
