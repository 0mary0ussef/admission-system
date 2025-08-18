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
import { studentAPI } from "../utils/api";

const CompleteStudentInfoPage = () => {
  const [formData, setFormData] = useState({
    nationalId: "",
    parentOccupation: "",
    location: "",
    city: "",
    district: "",
    streetName: "",
    buildingNo: "",
    studentPhoneNumber: "",
    parentPhoneNumber: "",
    isArabicStudy: false,
    isLanguagesStudy: false,
    email: "",
    birthCertificate: null,
    successReport: null,
    tuitionFeeReceipt: null,
    preferencesSheet: null,
  });
  const [studentInfo, setStudentInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isReadOnly, setIsReadOnly] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if National ID exists in localStorage
    const nationalId = localStorage.getItem("studentNationalId");
    if (!nationalId) {
      navigate("/check-national-id");
      return;
    }

    // Load student information from API
    const loadStudentInfo = async () => {
      try {
        const response = await studentAPI.validateNationalId(nationalId);
        const studentData = response.data;
        setStudentInfo(studentData);

        // Check if student has already completed their information
        if (studentData.hasCompletedInfo) {
          setIsReadOnly(true);

          // Load existing data from the student info
          setFormData((prev) => ({
            ...prev,
            nationalId: nationalId,
            parentOccupation: studentData.parentOccupation || "",
            location: studentData.location || "",
            city: studentData.city || "",
            district: studentData.district || "",
            streetName: studentData.streetName || "",
            buildingNo: studentData.buildingNo || "",
            studentPhoneNumber: studentData.phoneNumber || "",
            parentPhoneNumber: studentData.parentPhoneNumber || "",
            email: studentData.email || "",
            isArabicStudy: studentData.previousSchoolType === "عربي",
            isLanguagesStudy: studentData.previousSchoolType === "لغات",
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            nationalId: nationalId,
          }));
        }
      } catch (error) {
        console.error("Error loading student info:", error);
        setError("Failed to load student information. Please try again.");
      }
    };

    loadStudentInfo();
  }, [navigate]);

  const handleInputChange = (field, value) => {
    let processedValue = value;

    // Format phone number as user types
    if (field === "studentPhoneNumber" || field === "parentPhoneNumber") {
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

    if (!formData.parentOccupation) errors.push("مهنة ولي الأمر مطلوبة");
    if (!formData.location) errors.push("العنوان مطلوب");
    if (!formData.city) errors.push("المحافظة مطلوبة");
    if (!formData.district) errors.push("الحي مطلوب");
    if (!formData.streetName) errors.push("اسم الشارع مطلوب");
    if (!formData.buildingNo) errors.push("رقم المبنى مطلوب");
    if (!formData.studentPhoneNumber) errors.push("رقم جوال الطالب مطلوب");
    if (!formData.parentPhoneNumber) errors.push("رقم جوال ولي الأمر مطلوب");
    if (!formData.isArabicStudy && !formData.isLanguagesStudy)
      errors.push("يجب اختيار نوع الدراسة");
    if (!formData.email) errors.push("البريد الإلكتروني مطلوب");

    // Validate phone number (Egyptian format - exactly 11 digits)
    const validateEgyptPhone = (num, label) => {
      if (!num) return;
      const clean = num.replace(/\D/g, "");
      if (clean.length !== 11) {
        errors.push(`${label} يجب أن يكون 11 رقم بالضبط`);
      } else if (!/^01\d{9}$/.test(clean)) {
        errors.push(`${label} يجب أن يكون رقم مصري صحيح (مثال: 01012345678)`);
      }
    };

    validateEgyptPhone(formData.studentPhoneNumber, "رقم جوال الطالب");
    validateEgyptPhone(formData.parentPhoneNumber, "رقم جوال ولي الأمر");

    // Validate email
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.push("يرجى إدخال بريد إلكتروني صحيح");
      }
    }

    return errors;
  };

  const uploadDocuments = async () => {
    const uploadPromises = [];

    if (formData.birthCertificate) {
      uploadPromises.push(
        studentAPI.uploadDocument(
          formData.birthCertificate,
          formData.nationalId,
          "birthcertificate"
        )
      );
    }

    if (formData.successReport) {
      uploadPromises.push(
        studentAPI.uploadDocument(
          formData.successReport,
          formData.nationalId,
          "successreport"
        )
      );
    }

    if (formData.tuitionFeeReceipt) {
      uploadPromises.push(
        studentAPI.uploadDocument(
          formData.tuitionFeeReceipt,
          formData.nationalId,
          "tuitionfeereceipt"
        )
      );
    }

    if (formData.preferencesSheet) {
      uploadPromises.push(
        studentAPI.uploadDocument(
          formData.preferencesSheet,
          formData.nationalId,
          "preferencessheet"
        )
      );
    }

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If form is read-only, just redirect to home
    if (isReadOnly) {
      navigate("/");
      return;
    }

    // Scroll to top to show any validation messages
    window.scrollTo({ top: 0, behavior: "smooth" });

    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join(", "));
      // Scroll to top to show validation errors
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // First upload all documents
      await uploadDocuments();

      // Then submit the student information
      await studentAPI.completeInfo({
        nationalId: formData.nationalId,
        parentOccupation: formData.parentOccupation,
        location: formData.location,
        city: formData.city,
        district: formData.district,
        streetName: formData.streetName,
        buildingNo: formData.buildingNo,
        phoneNumber: formData.studentPhoneNumber,
        parentPhoneNumber: formData.parentPhoneNumber,
        previousSchoolType: formData.isArabicStudy ? "عربي" : "لغات",
        email: formData.email,
      });

      setSuccess("تم إكمال المعلومات بنجاح! جاري التوجيه للصفحة الرئيسية...");

      // Scroll to top of the page
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      // Redirect to home page after a short delay
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error("Submission error:", err);
      setError(
        err.response?.data ||
          "Failed to complete information. Please try again."
      );
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!studentInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ef3131] mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل معلومات الطالب...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />

      <div className="py-8 md:py-12">
        <div className="max-w-2xl mx-auto px-4">
          <Link
            to="/check-national-id"
            className="inline-flex items-center text-[#ef3131] hover:underline mb-8 font-medium"
            dir="ltr"
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
            <CardHeader className="text-center" dir="ltr">
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
                {isReadOnly ? "مراجعة المعلومات" : "إكمال المعلومات"}
              </CardTitle>
              <p className="text-gray-600 font-light">
                {isReadOnly
                  ? "مراجعة معلوماتك المكتملة مسبقاً"
                  : "يرجى تقديم معلوماتك الكاملة للمتابعة مع الطلب"}
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
                    معلومات الطالب
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-blue-700">
                        اسم الطالب
                      </Label>
                      <p className="text-blue-900 font-medium">
                        {studentInfo.name}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-blue-700">
                        الرقم القومي
                      </Label>
                      <p className="text-blue-900 font-medium">
                        {studentInfo.nationalId}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-blue-700">
                        درجة الرياضيات
                      </Label>
                      <p className="text-blue-900 font-medium">
                        {studentInfo.mathScore || "غير محدد"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-blue-700">
                        درجة اللغة الإنجليزية
                      </Label>
                      <p className="text-blue-900 font-medium">
                        {studentInfo.english || "غير محدد"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-blue-700">
                        درجة السنة النهائية
                      </Label>
                      <p className="text-blue-900 font-medium">
                        {studentInfo.prepScore || "غير محدد"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-blue-700">
                        نسبة امتحان الوزارة
                      </Label>
                      <p className="text-blue-900 font-medium">
                        {studentInfo.ministryPercentage || "غير محدد"}%
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-blue-700">
                        تاريخ الميلاد
                      </Label>
                      <p className="text-blue-900 font-medium">
                        {studentInfo.dateOfBirth
                          ? new Date(
                              studentInfo.dateOfBirth
                            ).toLocaleDateString("en-GB")
                          : "غير محدد"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="parentOccupation"
                    className="text-base font-medium"
                  >
                    مهنة ولي الأمر *
                  </Label>
                  <Input
                    id="parentOccupation"
                    value={formData.parentOccupation}
                    onChange={(e) =>
                      handleInputChange("parentOccupation", e.target.value)
                    }
                    placeholder="مثال: مهندس، مدرس"
                    className="mt-2 h-12 text-lg"
                    disabled={isReadOnly}
                  />
                </div>

                <div>
                  <Label htmlFor="location" className="text-base font-medium">
                    العنوان *
                  </Label>
                  <Textarea
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    placeholder="أدخل عنوانك باللغة العربية"
                    className="mt-2 text-lg resize-none"
                    rows={3}
                    disabled={isReadOnly}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="city" className="text-base font-medium">
                      المحافظة *
                    </Label>
                    <select
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      className="mt-2 h-12 text-lg w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ef3131] focus:border-transparent"
                      required
                      disabled={isReadOnly}
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
                    <Label htmlFor="district" className="text-base font-medium">
                      الحي *
                    </Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) =>
                        handleInputChange("district", e.target.value)
                      }
                      placeholder="مثال: المعادي"
                      className="mt-2 h-12 text-lg"
                      disabled={isReadOnly}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label
                      htmlFor="streetName"
                      className="text-base font-medium"
                    >
                      اسم الشارع *
                    </Label>
                    <Input
                      id="streetName"
                      value={formData.streetName}
                      onChange={(e) =>
                        handleInputChange("streetName", e.target.value)
                      }
                      placeholder="اسم الشارع"
                      className="mt-2 h-12 text-lg"
                      disabled={isReadOnly}
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="buildingNo"
                      className="text-base font-medium"
                    >
                      رقم المبنى *
                    </Label>
                    <Input
                      id="buildingNo"
                      value={formData.buildingNo}
                      onChange={(e) =>
                        handleInputChange("buildingNo", e.target.value)
                      }
                      placeholder="رقم المبنى"
                      className="mt-2 h-12 text-lg"
                      disabled={isReadOnly}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label
                      htmlFor="studentPhoneNumber"
                      className="text-base font-medium"
                    >
                      رقم الجوال (الطالب) *
                    </Label>
                    <Input
                      id="studentPhoneNumber"
                      type="tel"
                      value={formData.studentPhoneNumber}
                      onChange={(e) =>
                        handleInputChange("studentPhoneNumber", e.target.value)
                      }
                      placeholder="01012345678"
                      className="mt-2 h-12 text-lg"
                      validation={{ phone: true }}
                      maxLength={11}
                      disabled={isReadOnly}
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="parentPhoneNumber"
                      className="text-base font-medium"
                    >
                      رقم الجوال (ولي الأمر) *
                    </Label>
                    <Input
                      id="parentPhoneNumber"
                      type="tel"
                      value={formData.parentPhoneNumber}
                      onChange={(e) =>
                        handleInputChange("parentPhoneNumber", e.target.value)
                      }
                      placeholder="01012345678"
                      className="mt-2 h-12 text-lg"
                      validation={{ phone: true }}
                      maxLength={11}
                      disabled={isReadOnly}
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <div className="space-y-3">
                    <h3 className="text-base font-medium text-gray-900">
                      نوع الدراسة *
                    </h3>
                    <div className="space-y-2">
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
                          className="w-4 h-4 text-[#ef3131] bg-gray-100 border-gray-300 "
                          disabled={isReadOnly}
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
                          className="w-4 h-4 text-[#ef3131] bg-gray-100 border-gray-300 "
                          disabled={isReadOnly}
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

                <div>
                  <Label htmlFor="email" className="text-base font-medium">
                    البريد الإلكتروني *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="example@example.com"
                    className="mt-2 h-12 text-lg"
                    validation={{ email: true }}
                    disabled={isReadOnly}
                  />
                </div>

                {/* File Upload Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    المستندات المطلوبة (اختيارية)
                  </h3>

                  {isReadOnly && (
                    <Alert className="border-blue-200 bg-blue-50">
                      <svg
                        className="h-4 w-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <AlertDescription className="text-blue-700 font-medium">
                        تم إكمال معلوماتك مسبقاً. يمكنك مراجعة البيانات أدناه
                        ولكن لا يمكن تعديلها.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label
                        htmlFor="birthCertificate"
                        className="text-base font-medium"
                      >
                        شهادة الميلاد
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
                        disabled={isReadOnly}
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="successReport"
                        className="text-base font-medium"
                      >
                        بيان نجاح
                      </Label>
                      <input
                        id="successReport"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          handleFileChange("successReport", e.target.files[0])
                        }
                        className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#ef3131] file:text-white hover:file:bg-red-600 cursor-pointer"
                        disabled={isReadOnly}
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="tuitionFeeReceipt"
                        className="text-base font-medium"
                      >
                        ايصال السداد
                      </Label>
                      <input
                        id="tuitionFeeReceipt"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          handleFileChange(
                            "tuitionFeeReceipt",
                            e.target.files[0]
                          )
                        }
                        className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#ef3131] file:text-white hover:file:bg-red-600 cursor-pointer"
                        disabled={isReadOnly}
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="preferencesSheet"
                        className="text-base font-medium"
                      >
                        ورقة الرغبات
                      </Label>
                      <input
                        id="preferencesSheet"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          handleFileChange(
                            "preferencesSheet",
                            e.target.files[0]
                          )
                        }
                        className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#ef3131] file:text-white hover:file:bg-red-600 cursor-pointer"
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#ef3131] hover:bg-red-600 h-12 text-lg font-semibold rounded-full"
                  disabled={isLoading || isReadOnly}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      جاري الإكمال...
                    </div>
                  ) : isReadOnly ? (
                    "تم إكمال المعلومات مسبقاً"
                  ) : (
                    "إكمال المعلومات والمتابعة"
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
