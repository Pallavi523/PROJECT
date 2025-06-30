import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../../components/common/ui/card";

const NotFound = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-[#1547A9] via-white to-[#1547A9]">
      <Card className="w-100 shadow-md bg-slate-500 ">
        <CardHeader>
          <h1 className="text-2xl font-bold text-black-500 text-black-50 rounded-lg">
            OOps Page Not Found!!
          </h1>
        </CardHeader>
      </Card>
    </div>
  );
};

export default NotFound;
