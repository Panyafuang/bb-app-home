export type Category =
  | "Beauty Bijoux"
  | "PV fine"
  | "PV green"
  | "PV Accessories";

export type GoldRecord = {
  id: string;                     // Primary key ของแต่ละรายการทองคำ
  timestamp_tz: string;           // เวลาที่บันทึกการทำรายการทอง
  reference_number: string;       // หมายเลขอ้างอิงเอกสาร เช่น ใบรับทอง, ใบส่งผลิต
  details: string | null;         // รายละเอียดเพิ่มเติมเกี่ยวกับรายการทอง
  gold_in_grams: string;          // pg numeric => string น้ำหนักทองที่รับเข้า (หน่วย: กรัม)
  gold_out_grams: string | null;  // น้ำหนักทองที่จ่ายออก (หน่วย: กรัม)
  net_gold_grams: string;         // auto generated (gold_in_grams - gold_out_grams) ปริมาณทองคงเหลือสุทธิในแต่ละรายการ
  calculated_loss: string | null; // น้ำหนักทองที่สูญเสียระหว่างการผลิต
  remarks: string | null;         // หมายเหตุ เช่น เหตุผลการรับ/จ่ายทอง
  category: Category;             // หมวดหมู่สินค้า เช่น Beauty Bijoux, PV fine, PV green, PV Accessories
  ledger: string | null;          // หมวดบัญชีทอง เช่น Green Gold, Platinum, PV Fine Gold
  created_at: string | null;      // วันที่สร้างข้อมูล
  updated_at: string | null;      // วันที่แก้ไขข้อมูลล่าสุด (อัปเดตอัตโนมัติผ่าน Trigger)
};

export type CreateGoldDto = {
  timestamp_tz?: string;          // optional, default now
  reference_number: string;
  details?: string | null;
  gold_in_grams: number;
  gold_out_grams?: number | null;
  calculated_loss?: number | null;
  remarks?: string | null;
  category: Category;
  ledger?: string | null;
};

export type UpdateGoldDto = Partial<CreateGoldDto>;