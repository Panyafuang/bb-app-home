import { exportGoldsCsv } from "@/api/goldsClient";
import { useState } from "react";
import { FiDownload } from "react-icons/fi";

export default function ExportButtons() {
  // State สำหรับแสดงสถานะกำลังโหลด (Loading Spinner ที่ปุ่ม)
  const [isExporting, setIsExporting] = useState(false);

  // ฟังก์ชันจัดการการดาวน์โหลดไฟล์ (The Magic Logic)
  const handleExport = async () => {
    try {
      setIsExporting(true); // เริ่มหมุนติ้วๆ

      // 3.1 เรียก API (Backend จะ Streaming ข้อมูลมาให้)
      const blobData = await exportGoldsCsv();

      // 3.2 สร้าง URL ชั่วคราวสำหรับไฟล์นี้ (Object URL)
      const url = window.URL.createObjectURL(new Blob([blobData]));

      // 3.3 สร้าง element <a> ล่องหนขึ้นมา
      const link = document.createElement("a");
      link.href = url;

      // ตั้งชื่อไฟล์ (หรือจะดึงจาก Header 'Content-Disposition' ก็ได้แต่มันซับซ้อนกว่า)
      // ตรงนี้ตั้งชื่อไฟล์ตามวันที่ปัจจุบันไปเลย ง่ายดีครับ
      const fileName = `gold_records_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      link.setAttribute("download", fileName);

      // 3.4 เอาลิงก์ไปแปะใน Body, สั่งคลิก, แล้วลบทิ้ง
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link); // ลบทิ้ง (Clean up DOM)
      window.URL.revokeObjectURL(url); // ลบ URL ชั่วคราว (Clean up Memory)
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export CSV. Please try again."); // แจ้งเตือน User
    } finally {
      setIsExporting(false); // หยุดหมุน
    }
  };

  return (
    <>
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={`
              flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border
              ${
                isExporting
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
              }
            `}
      >
        {isExporting ? (
          // (Simple Spinner SVG)
          <svg
            className="animate-spin h-4 w-4 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          <FiDownload className="w-4 h-4" />
        )}
        {isExporting ? "Exporting..." : "Export CSV"}
      </button>
    </>
  );
}
