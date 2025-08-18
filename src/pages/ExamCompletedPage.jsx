"use client";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";

const ExamCompletedPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear exam data
    localStorage.removeItem("examToken");
    localStorage.removeItem("examStartTime");
    localStorage.removeItem("studentNationalId");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="py-12">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="border-0 shadow-2xl bg-white">
            <CardHeader className="text-center bg-gradient-to-r from-[#ef3131] to-red-500 text-white rounded-t-lg">
              <CardTitle className="text-3xl font-bold">
                Exam Completed!
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 text-center">
              <div className="space-y-6">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-12 h-12 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Thank you for taking the exam!
                  </h3>
                  <p className="text-gray-600">
                    Your exam has been successfully submitted. You will be
                    notified of your results soon.
                  </p>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={() => navigate("/")}
                    className="w-full bg-[#ef3131] hover:bg-red-600 py-3 rounded-full font-semibold text-lg"
                  >
                    Return to Home
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExamCompletedPage;
