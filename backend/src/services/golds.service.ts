/** business logic / transaction */

import debugFactory from "debug";

import * as goldsRepo from "../modules/golds/golds.repo";
import { CreateGoldDto, GoldRecord, RawSearchParams, UpdateGoldDto } from "../types/golds";
import { withTx } from "../db/tx";
import { AppError } from "../common/app-error";
import { pool } from "../db/pool";
import { PoolClient } from "pg";

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


export async function searchGolds(rawParams: RawSearchParams): Promise<{ items: GoldRecord[]; total: number; page?: number; limit?: number; }> {
  log("searchGolds page=%d limit=%d", rawParams.page, rawParams.limit);

  // Parse และ normalize ค่าทั้งหมด
  const page = Math.max(parseNumber(rawParams.page) ?? 1, 1);
  const rawLimit = Number(rawParams.limit);
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(rawLimit, 1), 50) // 1..50
    : 50;                                 // default
  const offset = parseNumber(rawParams.offset) ?? (page - 1) * limit;

  // --- 💡 1. (แก้ไข) แยกการ Parse วันที่ออกมา ---
  const from = parseDate(rawParams.from);
  const toRaw = parseDate(rawParams.to);

  // --- 💡 2. (แก้ไข) ตั้งเวลา "to" ให้เป็น 23:59:59 ---
  let to = null;
  if (toRaw) {
    to = toRaw;
    // ตั้งค่าเวลาให้เป็น 23:59:59.999 (เวลาสุดท้ายของวัน)
    to.setHours(23, 59, 59, 999);
  }

  // Parse filters
  const params = {
    from: from, // (ใช้ตัวแปรที่ Parse แล้ว)
    to: to,     // (ใช้ตัวแปรที่ Parse และแก้ไขเวลาแล้ว)
    reference_number: rawParams.reference_number?.toString() ?? null,
    ledger: rawParams.ledger?.toString() ?? null,
    gold_out_min: parseNumber(rawParams.gold_out_min),
    gold_out_max: parseNumber(rawParams.gold_out_max),
    net_gold_min: parseNumber(rawParams.net_gold_min),
    net_gold_max: parseNumber(rawParams.net_gold_max),
    counterpart: rawParams.counterpart,
    status: rawParams.status,
    related_reference_number: rawParams.related_reference_number,
    shipping_agent: rawParams.shipping_agent,
    fineness: rawParams.fineness,
    // (Frontend ควรแปลง "6%" เป็น 0.06 มาให้แล้ว)
    calculated_loss: parseNumber(rawParams.calculated_loss),
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

/**
 * (เพิ่มฟังก์ชันนี้)
 * ตรวจสอบว่า reference unique (ไม่ซ้ำ) หรือไม่
 * @param reference
 * @returns true ถ้า "ไม่ซ้ำ" (Unique), false ถ้า "ซ้ำ"
 */
export async function isReferenceUnique(reference: string): Promise<boolean> {
  log("isReferenceUnique reference=%s", reference);

  if (!reference) {
    throw AppError.invalidInput([
      { field: "reference", message: "Reference is required" },
    ]);
  }
  const exists = await goldsRepo.checkReferenceExists(reference);
  return !exists; // คืนค่า true ถ้า "ไม่ซ้ำ"
}

export async function getGoldsStream(client: PoolClient) {
  log("getGoldsStream");

  return goldsRepo.getGoldRecordsStream(client);
}