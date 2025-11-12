/**
 * features/golds/types.ts
 * รวม type ที่เกี่ยวข้องกับ gold record และพารามิเตอร์ list
 * ช่วยให้โค้ดมี type safety และ autocomplete ที่ดีขึ้น
 */
export type Ledger =
  | "Beauty Bijoux"
  | "Green Gold"
  | "Palladium"
  | "Platinum"
  | "PV Accessories"
  | "PV Fine Gold";
export type Category =
  | "Beauty Bijoux"
  | "PV fine"
  | "PV green"
  | "PV Accessories";

export interface Meta {
  page?: number;
  limit?: number;
  total?: number;
}

export interface GoldRecord {
  id: string;
  timestamp_tz: string;
  reference_number: string;
  details: string | null;
  gold_in_grams: number;
  gold_out_grams: number;
  net_gold_grams: number;
  calculated_loss: number | null;
  ledger: Ledger | null;
  remarks: string | null;
  category: Category | null;
  created_at: string;
  updated_at: string;
}

export interface CreateGoldDTO {
  timestamp_tz: string;
  reference_number: string;
  details?: string | null;
  gold_in_grams: number;
  gold_out_grams?: number;
  calculated_loss?: number | null;
  ledger?: Ledger | null;
  remarks?: string | null;
  category: Category;
}
export interface UpdateGoldDTO extends Partial<CreateGoldDTO> {}

export type Sort = "timestamp_tz:asc" | "timestamp_tz:desc";

export interface ListParams {
  page?: number;
  limit?: number;
  offset?: number;
  from?: string;
  to?: string;
  reference_number?: string;
  category?: Category;
  ledger?: string;
  gold_out_min?: number;
  gold_out_max?: number;
  net_gold_min?: number;
  net_gold_max?: number;
  sort?: Sort;
  calculated_loss?: number | null;
}

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
