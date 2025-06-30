import React from "react";
import { Button } from "@/components/common/ui/button";
import { Loader2 } from "lucide-react";

const SubmitScreen = ({
  totalQuestions,
  answeredQuestions,
  onReview,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Review and Submit</h2>
        <p className="text-gray-600 mb-6">
          You have completed all questions. Please review your answers before
          final submission.
        </p>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">Summary:</h3>
          <p className="text-gray-600">
            Total Questions: {totalQuestions}
            <br />
            Answered Questions: {answeredQuestions}
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={onReview} disabled={isSubmitting}>
            Review Answers
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="min-w-[150px]"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {isSubmitting ? "Submitting..." : "Submit Assessment"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubmitScreen;
