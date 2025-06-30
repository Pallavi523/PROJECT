import React, { useEffect, useState } from "react";
import {
  Card, 
  CardContent,
} from "@/components/common/ui/card";
import { AlertCircle } from "lucide-react";
import api from "@/lib/api";

const Instructions = ({ assessmentId }) => {
  const [instructions, setInstructions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInstructions = async () => {
      try {
        const response = await fetch(
          `${api}/assessment/${assessmentId}/instructions`
        );
        const data = await response.json();

        const bulletPoints = data.instructions
          .split(".")
          .map((sentence) => sentence.trim())
          .filter((sentence) => sentence.length > 0);

        setInstructions(bulletPoints);
        setError(null);
      } catch (error) {
        console.error("Error fetching instructions:", error);
        setError("Failed to load instructions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchInstructions();
  }, [assessmentId]);

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur shadow-md border-none">
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-red-100 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur shadow-md border-none">
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-indigo-900 mb-2">
            Please read carefully:
          </h3>
          <p className="text-gray-600 text-sm">
            The following instructions will help you complete the assessment
            successfully.
          </p>
        </div>
        <ul className="space-y-3">
          {instructions.map((instruction, index) => (
            <li
              key={index}
              className="flex items-start gap-3 text-gray-700 leading-relaxed"
            >
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium">
                {index + 1}
              </span>
              <span className="mt-0.5">{instruction}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-800">
            Make sure to review all instructions before proceeding with the
            assessment.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Instructions;
