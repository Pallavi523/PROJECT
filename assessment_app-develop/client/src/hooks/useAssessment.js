import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCandidateData, clearCandidateData } from "@/lib/auth-utils";
import { createAssessmentRoom } from "@/services/apiService";
import api from "@/lib/api";

export const useAssessment = (assessmentId) => {
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSubmitScreen, setShowSubmitScreen] = useState(false);
  const [proctorStatus, setProctorStatus] = useState("pending");
  const [errorMessage, setErrorMessage] = useState("");
  const [candidateData, setCandidateData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [responses, setResponses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [roomDetails, setRoomDetails] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const fetchAssessment = async (currentAssessmentId) => {
    try {
      const response = await fetch(`${api}/assessment/${currentAssessmentId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch assessment");
      }

      const transformedAssessment = {
        title: data.title || "Assessment",
        questions: (data.questions || []).map((question) => ({
          id: question._id || "",
          text: question.text || "",
          type: question.type || "",
          options: (question.options || []).map((option) => ({
            id: option._id || "",
            text: option.text || "",
          })),
          correctOption: question.options.filter((option) => option.isCorrect == true)[0]?.text || "", 
          marks: question.marks || 1,
        })),
      };

      const transformedQuestions = transformedAssessment.questions.map(
        (question) => question.options.map((option) => option.text)
      );

      return {
        transformedAssessment,
        transformedQuestions,
      };
    } catch (error) {
      throw new Error(error.message || "Network error. Please try again.");
    }
  };
  const submitAssessment = async () => {
    try {
      setIsSubmitting(true);

      if (!candidateData) {
        throw new Error("No valid candidate found");
      }
      if (!startTime) {
        throw new Error("Start time not recorded");
      }

      const validResponses = responses.filter((response) => response !== null);
      console.log("Response: ", responses);
      console.log("Valid Response: ", validResponses);

      const testAttemptResponse = await fetch(
        `${api}/testAttempt/create-attempt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            candidateId: candidateData.candidateId,
            assessmentId: assessmentId,
            responses: validResponses,
            startTime: startTime,
            endTime: new Date().toISOString(),
          }),
        }
      );

      if (!testAttemptResponse.ok) {
        throw new Error("Failed to submit assessment");
      }

      if (roomDetails?.roomId) {
        await fetch(
          `${api}/websocket/room/${roomDetails.roomId}/candidate/${candidateData.candidateId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: "completed",
              attemptStatus: "COMPLETED",
            }),
          }
        );
      }

      clearCandidateData();
      navigate("/verify/completed", {
        state: {
          verificationStatus: "completed",
          message: "Assessment submitted successfully",
        },
      });
    } catch (error) {
      console.error("Submit error:", error);
      setProctorStatus("error");
      setErrorMessage(error.message || "Failed to submit assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerSave = (index, responseData) => {
    setResponses((prev) => {
      const newResponses = [...prev];
      newResponses[index] = responseData;
      return newResponses;
    });
  };

  useEffect(() => {
    const initializeAssessment = async () => {
      try {
        setIsLoading(true);
        const storedCandidateData = getCandidateData();
        const navigationState = location.state || {};

        if (!storedCandidateData || !assessmentId) {
          throw new Error("No valid assessment session found");
        }
        setStartTime(new Date().toISOString());

        const candidateInfo = {
          assessmentId: assessmentId,
          candidateId: storedCandidateData,
          timeRemaining: navigationState.timeRemaining || 30,
          email: "candidate@gmail.com",
          fullName: "CandidateName",
        };

        const [assessmentResponse, roomResponse] = await Promise.allSettled([
          fetchAssessment(assessmentId),
          createAssessmentRoom(
            candidateInfo.assessmentId,
            candidateInfo.candidateId
          ),
        ]);

        if (assessmentResponse.status === "rejected") {
          throw new Error("Failed to fetch assessment details");
        }

        if (roomResponse.status === "rejected") {
          throw new Error("Failed to create proctoring room");
        }

        setCandidateData(candidateInfo);
        setRoomDetails(roomResponse.value);

        const { transformedAssessment, transformedQuestions } =
          assessmentResponse.value;
        setAssessment(transformedAssessment);
        setQuestions(transformedQuestions);
        setProctorStatus("ready");
      } catch (error) {
        console.error("Initialization error:", error);
        setProctorStatus("error");
        setErrorMessage(error.message || "Unable to initialize assessment");
        navigate("/candidate-dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAssessment();
  }, [assessmentId, location.state, navigate]);

  return {
    assessment,
    questions,
    currentIndex,
    showSubmitScreen,
    proctorStatus,
    errorMessage,
    candidateData,
    isLoading,
    responses,
    isSubmitting,
    roomDetails,
    setProctorStatus,
    setCurrentIndex,
    setShowSubmitScreen,
    handleAnswerSave,
    submitAssessment,
  };
};
