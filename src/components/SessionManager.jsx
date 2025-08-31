import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SessionManager = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminToken, logoutAdmin } = useAuth();

  useEffect(() => {
    const checkSessionAndRedirect = () => {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        // No token found, redirect to login if on admin pages
        if (
          location.pathname.includes("/admin") ||
          location.pathname.includes("/super-admin") ||
          location.pathname.includes("/staff-admin")
        ) {
          navigate("/admin/login");
        }
        return;
      }

      try {
        // Decode JWT token to get role
        const payload = JSON.parse(atob(token.split(".")[1]));
        const role = payload.role || payload.Role;

        // Check if user is on the correct dashboard for their role
        const currentPath = location.pathname;

        if (role === "SuperAdmin") {
          if (currentPath !== "/super-admin/dashboard") {
            navigate("/super-admin/dashboard");
          }
        } else if (role === "Admin") {
          if (currentPath !== "/admin/dashboard") {
            navigate("/admin/dashboard");
          }
        } else if (role === "StaffAdmin") {
          if (currentPath !== "/staff-admin/search") {
            navigate("/staff-admin/search");
          }
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        // Invalid token, clear it and redirect to login
        logoutAdmin();
        navigate("/admin/login");
      }
    };

    checkSessionAndRedirect();
  }, [location.pathname, navigate, logoutAdmin, adminToken]);

  return null; // This component doesn't render anything
};

export default SessionManager;
