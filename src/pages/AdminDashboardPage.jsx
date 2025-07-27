"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
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
import Badge from "../components/ui/Badge";
import { useStudents } from "../hooks/useStudents";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
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
    updateStudentStatus,
    stats,
    sortBy,
    sortOrder,
    handleSort,
    statusFilter,
    setStatusFilter,
  } = useStudents();

  const [showStatusConfirmation, setShowStatusConfirmation] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [showInterviewConfirmation, setShowInterviewConfirmation] =
    useState(false);
  const [pendingInterviewChange, setPendingInterviewChange] = useState(null);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (showStatusConfirmation || showInterviewConfirmation) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showStatusConfirmation, showInterviewConfirmation]);

  useEffect(() => {
    // Check if admin is authenticated
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/");
  };

  const openWhatsApp = (phone) => {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanPhone}`, "_blank");
  };

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
              onClick={handleLogout}
              variant="outline"
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
                    Acceptance Letters
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
                variant={sortBy === "prepScore" ? "default" : "outline"}
                onClick={() => handleSort("prepScore")}
                className={`flex items-center space-x-2 ${
                  sortBy === "prepScore"
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
                  Prep Score{" "}
                  {sortBy === "prepScore" && (sortOrder === "desc" ? "↓" : "↑")}
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

              <div className="flex items-center space-x-2 ml-auto">
                <label className="text-sm font-medium text-gray-700">
                  Filter by Status:
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ef3131] focus:border-transparent"
                >
                  <option value="all">All Students</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Waitlisted">Waitlisted</option>
                </select>
              </div>
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
                    <TableHead>Acceptance</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Exam Scores</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Interview Score</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Status</TableHead>
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
                          <div className="font-medium">{student.name}</div>
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
                          <div>Prep: {student.thirdPrepScore}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            student.acceptanceLetter ? "default" : "secondary"
                          }
                        >
                          {student.acceptanceLetter ? "Received" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openWhatsApp(student.phone)}
                            className="w-full"
                          >
                            <svg
                              className="h-3 w-3 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                              />
                            </svg>
                            WhatsApp
                          </Button>
                          <div className="text-xs text-gray-500">
                            {student.phone}
                          </div>
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
                              />
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                onClick={saveScores}
                                className="bg-[#ef3131] hover:bg-red-600"
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditScores(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm">
                            <div>SW: {student.softwareInterviewScore}</div>
                            <div>Math: {student.mathInterviewScore}</div>
                            <div>Eng: {student.englishInterviewScore}</div>
                            <div>Ar: {student.arabicInterviewScore}</div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-[#ef3131]">
                          {student.totalScore}
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
                              />
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setPendingInterviewChange({
                                    studentId: student.id,
                                    newScore: interviewScore,
                                    studentName: student.name,
                                    oldScore: student.interviewScore || 0,
                                  });
                                  setShowInterviewConfirmation(true);
                                }}
                                className="bg-[#ef3131] hover:bg-red-600"
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingInterviewScore(null)}
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
                      <TableCell>
                        <select
                          value={student.status}
                          onChange={(e) => {
                            setPendingStatusChange({
                              studentId: student.id,
                              newStatus: e.target.value,
                              studentName: student.name,
                              oldStatus: student.status,
                            });
                            setShowStatusConfirmation(true);
                          }}
                          className="text-sm border rounded p-1 cursor-pointer"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Waitlisted">Waitlisted</option>
                        </select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Change Confirmation Modal */}
      {showStatusConfirmation && pendingStatusChange && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-10 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Confirm Status Change
              </h3>
            </div>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to change the status of{" "}
                <span className="font-semibold text-gray-900">
                  {pendingStatusChange.studentName}
                </span>{" "}
                from{" "}
                <span className="font-semibold text-gray-900">
                  {pendingStatusChange.oldStatus}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-[#ef3131]">
                  {pendingStatusChange.newStatus}
                </span>
                ?
              </p>
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p className="font-medium text-gray-700 mb-1">
                  Status Change Details:
                </p>
                <p className="text-gray-600">
                  Student: {pendingStatusChange.studentName}
                </p>
                <p className="text-gray-600">
                  Current Status: {pendingStatusChange.oldStatus}
                </p>
                <p className="text-gray-600">
                  New Status: {pendingStatusChange.newStatus}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowStatusConfirmation(false);
                  setPendingStatusChange(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  updateStudentStatus(
                    pendingStatusChange.studentId,
                    pendingStatusChange.newStatus
                  );
                  setShowStatusConfirmation(false);
                  setPendingStatusChange(null);
                }}
                className="flex-1 bg-[#ef3131] hover:bg-red-600"
              >
                Confirm Change
              </Button>
            </div>
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
              >
                Confirm Score
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
