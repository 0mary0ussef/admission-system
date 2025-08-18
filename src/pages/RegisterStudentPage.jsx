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
  const [age, setAge] = useState("");
  const [isDobValid, setIsDobValid] = useState(null);
  const [students, setStudents] = useState([]);
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if teacher is authenticated
    const token = localStorage.getItem("teacherToken");
    if (!token) {
      navigate("/teacher/login");
    }
  }, [navigate]);

  const loadStudents = async () => {
    try {
      setIsLoadingStudents(true);
      // Debug logs removed
      const response = await teacherAPI.getStudents();
      setStudents(response.data);
    } catch (error) {
      console.error("Error loading students:", error);
      console.error("Error response:", error.response);
      console.error("Error status:", error.response?.status);
      setError("Failed to load students");
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const calculateAge = (dateValue) => {
    if (!dateValue) return "";
    const birth = new Date(dateValue);
    if (isNaN(birth.getTime())) return "";
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      years -= 1;
    }
    return years.toString();
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear messages when user starts typing
    if (error) setError("");
    if (success) setSuccess("");

    // Real-time validation for date of birth
    if (field === "dateOfBirth") {
      // Clear error immediately when user starts typing
      if (birthdateError) setBirthdateError("");

      // Update age display immediately
      setAge(calculateAge(value));

      if (value) {
        // Add a small delay to avoid showing error while user is still typing
        setTimeout(() => {
          const res = validateDateOfBirth(value);
          setIsDobValid(res === null);
        }, 500);
      } else {
        // If cleared, reset age and validation state
        setAge("");
        setIsDobValid(null);
      }
    } else {
      // Clear birthdate error when user types in other fields
      if (birthdateError) setBirthdateError("");
    }
  };

  const validateDateOfBirth = (dateValue) => {
    if (!dateValue) {
      setBirthdateError("Date of Birth is required");
      setIsDobValid(false);
      return "Date of Birth is required";
    }

    const dateOfBirth = new Date(dateValue);

    // Check if the date is valid
    if (isNaN(dateOfBirth.getTime())) {
      setBirthdateError("Please enter a valid date");
      setIsDobValid(false);
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
      setIsDobValid(false);
      return "Student must be 18 years or younger on October 1st of the current academic year";
    }

    // Clear error if date is valid
    setBirthdateError("");
    setIsDobValid(true);
    return null; // No error
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Debug logs removed

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

    // Validate score ranges
    const mathScore = parseFloat(formData.mathScore);
    const englishScore = parseFloat(formData.englishScore);
    const finalYearScore = parseFloat(formData.finalYearScore);

    if (isNaN(mathScore) || mathScore < 0 || mathScore > 60) {
      setError("Math score must be between 0 and 60");
      setIsLoading(false);
      return;
    }

    if (isNaN(englishScore) || englishScore < 0 || englishScore > 40) {
      setError("English score must be between 0 and 40");
      setIsLoading(false);
      return;
    }

    if (isNaN(finalYearScore) || finalYearScore < 0 || finalYearScore > 280) {
      setError("Final Prep score must be between 0 and 280");
      setIsLoading(false);
      return;
    }

    // Scroll to top to show any validation messages
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      // Convert the date string to DateOnly format (YYYY-MM-DD)
      const dateOfBirth = new Date(formData.dateOfBirth);
      const dateOnlyString = dateOfBirth.toISOString().split("T")[0]; // YYYY-MM-DD format

      const studentData = {
        studentName: formData.studentName,
        nationalId: formData.nationalId,
        mathScore: parseFloat(formData.mathScore),
        englishScore: parseFloat(formData.englishScore),
        finalYearScore: parseFloat(formData.finalYearScore),
        isAcceptanceLetterReceived: isAcceptanceLetterReceived,
        ministryExamPercentage: isAcceptanceLetterReceived
          ? parseFloat(formData.ministryExamPercentage)
          : 0,
        dateOfBirth: dateOnlyString,
      };

      // Debug logs removed
      await teacherAPI.registerStudent(studentData);

      setSuccess("Student registered successfully!");

      // Reload students from database
      await loadStudents();

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
      setAge("");
      setIsDobValid(null);
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
            <CardHeader className="relative text-center bg-gradient-to-r from-[#ef3131] to-red-500 text-white">
              <button
                type="button"
                onClick={async () => {
                  setIsStudentsModalOpen(true);
                  await loadStudents();
                }}
                className="absolute top-4 right-4 inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-full backdrop-blur transition"
                aria-label="Show registered students"
                title="Show registered students"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M12 12c2.761 0 5-2.916 5-6.5S14.761 0 12 0 7 2.916 7 6.5 9.239 12 12 12zm0 2c-4.418 0-8 2.015-8 4.5V21a1 1 0 001 1h14a1 1 0 001-1v-2.5c0-2.485-3.582-4.5-8-4.5z" />
                </svg>
                <span className="text-sm font-semibold">{students.length}</span>
              </button>
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
                  <div className="mt-2 flex items-center gap-3">
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        handleInputChange("dateOfBirth", e.target.value)
                      }
                      onBlur={(e) => {
                        if (e.target.value) {
                          const res = validateDateOfBirth(e.target.value);
                          setIsDobValid(res === null);
                        }
                      }}
                      className="h-11 md:h-12 text-base"
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
                      hideErrorMessage={true}
                    />
                    <input
                      id="age"
                      value={age}
                      readOnly
                      placeholder="Age"
                      aria-label="Age"
                      className={`${
                        isDobValid === null
                          ? "border-gray-200"
                          : isDobValid
                          ? "border-green-400 focus:border-green-500 focus-visible:ring-green-500"
                          : "border-red-300 focus:border-red-500 focus-visible:ring-red-500"
                      } flex h-11 md:h-12 rounded-md border bg-white px-2 text-base text-center font-medium select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 w-14`}
                      style={{ width: "3.25rem" }}
                    />
                  </div>
                  {birthdateError && (
                    <p className="text-sm text-red-600 mt-1">
                      {birthdateError}
                    </p>
                  )}
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
                      step="0.1"
                      value={formData.mathScore}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow empty string or valid decimal numbers
                        if (
                          value === "" ||
                          (parseFloat(value) >= 0 && parseFloat(value) <= 60)
                        ) {
                          handleInputChange("mathScore", value);
                        }
                      }}
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
                      step="0.1"
                      value={formData.englishScore}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow empty string or valid decimal numbers
                        if (
                          value === "" ||
                          (parseFloat(value) >= 0 && parseFloat(value) <= 40)
                        ) {
                          handleInputChange("englishScore", value);
                        }
                      }}
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
                      Final Prep Score:
                    </Label>
                    <Input
                      id="finalYearScore"
                      type="number"
                      min="0"
                      max="280"
                      step="0.1"
                      value={formData.finalYearScore}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow empty string or valid decimal numbers
                        if (
                          value === "" ||
                          (parseFloat(value) >= 0 && parseFloat(value) <= 280)
                        ) {
                          handleInputChange("finalYearScore", value);
                        }
                      }}
                      placeholder="Enter Final Prep score (0-280)"
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
                      onCheckedChange={(val) =>
                        setIsAcceptanceLetterReceived(Boolean(val))
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
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow empty string or valid decimal numbers
                        if (
                          value === "" ||
                          (parseFloat(value) >= 0 && parseFloat(value) <= 100)
                        ) {
                          handleInputChange("ministryExamPercentage", value);
                        }
                      }}
                      placeholder="Enter Ministry Exam percentage (0-100)"
                      className="mt-2 h-11 md:h-12 text-base"
                      required={isAcceptanceLetterReceived}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Percentage range: 0.00 to 100.00
                    </p>
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

      {isStudentsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsStudentsModalOpen(false)}
          ></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Registered Students</h3>
              <button
                onClick={() => setIsStudentsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search by name or national ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ef3131]"
                />
              </div>
              <div className="max-h-[50vh] overflow-auto">
                {isLoadingStudents ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ef3131]"></div>
                    <span className="ml-2 text-gray-600">
                      Loading students...
                    </span>
                  </div>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="py-2 px-3">Name</th>
                        <th className="py-2 px-3">National ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students
                        .filter((s) => {
                          const name = (s.fullName || "")
                            .toString()
                            .toLowerCase();
                          const nid = (s.nationalId || "").toString();
                          const q = searchQuery.trim().toLowerCase();
                          if (!q) return true;
                          return name.includes(q) || nid.includes(q);
                        })
                        .map((s) => (
                          <tr key={s.id} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-3">{s.fullName || "-"}</td>
                            <td className="py-2 px-3">{s.nationalId || "-"}</td>
                          </tr>
                        ))}
                      {students.length === 0 && (
                        <tr>
                          <td
                            colSpan="2"
                            className="py-4 text-center text-gray-500"
                          >
                            No students yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end">
              <button
                className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
                onClick={() => setIsStudentsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterStudentPage;
