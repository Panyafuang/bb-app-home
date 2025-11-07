import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

/** แผนที่ path segment → key แปล */
const LABEL_MAP: Record<string, string> = {
  "golds": "crumb.golds",
  "create": "crumb.create",
  "edit": "crumb.edit",
  "dashboard": "crumb.dashboard",
  "products": "crumb.products",
};

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const { t } = useTranslation("common");

  const parts = pathname.split("/").filter(Boolean);
  const links = parts.map((p, i) => {
    const to = "/" + parts.slice(0, i + 1).join("/");
    const label = t(LABEL_MAP[p] ?? p);
    return { to, label, last: i === parts.length - 1 };
  });

  if (links.length === 0) return null;

  return (
    <div className="mb-4 text-sm text-gray-500">
      <ol className="flex items-center gap-2">
        <li>
          <Link to="/dashboard" className="hover:text-gray-900">{t("crumb.home")}</Link>
        </li>
        {links.map((l, i) => (
          <li key={i} className="flex items-center gap-2">
            <span>/</span>
            {l.last ? (
              <span className="text-gray-900">{l.label}</span>
            ) : (
              <Link to={l.to} className="hover:text-gray-900">{l.label}</Link>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
