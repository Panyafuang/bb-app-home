// ✅ ตั้งค่า i18n: ใช้ i18next + react-i18next + language detector
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en/common.json";
import th from "./locales/th/common.json";

i18n
  .use(LanguageDetector) // ตรวจจับภาษา: localStorage / browser
  .use(initReactI18next) // ผูก i18n เข้ากับ React
  .init({
    resources: { en: { common: en }, th: { common: th } },
    fallbackLng: "en",
    ns: ["common"],
    defaultNS: "common",
    detection: { order: ["localStorage", "navigator", "htmlTag"], caches: ["localStorage"] },
    interpolation: { escapeValue: false }
  });

export default i18n;
