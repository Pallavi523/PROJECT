import React, { useState, useEffect, useRef } from "react";
import { Video, AlertCircle, Users } from "lucide-react";
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
import { useParams } from "react-router-dom";
import { getUserInfoId } from "@/lib/auth-utils";

const VideoDisplay = ({ stream }) => {
  const videoRef = useRef(null);
  const [playAttempt, setPlayAttempt] = useState(0);
  const [videoState, setVideoState] = useState({
    hasMetadata: false,
    isPlaying: false,
    error: null,
    videoWidth: 0,
    videoHeight: 0,
  });

  const debugLog = (message, data = {}) => {
    console.log(`[VideoDisplay Debug] ${message}`, {
      timestamp: new Date().toISOString(),
      ...data,
    });
  };

  // Enhanced setup function with better error handling
  useEffect(() => {
    let mounted = true;
    let metadataTimeoutId;

    const setupVideo = async () => {
      if (!videoRef.current || !stream) {
        debugLog("Missing video reference or stream", {
          hasVideoRef: !!videoRef.current,
          hasStream: !!stream,
        });
        return;
      }

      try {
        debugLog("Setting up video", {
          streamActive: stream.active,
          videoTracks: stream.getVideoTracks().length,
          audioTracks: stream.getAudioTracks().length,
        });

        // Clear existing stream and wait for cleanup
        if (videoRef.current.srcObject) {
          videoRef.current.srcObject = null;
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        videoRef.current.srcObject = stream;

        const waitForMetadata = () =>
          new Promise((resolve, reject) => {
            const onMetadata = () => {
              videoRef.current?.removeEventListener(
                "loadedmetadata",
                onMetadata
              );
              resolve();
            };

            videoRef.current?.addEventListener("loadedmetadata", onMetadata);

            metadataTimeoutId = setTimeout(() => {
              videoRef.current?.removeEventListener(
                "loadedmetadata",
                onMetadata
              );
              reject(new Error("Metadata timeout"));
            }, 10000); // Increased to 10 seconds
          });

        await waitForMetadata();
        clearTimeout(metadataTimeoutId);

        if (!mounted) return;

        // Attempt to play with retry logic
        const playWithRetry = async (maxAttempts = 3) => {
          for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
              debugLog(`Play attempt ${attempt + 1}/${maxAttempts}`);
              await videoRef.current.play();
              debugLog("Video playing successfully");
              setVideoState((prev) => ({ ...prev, isPlaying: true }));
              return true;
            } catch (err) {
              debugLog(`Play attempt ${attempt + 1} failed:`, {
                error: err.message,
              });
              if (attempt < maxAttempts - 1) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
              } else {
                throw err;
              }
            }
          }
          return false;
        };

        await playWithRetry();
      } catch (err) {
        if (!mounted) return;

        debugLog("Error during video setup:", {
          error: err.message,
          name: err.name,
          stack: err.stack,
        });

        setVideoState((prev) => ({ ...prev, error: err }));

        // Trigger retry for specific errors
        if (["NotAllowedError", "AbortError"].includes(err.name)) {
          setPlayAttempt((prev) => prev + 1);
        }
      }
    };

    setupVideo();

    return () => {
      mounted = false;
      clearTimeout(metadataTimeoutId);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [stream, playAttempt]);

  // Monitor stream and tracks
  useEffect(() => {
    if (!stream) return;

    const handleTrackEnded = () => debugLog("Track ended");
    const handleTrackMute = () => debugLog("Track muted");
    const handleTrackUnmute = () => debugLog("Track unmuted");

    const tracks = stream.getTracks();
    tracks.forEach((track) => {
      track.onended = handleTrackEnded;
      track.onmute = handleTrackMute;
      track.onunmute = handleTrackUnmute;
    });

    return () => {
      tracks.forEach((track) => {
        track.onended = null;
        track.onmute = null;
        track.onunmute = null;
      });
    };
  }, [stream]);

  return (
    <div className="relative min-h-[240px] bg-gray-100 rounded-lg overflow-hidden">
      {stream ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full rounded-lg object-cover"
          />
          {videoState.error && (
            <div className="absolute bottom-0 left-0 right-0 bg-red-500 bg-opacity-75 text-white p-2 text-sm">
              Error: {videoState.error.message}
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-sm text-gray-600 ml-2">No stream available</p>
        </div>
      )}
    </div>
  );
};

const ProctorRoom = () => {
  const { roomId } = useParams();
  const [candidates, setCandidates] = useState(new Map());
  const [error, setError] = useState("");
  const peerConnectionsRef = useRef(new Map());
  const adminId = getUserInfoId();
  let logSequence = 0;

  const sequentialLog = (message) => {
    console.log(`[${++logSequence}] ${message}`);
  };

  const createPeerConnection = (candidateId) => {
    sequentialLog(`Creating new peer connection for candidate ${candidateId}`);

    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        // Free TURN server
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
      `RTCPeerConnection initialized with STUN servers for ${candidateId}`
    );
 
    peerConnection.ontrack = (event) => {
      sequentialLog(`Track event triggered for ${candidateId}`);
      sequentialLog(`Stream details for ${candidateId}:
            - Track Count: ${event.streams[0].getTracks().length}
            - Stream ID: ${event.streams[0].id}
            - Audio Tracks: ${event.streams[0].getAudioTracks().length}
            - Video Tracks: ${event.streams[0].getVideoTracks().length}`);

      setCandidates((prev) => {
        const updated = new Map(prev);
        updated.set(candidateId, {
          id: candidateId,
          status: "connected",
          stream: event.streams[0],
        });
        return updated;
      });
      sequentialLog(`Candidate state updated to connected for ${candidateId}`);
    };
 
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        sequentialLog(`ICE candidate generated for ${candidateId}`);
        sequentialLog(`ICE candidate details:
                - Protocol: ${event.candidate.protocol}
                - Type: ${event.candidate.type}
                - Network Type: ${event.candidate}`);

        WebSocketService.sendWebRTCSignal(
          roomId,
          adminId,
          "ice-candidate",
          event.candidate
        );
        sequentialLog(`ICE candidate sent to ${candidateId}`);
      } else {
        sequentialLog(`ICE gathering completed for ${candidateId}`);
      }
    };
 
    peerConnection.onconnectionstatechange = () => {
      sequentialLog(
        `Connection state changed for ${candidateId}: ${peerConnection.connectionState}`
      );

      if (peerConnection.connectionState === "failed") {
        sequentialLog(
          `Connection failed for ${candidateId}, initiating reconnection`
        );
        handleReconnection(candidateId);
      }
    };
 
    peerConnection.onicegatheringstatechange = () => {
      sequentialLog(
        `ICE gathering state for ${candidateId}: ${peerConnection.iceGatheringState}`
      );
    };

    peerConnection.onsignalingstatechange = () => {
      sequentialLog(
        `Signaling state for ${candidateId}: ${peerConnection.signalingState}`
      );
    };

    peerConnection.oniceconnectionstatechange = () => {
      sequentialLog(
        `ICE connection state for ${candidateId}: ${peerConnection.iceConnectionState}`
      );
    };

    sequentialLog(`Peer connection setup completed for ${candidateId}`);
    return peerConnection;
  };

  const handleWebRTCSignal = async (payload) => {
    console.log("neha says:", payload);

    const { candidateId, type, signal } = payload;
    sequentialLog(
      `Admin received WebRTC signal: ${type} from candidate ${candidateId}`
    );

    try {
      let peerConnection = peerConnectionsRef.current.get(candidateId);
      console.log(`hello from dark side ${peerConnection}`);

      if (!peerConnection || peerConnection.connectionState === "closed") {
        sequentialLog(`Creating new peer connection for ${candidateId}`);
        peerConnection = createPeerConnection(candidateId);
        peerConnectionsRef.current.set(candidateId, peerConnection);

        peerConnection.oniceconnectionstatechange = () => {
          sequentialLog(
            `ICE Connection State (${candidateId}): ${peerConnection.iceConnectionState}`
          );
        };

        peerConnection.onconnectionstatechange = () => {
          sequentialLog(
            `Connection State (${candidateId}): ${peerConnection.connectionState}`
          );
        };

        peerConnection.onsignalingstatechange = () => {
          sequentialLog(
            `Signaling State (${candidateId}): ${peerConnection.signalingState}`
          );
        };
      }

      peerConnection.ontrack = (event) => {
        sequentialLog(`Track received from ${candidateId}`);
        const stream = event.streams[0];

        sequentialLog(`Stream details for ${candidateId}:
        - Stream ID: ${stream.id}
        - Stream Active: ${stream.active}
        - Total Tracks: ${stream.getTracks().length}
        - Video Tracks: ${stream.getVideoTracks().length}
        - Audio Tracks: ${stream.getAudioTracks().length}`);

        const videoTracks = stream.getVideoTracks();
        videoTracks.forEach((track, index) => {
          sequentialLog(`Video track ${index} details:
          - Track ID: ${track.id}
          - Enabled: ${track.enabled}
          - Muted: ${track.muted}
          - Ready State: ${track.readyState}
          - Settings: ${JSON.stringify(track.getSettings())}`);
        });

        if (stream) {
          setCandidates((prev) => {
            const updated = new Map(prev);
            updated.set(candidateId, {
              id: candidateId,
              status: "connected",
              stream: event.streams[0],
            });
            return updated;
          });
        }
      };

      switch (type) {
        case "offer": {
          if (
            !["stable", "have-remote-offer"].includes(
              peerConnection.signalingState
            )
          ) {
            sequentialLog(
              `Invalid state for offer: ${peerConnection.signalingState}. Rolling back...`
            );
            if (peerConnection.signalingState === "have-local-offer") {
              await peerConnection.setLocalDescription({ type: "rollback" });
              sequentialLog(`Rollback completed for ${candidateId}`);
            }
          }

          sequentialLog(`Setting remote description for ${candidateId}`);
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(signal)
          );
          sequentialLog(`Remote description set for ${candidateId}`);

          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          sequentialLog(`Local description (answer) set for ${candidateId}`);

          sequentialLog(`Sending answer to candidate ${candidateId}`);
          await WebSocketService.sendWebRTCSignal(
            roomId,
            adminId,
            "answer",
            answer
          );
          break;
        }

        case "ice-candidate": {
          if (!signal) {
            sequentialLog(`Received empty ICE candidate for ${candidateId}`);
            return;
          }

          try {
            if (
              peerConnection.remoteDescription &&
              peerConnection.remoteDescription.type
            ) {
              const candidate = new RTCIceCandidate(signal);
              await peerConnection.addIceCandidate(candidate);
              sequentialLog(`Added ICE candidate for ${candidateId}`);
            } else {
              if (!peerConnection.pendingIceCandidates) {
                peerConnection.pendingIceCandidates = [];
              }
              peerConnection.pendingIceCandidates.push(signal);
              sequentialLog(`Queued ICE candidate for ${candidateId}`);
            }
          } catch (err) {
            sequentialLog(
              `Error adding ICE candidate for ${candidateId}: ${err.message}`
            );
          }
          break;
        }
      }

      peerConnection.ontrack = (event) => {
        sequentialLog(`Track received from ${candidateId}`);
        sequentialLog(
          `Stream tracks count: ${event.streams[0].getTracks().length}`
        );

        const videoTracks = event.streams[0].getVideoTracks();
        sequentialLog(`Video tracks count: ${videoTracks.length}`);

        if (videoTracks.length === 0) {
          sequentialLog(`WARNING: No video tracks from ${candidateId}`);
        }
      };
    } catch (error) {
      sequentialLog(
        `ERROR handling ${type} signal from ${candidateId}: ${error.message}`
      );

      if (error.name === "InvalidStateError") {
        sequentialLog(`Attempting recovery for ${candidateId}`);
        const peerConnection = peerConnectionsRef.current.get(candidateId);
        if (peerConnection) {
          sequentialLog(`Recreating peer connection for ${candidateId}`);
          peerConnection.close();
          peerConnectionsRef.current.delete(candidateId);
          const newPeerConnection = createPeerConnection(candidateId);
          peerConnectionsRef.current.set(candidateId, newPeerConnection);
          await handleWebRTCSignal(payload);
        }
      }
    }
  };

  const handleReconnection = async (candidateId) => {
    console.log(`Starting reconnection for candidate ${candidateId}`);
 
    const existingConnection = peerConnectionsRef.current.get(candidateId);
    if (existingConnection) {
      existingConnection.close();
    }
 
    peerConnectionsRef.current.delete(candidateId);
 
    setCandidates((prev) => {
      const updated = new Map(prev);
      const candidate = updated.get(candidateId);
      if (candidate) {
        updated.set(candidateId, {
          ...candidate,
          status: "reconnecting",
          stream: null,
        });
      }
      return updated;
    });
  };

  useEffect(() => {
    sequentialLog(`Initializing WebSocket connection`);
    const socket = WebSocketService.connect();

    sequentialLog(`Joining room ${roomId} as admin ${adminId}`);
    WebSocketService.joinRoom(roomId, adminId, true);

    const handleCandidateJoined = ({ candidateId }) => {
      sequentialLog(`Candidate ${candidateId} joined the room`);
    };

    const handleCandidateLeft = ({ candidateId }) => {
      sequentialLog(`Candidate ${candidateId} left the room`);
    };

    socket.on("candidate-joined", handleCandidateJoined);
    socket.on("candidate-left", handleCandidateLeft);
    WebSocketService.onWebRTCSignal(handleWebRTCSignal);

    const debugInterval = setInterval(() => {
      peerConnectionsRef.current.forEach((pc, id) => {
        sequentialLog(`Connection Status ${id}: 
                Signaling: ${pc.signalingState}, 
                Connection: ${pc.connectionState}, 
                ICE: ${pc.iceConnectionState}`);
      });
    }, 5000);

    return () => {
      sequentialLog(`Cleaning up connections`);
      clearInterval(debugInterval);
      peerConnectionsRef.current.forEach((connection, id) => {
        sequentialLog(`Closing connection ${id}`);
        connection.close();
      });
      sequentialLog(`Disconnecting WebSocket`);
      WebSocketService.disconnect();
    };
  }, [roomId, adminId]);

  const renderCandidateGrid = () => {
    if (candidates.size === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <Users className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">Waiting for candidates to join...</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from(candidates.values()).map((candidate) => (
          <Card key={candidate.id} className="w-full">
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Candidate {candidate.id}</span>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    candidate.status === "connected"
                      ? "bg-green-100 text-green-800"
                      : candidate.status === "connecting"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {candidate.status}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.status === "connecting" ? (
                <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                  <Video className="h-8 w-8 text-blue-500 animate-pulse" />
                </div>
              ) : candidate.stream ? (
                <VideoDisplay stream={candidate.stream} />
              ) : (
                <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                  <p className="text-sm text-gray-600 ml-2">
                    No stream available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Dashboard Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Proctoring Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>{candidates.size} candidates connected</span>
          </div>
        </CardContent>
      </Card>
      {renderCandidateGrid()}
    </div>
  );
};

export default ProctorRoom;
