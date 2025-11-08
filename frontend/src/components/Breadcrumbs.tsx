// import { Link, useLocation } from "react-router-dom";
// import { useTranslation } from "react-i18next";

// /** แผนที่ path segment → key แปล */
// const LABEL_MAP: Record<string, string> = {
//   "golds": "crumb.golds",
//   "create": "crumb.create",
//   "edit": "crumb.edit",
//   "dashboard": "crumb.dashboard",
//   "products": "crumb.products",
// };

// interface BreadcrumbsProps {
//   items?: Array<{ label: string; href?: string }>;
// }

// export default function Breadcrumbs({ items = [] }: BreadcrumbsProps) {
// // export default function Breadcrumbs() {
//   const { pathname } = useLocation();
//   const { t } = useTranslation("common");

//   const parts = pathname.split("/").filter(Boolean);
//   const links = parts.map((p, i) => {
//     const to = "/" + parts.slice(0, i + 1).join("/");
//     const label = t(LABEL_MAP[p] ?? p);
//     return { to, label, last: i === parts.length - 1 };
//   });

//   if (links.length === 0) return null;

//   return (
//     <div className="mb-4 text-sm text-gray-500">
//       <ol className="flex items-center gap-2">
//         <li>
//           <Link to="/dashboard" className="hover:text-gray-900">{t("crumb.home")}</Link>
//         </li>
//         {links.map((l, i) => (
//           <li key={i} className="flex items-center gap-2">
//             <span>/</span>
//             {l.last ? (
//               <span className="text-gray-900">{l.label}</span>
//             ) : (
//               <Link to={l.to} className="hover:text-gray-900">{l.label}</Link>
//             )}
//           </li>
//         ))}
//       </ol>
//     </div>
//   );
// }



// import { useTranslation } from "react-i18next";

// import { NavLink, useLocation } from "react-router-dom";
// import useBreadcrumbs from "@/hooks/useBreadcrumbs";

// export default function Breadcrumbs({ className = "" }: { className?: string }) {
//   const { t } = useTranslation("common");
//   const { pathname } = useLocation();
//   const crumbs = useBreadcrumbs(navigator.language || "th");

//   return (
//     <nav aria-label="Breadcrumb" className={"text-sm " + className}>
//       <ol className="flex flex-wrap items-center gap-1 text-gray-500">
//         {crumbs.map((c, i) => {
//           const isCurrent = c.href === pathname;
//           return (
//             <li key={c.href} className="inline-flex items-center gap-1">
//               <NavLink
//                 to={c.href}
//                 aria-current={isCurrent ? "page" : undefined}
//                 className={({ isActive }) =>
//                   "rounded px-2 py-1 hover:bg-gray-100 " +
//                   (isActive || isCurrent ? "text-gray-900 font-medium" : "text-gray-500")
//                 }
//               >
//                 {c.label}
//               </NavLink>
//               {i < crumbs.length - 1 && <span className="text-gray-300">/</span>}
//             </li>
//           );
//         })}
//       </ol>
//     </nav>
//   );
// }


import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";
import useBreadcrumbs from "@/hooks/useBreadcrumbs";

export default function Breadcrumbs({ className = "" }: { className?: string }) {
  // 1. (แก้ไข) ดึง i18n instance ออกมาจาก useTranslation
  const { t, i18n } = useTranslation("common"); 
  const { pathname } = useLocation();

  // 2. (แก้ไข) ส่ง i18n.language (ภาษาที่ i18next ใช้อยู่)
  //    แทน navigator.language
  const crumbs = useBreadcrumbs(i18n.language || "th");

  return (
    <nav aria-label="Breadcrumb" className={"text-sm " + className}>
      <ol className="flex flex-wrap items-center gap-1 text-gray-500">
        {crumbs.map((c, i) => {
          const isCurrent = c.href === pathname;
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
                {c.label}
              </NavLink>
              {i < crumbs.length - 1 && <span className="text-gray-300">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}