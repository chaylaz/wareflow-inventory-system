import {
  Boxes,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import {
  useState,
  type FormEvent,
} from "react";

import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getStoredAuthNotice } from "../lib/authEvents";
import { getApiErrorMessage } from "../lib/getApiErrorMessage";

type LoginLocationState = {
  from?: {
    pathname?: string;
  };

  authNotice?: string | null;
};

function LoginPage() {
  const {
    login,
    isAuthenticated,
    isLoading,
    authNotice,
    clearAuthNotice,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(
    "admin@wareflow.local"
  );

  const [password, setPassword] =
    useState("");

  const [rememberMe, setRememberMe] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const locationState =
    location.state as LoginLocationState | null;

  const destination =
    locationState?.from?.pathname ??
    "/dashboard";

  const sessionNotice =
    authNotice ??
    locationState?.authNotice ??
    getStoredAuthNotice();

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setErrorMessage(
        "Email wajib diisi."
      );

      return;
    }

    if (!password) {
      setErrorMessage(
        "Password wajib diisi."
      );

      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      clearAuthNotice();

      await login({
        email: normalizedEmail,
        password,
        rememberMe,
      });

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      console.error(error);

      setErrorMessage(
        getApiErrorMessage(
          error,
          "Email atau password tidak sesuai."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="auth-page-loader">
        <div className="auth-loader-spinner" />

        <p>Memeriksa sesi pengguna...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return (
    <main className="login-page">
      <section className="login-visual-panel">
        <div className="login-brand">
          <div className="login-brand-icon">
            <Boxes
              size={27}
              strokeWidth={2.2}
            />
          </div>

          <div>
            <strong>WareFlow</strong>
            <span>Inventory System</span>
          </div>
        </div>

        <div className="login-visual-content">
          <p className="login-eyebrow">
            Inventory management
          </p>

          <h1>
            Kendalikan seluruh aliran stok dalam
            satu sistem.
          </h1>

          <p>
            Kelola produk, gudang, saldo stok,
            dan riwayat transaksi secara aman
            dan terpusat.
          </p>

          <div className="login-security-note">
            <ShieldCheck
              size={22}
              strokeWidth={2}
            />

            <div>
              <strong>Sesi terlindungi</strong>

              <span>
                Autentikasi menggunakan cookie
                HTTP-only dan password hash.
              </span>
            </div>
          </div>
        </div>

        <p className="login-visual-footer">
          WareFlow Inventory Management System
        </p>
      </section>

      <section className="login-form-panel">
        <div className="login-form-container">
          <div className="login-form-heading">
            <span className="login-mobile-logo">
              <Boxes size={25} />
            </span>

            <p className="page-eyebrow">
              Administrator access
            </p>

            <h2>Masuk ke WareFlow</h2>

            <p>
              Gunakan akun administrator untuk
              mengakses sistem inventory.
            </p>
          </div>

          {sessionNotice && (
            <div className="login-session-message">
              {sessionNotice}
            </div>
          )}

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
            <div className="login-field">
              <label htmlFor="login-email">
                Email
              </label>

              <div className="login-input-wrapper">
                <Mail
                  size={18}
                  strokeWidth={2}
                />

                <input
                  id="login-email"
                  type="email"
                  value={email}
                  maxLength={256}
                  autoComplete="email"
                  placeholder="admin@wareflow.local"
                  required
                  autoFocus
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="login-password">
                Password
              </label>

              <div className="login-input-wrapper">
                <LockKeyhole
                  size={18}
                  strokeWidth={2}
                />

                <input
                  id="login-password"
                  type="password"
                  value={password}
                  minLength={8}
                  maxLength={128}
                  autoComplete="current-password"
                  placeholder="Masukkan password"
                  required
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                />
              </div>
            </div>

            <label className="remember-me-control">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) =>
                  setRememberMe(
                    event.target.checked
                  )
                }
              />

              <span>
                Ingat sesi saya selama 7 hari
              </span>
            </label>

            {errorMessage && (
              <div className="login-error-message">
                {errorMessage}
              </div>
            )}

            <button
              className="login-submit-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Sedang masuk..."
                : "Masuk ke WareFlow"}
            </button>
          </form>

          <div className="login-help">
            <span>
              Akun pertama dibuat melalui proses
              initial administrator setup.
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;