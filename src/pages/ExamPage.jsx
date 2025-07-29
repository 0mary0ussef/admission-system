"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExam } from "../hooks/useExam";
import Button from "../components/ui/Button";
import Label from "../components/ui/Label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { RadioGroup, RadioGroupItem } from "../components/ui/RadioGroup";

const ExamPage = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes in seconds
  const [showFullScreenWarning, setShowFullScreenWarning] = useState(false);

  const {
    currentSection,
    currentQuestion,
    answers,
    isCompleted,
    showExitWarning,
    progress,
    currentQuestionKey,
    currentQuestionData,
    handleAnswer,
    nextQuestion,
    prevQuestion,
    setShowExitWarning,

    examSections,
    setCurrentSection,
    setCurrentQuestion,
  } = useExam();

  useEffect(() => {
    // Check if student is authenticated
    const token = localStorage.getItem("studentToken");
    if (!token) {
      navigate("/verify");
      return;
    }

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

    enterFullScreen();

    // Start timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-submit exam when time runs out
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isCompleted) {
        e.preventDefault();
        e.returnValue = "";
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

    const handleKeyDown = (e) => {
      // Prevent F11, Alt+F4, Ctrl+W, ESC, etc.
      if (
        e.key === "F11" ||
        e.key === "Escape" ||
        (e.altKey && e.key === "F4") ||
        (e.ctrlKey && e.key === "w") ||
        (e.ctrlKey && e.key === "W") ||
        (e.ctrlKey && e.key === "t") ||
        (e.ctrlKey && e.key === "T") ||
        (e.ctrlKey && e.key === "n") ||
        (e.ctrlKey && e.key === "N")
      ) {
        e.preventDefault();
        e.stopPropagation();
        setShowFullScreenWarning(true);
        return false;
      }
    };

    const handleWindowBlur = () => {
      setShowFullScreenWarning(true);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setShowFullScreenWarning(true);
      }
    };

    const handleClickOutside = (e) => {
      // If click is outside the main exam container, show warning
      const examContainer = document.querySelector(".exam-container");
      if (examContainer && !examContainer.contains(e.target)) {
        e.preventDefault();
        e.stopPropagation();
        setShowFullScreenWarning(true);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("keydown", handleKeyDown, true); // Use capture phase
    document.addEventListener(
      "keyup",
      (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      true
    );
    document.addEventListener("click", handleClickOutside, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener(
        "keyup",
        (e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
          }
        },
        true
      );
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [isCompleted]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (showExitWarning) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showExitWarning]);

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="py-12">
          <div className="max-w-2xl mx-auto px-4">
            <Card className="border-0 shadow-2xl bg-white">
              <CardHeader className="text-center bg-gradient-to-r from-[#ef3131] to-red-500 text-white rounded-t-lg">
                <CardTitle className="text-3xl font-bold">
                  Exam Completed!
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 text-center">
                <div className="space-y-6">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <svg
                      className="w-12 h-12 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Thank you for taking the exam!
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <Button
                      onClick={() => navigate("/")}
                      className="w-full bg-[#ef3131] hover:bg-red-600 py-3 rounded-full font-semibold text-lg"
                    >
                      Return to Home
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 exam-container">
      {/* Header with Timer and Exit Button */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => setShowExitWarning(true)}
              className="inline-flex items-center text-[#ef3131] hover:underline font-medium cursor-pointer"
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
              {examSections.map((section, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentSection(index);
                    setCurrentQuestion(0);
                  }}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                    currentSection === index
                      ? "bg-white text-[#ef3131] shadow-sm border-b-2 border-[#ef3131]"
                      : "text-gray-600 hover:text-[#ef3131] hover:bg-white/50"
                  }`}
                >
                  {section.name}
                </button>
              ))}
            </div>
          </div>

          <Card className="border-0 shadow-2xl bg-white overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#ef3131] to-red-500 text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">
                  {examSections[currentSection].name}
                </CardTitle>
                <div className="text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full text-red-500">
                  Question {currentQuestion + 1} of{" "}
                  {examSections[currentSection].questions.length}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div
                className={`space-y-8 ${
                  examSections[currentSection].name === "Arabic" ? "rtl" : "ltr"
                }`}
              >
                <div
                  className={`bg-gray-50 p-6 rounded-lg border-l-4 border-[#ef3131] ${
                    examSections[currentSection].name === "Arabic"
                      ? "border-l-0 border-r-4"
                      : ""
                  }`}
                >
                  <h3
                    className={`text-xl font-semibold text-gray-900 leading-relaxed ${
                      examSections[currentSection].name === "Arabic"
                        ? "text-right"
                        : "text-left"
                    }`}
                  >
                    {currentQuestionData.question}
                  </h3>
                </div>

                <RadioGroup
                  value={answers[currentQuestionKey]?.toString() || ""}
                  onValueChange={(value) =>
                    handleAnswer(Number.parseInt(value))
                  }
                  className="space-y-4"
                >
                  {currentQuestionData.options.map((option, index) => (
                    <div
                      key={index}
                      className={`flex items-start p-4 border rounded-lg transition-all duration-200 cursor-pointer group ${
                        examSections[currentSection].name === "Arabic"
                          ? "flex-row-reverse space-x-reverse space-x-3"
                          : "space-x-3"
                      } ${
                        answers[currentQuestionKey] === index
                          ? "border-[#ef3131] bg-red-50 shadow-md"
                          : "border-gray-200 hover:border-[#ef3131] hover:bg-red-50"
                      }`}
                      onClick={() => handleAnswer(index)}
                    >
                      <RadioGroupItem
                        value={index.toString()}
                        id={`option-${index}`}
                        className="mt-1"
                      />
                      <Label
                        htmlFor={`option-${index}`}
                        className={`cursor-pointer flex-1 text-lg leading-relaxed transition-colors duration-200 ${
                          examSections[currentSection].name === "Arabic"
                            ? "text-right"
                            : "text-left"
                        } ${
                          answers[currentQuestionKey] === index
                            ? "text-[#ef3131] font-medium"
                            : "group-hover:text-[#ef3131]"
                        }`}
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={prevQuestion}
                    disabled={currentSection === 0 && currentQuestion === 0}
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
                    onClick={nextQuestion}
                    disabled={answers[currentQuestionKey] === undefined}
                    className="bg-[#ef3131] hover:bg-red-600 px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {currentSection === examSections.length - 1 &&
                    currentQuestion ===
                      examSections[currentSection].questions.length - 1
                      ? "Finish Exam"
                      : "Next"}
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
              >
                Cancel
              </Button>
              <Button
                onClick={() => navigate("/")}
                className="flex-1 bg-red-600 hover:bg-red-700"
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
    </div>
  );
};

export default ExamPage;
