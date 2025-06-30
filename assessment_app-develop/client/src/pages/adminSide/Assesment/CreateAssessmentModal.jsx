import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/common/ui/dialog";
import { Button } from "@/components/common/ui/button";
import { Plus } from "lucide-react";
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

const CreateAssessmentModal = ({
  isOpen,
  onOpenChange,
  newAssessment,
  onNewAssessmentChange,
  onCreateAssessment,
}) => {
  // Categories from your MongoDB schema
  const categories = [
    "JAVA",
    "API",
    "ETL",
    "PYTHON",
    "SQL",
    "MANNUAL",
    "SELENIUM",
    "JAVASCRIPT",
    "Other",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {/* <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Assessment
        </Button> */}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Assessment</DialogTitle>
          <DialogDescription>
            Comprehensive details for a new assessment
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={newAssessment.title}
                onChange={(e) => onNewAssessmentChange("title", e.target.value)}
                placeholder="Assessment Title"
              />
            </div>

            <div>
              <Label>Type</Label>
              <Select
                value={newAssessment.type}
                onValueChange={(value) => onNewAssessmentChange("type", value)}
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
              <Label>Category</Label>
              <Select
                value={newAssessment.category}
                onValueChange={(value) =>
                  onNewAssessmentChange("category", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Duration (mins)</Label>
              <Input
                type="number"
                value={newAssessment.duration}
                onChange={(e) =>
                  onNewAssessmentChange("duration", Number(e.target.value))
                }
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <Label>Instructions</Label>
              <Textarea
                value={newAssessment.instructions}
                onChange={(e) =>
                  onNewAssessmentChange("instructions", e.target.value)
                }
                placeholder="Assessment instructions"
                rows={4}
              />
            </div>

            <div>
              <Label>Total Questions</Label>
              <Input
                type="number"
                value={newAssessment.totalQuestions}
                onChange={(e) =>
                  onNewAssessmentChange(
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
                value={newAssessment.passingScore}
                onChange={(e) =>
                  onNewAssessmentChange("passingScore", Number(e.target.value))
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onCreateAssessment}>Create Assessment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAssessmentModal;
