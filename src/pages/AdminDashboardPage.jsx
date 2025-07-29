"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Label from "../components/ui/Label";
import Badge from "../components/ui/Badge";
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
import { useStudents } from "../hooks/useStudents";
import { useAuth } from "../context/AuthContext";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { adminToken } = useAuth();
  const {
    searchTerm,
    setSearchTerm,
    editingStudent,
    editScores,
    setEditScores,
    interviewScore,
    setInterviewScore,
    editingInterviewScore,
    setEditingInterviewScore,
    filteredStudents,
    handleEditScores,
    saveScores,
    handleEditInterviewScore,
    saveInterviewScore,
    calculatePercentage,
    stats,
    sortBy,
    sortOrder,
    handleSort,
    isLoading,
    error,
    isSubmitting,
  } = useStudents();

  const [showInterviewConfirmation, setShowInterviewConfirmation] =
    useState(false);
  const [pendingInterviewChange, setPendingInterviewChange] = useState(null);

  useEffect(() => {
    // Check if admin is authenticated
    if (!adminToken) {
      navigate("/admin/login");
    }
  }, [adminToken, navigate]);

  useEffect(() => {
    if (showInterviewConfirmation) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showInterviewConfirmation]);

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Passed Ministry Exam
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.withAcceptanceLetter}
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

          <Card className="border border-gray-200 shadow-none bg-white rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">%</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(stats.averageScore)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6 border border-gray-200 shadow-none bg-white rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow
                      key={student.id}
                      className="align-middle border-b last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{student.fullName}</div>
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
                      </TableCell>
                      <TableCell>
                        {editingInterviewScore === student.id ? (
                          <div className="space-y-2 min-w-[120px]">
                            <div className="flex items-center">
                              <Input
                                type="number"
                                placeholder="Score"
                                value={interviewScore}
                                onChange={(e) =>
                                  setInterviewScore(
                                    Number.parseInt(e.target.value) || 0
                                  )
                                }
                                className="h-8"
                                max="40"
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setPendingInterviewChange({
                                    studentId: student.id,
                                    newScore: interviewScore,
                                    studentName: student.fullName,
                                    oldScore: student.interviewScore || 0,
                                  });
                                  setShowInterviewConfirmation(true);
                                }}
                                className="bg-[#ef3131] hover:bg-red-600"
                                disabled={isSubmitting}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingInterviewScore(null)}
                                disabled={isSubmitting}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium">
                              {student.interviewScore || 0}/40
                            </div>
                            <button
                              onClick={() =>
                                handleEditInterviewScore(student.id)
                              }
                              className="text-gray-400 hover:text-gray-600"
                              disabled={isSubmitting}
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
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-blue-600">
                          {calculatePercentage(student)}%
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

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
                to{" "}
                <span className="font-semibold text-blue-600">
                  {pendingInterviewChange.newScore}/40
                </span>
                ?
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
                <p className="text-gray-600">
                  New Score: {pendingInterviewChange.newScore}/40
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowInterviewConfirmation(false);
                  setPendingInterviewChange(null);
                  setEditingInterviewScore(null);
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
    </div>
  );
};

export default AdminDashboardPage;
