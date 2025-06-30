import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { Button } from "@/components/common/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import {
  createRoom,
  fetchRoomDetails,
  updateCandidateStatus,
} from "@/services/apiService";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

const AdminProctorDashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [filters, setFilters] = useState({
    status: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const loadRooms = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${api}/websocket/rooms?page=${page}&limit=${pagination.itemsPerPage}` +
          `&status=${filters.status}&sortBy=${filters.sortBy}&sortOrder=${filters.sortOrder}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch rooms");
      }

      const data = await response.json();

      if (data.success) {
        const formattedRooms = data.data.rooms.map((room) => ({
          ...room,
          candidates: room.candidates || [],
          _id: room._id || room.roomId,
          assessmentId: room.assessmentId || { title: "Untitled" },
        }));

        setRooms(formattedRooms);
        console.log(formattedRooms);
        setPagination({
          currentPage: data.data.pagination.currentPage,
          totalPages: data.data.pagination.totalPages,
          totalItems: data.data.pagination.totalItems,
          itemsPerPage: data.data.pagination.itemsPerPage,
        });
      } else {
        throw new Error(data.message || "Failed to load rooms");
      }

      setIsLoading(false);
    } catch (err) {
      setError(err.message || "Failed to load rooms");
      toast.error("Unable to load rooms");
      setIsLoading(false);
    }
  };

  const handleManageRoom = (roomId) => {
    window.open(`/proctor/room/${roomId}`, "_blank");
  };

  useEffect(() => {
    loadRooms(pagination.currentPage);
  }, [filters]);

  const handleCreateRoom = async (assessmentId, candidateId) => {
    try {
      const response = await createRoom(assessmentId, candidateId);

      if (response.success) {
        setRooms((prevRooms) => [...prevRooms, response.data]);
        toast.success("New room created successfully");
      } else {
        throw new Error(response.message || "Failed to create room");
      }
    } catch (err) {
      toast.error("Failed to create room");
      console.error(err);
    }
  };

  const handleUpdateCandidateStatus = async (roomId, candidateId, status) => {
    try {
      const response = await updateCandidateStatus(
        roomId,
        candidateId,
        status,
        null,
        null,
        null
      );

      if (response.success) {
        setRooms((prevRooms) =>
          prevRooms.map((room) =>
            room._id === roomId
              ? {
                  ...room,
                  candidates: room.candidates.map((candidate) =>
                    candidate.candidateId?._id === candidateId ||
                    candidate.candidateId === candidateId
                      ? { ...candidate, status }
                      : candidate
                  ),
                }
              : room
          )
        );
        toast.success(`Candidate status updated to ${status}`);
      } else {
        throw new Error(response.message || "Failed to update status");
      }
    } catch (err) {
      toast.error("Failed to update candidate status");
      console.error(err);
    }
  };

  const handlePageChange = (newPage) => {
    loadRooms(newPage);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-red-500">
        <p>Error: {error}</p>
        <Button onClick={() => loadRooms()}>Retry Loading</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-800">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Proctor Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage and monitor proctoring sessions
              </p>
            </div>
            <div className="flex gap-4">
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={() => handleCreateRoom("assessment-" + Date.now())}
              >
                Create New Room
              </Button>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm">
          {!rooms?.length ? (
            <div className="p-8 text-center text-gray-500">
              <p>No rooms available. Create a new room to get started.</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-6">
                {rooms.map((room) => (
                  <Card key={room._id || room.roomId} className="mb-6">
                    <CardHeader className="flex flex-row justify-between items-center">
                      <div>
                        <CardTitle>
                          Assessment: {room.assessmentId?.title || "Untitled"}
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                          Status: {room.status}
                          {room.startedAt &&
                            ` • Started: ${new Date(
                              room.startedAt
                            ).toLocaleString()}`}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleManageRoom(room._id || room.roomId)
                        }
                      >
                        Manage Room
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {room.candidates?.map((candidate) => {
                          const candidateId =
                            candidate?.candidateId?._id ||
                            candidate?.candidateId;
                          const candidateName =
                            candidate?.candidateId?.fullName || "Unknown";
                          const candidateEmail =
                            candidate?.candidateId?.email || "No email";

                          if (!candidateId) return null;

                          return (
                            <div
                              key={candidateId}
                              className="p-4 border rounded-lg"
                            >
                              <h3 className="font-medium">{candidateName}</h3>
                              <p className="text-sm text-gray-500">
                                {candidateEmail}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    {Array.from({ length: pagination.totalPages }, (_, i) => (
                      <Button
                        key={i + 1}
                        variant={
                          pagination.currentPage === i + 1
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProctorDashboard;
