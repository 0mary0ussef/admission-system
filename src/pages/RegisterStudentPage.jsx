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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <div className="py-12">
        <div className="max-w-2xl mx-auto px-4">
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

          <Card className="border-0 shadow-2xl bg-white">
            <CardHeader className="text-center bg-gradient-to-r from-[#ef3131] to-red-500 text-white">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold">
                Register New Student
              </CardTitle>
              <p className="text-white/90 font-light">
                Enter student information to register them in the system
              </p>
            </CardHeader>
            <CardContent className="p-8">
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
                    validation={{ name: true }}
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
                    validation={{ nationalId: true }}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.nationalId.length}/14 digits
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
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
                      max="60"
                      value={formData.mathScore}
                      onChange={(e) =>
                        handleInputChange("mathScore", e.target.value)
                      }
                      placeholder="Enter Math score (0-60)"
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
                    <Input
                      id="englishScore"
                      type="number"
                      min="0"
                      max="40"
                      value={formData.englishScore}
                      onChange={(e) =>
                        handleInputChange("englishScore", e.target.value)
                      }
                      placeholder="Enter English score (0-40)"
                      className="mt-2 h-11 md:h-12 text-base"
                      required
                    />
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
                      max="280"
                      value={formData.thirdPrepScore}
                      onChange={(e) =>
                        handleInputChange("thirdPrepScore", e.target.value)
                      }
                      placeholder="Enter Third Prep score (0-280)"
                      className="mt-2 h-11 md:h-12 text-base"
                      required
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="acceptanceLetter"
                      checked={formData.acceptanceLetter}
                      onCheckedChange={(checked) =>
                        handleInputChange("acceptanceLetter", checked)
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor="acceptanceLetter"
                        className="text-base font-medium text-gray-700 cursor-pointer block"
                      >
                        Acceptance Letter Received
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">
                        Confirm that the student has received their acceptance
                        letter
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#ef3131] hover:bg-red-600 h-12 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
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
