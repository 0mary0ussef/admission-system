"use client";

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Label from "../components/ui/Label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { RadioGroup, RadioGroupItem } from "../components/ui/RadioGroup";
import { examAPI } from "../utils/api";

const GetExamPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [examData, setExamData] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(2 * 60); // 2 minutes in seconds
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [showFullScreenWarning, setShowFullScreenWarning] = useState(false);
  const [showTeacherExtension, setShowTeacherExtension] = useState(false);
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [extensionMinutes] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use ref to store current answers for timer access
  const answersRef = useRef({});

  // Calculate progress
  const progress = examData
    ? (() => {
        const totalQuestions = examData.sections.reduce(
          (sum, section) =>
            sum + (examData.questionsData[section.sectionName]?.length || 0),
          0
        );
        const answeredQuestions = Object.keys(answers).length;
        return totalQuestions > 0
          ? (answeredQuestions / totalQuestions) * 100
          : 0;
      })()
    : 0;

  // Check authentication
  useEffect(() => {
    const nationalId = localStorage.getItem("studentNationalId");
    const examToken = localStorage.getItem("examToken");

    if (!nationalId || !examToken) {
      navigate("/verify-student");
      return;
    }

    // Load exam data
    loadExamData();
  }, [navigate]);

  // Update answers ref when answers state changes
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const loadExamData = async () => {
    try {
      setIsLoading(true);

      // Get sections
      const sectionsResponse = await examAPI.getSections();
      const sections = sectionsResponse.data;

      // Get questions for each section
      const questionsData = {};
      for (const section of sections) {
        const questionsResponse = await examAPI.getQuestionsBySection(
          section.sectionName
        );
        questionsData[section.sectionName] = questionsResponse.data.questions;
      }

      setExamData({ sections, questionsData });

      // Start timer
      const examStartTime = Date.now();
      localStorage.setItem("examStartTime", examStartTime.toString());
    } catch (err) {
      console.error("Error loading exam data:", err);
      setError("Failed to load exam data. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (!examData) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;

        if (newTime <= 0) {
          clearInterval(timer);
          // Auto-submit exam
          handleAutoSubmit();
          return 0;
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examData]); // Removed answers dependency to prevent timer recreation

  // Security: Prevent exit, fullscreen, etc.
  useEffect(() => {
    // Enter full-screen mode when exam starts
    const enterFullScreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch {
        // Full-screen not supported or denied
      }
    };

    if (examData) {
      enterFullScreen();
    }

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    const handleKeyDown = (e) => {
      if (
        e.key === "F11" ||
        e.key === "Escape" ||
        (e.altKey && e.key === "F4") ||
        (e.ctrlKey &&
          (e.key === "w" ||
            e.key === "W" ||
            e.key === "t" ||
            e.key === "T" ||
            e.key === "n" ||
            e.key === "N"))
      ) {
        e.preventDefault();
        e.stopPropagation();
        setShowExitWarning(true);
        return false;
      }
    };

    const handleFullScreenChange = () => {
      if (!document.fullscreenElement) {
        // Immediately try to re-enter full-screen
        setTimeout(async () => {
          try {
            await document.documentElement.requestFullscreen();
          } catch {
            setShowFullScreenWarning(true);
          }
        }, 100);
      }
    };

    const handleWindowBlur = () => {
      setShowExitWarning(true);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setShowExitWarning(true);
      }
    };

    const handleClickOutside = (e) => {
      // If click is outside the main exam container, show warning
      const examContainer = document.querySelector(".exam-container");
      if (examContainer && !examContainer.contains(e.target)) {
        e.preventDefault();
        e.stopPropagation();
        setShowExitWarning(true);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("click", handleClickOutside, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [examData]);

  const handleAnswer = (questionId, answerIndex) => {
    setAnswers((prev) => {
      const newAnswers = {
        ...prev,
        [questionId]: answerIndex,
      };
      // Update ref for timer access
      answersRef.current = newAnswers;
      return newAnswers;
    });
  };

  const handleSubmitExam = async () => {
    try {
      setIsSubmitting(true);

      const nationalId = localStorage.getItem("studentNationalId");

      console.log("Manual submit - answers:", answers);
      console.log(
        "Manual submit - answers count:",
        Object.keys(answers).length
      );

      // Submit answers
      await examAPI.submitAnswers({
        nationalId,
        answers: Object.entries(answers).map(([questionId, answerIndex]) => ({
          questionId: parseInt(questionId),
          chosenAnswer: answerIndex.toString(),
        })),
      });

      // Clear exam data
      localStorage.removeItem("examToken");
      localStorage.removeItem("examStartTime");

      // Redirect to completion page
      navigate("/exam-completed");
    } catch (err) {
      console.error("Error submitting exam:", err);
      setError("Failed to submit exam. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-submit function for timer (uses ref to get current answers)
  const handleAutoSubmit = async () => {
    try {
      setIsSubmitting(true);

      const nationalId = localStorage.getItem("studentNationalId");
      const currentAnswers = answersRef.current;

      console.log("Auto-submitting answers:", currentAnswers);

      // Submit answers
      await examAPI.submitAnswers({
        nationalId,
        answers: Object.entries(currentAnswers).map(
          ([questionId, answerIndex]) => ({
            questionId: parseInt(questionId),
            chosenAnswer: answerIndex.toString(),
          })
        ),
      });

      // Clear exam data
      localStorage.removeItem("examToken");
      localStorage.removeItem("examStartTime");

      // Redirect to completion page
      navigate("/exam-completed");
    } catch (err) {
      console.error("Error auto-submitting exam:", err);
      setError("Failed to submit exam. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTeacherExtension = async () => {
    try {
      // Validate teacher credentials and get extension
      await examAPI.requestTimeExtension({
        nationalId: localStorage.getItem("studentNationalId"),
        teacherEmail,
        teacherPassword,
        extensionMinutes,
      });

      // Add extension time
      setTimeLeft((prev) => prev + extensionMinutes * 60);
      setShowTeacherExtension(false);
      setTeacherEmail("");
      setTeacherPassword("");
    } catch {
      setError("Invalid teacher credentials or extension request failed.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ef3131] mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الامتحان...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <svg
                className="w-12 h-12 mx-auto"
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
            <h3 className="text-lg font-semibold mb-2">Error Loading Exam</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-[#ef3131] hover:bg-red-600"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!examData) return null;

  const currentSectionData = examData.sections[currentSection];
  const currentQuestions =
    examData.questionsData[currentSectionData?.sectionName] || [];
  const currentQuestionData = currentQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 exam-container">
      {/* Header with Timer and Exit Button */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => setShowExitWarning(true)}
              className="inline-flex items-center text-[#ef3131] hover:underline font-medium cursor-pointer"
              disabled={isSubmitting}
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
              Exit Exam
            </button>

            {/* Timer Display */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <svg
                  className="h-5 w-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-lg font-bold text-red-500">
                  {Math.floor(timeLeft / 60)}:
                  {(timeLeft % 60).toString().padStart(2, "0")}
                </span>
              </div>

              {/* Time Extension Button - Show when less than 10 minutes left */}
              {timeLeft <= 600 && timeLeft > 0 && (
                <Button
                  onClick={() => setShowTeacherExtension(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 text-sm rounded-full"
                  disabled={isSubmitting}
                >
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Request Extension
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-red-500">Exam Progress</h2>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#ef3131] to-red-500 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              {Math.round(progress)}% Complete
            </p>
          </div>

          {/* Subject Navigation */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {examData.sections.map((section, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentSection(index);
                    setCurrentQuestion(0);
                  }}
                  disabled={isSubmitting}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                    currentSection === index
                      ? "bg-white text-[#ef3131] shadow-sm border-b-2 border-[#ef3131]"
                      : "text-gray-600 hover:text-[#ef3131] hover:bg-white/50"
                  } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {section.sectionName}
                </button>
              ))}
            </div>
          </div>

          <Card className="border-0 shadow-2xl bg-white overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#ef3131] to-red-500 text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">
                  {currentSectionData?.sectionName}
                </CardTitle>
                <div className="text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full text-red-500">
                  Question {currentQuestion + 1} of {currentQuestions.length}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div
                className={`space-y-8 ${
                  currentSectionData?.sectionName === "Arabic" ? "rtl" : "ltr"
                }`}
              >
                <div
                  className={`bg-gray-50 p-6 rounded-lg border-l-4 border-[#ef3131] ${
                    currentSectionData?.sectionName === "Arabic"
                      ? "border-l-0 border-r-4"
                      : ""
                  }`}
                >
                  <h3
                    className={`text-xl font-semibold text-gray-900 leading-relaxed ${
                      currentSectionData?.sectionName === "Arabic"
                        ? "text-right"
                        : "text-left"
                    }`}
                  >
                    {currentQuestionData?.questionTitle}
                  </h3>
                </div>

                <RadioGroup
                  value={answers[currentQuestionData?.id]?.toString() || ""}
                  onValueChange={(value) =>
                    handleAnswer(
                      currentQuestionData?.id,
                      Number.parseInt(value)
                    )
                  }
                  className="space-y-4"
                  disabled={isSubmitting}
                >
                  {currentQuestionData &&
                    [
                      currentQuestionData.choice1,
                      currentQuestionData.choice2,
                      currentQuestionData.choice3,
                      currentQuestionData.choice4,
                    ].map((option, index) => (
                      <div
                        key={index}
                        className={`flex items-start p-4 border rounded-lg transition-all duration-200 cursor-pointer group ${
                          currentSectionData?.sectionName === "Arabic"
                            ? "flex-row-reverse space-x-reverse space-x-3"
                            : "space-x-3"
                        } ${
                          answers[currentQuestionData.id] === index
                            ? "border-[#ef3131] bg-red-50 shadow-md"
                            : "border-gray-200 hover:border-[#ef3131] hover:bg-red-50"
                        } ${
                          isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        onClick={() =>
                          !isSubmitting &&
                          handleAnswer(currentQuestionData.id, index)
                        }
                      >
                        <RadioGroupItem
                          value={index.toString()}
                          id={`option-${index}`}
                          className="mt-1"
                          disabled={isSubmitting}
                        />
                        <Label
                          htmlFor={`option-${index}`}
                          className={`cursor-pointer flex-1 text-lg leading-relaxed transition-colors duration-200 ${
                            currentSectionData?.sectionName === "Arabic"
                              ? "text-right"
                              : "text-left"
                          } ${
                            answers[currentQuestionData.id] === index
                              ? "text-[#ef3131] font-medium"
                              : "group-hover:text-[#ef3131]"
                          } ${isSubmitting ? "cursor-not-allowed" : ""}`}
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                </RadioGroup>

                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentQuestion((prev) => Math.max(0, prev - 1))
                    }
                    disabled={
                      (currentSection === 0 && currentQuestion === 0) ||
                      isSubmitting ||
                      !currentQuestionData
                    }
                    className="px-6 py-3 rounded-full border-2 hover:border-[#ef3131] hover:text-[#ef3131] transition-all duration-200"
                  >
                    <svg
                      className="h-5 w-5 mr-2"
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
                    Previous
                  </Button>

                  <Button
                    onClick={() => {
                      if (
                        currentQuestion === currentQuestions.length - 1 &&
                        currentSection === examData.sections.length - 1
                      ) {
                        handleSubmitExam();
                      } else {
                        if (currentQuestion === currentQuestions.length - 1) {
                          setCurrentSection((prev) => prev + 1);
                          setCurrentQuestion(0);
                        } else {
                          setCurrentQuestion((prev) => prev + 1);
                        }
                      }
                    }}
                    disabled={
                      answers[currentQuestionData?.id] === undefined ||
                      isSubmitting
                    }
                    className="bg-[#ef3131] hover:bg-red-600 px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </div>
                    ) : currentQuestion === currentQuestions.length - 1 &&
                      currentSection === examData.sections.length - 1 ? (
                      "Finish Exam"
                    ) : (
                      "Next"
                    )}
                    {!isSubmitting && (
                      <svg
                        className="h-5 w-5 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Exit Warning Modal */}
      {showExitWarning && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-10 flex items-center justify-center z-50 p-4">
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
              <h3 className="text-xl font-bold text-gray-900">Exit Exam?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to exit the exam? Your progress will be lost
              and you'll need to start over.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowExitWarning(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Clear exam data when exiting
                  localStorage.removeItem("examTimeLeft");
                  localStorage.removeItem("examStartTime");
                  localStorage.removeItem("examToken");
                  localStorage.removeItem("studentNationalId");
                  navigate("/");
                }}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={isSubmitting}
              >
                Exit Exam
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Warning Modal */}
      {showFullScreenWarning && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-10 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-orange-600"
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
                Full Screen Required
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              The exam must be taken in full-screen mode. Please return to
              full-screen to continue.
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={async () => {
                  try {
                    await document.documentElement.requestFullscreen();
                    setShowFullScreenWarning(false);
                  } catch {
                    // Full-screen request denied
                  }
                }}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                Return to Full Screen
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Extension Modal */}
      {showTeacherExtension && (
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Teacher Extension
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Please ask a teacher to enter their credentials to grant you
              additional time.
            </p>

            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="teacher-email"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Teacher Email:
                </Label>
                <input
                  id="teacher-email"
                  type="email"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="teacher@school.com"
                />
              </div>

              <div>
                <Label
                  htmlFor="teacher-password"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Teacher Password:
                </Label>
                <input
                  id="teacher-password"
                  type="password"
                  value={teacherPassword}
                  onChange={(e) => setTeacherPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter password"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowTeacherExtension(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleTeacherExtension}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Request Extension
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetExamPage;
