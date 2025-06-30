import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/common/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/common/ui/alert";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { STORAGE_KEYS, validateMagicLink } from "@/lib/auth-utils";
import { SessionEndedCard } from "./Other/SessionEndedCard";

const VerificationPage = () => {
  const [verificationStatus, setVerificationStatus] = useState("pending");
  const [errorMessage, setErrorMessage] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const hasVerified = useRef(false);
  const terminationReason =
    location.state?.terminationReason ||
    localStorage.getItem(STORAGE_KEYS.SESSION_TERMINATION_REASON);

  useEffect(() => {
    if (location.state?.verificationStatus === "completed") {
      setVerificationStatus("completed");
      return;
    }
    const performVerification = async () => {
      if (hasVerified.current) return;
      hasVerified.current = true;

      try {
        const result = await validateMagicLink(token);
        console.log(result);
        if (result.success) {
          setVerificationStatus("success");

          setTimeout(() => {
            navigate("/candidate-dashboard", {
              state: {
                timeRemaining: result.timeRemaining,
                assessmentId: result.assessmentId,
              },
            });
          }, 2000);
        } else {
          setVerificationStatus("error");
          setErrorMessage(result.message);
        }
      } catch (error) {
        setVerificationStatus("error");
        setErrorMessage("An unexpected error occurred");
      }
    };
    if (token) {
      performVerification();
    }
  }, [token, navigate]);

  const renderContent = () => {
    switch (verificationStatus) {
      case "pending":
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Assessment Verification</CardTitle>
              <CardDescription>
                Verifying your assessment access...
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
              <p>Please wait while we verify your assessment link.</p>
            </CardContent>
          </Card>
        );

      case "success":
        return (
          <Card className="w-full max-w-md mx-auto border-green-500">
            <CardHeader>
              <CardTitle className="text-green-600">
                Verification Successful
              </CardTitle>
              <CardDescription>Assessment access granted!</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <p className="text-center mb-4">
                Redirecting to your assessment dashboard...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-600 h-2.5 rounded-full animate-pulse"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </CardContent>
          </Card>
        );

      case "error":
        return (
          <Card className="w-full max-w-md mx-auto border-red-500">
            <CardHeader>
              <CardTitle className="text-red-600">
                Verification Failed
              </CardTitle>
              <CardDescription>Unable to access assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case "completed":
        return (
          <Card className="w-full max-w-md mx-auto border-green-500">
            <CardHeader>
              <CardTitle className="text-green-600">Test Completed</CardTitle>
              <CardDescription>
                Thank you for completing the assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <p className="text-center mb-4">
                We will get back to you with feedback soon.
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-600 h-2.5 rounded-full animate-pulse"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  const shouldShowSessionEndedCard =
    terminationReason && verificationStatus !== "pending";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      {renderContent()}
      {shouldShowSessionEndedCard && (
        <SessionEndedCard terminationReason={terminationReason} />
      )}
    </div>
  );
};

export default VerificationPage;
