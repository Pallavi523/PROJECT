import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/common/ui/button";
import { Toaster, toast } from "sonner";
import api from "@/lib/api";
import AssessmentsTable from "./AssessmentsTable";
import CreateAssessmentModal from "./CreateAssessmentModal";
import EditAssessmentModal from "./EditAssessmentModal";
import AssessmentQuestionsModal from "./AssessmentQuestionsModal";
import QuestionManagementModal from "./QuestionManagementModel";
const Assessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [isQuestionManagementModalOpen, setIsQuestionManagementModalOpen] =
    useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [isDailogOpen, setIsDialogOpen] = useState(false);
  const [newAssessment, setNewAssessment] = useState({
    title: "",
    type: "",
    duration: 0,
    instructions: "",
    totalQuestions: 0,
    passingScore: 0,
  });
  const [candidateSchedule, setCandidateSchedule] = useState({
    assessmentId: "",
    fullName: "",
    email: "",
    scheduledStartTime: new Date(),
  });

  const fetchAllAssessments = async () => {
    try {
      const response = await fetch(`${api}/assessment/all`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch assessments");
      }
      const data = await response.json();
      setAssessments(data || []);
    } catch (error) {
      toast.error(error.message || "Failed to fetch assessments");
    }
  };

  useEffect(() => {
    fetchAllAssessments();
  }, []);

  const handleNewAssessmentChange = (field, value) => {
    setNewAssessment((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleSelectedAssessmentChange = (field, value) => {
    setSelectedAssessment((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateAssessment = async () => {
    try {
      const response = await fetch(`${api}/assessment/create-assessment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAssessment),
      });

      const createdAssessment = await response.json();
      setAssessments([...assessments, createdAssessment]);
      setIsCreateDialogOpen(false);

      setNewAssessment({
        title: "",
        type: "",
        duration: 0,
        instructions: "",
        totalQuestions: 0,
        passingScore: 0,
      });

      toast.success("Assessment created successfully!");
    } catch (error) {
      toast.error("Failed to create assessment");
    }
  };
  const handleScheduleCandidate = async () => {
    const { email, fullName, assessmentId, scheduledStartTime } =
      candidateSchedule;
    if (
      !scheduledStartTime ||
      !(scheduledStartTime instanceof Date) ||
      isNaN(scheduledStartTime)
    ) {
      toast.error("Invalid scheduled start time");
      return;
    }

    if (!email || !fullName || !assessmentId) {
      toast.error("Please fill in all required fields");
      return;
    }
    // if (!email || !/^[\w-]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    //   toast.error("Invalid email address");
    //   return;
    // }

    try {
      const response = await fetch(
        `${api}/assessment/candidates/schedule-test`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            fullName,
            assessmentId,
            scheduledStartTime: scheduledStartTime.toISOString(),
          }),
        }
      );
      const result = await response.json();
      console.log(result);
      toast.success(result.message);
      setIsDialogOpen(false);
      setCandidateSchedule({
        email: "",
        fullName: "",
        assessmentId: null,
        scheduledStartTime: new Date(),
      });
    } catch (error) {
      console.log(error);
      toast.error("Failed to schedule candidate");
    }
  };

  const handleUpdateAssessment = async (updatedAssessment) => {
    try {
      const response = await fetch(
        `${api}/assessment/${updatedAssessment._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedAssessment),
        }
      );

      if (!response.ok) throw new Error("Failed to update assessment");

      const serverUpdatedAssessment = await response.json();
      setAssessments(
        assessments.map((a) =>
          a._id === serverUpdatedAssessment._id ? serverUpdatedAssessment : a
        )
      );

      setSelectedAssessment(null);
      toast.success("Assessment updated successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to update assessment");
    }
  };

  const handleDeleteAssessment = async (id) => {
    try {
      const response = await fetch(`${api}/assessment/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete assessment");

      setAssessments(assessments.filter((a) => a._id !== id));
      toast.success("Assessment deleted successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to delete assessment");
    }
  };

  return (
    <div className="min-h-screen bg-blue-800">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
              <p className="text-sm text-gray-500 mt-1">
                Create and manage your assessment portfolio
              </p>
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" /> Create Assessment
            </Button>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm">
          <AssessmentsTable
            isOpen={isDailogOpen}
            assessments={assessments}
            onEditAssessment={setSelectedAssessment}
            onDeleteAssessment={handleDeleteAssessment}
            onScheduleCandidate={(params) => {
              if (params.openQuestionsModal) {
                setSelectedAssessmentId(params.assessmentId);
                setIsQuestionsModalOpen(true);
              } else if (params.openQuestionManagementModal) {
                setSelectedAssessmentId(params.assessmentId);
                setIsQuestionManagementModalOpen(true);
              } else {
                handleScheduleCandidate(params);
              }
            }}
            candidateSchedule={candidateSchedule}
            setCandidateSchedule={setCandidateSchedule}
          />
        </div>

        {/* Modals */}
        {selectedAssessmentId && (
          <AssessmentQuestionsModal
            assessmentId={selectedAssessmentId}
            isOpen={isQuestionsModalOpen}
            onOpenChange={(open) => setIsQuestionsModalOpen(open)}
          />
        )}
        {selectedAssessmentId && (
          <QuestionManagementModal
            assessmentId={selectedAssessmentId}
            isOpen={isQuestionManagementModalOpen}
            onOpenChange={(open) => setIsQuestionManagementModalOpen(open)}
          />
        )}
        <CreateAssessmentModal
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          newAssessment={newAssessment}
          onNewAssessmentChange={handleNewAssessmentChange}
          onCreateAssessment={handleCreateAssessment}
        />
        {selectedAssessment && (
          <EditAssessmentModal
            selectedAssessment={selectedAssessment}
            onSelectedAssessmentChange={handleSelectedAssessmentChange}
            onUpdateAssessment={() =>
              handleUpdateAssessment(selectedAssessment)
            }
            onClose={() => setSelectedAssessment(null)}
          />
        )}
      </div>
      <Toaster
        position="top-right"
        closeButton
        className="bg-white shadow-lg"
      />
    </div>
  );
};

export default Assessments;