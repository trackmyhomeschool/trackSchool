import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NotFoundPage from "./NotFoundPage";
import AdminNotFoundPage from "./admin/AdminNotFoundPage";

function RoleBasedNotFound() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to fetch user info
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/auth/me`, { withCredentials: true })
      .then(res => {
        setRole(res.data.role === "admin" ? "admin" : "user");
      })
      .catch(() => {
        setRole("user"); // Treat unknowns as user (or could be "guest" if you want)
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null; // Or show spinner

  return role === "admin" ? <AdminNotFoundPage /> : <NotFoundPage />;
}

export default RoleBasedNotFound;
