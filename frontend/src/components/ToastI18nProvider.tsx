import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";

// ทำให้ ToastContainer re-render เมื่อภาษาเปลี่ยน
export default function ToastI18nProvider() {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language);

  useEffect(() => {
    const handler = (l: string) => setLang(l);
    i18n.on("languageChanged", handler);
    return () => { i18n.off("languageChanged", handler); };
  }, [i18n]);

  return (
    <ToastContainer
      key={lang}                 // บังคับ remount เมื่อเปลี่ยนภาษา
      position="top-right"
      autoClose={3000}
      theme="colored"
      newestOnTop
      rtl={i18n.dir() === "rtl"} // เผื่ออนาคตเพิ่มภาษา RTL
      closeOnClick
      pauseOnHover
    />
  );
}
