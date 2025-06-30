import React from "react";
import { Toaster } from "sonner";
import CandidatesTable from "./CandidatesTable";

const Candidates = () => {
  return (
    <div className="min-h-screen bg-blue-800">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
            <p className="text-sm text-gray-500 mt-1">
              View and manage assessment candidates
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 ">
          <CandidatesTable />
        </div>
      </div>
      <Toaster
        position="top-right"
        closeButton
        className="bg-white shadow-lg"
      />
    </div>
  );
};

export default Candidates;
