export const COMPANY_FOUNDED = "1991-03-11";

/** แปลงค่าตัวเลขอย่างปลอดภัย */
export function parseNumber(v: any): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

/** ดึงค่าวันที่ปัจจุบันในรูปแบบ YYYY-MM-DD */
export function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function finenessToKarat(value: number | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "";

  const v = Number(value);

  // --------------------------------------------
  // (A) เงื่อนไขพิเศษ: 140 และ 950 → แสดงเป็นเปอร์เซ็นต์เท่านั้น
  // --------------------------------------------
  if (v === 140) return "14%";
  if (v === 950) return "95%";

  // --------------------------------------------
  // (B) ถ้าค่าอยู่ระหว่าง 0–24 = เป็นค่า Karat โดยตรง
  // --------------------------------------------
  if (v > 0 && v <= 24) {
    return `${Math.round(v)}k`;
  }

  // --------------------------------------------
  // (C) ถ้าค่าอยู่ระหว่าง 25–999 = per-mille → แปลงเป็น Karat
  //    เช่น 750 → 18k, 916 → 22k, 999 → 24k
  // --------------------------------------------
  const perMille = Math.round(v);
  const karat = Math.round((perMille / 1000) * 24);
  const safeKarat = Math.max(1, Math.min(24, karat));

  return `${safeKarat}k`;
}

/**
 * แปลงวันที่จาก ISO string:
 * - TH  → 24 ชั่วโมง (เช่น 01/11/2568, 14:30)
 * - EN  → 12 ชั่วโมง (เช่น 11/01/2025, 02:30 PM)
 * ใช้เวลาโซนกรุงเทพฯให้สอดคล้องกับธุรกิจในไทย
 */
export function formatDate(isoString?: string, lang: string = "en") {
  if (!isoString) return "-";
  const d = new Date(isoString);

  const isThai = lang?.startsWith("th");

  // TH: ใช้ 24 ชั่วโมง (hour12=false) + hourCycle h23
  // EN: ใช้ 12 ชั่วโมง (hour12=true)
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: !isThai,
    ...(isThai ? { hourCycle: "h23" as const } : {}),
  };

  // หมายเหตุ:
  // - 'th-TH' จะได้ปีพุทธศักราชอัตโนมัติ (เช่น 2568) ตามที่เห็นในภาพ
  // - ถ้าอยากให้ปีคริสต์ศักราชในภาษาไทย ให้ใช้ 'th-TH-u-ca-gregory'
  const locale = isThai ? "th-TH" : "en-US";

  return new Intl.DateTimeFormat(locale, options).format(d);
}

// ฟังก์ชันแปลง timestamp -> DD/MM/YYYY (พ.ศ.)
export function formatThaiDate(isoString: string) {
  const date = new Date(isoString);

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");

  // +543 เพื่อแปลง ค.ศ. → พ.ศ.
  const year = (date.getFullYear() + 543).toString();

  return `${day}/${month}/${year}`;
};

// ฟังก์ชันแปลง timestamp -> DD/MM/YYYY (ค.ศ.)
export function formatThaiDateExceptYear(isoString: string) {
  const date = new Date(isoString);

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString();

  return `${day}/${month}/${year}`;
};

/**
 * จัดรูปแบบตัวเลข ใส่ลูกน้ำ (Comma) และทศนิยม
 * @param num ตัวเลขที่ต้องการจัดรูปแบบ (number หรือ string)
 * @param decimals จำนวนตำแหน่งทศนิยม (default = 3)
 */
export function formatNumber(num: number | string | null | undefined, decimals: number = 3): string {
  if (num === null || num === undefined || num === "") return "0";

  const n = Number(num);
  if (isNaN(n)) return "0";

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}