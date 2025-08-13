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
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const StaffDashboardPage = () => {
  const [nationalId, setNationalId] = useState("");
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if staff is authenticated
    const token = localStorage.getItem("staffToken");
    if (!token) {
      navigate("/staff/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("staffToken");
    localStorage.removeItem("staffUsername");
    navigate("/staff/login");
  };

  const searchStudent = async () => {
    if (!nationalId.trim()) {
      setError("Please enter a National ID");
      return;
    }

    setIsLoading(true);
    setError("");
    setStudentData(null);

    try {
      // Search in localStorage for registered students
      const registeredStudents = localStorage.getItem(
        "registeredStudentsLocal"
      );
      const localStudents = registeredStudents
        ? JSON.parse(registeredStudents)
        : [];

      // Search in localStorage for completed student info
      const completedStudents = localStorage.getItem("completedStudentsLocal");
      const completedInfo = completedStudents
        ? JSON.parse(completedStudents)
        : [];

      // Find student in registered students
      const registeredStudent = localStudents.find(
        (s) => s.nationalId === nationalId.trim()
      );

      // Find completed info for this student
      const completedStudent = completedInfo.find(
        (s) => s.nationalId === nationalId.trim()
      );

      if (registeredStudent || completedStudent) {
        setStudentData({
          ...registeredStudent,
          ...completedStudent,
          nationalId: nationalId.trim(),
        });
        setSuccess("Student found successfully!");
      } else {
        setError("Student not found with this National ID");
      }
    } catch (err) {
      setError("Error searching for student. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStudent = () => {
    if (studentData) {
      // Navigate to edit page with student data
      navigate("/staff/edit-student", {
        state: { studentData },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <Link
              to="/apply-options"
              className="inline-flex items-center text-[#ef3131] hover:underline font-medium"
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
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-[#ef3131] text-[#ef3131] hover:bg-[#ef3131] hover:text-white"
            >
              Logout
            </Button>
          </div>

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
                    d="M9 12l6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold">
                Staff Admin Dashboard
              </CardTitle>
              <p className="text-white/90 font-light">
                Search and manage student information
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

              {/* Search Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Search Student
                </h3>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label
                      htmlFor="nationalId"
                      className="text-base font-medium text-gray-700"
                    >
                      National ID:
                    </Label>
                    <Input
                      id="nationalId"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      placeholder="Enter National ID (14 digits)"
                      className="mt-2 h-11 md:h-12 text-base"
                      maxLength={14}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={searchStudent}
                      disabled={isLoading}
                      className="bg-[#ef3131] hover:bg-red-600 h-11 md:h-12 px-6"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Searching...
                        </div>
                      ) : (
                        "Search"
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Student Information Display */}
              {studentData && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Student Information
                    </h3>
                    <Button
                      onClick={handleEditStudent}
                      className="bg-[#ef3131] hover:bg-red-600"
                    >
                      Edit Student
                    </Button>
                  </div>

                  {/* Basic Information */}
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h4 className="text-md font-semibold text-blue-900 mb-4">
                      Basic Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-blue-700">
                          Full Name
                        </Label>
                        <p className="text-blue-900 font-medium">
                          {studentData.fullName ||
                            studentData.studentName ||
                            "Not provided"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-blue-700">
                          National ID
                        </Label>
                        <p className="text-blue-900 font-medium">
                          {studentData.nationalId}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-blue-700">
                          Date of Birth
                        </Label>
                        <p className="text-blue-900 font-medium">
                          {studentData.dateOfBirth
                            ? new Date(
                                studentData.dateOfBirth
                              ).toLocaleDateString("en-GB")
                            : "Not provided"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-blue-700">
                          Study Type
                        </Label>
                        <p className="text-blue-900 font-medium">
                          {studentData.isArabicStudy
                            ? "عربي"
                            : studentData.isLanguagesStudy
                            ? "لغات"
                            : "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Academic Scores */}
                  {(studentData.mathScore ||
                    studentData.englishScore ||
                    studentData.finalYearScore) && (
                    <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                      <h4 className="text-md font-semibold text-green-900 mb-4">
                        Academic Scores
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {studentData.mathScore && (
                          <div>
                            <Label className="text-sm font-medium text-green-700">
                              Math Score
                            </Label>
                            <p className="text-green-900 font-medium">
                              {studentData.mathScore}/60
                            </p>
                          </div>
                        )}
                        {studentData.englishScore && (
                          <div>
                            <Label className="text-sm font-medium text-green-700">
                              English Score
                            </Label>
                            <p className="text-green-900 font-medium">
                              {studentData.englishScore}/40
                            </p>
                          </div>
                        )}
                        {studentData.finalYearScore && (
                          <div>
                            <Label className="text-sm font-medium text-green-700">
                              Final Year Score
                            </Label>
                            <p className="text-green-900 font-medium">
                              {studentData.finalYearScore}/280
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact Information */}
                  {(studentData.phoneNumber ||
                    studentData.studentPhoneNumber ||
                    studentData.email) && (
                    <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                      <h4 className="text-md font-semibold text-purple-900 mb-4">
                        Contact Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {studentData.phoneNumber && (
                          <div>
                            <Label className="text-sm font-medium text-purple-700">
                              Guardian Phone
                            </Label>
                            <p className="text-purple-900 font-medium">
                              {studentData.phoneNumber}
                            </p>
                          </div>
                        )}
                        {studentData.studentPhoneNumber && (
                          <div>
                            <Label className="text-sm font-medium text-purple-700">
                              Student Phone
                            </Label>
                            <p className="text-purple-900 font-medium">
                              {studentData.studentPhoneNumber}
                            </p>
                          </div>
                        )}
                        {studentData.email && (
                          <div>
                            <Label className="text-sm font-medium text-purple-700">
                              Email
                            </Label>
                            <p className="text-purple-900 font-medium">
                              {studentData.email}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Address Information */}
                  {(studentData.address ||
                    studentData.city ||
                    studentData.district) && (
                    <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                      <h4 className="text-md font-semibold text-orange-900 mb-4">
                        Address Information
                      </h4>
                      <div className="space-y-3">
                        {studentData.address && (
                          <div>
                            <Label className="text-sm font-medium text-orange-700">
                              Full Address
                            </Label>
                            <p className="text-orange-900 font-medium">
                              {studentData.address}
                            </p>
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {studentData.city && (
                            <div>
                              <Label className="text-sm font-medium text-orange-700">
                                City/Province
                              </Label>
                              <p className="text-orange-900 font-medium">
                                {studentData.city}
                              </p>
                            </div>
                          )}
                          {studentData.district && (
                            <div>
                              <Label className="text-sm font-medium text-orange-700">
                                District
                              </Label>
                              <p className="text-orange-900 font-medium">
                                {studentData.district}
                              </p>
                            </div>
                          )}
                          {studentData.streetName && (
                            <div>
                              <Label className="text-sm font-medium text-orange-700">
                                Street Name
                              </Label>
                              <p className="text-orange-900 font-medium">
                                {studentData.streetName}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default StaffDashboardPage;
