"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Label from "../components/ui/Label";
import Textarea from "../components/ui/Textarea";
import Badge from "../components/ui/Badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/Table";
import { useStudents } from "../hooks/useStudents";
import { useAuth } from "../context/AuthContext";
import { adminAPI } from "../utils/api";
import Pagination from "../components/ui/Pagination";

const StaffAdminDashboardPage = () => {
  const navigate = useNavigate();
  const { staffAdminToken } = useAuth();
  const {
    searchTerm,
    setSearchTerm,
    filteredStudents,
    calculatePercentage,
    stats,
    isLoading,
    error,
    currentPage,
    pageSize,
    totalPages,
    totalStudents,
    fetchStudentsForPage,
    changePageSize,
  } = useStudents();

  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  useEffect(() => {
    if (!staffAdminToken) {
      navigate("/admin/login");
    }
  }, [staffAdminToken, navigate]);

  const handleEditClick = (student) => {
    setEditingStudent(student.id);
    setEditFormData({
      studentName: student.fullName || "",
      nationalId: student.nationalId || "",
      mathScore: student.mathScore || "",
      englishScore: student.englishScore || "",
      finalYearScore: student.finalYearScore || "",
      ministryExamPercentage: student.ministryExamPercentage || "",
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
    setEditError("");
    setEditSuccess("");
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
    setEditFormData({});
    setEditError("");
    setEditSuccess("");
  };

  const handleInputChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitEdit = async () => {
    setIsSubmitting(true);
    setEditError("");
    setEditSuccess("");

    try {
      // Call the API to update student information
      await adminAPI.updateStudentInfo(editingStudent, editFormData);

      setEditSuccess("Student information updated successfully!");

      // Refresh the page after a short delay to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error("Update error:", err);
      setEditError(
        err.response?.data ||
          "Failed to update student information. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ef3131] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading students data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-[#ef3131]">
              Staff Admin Dashboard
            </h1>
            <Button
              variant="outline"
              onClick={() => {
                localStorage.removeItem("staffAdminToken");
                navigate("/admin/login");
              }}
              className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border border-gray-200 shadow-none bg-white rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center">
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
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Students
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalStudents}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-none bg-white rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Passed Ministry Exam
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.withAcceptanceLetter}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-none bg-white rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center">
                <svg
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 14l9-5-9-5-9 5 9 5z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                  />
                </svg>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Interviewed
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.interviewed}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6 border border-gray-200 shadow-none bg-white rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <Input
                placeholder="Search by name, national ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-none bg-white rounded-xl">
          <CardHeader className="pb-0">
            <CardTitle>Students Management</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-8 px-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>National ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Options</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow
                      key={student.id}
                      className="align-middle border-b last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <TableCell>
                        <div className="font-medium">{student.fullName}</div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {student.nationalId}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {student.email || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {student.phoneNumber ||
                            student.studentPhoneNumber ||
                            "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            String(student.status) === "Accepted"
                              ? "success"
                              : String(student.status) === "Waitlist"
                              ? "warning"
                              : String(student.status) === "Rejected"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {student.status ? String(student.status) : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleEditClick(student)}
                          className="bg-[#ef3131] hover:bg-red-600"
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => fetchStudentsForPage(page)}
          onPageSizeChange={changePageSize}
          pageSize={pageSize}
          totalItems={totalStudents}
          isLoading={isLoading}
        />
      </div>

      {editingStudent && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Edit Student Information
              </h3>
              <button
                onClick={handleCancelEdit}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {editError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{editError}</p>
              </div>
            )}

            {editSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 text-sm">{editSuccess}</p>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitEdit();
              }}
              className="space-y-6"
            >
              <div className="border-b pb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Registration Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="studentName">Student Name</Label>
                    <Input
                      id="studentName"
                      value={editFormData.studentName}
                      onChange={(e) =>
                        handleInputChange("studentName", e.target.value)
                      }
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="nationalId">National ID</Label>
                    <Input
                      id="nationalId"
                      value={editFormData.nationalId}
                      onChange={(e) =>
                        handleInputChange("nationalId", e.target.value)
                      }
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="mathScore">Math Score (0-60)</Label>
                    <Input
                      id="mathScore"
                      type="number"
                      min="0"
                      max="60"
                      step="0.1"
                      value={editFormData.mathScore}
                      onChange={(e) =>
                        handleInputChange("mathScore", e.target.value)
                      }
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="englishScore">English Score (0-40)</Label>
                    <Input
                      id="englishScore"
                      type="number"
                      min="0"
                      max="40"
                      step="0.1"
                      value={editFormData.englishScore}
                      onChange={(e) =>
                        handleInputChange("englishScore", e.target.value)
                      }
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="finalYearScore">
                      Final Prep Score (0-280)
                    </Label>
                    <Input
                      id="finalYearScore"
                      type="number"
                      min="0"
                      max="280"
                      step="0.1"
                      value={editFormData.finalYearScore}
                      onChange={(e) =>
                        handleInputChange("finalYearScore", e.target.value)
                      }
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="ministryExamPercentage">
                      Ministry Exam % (0-100)
                    </Label>
                    <Input
                      id="ministryExamPercentage"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={editFormData.ministryExamPercentage}
                      onChange={(e) =>
                        handleInputChange(
                          "ministryExamPercentage",
                          e.target.value
                        )
                      }
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={editFormData.dateOfBirth}
                      onChange={(e) =>
                        handleInputChange("dateOfBirth", e.target.value)
                      }
                      className="mt-2"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="border-b pb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Complete Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="parentOccupation">Parent Occupation</Label>
                    <Input
                      id="parentOccupation"
                      value={editFormData.parentOccupation}
                      onChange={(e) =>
                        handleInputChange("parentOccupation", e.target.value)
                      }
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editFormData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Parent Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={editFormData.phoneNumber}
                      onChange={(e) =>
                        handleInputChange("phoneNumber", e.target.value)
                      }
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="studentPhoneNumber">
                      Student Phone Number
                    </Label>
                    <Input
                      id="studentPhoneNumber"
                      type="tel"
                      value={editFormData.studentPhoneNumber}
                      onChange={(e) =>
                        handleInputChange("studentPhoneNumber", e.target.value)
                      }
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <select
                      id="city"
                      value={editFormData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ef3131] focus:border-transparent"
                    >
                      <option value="">Select City</option>
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
                    <Label htmlFor="district">District</Label>
                    <Input
                      id="district"
                      value={editFormData.district}
                      onChange={(e) =>
                        handleInputChange("district", e.target.value)
                      }
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="streetName">Street Name</Label>
                    <Input
                      id="streetName"
                      value={editFormData.streetName}
                      onChange={(e) =>
                        handleInputChange("streetName", e.target.value)
                      }
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="buildingNo">Building Number</Label>
                    <Input
                      id="buildingNo"
                      value={editFormData.buildingNo}
                      onChange={(e) =>
                        handleInputChange("buildingNo", e.target.value)
                      }
                      className="mt-2"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="address">Full Address</Label>
                  <Textarea
                    id="address"
                    value={editFormData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    className="mt-2"
                    rows={3}
                  />
                </div>
                <div className="mt-4">
                  <Label>Study Type</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="isArabicStudy"
                        name="studyType"
                        checked={editFormData.isArabicStudy}
                        onChange={() => {
                          handleInputChange("isArabicStudy", true);
                          handleInputChange("isLanguagesStudy", false);
                        }}
                        className="w-4 h-4 text-[#ef3131] bg-gray-100 border-gray-300 focus:ring-[#ef3131] focus:ring-2"
                      />
                      <Label htmlFor="isArabicStudy">عربي</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="isLanguagesStudy"
                        name="studyType"
                        checked={editFormData.isLanguagesStudy}
                        onChange={() => {
                          handleInputChange("isLanguagesStudy", true);
                          handleInputChange("isArabicStudy", false);
                        }}
                        className="w-4 h-4 text-[#ef3131] bg-gray-100 border-gray-300 focus:ring-[#ef3131] focus:ring-2"
                      />
                      <Label htmlFor="isLanguagesStudy">لغات</Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#ef3131] hover:bg-red-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update Student"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffAdminDashboardPage;
