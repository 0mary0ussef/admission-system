"use client";

import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { RadioGroup, RadioGroupItem } from "../components/ui/RadioGroup";
import Label from "../components/ui/Label";
import { useExam } from "../hooks/useExam";

const ExamPage = () => {
  const {
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
  } = useExam();

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-[#ef3131]">
                Exam Completed!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <p className="text-green-800 font-semibold text-lg">
                  Exam Completed Successfully!
                </p>
                <p className="text-green-700 mt-2">
                  Thank you for taking the exam. Your results have been
                  submitted and you will be contacted regarding the next steps
                  in the admission process.
                </p>
              </div>

              <Link to="/">
                <Button className="bg-[#ef3131] hover:bg-red-600">
                  Return to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => setShowExitWarning(true)}
              className="inline-flex items-center text-[#ef3131] hover:underline font-medium"
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
            <div className="text-sm text-gray-600 font-medium">
              Question {answeredQuestions + 1} of {totalQuestions}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#ef3131] to-red-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            {Math.round(progress)}% Complete
          </p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#ef3131] to-red-500 text-white">
            <CardTitle className="text-2xl font-bold">
              {examSections[currentSection].name} - Question{" "}
              {currentQuestion + 1}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <h3 className="text-lg font-medium">
                {currentQuestionData.question}
              </h3>

              <RadioGroup
                value={answers[currentQuestionKey]?.toString() || ""}
                onValueChange={(value) => handleAnswer(Number.parseInt(value))}
              >
                {currentQuestionData.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={index.toString()}
                      id={`option-${index}`}
                    />
                    <Label
                      htmlFor={`option-${index}`}
                      className="cursor-pointer"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={prevQuestion}
                  disabled={currentSection === 0 && currentQuestion === 0}
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
                  Previous
                </Button>

                <Button
                  onClick={nextQuestion}
                  disabled={answers[currentQuestionKey] === undefined}
                  className="bg-[#ef3131] hover:bg-red-600 px-8 py-3 rounded-full font-semibold"
                >
                  {currentSection === examSections.length - 1 &&
                  currentQuestion ===
                    examSections[currentSection].questions.length - 1
                    ? "Finish Exam"
                    : "Next"}
                  <svg
                    className="h-4 w-4 ml-2"
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

      {/* Exit Warning Modal */}
      {showExitWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Exit Exam?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to exit the exam? Your progress will be lost
              and you'll need to start over.
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowExitWarning(false)}
                variant="outline"
                className="flex-1"
              >
                Continue Exam
              </Button>
              <Link to="/" className="flex-1">
                <Button className="w-full bg-[#ef3131] hover:bg-red-600">
                  Exit Exam
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamPage;
