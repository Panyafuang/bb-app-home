import i18n from "@/i18n";
import { useTranslation } from "react-i18next";

export default function LanguageToggle() {
  const { i18n: inst } = useTranslation();
  const current = inst.language?.startsWith("th") ? "th" : "en";

  function switchTo(lang: "th" | "en") {
    i18n.changeLanguage(lang);
  }

  return <div className="inline-flex overflow-hidden rounded-xl border">
    <button
        type="button"
        onClick={() => switchTo("th")}
        className={`px-3 py-1 text-sm ${current === "th" ? "bg-gray-900 text-white" : "bg-white hover:bg-gray-50"}`}
        aria-pressed={current === "th"}
    >
        TH
    </button>
    <button
        type="button"
        onClick={() => switchTo("en")}
        className={`px-3 py-1 text-sm ${current === "en" ? "bg-gray-900 text-white" : "bg-white hover:bg-gray-50"}`}
        aria-pressed={current === "en"}
    >
        EN
    </button>
  </div>;
}
