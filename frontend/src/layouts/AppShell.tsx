import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import useMediaQuery from "@/hooks/useMediaQuery";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);

  // โหลดสภาพเดิมจาก localStorage (ถ้าไม่มีก็ตั้งเป็น false = ขยาย)
  const initialCollapsed = useMemo(() => {
    if (typeof window === "undefined") return false;
    const v = localStorage.getItem("bbg.collapsed");
    return v === "1";
  }, []);
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  // ค่าคงที่ layout
  const NAV_H = 64;
  const GAP_UNDER_NAV = 16;
  const W_COLLAPSED = 72;
  const W_EXPANDED = 288;

  // ✅ auto-collapse เมื่อจอเล็ก (≤ 1280px = xl)
  const isSmall = useMediaQuery("(max-width: 1280px)");
  useEffect(() => {
    if (isSmall) setCollapsed(true);
    else setCollapsed((prev) => prev); // ไม่ยุ่งถ้าจอใหญ่ (คงค่าที่จำไว้)
  }, [isSmall]);

  // จำค่า collapsed ไว้ใน localStorage
  useEffect(() => {
    localStorage.setItem("bbg.collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  // ⭐ Sidebar width
  const sidebarWidth = collapsed ? W_COLLAPSED : W_EXPANDED;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onToggleSidebar={() => setSidebarOpenMobile((v) => !v)} />
      <div className="relative">
        {/* ----------------- SIDEBAR ----------------- */}
        <aside
          className="fixed left-0 z-30 hidden md:block border-r border-gray-100 bg-white/80 backdrop-blur"
          style={{
            top: NAV_H,
            height: `calc(100vh - ${NAV_H}px)`,
            width: sidebarWidth,
          }}
        >
          <Sidebar
            open={sidebarOpenMobile}
            onClose={() => setSidebarOpenMobile(false)}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((v) => !v)}
          />
        </aside>

        {/* ----------------- MAIN CONTENT ----------------- */}

        {/* <main
          // เพิ่ม flex + justify-center เพื่อจัดกึ่งกลางแนวนอน
          className="mx-auto max-w-none px-4 pb-10 sm:px-6 lg:px-8 flex justify-center"
          style={{
            // บนจอเล็กให้เว้นซ้าย = 0, จอใหญ่ค่อยขยับตามความกว้าง sidebar
            marginLeft: isSmall ? 0 : collapsed ? W_COLLAPSED : W_EXPANDED,
            paddingTop: NAV_H + GAP_UNDER_NAV,
          }}
        > */}
        {/* กล่องกำหนดความกว้างสูงสุดของคอนเทนต์ */}
        {/* <div className="w-full max-w-screen-2xl">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
              {children}
            </div>
          </div>
        </main> */}

        <main
          style={{
            // ขยับ content ออกจาก sidebar โดยใช้ค่า sidebarWidth
            marginLeft: sidebarWidth,

            // ทำให้เนื้อหายืดเต็มพื้นที่ที่เหลือแบบ dynamic
            width: `calc(100% - ${sidebarWidth}px)`,

            // ระยะห่างจาก Navbar
            paddingTop: NAV_H + GAP_UNDER_NAV,
          }}
          className="px-4 pb-10 sm:px-6 lg:px-8"
        >
          {/* IMPORTANT: container ที่คุมความกว้างของเนื้อหา */}
          {/* 
            max-w-screen-2xl = ทำให้เนื้อหากว้างขึ้นกว่าปกติ 
            👉 ถ้าอยากกว้างสุดๆ ใช้ max-w-none 
            👉 ถ้าอยากจำกัดกลางๆ ใช้ max-w-screen-xl 
          */}
          <div className="mx-auto w-full max-w-none">
            {/* ใส่กล่องพื้นหลังของแต่ละหน้า คุณสามารถลบกรอบขาวนี้ออกได้ ถ้าอยากให้หน้าดิบแบบ dashboard 
            */}
            {/* <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"> */}
            <div>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
