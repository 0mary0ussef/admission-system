"use client";

import { useState, useEffect } from "react";
import { studentAPI } from "../utils/api";

const examSections = [
  {
    name: "Arabic",
    questions: [
      {
        question: "ما هو المفعول به في الجملة التالية: 'قرأ أحمد الكتاب'؟",
        options: ["أحمد", "قرأ", "الكتاب", "لا يوجد"],
        correct: 2,
      },
      {
        question: "أي من الكلمات التالية مؤنث؟",
        options: ["قلم", "كتاب", "مدرسة", "بيت"],
        correct: 2,
      },
    ],
  },
  {
    name: "Math",
    questions: [
      {
        question: "What is the value of x in the equation: 2x + 5 = 15?",
        options: ["5", "10", "7.5", "2.5"],
        correct: 0,
      },
      {
        question: "What is the area of a circle with radius 4?",
        options: ["8π", "16π", "4π", "32π"],
        correct: 1,
      },
    ],
  },
  {
    name: "English",
    questions: [
      {
        question: "Choose the correct form: 'She _____ to school every day.'",
        options: ["go", "goes", "going", "gone"],
        correct: 1,
      },
      {
        question: "What is the past tense of 'write'?",
        options: ["writed", "wrote", "written", "writing"],
        correct: 1,
      },
    ],
  },
  {
    name: "Software Basics",
    questions: [
      {
        question: "What does HTML stand for?",
        options: [
          "Hyper Text Markup Language",
          "High Tech Modern Language",
          "Home Tool Markup Language",
          "Hyperlink and Text Markup Language",
        ],
        correct: 0,
      },
      {
        question: "Which of the following is a programming language?",
        options: ["HTML", "CSS", "Python", "All of the above"],
        correct: 3,
      },
    ],
  },
];

export const useExam = () => {
  const [currentSection, setCurrentSection] = useState(() => {
    const saved = localStorage.getItem("examCurrentSection");
    return saved ? parseInt(saved) : 0;
  });

  const [currentQuestion, setCurrentQuestion] = useState(() => {
    const saved = localStorage.getItem("examCurrentQuestion");
    return saved ? parseInt(saved) : 0;
  });

  const [answers, setAnswers] = useState(() => {
    const saved = localStorage.getItem("examAnswers");
    return saved ? JSON.parse(saved) : {};
  });

  const [isCompleted, setIsCompleted] = useState(() => {
    const saved = localStorage.getItem("examCompleted");
    return saved === "true";
  });

  const [showExitWarning, setShowExitWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Persist current section
  useEffect(() => {
    localStorage.setItem("examCurrentSection", currentSection.toString());
  }, [currentSection]);

  // Persist current question
  useEffect(() => {
    localStorage.setItem("examCurrentQuestion", currentQuestion.toString());
  }, [currentQuestion]);

  // Persist answers
  useEffect(() => {
    localStorage.setItem("examAnswers", JSON.stringify(answers));
  }, [answers]);

  // Persist completion status
  useEffect(() => {
    localStorage.setItem("examCompleted", isCompleted.toString());
  }, [isCompleted]);

  const totalQuestions = examSections.reduce(
    (sum, section) => sum + section.questions.length,
    0
  );
  const answeredQuestions = Object.keys(answers).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  const currentQuestionKey = `${currentSection}-${currentQuestion}`;
  const currentQuestionData =
    examSections[currentSection].questions[currentQuestion];

  const handleAnswer = (answerIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionKey]: answerIndex,
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    let total = 0;

    examSections.forEach((section, sectionIndex) => {
      section.questions.forEach((question, questionIndex) => {
        const key = `${sectionIndex}-${questionIndex}`;
        total++;
        if (answers[key] === question.correct) {
          correct++;
        }
      });
    });

    return { correct, total, percentage: Math.round((correct / total) * 100) };
  };

  const calculateSectionScores = () => {
    const scores = {
      arabic: 0,
      math: 0,
      english: 0,
      software: 0,
    };

    examSections.forEach((section, sectionIndex) => {
      let sectionCorrect = 0;
      let sectionTotal = section.questions.length;

      section.questions.forEach((question, questionIndex) => {
        const key = `${sectionIndex}-${questionIndex}`;
        if (answers[key] === question.correct) {
          sectionCorrect++;
        }
      });

      const sectionScore = Math.round((sectionCorrect / sectionTotal) * 15); // Max score of 15 per subject

      switch (section.name.toLowerCase()) {
        case "arabic":
          scores.arabic = sectionScore;
          break;
        case "math":
          scores.math = sectionScore;
          break;
        case "english":
          scores.english = sectionScore;
          break;
        case "software basics":
          scores.software = sectionScore;
          break;
      }
    });

    return scores;
  };

  const submitExam = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const nationalId = localStorage.getItem("studentNationalId");
      if (!nationalId) {
        throw new Error("Student National ID not found");
      }

      const scores = calculateSectionScores();

      const response = await studentAPI.submitExam({
        nationalId: nationalId,
        mathScore: scores.math,
        englishScore: scores.english,
        arabicScore: scores.arabic,
        softwareScore: scores.software,
      });

      // Handle both new and old response formats
      const message = response.data?.message || "Exam submitted successfully";
      console.log(message);

      setIsCompleted(true);

      // Clear exam data after successful submission
      localStorage.removeItem("examCurrentSection");
      localStorage.removeItem("examCurrentQuestion");
      localStorage.removeItem("examAnswers");
      localStorage.removeItem("examCompleted");
    } catch (error) {
      console.error("Exam submission error:", error);

      // Handle specific error messages from backend
      if (error.response?.data) {
        setSubmitError(error.response.data);
      } else if (error.message) {
        setSubmitError(error.message);
      } else {
        setSubmitError("Failed to submit exam. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextQuestion = async () => {
    if (currentQuestion < examSections[currentSection].questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentSection < examSections.length - 1) {
      setCurrentSection(currentSection + 1);
      setCurrentQuestion(0);
    } else {
      // This is the last question, submit the exam
      await submitExam();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      setCurrentQuestion(examSections[currentSection - 1].questions.length - 1);
    }
  };

  return {
    examSections,
    currentSection,
    currentQuestion,
    answers,
    isCompleted,
    showExitWarning,
    setShowExitWarning,
    totalQuestions,
    answeredQuestions,
    progress,
    currentQuestionKey,
    currentQuestionData,
    handleAnswer,
    nextQuestion,
    prevQuestion,
    calculateScore,
    setCurrentSection,
    setCurrentQuestion,
    isSubmitting,
    submitError,
  };
};
