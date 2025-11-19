"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import { Presentation, Cpu, Puzzle, Users, Award } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/Table";
import { usePagination } from "../hooks/usePagination";
import Pagination from "../components/ui/Pagination";
import { adminAPI } from "../utils/api";
import StudentDetailsModal from "../components/StudentDetailsModal";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const {
    students,
    allStudents,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    isLoading,
    error,
    searchTerm,
    debouncedSearchTerm,
    statusFilter,
    sortBy,
    sortOrder,
    currentAdminRole,
    handlePageChange,
    handlePageSizeChange,
    handleSearch,
    handleStatusFilter,
    handleSort,
    refreshData,
    setError,
  } = usePagination();

  const [editingStudent, setEditingStudent] = useState(null);
  const [editScores, setEditScores] = useState({
    softwareInterviewScore: 0,
    mathInterviewScore: 0,
    englishInterviewScore: 0,
    arabicInterviewScore: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showInterviewConfirmation, setShowInterviewConfirmation] =
    useState(false);
  const [pendingInterviewChange, setPendingInterviewChange] = useState(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [scoreModalStudent, setScoreModalStudent] = useState(null);
  const [scoreInputs, setScoreInputs] = useState({
    presentation: "",
    technical: "",
    problemSolving: "",
    communication: "",
  });
  const [scoreInputErrors, setScoreInputErrors] = useState({});
  const [showStudentDetailsModal, setShowStudentDetailsModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const scoreTotalPreview =
    (Number(scoreInputs.presentation) || 0) +
    (Number(scoreInputs.technical) || 0) +
    (Number(scoreInputs.problemSolving) || 0) +
    (Number(scoreInputs.communication) || 0);

  // Calculate percentage for a student
  const calculatePercentage = (student) => {
    if (currentAdminRole === "superadmin") {
      // For super admin, use the InterviewPercentage from backend
      return Math.round(student.interviewPercentage || 0);
    } else {
      // For regular admin, calculate based on exam scores + their interview score
      const examTotal =
        (student.examMathScore || 0) +
        (student.examEnglishScore || 0) +
        (student.examArabicScore || 0) +
        (student.examSoftwareScore || 0);
      const interviewTotal = student.interviewScore || 0;

      // Calculate total percentage based on exam and interview scores
      const totalScore = examTotal + interviewTotal;
      return Math.round(totalScore);
    }
  };

  // Handle edit scores
  const handleEditScores = (studentId) => {
    const student = students.find((s) => s.id === studentId);
    if (student) {
      setEditingStudent(studentId);
      setEditScores({
        softwareInterviewScore: student.examSoftwareScore || 0,
        mathInterviewScore: student.examMathScore || 0,
        englishInterviewScore: student.examEnglishScore || 0,
        arabicInterviewScore: student.examArabicScore || 0,
      });
    }
  };

  // Save scores
  const saveScores = async () => {
    if (editingStudent) {
      try {
        setIsSubmitting(true);
        // Note: This would need to be implemented in the backend
        // For now, we'll just refresh the data
        refreshData();
        setEditingStudent(null);
      } catch {
        setError("Failed to save scores");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleOpenScoreModal = (studentId) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;
    setScoreModalStudent(student);
    setScoreInputs({
      presentation: "",
      technical: "",
      problemSolving: "",
      communication: "",
    });
    setScoreInputErrors({});
    setShowScoreModal(true);
  };

  const handleScoreInputChange = (field, rawValue) => {
    let value = rawValue;
    if (value === "") {
      setScoreInputs((prev) => ({ ...prev, [field]: "" }));
      return;
    }

    if (/^\d*\.?\d*$/.test(value)) {
      const numeric = Math.min(10, Math.max(0, parseFloat(value)));
      setScoreInputs((prev) => ({
        ...prev,
        [field]: Number.isNaN(numeric) ? "" : numeric,
      }));
    }
  };

  const closeScoreModal = () => {
    setShowScoreModal(false);
    setScoreModalStudent(null);
    setScoreInputErrors({});
  };

  const validateScoreInputs = () => {
    const errors = {};
    Object.entries(scoreInputs).forEach(([key, value]) => {
      if (value === "" || isNaN(value)) {
        errors[key] = "Required";
      } else if (value < 0 || value > 10) {
        errors[key] = "Score must be between 0 and 10";
      }
    });
    setScoreInputErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleScoreModalSubmit = (event) => {
    event.preventDefault();
    if (!scoreModalStudent) return;
    if (!validateScoreInputs()) return;

    const breakdown = {
      presentation: Number(scoreInputs.presentation) || 0,
      technical: Number(scoreInputs.technical) || 0,
      problemSolving: Number(scoreInputs.problemSolving) || 0,
      communication: Number(scoreInputs.communication) || 0,
    };
    const totalScore =
      breakdown.presentation +
      breakdown.technical +
      breakdown.problemSolving +
      breakdown.communication;

    setPendingInterviewChange({
      studentId: scoreModalStudent.id,
      studentName: scoreModalStudent.fullName,
      oldScore: scoreModalStudent.interviewScore || 0,
      totalScore: Math.round(totalScore * 10) / 10,
      breakdown,
    });
    closeScoreModal();
    setShowInterviewConfirmation(true);
  };

  // Save interview score
  const saveInterviewScore = async () => {
    if (pendingInterviewChange?.studentId) {
      try {
        setIsSubmitting(true);
        await adminAPI.setInterviewScore(
          pendingInterviewChange.studentId,
          pendingInterviewChange.totalScore
        );

        // Refresh data to get updated scores
        refreshData();
        setScoreModalStudent(null);
        setScoreInputs({
          presentation: "",
          technical: "",
          problemSolving: "",
          communication: "",
        });
        setScoreInputErrors({});
      } catch (err) {
        setError(err.response?.data || "Failed to save interview score");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Handle student details modal
  const handleViewStudentDetails = (student) => {
    setSelectedStudent(student);
    setShowStudentDetailsModal(true);
  };

  const handleCloseStudentDetailsModal = () => {
    setShowStudentDetailsModal(false);
    setSelectedStudent(null);
  };

  // Calculate stats for dashboard cards using allStudents for accurate totals
  const stats = {
    totalStudents: allStudents.length,
    withAcceptanceLetter: allStudents.filter((s) => s.ministryExamPercentage >= 50)
      .length,
    interviewed: allStudents.filter((s) => s.interviewScore > 0).length,
    averageScore:
      allStudents
        .filter((s) => s.interviewScore > 0)
        .reduce((sum, s) => sum + (s.interviewScore || 0), 0) /
        allStudents.filter((s) => s.interviewScore > 0).length || 0,
  };

  // Authentication is handled by SessionManager component

  useEffect(() => {
    if (showInterviewConfirmation) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showInterviewConfirmation, showScoreModal]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ef3131] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading students data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-[#ef3131]">
              Admin Dashboard
            </h1>
            <Button
              variant="outline"
              onClick={() => {
                localStorage.removeItem("adminToken");
                navigate("/admin/login");
              }}
              className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border border-gray-200 shadow-none bg-white rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center">
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
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Students
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalStudents}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-none bg-white rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center">
                <svg
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 14l9-5-9-5-9 5 9 5z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                  />
                </svg>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Interviewed
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.interviewed}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6 border border-gray-200 shadow-none bg-white rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 relative">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <Input
                placeholder="Search by name, national ID, or email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className={`flex-1 ${
                  searchTerm !== debouncedSearchTerm
                    ? "bg-blue-50 border-blue-300"
                    : ""
                }`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sort Buttons and Filters */}
        <Card className="mb-6 border border-gray-200 shadow-none bg-white rounded-xl">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2 items-center">
              <Button
                variant={sortBy === "finalYearScore" ? "default" : "outline"}
                onClick={() => handleSort("finalYearScore")}
                className={`flex items-center space-x-2 ${
                  sortBy === "finalYearScore"
                    ? "bg-[#ef3131] hover:bg-red-600"
                    : "border-gray-300 hover:border-[#ef3131] hover:text-[#ef3131]"
                }`}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
                <span>
                  Final Year Score{" "}
                  {sortBy === "finalYearScore" &&
                    (sortOrder === "desc" ? "↓" : "↑")}
                </span>
              </Button>

              <Button
                variant={sortBy === "percentage" ? "default" : "outline"}
                onClick={() => handleSort("percentage")}
                className={`flex items-center space-x-2 ${
                  sortBy === "percentage"
                    ? "bg-[#ef3131] hover:bg-red-600"
                    : "border-gray-300 hover:border-[#ef3131] hover:text-[#ef3131]"
                }`}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
                <span>
                  Percentage{" "}
                  {sortBy === "percentage" &&
                    (sortOrder === "desc" ? "↓" : "↑")}
                </span>
              </Button>

              <Button
                variant={sortBy === "name" ? "default" : "outline"}
                onClick={() => handleSort("name")}
                className={`flex items-center space-x-2 ${
                  sortBy === "name"
                    ? "bg-[#ef3131] hover:bg-red-600"
                    : "border-gray-300 hover:border-[#ef3131] hover:text-[#ef3131]"
                }`}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
                <span>
                  Name {sortBy === "name" && (sortOrder === "desc" ? "↓" : "↑")}
                </span>
              </Button>

              <Button
                variant={sortBy === "interviewScore" ? "default" : "outline"}
                onClick={() => handleSort("interviewScore")}
                className={`flex items-center space-x-2 ${
                  sortBy === "interviewScore"
                    ? "bg-[#ef3131] hover:bg-red-600"
                    : "border-gray-300 hover:border-[#ef3131] hover:text-[#ef3131]"
                }`}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
                <span>
                  Interview Score{" "}
                  {sortBy === "interviewScore" &&
                    (sortOrder === "desc" ? "↓" : "↑")}
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card className="border border-gray-200 shadow-none bg-white rounded-xl">
          <CardHeader className="pb-0">
            <CardTitle>Students Management</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-8 px-6">
            {students.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <div className="text-gray-500 text-lg mb-2">
                  {searchTerm || statusFilter !== "all"
                    ? "No students found matching your criteria"
                    : "No students found in the system"}
                </div>
                <div className="text-gray-400 text-sm">
                  {searchTerm && "Try adjusting your search terms"}
                  {statusFilter !== "all" &&
                    "Try selecting a different status filter"}
                </div>
              </div>
            )}
            {students.length > 0 && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>National ID</TableHead>
                      <TableHead>Prep Scores</TableHead>
                      <TableHead>Ministry Exam %</TableHead>
                      <TableHead>Exam Scores</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Interview Score</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Info</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow
                        key={student.id}
                        className="align-middle border-b last:border-0 hover:bg-gray-50 transition-colors"
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {student.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {student.nationalId}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Math: {student.mathScore}</div>
                            <div>English: {student.englishScore}</div>
                            <div>Final Year: {student.finalYearScore}</div>
                            <div>
                              {(() => {
                                const finalYearScore = parseFloat(student.finalYearScore) || 0;
                                const percentage = (finalYearScore / 280) * 100;
                                return `Final Year%: ${percentage.toFixed(1)}%`;
                              })()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {student.ministryExamPercentage || 0}%
                          </div>
                        </TableCell>
                        <TableCell>
                          {editingStudent === student.id ? (
                            <div className="space-y-2 min-w-[200px]">
                              <div className="flex items-center">
                                <span className="w-16 text-xs">Software:</span>
                                <Input
                                  type="number"
                                  placeholder="Software"
                                  value={editScores.softwareInterviewScore}
                                  onChange={(e) =>
                                    setEditScores((prev) => ({
                                      ...prev,
                                      softwareInterviewScore:
                                        Number.parseInt(e.target.value) || 0,
                                    }))
                                  }
                                  className="h-8"
                                  disabled={isSubmitting}
                                />
                              </div>
                              <div className="flex items-center">
                                <span className="w-16 text-xs">Math:</span>
                                <Input
                                  type="number"
                                  placeholder="Math"
                                  value={editScores.mathInterviewScore}
                                  onChange={(e) =>
                                    setEditScores((prev) => ({
                                      ...prev,
                                      mathInterviewScore:
                                        Number.parseInt(e.target.value) || 0,
                                    }))
                                  }
                                  className="h-8"
                                  disabled={isSubmitting}
                                />
                              </div>
                              <div className="flex items-center">
                                <span className="w-16 text-xs">English:</span>
                                <Input
                                  type="number"
                                  placeholder="English"
                                  value={editScores.englishInterviewScore}
                                  onChange={(e) =>
                                    setEditScores((prev) => ({
                                      ...prev,
                                      englishInterviewScore:
                                        Number.parseInt(e.target.value) || 0,
                                    }))
                                  }
                                  className="h-8"
                                  disabled={isSubmitting}
                                />
                              </div>
                              <div className="flex items-center">
                                <span className="w-16 text-xs">Arabic:</span>
                                <Input
                                  type="number"
                                  placeholder="Arabic"
                                  value={editScores.arabicInterviewScore}
                                  onChange={(e) =>
                                    setEditScores((prev) => ({
                                      ...prev,
                                      arabicInterviewScore:
                                        Number.parseInt(e.target.value) || 0,
                                    }))
                                  }
                                  className="h-8"
                                  disabled={isSubmitting}
                                />
                              </div>
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  onClick={saveScores}
                                  className="bg-[#ef3131] hover:bg-red-600"
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting ? "Saving..." : "Save"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditScores(null)}
                                  disabled={isSubmitting}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm">
                              <div>SW: {student.examSoftwareScore || 0}</div>
                              <div>Math: {student.examMathScore || 0}</div>
                              <div>Eng: {student.examEnglishScore || 0}</div>
                              <div>Ar: {student.examArabicScore || 0}</div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-[#ef3131]">
                            {(student.examMathScore || 0) +
                              (student.examEnglishScore || 0) +
                              (student.examArabicScore || 0) +
                              (student.examSoftwareScore || 0)}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {(() => {
                              const total = (student.examMathScore || 0) +
                                (student.examEnglishScore || 0) +
                                (student.examArabicScore || 0) +
                                (student.examSoftwareScore || 0);
                              const percentage = (total / 60) * 100;
                              return `${percentage.toFixed(1)}%`;
                            })()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2 min-w-[160px]">
                            <div className="text-sm font-medium">
                              {typeof student.interviewScore === "number"
                                ? student.interviewScore.toFixed(1)
                                : student.interviewScore || 0}
                              /40
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenScoreModal(student.id)}
                              disabled={isSubmitting}
                              className="border-[#ef3131] text-[#ef3131] hover:bg-red-50"
                            >
                              {student.interviewScore > 0
                                ? "Edit Score"
                                : "Give Score"}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-blue-600">
                            {calculatePercentage(student)}%
                          </div>
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => handleViewStudentDetails(student)}
                            className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-50"
                            title="View student details"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSize={pageSize}
            totalItems={totalItems}
            pageSizeOptions={[10, 20, 50]}
            showPageSizeSelector={true}
          />
        )}
      </div>

      {/* Interview Score Entry Modal */}
      {showScoreModal && scoreModalStudent && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white via-[#fff5f5] to-white rounded-3xl p-5 md:p-6 max-w-2xl w-full shadow-2xl border border-[#ffd6d6] max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs font-semibold text-[#ef3131] uppercase tracking-[0.3em]">
                  Interview Evaluation
                </p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">
                  {scoreModalStudent.fullName}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  National ID ·{" "}
                  <span className="font-semibold text-gray-700">
                    {scoreModalStudent.nationalId}
                  </span>
                </p>
              </div>
              <button
                onClick={closeScoreModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                type="button"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  fill="none"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleScoreModalSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  {
                    key: "presentation",
                    label: "Presentation Skills",
                    description: "Confidence, clarity and professionalism",
                    icon: Presentation,
                    accent: "from-red-50/80 to-red-100/80",
                  },
                  {
                    key: "technical",
                    label: "Technical / Software Skills",
                    description: "Coding logic, tool familiarity",
                    icon: Cpu,
                    accent: "from-blue-50/80 to-blue-100/80",
                  },
                  {
                    key: "problemSolving",
                    label: "Problem-Solving & Logical Thinking",
                    description: "Analytical depth, creativity",
                    icon: Puzzle,
                    accent: "from-emerald-50/80 to-emerald-100/80",
                  },
                  {
                    key: "communication",
                    label: "Communication & Teamwork",
                    description: "Listening, collaboration, empathy",
                    icon: Users,
                    accent: "from-amber-50/80 to-amber-100/80",
                  },
                ].map((field) => {
                  const Icon = field.icon;
                  return (
                    <label
                      key={field.key}
                      htmlFor={`score-${field.key}`}
                      className={`block rounded-2xl p-5 bg-gradient-to-br ${field.accent} border border-white/80 shadow-sm hover:shadow-lg transition-all cursor-pointer`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-white text-[#ef3131] flex items-center justify-center shadow">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <p className="text-base font-semibold text-gray-900">
                            {field.label}
                          </p>
                          <p className="text-xs text-gray-600 mt-1 h-8">
                            {field.description}
                          </p>
                          <Input
                            id={`score-${field.key}`}
                            type="text"
                            min="0"
                            max="10"
                            step="0.5"
                            value={scoreInputs[field.key]}
                            onChange={(e) =>
                              handleScoreInputChange(field.key, e.target.value)
                            }
                            className={`h-12 text-lg font-semibold bg-white/90 border-2 ${
                              scoreInputErrors[field.key]
                                ? "border-red-400"
                                : "border-transparent"
                            } mt-3 focus:ring-2 focus:ring-[#ef3131]/30`}
                          />
                          {scoreInputErrors[field.key] && (
                            <p className="text-xs text-red-600 mt-2">
                              {scoreInputErrors[field.key]}
                            </p>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="mt-6 bg-white/80 border border-[#ffd6d6] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-[#ef3131]/10 flex items-center justify-center text-[#ef3131]">
                    <Award className="h-7 w-7" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Interview Score</p>
                    <p className="text-4xl font-black text-[#ef3131] tracking-tight">
                      {scoreTotalPreview}/40
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-500 max-w-md">
                  Please review each criterion carefully. You will confirm this
                  breakdown before saving the score.
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeScoreModal}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#ef3131] hover:bg-red-600"
                  disabled={isSubmitting}
                >
                  Review & Submit
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interview Score Confirmation Modal */}
      {showInterviewConfirmation && pendingInterviewChange && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-10 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-blue-600"
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
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Confirm Interview Score
              </h3>
            </div>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to set the interview score for{" "}
                <span className="font-semibold text-gray-900">
                  {pendingInterviewChange.studentName}
                </span>{" "}
                to the following?
              </p>
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p className="font-medium text-gray-700 mb-1">
                  Interview Score Details:
                </p>
                <p className="text-gray-600">
                  Student: {pendingInterviewChange.studentName}
                </p>
                <p className="text-gray-600">
                  Current Score: {pendingInterviewChange.oldScore}/40
                </p>
                <div className="mt-2 space-y-1 text-gray-700">
                  <div>
                    Presentation:{" "}
                    {pendingInterviewChange.breakdown.presentation}/10
                  </div>
                  <div>
                    Technical/Software:{" "}
                    {pendingInterviewChange.breakdown.technical}/10
                  </div>
                  <div>
                    Problem-Solving:{" "}
                    {pendingInterviewChange.breakdown.problemSolving}/10
                  </div>
                  <div>
                    Communication:{" "}
                    {pendingInterviewChange.breakdown.communication}/10
                  </div>
                  <div className="border-t border-dashed border-gray-300 pt-2 font-semibold text-blue-600">
                    Total Score: {pendingInterviewChange.totalScore}/40
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowInterviewConfirmation(false);
                  setPendingInterviewChange(null);
                }}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  saveInterviewScore();
                  setShowInterviewConfirmation(false);
                  setPendingInterviewChange(null);
                }}
                className="flex-1 bg-[#ef3131] hover:bg-red-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Confirm Score"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      <StudentDetailsModal
        student={selectedStudent}
        isOpen={showStudentDetailsModal}
        onClose={handleCloseStudentDetailsModal}
      />
    </div>
  );
};

export default AdminDashboardPage;
