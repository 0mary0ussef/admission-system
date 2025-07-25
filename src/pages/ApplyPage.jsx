"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Label from "../components/ui/Label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Alert, AlertDescription } from "../components/ui/Alert";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const ApplyPage = () => {
  const [nationalId, setNationalId] = useState("");
  const [isValidated, setIsValidated] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    previousSchool: "",
    mathGrade: "",
    englishGrade: "",
    arabicGrade: "",
  });

  const validateNationalId = () => {
    if (nationalId.length !== 14) {
      setError("National ID must be 14 digits");
      return;
    }

    // Simulate validation - in real app, this would check against database
    const validIds = ["12345678901234", "98765432109876"]; // Mock valid IDs
    if (validIds.includes(nationalId)) {
      setIsValidated(true);
      setError("");
    } else {
      setError(
        "National ID not found in our records. Please contact administration."
      );
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In real app, this would submit to backend
    alert(
      "Application submitted successfully! You will receive an email with exam details."
    );
  };

  if (!isValidated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-12">
          <div className="max-w-md mx-auto px-4">
            <Link
              to="/"
              className="inline-flex items-center text-[#ef3131] hover:underline mb-6"
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
              Back to Home
            </Link>

            <Card>
              <CardHeader>
                <CardTitle className="text-center text-[#ef3131]">
                  Student Application
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nationalId">National ID</Label>
                    <Input
                      id="nationalId"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      placeholder="Enter your 14-digit National ID"
                      maxLength={14}
                    />
                  </div>

                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-700">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={validateNationalId}
                    className="w-full bg-[#ef3131] hover:bg-red-600"
                  >
                    Validate ID
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-12">
        <div className="max-w-2xl mx-auto px-4">
          <Link
            to="/"
            className="inline-flex items-center text-[#ef3131] hover:underline mb-6"
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
            Back to Home
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="text-center text-[#ef3131]">
                Application Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Personal Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) =>
                          handleInputChange("dateOfBirth", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                {/* Parent Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Parent/Guardian Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="parentName">Parent/Guardian Name</Label>
                      <Input
                        id="parentName"
                        value={formData.parentName}
                        onChange={(e) =>
                          handleInputChange("parentName", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="parentPhone">Parent Phone</Label>
                      <Input
                        id="parentPhone"
                        value={formData.parentPhone}
                        onChange={(e) =>
                          handleInputChange("parentPhone", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="parentEmail">Parent Email</Label>
                      <Input
                        id="parentEmail"
                        type="email"
                        value={formData.parentEmail}
                        onChange={(e) =>
                          handleInputChange("parentEmail", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Academic Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="previousSchool">Previous School</Label>
                      <Input
                        id="previousSchool"
                        value={formData.previousSchool}
                        onChange={(e) =>
                          handleInputChange("previousSchool", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="mathGrade">Math Grade (Third Prep)</Label>
                      <Input
                        id="mathGrade"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.mathGrade}
                        onChange={(e) =>
                          handleInputChange("mathGrade", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="englishGrade">
                        English Grade (Third Prep)
                      </Label>
                      <Input
                        id="englishGrade"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.englishGrade}
                        onChange={(e) =>
                          handleInputChange("englishGrade", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="arabicGrade">
                        Arabic Grade (Third Prep)
                      </Label>
                      <Input
                        id="arabicGrade"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.arabicGrade}
                        onChange={(e) =>
                          handleInputChange("arabicGrade", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#ef3131] hover:bg-red-600"
                >
                  Submit Application
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

export default ApplyPage;
