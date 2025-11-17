import { useTranslation } from "react-i18next";
import { FaFileCsv, FaFilePdf } from "react-icons/fa6";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
// @ts-ignore
import autoTable from "jspdf-autotable";

import type { GoldRecord } from "../types";
import { finenessToKarat } from "@/utils/utils";

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export default function ExportButtons({
  data,
  filename,
}: {
  data: any[];
  filename: string;
}) {
  const { t } = useTranslation("common");

  function formatDate(t?: string | null) {
    if (!t) return "";
    const d = new Date(t);
    if (isNaN(d.getTime())) return String(t);
    return d.toLocaleString(); // ปรับรูปแบบถ้าต้องการ
  }

  function exportToCSV(data: GoldRecord[], filename = "gold_records.csv") {
    if (!data || data.length === 0) {
      const blob = new Blob([`status,info\nno_data,No records to export`], {
        type: "text/csv;charset=utf-8;",
      });
      saveAs(blob, filename);
      return;
    }

    const columnsOrder = [
      { key: "timestamp_tz", label: "วันที่" },
      { key: "ledger", label: "ประเภททอง" },
      { key: "reference_number", label: "เลขอ้างอิง" },
      { key: "related_reference_number", label: "เลขอ้างอิงที่เกี่ยวข้อง" },
      { key: "gold_in_grams", label: "น้ำหนักเข้า(กรัม)" },
      { key: "gold_out_grams", label: "น้ำหนักออก(กรัม)" },
      { key: "fineness", label: "เปอร์เซ็นต์ทอง" },
      { key: "counterpart", label: "คู่ค้า" },
      { key: "status", label: "สถานะ" },
      { key: "good_details", label: "รายละเอียดสินค้า" },
      { key: "remarks", label: "หมายเหตุ" },
    ];

    const header = columnsOrder
      .map((c) => `"${c.label.replace(/"/g, '""')}"`)
      .join(",");

    const rows = data.map((row) => {
      return columnsOrder
        .map((col) => {
          const k = col.key as keyof GoldRecord;
          let val: any = row[k];

          if (k === "timestamp_tz") val = formatDate(String(val));
          if (k === "fineness") val = finenessToKarat(Number(val));

          if (val === null || val === undefined) return '""';
          const s = String(val).replace(/"/g, '""');
          return `"${s}"`;
        })
        .join(",");
    });

    const csv = [header, ...rows].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, filename);
  }

  // ทำให้ exportToPDF เป็น async
  async function exportToPDF(data: GoldRecord[], filename = "gold_records.pdf") {
    // path ที่ต้องวางฟอนต์: public/fonts/NotoSansThai-Regular.ttf
    const fontUrl = "/fonts/NotoSansThai-Regular.ttf";
    try {
      const resp = await fetch(fontUrl);
      if (!resp.ok) throw new Error("Cannot fetch font: " + resp.status);
      const buf = await resp.arrayBuffer();
      const base64 = arrayBufferToBase64(buf);

      // ลงทะเบียนฟอนต์กับ jsPDF (บางเวอร์ชันต้องใช้ API บน jsPDF)
      try {
        // @ts-ignore
        (jsPDF as any).API.addFileToVFS("NotoSansThai-Regular.ttf", base64);
        // @ts-ignore
        (jsPDF as any).API.addFont("NotoSansThai-Regular.ttf", "NotoSansThai", "normal");
      } catch (e) {
        // บางเวอร์ชันใช้ instance API
        try {
          // @ts-ignore
          jsPDF.API.addFileToVFS("NotoSansThai-Regular.ttf", base64);
          // @ts-ignore
          jsPDF.API.addFont("NotoSansThai-Regular.ttf", "NotoSansThai", "normal");
        } catch (err) {
          console.warn("Could not register font via jsPDF API", err);
        }
      }
    } catch (e) {
      console.warn("Could not load font for PDF, fallback to default:", e);
    }

    const doc = new jsPDF("landscape", "pt", "a4");

    // ตั้งฟอนต์ถ้าลงทะเบียนสำเร็จ (ไม่ล้มโปรแกรมถ้าไม่สำเร็จ)
    try {
      // @ts-ignore
      doc.setFont("NotoSansThai");
    } catch (e) {
      // ignore
    }

    const title = "Gold Records";
    doc.setFontSize(14);
    doc.text(title, 40, 40);

    const columns = [
      { header: "วันที่", dataKey: "timestamp_tz" },
      { header: "ประเภททอง", dataKey: "ledger" },
      { header: "เลขอ้างอิง", dataKey: "reference_number" },
      { header: "เลขอ้างอิงที่เกี่ยวข้อง", dataKey: "related_reference_number" },
      { header: "น้ำหนักเข้า(กรัม)", dataKey: "gold_in_grams" },
      { header: "น้ำหนักออก(กรัม)", dataKey: "gold_out_grams" },
      { header: "เปอร์เซ็นต์ทอง", dataKey: "fineness" },
      { header: "คู่ค้า", dataKey: "counterpart" },
      { header: "สถานะ", dataKey: "status" },
      { header: "รายละเอียดสินค้า", dataKey: "good_details" },
      { header: "หมายเหตุ", dataKey: "remarks" },
    ];

    const body = data.map((row) => ({
      timestamp_tz: formatDate(row.timestamp_tz ?? ""),
      ledger: row.ledger ?? "",
      reference_number: row.reference_number ?? "",
      related_reference_number: row.related_reference_number ?? "",
      gold_in_grams: row.gold_in_grams != null ? String(row.gold_in_grams) : "",
      gold_out_grams: row.gold_out_grams != null ? String(row.gold_out_grams) : "",
      fineness: finenessToKarat(row.fineness),
      counterpart: row.counterpart ?? "",
      status: row.status ?? "",
      good_details: row.good_details ?? "",
      remarks: row.remarks ?? "",
    }));

    autoTable(doc, {
      startY: 60,
      head: [columns.map((c) => c.header)],
      body: body.map((r) => columns.map((c) => (r as any)[c.dataKey])),
      headStyles: { fillColor: [22, 160, 133] },
      margin: { left: 20, right: 20, top: 20, bottom: 20 },
      didDrawPage: (dataArg: any) => {
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.text(
          `Page ${dataArg.pageNumber} / ${pageCount}`,
          dataArg.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      },
      styles: { fontSize: 10, font: "NotoSansThai", cellPadding: 4 },
    });

    doc.save(filename);
  }

  return (
    <div className="md:col-span-2 flex justify-end gap-2 self-end">
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg px-4 py-2 hover:bg-gray-50 text-sm border border-gray-200"
        onClick={() => void exportToPDF(data, (filename ?? "gold_records") + ".pdf")}
      >
        <FaFilePdf />
        {t("button.exports.pdf")}
      </button>

      <button
        type="button"
        className="flex items-center gap-2 rounded-lg px-4 py-2 hover:bg-gray-50 text-sm border border-gray-200"
        onClick={() => exportToCSV(data, (filename ?? "gold_records") + ".csv")}
      >
        <FaFileCsv />
        {t("button.exports.csv")}
      </button>
    </div>
  );
}
