import api from "@/lib/api";
export const createRoom = async (assessmentId, candidateId) => {
  try {
    const response = await fetch(`${api}/websocket/room/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assessmentId,
        candidateId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Failed to create room: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Create room error:", error);
    throw error;
  }
};

export const updateCandidateStatus = async (
  roomId,
  candidateId,
  status,
  webrtcOffer,
  actualStartTime,
  attemptStatus
) => {
  try {
    const response = await fetch(
      `${api}/websocket/room/${roomId}/candidate/${candidateId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          webrtcOffer,
          actualStartTime,
          attemptStatus,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to update candidate status: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Update candidate status error:", error);
    throw error;
  }
};

export const fetchRoomDetails = async (roomId) => {
  try {
    const response = await fetch(`${api}/websocket/room/${roomId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch room details: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch room details error:", error);
    throw error;
  }
};

export const getCandidatesByAssessment = async (assessmentId) => {
  try {
    const response = await fetch(
      `${api}/websocket/assessment/${assessmentId}/candidates`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch candidates: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates;
  } catch (error) {
    console.error("Fetch candidates error:", error);
    throw error;
  }
};

export const createAssessmentRoom = async (assessmentId, candidateId) => {
  try {
    // const candidateId = candidateData.candidateId;
    console.log("assessment and candidate ids :", candidateId, assessmentId);
    const response = await fetch(`${api}/websocket/room/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assessmentId,
        candidateId,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Failed to create room: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Create room error:", error);
    throw error;
  }
};
