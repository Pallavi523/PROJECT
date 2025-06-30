import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/common/ui/dialog";
import { Button } from "@/components/common/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import { Input } from "@/components/common/ui/input";
import { Label } from "@/components/common/ui/label";
import { Textarea } from "@/components/common/ui/textarea";

const EditAssessmentModal = ({
  selectedAssessment,
  onSelectedAssessmentChange,
  onUpdateAssessment,
  onClose,
}) => {
  if (!selectedAssessment) return null;

  return (
    <Dialog open={!!selectedAssessment} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Assessment</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={selectedAssessment.title || ""}
                onChange={(e) =>
                  onSelectedAssessmentChange("title", e.target.value)
                }
                placeholder="Assessment Title"
              />
            </div>

            <div>
              <Label>Type</Label>
              <Select
                value={selectedAssessment.type || ""}
                onValueChange={(value) =>
                  onSelectedAssessmentChange("type", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Behavioral">Behavioral</SelectItem>
                  <SelectItem value="Coding">Coding</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Duration (mins)</Label>
              <Input
                type="number"
                value={selectedAssessment.duration || ""}
                onChange={(e) =>
                  onSelectedAssessmentChange("duration", Number(e.target.value))
                }
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <Label>Instructions</Label>
              <Textarea
                value={selectedAssessment.instructions || ""}
                onChange={(e) =>
                  onSelectedAssessmentChange("instructions", e.target.value)
                }
                placeholder="Assessment instructions"
                rows={4}
              />
            </div>

            <div>
              <Label>Total Questions</Label>
              <Input
                type="number"
                value={selectedAssessment.totalQuestions || ""}
                onChange={(e) =>
                  onSelectedAssessmentChange(
                    "totalQuestions",
                    Number(e.target.value)
                  )
                }
              />
            </div>

            <div>
              <Label>Passing Score</Label>
              <Input
                type="number"
                value={selectedAssessment.passingScore || ""}
                onChange={(e) =>
                  onSelectedAssessmentChange(
                    "passingScore",
                    Number(e.target.value)
                  )
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onUpdateAssessment}>Update Assessment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditAssessmentModal;
