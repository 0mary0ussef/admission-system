import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import ApplyOptionsPage from "./pages/ApplyOptionsPage";
import VerifyStudentPage from "./pages/VerifyStudentPage";
import CheckNationalIdPage from "./pages/CheckNationalIdPage";
import CompleteStudentInfoPage from "./pages/CompleteStudentInfoPage";
import ExamPage from "./pages/ExamPage";
import ContactPage from "./pages/ContactPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

import SuperAdminDashboardPage from "./pages/SuperAdminDashboardPage";
import TeacherLoginPage from "./pages/TeacherLoginPage";
import RegisterStudentPage from "./pages/RegisterStudentPage";
import ApplyPage from "./pages/ApplyPage";
import ScrollToTop from "./components/ScrollToTop";

function App() {
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
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/apply" element={<ApplyPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route
              path="/super-admin/dashboard"
              element={<SuperAdminDashboardPage />}
            />
            <Route path="/teacher/login" element={<TeacherLoginPage />} />
            <Route
              path="/teacher/register-student"
              element={<RegisterStudentPage />}
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
