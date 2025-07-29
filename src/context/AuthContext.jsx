"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [adminToken, setAdminToken] = useState(null);
  const [teacherToken, setTeacherToken] = useState(null);

  useEffect(() => {
    const storedAdminToken = localStorage.getItem("adminToken");
    const storedTeacherToken = localStorage.getItem("teacherToken");

    if (storedAdminToken) {
      setAdminToken(storedAdminToken);
    }
    if (storedTeacherToken) {
      setTeacherToken(storedTeacherToken);
    }
  }, []);

  const loginAdmin = (token) => {
    localStorage.setItem("adminToken", token);
    setAdminToken(token);
  };

  const loginTeacher = (token) => {
    localStorage.setItem("teacherToken", token);
    setTeacherToken(token);
  };

  const logoutAdmin = () => {
    localStorage.removeItem("adminToken");
    setAdminToken(null);
  };

  const logoutTeacher = () => {
    localStorage.removeItem("teacherToken");
    setTeacherToken(null);
  };

  const value = {
    adminToken,
    teacherToken,
    loginAdmin,
    loginTeacher,
    logoutAdmin,
    logoutTeacher,
    isAdminAuthenticated: !!adminToken,
    isTeacherAuthenticated: !!teacherToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
