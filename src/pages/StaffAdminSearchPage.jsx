"use client";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { staffAdminAPI } from "../utils/api";

const StaffAdminSearchPage = () => {
  const [nationalId, setNationalId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!nationalId.trim()) {
      setError("Please enter a National ID");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await staffAdminAPI.searchStudent(nationalId);
      // Navigate to edit page with student data
      navigate("/staff-admin/edit", { 
        state: { 
          studentData: response.data,
          nationalId: nationalId 
        } 
      });
    } catch (err) {
      console.error("Search error:", err);
      if (err.response?.status === 404) {
        setError("No student found with this national ID.");
      } else {
        setError(err.response?.data || "Failed to search for student. Please try again.");
      }
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-12">
        <div className="max-w-md mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <Link
              to="/admin/login"
              className="inline-flex items-center text-[#ef3131] hover:underline"
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
              Back to Login
            </Link>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Logout
            </Button>
          </div>

          <Card className="border-none" >
            <CardHeader>
              <CardTitle className="text-center text-[#ef3131]">
                Staff Admin Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nationalId">Student National ID</Label>
                  <Input
                    id="nationalId"
                    type="text"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    placeholder="Enter 14-digit National ID"
                    maxLength={14}
                    validation={{ nationalId: true }}
                    showValidation={true}
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
                  onClick={handleSearch}
                  className="w-full bg-[#ef3131] hover:bg-red-600"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Searching...
                    </div>
                  ) : (
                    "Search Student"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StaffAdminSearchPage;
