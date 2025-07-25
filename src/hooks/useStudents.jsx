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

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nationalId.includes(searchTerm) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return {
    students,
    setStudents,
    searchTerm,
    setSearchTerm,
    editingStudent,
    setEditingStudent,
    editScores,
    setEditScores,
    filteredStudents,
    handleEditScores,
    saveScores,
    updateStudentStatus,
    stats,
  };
};
