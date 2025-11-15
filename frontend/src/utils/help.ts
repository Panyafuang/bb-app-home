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
export function finenessToKarat(value: number | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "";

  const v = Number(value);
  /**
   * เคสที่ 1: รับเป็นตัวเลข K ตรง ๆ
   * - ถ้าค่าอยู่ระหว่าง 0–24 ให้ถือว่าเป็น “จำนวนกะรัต” เลย
   * - แล้วคืนเป็น string เช่น 18 → "18k"
   * - 18.2 → ปัดเป็น 18k
   */
  if (v > 0 && v <= 24) {
    return `${Math.round(v)}k`;
  }

  /**
   * เคสที่ 2: แปลงไปเป็น per‑mille
   *  - ถ้า v อยู่ระหว่าง 0–100 → ถือว่าเก็บมาเป็น “เปอร์เซ็นต์” เช่น หมายถึง 75% → แปลงเป็น per‑mille โดย 75 * 10 = 750
   */
  let perMille: number;
  if (v > 0 && v <= 100) {
    perMille = Math.round(v * 100); // ใช้ Math.round กันเศษทศนิยม
  } else {
    perMille = Math.round(v); // โดยปกติถ้าค่าอยู่ในช่วง 100..999 ถือเป็น per-mille เช่น 750
  }

  /**
   * เคสที่ 3: แปลง per‑mille → karat
   * - per‑mille คือ “ส่วนในพัน” เช่น = 750/1000 = 75%
   */
  const karat = Math.round((perMille / 1000) * 24);
  const safeKarat = Math.max(1, Math.min(24, karat)); // ค่าที่ออกมาจะอยู่ในช่วง 1–24 เสมอ แล้วค่อยแปลงเป็น string เช่น "18k"
  return `${safeKarat}k`;
}
