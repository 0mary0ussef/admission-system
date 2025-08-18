"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Alert, AlertDescription } from "../components/ui/Alert";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { examAPI } from "../utils/api";

const ExcelUploadPage = () => {
  const navigate = useNavigate();
  const { adminToken } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadResult, setUploadResult] = useState(null);

  useEffect(() => {
    // Check if admin is authenticated
    if (!adminToken) {
      navigate("/admin/login");
      return;
    }

    // Check if user is SuperAdmin (this will be handled by the backend)
    // For now, we'll let the backend handle the authorization
  }, [adminToken, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith(".xlsx")) {
        setError("Please select an Excel file (.xlsx)");
        setSelectedFile(null);
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size too large. Maximum size is 10MB.");
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setError("");
      setSuccess("");
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file to upload");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await examAPI.importQuestions(formData);

      setSuccess("Questions imported successfully!");
      setUploadResult(response.data);
      setSelectedFile(null);

      // Reset file input
      const fileInput = document.getElementById("excel-file");
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      console.error("Upload error:", err);
      if (err.response?.status === 403) {
        setError("Access denied. Only SuperAdmin can upload exam questions.");
      } else if (err.response?.status === 401) {
        setError("Authentication required. Please log in again.");
        navigate("/admin/login");
      } else {
        setError(
          err.response?.data || "Failed to upload file. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Create a sample Excel template structure
    const templateData = [
      [
        "Question Title",
        "Choice 1",
        "Choice 2",
        "Choice 3",
        "Choice 4",
        "Correct Answer",
        "Section",
      ],
      ["What is 2 + 2?", "3", "4", "5", "6", "4", "Math"],
      ["What is 5 × 3?", "12", "15", "18", "20", "15", "Math"],
      ["What is 10 ÷ 2?", "3", "4", "5", "6", "5", "Math"],
      ["ما هو ناتج ٢ + ٣؟", "٤", "٥", "٦", "٧", "٥", "MathAR"],
      ["ما هو ناتج ٤ × ٢؟", "٦", "٨", "١٠", "١٢", "٨", "MathAR"],
      ["ما هو ناتج ١٠ ÷ ٢؟", "٣", "٤", "٥", "٦", "٥", "MathAR"],
      [
        "Choose the correct verb form: He _____ to school.",
        "go",
        "goes",
        "going",
        "gone",
        "goes",
        "English",
      ],
      [
        "What is the past tense of 'run'?",
        "runs",
        "running",
        "ran",
        "runned",
        "ran",
        "English",
      ],
      [
        "ما هو جمع كلمة 'كتاب'؟",
        "كتب",
        "كتابات",
        "كتابون",
        "كتابين",
        "كتب",
        "Arabic",
      ],
      [
        "ما هو مفرد كلمة 'أقلام'؟",
        "قلم",
        "قلام",
        "أقلام",
        "قلمون",
        "قلم",
        "Arabic",
      ],
      [
        "What is HTML?",
        "A programming language",
        "A markup language",
        "A database",
        "An operating system",
        "A markup language",
        "Software",
      ],
      [
        "What is CSS used for?",
        "Database management",
        "Styling web pages",
        "Server programming",
        "Mobile app development",
        "Styling web pages",
        "Software",
      ],
    ];

    // Convert to CSV format
    const csvContent = templateData.map((row) => row.join(",")).join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exam_questions_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!adminToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ef3131] mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Upload Exam Questions
            </h1>
            <p className="text-gray-600">
              Upload an Excel file containing exam questions. Only SuperAdmin
              users can access this feature.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <Card className="border-0 smooth-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Upload Excel File
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-700">
                      {success}
                    </AlertDescription>
                  </Alert>
                )}

                <div>
                  <label
                    htmlFor="excel-file"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Select Excel File (.xlsx)
                  </label>
                  <input
                    id="excel-file"
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#ef3131] file:text-white hover:file:bg-red-600 file:cursor-pointer"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum file size: 10MB
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || isLoading}
                    className="flex-1 bg-[#ef3131] hover:bg-red-600"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </div>
                    ) : (
                      "Upload Questions"
                    )}
                  </Button>

                  <Button
                    onClick={downloadTemplate}
                    variant="outline"
                    className="border-gray-300 hover:border-[#ef3131] hover:text-[#ef3131]"
                  >
                    Download Template
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Instructions Section */}
            <Card className="border-0 smooth-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Excel File Format
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Your Excel file should have the following columns:
                  </p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs font-mono space-y-1">
                      <div>
                        <strong>Column A:</strong> Question Title
                      </div>
                      <div>
                        <strong>Column B:</strong> Choice 1
                      </div>
                      <div>
                        <strong>Column C:</strong> Choice 2
                      </div>
                      <div>
                        <strong>Column D:</strong> Choice 3
                      </div>
                      <div>
                        <strong>Column E:</strong> Choice 4
                      </div>
                      <div>
                        <strong>Column F:</strong> Correct Answer
                      </div>
                      <div>
                        <strong>Column G:</strong> Section Name
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Important Notes
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• First row should be headers (will be skipped)</li>
                    <li>• Section names will be created automatically</li>
                    <li>• Empty rows will be ignored</li>
                    <li>
                      • Questions will be assigned to sections based on Column G
                    </li>
                    <li>• Only SuperAdmin users can upload questions</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Supported Sections
                  </h3>
                  <div className="text-sm text-gray-600">
                    <div className="grid grid-cols-2 gap-2">
                      <div>• Arabic</div>
                      <div>• English</div>
                      <div>• Math</div>
                      <div>• Software</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upload Results */}
          {uploadResult && (
            <Card className="mt-8 border-0 smooth-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Upload Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {uploadResult.importedCount}
                    </div>
                    <div className="text-sm text-green-700">
                      Questions Imported
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {uploadResult.questions?.length || 0}
                    </div>
                    <div className="text-sm text-blue-700">
                      Sections Created
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {
                        new Set(
                          uploadResult.questions?.map((q) => q.sectionName) ||
                            []
                        ).size
                      }
                    </div>
                    <div className="text-sm text-purple-700">
                      Unique Sections
                    </div>
                  </div>
                </div>

                {uploadResult.questions &&
                  uploadResult.questions.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Imported Questions Preview
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                        {uploadResult.questions
                          .slice(0, 5)
                          .map((question, index) => (
                            <div
                              key={index}
                              className="mb-3 p-3 bg-white rounded border"
                            >
                              <div className="font-medium text-sm text-gray-900">
                                {question.questionTitle}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Section: {question.sectionName}
                              </div>
                            </div>
                          ))}
                        {uploadResult.questions.length > 5 && (
                          <div className="text-sm text-gray-500 text-center">
                            ... and {uploadResult.questions.length - 5} more
                            questions
                          </div>
                        )}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ExcelUploadPage;
