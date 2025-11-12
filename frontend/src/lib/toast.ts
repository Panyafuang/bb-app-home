// ✅ Wrapper สั้น ๆ สำหรับ react-toastify
import { toast, type ToastOptions } from "react-toastify";

const base: ToastOptions = { position: "top-right", autoClose: 3000, theme: "colored" };

export const notify = {
  success: (msg: string, opts?: ToastOptions) => toast.success(msg, { ...base, ...opts }),
  error:   (msg: string, opts?: ToastOptions) => toast.error(msg, { ...base, ...opts }),
  info:    (msg: string, opts?: ToastOptions) => toast.info(msg, { ...base, ...opts }),
  warn:    (msg: string, opts?: ToastOptions) => toast.warn(msg, { ...base, ...opts }),
};
