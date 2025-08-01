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
import Footer from "../components/layout/Footer";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Admin credentials
    const adminCredentials = {
      email: "admin@elsewedy-school.edu.eg",
      password: "admin123",
    };

    // Super Admin credentials
    const superAdminCredentials = {
      email: "superadmin@el-sewedy.edu.eg",
      password: "SuperAdmin2024!",
    };

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (
      email === adminCredentials.email &&
      password === adminCredentials.password
    ) {
      // Regular admin authentication
      localStorage.setItem("adminToken", "mock-token");
      navigate("/admin/dashboard");
    } else if (
      email === superAdminCredentials.email &&
      password === superAdminCredentials.password
    ) {
      // Super admin authentication
      localStorage.setItem("superAdminToken", "authenticated");
      navigate("/super-admin/dashboard");
    } else {
      setError("Invalid email or password");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="py-8 md:py-12">
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

          <Card className="border-0 smooth-shadow">
            <CardHeader className="text-center pb-8">
              <div className="w-20 h-20 bg-[#ef3131]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg
                  className="h-10 w-10 text-[#ef3131]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01"
                  />
                </svg>
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900">
                Admin Login
              </CardTitle>
              <p className="text-gray-600 font-light mt-2">
                Access the administration dashboard
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@elsewedy-school.edu.eg"
                    className="mt-2 h-11 md:h-12"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="mt-2 h-11 md:h-12"
                    required
                  />
                </div>

                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700 font-medium">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-[#ef3131] hover:bg-red-600 h-11 md:h-12 text-base md:text-lg font-semibold rounded-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <div className="mt-6 bg-gray-50 rounded-lg p-4 text-sm text-gray-600 text-center">
                <p className="font-medium mb-2">Demo credentials:</p>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-gray-700 mb-1">
                      Regular Admin:
                    </p>
                    <p className="font-mono">admin@elsewedy-school.edu.eg</p>
                    <p className="font-mono">admin123</p>
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <p className="font-medium text-purple-600 mb-1">
                      Super Admin:
                    </p>
                    <p className="font-mono text-purple-700">
                      superadmin@el-sewedy.edu.eg
                    </p>
                    <p className="font-mono text-purple-700">SuperAdmin2024!</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminLoginPage;
