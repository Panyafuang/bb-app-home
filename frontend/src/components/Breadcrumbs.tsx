import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";
import useBreadcrumbs from "@/hooks/useBreadcrumbs";

export default function Breadcrumbs({
  className = "",
}: {
  className?: string;
}) {
  // 1. (แก้ไข) ดึง i18n instance ออกมาจาก useTranslation
  const { i18n, t } = useTranslation("common");
  const { pathname } = useLocation();

  // 2. (แก้ไข) ส่ง i18n.language (ภาษาที่ i18next ใช้อยู่)
  const crumbs = useBreadcrumbs(i18n.language || "th");

  const editMatch = pathname.match(/\/materials\/golds\/edit\/([^/]+)/);
  const highlightId = editMatch?.[1];

  return (
    <nav aria-label="Breadcrumb" className={"text-sm " + className}>
      <ol className="flex flex-wrap items-center gap-1 text-gray-500">
        {crumbs.map((c, i) => {
          const isCurrent = c.href === pathname;
          const isIdSegment = Boolean(highlightId && c.label === highlightId);

          return (
            <li key={c.href} className="inline-flex items-center gap-1">
              <NavLink
                to={c.href}
                aria-current={isCurrent ? "page" : undefined}
                className={({ isActive }) =>
                  "rounded px-2 py-1 hover:bg-gray-100 " +
                  (isActive || isCurrent
                    ? "text-gray-900 font-medium"
                    : "text-gray-500")
                }
              >
                {/* {c.label} */}
                {isIdSegment ? (
                  <span className="bg-yellow-100 text-yellow-800 rounded px-2 py-1">
                    {c.label}
                  </span>
                ) : (
                  (c.label === "edit" && t("table.edit")) || c.label
                )}
              </NavLink>
              {i < crumbs.length - 1 && (
                <span className="text-gray-300">/</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
