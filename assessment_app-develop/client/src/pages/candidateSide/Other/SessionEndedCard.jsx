import React from "react";
import { AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";

export const SessionEndedCard = ({ terminationReason = "UNKNOWN" }) => {
  const getTerminationMessage = (reason) => {
    switch (reason) {
      case "TAB_SWITCH":
        return "multiple tab switching attempts";
      case "NO_FACE":
        return "face not being detected in frame";
      case "MULTIPLE_FACES":
        return "multiple faces being detected";
      default:
        return "suspicious activity";
    }
  };

  return (
    <div className="fixed inset-0 bg-red-500/10 backdrop-blur flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 border-2 border-red-500 animate-in slide-in-from-top">
        <CardHeader>
          <CardTitle className="text-red-600 text-center text-2xl">
            Session Terminated
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
          <p className="text-center mb-4 text-lg text-red-700">
            Your session has been terminated due to{" "}
            {getTerminationMessage(terminationReason)}. Please contact your
            administrator for further assistance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
