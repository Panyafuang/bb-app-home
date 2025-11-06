// ✅ สร้าง Axios instance กลางสำหรับเรียก REST API
// - ดัก error และ normalize ข้อความผิดพลาดให้ใช้งานง่ายขึ้น

import axios from "axios";

export const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_BASE_URL || "",
  headers: { "Content-Type": "application/json" },
  timeout: 15000
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status ?? 0;
    const data = error?.response?.data;
    const message =
      data?.message ||
      data?.error ||
      (Array.isArray(data?.errors) ? data.errors.map((e: any) => e.msg || e).join(", ") : null) ||
      error?.message ||
      "Network/Server error";
    return Promise.reject(Object.assign(new Error(message), { status, payload: data }));
  }
);
