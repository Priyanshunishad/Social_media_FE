// SuperAdminRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../api";
import Loading from "../components/Loading";

const SuperAdminRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        // 🔑 Hit API that returns user info (with role)
        const res = await api.get("/user");
        const role = res.data?.user?.role;

        if (role === "SUPER-ADMIN") {
          setIsAllowed(true);
        } else {
          setIsAllowed(false);
        }
      } catch (error) {
        setIsAllowed(false);
      } finally {
        setLoading(false);
      }
    };

    checkSuperAdmin();
  }, []);

  if (loading) return <Loading />;

  if (!isAllowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default SuperAdminRoute;
