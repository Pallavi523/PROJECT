import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import ProctorWindow from "../ProctorWindow";
import AssessmentContent from "./AssessmentContent/AssessmentContent";
import { useAssessment } from "@/hooks/useAssessment";
import Timer from "../Other/Timer";
import Instructions from "../Other/Instructions";
import api from "@/lib/api";
import { useTabLockService, TabSwitchWarning } from "@/services/TabLockService";
import { SessionEndedCard } from "../Other/SessionEndedCard";

const AssessmentPage = () => {
  const { assessmentId } = useParams();
  const [duration, setDuration] = useState(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const {
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
  } = useAssessment(assessmentId);
const {
  warnings,
  remainingWarnings,
  isSessionEnded,
  showWarningOverlay,
  hasInitialCheck,
} = useTabLockService({
  candidateId: candidateData?.candidateId,
  assessmentId,
});

useEffect(() => {
  const fetchDuration = async () => {
    try {
      const response = await fetch(
        `${api}/assessment/${assessmentId}/duration`
      );
      const data = await response.json();
      setDuration(data.duration); 
    } catch (error) {
      console.error("Error fetching duration:", error);
    }
  };

  fetchDuration();
}, [assessmentId]);

if ((isSessionEnded && hasInitialCheck && !isLoading) || isTimeUp) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
      <SessionEndedCard
        terminationReason={isTimeUp ? "TIME_UP" : "TAB_SWITCH"}
      />
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-indigo-900">
            {assessment ? assessment.title : "Assessment"}
          </h1>
        </div>

        <TabSwitchWarning
          warnings={warnings}
          remainingWarnings={remainingWarnings}
        />

        <div className="flex gap-6 relative">
          <div className="w-2/3 space-y-6">
            <Card className="border-none shadow-lg bg-white/90 backdrop-blur">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-xl text-indigo-800">
                  Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Instructions assessmentId={assessmentId} />
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/90 backdrop-blur">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-xl text-indigo-800">
                  Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <AssessmentContent
                  isLoading={isLoading}
                  proctorStatus={proctorStatus}
                  errorMessage={errorMessage}
                  assessment={assessment}
                  questions={questions}
                  showSubmitScreen={showSubmitScreen}
                  currentIndex={currentIndex}
                  responses={responses}
                  isSubmitting={isSubmitting}
                  onSubmit={submitAssessment}
                  onAnswerSave={handleAnswerSave}
                  setShowSubmitScreen={setShowSubmitScreen}
                  setCurrentIndex={setCurrentIndex}
                />
              </CardContent>
            </Card>
          </div>

          <div className="w-1/3">
            <div className="sticky top-4 space-y-4">
              {duration && candidateData?.candidateId && (
                <Card className="border-none shadow-lg bg-white/90 backdrop-blur">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-l text-indigo-800">
                      Time Remaining
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <Timer
                      durationInMinutes={duration}
                      candidateId={candidateData.candidateId}
                      assessmentId={assessmentId}
                    />
                  </CardContent>
                </Card>
              )}

              <Card className="border-none shadow-lg bg-white/90 backdrop-blur">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-xl text-indigo-800">
                    Proctoring
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <ProctorWindow
                    candidateId={candidateData?.candidateId}
                    assessmentId={candidateData?.assessmentId}
                    roomId={roomDetails?.roomId}
                    onProctorStatusChange={setProctorStatus}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentPage;
