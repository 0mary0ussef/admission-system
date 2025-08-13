"use client";

import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
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
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const StaffEditStudentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentName: "",
    nationalId: "",
    mathScore: "",
    englishScore: "",
    finalYearScore: "",
    ministryExamPercentage: "",
    dateOfBirth: "",
    parentOccupation: "",
    address: "",
    city: "",
    district: "",
    streetName: "",
    buildingNo: "",
    phoneNumber: "",
    studentPhoneNumber: "",
    isArabicStudy: false,
    isLanguagesStudy: false,
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Check if staff is authenticated
    const token = localStorage.getItem("staffToken");
    if (!token) {
      navigate("/staff/login");
      return;
    }

    // Get student data from navigation state
    if (location.state?.studentData) {
      const student = location.state.studentData;
      setFormData({
        studentName: student.studentName || student.fullName || "",
        nationalId: student.nationalId || "",
        mathScore: student.mathScore || "",
        englishScore: student.englishScore || student.english || "",
        finalYearScore: student.finalYearScore || student.prepScore || "",
        ministryExamPercentage:
          student.ministryExamPercentage || student.ministryPercentage || "",
        dateOfBirth: student.dateOfBirth || "",
        parentOccupation: student.parentOccupation || "",
        address: student.address || "",
        city: student.city || "",
        district: student.district || "",
        streetName: student.streetName || "",
        buildingNo: student.buildingNo || "",
        phoneNumber: student.phoneNumber || "",
        studentPhoneNumber: student.studentPhoneNumber || "",
        isArabicStudy: student.isArabicStudy || false,
        isLanguagesStudy: student.isLanguagesStudy || false,
        email: student.email || "",
      });
    } else {
      navigate("/staff/dashboard");
    }
  }, [location.state, navigate]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Update student data in localStorage
      const registeredStudents = localStorage.getItem(
        "registeredStudentsLocal"
      );
      const localStudents = registeredStudents
        ? JSON.parse(registeredStudents)
        : [];

      const completedStudents = localStorage.getItem("completedStudentsLocal");
      const completedInfo = completedStudents
        ? JSON.parse(completedStudents)
        : [];

      // Update registered student info
      const updatedRegisteredStudents = localStudents.map((student) =>
        student.nationalId === formData.nationalId
          ? { ...student, ...formData }
          : student
      );

      // Update completed student info
      const updatedCompletedStudents = completedInfo.map((student) =>
        student.nationalId === formData.nationalId
          ? { ...student, ...formData }
          : student
      );

      // Save updated data
      localStorage.setItem(
        "registeredStudentsLocal",
        JSON.stringify(updatedRegisteredStudents)
      );
      localStorage.setItem(
        "completedStudentsLocal",
        JSON.stringify(updatedCompletedStudents)
      );

      setSuccess("Student information updated successfully!");

      // Redirect back to dashboard after a short delay
      setTimeout(() => {
        navigate("/staff/dashboard");
      }, 2000);
    } catch (err) {
      setError("Failed to update student information. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/staff/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <Link
              to="/staff/dashboard"
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
              Back to Dashboard
            </Link>
          </div>

          <Card className="border-0 shadow-2xl bg-white">
            <CardHeader className="text-center bg-gradient-to-r from-[#ef3131] to-red-500 text-white">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold">
                Edit Student Information
              </CardTitle>
              <p className="text-white/90 font-light">
                Update student details and information
              </p>
            </CardHeader>
            <CardContent className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600 text-sm">{success}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Basic Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="studentName"
                        className="text-base font-medium text-gray-700"
                      >
                        Student Name:
                      </Label>
                      <Input
                        id="studentName"
                        value={formData.studentName}
                        onChange={(e) =>
                          handleInputChange("studentName", e.target.value)
                        }
                        placeholder="Enter student's full name"
                        className="mt-2 h-11 md:h-12 text-base"
                        required
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="nationalId"
                        className="text-base font-medium text-gray-700"
                      >
                        National ID:
                      </Label>
                      <Input
                        id="nationalId"
                        value={formData.nationalId}
                        onChange={(e) =>
                          handleInputChange(
                            "nationalId",
                            e.target.value.replace(/\D/g, "").slice(0, 14)
                          )
                        }
                        placeholder="Enter National ID (14 digits)"
                        className="mt-2 h-11 md:h-12 text-base"
                        maxLength={14}
                        required
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="dateOfBirth"
                        className="text-base font-medium text-gray-700"
                      >
                        Date of Birth:
                      </Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) =>
                          handleInputChange("dateOfBirth", e.target.value)
                        }
                        className="mt-2 h-11 md:h-12 text-base"
                        required
                        max={new Date().toISOString().split("T")[0]}
                      />
                    </div>

                    <div>
                      <Label className="text-base font-medium text-gray-700">
                        Study Type:
                      </Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            id="isArabicStudy"
                            name="studyType"
                            checked={formData.isArabicStudy}
                            onChange={() =>
                              setFormData((prev) => ({
                                ...prev,
                                isArabicStudy: true,
                                isLanguagesStudy: false,
                              }))
                            }
                            className="w-4 h-4 text-[#ef3131] bg-gray-100 border-gray-300 focus:ring-[#ef3131] focus:ring-2"
                          />
                          <Label
                            htmlFor="isArabicStudy"
                            className="text-base font-medium text-gray-700"
                          >
                            عربي
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            id="isLanguagesStudy"
                            name="studyType"
                            checked={formData.isLanguagesStudy}
                            onChange={() =>
                              setFormData((prev) => ({
                                ...prev,
                                isArabicStudy: false,
                                isLanguagesStudy: true,
                              }))
                            }
                            className="w-4 h-4 text-[#ef3131] bg-gray-100 border-gray-300 focus:ring-[#ef3131] focus:ring-2"
                          />
                          <Label
                            htmlFor="isLanguagesStudy"
                            className="text-base font-medium text-gray-700"
                          >
                            لغات
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic Scores */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Academic Scores
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label
                        htmlFor="mathScore"
                        className="text-base font-medium text-gray-700"
                      >
                        Math Score:
                      </Label>
                      <Input
                        id="mathScore"
                        type="number"
                        min="0"
                        max="60"
                        value={formData.mathScore}
                        onChange={(e) =>
                          handleInputChange("mathScore", e.target.value)
                        }
                        placeholder="Enter Math score (0-60)"
                        className="mt-2 h-11 md:h-12 text-base"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="englishScore"
                        className="text-base font-medium text-gray-700"
                      >
                        English Score:
                      </Label>
                      <Input
                        id="englishScore"
                        type="number"
                        min="0"
                        max="40"
                        value={formData.englishScore}
                        onChange={(e) =>
                          handleInputChange("englishScore", e.target.value)
                        }
                        placeholder="Enter English score (0-40)"
                        className="mt-2 h-11 md:h-12 text-base"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="finalYearScore"
                        className="text-base font-medium text-gray-700"
                      >
                        Final Year Score:
                      </Label>
                      <Input
                        id="finalYearScore"
                        type="number"
                        min="0"
                        max="280"
                        value={formData.finalYearScore}
                        onChange={(e) =>
                          handleInputChange("finalYearScore", e.target.value)
                        }
                        placeholder="Enter Final Year score (0-280)"
                        className="mt-2 h-11 md:h-12 text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="ministryExamPercentage"
                      className="text-base font-medium text-gray-700"
                    >
                      Ministry Exam Percentage:
                    </Label>
                    <Input
                      id="ministryExamPercentage"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.ministryExamPercentage}
                      onChange={(e) =>
                        handleInputChange(
                          "ministryExamPercentage",
                          e.target.value
                        )
                      }
                      placeholder="Enter Ministry Exam percentage (0-100)"
                      className="mt-2 h-11 md:h-12 text-base"
                    />
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Personal Information
                  </h3>

                  <div>
                    <Label
                      htmlFor="parentOccupation"
                      className="text-base font-medium text-gray-700"
                    >
                      Parent Occupation:
                    </Label>
                    <Input
                      id="parentOccupation"
                      value={formData.parentOccupation}
                      onChange={(e) =>
                        handleInputChange("parentOccupation", e.target.value)
                      }
                      placeholder="مثال: مهندس، مدرس"
                      className="mt-2 h-11 md:h-12 text-base"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="address"
                      className="text-base font-medium text-gray-700"
                    >
                      Address:
                    </Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      placeholder="أدخل العنوان باللغة العربية"
                      className="mt-2 text-base resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="city"
                        className="text-base font-medium text-gray-700"
                      >
                        City/Province:
                      </Label>
                      <select
                        id="city"
                        value={formData.city}
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
                        className="mt-2 h-11 md:h-12 text-base w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ef3131] focus:border-transparent"
                      >
                        <option value="">اختر المحافظة</option>
                        <option value="القاهرة">القاهرة</option>
                        <option value="الإسكندرية">الإسكندرية</option>
                        <option value="الجيزة">الجيزة</option>
                        <option value="الشرقية">الشرقية</option>
                        <option value="الغربية">الغربية</option>
                        <option value="المنوفية">المنوفية</option>
                        <option value="القليوبية">القليوبية</option>
                        <option value="البحيرة">البحيرة</option>
                        <option value="كفر الشيخ">كفر الشيخ</option>
                        <option value="دمياط">دمياط</option>
                        <option value="الدقهلية">الدقهلية</option>
                        <option value="المنيا">المنيا</option>
                        <option value="أسيوط">أسيوط</option>
                        <option value="سوهاج">سوهاج</option>
                        <option value="قنا">قنا</option>
                        <option value="الأقصر">الأقصر</option>
                        <option value="أسوان">أسوان</option>
                        <option value="بني سويف">بني سويف</option>
                        <option value="الفيوم">الفيوم</option>
                        <option value="الوادي الجديد">الوادي الجديد</option>
                        <option value="مطروح">مطروح</option>
                        <option value="شمال سيناء">شمال سيناء</option>
                        <option value="جنوب سيناء">جنوب سيناء</option>
                        <option value="البحر الأحمر">البحر الأحمر</option>
                        <option value="بورسعيد">بورسعيد</option>
                        <option value="الإسماعيلية">الإسماعيلية</option>
                        <option value="السويس">السويس</option>
                      </select>
                    </div>

                    <div>
                      <Label
                        htmlFor="district"
                        className="text-base font-medium text-gray-700"
                      >
                        District:
                      </Label>
                      <Input
                        id="district"
                        value={formData.district}
                        onChange={(e) =>
                          handleInputChange("district", e.target.value)
                        }
                        placeholder="مثال: المعادي"
                        className="mt-2 h-11 md:h-12 text-base"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="streetName"
                        className="text-base font-medium text-gray-700"
                      >
                        Street Name:
                      </Label>
                      <Input
                        id="streetName"
                        value={formData.streetName}
                        onChange={(e) =>
                          handleInputChange("streetName", e.target.value)
                        }
                        placeholder="اسم الشارع"
                        className="mt-2 h-11 md:h-12 text-base"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="buildingNo"
                        className="text-base font-medium text-gray-700"
                      >
                        Building Number:
                      </Label>
                      <Input
                        id="buildingNo"
                        value={formData.buildingNo}
                        onChange={(e) =>
                          handleInputChange("buildingNo", e.target.value)
                        }
                        placeholder="رقم المبنى"
                        className="mt-2 h-11 md:h-12 text-base"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Contact Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="phoneNumber"
                        className="text-base font-medium text-gray-700"
                      >
                        Guardian Phone:
                      </Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) =>
                          handleInputChange(
                            "phoneNumber",
                            e.target.value.replace(/\D/g, "").slice(0, 11)
                          )
                        }
                        placeholder="01012345678"
                        className="mt-2 h-11 md:h-12 text-base"
                        maxLength={11}
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="studentPhoneNumber"
                        className="text-base font-medium text-gray-700"
                      >
                        Student Phone:
                      </Label>
                      <Input
                        id="studentPhoneNumber"
                        type="tel"
                        value={formData.studentPhoneNumber}
                        onChange={(e) =>
                          handleInputChange(
                            "studentPhoneNumber",
                            e.target.value.replace(/\D/g, "").slice(0, 11)
                          )
                        }
                        placeholder="01012345678"
                        className="mt-2 h-11 md:h-12 text-base"
                        maxLength={11}
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="email"
                      className="text-base font-medium text-gray-700"
                    >
                      Email:
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="example@example.com"
                      className="mt-2 h-11 md:h-12 text-base"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="submit"
                    className="flex-1 bg-[#ef3131] hover:bg-red-600 h-12 text-lg font-semibold rounded-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Updating...
                      </div>
                    ) : (
                      "Update Student Information"
                    )}
                  </Button>

                  <Button
                    type="button"
                    onClick={handleCancel}
                    variant="outline"
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 h-12 text-lg font-semibold rounded-full"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default StaffEditStudentPage;
