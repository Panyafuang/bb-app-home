/**
 * lib/axios.ts
 * ตั้งค่า Axios instance กลาง (baseURL, headers, timeout)
 * ใส่ interceptors:
 * - request: (เช่น แนบ token ถ้าต้องการ)
 * - response: แปลง error ให้มี message, status, payload ที่อ่านง่าย
 */
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  headers: { "Content-Type": "application/json" },
  timeout: 15000
});

api.interceptors.request.use((config) => {
  // ตัวอย่างการแนบ token ถ้ามี
  // const token = localStorage.getItem("token");
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
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
    // โยน error ให้ caller พร้อมแนบ status/payload
    return Promise.reject(Object.assign(new Error(message), { status, payload: data }));
  }
);
