import { api } from "@/lib/axios";
import type {
  CreateGoldDTO,
  UpdateGoldDTO,
  ListParams,
  GoldRecord,
  ApiListResponse,
  ApiResponse,
} from "@/features/golds/types";

const BASE = "/api/v1/gold_records";


// --- Helper function
/** (Helper) แปลง Input "6" หรือ "6%" หรือ "0.06" ให้เป็น Decimal 0.06 */
function toDecimalFromPercentInput(str: string): number | null {
  if (!str) return null;
  const s = str.replace(/%/g, "").trim(); // ลบ %
  if (s === "") return null;
  const n = Number(s);
  if (Number.isNaN(n)) return null;

  // ถ้าผู้ใช้พิมพ์ค่ามากกว่า 1 (เช่น 6) ให้หาร 100
  // ถ้าผู้ใช้พิมพ์ค่าน้อยกว่า 1 (เช่น 0.06) ให้ใช้ค่านั้นเลย
  return n > 1 ? n / 100 : n;
}


// ช่วยสร้าง query string โดยตัดค่าว่าง/undefined ออก
function toQS(params: Record<string, any>) {
  const u = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    u.set(k, String(v));
  });
  const s = u.toString();
  return s ? `?${s}` : "";
}

/** ปรับให้ดึง items ที่อยู่ใน data.data.items */
export async function listGolds(params: ListParams = {}) {
  const processedParams = { ...params }; // คัดลอก params
  if (processedParams.calculated_loss) {
    // แปลง "6%" เป็น 0.06
    processedParams.calculated_loss = toDecimalFromPercentInput(
      String(processedParams.calculated_loss)
    );
  }

  const { data } = await api.get<ApiListResponse<GoldRecord>>(
    `${BASE}${toQS(processedParams)}`
  );

  // 🔍 ตรวจสอบว่าโครงสร้างมีชั้น data ซ้อน
  const items = data?.data?.items ?? [];
  const meta = data?.data?.meta ?? {};

  return {
    items,
    total: meta.total ?? items.length,
    page: meta.page,
    limit: meta.limit,
  };
}

export async function deleteGold(id: string) {
  const { data } = await api.delete<{ deleted: boolean }>(`${BASE}/${id}`);
  return data;
}

export async function createGold(payload: CreateGoldDTO) {
  const { data } = await api.post<GoldRecord>(BASE, payload);
  return data;
}

export async function getGold(id: string) {
  const { data } = await api.get<ApiResponse>(`${BASE}/${id}`);
  return data.data;
}

export async function updateGold(id: string, payload: UpdateGoldDTO) {
  const { data } = await api.put<GoldRecord>(`${BASE}/${id}`, payload);
  return data;
}

/**
 * (เพิ่มฟังก์ชันนี้)
 * ตรวจสอบว่า Reference ซ้ำหรือไม่
 * @returns true ถ้า "ไม่ซ้ำ" (Unique)
 */
export async function checkRefUnique(reference: string) {
  // สร้าง query string
  const params = { reference };

  // API จะคืน { data: { isUnique: boolean } }
  // (เราต้องแกะ .data สองชั้น ตามโครงสร้าง API ของคุณ)
  const { data } = await api.get<{ data: { isUnique: boolean } }>(
    `${BASE}/check-unique${toQS(params)}`
  );

  return data.data.isUnique; // คืนค่า true ถ้า "ไม่ซ้ำ"
}