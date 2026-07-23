import { useEffect } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  isConfirming?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  isConfirming = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isConfirming) onCancel();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isConfirming, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="dialog-backdrop" role="presentation">
      <section
        aria-labelledby="confirm-dialog-title"
        aria-modal="true"
        className="dialog-card confirm-dialog"
        role="dialog"
      >
        <h2 id="confirm-dialog-title">{title}</h2>
        <p>{message}</p>
        <div className="dialog-actions">
          <button
            className="ghost-button"
            disabled={isConfirming}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="danger-button"
            disabled={isConfirming}
            onClick={onConfirm}
            type="button"
          >
            {isConfirming ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
