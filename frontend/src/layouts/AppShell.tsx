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

  // จำค่าสถานะไว้
  useEffect(() => {
    localStorage.setItem("bbg.collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onToggleSidebar={() => setSidebarOpenMobile((v) => !v)} />
      <div className="relative">
        <aside
          className="fixed left-0 z-30 hidden md:block border-r border-gray-100 bg-white/80 backdrop-blur"
          style={{
            top: NAV_H,
            height: `calc(100vh - ${NAV_H}px)`,
            width: collapsed ? W_COLLAPSED : W_EXPANDED,
          }}
        >
          <Sidebar
            open={sidebarOpenMobile}
            onClose={() => setSidebarOpenMobile(false)}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((v) => !v)}
          />
        </aside>

        <main
          // เพิ่ม flex + justify-center เพื่อจัดกึ่งกลางแนวนอน
          className="mx-auto max-w-none px-4 pb-10 sm:px-6 lg:px-8 flex justify-center"
          style={{
            // บนจอเล็กให้เว้นซ้าย = 0, จอใหญ่ค่อยขยับตามความกว้าง sidebar
            marginLeft: isSmall ? 0 : collapsed ? W_COLLAPSED : W_EXPANDED,
            paddingTop: NAV_H + GAP_UNDER_NAV,
          }}
        >
          {/* กล่องกำหนดความกว้างสูงสุดของคอนเทนต์ */}
          <div className="w-full max-w-screen-2xl">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
