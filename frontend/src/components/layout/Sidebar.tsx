// // src/components/layout/Sidebar.tsx
// import { NavLink } from "react-router-dom";
// import {
//   FiGrid, FiShoppingCart, FiUsers, FiFileText, FiInbox, FiLogIn, FiUserPlus,
//   FiChevronDown, FiBox, FiCreditCard, FiChevronsLeft, FiChevronsRight
// } from "react-icons/fi";
// import { useTranslation } from "react-i18next";
// import { useMemo, useState, type JSX } from "react";

// type Item = { to?: string; key: string; icon?: JSX.Element; children?: Item[] };

// export default function Sidebar({
//   open,
//   onClose,
//   collapsed,
//   onToggleCollapse,
// }: {
//   open: boolean;
//   onClose: () => void;
//   collapsed: boolean;
//   onToggleCollapse: () => void;
// }) {
//   const { t } = useTranslation("common");
//   const [openGroup, setOpenGroup] = useState<string | null>("ecommerce");

//   const MENU: Item[] = useMemo(
//     () => [
//       { to: "/dashboard", key: "menu.dashboard", icon: <FiGrid /> },
//       {
//         key: "menu.ecommerce",
//         icon: <FiShoppingCart />,
//         children: [
//           { to: "/products", key: "menu.products", icon: <FiBox /> },
//           { to: "/billing",  key: "menu.billing",  icon: <FiCreditCard /> },
//           { to: "/invoice",  key: "menu.invoice",  icon: <FiFileText /> },
//         ],
//       },
//       { to: "/inbox",  key: "menu.inbox",  icon: <FiInbox /> },
//       { to: "/users",  key: "menu.users",  icon: <FiUsers /> },
//       { to: "/signin", key: "menu.signin", icon: <FiLogIn /> },
//       { to: "/signup", key: "menu.signup", icon: <FiUserPlus /> },
//     ],
//     []
//   );

//   const Content = (
//     // 👇 relative เพื่อผูกตำแหน่งปุ่ม absolute ด้านล่าง
//     <div className="relative flex h-full w-full flex-col bg-white/80 backdrop-blur">
//       <nav className="px-3 py-3 text-sm">
//         {MENU.map((item) =>
//           item.children ? (
//             <div key={item.key} className="mb-1">
//               <button
//                 onClick={() => setOpenGroup(openGroup === item.key ? null : item.key)}
//                 className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-gray-50 ${
//                   collapsed ? "justify-center" : ""
//                 }`}
//                 title={collapsed ? t(item.key) : undefined}
//               >
//                 <span className="inline-flex items-center gap-3">
//                   <span className="text-lg text-gray-600">{item.icon}</span>
//                   {!collapsed && <span className="font-medium text-gray-700">{t(item.key)}</span>}
//                 </span>
//                 {!collapsed && <FiChevronDown className={`transition ${openGroup === item.key ? "rotate-180" : ""}`} />}
//               </button>

//               {!collapsed && openGroup === item.key && (
//                 <div className="ml-11 mt-1 flex flex-col">
//                   {item.children!.map((c) => (
//                     <NavLink
//                       key={c.key}
//                       to={c.to!}
//                       className={({ isActive }) =>
//                         `my-0.5 rounded-xl px-3 py-2 ${
//                           isActive ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"
//                         }`
//                       }
//                     >
//                       {t(c.key)}
//                     </NavLink>
//                   ))}
//                 </div>
//               )}
//             </div>
//           ) : (
//             <NavLink
//               key={item.key}
//               to={item.to!}
//               title={collapsed ? t(item.key) : undefined}
//               className={({ isActive }) =>
//                 `mb-1 inline-flex w-full items-center gap-3 rounded-xl px-3 py-2 ${
//                   isActive ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-50"
//                 } ${collapsed ? "justify-center" : ""}`
//               }
//             >
//               <span className="text-lg text-gray-600">{item.icon}</span>
//               {!collapsed && <span className="font-medium">{t(item.key)}</span>}
//             </NavLink>
//           )
//         )}
//       </nav>

//       {/* ⬇️ ปุ่มยุบ/ขยาย — จะติดก้น sidebar เสมอ */}
//       <div className="absolute bottom-4 left-0 w-full px-3">
//         <button
//           onClick={onToggleCollapse}
//           className="mx-auto flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2 text-gray-600 hover:bg-gray-50"
//           title={collapsed ? t("menu.expand") : t("menu.collapse")}
//         >
//           {collapsed ? <FiChevronsRight /> : <FiChevronsLeft />}
//           {!collapsed && <span className="text-sm">{t("menu.collapse")}</span>}
//         </button>
//       </div>
//     </div>
//   );

//   return (
//     <>
//       {/* Desktop fixed column */}
//       <div className="hidden h-full w-full md:block" style={{ width: "100%", height: "100%" }}>
//         {Content}
//       </div>

//       {/* Mobile drawer */}
//       {open && (
//         <div className="fixed inset-0 z-50 md:hidden">
//           <div className="absolute inset-0 bg-black/40" onClick={onClose} />
//           <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl">
//             {Content}
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

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

type SidebarProps = {
  collapsed: boolean;
  onToggleCollapse: () => void;
};

const baseItem =
  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors";
const linkClass = (isActive: boolean) => isActive ? `${baseItem} bg-blue-100 text-blue-700` : `${baseItem} text-gray-700 hover:bg-gray-100 hover:text-blue-600`;

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
      label: "E-commerce",
    },
    { type: "link", to: "/inbox", icon: <LuInbox />, label: "Inbox" },
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
          to: "/materials/gold",
          icon: <LuCoins />,
          label: isTH ? "ทอง" : "Gold",
          end: true,
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
    <div className="flex h-full flex-col">
      {/* <div className="flex-1 overflow-y-auto px-2">
        <nav className="mt-1 space-y-1"> */}

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
                        end={c.end}
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

      <div className="border-t border-gray-100 p-2">
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
