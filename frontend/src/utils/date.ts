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

