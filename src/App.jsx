import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import ApplyOptionsPage from "./pages/ApplyOptionsPage";
import VerifyStudentPage from "./pages/VerifyStudentPage";
import CheckNationalIdPage from "./pages/CheckNationalIdPage";
import CompleteStudentInfoPage from "./pages/CompleteStudentInfoPage";
import ExamPage from "./pages/ExamPage";
import GetExamPage from "./pages/GetExamPage";
import ExamCompletedPage from "./pages/ExamCompletedPage";
import ContactPage from "./pages/ContactPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import SuperAdminDashboardPage from "./pages/SuperAdminDashboardPage";
import StaffAdminSearchPage from "./pages/StaffAdminSearchPage";
import StaffAdminEditPage from "./pages/StaffAdminEditPage";

import TeacherLoginPage from "./pages/TeacherLoginPage";
import RegisterStudentPage from "./pages/RegisterStudentPage";
import ApplyPage from "./pages/ApplyPage";
import ExcelUploadPage from "./pages/ExcelUploadPage";

import ScrollToTop from "./components/ScrollToTop";

function App() {
  // Smart local storage management based on usage phases
  useEffect(() => {
    const today = new Date().toDateString();
    const lastClearDate = localStorage.getItem("lastClearDate");

    // Clear tokens daily (for security and fresh sessions)
    if (lastClearDate !== today) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("teacherToken");

      localStorage.setItem("lastClearDate", today);
    }
  }, []);
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/apply-options" element={<ApplyOptionsPage />} />
            <Route path="/verify-student" element={<VerifyStudentPage />} />
            <Route
              path="/check-national-id"
              element={<CheckNationalIdPage />}
            />
            <Route
              path="/complete-student-info"
              element={<CompleteStudentInfoPage />}
            />
            <Route path="/exam" element={<ExamPage />} />
            <Route path="/get-exam" element={<GetExamPage />} />
            <Route path="/exam-completed" element={<ExamCompletedPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/apply" element={<ApplyPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route
              path="/super-admin/dashboard"
              element={<SuperAdminDashboardPage />}
            />
            <Route
              path="/staff-admin/search"
              element={<StaffAdminSearchPage />}
            />
            <Route path="/staff-admin/edit" element={<StaffAdminEditPage />} />

            <Route path="/teacher/login" element={<TeacherLoginPage />} />
            <Route
              path="/teacher/register-student"
              element={<RegisterStudentPage />}
            />
            <Route path="/admin/excel-upload" element={<ExcelUploadPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
