import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

function ProtectedRoute({ children, allowedRoles = ["user", "admin"] }) {
  const [auth, setAuth] = useState({ loading: true, isAuth: false, role: null });

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/auth/me`, { withCredentials: true })
      .then(res => {
        setAuth({
          loading: false,
          isAuth: allowedRoles.includes(res.data.role),
          role: res.data.role
        });
      })
      .catch(() => {
        setAuth({ loading: false, isAuth: false, role: null });
      });
  }, [allowedRoles]);

  if (auth.loading) return null; // Or a spinner

  if (!auth.isAuth) {
    // Redirect to login or landing page
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
