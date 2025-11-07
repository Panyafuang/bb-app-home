import i18n from 'i18next';
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';

import en from "./locales/en/common.json";
import th from "./locales/th/common.json";

i18n
    .use(LanguageDetector) // ตรวจจับภาษา: localStorage / browser
    .use(initReactI18next) // ผูก i18n เข้ากับ React
    .init({
        resources: { en: { common: en }, th: { common: th } }, // คลังข้อมูลแปล
        fallbackLng: "en", // ภาษายามฉุกเฉิน
        ns: ["common"], // กำหนดชื่อกลุ่มของไฟล์แปลที่ใช้ในแอปพลิเคชัน (ในกรณีนี้คือ common)
        /** กำหนดว่าหากเราเรียกใช้ข้อความแปลโดยไม่ระบุ Namespace ให้ถือว่าข้อความนั้นอยู่ในกลุ่ม common */
        defaultNS: "common",
        /** กำหนดลำดับที่ LanguageDetector ควรลองค้นหาภาษาของผู้ใช้: ["localStorage", "navigator", "htmlTag"] และให้แคชไว้ใน localStorage */
        detection: { order: ["localStorage", "navigator", "htmlTag"], caches: ["localStorage"] },
        /** ไม่ต้องหนี (Escape) ค่า HTML เมื่อมีการฝังตัวแปรเข้าไปในข้อความแปล */
        interpolation: { escapeValue: false }
    });

export default i18n;