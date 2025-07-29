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
import { teacherAPI } from "../utils/api";

const RegisterStudentPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    nationalId: "",
    mathScore: "",
    englishScore: "",
    finalYearScore: "",
    ministryExamPercentage: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
    // Clear messages when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Scroll to top to show any validation messages
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const response = await teacherAPI.registerStudent({
        fullName: formData.fullName,
        nationalId: formData.nationalId,
        mathScore: parseFloat(formData.mathScore),
        englishScore: parseFloat(formData.englishScore),
        finalYearScore: parseFloat(formData.finalYearScore),
        ministryExamPercentage: parseFloat(formData.ministryExamPercentage),
      });

      setSuccess("Student registered successfully!");

      // Reset form
      setFormData({
        fullName: "",
        nationalId: "",
        mathScore: "",
        englishScore: "",
        finalYearScore: "",
        ministryExamPercentage: "",
      });
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err.response?.data || "Failed to register student. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
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
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600 text-sm">{success}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label
                    htmlFor="fullName"
                    className="text-base font-medium text-gray-700"
                  >
                    Student Name:
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
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
                      htmlFor="finalYearScore"
                      className="text-base font-medium text-gray-700"
                    >
                      Final Year Score:
                    </Label>
                    <Input
                      id="finalYearScore"
                      type="number"
                      min="0"
                      max="280"
                      value={formData.finalYearScore}
                      onChange={(e) =>
                        handleInputChange("finalYearScore", e.target.value)
                      }
                      placeholder="Enter Final Year score (0-280)"
                      className="mt-2 h-11 md:h-12 text-base"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="ministryExamPercentage"
                    className="text-base font-medium text-gray-700"
                  >
                    Ministry Exam Percentage:
                  </Label>
                  <Input
                    id="ministryExamPercentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.ministryExamPercentage}
                    onChange={(e) =>
                      handleInputChange(
                        "ministryExamPercentage",
                        e.target.value
                      )
                    }
                    placeholder="Enter Ministry Exam percentage (0-100)"
                    className="mt-2 h-11 md:h-12 text-base"
                    required
                  />
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
