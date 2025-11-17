/**
 * features/golds/types.ts
 * (เวอร์ชันอัปเดต V4 - Schema 17 คอลัมน์ + Logic V2)
 */

// --- 1. Constants (ค่าคงที่สำหรับ Dropdowns) ---

// (Ledger List 6 ค่า)
export const LEDGERS = [
  "Beauty Bijoux",
  "Green Gold",
  "Palladium",
  "Platinum",
  "PV Accessories",
  "PV Fine Gold",
] as const;

export const COUNTERPART_LIST = [
  "Nakagawa",
  "Qnet",
  "Paspaley",
  "Poh Heng",
  "Germany",
  "BB stock",
  "Aspial",
  "Umicore",
  "Others",
] as const;

export const SHIPPING_AGENT_LIST = [
  "FedEx",
  "DHL",
  "RK International",
  "Ferrari",
  "Brinks",
  "Kerry Express",
  "Flash Express",
  "Thailand Post",
  "Others",
] as const;

// (Dropdowns แบบ Dynamic)
export const STATUS_OPTIONS_IN = ["Purchased", "Received"] as const;
export const STATUS_OPTIONS_OUT = ["Invoiced", "Returned"] as const;

// (Fineness Mapping)
export const FINENESS_MAP_GOLD = [
  { label: "8K", value: 333 },
  { label: "9K", value: 375 },
  { label: "10K", value: 417 },
  { label: "18K", value: 750 },
  { label: "22K", value: 916 },
  { label: "23K", value: 958 },
  { label: "24K", value: 999.9 },
];
export const FINENESS_MAP_PALLADIUM = [
  { label: "14%", value: 140 },
  { label: "95%", value: 950 },
];
export const FINENESS_MAP_PLATINUM = [
  { label: "14%", value: 140 },
  { label: "95%", value: 950 },
];

// --- 2. Type Definitions (ประเภทข้อมูล) ---

// (Type ที่ดึงมาจาก Constants)
export type Ledger = (typeof LEDGERS)[number];
export type Counterpart = (typeof COUNTERPART_LIST)[number];
export type ShippingAgent = (typeof SHIPPING_AGENT_LIST)[number];

// (Meta สำหรับ Pagination - เหมือนเดิม)
export interface Meta {
  page?: number;
  limit?: number;
  total?: number;
}

// ✅ (อัปเดต) GoldRecord (17 คอลัมน์หลัก + 1 คำนวณ)
export interface GoldRecord {
  id: string;
  timestamp_tz: string; // (รับเป็น string)
  reference_number: string;
  related_reference_number: string | null;
  gold_in_grams: number;
  gold_out_grams: number;
  net_gold_grams: number; // (Backend คำนวณให้)
  calculated_loss: number | null; // (Decimal 0-1)
  ledger: Ledger; // (Required)
  remarks: string | null;
  created_at: string;
  updated_at: string;

  // (ฟิลด์ใหม่ที่เพิ่มเข้ามา)
  counterpart: string | null;
  fineness: number | null; // 👈 (เป็น number)
  good_details: string | null;
  status: string | null;
  shipping_agent: string | null;
}

// ✅ (อัปเดต) CreateGoldDTO (13 ฟิลด์)
export interface CreateGoldDTO {
  timestamp_tz: string; // (ส่งเป็น ISO String)
  reference_number: string;
  ledger: Ledger; // (Required)
  gold_in_grams: number;
  gold_out_grams: number;

  related_reference_number?: string | null;
  calculated_loss?: number | null; // (Decimal 0-1)
  counterpart?: Counterpart | null;
  fineness?: number | null; // 👈 (เป็น number)
  good_details?: string | null;
  status?: string | null;
  shipping_agent?: ShippingAgent | null;
  remarks?: string | null;
}

export interface UpdateGoldDTO extends Partial<CreateGoldDTO> {}

export type Sort = "timestamp_tz:asc" | "timestamp_tz:desc";

// ✅ (อัปเดต) ListParams (สำหรับ Search Bar)
export interface ListParams {
  page?: number;
  limit?: number;
  offset?: number;
  from?: string; // (YYYY-MM-DD)
  to?: string; // (YYYY-MM-DD)

  // (Key ที่ตรงกับ Backend RawSearchParams)
  refSearch?: string;
  relatedRefSearch?: string;
  ledger?: Ledger | ""; // (ใช้ string ว่างสำหรับ 'All')
  fineness?: string | ""; // (ส่ง "333", "0", "" ฯลฯ)
  counterpartSearch?: string; // (Search Bar ยังเป็น Input)
  statusSearch?: string; // (Search Bar ยังเป็น Input)
  shipping_agent?: ShippingAgent | "";

  sort?: Sort;
  calculated_loss?: number | null;
  // ❌ (ลบ) category, gold_out_min/max, ฯลฯ
}

// --- 3. Wrapper Types (เหมือนเดิม) ---

export interface Paged<T> {
  items: T[];
  total?: number;
  page?: number;
  limit?: number;
}

/** สำหรับ endpoint ที่ส่งรายการแบบมี meta */
export interface ApiListResponse<T> {
  status: string;
  data: {
    items: T[];
    meta?: Meta;
  };
}

export interface ApiResponse {
  status: string;
  data?: GoldRecord;
  code?: string;
  message?: string;
  details?: { field: string; message: string }[];
}
