"use client";

import { useState, useEffect } from "react";
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
import Checkbox from "../components/ui/Checkbox";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const RegisterStudentPage = () => {
  const [formData, setFormData] = useState({
    studentName: "",
    nationalId: "",
    mathScore: "",
    englishScore: "",
    thirdPrepScore: "",
    acceptanceLetter: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if teacher is authenticated
    const token = localStorage.getItem("teacherToken");
    if (!token) {
      navigate("/teacher/login");
    }
  }, [navigate]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // In real app, this would submit to backend
    alert("Student information registered successfully!");

    // Reset form
    setFormData({
      studentName: "",
      nationalId: "",
      mathScore: "",
      englishScore: "",
      thirdPrepScore: "",
      acceptanceLetter: false,
    });

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="py-8 md:py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/apply-options"
            className="inline-flex items-center text-[#ef3131] hover:underline mb-6 md:mb-8 font-medium"
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
            <CardHeader className="text-center pb-6 md:pb-8">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-[#ef3131]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                <svg
                  className="h-8 w-8 md:h-10 md:w-10 text-[#ef3131]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900">
                Register Student
              </CardTitle>
              <p className="text-gray-600 font-light mt-2">
                Enter student information for admission
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label
                    htmlFor="studentName"
                    className="text-base font-medium text-gray-700"
                  >
                    Student Name:
                  </Label>
                  <Input
                    id="studentName"
                    value={formData.studentName}
                    onChange={(e) =>
                      handleInputChange("studentName", e.target.value)
                    }
                    placeholder="Enter student's full name"
                    className="mt-2 h-11 md:h-12 text-base"
                    required
                  />
                </div>

                <div>
                  <Label
                    htmlFor="nationalId"
                    className="text-base font-medium text-gray-700"
                  >
                    National ID:
                  </Label>
                  <Input
                    id="nationalId"
                    value={formData.nationalId}
                    onChange={(e) =>
                      handleInputChange(
                        "nationalId",
                        e.target.value.replace(/\D/g, "").slice(0, 14)
                      )
                    }
                    placeholder="Enter National ID (e.g., 14 digits)"
                    className="mt-2 h-11 md:h-12 text-base"
                    maxLength={14}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.nationalId.length}/14 digits
                  </p>
                </div>

                <div>
                  <Label
                    htmlFor="mathScore"
                    className="text-base font-medium text-gray-700"
                  >
                    Math Score:
                  </Label>
                  <Input
                    id="mathScore"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.mathScore}
                    onChange={(e) =>
                      handleInputChange("mathScore", e.target.value)
                    }
                    placeholder="Enter Math score (0-100)"
                    className="mt-2 h-11 md:h-12 text-base"
                    required
                  />
                </div>

                <div>
                  <Label
                    htmlFor="englishScore"
                    className="text-base font-medium text-gray-700"
                  >
                    English Score:
                  </Label>
                  <select
                    id="englishScore"
                    value={formData.englishScore}
                    onChange={(e) =>
                      handleInputChange("englishScore", e.target.value)
                    }
                    className="mt-2 w-full h-11 md:h-12 px-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-[#ef3131] focus:border-transparent"
                    required
                  >
                    <option value="">Enter English score (0-100)</option>
                    {Array.from({ length: 101 }, (_, i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label
                    htmlFor="thirdPrepScore"
                    className="text-base font-medium text-gray-700"
                  >
                    Third Prep Score:
                  </Label>
                  <Input
                    id="thirdPrepScore"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.thirdPrepScore}
                    onChange={(e) =>
                      handleInputChange("thirdPrepScore", e.target.value)
                    }
                    placeholder="Enter Third Prep score (0-100)"
                    className="mt-2 h-11 md:h-12 text-base"
                    required
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="acceptanceLetter"
                    checked={formData.acceptanceLetter}
                    onCheckedChange={(checked) =>
                      handleInputChange("acceptanceLetter", checked)
                    }
                    className="w-5 h-5"
                  />
                  <Label
                    htmlFor="acceptanceLetter"
                    className="text-base font-medium text-gray-700 cursor-pointer"
                  >
                    Acceptance Letter Received
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#ef3131] hover:bg-red-600 h-11 md:h-12 text-base md:text-lg font-semibold rounded-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Registering Student...
                    </div>
                  ) : (
                    "Register Student"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RegisterStudentPage;
