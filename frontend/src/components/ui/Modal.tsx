// ✅ Modal แบบพื้นฐาน ใช้ยืนยันการกระทำที่สำคัญ (ลบข้อมูล ฯลฯ)
import { useTranslation } from "react-i18next";

export default function Modal({
  open,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title?: string;
  description?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onClose?: () => void;
}) {
  const { t } = useTranslation("common");
  if (!open) return null;

  const confirmLabel = confirmText ?? t("modal.comfirm");
  const cancelLabel = cancelText ?? t("modal.cancel");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        {title && <h3 className="mb-2 text-lg font-semibold">{title}</h3>}
        {description && (
          <div className="mb-4 text-sm text-gray-700">{description}</div>
        )}
        <div className="flex justify-end gap-2">
          <button
            className="rounded-xl px-4 py-2 hover:bg-gray-50"
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <button
            className="rounded-xl bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
