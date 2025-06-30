import { io } from "socket.io-client";

class WebSocketService {
  constructor(url) {
    this.socket = null;
    this.url = url;
    this.listeners = new Map();
    this.connectionStates = new Map();
    this.toIdCache = new Map();
    this.activeRoom = null;
    this.isAdmin = false;
    this.userId = null;
    this.signalQueue = new Map();
    this.processingSignals = false;
  }

  async processSignalQueue(peerId) {
    if (this.processingSignals) return;
    this.processingSignals = true;

    const queue = this.signalQueue.get(peerId) || [];
    while (queue.length > 0) {
      const signal = queue.shift();
      try {
        await this.sendWebRTCSignal(
          signal.roomId,
          signal.fromId,
          signal.type,
          signal.signal,
          signal.toId
        );
      } catch (error) {
        console.error("Signal processing error:", error);
      }
    }
    this.processingSignals = false;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(this.url, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      this.setupBaseListeners();
    }
    return this.socket;
  }

  setupBaseListeners() {
    this.socket.on("connect", () => {
      console.log("WebSocket connected with ID:", this.socket.id);

      if (this.activeRoom) {
        this.joinRoom(this.activeRoom, this.userId, this.isAdmin);
      }
    });

    this.socket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
      this.connectionStates.clear();
    });

    this.socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });

    this.socket.on("room-error", (error) => {
      console.error("Room error:", error);
    });

    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit("heartbeat", {
          roomId: this.activeRoom,
          userId: this.userId,
          timestamp: Date.now(),
        });
      }
    }, 30000);
  }

  joinRoom(roomId, userId, isAdmin = false) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("Socket not connected"));
        return;
      }

      console.log("Joining room:", { roomId, userId, isAdmin });

      this.activeRoom = roomId;
      this.userId = userId;
      this.isAdmin = isAdmin;

      this.socket.emit("join-room", {
        roomId,
        userId,
        isAdmin,
      });

      this.socket.once("candidate-joined", (response) => {
        console.log("Successfully joined room:", response);
        resolve(response);
      });

      this.socket.once("room-error", (error) => {
        console.error("Failed to join room:", error);
        reject(error);
      });
    });
  }

  async sendWebRTCSignal(roomId, fromId, type, signal) {
    if (!this.socket?.connected) {
      throw new Error("Socket not connected");
    }

    const payload = {
      roomId,
      fromId,
      type,
      signal,
      timestamp: Date.now(),
    };

    console.log(
      `Sending ${type} signal from ${fromId} in room ${roomId}`,
      payload
    );

    return new Promise((resolve, reject) => {
      this.socket
        // .timeout(5000)
        .emit("webrtc-signal", payload, (error, response) => {
          if (error) {
            console.error("Signal error:", error);
            reject(error);
          } else {
            console.log(`${type} signal sent successfully`);
            resolve(response);
          }
        });
    });
  }

  onWebRTCSignal(callback) {
    if (!this.socket) {
      console.error("Cannot setup listener: socket not connected");
      return;
    }

    const handler = (payload) => {
      console.log("Received WebRTC signal:", payload);
      callback(payload);
    };

    this.socket.on("webrtc-signal", handler);
    this.listeners.set("webrtc-signal", handler);
  }

  onCandidateJoined(callback) {
    if (!this.socket) {
      console.error("Cannot setup listener: socket not connected");
      return;
    }

    const handler = (data) => {
      console.log("Candidate joined event:", data);
      this.connectionStates.set(data.candidateId, {
        connected: false,
        lastUpdate: Date.now(),
        connectionAttempts: 0,
      });
      callback(data);
    };

    this.socket.on("candidate-joined", handler);
    this.listeners.set("candidate-joined", handler);
  }

  onCandidateLeft(callback) {
    if (!this.socket) {
      console.error("Cannot setup listener: socket not connected");
      return;
    }

    const handler = (data) => {
      console.log("Candidate left event:", data);
      this.connectionStates.delete(data.candidateId);
      callback(data);
    };

    this.socket.on("candidate-left", handler);
    this.listeners.set("candidate-left", handler);
  }

  getConnectionState(candidateId) {
    return this.connectionStates.get(candidateId);
  }

  updateConnectionState(candidateId, state) {
    const currentState = this.connectionStates.get(candidateId) || {};
    const updatedState = {
      ...currentState,
      ...state,
      lastUpdate: Date.now(),
      signalingState: state.signalingState || currentState.signalingState,
      connectionState: state.connectionState || currentState.connectionState,
      iceConnectionState:
        state.iceConnectionState || currentState.iceConnectionState,
    };

    this.connectionStates.set(candidateId, updatedState);

    if (this.shouldAttemptReconnection(updatedState)) {
      this.handleReconnection(candidateId);
    }
  }

  async handleReconnection(candidateId) {
    const state = this.connectionStates.get(candidateId);
    if (!state || state.connectionAttempts >= 3) return;

    try {
      await this.clearConnection(candidateId);
      await this.initializeNewConnection(candidateId);

      this.updateConnectionState(candidateId, {
        connectionAttempts: (state.connectionAttempts || 0) + 1,
        lastReconnectAttempt: Date.now(),
      });
    } catch (error) {
      console.error("Reconnection failed:", error);
    }
  }

  shouldAttemptReconnection(state) {
    return (
      state.connectionState === "failed" ||
      state.iceConnectionState === "failed" ||
      (Date.now() - state.lastUpdate > 30000 && state.connected)
    );
  }

  removeAllListeners() {
    if (!this.socket) return;

    this.listeners.forEach((handler, event) => {
      this.socket.off(event, handler);
    });
    this.listeners.clear();

    this.connectionStates.clear();
  }

  leaveRoom() {
    if (!this.socket || !this.activeRoom) return;

    return new Promise((resolve) => {
      this.socket.emit(
        "leave-room",
        {
          roomId: this.activeRoom,
          userId: this.userId,
        },
        () => {
          this.activeRoom = null;
          this.userId = null;
          this.isAdmin = false;
          resolve();
        }
      );
    });
  }

  async clearConnection(candidateId) {
    this.connectionStates.delete(candidateId);
    this.signalQueue.delete(candidateId);
    this.toIdCache.delete(this.activeRoom);

    if (this.socket?.connected) {
      await new Promise((resolve) => {
        this.socket.emit(
          "clear-connection",
          {
            candidateId,
            roomId: this.activeRoom,
          },
          resolve
        );
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.leaveRoom()
        .then(() => {
          this.removeAllListeners();
          this.socket.disconnect();
          this.socket = null;
        })
        .catch((error) => {
          console.error("Error during disconnect:", error);
          this.removeAllListeners();
          this.socket.disconnect();
          this.socket = null;
        });
    }
  }
}
 
const webSocketService = new WebSocketService();
export default webSocketService;
