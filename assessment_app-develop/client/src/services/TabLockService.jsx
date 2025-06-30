import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/common/ui/alert";
import { AlertTriangle } from "lucide-react";
import api from "@/lib/api";
import { STORAGE_KEYS } from "@/lib/auth-utils";
import { SessionEndedCard } from "@/pages/candidateSide/Other/SessionEndedCard";

export const useTabLockService = ({ candidateId, assessmentId }) => {
  const [warnings, setWarnings] = useState(0);
  const [isSessionEnded, setIsSessionEnded] = useState(false);
  const [showWarningOverlay, setShowWarningOverlay] = useState(false);
  const [hasInitialCheck, setHasInitialCheck] = useState(false);
  const navigate = useNavigate();
 
  useEffect(() => {
    const checkSessionStatus = () => {
      const sessionTimeout = localStorage.getItem(STORAGE_KEYS.SESSION_TIMEOUT);
      const timeoutTimestamp = localStorage.getItem(
        STORAGE_KEYS.SESSION_TIMEOUT_TIMESTAMP
      );
 
      if (!sessionTimeout || !timeoutTimestamp) {
        setIsSessionEnded(false);
        setHasInitialCheck(true);
        return;
      }

      const hasTimedOut = Date.now() > parseInt(timeoutTimestamp);

      if (!hasTimedOut) { 
        localStorage.removeItem(STORAGE_KEYS.SESSION_TIMEOUT);
        localStorage.removeItem(STORAGE_KEYS.SESSION_TIMEOUT_TIMESTAMP);
        localStorage.removeItem(STORAGE_KEYS.SESSION_TERMINATION_REASON);
        setIsSessionEnded(false);
      } else {
        setIsSessionEnded(true);
      }
      setHasInitialCheck(true);
    };

    const timer = setTimeout(() => {
      checkSessionStatus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);
  const handleSessionTermination = async () => {
    try {
      await fetch(`${api}/candidates/proctor-warnings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assessmentId,
          candidateId,
          attemptStatus: "SESSION_OUT",
          warningType: "TAB_SWITCH",
          message: "Session terminated due to three tab switch violations",
          timestamp: new Date().toISOString(),
          warningCount: warnings + 1,
        }),
      });

      const timeoutDurationInMs = 30 * 60 * 1000;
      const timeoutTimestamp = Date.now() + timeoutDurationInMs;
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem(STORAGE_KEYS.SESSION_TIMEOUT, "true");
      localStorage.setItem(
        STORAGE_KEYS.SESSION_TIMEOUT_TIMESTAMP,
        timeoutTimestamp.toString()
      );
      localStorage.setItem(
        STORAGE_KEYS.SESSION_TERMINATION_REASON,
        "TAB_SWITCH"
      );
      setIsSessionEnded(true);
      window.location.reload();
    } catch (error) {
      console.error("Failed to handle session termination:", error);
      navigate("/verification", {
        state: {
          verificationStatus: "session-ended",
          terminationReason: "TAB_SWITCH",
        },
      });
    }
  };

  useEffect(() => {
    let hidden, visibilityChange;
    if (typeof document.hidden !== "undefined") {
      hidden = "hidden";
      visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
      hidden = "msHidden";
      visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
      hidden = "webkitHidden";
      visibilityChange = "webkitvisibilitychange";
    }

    const handleVisibilityChange = async () => {
      if (document[hidden]) {
        const newWarningCount = warnings + 1;

        if (newWarningCount === 3) {
          await handleSessionTermination();
          setIsSessionEnded(true);
          setWarnings(newWarningCount);
        } else if (newWarningCount < 3) {
          setWarnings(newWarningCount);
          setShowWarningOverlay(true);
          setTimeout(() => {
            setShowWarningOverlay(false);
          }, 3000);
        }
      }
    };

    document.addEventListener(visibilityChange, handleVisibilityChange);

    return () => {
      document.removeEventListener(visibilityChange, handleVisibilityChange);
    };
  }, [warnings, navigate, candidateId, assessmentId]);

  return {
    warnings,
    remainingWarnings: 3 - warnings,
    isSessionEnded,
    showWarningOverlay,
    hasInitialCheck,
  };
};

export const TabSwitchWarning = ({ warnings, remainingWarnings }) => {
  if (warnings === 0) return null;

  return (
    <Alert variant="destructive" className="mb-4 border-red-500 animate-pulse">
      <AlertTriangle className="h-5 w-5 text-red-500" />
      <AlertTitle className="text-red-500">Tab Switch Warning</AlertTitle>
      <AlertDescription className="text-red-700">
        You have switched tabs {warnings} time{warnings > 1 ? "s" : ""}.
        {remainingWarnings > 0
          ? ` ${remainingWarnings} more attempt${
              remainingWarnings > 1 ? "s" : ""
            } will result in automatic session termination.`
          : " Your session will be terminated."}
      </AlertDescription>
    </Alert>
  );
};

export const WarningOverlay = ({ warnings, remainingWarnings, show }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-red-500/20 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4 border-2 border-red-500 animate-bounce">
        <div className="flex items-center justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-red-600 text-center mb-2">
          Warning: Tab Switch Detected
        </h2>
        <p className="text-red-700 text-center">
          You have switched tabs {warnings} time{warnings > 1 ? "s" : ""}.
          {remainingWarnings > 0
            ? ` ${remainingWarnings} more attempt${
                remainingWarnings > 1 ? "s" : ""
              } will result in automatic session termination.`
            : " Your session will be terminated."}
        </p>
      </div>
    </div>
  );
};
