// src/components/layout/Sidebar.tsx
import { NavLink } from "react-router-dom";
import {
  FiGrid, FiShoppingCart, FiUsers, FiFileText, FiInbox, FiLogIn, FiUserPlus,
  FiChevronDown, FiBox, FiCreditCard, FiChevronsLeft, FiChevronsRight
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useMemo, useState, type JSX } from "react";

type Item = { to?: string; key: string; icon?: JSX.Element; children?: Item[] };

export default function Sidebar({
  open,
  onClose,
  collapsed,
  onToggleCollapse,
}: {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const { t } = useTranslation("common");
  const [openGroup, setOpenGroup] = useState<string | null>("ecommerce");

  const MENU: Item[] = useMemo(
    () => [
      { to: "/dashboard", key: "menu.dashboard", icon: <FiGrid /> },
      {
        key: "menu.ecommerce",
        icon: <FiShoppingCart />,
        children: [
          { to: "/products", key: "menu.products", icon: <FiBox /> },
          { to: "/billing",  key: "menu.billing",  icon: <FiCreditCard /> },
          { to: "/invoice",  key: "menu.invoice",  icon: <FiFileText /> },
        ],
      },
      { to: "/inbox",  key: "menu.inbox",  icon: <FiInbox /> },
      { to: "/users",  key: "menu.users",  icon: <FiUsers /> },
      { to: "/signin", key: "menu.signin", icon: <FiLogIn /> },
      { to: "/signup", key: "menu.signup", icon: <FiUserPlus /> },
    ],
    []
  );

  const Content = (
    // 👇 relative เพื่อผูกตำแหน่งปุ่ม absolute ด้านล่าง
    <div className="relative flex h-full w-full flex-col bg-white/80 backdrop-blur">
      <nav className="px-3 py-3 text-sm">
        {MENU.map((item) =>
          item.children ? (
            <div key={item.key} className="mb-1">
              <button
                onClick={() => setOpenGroup(openGroup === item.key ? null : item.key)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-gray-50 ${
                  collapsed ? "justify-center" : ""
                }`}
                title={collapsed ? t(item.key) : undefined}
              >
                <span className="inline-flex items-center gap-3">
                  <span className="text-lg text-gray-600">{item.icon}</span>
                  {!collapsed && <span className="font-medium text-gray-700">{t(item.key)}</span>}
                </span>
                {!collapsed && <FiChevronDown className={`transition ${openGroup === item.key ? "rotate-180" : ""}`} />}
              </button>

              {!collapsed && openGroup === item.key && (
                <div className="ml-11 mt-1 flex flex-col">
                  {item.children!.map((c) => (
                    <NavLink
                      key={c.key}
                      to={c.to!}
                      className={({ isActive }) =>
                        `my-0.5 rounded-xl px-3 py-2 ${
                          isActive ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"
                        }`
                      }
                    >
                      {t(c.key)}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <NavLink
              key={item.key}
              to={item.to!}
              title={collapsed ? t(item.key) : undefined}
              className={({ isActive }) =>
                `mb-1 inline-flex w-full items-center gap-3 rounded-xl px-3 py-2 ${
                  isActive ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-50"
                } ${collapsed ? "justify-center" : ""}`
              }
            >
              <span className="text-lg text-gray-600">{item.icon}</span>
              {!collapsed && <span className="font-medium">{t(item.key)}</span>}
            </NavLink>
          )
        )}
      </nav>

      {/* ⬇️ ปุ่มยุบ/ขยาย — จะติดก้น sidebar เสมอ */}
      <div className="absolute bottom-4 left-0 w-full px-3">
        <button
          onClick={onToggleCollapse}
          className="mx-auto flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2 text-gray-600 hover:bg-gray-50"
          title={collapsed ? t("menu.expand") : t("menu.collapse")}
        >
          {collapsed ? <FiChevronsRight /> : <FiChevronsLeft />}
          {!collapsed && <span className="text-sm">{t("menu.collapse")}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed column */}
      <div className="hidden h-full w-full md:block" style={{ width: "100%", height: "100%" }}>
        {Content}
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl">
            {Content}
          </div>
        </div>
      )}
    </>
  );
}
