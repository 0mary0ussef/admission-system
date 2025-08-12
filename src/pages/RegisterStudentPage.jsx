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
    studentName: "",
    nationalId: "",
    mathScore: "",
    englishScore: "",
    finalYearScore: "",
    ministryExamPercentage: "",
    dateOfBirth: "",
  });
  const [isAcceptanceLetterReceived, setIsAcceptanceLetterReceived] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [birthdateError, setBirthdateError] = useState("");
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

    // Real-time validation for date of birth
    if (field === "dateOfBirth") {
      // Clear error immediately when user starts typing
      if (birthdateError) setBirthdateError("");

      if (value) {
        // Add a small delay to avoid showing error while user is still typing
        setTimeout(() => {
          validateDateOfBirth(value);
        }, 500);
      }
    } else {
      // Clear birthdate error when user types in other fields
      if (birthdateError) setBirthdateError("");
    }
  };

  const validateDateOfBirth = (dateValue) => {
    if (!dateValue) {
      setBirthdateError("Date of Birth is required");
      return "Date of Birth is required";
    }

    const dateOfBirth = new Date(dateValue);

    // Check if the date is valid
    if (isNaN(dateOfBirth.getTime())) {
      setBirthdateError("Please enter a valid date");
      return "Please enter a valid date";
    }

    const today = new Date();
    const currentYear = today.getFullYear();
    const octoberFirst = new Date(currentYear, 9, 1); // October 1st (month is 0-indexed)

    // If today is before October 1st, use previous year
    if (today < octoberFirst) {
      octoberFirst.setFullYear(currentYear - 1);
    }

    const minDate = new Date(octoberFirst.getFullYear() - 18, 9, 1); // 18 years before October 1st
    const maxDate = new Date(octoberFirst.getFullYear() - 1, 9, 1); // 1 year before October 1st

    if (dateOfBirth < minDate || dateOfBirth > maxDate) {
      setBirthdateError(
        "Student must be 18 years or younger on October 1st of the current academic year"
      );
      return "Student must be 18 years or younger on October 1st of the current academic year";
    }

    // Clear error if date is valid
    setBirthdateError("");
    return null; // No error
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted");
    console.log("Form data:", formData);
    console.log("isAcceptanceLetterReceived:", isAcceptanceLetterReceived);

    setIsLoading(true);
    setError("");
    setSuccess("");

    // Validate date of birth
    if (!formData.dateOfBirth) {
      setError("Date of Birth is required");
      setIsLoading(false);
      return;
    }

    // Validate date of birth
    const dateValidationError = validateDateOfBirth(formData.dateOfBirth);
    if (dateValidationError) {
      setError(dateValidationError);
      setIsLoading(false);
      return;
    }

    // Validate ministry exam percentage if acceptance letter is received
    if (
      isAcceptanceLetterReceived &&
      (!formData.ministryExamPercentage ||
        formData.ministryExamPercentage === "")
    ) {
      setError("Please enter the Ministry Exam percentage");
      setIsLoading(false);
      return;
    }

    if (isAcceptanceLetterReceived) {
      const percentage = parseFloat(formData.ministryExamPercentage);
      if (isNaN(percentage) || percentage < 0 || percentage > 100) {
        setError("Ministry Exam percentage must be between 0 and 100");
        setIsLoading(false);
        return;
      }
    }

    // Scroll to top to show any validation messages
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const studentData = {
        studentName: formData.studentName,
        nationalId: formData.nationalId,
        mathScore: parseFloat(formData.mathScore),
        englishScore: parseFloat(formData.englishScore),
        finalYearScore: parseFloat(formData.finalYearScore),
        isAcceptanceLetterReceived: isAcceptanceLetterReceived,
        ministryExamPercentage: isAcceptanceLetterReceived
          ? parseFloat(formData.ministryExamPercentage)
          : null,
        dateOfBirth: formData.dateOfBirth,
      };

      console.log("Submitting student data:", studentData);
      console.log("Teacher token:", localStorage.getItem("teacherToken"));
      await teacherAPI.registerStudent(studentData);

      setSuccess("Student registered successfully!");

      // Reset form
      setFormData({
        studentName: "",
        nationalId: "",
        mathScore: "",
        englishScore: "",
        finalYearScore: "",
        ministryExamPercentage: "",
        dateOfBirth: "",
      });
      setIsAcceptanceLetterReceived(false);
      setBirthdateError(""); // Clear birthdate error
    } catch (err) {
      console.error("Registration error:", err);
      console.error("Error response:", err.response);
      console.error("Error message:", err.message);
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

                <div>
                  <Label
                    htmlFor="dateOfBirth"
                    className="text-base font-medium text-gray-700"
                  >
                    Date of Birth:
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      handleInputChange("dateOfBirth", e.target.value)
                    }
                    onBlur={(e) => {
                      if (e.target.value) {
                        validateDateOfBirth(e.target.value);
                      }
                    }}
                    className="mt-2 h-11 md:h-12 text-base"
                    required
                    max={new Date().toISOString().split("T")[0]}
                    validation={{
                      custom: (value) => {
                        if (!value) return true; // Let required validation handle empty
                        const error = validateDateOfBirth(value);
                        return error === null ? true : error;
                      },
                    }}
                    showValidation={true}
                  />
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

                <div className="mb-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isAcceptanceLetterReceived"
                      checked={isAcceptanceLetterReceived}
                      onChange={(e) =>
                        setIsAcceptanceLetterReceived(e.target.checked)
                      }
                    />
                    <Label
                      htmlFor="isAcceptanceLetterReceived"
                      className="text-base font-medium text-gray-700"
                    >
                      Did you receive an acceptance letter?
                    </Label>
                  </div>
                </div>

                {isAcceptanceLetterReceived && (
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
                      required={isAcceptanceLetterReceived}
                    />
                  </div>
                )}

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
