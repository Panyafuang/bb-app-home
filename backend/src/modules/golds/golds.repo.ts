/** Raw SQL */
import debugFactory from "debug";
import { PoolClient } from "pg";

import { pool } from "../../db/pool";
import {
  CreateGoldDto,
  GoldRecord,
  Ledger,
  UpdateGoldDto,
} from "../../types/golds";

const log = debugFactory("app:repo:golds");
const GOLD_RECORD = `gold_record`;

export type RepoFindParams = {
  // พารามิเตอร์สำหรับค้นหาและกรอง
  from?: Date | null; // กรอกตามวันที่เริ่มต้น
  to?: Date | null; // กรอกตามวันที่สิ้นสุด
  reference_number?: string | null; // ค้นหาตามเลขอ้างอิง (แบบ fuzzy)
  ledger?: Ledger; // กรองตามสมุดบัญชี
  counterpart?: string | null; // คู่ค้า/ลูกค้า Supplier or Customer
  fineness?: number | null; // Gold Karat or Material (ความบริสุทธิ์ของทอง 24k)
  shipping_agent?: string | null; // เช่น Fedex, RK International ฯลฯ
  status?: string | null; // เช่น "Purchased", "Invoiced", "Returned"

  // กรองตามปริมาณทองคำ
  gold_out_min?: number | null; // ปริมาณทองออกขั้นต่ำ
  gold_out_max?: number | null; // ปริมาณทองออกสูงสุด
  net_gold_min?: number | null; // ปริมาณทองสุทธิขั้นต่ำ
  net_gold_max?: number | null; // ปริมาณทองสุทธิสูงสุด

  calculated_loss?: number | null; // น้ำหนักทองที่สูญเสียระหว่างการผลิต

  // พารามิเตอร์สำหรับการแบ่งหน้าและเรียงลำดับ
  limit?: number; // จำนวนรายการต่อหน้า
  offset?: number; // ข้ามกี่รายการ
  sort?: "timestamp_tz:asc" | "timestamp_tz:desc"; // การเรียงลำดับตามเวลา
};

/** สร้าง WHERE แบบ dynamic ตาม params ที่ส่งมา */
function buildWhere(params: RepoFindParams) {
  // สร้างเงื่อนไข WHERE สำหรับ SQL query แบบไดนามิก
  const where: string[] = []; // เก็บเงื่อนไข WHERE
  const values: any[] = []; // เก็บค่าที่จะใช้ prepared statement
  let i = 1; // ตัวนับสำหรับ parameter index

  // ตรวจสอบและสร้างเงื่อนไขสำหรับแต่ละพารามิเตอร์
  if (params.from) {
    where.push(`timestamp_tz >= $${i}`);
    values.push(params.from);
    i++;
  }
  if (params.to) {
    where.push(`timestamp_tz <= $${i}`);
    values.push(params.to);
    i++;
  }

  /**
   * ค้นหาแบบ ILIKE
   */
  // เงื่อนไขสำหรับ reference_number
  if (params.reference_number) {
    where.push(`reference_number ILIKE '%' || $${i} || '%'`);
    values.push(params.reference_number);
    i++;
  }
  // เงื่อนไขสำหรับ Counterpart
  if (params.counterpart) {
    where.push(`counterpart ILIKE '%' || $${i} || '%'`);
    values.push(params.counterpart);
    i++;
  }
  // งื่อนไขสำหรับ status
  if (params.status) {
    where.push(`status ILIKE '%' || $${i++} || '%'`);
    values.push(params.status);
  }

  /**
   * ค้นหาแบบ =
   */
  // เงื่อนไขสำหรับ ledger
  if (params.ledger) {
    where.push(`ledger = $${i}`);
    values.push(params.ledger);
    i++;
  }
  if (params.fineness) {
    where.push(`fineness = $${i++}`);
    values.push(params.fineness);
  }
  if (params.shipping_agent) {
    where.push(`shipping_agent = $${i++}`);
    values.push(params.shipping_agent);
  }

  // เงื่อนไขสำหรับปริมาณทอง
  if (params.gold_out_min != null) {
    where.push(`gold_out_grams >= $${i}`);
    values.push(params.gold_out_min);
    i++;
  }
  if (params.gold_out_max != null) {
    where.push(`gold_out_grams <= $${i}`);
    values.push(params.gold_out_max);
    i++;
  }
  if (params.net_gold_min != null) {
    where.push(`net_gold_grams >= $${i}`);
    values.push(params.net_gold_min);
    i++;
  }
  if (params.net_gold_max != null) {
    where.push(`net_gold_grams <= $${i}`);
    values.push(params.net_gold_max);
    i++;
  }

  if (params.calculated_loss != null) {
    where.push(`calculated_loss = $${i}`);
    values.push(params.calculated_loss);
    i++;
  }

  // สร้าง WHERE clause
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { clause, values, nextIndex: i };
}

export async function queryGolds(
  p: RepoFindParams
): Promise<{ items: GoldRecord[]; total: number }> {
  log("queryGolds params=%o", p);

  // สร้าง WHERE clause และค่า parameters
  const { clause, values, nextIndex } = buildWhere(p);

  // กำหนดการเรียงลำดับ
  // const orderBy = p.sort === "timestamp_tz:asc" ? `ORDER BY timestamp_tz ASC, id ASC` : `ORDER BY timestamp_tz DESC, id DESC`;
  const orderBy = `ORDER BY updated_at DESC`;

  // สร้าง SQL query สำหรับดึงข้อมูล
  const listSql = `
  SELECT *
    FROM ${GOLD_RECORD}
    ${clause}
    ${orderBy}
    LIMIT $${nextIndex} OFFSET $${nextIndex + 1};
  `;
  const listValues = [...values, p.limit ?? 50, p.offset ?? 0];

  // สร้าง SQL query สำหรับนับจำนวนรายการทั้งหมด
  const countSql = `SELECT COUNT(*)::bigint AS total FROM ${GOLD_RECORD} ${clause};`;

  // ทำ query พร้อมกันทั้งสองอัน
  const [listRes, countRes] = await Promise.all([
    pool.query<GoldRecord>(listSql, listValues),
    pool.query<{ total: string }>(countSql, values),
  ]);
  log("listSql ", listSql);

  const items = listRes.rows;
  const total = Number(countRes.rows[0]?.total ?? 0);
  log("queryGolds result items=%d total=%d", items.length, total);
  return { items, total };
}

export async function findGoldsById(id: string): Promise<GoldRecord | null> {
  log("findGoldsById %s", id);
  const { rows } = await pool.query(
    `SELECT *
       FROM gold_record
      WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function insertGold(
  c: PoolClient,
  dto: CreateGoldDto
): Promise<GoldRecord> {
  log(`insertGold %o`, dto);

  const {
    timestamp_tz,
    reference_number,
    ledger = null,
    gold_in_grams,
    gold_out_grams = 0,
    related_reference_number,
    calculated_loss = null,
    counterpart,
    fineness,
    good_details,
    status,
    shipping_agent,
    remarks = null,
  } = dto;

  const query = `
    INSERT INTO gold_record (
      timestamp_tz, 
      reference_number, 
      ledger, 
      gold_in_grams, 
      gold_out_grams, 
      remarks, 
      calculated_loss, 
      related_reference_number, 
      counterpart, 
      fineness, 
      good_details, 
      status, 
      shipping_agent
    )
    VALUES (
      COALESCE($1::timestamptz, NOW()), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
    )
    RETURNING *;
  `;

  log(`Inserting new gold_record with reference_number=%s${reference_number}`);
  log("Payload: %O", dto);
  log(`SQL Query: %s${query}`);

  const { rows } = await c.query(query, [
    timestamp_tz, // $1
    reference_number, // $2
    ledger, // $3
    gold_in_grams, // $4
    gold_out_grams, // $5
    remarks, // $6
    calculated_loss, // $7 (เป็น "กรัม")
    related_reference_number, // $8
    counterpart, // $9
    fineness, // $10
    good_details, // $11
    status, // $12
    shipping_agent, // $13
  ]);

  log("Inserted result id=%s", rows[0]?.id);
  return rows[0];
}

export async function updateGold(
  c: PoolClient,
  id: string,
  dto: UpdateGoldDto
): Promise<GoldRecord | null> {
  log(`updateGold id=%s dto=%o`, id, dto);

  // 1. preparing field for update
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1; // $1, $2, $3 ... (index counter)

  // 2. helper pushing func
  const pushFnHelper = (col: string, value: any) => {
    fields.push(`${col} = $${idx++}`);
    values.push(value);
  };

  // 3. ตรวจว่า field ไหนถูกส่งมา → เพิ่มเฉพาะอันนั้น
  if (dto.timestamp_tz !== undefined)
    pushFnHelper("timestamp_tz", dto.timestamp_tz);
  if (dto.reference_number !== undefined)
    pushFnHelper("reference_number", dto.reference_number);
  if (dto.gold_in_grams !== undefined)
    pushFnHelper("gold_in_grams", dto.gold_in_grams);
  if (dto.gold_out_grams !== undefined)
    pushFnHelper("gold_out_grams", dto.gold_out_grams);
  if (dto.calculated_loss !== undefined)
    pushFnHelper("calculated_loss", dto.calculated_loss);
  if (dto.remarks !== undefined) pushFnHelper("remarks", dto.remarks);
  if (dto.ledger !== undefined) pushFnHelper("ledger", dto.ledger);

  if (fields.length === 0) {
    // ไม่ส่งฟิลด์มาอัปเดต
    log(`updateGold: on fields provided to update (id=%s)${id}`);
    const record = await findGoldsById(id);
    return record;
  }

  const query = `UPDATE ${GOLD_RECORD} SET ${fields.join(
    ", "
  )} WHERE id = $${idx} RETURNING *`;

  values.push(id);

  log(`Updating gold_record with reference_number=%s${dto.reference_number}`);
  log("Payload: %O", dto);
  log(`SQL Query: %s${query}`);
  const { rows } = await c.query(query, values);
  const result = rows[0] ?? null;

  if (result) {
    log("updateGold success id=%s updatedFields=%o", id, Object.keys(dto));
  } else {
    log("updateGold on record found id=%s", id);
  }

  return result;
}

export async function deleteGold(c: PoolClient, id: string): Promise<boolean> {
  log(`deleteGold %s${id}`);

  const query = `DELETE FROM ${GOLD_RECORD} WHERE id = $1`;
  log(`Deleting gold_record with id=%s${id}`);
  log(`SQL Query: %s${query}`);

  const { rowCount } = await c.query(query, [id]);
  const success = (rowCount ?? 0) > 0;

  if (success) {
    log("deleteGold success id=%s (rowCount=%d)", id, rowCount);
  } else {
    log("deleteGold failed id=%s (not found)", id);
  }
  return success;
}

/**
 * (เพิ่มฟังก์ชันนี้)
 * ตรวจสอบว่า reference_number นี้มีอยู่ในฐานข้อมูลหรือไม่
 * @param reference - เลขอ้างอิงที่ต้องการตรวจสอบ
 * @returns true ถ้า "มีอยู่แล้ว" (ซ้ำ), false ถ้า "ยังไม่มี"
 */
export async function checkReferenceExists(reference: string): Promise<boolean> {
  log("checkReferenceExists reference=%s", reference);

  if (!reference || reference.trim() === "") return false;
  const normalized = reference.trim();

  const res = await pool.query(
    `SELECT 1 FROM gold_record WHERE LOWER(reference_number) = LOWER($1) LIMIT 1`,
    [normalized]
  );
  // rowCount can be null in some typings/environments; coalesce to 0 before comparison
  return (res.rowCount ?? 0) > 0;
}
