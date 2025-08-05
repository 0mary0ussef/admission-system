"use client";

import { useState, useEffect } from "react";
import { examAPI } from "../utils/api";

export const useExam = () => {
  const [examSections, setExamSections] = useState([]);
  const [questionsBySection, setQuestionsBySection] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

  // Fetch exam sections and questions on component mount
  useEffect(() => {
    const fetchExamData = async () => {
      try {
        setIsLoading(true);
        setError("");

        // Fetch all sections
        const sectionsResponse = await examAPI.getSections();
        const sections = sectionsResponse.data;
        setExamSections(sections);

        // Fetch questions for each section
        const questionsData = {};
        for (const section of sections) {
          try {
            const questionsResponse = await examAPI.getQuestionsBySection(
              section.sectionName
            );
            questionsData[section.sectionName] =
              questionsResponse.data.questions;
          } catch (error) {
            console.error(
              `Error fetching questions for ${section.sectionName}:`,
              error
            );
            questionsData[section.sectionName] = [];
          }
        }
        setQuestionsBySection(questionsData);
      } catch (error) {
        console.error("Error fetching exam data:", error);
        setError("Failed to load exam data. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExamData();
  }, []);

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

  // Calculate total questions and progress
  const totalQuestions = examSections.reduce(
    (sum, section) =>
      sum + (questionsBySection[section.sectionName]?.length || 0),
    0
  );
  const answeredQuestions = Object.keys(answers).length;
  const progress =
    totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  // Get current question data
  const currentSectionData = examSections[currentSection];
  const currentSectionQuestions = currentSectionData
    ? questionsBySection[currentSectionData.sectionName] || []
    : [];
  const currentQuestionData = currentSectionQuestions[currentQuestion];

  const currentQuestionKey = currentQuestionData
    ? `${currentQuestionData.id}`
    : "";

  const handleAnswer = (answerIndex) => {
    if (currentQuestionData) {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestionKey]: answerIndex,
      }));
    }
  };

  const submitExam = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const nationalId = localStorage.getItem("studentNationalId");
      if (!nationalId) {
        throw new Error("Student National ID not found");
      }

      // Prepare answers in the format expected by the backend
      const answersArray = Object.entries(answers).map(
        ([questionId, chosenAnswer]) => ({
          questionId: parseInt(questionId),
          chosenAnswer: chosenAnswer.toString(),
        })
      );

      const response = await examAPI.submitAnswers({
        nationalId: nationalId,
        answers: answersArray,
      });

      console.log("Exam submitted successfully:", response.data);
      setIsCompleted(true);

      // Clear exam data after successful submission
      localStorage.removeItem("examCurrentSection");
      localStorage.removeItem("examCurrentQuestion");
      localStorage.removeItem("examAnswers");
      localStorage.removeItem("examCompleted");
    } catch (error) {
      console.error("Exam submission error:", error);

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
    if (currentQuestion < currentSectionQuestions.length - 1) {
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
      const prevSectionQuestions =
        questionsBySection[examSections[currentSection - 1]?.sectionName] || [];
      setCurrentSection(currentSection - 1);
      setCurrentQuestion(prevSectionQuestions.length - 1);
    }
  };

  return {
    examSections,
    questionsBySection,
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
    setCurrentSection,
    setCurrentQuestion,
    isSubmitting,
    submitError,
    isLoading,
    error,
  };
};
