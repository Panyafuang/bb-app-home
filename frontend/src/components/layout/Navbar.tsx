import { FiMenu, FiBell, FiSearch } from "react-icons/fi";
import LanguageToggle from "@/components/LanguageToggle";
import { useTranslation } from "react-i18next";

export default function Navbar({
  onToggleSidebar,
}: {
  onToggleSidebar: () => void;
}) {
  const { t } = useTranslation("common");

  return (
    // fixed เต็มความกว้าง (ตามที่ตั้งไว้ก่อนหน้า)
    <header className="fixed inset-x-0 top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* ใช้ flex row ปกติ */}
        <div className="flex h-16 items-center gap-3">
          {/* ซ้าย: ปุ่มเปิด sidebar (มือถือ) + โลโก้/แท็บ */}
          <button
            onClick={onToggleSidebar}
            className="inline-flex items-center justify-center rounded-xl p-2 hover:bg-gray-50 md:hidden"
            aria-label="Toggle sidebar"
          >
            <FiMenu className="text-xl" />
          </button>

          {/* logo */}
          <div className="hidden md:block rounded-xl bg-indigo-50 px-2 py-1 text-indigo-600">
            {/* Tailwind swirl mock icon */}
            <span className="font-bold">BB</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-gray-500">
            {/* <a className="border-b-2 border-indigo-500 pb-1 font-medium text-gray-900">
              Dashboard
            </a>
            <a className="hover:text-gray-900">Team</a>
            <a className="hover:text-gray-900">Projects</a>
            <a className="hover:text-gray-900">Calendar</a> */}
          </nav>

          {/* กลาง: Search — เอา ml-auto ออก และจำกัดความกว้าง */}
          {/* <div className="w-full max-w-xl md:mx-6">
            <label className="flex items-center gap-2 rounded-2xl border px-3 py-2 text-gray-400 focus-within:ring-2 focus-within:ring-indigo-200">
              <FiSearch className="text-lg" />
              <input
                placeholder={t("search.submit") ?? "Search"}
                className="w-full bg-transparent text-gray-700 outline-none placeholder:text-gray-400"
              />
            </label>
          </div> */}

          {/* ขวา: กลุ่มปุ่ม — ใส่ ml-auto ให้ชิดขวาสุด */}
          <div className="ml-auto flex items-center gap-2">
            <button className="hidden md:inline-flex rounded-xl p-2 text-gray-500 hover:bg-gray-50">
              <FiBell className="text-xl" />
            </button>
            <LanguageToggle />
            <img
              src="https://i.pravatar.cc/40?img=1"
              alt="avatar"
              className="h-9 w-9 rounded-full ring-2 ring-white shadow"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
