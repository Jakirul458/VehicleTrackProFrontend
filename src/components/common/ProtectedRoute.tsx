import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { ModuleAccess, Role } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
  requiredModuleAccess?: keyof ModuleAccess;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredModuleAccess,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/403" replace />;
  }

  if (
    requiredModuleAccess &&
    user?.role === "AGENT" &&
    !(user.moduleAccess?.[requiredModuleAccess] ?? true)
  ) {
    return <Navigate to="/agent/dashboard" replace />;
  }

  return <>{children}</>;
}
