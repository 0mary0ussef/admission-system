"use client";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Label from "../components/ui/Label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Alert, AlertDescription } from "../components/ui/Alert";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const VerifyStudentPage = () => {
  const [nationalId, setNationalId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateNationalId = async () => {
    if (nationalId.length !== 14) {
      setError("National ID must be 14 digits");
      return;
    }

    setIsLoading(true);
    setError("");

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock validation - in real app, this would check against database
    const validIds = ["12345678901234", "98765432109876"]; // Mock valid IDs

    if (validIds.includes(nationalId)) {
      // Set student token in localStorage
      localStorage.setItem("studentToken", "verified");
      localStorage.setItem("studentNationalId", nationalId);

      // Student found, redirect to exam
      navigate("/exam");
    } else {
      setError(
        "National ID not found in our records. Please visit our school to enroll your information first."
      );
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="py-12">
        <div className="max-w-md mx-auto px-4">
          <Link
            to="/apply-options"
            className="inline-flex items-center text-[#ef3131] hover:underline mb-8 font-medium"
          >
            <svg
              className="h-4 w-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Application Options
          </Link>

          <Card className="border-0 smooth-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-[#ef3131]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="h-8 w-8 text-[#ef3131]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01"
                  />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Student Verification
              </CardTitle>
              <p className="text-gray-600 font-light">
                Enter your National ID to verify your enrollment status
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="nationalId" className="text-base font-medium">
                  National ID
                </Label>
                <Input
                  id="nationalId"
                  value={nationalId}
                  onChange={(e) =>
                    setNationalId(
                      e.target.value.replace(/\D/g, "").slice(0, 14)
                    )
                  }
                  placeholder="Enter your 14-digit National ID"
                  className="mt-2 h-12 text-lg"
                  maxLength={14}
                  validation={{ nationalId: true }}
                  showValidation={true}
                />
                <p className="text-sm text-gray-500 mt-2">
                  {nationalId.length}/14 digits
                </p>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <svg
                    className="h-4 w-4 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <AlertDescription className="text-red-700 font-medium">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={validateNationalId}
                className="w-full bg-[#ef3131] hover:bg-red-600 h-12 text-lg font-semibold rounded-full"
                disabled={nationalId.length !== 14 || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  "Verify & Continue"
                )}
              </Button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">
                      Demo National IDs for testing:
                    </p>
                    <p className="font-mono">12345678901234</p>
                    <p className="font-mono">98765432109876</p>
                  </div>
                </div>
              </div>

              <div className="text-center pt-4 border-t">
                <p className="text-gray-600 text-sm mb-4">
                  Don't have your information registered yet?
                </p>
                <Link to="/apply-options">
                  <Button
                    variant="outline"
                    className="border-[#ef3131] text-[#ef3131] hover:bg-[#ef3131] hover:text-white bg-transparent"
                  >
                    Visit Our School to Enroll
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default VerifyStudentPage;
