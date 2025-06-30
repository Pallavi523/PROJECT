import React from "react";
import { Edit, Trash2, PlusCircle, MinusCircle } from "lucide-react";
import { Button } from "@/components/common/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/common/ui/table";

const QuestionsTable = ({ questions, onEdit, onDelete }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Question</TableHead>
        <TableHead>Type</TableHead>
        <TableHead>Category</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {questions.length > 0 ? (
        questions.map((question) => (
          <TableRow key={question._id}>
            <TableCell>{question.text}</TableCell>
            <TableCell>{question.type}</TableCell>
            <TableCell>{question.category}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(question)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => onDelete(question._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={4} className="text-center">
            No questions available.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
);
export default QuestionsTable;
