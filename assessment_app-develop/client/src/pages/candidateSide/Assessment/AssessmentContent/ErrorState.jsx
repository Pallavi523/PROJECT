import React from "react";
import { XCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/common/ui/alert";

const ErrorState = ({ message }) => (
  <Alert variant="destructive">
    <XCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);

export default ErrorState;
