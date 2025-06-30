import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/common/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/common/ui/dialog";
import { Card, CardContent } from "@/components/common/ui/card";
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import { Eye, User, Clock, Award, Edit2, Filter, FileText } from "lucide-react";
import api from "@/lib/api";

const ResponseDialog = ({ attempt }) => {
  const [loading, setLoading] = useState({});
  const [marks, setMarks] = useState({});
  const [editMode, setEditMode] = useState({});
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    const initialMarks = {};
    attempt.responses.forEach((response) => {
      if (response.marks) {
        initialMarks[response._id] = response.marks;
      }
    });
    setMarks(initialMarks);
  }, [attempt]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleUploadMarks = async (responseId, marksValue) => {
    try {
      setLoading((prev) => ({ ...prev, [responseId]: true }));

      const response = await fetch(`${api}/response/upload-marks`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          responseId,
          marks: Number(marksValue),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload marks");
      }

      const data = await response.json();
      attempt.responses = attempt.responses.map((resp) =>
        resp._id === responseId ? { ...resp, marks: Number(marksValue) } : resp
      );

      setEditMode((prev) => ({ ...prev, [responseId]: false }));

      const allMarksUploaded = attempt.responses.every(
        (resp) => resp.marks !== undefined && resp.marks !== null
      );

      if (allMarksUploaded) {
        await calculateTotalScore(attempt._id);
      }
    } catch (error) {
      console.error("Error uploading marks:", error);
      alert("Failed to upload marks. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, [responseId]: false }));
    }
  };

  const calculateTotalScore = async (testAttemptId) => {
    try {
      setCalculating(true);

      const response = await fetch(
        `${api}/testattempt/${testAttemptId}/calculate-score`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to calculate total score");
      }

      const data = await response.json();
      attempt.score = data.totalScore;

      alert(`Total score calculated: ${data.totalScore}`);
      window.location.reload();
    } catch (error) {
      console.error("Error calculating total score:", error);
      alert("Failed to calculate total score. Please try again.");
    } finally {
      setCalculating(false);
    }
  };

  const handleEditClick = (responseId) => {
    setEditMode((prev) => ({ ...prev, [responseId]: true }));
  };

  const renderMarksCell = (response) => {
    const isEditing = editMode[response._id];
    const hasExistingMarks =
      response.marks !== undefined && response.marks !== null && !isEditing;

    if (hasExistingMarks) {
      return (
        <div className="flex items-center space-x-2">
          <div className="bg-gray-50 p-2 rounded text-gray-700">
            {response.marks}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEditClick(response._id)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        <Input
          type="number"
          placeholder="Enter marks"
          className="w-24"
          value={marks[response._id] || ""}
          onChange={(e) =>
            setMarks((prev) => ({
              ...prev,
              [response._id]: e.target.value,
            }))
          }
          min="0"
          max="10"
        />
        <Button
          size="sm"
          variant="outline"
          disabled={loading[response._id]}
          onClick={() => handleUploadMarks(response._id, marks[response._id])}
        >
          {loading[response._id] ? (
            <div className="flex items-center">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
              Saving...
            </div>
          ) : (
            "Save Marks"
          )}
        </Button>
      </div>
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Response Details - {attempt.candidateId.fullName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-blue-50">
              <CardContent className="p-4 flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Candidate</p>
                  <p className="text-sm">{attempt.candidateId?.fullName}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50">
              <CardContent className="p-4 flex items-center space-x-2">
                <Award className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-green-600 font-medium">Score</p>
                  <p className="text-sm">{attempt.score || "Pending"}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50">
              <CardContent className="p-4 flex items-center space-x-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-600 font-medium">
                    Completed
                  </p>
                  <p className="text-sm">{formatDate(attempt.endTime)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/4">Question</TableHead>
                <TableHead className="w-1/2">Response</TableHead>
                <TableHead className="w-1/4">Marks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attempt.responses.map((response, index) => (
                <TableRow key={index}>
                  <TableCell className="align-top">
                    <div className="font-medium">
                      {response.question || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Question {index + 1}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className={`p-2 rounded ${
                        response.selectedAnswer === response.questionId?.option
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {response.mcqAnswer ||
                        response.subjectiveAnswer ||
                        response.codingAnswer}
                    </div>
                  </TableCell>
                  <TableCell>{renderMarksCell(response)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const TestAttemptsTable = ({ testAttempts }) => {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Assessment</TableHead>
              <TableHead>Obtained Score</TableHead>
              <TableHead>Total Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Completion Time</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testAttempts.map((attempt) => (
              <TableRow key={attempt._id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <span className="font-medium">
                      {attempt.candidateId.email || "Unknown"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{attempt.assessmentId || "N/A"}</TableCell>
                <TableCell>{attempt.score || "Pending"}</TableCell>
                <TableCell>{59}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      attempt.score >= 30
                        ? "bg-green-100 text-green-800"
                        : attempt.score
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {attempt.score >= 30
                      ? "Passed"
                      : attempt.score
                      ? "Failed"
                      : "Pending"}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(attempt.endTime).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <ResponseDialog attempt={attempt} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const TestAttemptsPage = () => {
  const [testAttempts, setTestAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTestAttempts = async () => {
      try {
        const response = await fetch(`${api}/testAttempt/all-attempt`);
        const data = await response.json();
        setTestAttempts(data);
      } catch (error) {
        console.error("Error fetching test attempts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestAttempts();
  }, []);

  return (
    <div className="min-h-screen bg-blue-800">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Test Attempts
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                View and analyze candidate test attempts and their detailed
                responses
              </p>
            </div> 
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-4">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                <span className="text-gray-500">Loading test attempts...</span>
              </div>
            </div>
          </div>
        ) : (
          <TestAttemptsTable testAttempts={testAttempts} />
        )}
      </div>
    </div>
  );
};


export default TestAttemptsPage;
