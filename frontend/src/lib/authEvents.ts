export const AUTH_SESSION_EXPIRED_EVENT =
  "wareflow:auth-session-expired";

export const AUTH_SESSION_NOTICE_STORAGE_KEY =
  "wareflow:auth-notice";

export const AUTH_SESSION_EXPIRED_MESSAGE =
  "Sesi login Anda telah berakhir. Silakan masuk kembali untuk melanjutkan.";

export function getStoredAuthNotice() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage.getItem(
    AUTH_SESSION_NOTICE_STORAGE_KEY
  );
}

export function clearStoredAuthNotice() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(
    AUTH_SESSION_NOTICE_STORAGE_KEY
  );
}

export function notifySessionExpired() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    AUTH_SESSION_NOTICE_STORAGE_KEY,
    AUTH_SESSION_EXPIRED_MESSAGE
  );

  window.dispatchEvent(
    new CustomEvent<string>(
      AUTH_SESSION_EXPIRED_EVENT,
      {
        detail:
          AUTH_SESSION_EXPIRED_MESSAGE,
      }
    )
  );
}