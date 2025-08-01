"use client";

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Label from "../components/ui/Label";
import Textarea from "../components/ui/Textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Alert, AlertDescription } from "../components/ui/Alert";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const CompleteStudentInfoPage = () => {
  const [formData, setFormData] = useState({
    studentName: "",
    nationalId: "",
    mathScore: "",
    englishScore: "",
    prepScore: "",
    ministryExamPercentage: "",
    dateOfBirth: "",
    parentOccupation: "",
    address: "",
    city: "",
    district: "",
    streetBuilding: "",
    phoneNumber: "",
    email: "",
    birthCertificate: null,
    successStatement: null,
    paymentReceipt: null,
    desireSheet: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if National ID exists in localStorage
    const nationalId = localStorage.getItem("studentNationalId");
    if (!nationalId) {
      navigate("/check-national-id");
      return;
    }

    // Load student information from localStorage or mock data
    const loadStudentInfo = () => {
      const mockStudentData = {
        studentName: "Ahmed Mohamed Ali",
        nationalId: nationalId,
        mathScore: "85",
        englishScore: "78",
        prepScore: "92",
        ministryExamPercentage: "95.5",
      };

      setFormData((prev) => ({
        ...prev,
        ...mockStudentData,
      }));
    };

    loadStudentInfo();
  }, [navigate]);

  const handleInputChange = (field, value) => {
    let processedValue = value;

    // Format phone number as user types
    if (field === "phoneNumber") {
      // Remove all non-digits
      const digits = value.replace(/\D/g, "");
      // Limit to 11 digits
      const limitedDigits = digits.slice(0, 11);
      processedValue = limitedDigits;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: processedValue,
    }));
  };

  const handleFileChange = (field, file) => {
    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.dateOfBirth) errors.push("Date of Birth is required");
    if (!formData.parentOccupation)
      errors.push("Parent's Occupation is required");
    if (!formData.address) errors.push("Address is required");
    if (!formData.city) errors.push("City is required");
    if (!formData.district) errors.push("District is required");
    if (!formData.streetBuilding)
      errors.push("Street Name and Building Number is required");
    if (!formData.phoneNumber) errors.push("Phone Number is required");
    if (!formData.email) errors.push("Email Address is required");

    // Validate file uploads
    if (!formData.birthCertificate)
      errors.push("Birth Certificate is required");
    if (!formData.successStatement)
      errors.push("Success Statement is required");
    if (!formData.paymentReceipt) errors.push("Payment Receipt is required");
    if (!formData.desireSheet) errors.push("Desire Sheet is required");

    // Validate date format and age requirement (must be 18 or younger on October 1st)
    if (formData.dateOfBirth) {
      const date = new Date(formData.dateOfBirth);
      const today = new Date();
      const currentYear = today.getFullYear();
      const octoberFirst = new Date(currentYear, 9, 1); // October 1st (month is 0-indexed)

      // If today is before October 1st, use previous year
      if (today < octoberFirst) {
        octoberFirst.setFullYear(currentYear - 1);
      }

      const minDate = new Date(octoberFirst.getFullYear() - 18, 9, 1); // 18 years before October 1st
      const maxDate = new Date(octoberFirst.getFullYear() - 1, 9, 1); // 1 year before October 1st

      if (isNaN(date.getTime())) {
        errors.push("Please enter a valid Date of Birth");
      } else if (date < minDate || date > maxDate) {
        errors.push(
          "Student must be 18 years or younger on October 1st of the current academic year"
        );
      }
    }

    // Validate phone number (Egyptian format - exactly 11 digits)
    if (formData.phoneNumber) {
      const cleanPhone = formData.phoneNumber.replace(/\D/g, "");
      if (cleanPhone.length !== 11) {
        errors.push("Phone Number must be exactly 11 digits");
      } else if (!/^01\d{9}$/.test(cleanPhone)) {
        errors.push(
          "Phone Number must be a valid Egyptian number (e.g., 01012345678)"
        );
      }
    }

    // Validate email
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.push("Please enter a valid email address");
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Scroll to top to show any validation messages
    window.scrollTo({ top: 0, behavior: "smooth" });

    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join(", "));
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Store the completed information
    localStorage.setItem("studentInfo", JSON.stringify(formData));
    localStorage.setItem("studentToken", "completed");

    setSuccess("Information completed successfully! Redirecting to home...");

    // Scroll to top of the page
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    // Redirect to home page after a short delay
    setTimeout(() => {
      navigate("/");
    }, 2000);

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="py-8 md:py-12">
        <div className="max-w-2xl mx-auto px-4">
          <Link
            to="/check-national-id"
            className="inline-flex items-center text-[#ef3131] hover:underline mb-8 font-medium"
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
            Back to Check National ID
          </Link>

          <Card className="border-0 smooth-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-[#ef3131]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="h-8 w-8 text-[#ef3131]"
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
              <CardTitle className="text-2xl font-bold text-gray-900">
                Complete Your Information
              </CardTitle>
              <p className="text-gray-600 font-light">
                Please provide your complete information to proceed with the
                application
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <svg
                      className="h-4 w-4 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <AlertDescription className="text-red-700 font-medium">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <svg
                      className="h-4 w-4 text-green-600"
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
                    <AlertDescription className="text-green-700 font-medium">
                      {success}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Student Information Display */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">
                    Student Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-blue-700">
                        Student Name
                      </Label>
                      <p className="text-blue-900 font-medium">
                        {formData.studentName}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-blue-700">
                        National ID
                      </Label>
                      <p className="text-blue-900 font-medium">
                        {formData.nationalId}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-blue-700">
                        Math Score
                      </Label>
                      <p className="text-blue-900 font-medium">
                        {formData.mathScore}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-blue-700">
                        English Score
                      </Label>
                      <p className="text-blue-900 font-medium">
                        {formData.englishScore}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-blue-700">
                        Prep Score
                      </Label>
                      <p className="text-blue-900 font-medium">
                        {formData.prepScore}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-blue-700">
                        Ministry Exam Percentage
                      </Label>
                      <p className="text-blue-900 font-medium">
                        {formData.ministryExamPercentage}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label
                      htmlFor="dateOfBirth"
                      className="text-base font-medium"
                    >
                      Date of Birth *
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        handleInputChange("dateOfBirth", e.target.value)
                      }
                      className="mt-2 h-12 text-lg"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="parentOccupation"
                      className="text-base font-medium"
                    >
                      Parent's Occupation *
                    </Label>
                    <Input
                      id="parentOccupation"
                      value={formData.parentOccupation}
                      onChange={(e) =>
                        handleInputChange("parentOccupation", e.target.value)
                      }
                      placeholder="e.g., Engineer, Teacher"
                      className="mt-2 h-12 text-lg"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="text-base font-medium">
                    Address (in Arabic) *
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="Enter your address in Arabic"
                    className="mt-2 text-lg resize-none"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="city" className="text-base font-medium">
                      City *
                    </Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      placeholder="e.g., Cairo"
                      className="mt-2 h-12 text-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="district" className="text-base font-medium">
                      District *
                    </Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) =>
                        handleInputChange("district", e.target.value)
                      }
                      placeholder="e.g., Maadi"
                      className="mt-2 h-12 text-lg"
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="streetBuilding"
                    className="text-base font-medium"
                  >
                    Street Name, Building Number *
                  </Label>
                  <Input
                    id="streetBuilding"
                    value={formData.streetBuilding}
                    onChange={(e) =>
                      handleInputChange("streetBuilding", e.target.value)
                    }
                    placeholder="Street name and building number"
                    className="mt-2 h-12 text-lg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label
                      htmlFor="phoneNumber"
                      className="text-base font-medium"
                    >
                      Phone Number *
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        handleInputChange("phoneNumber", e.target.value)
                      }
                      placeholder="01012345678"
                      className="mt-2 h-12 text-lg"
                      validation={{ phone: true }}
                      maxLength={11}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-base font-medium">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="example@example.com"
                      className="mt-2 h-12 text-lg"
                      validation={{ email: true }}
                    />
                  </div>
                </div>

                {/* File Upload Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Required Documents
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label
                        htmlFor="birthCertificate"
                        className="text-base font-medium"
                      >
                        شهادة الميلاد *
                      </Label>
                      <input
                        id="birthCertificate"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          handleFileChange(
                            "birthCertificate",
                            e.target.files[0]
                          )
                        }
                        className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#ef3131] file:text-white hover:file:bg-red-600 cursor-pointer"
                        required
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="successStatement"
                        className="text-base font-medium"
                      >
                        بيان نجاح *
                      </Label>
                      <input
                        id="successStatement"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          handleFileChange(
                            "successStatement",
                            e.target.files[0]
                          )
                        }
                        className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#ef3131] file:text-white hover:file:bg-red-600 cursor-pointer"
                        required
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="paymentReceipt"
                        className="text-base font-medium"
                      >
                        ايصال السداد *
                      </Label>
                      <input
                        id="paymentReceipt"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          handleFileChange("paymentReceipt", e.target.files[0])
                        }
                        className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#ef3131] file:text-white hover:file:bg-red-600 cursor-pointer"
                        required
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="desireSheet"
                        className="text-base font-medium"
                      >
                        ورقة الرغبات *
                      </Label>
                      <input
                        id="desireSheet"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          handleFileChange("desireSheet", e.target.files[0])
                        }
                        className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#ef3131] file:text-white hover:file:bg-red-600 cursor-pointer"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#ef3131] hover:bg-red-600 h-12 text-lg font-semibold rounded-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Completing...
                    </div>
                  ) : (
                    "Complete Information & Continue"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CompleteStudentInfoPage;
