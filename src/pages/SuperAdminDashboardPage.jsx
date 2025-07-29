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

const SuperAdminDashboardPage = () => {
  const navigate = useNavigate();
  const { adminToken } = useAuth();
  const {
    students,
    searchTerm,
    setSearchTerm,
    filteredStudents,
    sortBy,
    sortOrder,
    handleSort,
    statusFilter,
    setStatusFilter,
    isLoading,
    error,
    isSubmitting,
    updateStudentStatus,
    stats,
  } = useStudents();

  const [showStatusConfirmation, setShowStatusConfirmation] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("Pending");

  useEffect(() => {
    // Check if super admin is authenticated
    if (!adminToken) {
      navigate("/admin/login");
    }
  }, [adminToken, navigate]);

  useEffect(() => {
    if (showStatusConfirmation) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showStatusConfirmation]);

  const calculatePercentage = (student) => {
    const examTotal =
      (student.examMathScore || 0) +
      (student.examEnglishScore || 0) +
      (student.examArabicScore || 0) +
      (student.examSoftwareScore || 0);
    const interviewScores = student.interviewScores || [];
    const interviewTotal =
      interviewScores.length > 0
        ? interviewScores.reduce((sum, score) => sum + score.score, 0) /
          interviewScores.length
        : 0;

    return Math.round(examTotal + interviewTotal);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading students data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-[#ef3131]">
              Super Admin Dashboard
            </h1>
            <Button
              variant="outline"
              onClick={() => {
                localStorage.removeItem("adminToken");
                navigate("/admin/login");
              }}
              className="border-red-500 text-red-500 hover:bg-red-50"
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

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                    <svg
                      className="w-6 h-6 text-red-600"
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
                  <div>
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

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <svg
                      className="w-6 h-6 text-green-600"
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
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Accepted
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {students.filter((s) => s.status === "Accepted").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
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
                        d="M12 14l9-5-9-5-9 5 9 5z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                      />
                    </svg>
                  </div>
                  <div>
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

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Avg Score
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(
                        students.reduce(
                          (sum, s) => sum + calculatePercentage(s),
                          0
                        ) / students.length
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
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
              <input
                type="text"
                placeholder="Search by name, national ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
              />
            </div>
          </div>

          {/* Sorting and Filtering Controls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-wrap gap-2">
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
                    Prep Score{" "}
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
                    Name{" "}
                    {sortBy === "name" && (sortOrder === "desc" ? "↓" : "↑")}
                  </span>
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Filter by Status:
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                >
                  <option value="all">All Students</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Waitlist">Waitlist</option>
                </select>
              </div>
            </div>
          </div>

          {/* Students Table */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Student Applications ({filteredStudents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Info</TableHead>
                      <TableHead>Exam Scores</TableHead>
                      <TableHead>Prep Scores</TableHead>
                      <TableHead>Interview Scores</TableHead>
                      <TableHead>Total Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Contact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-semibold">
                              {student.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {student.nationalId}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.city}, {student.district}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.phoneNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div>Arabic: {student.examArabicScore}/15</div>
                            <div>English: {student.examEnglishScore}/15</div>
                            <div>Math: {student.examMathScore}/15</div>
                            <div>Software: {student.examSoftwareScore}/15</div>
                            <div className="font-bold text-blue-600">
                              Total: {student.examTotal}/60
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div>Math: {student.mathScore}</div>
                            <div>English: {student.englishScore}</div>
                            <div>Prep Score: {student.finalYearScore}</div>
                            <div>
                              Ministry Exam: {student.ministryExamPercentage}%
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            {student.interviewScores &&
                            student.interviewScores.length > 0 ? (
                              student.interviewScores.map((score, index) => (
                                <div key={index}>
                                  {score.admin}: {score.score}/40
                                </div>
                              ))
                            ) : (
                              <div className="text-gray-400">No scores yet</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-blue-600">
                            {calculatePercentage(student)}%
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                String(student.status) === "Accepted"
                                  ? "success"
                                  : String(student.status) === "Waitlist"
                                  ? "warning"
                                  : String(student.status) === "Rejected"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {student.status
                                ? String(student.status)
                                : "Pending"}
                            </Badge>
                            <button
                              onClick={() => {
                                // Ensure status is always a string
                                const currentStatus = student.status
                                  ? String(student.status)
                                  : "Pending";
                                setSelectedStatus(currentStatus);
                                setPendingStatusChange({
                                  studentId: student.id,
                                  studentName: student.fullName,
                                  oldStatus: currentStatus,
                                });
                                setShowStatusConfirmation(true);
                              }}
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
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const message = `Hello ${student.fullName}, this is from El-Sewedy School administration. We would like to discuss your application.`;
                              const whatsappUrl = `https://wa.me/${
                                student.phoneNumber
                              }?text=${encodeURIComponent(message)}`;
                              window.open(whatsappUrl, "_blank");
                            }}
                            className="flex items-center space-x-1 text-green-600 hover:text-green-700"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                            </svg>
                            <span>WhatsApp</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Change Confirmation Modal */}
      {showStatusConfirmation && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white bg-opacity-10 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-red-600"
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
                Change Status?
              </h3>
            </div>
            <div className="mb-4">
              <Label
                htmlFor="status-select"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                Select New Status for {pendingStatusChange?.studentName}:
              </Label>
              <select
                id="status-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                disabled={isSubmitting}
              >
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="Waitlist">Waitlist</option>
              </select>
            </div>
            <p className="text-gray-600 mb-6">
              Current status: <strong>{pendingStatusChange?.oldStatus}</strong>
              <br />
              New status: <strong>{selectedStatus}</strong>
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowStatusConfirmation(false);
                  setPendingStatusChange(null);
                  setSelectedStatus("Pending");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (pendingStatusChange) {
                    updateStudentStatus(
                      pendingStatusChange.studentId,
                      selectedStatus
                    );
                    setShowStatusConfirmation(false);
                    setPendingStatusChange(null);
                    setSelectedStatus("Pending");
                  }
                }}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Confirm Change"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboardPage;
