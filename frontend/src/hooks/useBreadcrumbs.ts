import { useLocation } from "react-router-dom";
import { labelFromPath } from "@/routes/routeConfig";

export type Crumb = { href: string; label: string };

export default function useBreadcrumbs(lang = "th") {
  const { pathname } = useLocation();

  // "/golds/create" -> ["/golds", "/golds/create"]
  const segments = pathname
    .split("/")
    .filter(Boolean)
    .map((_, i, arr) => "/" + arr.slice(0, i + 1).join("/"));

  const crumbs: Crumb[] = segments.map((href) => ({
    href,
    label: labelFromPath(href, lang),
  }));

  // หน้าหลักเสมอเป็นตัวแรก
  return [
    { href: "/", label: labelFromPath("/", lang) },
    ...crumbs.filter((c) => c.href !== "/"),
  ];
}
