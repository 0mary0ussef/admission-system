"use client";

import { useState } from "react";

const mockStudents = [
  {
    id: 1,
    name: "Ahmed Mohamed Ali",
    nationalId: "12345678901234",
    mathScore: 85,
    englishScore: 78,
    thirdPrepScore: 82,
    acceptanceLetter: true,
    dateOfBirth: "2008-05-15",
    location: "Cairo, Egypt",
    phone: "+201234567890",
    email: "ahmed.mohamed@email.com",
    softwareInterviewScore: 0,
    mathInterviewScore: 0,
    englishInterviewScore: 0,
    arabicInterviewScore: 0,
    interviewScore: 0,
    totalScore: 0,
    status: "Pending",
  },
  {
    id: 2,
    name: "Fatima Hassan Ibrahim",
    nationalId: "98765432109876",
    mathScore: 92,
    englishScore: 88,
    thirdPrepScore: 90,
    acceptanceLetter: true,
    dateOfBirth: "2008-03-22",
    location: "Alexandria, Egypt",
    phone: "+201987654321",
    email: "fatima.hassan@email.com",
    softwareInterviewScore: 85,
    mathInterviewScore: 80,
    englishInterviewScore: 88,
    arabicInterviewScore: 82,
    interviewScore: 35,
    totalScore: 335,
    status: "Pending",
  },
  {
    id: 3,
    name: "Omar Khaled Mahmoud",
    nationalId: "11223344556677",
    mathScore: 76,
    englishScore: 82,
    thirdPrepScore: 79,
    acceptanceLetter: false,
    dateOfBirth: "2008-07-10",
    location: "Giza, Egypt",
    phone: "+201122334455",
    email: "omar.khaled@email.com",
    softwareInterviewScore: 0,
    mathInterviewScore: 0,
    englishInterviewScore: 0,
    arabicInterviewScore: 0,
    interviewScore: 0,
    totalScore: 0,
    status: "Pending",
  },
];

export const useStudents = () => {
  const [students, setStudents] = useState(mockStudents);
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

  // Calculate percentage for a student
  const calculatePercentage = (student) => {
    const examTotal =
      student.softwareInterviewScore +
      student.mathInterviewScore +
      student.englishInterviewScore +
      student.arabicInterviewScore;
    const interviewTotal = student.interviewScore || 0;

    // Exam scores are 60% of total (15 each for 4 subjects)
    const examPercentage = (examTotal / 60) * 60;
    // Interview score is 40% of total
    const interviewPercentage = (interviewTotal / 40) * 40;

    return Math.round(examPercentage + interviewPercentage);
  };

  const filteredStudents = students
    .filter(
      (student) =>
        (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.nationalId.includes(searchTerm) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (statusFilter === "all" || student.status === statusFilter)
    )
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "prepScore":
          aValue = a.thirdPrepScore;
          bValue = b.thirdPrepScore;
          break;
        case "percentage":
          aValue = calculatePercentage(a);
          bValue = calculatePercentage(b);
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "name":
        default:
          aValue = a.name;
          bValue = b.name;
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
        softwareInterviewScore: student.softwareInterviewScore,
        mathInterviewScore: student.mathInterviewScore,
        englishInterviewScore: student.englishInterviewScore,
        arabicInterviewScore: student.arabicInterviewScore,
      });
    }
  };

  const saveScores = () => {
    if (editingStudent) {
      setStudents((prev) =>
        prev.map((student) => {
          if (student.id === editingStudent) {
            const totalScore =
              editScores.softwareInterviewScore +
              editScores.mathInterviewScore +
              editScores.englishInterviewScore +
              editScores.arabicInterviewScore;
            return {
              ...student,
              ...editScores,
              totalScore,
            };
          }
          return student;
        })
      );
      setEditingStudent(null);
    }
  };

  const updateStudentStatus = (studentId, status) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, status } : student
      )
    );
  };

  const stats = {
    totalStudents: students.length,
    withAcceptanceLetter: students.filter((s) => s.acceptanceLetter).length,
    interviewed: students.filter((s) => s.totalScore > 0).length,
    averageScore:
      students
        .filter((s) => s.totalScore > 0)
        .reduce((sum, s) => sum + s.totalScore, 0) /
        students.filter((s) => s.totalScore > 0).length || 0,
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

  const saveInterviewScore = () => {
    if (editingInterviewScore) {
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
    }
  };

  return {
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
  };
};
