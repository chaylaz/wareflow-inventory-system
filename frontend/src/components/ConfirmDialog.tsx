import {
  TriangleAlert,
  X,
} from "lucide-react";

import { useEffect } from "react";

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isProcessing?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Konfirmasi",
  isProcessing = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.key === "Escape" &&
        !isProcessing
      ) {
        onCancel();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [isOpen, isProcessing, onCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="confirm-backdrop"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !isProcessing
        ) {
          onCancel();
        }
      }}
    >
      <section
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-description"
      >
        <header className="confirm-header">
          <div className="confirm-icon">
            <TriangleAlert
              size={24}
              strokeWidth={2}
            />
          </div>

          <button
            className="confirm-close-button"
            type="button"
            aria-label="Tutup konfirmasi"
            disabled={isProcessing}
            onClick={onCancel}
          >
            <X size={19} />
          </button>
        </header>

        <div className="confirm-content">
          <h2 id="confirm-title">
            {title}
          </h2>

          <p id="confirm-description">
            {description}
          </p>
        </div>

        <footer className="confirm-actions">
          <button
            className="secondary-button"
            type="button"
            disabled={isProcessing}
            onClick={onCancel}
          >
            Batal
          </button>

          <button
            className="danger-button"
            type="button"
            disabled={isProcessing}
            onClick={onConfirm}
          >
            {isProcessing
              ? "Memproses..."
              : confirmLabel}
          </button>
        </footer>
      </section>
    </div>
  );
}

export default ConfirmDialog;