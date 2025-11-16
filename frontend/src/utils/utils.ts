/** (Helper) แปลงค่าตัวเลขอย่างปลอดภัย */
export function parseNumber(v: any): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

/** (Helper) ดึงค่าวันที่ปัจจุบันในรูปแบบ YYYY-MM-DD */
export function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * แปลงค่า fineness (รูปแบบต่าง ๆ ที่อาจเจอ) เป็น karat string เช่น "18k"
 * รองรับ:
 *  - per-mille เช่น 750 -> 18k
 *  - percent เช่น 75 -> 18k (ถ้าคุณเก็บเป็น %)
 *  - karat เป็นตัวเลขอยู่แล้ว เช่น 18 -> 18k
 */
// export function finenessToKarat(value: number | null): string {
//   if (value === null || value === undefined || Number.isNaN(value)) return "";

//   const v = Number(value);
//   /**
//    * เคสที่ 1: รับเป็นตัวเลข K ตรง ๆ
//    * - ถ้าค่าอยู่ระหว่าง 0–24 ให้ถือว่าเป็น “จำนวนกะรัต” เลย
//    * - แล้วคืนเป็น string เช่น 18 → "18k"
//    * - 18.2 → ปัดเป็น 18k
//    */
//   if (v > 0 && v <= 24) {
//     return `${Math.round(v)}k`;
//   }

//   /**
//    * เคสที่ 2: แปลงไปเป็น per‑mille
//    *  - ถ้า v อยู่ระหว่าง 0–100 → ถือว่าเก็บมาเป็น “เปอร์เซ็นต์” เช่น หมายถึง 75% → แปลงเป็น per‑mille โดย 75 * 10 = 750
//    */
//   let perMille: number;
//   if (v > 0 && v <= 100) {
//     perMille = Math.round(v * 100); // ใช้ Math.round กันเศษทศนิยม
//   } else {
//     perMille = Math.round(v); // โดยปกติถ้าค่าอยู่ในช่วง 100..999 ถือเป็น per-mille เช่น 750
//   }

//   /**
//    * เคสที่ 3: แปลง per‑mille → karat
//    * - per‑mille คือ “ส่วนในพัน” เช่น = 750/1000 = 75%
//    */
//   const karat = Math.round((perMille / 1000) * 24);
//   const safeKarat = Math.max(1, Math.min(24, karat)); // ค่าที่ออกมาจะอยู่ในช่วง 1–24 เสมอ แล้วค่อยแปลงเป็น string เช่น "18k"
//   return `${safeKarat}k`;
// }

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