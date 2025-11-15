export type Ledger =
  | "Beauty Bijoux"
  | "Green Gold"
  | "Palladium"
  | "Platinum"
  | "PV Accessories"
  | "PV Fine Gold";

export const LEDGER_LIST = [
  "Beauty Bijoux",
  "Green Gold",
  "Palladium",
  "Platinum",
  "PV Accessories",
  "PV Fine Gold",
] as const;

// (กลุ่ม Gold)
export const FINENESS_GOLD_NUMERIC = [333, 375, 585, 750, 950, 999];
// (กลุ่ม Palladium)
export const FINENESS_PALLADIUM_NUMERIC = [140, 950];
// (กลุ่ม Platinum)
export const FINENESS_PLATINUM_NUMERIC = [140, 950];
// (รวม Unique Values ทั้งหมดสำหรับ Validator)
export const ALL_FINENESS_VALUES_NUMERIC = [
  ...new Set([
    ...FINENESS_GOLD_NUMERIC,
    ...FINENESS_PALLADIUM_NUMERIC,
    ...FINENESS_PLATINUM_NUMERIC,
  ]),
];

export type LedgerEnum = (typeof LEDGER_LIST)[number];

// GoldRecord Interface
export interface GoldRecord {
  id: string; // Primary key ของแต่ละรายการทองคำ
  timestamp_tz: string; // เวลาที่บันทึกการทำรายการทอง
  reference_number: string; // หมายเลขอ้างอิงเอกสาร เช่น ใบรับทอง, ใบส่งผลิต
  related_reference_number: string | null; // หมายเลขอ้างอิงของเอกสาร/ธุรกรรมที่เกี่ยวข้อง
  gold_in_grams: number; // น้ำหนักทองที่รับเข้า (หน่วย: กรัม)
  gold_out_grams: number; // น้ำหนักทองที่จ่ายออก (หน่วย: กรัม)
  net_gold_grams?: number; // คำนวณอัตโนมัติ (gold_in_grams - gold_out_grams) ปริมาณทองคงเหลือสุทธิในแต่ละรายการ
  calculated_loss: number | null; // น้ำหนักทองที่สูญเสียระหว่างการผลิต
  ledger: Ledger; // (ใช้ Enum ใหม่)
  counterpart: string | null; // คู่ค้า/ลูกค้า/คู่ธุรกรรม
  fineness: number | null; // ความบริสุทธิ์ของทอง (0.999 = 24k, 0.750 = 18k ฯลฯ)
  good_details: string | null; // รายละเอียดสินค้า เช่น "chain, sample, casting"
  status: string | null; // เช่น "Purchased", "Invoiced", "Returned"
  shipping_agent: string | null; // ผู้ให้บริการขนส่ง/โลจิสติกส์
  remarks: string | null; // หมายเหตุ เช่น เหตุผลการรับ/จ่ายทอง
  created_at: string; // วันที่สร้างข้อมูล
  updated_at: string; // วันที่แก้ไขข้อมูลล่าสุด (อัปเดตอัตโนมัติผ่าน Trigger)
}

// DTO สำหรับการสร้าง (อิงตามฟอร์ม Input ใหม่)
export interface CreateGoldDto {
  timestamp_tz: string; // จากฟอร์ม Date (optional, default now)
  reference_number: string; // จากฟอร์ม Ref Number
  ledger: Ledger; // จากฟอร์ม Ledger
  gold_in_grams: number;
  gold_out_grams: number;

  // Fields Optional
  calculated_loss?: number | null; // (เป็น "กรัม" แต่ front-end กรอกเป็น % แปลงเป็นกรัมจาก front-end)
  fineness: number | null;
  counterpart: string | null;
  good_details: string | null;
  status: string | null;
  shipping_agent: string | null;
  remarks: string | null;
  related_reference_number: string | null;
}

// Interface สำหรับการค้นหา (รับค่าจาก Query Params)
export interface GoldRecordQuery {
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  refSearch?: string;
  ledger?: string; // ควรเป็น LedgerEnum แต่รับจาก query เป็น string
  counterpartSearch?: string;
  statusSearch?: string;
}

// DTO สำหรับการอัปเดต
export type UpdateGoldDto = Partial<CreateGoldDto>;

// Type สำหรับ raw input จาก controller
export type RawSearchParams = {
  page?: any;
  limit?: any;
  offset?: any;
  from?: any;
  to?: any;
  reference_number?: any;
  related_reference_number?: any;
  ledger?: any;
  gold_out_min?: any;
  gold_out_max?: any;
  net_gold_min?: any;
  net_gold_max?: any;
  calculated_loss?: any;
  sort?: any;
  counterpart?: any;
  status?: any;
  shipping_agent?: any;
  fineness?: any;
};
