// ⚙️ main.tsx — จุดบูตของแอป
// - โหลด i18n ก่อน เพื่อให้ทุก component แปลภาษาได้
// - ครอบด้วย QueryClientProvider (React Query)
// - ตั้ง Router + Layout + ToastContainer

import "./i18n";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import "./index.css";
import AppShell from "./layouts/AppShell.tsx";

// react-toastify: container สำหรับแสดง toast
// import { ToastContainer } from "react-toastify";
import GoldListPage from "./routes/golds/list.page.tsx";
import ToastI18nProvider from "./components/ToastI18nProvider.tsx";
import "./styles/globals.css";
import GoldCreatePage from "./routes/golds/create.page.tsx";
import GoldEditPage from "./routes/golds/edit.page.tsx";

// ✅ React Query ใช้จัดการ server-state / cache API
const qc = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <AppShell>
          {/* ✅ Toast แจ้งเตือน CRUD หรือ error */}
          {/* <ToastContainer
            position="top-right"
            autoClose={3000}
            theme="colored"
            newestOnTop
          /> */}
          <ToastI18nProvider /> {/* ✅ ใช้ตัวที่ผูกกับ i18n */}
          {/* กำหนดเส้นทางหน้า (routes) */}
          <Routes>
            <Route path="/materials/golds" element={<GoldListPage />} />
            <Route path="/materials/golds/new" element={<GoldCreatePage />} />
            <Route path="/materials/golds/edit/:id" element={<GoldEditPage />} />
            
            {/* ✅ route อื่นที่ไม่รู้จัก → ส่งกลับ /golds */}
            <Route
              path="*"
              element={<Navigate to="/materials/golds" replace />}
            />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
