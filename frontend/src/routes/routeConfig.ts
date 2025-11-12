// รายการเส้นทางหลักของแอป (ใช้ได้ทั้ง Breadcrumbs และ Sidebar)
export const routes = {
  home: { path: "/", label: { th: "หน้าหลัก", en: "Home" } },
  golds: { path: "/golds", label: { th: "รายการทอง", en: "Golds" } },

  // ✅ ใหม่: กลุ่มวัตถุดิบ + ทอง
  materials: {
    path: "/materials",
    label: { th: "รายการวัตถุดิบ", en: "Materials" },
  },
  materialsGold: { path: "/materials/golds", label: { th: "ทอง", en: "Gold" } },
  goldsCreate: {
    path: "/materials/golds/new",
    label: { th: "เพิ่มรายการ", en: "Create" },
  },

  // goldsCreate: {
  //   path: "/golds/create",
  //   label: { th: "เพิ่มรายการ", en: "Create" },
  // },
};

// ใช้หา label จาก path แบบหยาบๆ (สำหรับ breadcrumb จาก URL segment)
export function labelFromPath(path: string, lang: string) {
  const m = Object.values(routes).find((r) => r.path === path);
  if (!m) return decodeURIComponent(path.split("/").pop() || "");
  return lang.startsWith("th") ? m.label.th : m.label.en;
}
