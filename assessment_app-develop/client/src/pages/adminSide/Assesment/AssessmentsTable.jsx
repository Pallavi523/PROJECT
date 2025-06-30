import React, { useState } from "react";
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
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/common/ui/dialog";
import { Button } from "@/components/common/ui/button";
import { UserPlus, Edit, Trash2, SquarePlus, Eye } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/common/ui/calendar";
import { Input } from "@/components/common/ui/input";
import { Label } from "@/components/common/ui/label";

const AssessmentTable = ({
  isDailogOpen,
  assessments,
  onScheduleCandidate,
  onEditAssessment,
  onDeleteAssessment,
  candidateSchedule,
  setCandidateSchedule,
}) => {
  const [deleteAssessmentId, setDeleteAssessmentId] = useState(null);
  const handleViewQuestions = (assessmentId) => {
    onScheduleCandidate({
      openQuestionsModal: (id) => {
        setCandidateSchedule((prev) => ({
          ...prev,
          assessmentId: id,
        }));
      },
      assessmentId: assessmentId,
    });
  };
  const confirmDelete = () => {
    if (deleteAssessmentId) {
      onDeleteAssessment(deleteAssessmentId);
      setDeleteAssessmentId(null);
    }
  };
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category/Type</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>No.of Questions</TableHead>
            <TableHead>Passing Score</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assessments && assessments.length > 0 ? (
            assessments.map((assessment) => (
              <TableRow key={assessment._id}>
                <TableCell>{assessment.title}</TableCell>
                <TableCell>{assessment.category}</TableCell>
                <TableCell>{assessment.duration} mins</TableCell>
                <TableCell>{assessment.status}</TableCell>
                <TableCell>{assessment.totalQuestions} </TableCell>
                <TableCell>{assessment.passingScore}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {/* Candidate Scheduling Dialog */}
                    <Dialog open={isDailogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setCandidateSchedule((prev) => ({
                              ...prev,
                              assessmentId: assessment._id,
                            }))
                          }
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>
                            Schedule Candidate for {assessment.title}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          {/* Full Name Input */}
                          <div className="flex flex-col gap-2">
                            <Label>Full Name</Label>
                            <Input
                              placeholder="Candidate Full Name"
                              value={candidateSchedule.fullName}
                              onChange={(e) =>
                                setCandidateSchedule((prev) => ({
                                  ...prev,
                                  fullName: e.target.value,
                                }))
                              }
                            />
                          </div>

                          {/* Email Input */}
                          <div className="flex flex-col gap-2">
                            <Label>Email</Label>
                            <Input
                              placeholder="Candidate Email"
                              type="email"
                              value={candidateSchedule.email}
                              onChange={(e) =>
                                setCandidateSchedule((prev) => ({
                                  ...prev,
                                  email: e.target.value,
                                }))
                              }
                            />
                          </div>

                          {/* Scheduled Start Time */}
                          <div>
                            <CalendarComponent
                              mode="single"
                              selected={candidateSchedule.scheduledStartTime}
                              onSelect={(date) =>
                                setCandidateSchedule((prev) => ({
                                  ...prev,
                                  scheduledStartTime: date || new Date(),
                                }))
                              }
                              className="rounded-md border"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end mt-4">
                          <Button
                            onClick={onScheduleCandidate}
                            disabled={
                              !candidateSchedule.email ||
                              !candidateSchedule.fullName
                            }
                          >
                            Schedule Candidate
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        onScheduleCandidate({
                          openQuestionManagementModal: (id) => {
                            setCandidateSchedule((prev) => ({
                              ...prev,
                              assessmentId: id,
                            }));
                          },
                          assessmentId: assessment._id,
                        });
                      }}
                    >
                      <SquarePlus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEditAssessment(assessment)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {/* View Questions Button */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleViewQuestions(assessment._id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => setDeleteAssessmentId(assessment._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                No Assessment available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Dialog
        open={deleteAssessmentId !== null}
        onOpenChange={() => setDeleteAssessmentId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this assessment? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteAssessmentId(null)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AssessmentTable;
