import { api } from "@/lib/axios";
import type { CreateGoldDTO, UpdateGoldDTO, ListParams, GoldRecord, ApiListResponse } from "@/features/golds/types";


const BASE = "/api/v1/gold_records";

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
  const { data } = await api.get<ApiListResponse<GoldRecord>>(`${BASE}${toQS(params)}`);

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