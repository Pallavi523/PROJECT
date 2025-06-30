import React from "react";
import { Loader2 } from "lucide-react";

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center">
    <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
    <p>Loading assessment...</p>
  </div>
);

export default LoadingState;
