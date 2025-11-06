/** business logic / transaction */

import debugFactory from "debug";

import * as goldsRepo from "../modules/golds/golds.repo";
import { CreateGoldDto, GoldRecord, UpdateGoldDto } from "../types/golds";
import { withTx } from "../db/tx";
import { AppError } from "../common/app-error";

const log = debugFactory("app:service:golds");

// helpers
const parseDate = (v: any): Date | null => {
  if (v == null) return null;
  const d = v instanceof Date ? v : new Date(String(v));
  return isNaN(d.getTime()) ? null : d;
};
const parseNumber = (v: any): number | null => {
  if (v == null) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

// Type สำหรับ raw input จาก controller
type RawSearchParams = {
  page?: any;
  limit?: any;
  offset?: any;
  from?: any;
  to?: any;
  reference_number?: any;
  category?: any;
  ledger?: any;
  gold_out_min?: any;
  gold_out_max?: any;
  net_gold_min?: any;
  net_gold_max?: any;
  sort?: any;
};

export async function searchGolds(rawParams: RawSearchParams): Promise<{ items: GoldRecord[]; total: number; page?: number; limit?: number; }> {
  log("searchGolds page=%d limit=%d", rawParams.page, rawParams.limit);

  // Parse และ normalize ค่าทั้งหมด
  const page = Math.max(parseNumber(rawParams.page) ?? 1, 1);
  const limit = Math.max(parseNumber(rawParams.limit) ?? 50, 100);
  const offset = parseNumber(rawParams.offset) ?? (page - 1) * limit;

  // Parse filters
  const params = {
    from: parseDate(rawParams.from),
    to: parseDate(rawParams.to),
    reference_number: rawParams.reference_number?.toString() ?? null,
    category: rawParams.category?.toString() ?? null,
    ledger: rawParams.ledger?.toString() ?? null,
    gold_out_min: parseNumber(rawParams.gold_out_min),
    gold_out_max: parseNumber(rawParams.gold_out_max),
    net_gold_min: parseNumber(rawParams.net_gold_min),
    net_gold_max: parseNumber(rawParams.net_gold_max),
    sort: (rawParams.sort?.toString() ?? "timestamp_tz:desc") as
      | "timestamp_tz:asc"
      | "timestamp_tz:desc",
    limit,
    offset,
  };

  // Business validations → คืน error แบบ client (400) เมื่อ rule ผิด
  if (params.from && params.to && params.from > params.to) {
    throw AppError.invalidInput([
      { field: "from, to", message: "from must be <= to" },
    ]);
  }
  if (
    params.net_gold_min != null &&
    params.net_gold_max &&
    params.net_gold_min > params.net_gold_max
  ) {
    throw AppError.invalidInput([
      { field: "gold_out", message: "gold_out_min must be <= gold_out_max" },
    ]);
  }
  if (
    params.net_gold_min != null &&
    params.net_gold_max != null &&
    params.net_gold_min > params.net_gold_max
  ) {
    throw AppError.invalidInput([
      { field: "net_gold", message: "net_gold_min must be <= net_gold_max" },
    ]);
  }

  // ส่งค่าที่ผ่านการ validate แล้วไป repo
  const { items, total } = await goldsRepo.queryGolds(params);

  log("searchGolds result items=%d total=%d", items.length, total);
  return { items, total, page, limit };
}

export function getGoldById(id: string): Promise<GoldRecord | null> {
  log(`getGoldById ${id}`);

  return goldsRepo.findGoldsById(id);
}

export async function addGold(dto: CreateGoldDto): Promise<GoldRecord> {
  log("addGold reference_number=%s", dto.reference_number);

  // เรียกฟังก์ชัน transaction wrapper
  const result = await withTx(async (client) => {
    // เรียก repo (data access layer)
    const gold = await goldsRepo.insertGold(client, dto);
    // อาจจะมี logic เพิ่ม เช่น log, audit, trigger อื่น
    return gold; // ส่งข้อมูลกลับไป controller
  });
  log("Transaction complete for reference_number=%s", dto.reference_number);
  return result;
}

export async function updateGold(
  id: string,
  dto: UpdateGoldDto
): Promise<GoldRecord | null> {
  log("updateGold reference_number=%s", dto.reference_number);

  const result = await withTx(async (client) => {
    return await goldsRepo.updateGold(client, id, dto);
  });
  log("Transaction complete for reference_number=%s", dto.reference_number);
  return result;
}

export async function removeGold(id: string): Promise<boolean> {
  log("removeGold id=%s", id);

  const success = await withTx(async (client) => {
    return await goldsRepo.deleteGold(client, id);
  });
  log("Transaction complete for id=%s", id);
  return success;
}
