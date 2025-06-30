import React, { useState, useEffect, useRef } from "react";
import { AlertTriangle, Clock, Video, XCircle } from "lucide-react";
import { Button } from "@/components/common/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/common/ui/alert";
import WebSocketService from "@/services/webSocketService";
import faceDetectionService from "@/services/faceDetectionService";
import api from "@/lib/api";
import { STORAGE_KEYS } from "@/lib/auth-utils";
import { SessionEndedCard } from "./Other/SessionEndedCard";
const ProctorWindow = ({
  candidateId,
  assessmentId,
  roomId,
  onProctorStatusChange,
}) => {
  const [proctorStatus, setProctorStatus] = useState("pending");
  const [errorMessage, setErrorMessage] = useState("");
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const videoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [hasMediaPermissions, setHasMediaPermissions] = useState(false);
  const [faceDetectionActive, setFaceDetectionActive] = useState(false);
  const [currentWarning, setCurrentWarning] = useState(null);
  const [warningCount, setWarningCount] = useState(0);

  let logSequence = 0;
  const handleFaceDetectionWarning = async (warning) => {
    setCurrentWarning(warning);
    setWarningCount(warning.warningCount);

    if (warning.warningCount === 500) {
      try {
        await fetch(`${api}/candidates/proctor-warnings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            candidateId,
            assessmentId,
            attemptStatus: "SESSION_OUT",
            warningType: warning.type,
            message: warning.message,
            timestamp: new Date().toISOString(),
            warningCount: warning.warningCount,
          }),
        });
        setProctorStatus("session_out");
        onProctorStatusChange("session_out");
        localStorage.clear();
        sessionStorage.clear();
        const timeoutDurationInMs = 30 * 60 * 1000;
        const timeoutTimestamp = Date.now() + timeoutDurationInMs;

        localStorage.setItem(STORAGE_KEYS.SESSION_TIMEOUT, "true");
        localStorage.setItem(
          STORAGE_KEYS.SESSION_TIMEOUT_TIMESTAMP,
          timeoutTimestamp.toString()
        );
        localStorage.setItem(
          STORAGE_KEYS.SESSION_TERMINATION_REASON,
          warning.type
        );

        window.location.reload();
      } catch (error) {
        console.error("Failed to handle session termination:", error);
        setErrorMessage("Failed to process session termination");
        setProctorStatus("error");
        onProctorStatusChange("error");
      }
    } else {
      setTimeout(() => {
        setCurrentWarning(null);
      }, 3000);
    }
  };

  const sequentialLog = (message) => {
    console.log(`[${++logSequence}] ${message}`);
  };

  const checkMediaPermissions = async () => {
    try {
      const permissions = await navigator.mediaDevices.enumerateDevices();
      const hasVideo = permissions.some(
        (device) => device.kind === "videoinput"
      );
      const hasAudio = permissions.some(
        (device) => device.kind === "audioinput"
      );

      if (!hasVideo || !hasAudio) {
        throw new Error(
          `Missing required devices: ${!hasVideo ? "camera " : ""}${
            !hasAudio ? "microphone" : ""
          }`
        );
      }

      setHasMediaPermissions(true);
      return true;
    } catch (error) {
      console.error("Permission check failed:", error);
      setHasMediaPermissions(false);
      setErrorMessage(
        `Please enable camera and microphone access: ${error.message}`
      );
      return false;
    }
  };

  useEffect(() => {
    console.log("Video ref current:", videoRef.current);
  }, [videoRef.current]);

  const attachVideoStream = async (stream) => {
    try {
      let attempts = 0;
      while (!videoRef.current && attempts < 10) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      if (!videoRef.current) {
        throw new Error("Video element is not available after waiting");
      }

      videoRef.current.srcObject = stream;

      setIsVideoLoading(false);
      setIsStreamActive(true);

      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch((err) => {
          console.error("Video play error:", err);
          setErrorMessage("Unable to play the video stream");
        });
      };
    } catch (error) {
      console.error("Error in attachVideoStream:", error);
      setErrorMessage(error.message);
    }
  };

  const setupMediaStream = async () => {
    try {
      const hasPermissions = await checkMediaPermissions();
      if (!hasPermissions) {
        throw new Error("Media permissions not granted");
      }

      console.log("Requesting media stream with constraints...");
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();

      if (!videoTracks.length || !audioTracks.length) {
        throw new Error(
          `Missing tracks - Video tracks: ${videoTracks.length}, Audio tracks: ${audioTracks.length}`
        );
      }

      const videoTrack = videoTracks[0];
      if (videoTrack) {
        videoTrack.onended = () => console.log("Video track ended");
        videoTrack.onmute = () => console.log("Video track muted");
        videoTrack.onunmute = () => console.log("Video track unmuted");
      }

      mediaStreamRef.current = stream;
      console.log("About to attach video stream...");
      await attachVideoStream(stream);

      return stream;
    } catch (error) {
      console.error("Media setup error:", error);
      console.error({
        name: error.name,
        message: error.message,
        constraint: error.constraint,
        stack: error.stack,
      });
      setErrorMessage(`Failed to setup media: ${error.message}`);
      throw error;
    }
  };

  const handleRetry = () => {
    setProctorStatus("pending");
    setErrorMessage("");
    setIsVideoLoading(true);
    setIsStreamActive(false);
    initProctoring();
  };

  const handleConnectionFailure = () => {
    sequentialLog("Connection failure detected, attempting reconnection");
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setTimeout(() => {
      if (proctorStatus !== "error") {
        initProctoring();
      }
    }, 2000);
  };

  const initializeWebRTC = async (stream) => {
    sequentialLog(`Starting WebRTC initialization`);
    try {
      sequentialLog(`Creating new RTCPeerConnection with STUN servers`);
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
          {
            urls: "turn:relay.webrtc.org:3478",
            username: "webrtc",
            credential: "webrtc",
          },
        ],
        iceCandidatePoolSize: 10,
      });

      sequentialLog(
        `Adding ${stream.getTracks().length} tracks to peer connection`
      );
      stream.getTracks().forEach((track) => {
        sequentialLog(`Adding ${track.kind} track: ${track.id}`);
        peerConnection.addTrack(track, stream);
      });

      peerConnection.onicecandidate = ({ candidate }) => {
        if (candidate) {
          sequentialLog(`Generated ICE candidate: ${candidate.type}`);
          WebSocketService.sendWebRTCSignal(
            roomId,
            candidateId,
            "ice-candidate",
            candidate
          );
          sequentialLog(`Sent ICE candidate to room ${roomId}`);
        }
      };

      sequentialLog(`Creating offer`);
      const offer = await peerConnection.createOffer();
      sequentialLog(`Setting local description (offer)`);
      await peerConnection.setLocalDescription(offer);

      sequentialLog(`Sending offer to room ${roomId}`);
      WebSocketService.sendWebRTCSignal(roomId, candidateId, "offer", offer);

      WebSocketService.onWebRTCSignal(async (payload) => {
        const { type, signal } = payload;
        sequentialLog(`Received WebRTC signal: ${type}`);

        try {
          if (!peerConnectionRef.current) {
            throw new Error("No peer connection available");
          }

          switch (type) {
            case "answer":
              if (
                !peerConnectionRef.current.currentRemoteDescription &&
                signal
              ) {
                await peerConnectionRef.current.setRemoteDescription(
                  new RTCSessionDescription(signal)
                );
                sequentialLog("Remote description set successfully");
              }
              break;

            case "ice-candidate":
              if (peerConnectionRef.current.remoteDescription && signal) {
                try {
                  await peerConnectionRef.current.addIceCandidate(
                    new RTCIceCandidate(signal)
                  );
                  sequentialLog("ICE candidate added successfully");
                } catch (err) {
                  sequentialLog(`Failed to add ICE candidate: ${err.message}`);
                }
              } else {
                sequentialLog(
                  "Queuing ICE candidate - remote description not set"
                );
              }
              break;
          }
        } catch (error) {
          sequentialLog(`Error handling WebRTC signal: ${error.message}`);
          handleConnectionFailure();
        }
      });

      peerConnection.oniceconnectionstatechange = () => {
        sequentialLog(
          `ICE connection state changed to: ${peerConnection.iceConnectionState}`
        );
        if (
          peerConnection.iceConnectionState === "disconnected" ||
          peerConnection.iceConnectionState === "failed"
        ) {
          handleConnectionFailure();
        }
      };
      peerConnectionRef.current = peerConnection;
      sequentialLog(`WebRTC initialization completed successfully`);
      return peerConnection;
    } catch (error) {
      sequentialLog(`ERROR in WebRTC initialization: ${error.message}`);
      throw error;
    }
  };

  const initProctoring = async () => {
    sequentialLog(`Starting proctoring initialization`);
    try {
      if (!candidateId || !assessmentId || !roomId) {
        sequentialLog(`ERROR: Missing required parameters`);
        throw new Error("Missing required parameters");
      }

      sequentialLog(`Connecting to WebSocket`);
      const socket = WebSocketService.connect();
      socketRef.current = socket;

      sequentialLog(`Joining room ${roomId} as candidate ${candidateId}`);
      WebSocketService.joinRoom(roomId, candidateId);

      sequentialLog(`Setting up media stream`);
      const stream = await setupMediaStream();
      sequentialLog(`Media stream setup complete: ${stream.id}`);

      sequentialLog(`Initializing WebRTC connection`);
      await initializeWebRTC(stream);

      sequentialLog(`Starting face detection`);
      await faceDetectionService.startDetection(
        videoRef.current,
        handleFaceDetectionWarning
      );
      setFaceDetectionActive(true);

      sequentialLog(`Updating proctor status to active`);
      setProctorStatus("active");
      onProctorStatusChange("active");
    } catch (error) {
      sequentialLog(`ERROR in proctor initialization: ${error.message}`);
      setProctorStatus("error");
      setErrorMessage(error.message || "Failed to initialize proctoring");
      onProctorStatusChange("error");
    }
  };

  useEffect(() => {
    sequentialLog(
      `UseEffect triggered with candidateId: ${candidateId}, assessmentId: ${assessmentId}`
    );

    if (candidateId && assessmentId) {
      sequentialLog(`Starting proctoring initialization`);
      initProctoring();
    } else {
      sequentialLog(`ERROR: Invalid candidate or assessment details`);
      setProctorStatus("error");
      setErrorMessage("Invalid candidate or assessment details");
      onProctorStatusChange("error");
    }

    return () => {
      sequentialLog("Starting cleanup process");

      const cleanup = async () => {
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        if (videoRef.current?.srcObject) {
          videoRef.current.srcObject = null;
        }

        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => {
            track.stop();
            sequentialLog(`Stopped ${track.kind} track: ${track.id}`);
          });
          mediaStreamRef.current = null;
        }

        if (peerConnectionRef.current) {
          peerConnectionRef.current.close();
          peerConnectionRef.current = null;
        }

        if (socketRef.current) {
          WebSocketService.disconnect();
          socketRef.current = null;
        }
        if (faceDetectionActive) {
          faceDetectionService.stopDetection();
          faceDetectionService.resetWarningCount();
          setFaceDetectionActive(false);
        }

        setIsVideoLoading(true);
        setIsStreamActive(false);
        setProctorStatus("pending");
      };

      cleanup();
    };
  }, [candidateId, assessmentId, onProctorStatusChange]);

  const renderProctorContent = () => {
    const content = (
      <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        {(isVideoLoading || !isStreamActive) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
            <Video className="h-12 w-12 text-blue-500 animate-pulse" />
          </div>
        )}
        {currentWarning && (
          <div className="absolute top-4 left-4 right-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>
                {currentWarning.type === "NO_FACE"
                  ? "Face Not Detected"
                  : "Multiple Faces Detected"}
              </AlertTitle>
              <AlertDescription>{currentWarning.message}</AlertDescription>
            </Alert>
          </div>
        )}
        {warningCount > 0 && (
          <div className="absolute bottom-4 right-4 bg-red-500 text-white px-2 py-1 rounded">
            Warnings: {warningCount}
          </div>
        )}
      </div>
    );
    switch (proctorStatus) {
      case "pending":
        return (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Initializing Video...</CardTitle>
            </CardHeader>
            <CardContent>{content}</CardContent>
          </Card>
        );

      case "active":
        return (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Live Video Monitoring</CardTitle>
            </CardHeader>
            <CardContent>{content}</CardContent>
          </Card>
        );

      case "error":
        return (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              {content}
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Proctoring Error</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
                <div className="mt-4">
                  <Button onClick={handleRetry} variant="outline">
                    Retry
                  </Button>
                </div>
              </Alert>
            </CardContent>
          </Card>
        );
      case "session_out":
        return (
          <SessionEndedCard
            terminationReason={currentWarning?.type || "UNKNOWN"}
          />
        );
      default:
        return null;
    }
  };
  return (
    <div className="flex items-center justify-center bg-gray-100 p-4 min-h-[320px]">
      {renderProctorContent()}
    </div>
  );
};

export default ProctorWindow;
