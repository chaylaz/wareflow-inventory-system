import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getStoredAuthNotice } from "../lib/authEvents";

function ProtectedRoute() {
  const {
    isAuthenticated,
    isLoading,
    authNotice,
  } = useAuth();

  const location = useLocation();

  if (isLoading) {
    return (
      <div className="auth-page-loader">
        <div className="auth-loader-spinner" />

        <p>Memeriksa sesi pengguna...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    const sessionNotice =
      authNotice ??
      getStoredAuthNotice();

    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
          authNotice: sessionNotice,
        }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;