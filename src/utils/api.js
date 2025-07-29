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
    const adminToken = localStorage.getItem("adminToken");
    const teacherToken = localStorage.getItem("teacherToken");

    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (teacherToken) {
      config.headers.Authorization = `Bearer ${teacherToken}`;
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
      window.location.href = "/admin/login";
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
};

// Student API
export const studentAPI = {
  validateNationalId: (nationalId) =>
    api.get(`/Student/validate/${nationalId}`),
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
  validateForExam: (nationalId) =>
    api.get(`/Student/validate-exam/${nationalId}`),
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
    api.put(`/Admin/student/${studentId}/status`, status),
};

// Exam API
export const examAPI = {
  getExamResults: (nationalId) => api.get(`/Exam/student/${nationalId}`),
};

export default api;
