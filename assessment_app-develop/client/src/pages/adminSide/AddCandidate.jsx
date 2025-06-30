import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/common/ui/dialog";
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import { Label } from "@/components/common/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import { Plus } from "lucide-react";
import api from "@/lib/api";
import { fetchWithTokenRetry } from "@/utils/TokenManagementUtility";  
import { toast, Toaster } from "sonner";
const AddCandidateDialog = () => {
  const [candidateData, setCandidateData] = useState({
    fullName: "",
    email: "",
    role: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCandidateData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetchWithTokenRetry(`${api}/user/add-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(candidateData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result);
        toast.success("Candidate added successfully");
        setIsDialogOpen(false);
        setCandidateData({
          fullName: "",
          email: "",
          role: "",
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to add candidate");
      }
    } catch (error) {
      console.error("Error adding candidate:", error);
      toast.error("Failed to add candidate");
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Create New Admin </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Admin/HR
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Candidate</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="Full Name"
                    value={candidateData.fullName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    placeholder="Email"
                    value={candidateData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    onValueChange={(value) =>
                      setCandidateData((prev) => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit">Add Candidate</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Toaster />
    </div>
  );
};

export default AddCandidateDialog;
