import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LuLayoutDashboard,
  LuShoppingCart,
  LuInbox,
  LuUsers,
  LuLogIn,
  LuUserPlus,
  LuCoins,
  LuChevronsLeft,
  LuChevronsRight,
  LuPackage,
  LuChevronDown,
} from "react-icons/lu";
import { useState, useMemo } from "react";

export type SidebarProps = {
  /** สำหรับ mobile drawer: เปิด/ปิด */
  open?: boolean;
  /** เรียกเมื่ออยากปิด mobile drawer */
  onClose?: () => void;
  /** collapsed = true => แสดง sidebar แบบยุบ (ไอคอนแนวตั้ง) */
  collapsed?: boolean;
  /** toggle ฟังก์ชันเพื่อสลับ collapsed state */
  onToggleCollapse?: () => void;
  // ถ้าต้องการรับ children หรือ props ของ element ปกติ เพิ่มได้
  className?: string;
};

const baseItem =
  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors";
const linkClass = (isActive: boolean) =>
  isActive
    ? `${baseItem} bg-blue-100 text-blue-700`
    : `${baseItem} text-gray-700 hover:bg-gray-100 hover:text-blue-600`;

export default function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const { i18n } = useTranslation("common");
  const isTH = (i18n.language || "th").startsWith("th");
  const { pathname } = useLocation();

  // ✅ เมนูเดิมทั้งหมด + เพิ่มกลุ่มรายการวัตถุดิบ
  const items = [
    {
      type: "link",
      to: "/",
      icon: <LuLayoutDashboard />,
      label: isTH ? "แดชบอร์ด" : "Dashboard",
      end: true,
    },
    {
      type: "link",
      to: "/ecommerce",
      icon: <LuShoppingCart />,
      label: isTH ? "อีคอมเมิร์ซ" : "E-commerce",
    },
    {
      type: "link",
      to: "/inbox",
      icon: <LuInbox />,
      label: isTH ? "กล่องจดหมาย" : "Inbox",
    },
    {
      type: "link",
      to: "/users",
      icon: <LuUsers />,
      label: isTH ? "ผู้ใช้" : "Users",
    },

    // ✅ กลุ่ม: รายการวัตถุดิบ -> ทอง
    {
      type: "group",
      icon: <LuPackage />,
      label: isTH ? "รายการวัตถุดิบ" : "Materials",
      base: "/materials",
      children: [
        {
          to: "/materials/golds",
          icon: <LuCoins />,
          label: isTH ? "ทอง" : "Gold",
          // end: true,
        },
        // ถ้าภายหลังมี “เงิน / แพลทินัม” ก็เติมใน children ได้เลย
      ],
    },

    {
      type: "link",
      to: "/signin",
      icon: <LuLogIn />,
      label: isTH ? "เข้าสู่ระบบ" : "Sign In",
    },
    {
      type: "link",
      to: "/signup",
      icon: <LuUserPlus />,
      label: isTH ? "สมัครสมาชิก" : "Sign Up",
    },
    {
      type: "link",
      to: "/golds",
      icon: <LuCoins />,
      label: isTH ? "รายการทอง" : "Golds",
      end: true,
    },
  ] as const;

  // เปิด submenu อัตโนมัติถ้า path อยู่ในกลุ่ม /materials
  const defaultOpen = useMemo(
    () => pathname.startsWith("/materials"),
    [pathname]
  );
  const [openMaterials, setOpenMaterials] = useState<boolean>(defaultOpen);

  return (
    <div className="flex h-full flex-col border-r border-gray-200">
      <div className="relative flex h-full w-full flex-col bg-white/80 backdrop-blur">
        <nav className="px-3 py-3 text-sm">
          {items.map((it, idx) => {
            if (it.type === "link") {
              return (
                <NavLink
                  key={idx}
                  to={it.to}
                  end={(it as any).end}
                  title={collapsed ? it.label : undefined}
                  className={({ isActive }) => linkClass(isActive)}
                >
                  <span className="text-lg">{it.icon}</span>
                  {!collapsed && <span className="truncate">{it.label}</span>}
                </NavLink>
              );
            }

            // ====== group: รายการวัตถุดิบ ======
            const groupActive = pathname.startsWith(it.base);
            return (
              <div key={idx} className="space-y-1">
                <button
                  type="button"
                  onClick={() => setOpenMaterials((v) => !v)}
                  className={
                    baseItem +
                    " w-full " +
                    (groupActive
                      ? "bg-blue-100 text-blue-700" // << สีฟ้าอ่อนตอน active
                      : "text-gray-700 hover:bg-gray-100 hover:text-blue-600")
                  }
                  title={collapsed ? it.label : undefined}
                >
                  <span className="text-lg">{it.icon}</span>
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{it.label}</span>
                      <LuChevronDown
                        className={
                          "transition-transform " +
                          (openMaterials ? "rotate-180" : "rotate-0")
                        }
                      />
                    </>
                  )}
                </button>

                {/* children */}
                {openMaterials && (
                  <div className={"space-y-1 " + (collapsed ? "pl-0" : "pl-8")}>
                    {it.children.map((c) => (
                      <NavLink
                        key={c.to}
                        to={c.to}
                        // end={c.end}
                        title={collapsed ? c.label : undefined}
                        className={({ isActive }) => linkClass(isActive)}
                      >
                        <span className="text-lg">{c.icon}</span>
                        {!collapsed && (
                          <span className="truncate">{c.label}</span>
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-gray-200 p-2">
        <button
          onClick={onToggleCollapse}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
        >
          {collapsed ? <LuChevronsRight /> : <LuChevronsLeft />}
          {!collapsed && (isTH ? "ยุบเมนู" : "Collapse")}
        </button>
      </div>
    </div>
  );
}
