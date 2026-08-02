import {
  KeyRound,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";

import Toast from "../components/Toast";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { getApiErrorMessage } from "../lib/getApiErrorMessage";

import type {
  AuthenticatedUser,
} from "../types/auth";

import "../styles/profile.css";

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

function ProfilePage() {
  const {
    user,
    refreshUser,
  } = useAuth();

  const [fullName, setFullName] =
    useState(user?.fullName ?? "");

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    isUpdatingProfile,
    setIsUpdatingProfile,
  ] = useState(false);

  const [
    isChangingPassword,
    setIsChangingPassword,
  ] = useState(false);

  const [
    profileError,
    setProfileError,
  ] = useState("");

  const [
    passwordError,
    setPasswordError,
  ] = useState("");

  const [toast, setToast] =
    useState<ToastState>(null);

  useEffect(() => {
    setFullName(user?.fullName ?? "");
  }, [user?.fullName]);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  async function handleUpdateProfile(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const normalizedFullName =
      fullName.trim();

    if (!normalizedFullName) {
      setProfileError(
        "Nama lengkap wajib diisi."
      );

      return;
    }

    if (normalizedFullName.length > 150) {
      setProfileError(
        "Nama lengkap maksimal 150 karakter."
      );

      return;
    }

    if (
      normalizedFullName ===
      user?.fullName
    ) {
      setProfileError(
        "Tidak ada perubahan nama yang perlu disimpan."
      );

      return;
    }

    try {
      setIsUpdatingProfile(true);
      setProfileError("");
      setToast(null);

      const response =
        await api.put<AuthenticatedUser>(
          "/api/auth/profile",
          {
            fullName: normalizedFullName,
          }
        );

      await refreshUser();

      setFullName(
        response.data.fullName
      );

      setToast({
        type: "success",
        message:
          "Informasi profil berhasil diperbarui.",
      });
    } catch (error) {
      console.error(error);

      setProfileError(
        getApiErrorMessage(
          error,
          "Gagal memperbarui profil."
        )
      );
    } finally {
      setIsUpdatingProfile(false);
    }
  }

  async function handleChangePassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!currentPassword) {
      setPasswordError(
        "Password saat ini wajib diisi."
      );

      return;
    }

    if (currentPassword.length < 8) {
      setPasswordError(
        "Password saat ini minimal 8 karakter."
      );

      return;
    }

    if (!newPassword) {
      setPasswordError(
        "Password baru wajib diisi."
      );

      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "Password baru minimal 8 karakter."
      );

      return;
    }

    if (newPassword.length > 128) {
      setPasswordError(
        "Password baru maksimal 128 karakter."
      );

      return;
    }

    if (
      newPassword === currentPassword
    ) {
      setPasswordError(
        "Password baru harus berbeda dari password saat ini."
      );

      return;
    }

    if (
      newPassword !== confirmPassword
    ) {
      setPasswordError(
        "Konfirmasi password baru tidak sesuai."
      );

      return;
    }

    try {
      setIsChangingPassword(true);
      setPasswordError("");
      setToast(null);

      await api.post(
        "/api/auth/change-password",
        {
          currentPassword,
          newPassword,
        }
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setToast({
        type: "success",
        message:
          "Password berhasil diubah. Gunakan password baru saat login berikutnya.",
      });
    } catch (error) {
      console.error(error);

      setPasswordError(
        getApiErrorMessage(
          error,
          "Gagal mengubah password."
        )
      );
    } finally {
      setIsChangingPassword(false);
    }
  }

  const userInitial =
    user?.fullName
      .trim()
      .charAt(0)
      .toUpperCase() || "A";

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <p className="page-eyebrow">
            Account management
          </p>

          <h1>Profile</h1>

          <p>
            Kelola informasi akun dan keamanan
            password Administrator WareFlow.
          </p>
        </div>
      </div>

      <div className="profile-layout">
        <aside className="profile-summary-card">
          <div className="profile-avatar">
            {userInitial}
          </div>

          <div className="profile-summary-heading">
            <h2>
              {user?.fullName ??
                "Administrator"}
            </h2>

            <span>
              {user?.role ??
                "Administrator"}
            </span>
          </div>

          <div className="profile-account-details">
            <div className="profile-detail-item">
              <div className="profile-detail-icon">
                <Mail
                  size={18}
                  strokeWidth={2}
                />
              </div>

              <div>
                <span>Email</span>

                <strong>
                  {user?.email ?? "-"}
                </strong>
              </div>
            </div>

            <div className="profile-detail-item">
              <div className="profile-detail-icon">
                <ShieldCheck
                  size={18}
                  strokeWidth={2}
                />
              </div>

              <div>
                <span>Hak akses</span>

                <strong>
                  {user?.role ?? "-"}
                </strong>
              </div>
            </div>
          </div>

          <div className="profile-security-note">
            <ShieldCheck
              size={20}
              strokeWidth={2}
            />

            <p>
              Email akun tidak dapat diubah dari
              halaman ini untuk menjaga identitas
              akun Administrator.
            </p>
          </div>
        </aside>

        <div className="profile-form-column">
          <section className="profile-form-card">
            <div className="profile-card-heading">
              <div className="profile-card-icon">
                <UserRound
                  size={21}
                  strokeWidth={2}
                />
              </div>

              <div>
                <h2>Informasi profil</h2>

                <p>
                  Perbarui nama yang ditampilkan
                  pada sistem.
                </p>
              </div>
            </div>

            <form
              className="profile-form"
              onSubmit={handleUpdateProfile}
            >
              <div className="profile-field">
                <label htmlFor="profile-full-name">
                  Nama lengkap
                </label>

                <input
                  id="profile-full-name"
                  type="text"
                  value={fullName}
                  maxLength={150}
                  placeholder="Masukkan nama lengkap"
                  required
                  onChange={(event) => {
                    setFullName(
                      event.target.value
                    );

                    setProfileError("");
                  }}
                />

                <span className="profile-character-counter">
                  {fullName.length}/150
                </span>
              </div>

              <div className="profile-field">
                <label htmlFor="profile-email">
                  Email
                </label>

                <input
                  id="profile-email"
                  type="email"
                  value={user?.email ?? ""}
                  disabled
                  readOnly
                />

                <span className="profile-field-help">
                  Email digunakan sebagai
                  identitas untuk login.
                </span>
              </div>

              {profileError && (
                <div className="profile-form-error">
                  {profileError}
                </div>
              )}

              <div className="profile-form-actions">
                <button
                  className="primary-button"
                  type="submit"
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile
                    ? "Menyimpan..."
                    : "Simpan profil"}
                </button>
              </div>
            </form>
          </section>

          <section className="profile-form-card">
            <div className="profile-card-heading">
              <div className="profile-card-icon profile-password-icon">
                <KeyRound
                  size={21}
                  strokeWidth={2}
                />
              </div>

              <div>
                <h2>Ubah password</h2>

                <p>
                  Gunakan password yang kuat dan
                  tidak mudah ditebak.
                </p>
              </div>
            </div>

            <form
              className="profile-form"
              onSubmit={handleChangePassword}
            >
              <div className="profile-field">
                <label htmlFor="current-password">
                  Password saat ini
                </label>

                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  minLength={8}
                  maxLength={128}
                  autoComplete="current-password"
                  placeholder="Masukkan password saat ini"
                  required
                  onChange={(event) => {
                    setCurrentPassword(
                      event.target.value
                    );

                    setPasswordError("");
                  }}
                />
              </div>

              <div className="profile-password-grid">
                <div className="profile-field">
                  <label htmlFor="new-password">
                    Password baru
                  </label>

                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    minLength={8}
                    maxLength={128}
                    autoComplete="new-password"
                    placeholder="Minimal 8 karakter"
                    required
                    onChange={(event) => {
                      setNewPassword(
                        event.target.value
                      );

                      setPasswordError("");
                    }}
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="confirm-password">
                    Konfirmasi password
                  </label>

                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    minLength={8}
                    maxLength={128}
                    autoComplete="new-password"
                    placeholder="Ulangi password baru"
                    required
                    onChange={(event) => {
                      setConfirmPassword(
                        event.target.value
                      );

                      setPasswordError("");
                    }}
                  />
                </div>
              </div>

              <div className="profile-password-guidance">
                <KeyRound
                  size={17}
                  strokeWidth={2}
                />

                <span>
                  Password minimal 8 karakter dan
                  harus berbeda dari password
                  sebelumnya.
                </span>
              </div>

              {passwordError && (
                <div className="profile-form-error">
                  {passwordError}
                </div>
              )}

              <div className="profile-form-actions">
                <button
                  className="primary-button"
                  type="submit"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword
                    ? "Mengubah password..."
                    : "Ubah password"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={closeToast}
        />
      )}
    </section>
  );
}

export default ProfilePage;