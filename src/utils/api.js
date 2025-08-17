import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: "http://localhost:5253/api", // Adjust this to match your backend URL
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth tokens
api.interceptors.request.use(
  (config) => {
    // Don't add auth headers for student validation and exam submission endpoints
    if (
      config.url &&
      (config.url.includes("/Student/validate/") ||
        config.url.includes("/Student/validate-exam/") ||
        config.url.includes("/Student/submit-exam"))
    ) {
      return config;
    }

    const adminToken = localStorage.getItem("adminToken");
    const teacherToken = localStorage.getItem("teacherToken");
    const studentToken = localStorage.getItem("studentToken");

    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (teacherToken) {
      config.headers.Authorization = `Bearer ${teacherToken}`;
    } else if (studentToken && config.url && config.url.includes("/Student/")) {
      // Add student token for student API calls
      config.headers.Authorization = `Bearer ${studentToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear tokens and redirect to login
      localStorage.removeItem("adminToken");
      localStorage.removeItem("teacherToken");
      localStorage.removeItem("studentToken");

      localStorage.removeItem("studentNationalId");
      localStorage.removeItem("examStudentData");

      // Redirect based on current page
      if (window.location.pathname.includes("/admin")) {
        window.location.href = "/admin/login";
      } else if (window.location.pathname.includes("/teacher")) {
        window.location.href = "/teacher/login";
      } else {
        window.location.href = "/verify-student";
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  teacherLogin: (credentials) => api.post("/Auth/teacher/login", credentials),
  adminLogin: (credentials) => api.post("/Auth/admin/login", credentials),
};

// Teacher API
export const teacherAPI = {
  registerStudent: (studentData) =>
    api.post("/Teacher/register-student", studentData),
  getStudents: () => api.get("/Teacher/students"),
};

// Student API
export const studentAPI = {
  validateNationalId: (nationalId) =>
    api.get(`/Student/validate/${nationalId}`),
  validateForExam: (nationalId) =>
    api.get(`/Student/validate-exam/${nationalId}`),
  completeInfo: (studentInfo) =>
    api.post("/Student/complete-info", studentInfo),
  uploadDocument: (file, nationalId, documentType) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(
      `/Student/upload-document?nationalId=${nationalId}&documentType=${documentType}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },
  submitExam: (examData) => api.post("/Student/submit-exam", examData),
};

// Admin API
export const adminAPI = {
  getAllStudents: () => api.get("/Admin/students"),
  filterStudents: (filters) =>
    api.get("/Admin/students/filter", { params: filters }),
  setInterviewScore: (studentId, score) =>
    api.post(`/Admin/student/${studentId}/my-interview-score`, score),
  updateStudentStatus: (studentId, status) =>
    api.put(`/Admin/student/${studentId}/status`, { Status: status }),
};

// Staff Admin API
export const staffAdminAPI = {
  searchStudent: (nationalId) =>
    api.get(`/StaffAdmin/search-student/${nationalId}`),
  updateStudent: (nationalId, updateData) =>
    api.put(`/StaffAdmin/update-student/${nationalId}`, updateData),
};

// Exam API
export const examAPI = {
  importQuestions: (formData) =>
    api.post("/Exam/import-questions", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  getSections: () => api.get("/Exam/sections"),
  getSectionsWithSchoolType: (nationalId) =>
    api.get(`/Exam/sections/${nationalId}`),
  getQuestionsBySection: (sectionName) =>
    api.get(`/Exam/questions/${sectionName}`),
  getQuestionsBySectionWithSchoolType: (sectionName, nationalId) =>
    api.get(`/Exam/questions/${sectionName}/${nationalId}`),
  submitAnswers: (data) => api.post("/Exam/submit-answers", data),
  getExamResults: (nationalId) => api.get(`/Exam/results/${nationalId}`),
  getStudentAnswers: (nationalId) => api.get(`/Exam/answers/${nationalId}`),
  getAllResults: () => api.get("/Exam/all-results"),
  requestTimeExtension: (data) => api.post("/Exam/request-extension", data),
};

export default api;
