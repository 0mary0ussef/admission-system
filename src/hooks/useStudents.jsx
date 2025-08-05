"use client";

import { useState, useEffect } from "react";
import { adminAPI } from "../utils/api";

export const useStudents = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);
  const [editScores, setEditScores] = useState({
    softwareInterviewScore: 0,
    mathInterviewScore: 0,
    englishInterviewScore: 0,
    arabicInterviewScore: 0,
  });
  const [interviewScore, setInterviewScore] = useState(0);
  const [editingInterviewScore, setEditingInterviewScore] = useState(null);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentAdminRole, setCurrentAdminRole] = useState("");

  // Fetch students data
  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await adminAPI.getAllStudents();

      // Determine admin role based on response structure
      if (response.data && response.data.length > 0) {
        const firstStudent = response.data[0];
        if (
          firstStudent.hasOwnProperty("interviewScores") &&
          Array.isArray(firstStudent.interviewScores)
        ) {
          // This is super admin view
          setCurrentAdminRole("superadmin");
        } else {
          // This is regular admin view
          setCurrentAdminRole("admin");
        }
      }

      setStudents(response.data);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError(err.response?.data || "Failed to fetch students");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

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

  const filteredStudents = students
    .filter(
      (student) =>
        (student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.nationalId?.includes(searchTerm) ||
          student.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (statusFilter === "all" || String(student.status) === statusFilter)
    )
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "finalYearScore":
          aValue = a.finalYearScore || 0;
          bValue = b.finalYearScore || 0;
          break;
        case "percentage":
          aValue = calculatePercentage(a);
          bValue = calculatePercentage(b);
          break;
        case "status":
          aValue = String(a.status || "Pending");
          bValue = String(b.status || "Pending");
          break;
        case "interviewScore":
          aValue = a.interviewScore || 0;
          bValue = b.interviewScore || 0;
          break;
        case "name":
        default:
          aValue = a.fullName || "";
          bValue = b.fullName || "";
          break;
      }

      if (sortOrder === "desc") {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });

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

  const saveScores = async () => {
    if (editingStudent) {
      try {
        setIsSubmitting(true);
        // Note: This would need to be implemented in the backend
        // For now, we'll just update the local state
        setStudents((prev) =>
          prev.map((student) => {
            if (student.id === editingStudent) {
              return {
                ...student,
                examSoftwareScore: editScores.softwareInterviewScore,
                examMathScore: editScores.mathInterviewScore,
                examEnglishScore: editScores.englishInterviewScore,
                examArabicScore: editScores.arabicInterviewScore,
              };
            }
            return student;
          })
        );
        setEditingStudent(null);
      } catch (err) {
        console.error("Error saving scores:", err);
        setError("Failed to save scores");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const updateStudentStatus = async (studentId, status) => {
    try {
      setIsSubmitting(true);
      await adminAPI.updateStudentStatus(studentId, status);

      // Update local state
      setStudents((prev) =>
        prev.map((student) =>
          student.id === studentId ? { ...student, status } : student
        )
      );
    } catch (err) {
      console.error("Error updating student status:", err);
      setError(err.response?.data || "Failed to update student status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = {
    totalStudents: students.length,
    withAcceptanceLetter: students.filter((s) => s.ministryExamPercentage >= 50)
      .length,
    interviewed: students.filter((s) => {
      if (currentAdminRole === "superadmin") {
        return s.interviewScores && s.interviewScores.length > 0;
      } else {
        return s.interviewScore > 0;
      }
    }).length,
    averageScore:
      students
        .filter((s) => {
          if (currentAdminRole === "superadmin") {
            return s.interviewScores && s.interviewScores.length > 0;
          } else {
            return s.interviewScore > 0;
          }
        })
        .reduce((sum, s) => {
          if (currentAdminRole === "superadmin") {
            return sum + (s.interviewPercentage || 0);
          } else {
            return sum + (s.interviewScore || 0);
          }
        }, 0) /
        students.filter((s) => {
          if (currentAdminRole === "superadmin") {
            return s.interviewScores && s.interviewScores.length > 0;
          } else {
            return s.interviewScore > 0;
          }
        }).length || 0,
  };

  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc"); // Default to descending for scores
    }
  };

  const handleEditInterviewScore = (studentId) => {
    const student = students.find((s) => s.id === studentId);
    if (student) {
      setEditingInterviewScore(studentId);
      setInterviewScore(student.interviewScore || 0);
    }
  };

  const saveInterviewScore = async () => {
    if (editingInterviewScore) {
      try {
        setIsSubmitting(true);
        await adminAPI.setInterviewScore(editingInterviewScore, interviewScore);

        // Update local state
        setStudents((prev) =>
          prev.map((student) => {
            if (student.id === editingInterviewScore) {
              return {
                ...student,
                interviewScore: interviewScore,
              };
            }
            return student;
          })
        );
        setEditingInterviewScore(null);
        setInterviewScore(0);
      } catch (err) {
        console.error("Error saving interview score:", err);
        setError(err.response?.data || "Failed to save interview score");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return {
    students,
    searchTerm,
    setSearchTerm,
    editingStudent,
    setEditingStudent,
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
    isLoading,
    error,
    isSubmitting,
    fetchStudents,
    currentAdminRole,
  };
};
