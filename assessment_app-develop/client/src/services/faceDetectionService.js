import * as faceapi from "face-api.js";

class FaceDetectionService {
  constructor() {
    this.isModelLoaded = false;
    this.detectionInterval = null;
    this.warningCount = 0;
    this.lastWarningTime = 0;
    this.WARNING_COOLDOWN = 3000;
  }

  async loadModels() {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      ]);
      this.isModelLoaded = true;
      console.log("Face detection models loaded successfully");
      return true;
    } catch (error) {
      console.error("Error loading face detection models:", error);
      throw error;
    }
  }

  async startDetection(videoElement, onWarning) {
    if (!this.isModelLoaded) {
      await this.loadModels();
    }

    if (!videoElement) {
      throw new Error("Video element not provided");
    }

    this.detectionInterval = setInterval(async () => {
      try {
        const detections = await faceapi.detectAllFaces(
          videoElement,
          new faceapi.TinyFaceDetectorOptions()
        );

        const currentTime = Date.now();
        const canSendWarning =
          currentTime - this.lastWarningTime > this.WARNING_COOLDOWN;

        if (detections.length === 0 && canSendWarning) {
          this.warningCount++;
          this.lastWarningTime = currentTime;
          onWarning({
            type: "NO_FACE",
            message: "No face detected in the frame",
            warningCount: this.warningCount,
          });
        } 
        else if (detections.length > 1 && canSendWarning) {
          this.warningCount++;
          this.lastWarningTime = currentTime;
          onWarning({
            type: "MULTIPLE_FACES",
            message: ` Multiple faces detected in the frame`,
            warningCount: this.warningCount,
          });
        }
      } catch (error) {
        console.error("Face detection error:", error);
      }
    }, 1000); 
  }

  stopDetection() {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
  }

  resetWarningCount() {
    this.warningCount = 0;
    this.lastWarningTime = 0;
  }
}

export default new FaceDetectionService();
