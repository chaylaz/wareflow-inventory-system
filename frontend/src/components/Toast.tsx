import {
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";

import { useEffect } from "react";

type ToastProps = {
  type: "success" | "error";
  message: string;
  onClose: () => void;
  duration?: number;
};

function Toast({
  type,
  message,
  onClose,
  duration = 3500,
}: ToastProps) {
  useEffect(() => {
    const timeoutId = window.setTimeout(
      onClose,
      duration
    );

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [duration, message, onClose]);

  const Icon =
    type === "success"
      ? CheckCircle2
      : AlertCircle;

  return (
    <div
      className="toast-region"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={`toast-card toast-${type}`}
        role="status"
      >
        <div className="toast-icon">
          <Icon size={21} strokeWidth={2.2} />
        </div>

        <div className="toast-content">
          <strong>
            {type === "success"
              ? "Berhasil"
              : "Terjadi kesalahan"}
          </strong>

          <p>{message}</p>
        </div>

        <button
          className="toast-close-button"
          type="button"
          aria-label="Tutup notifikasi"
          onClick={onClose}
        >
          <X size={17} />
        </button>
      </div>
    </div>
  );
}

export default Toast;