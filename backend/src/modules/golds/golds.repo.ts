/** Raw SQL */
import debugFactory from "debug";
import { PoolClient } from "pg";

import { pool } from "../../db/pool";
import { Category, CreateGoldDto, GoldRecord, UpdateGoldDto } from "../../types/golds";

const log = debugFactory("app:repo:golds");
const GOLD_RECORD = `gold_record`;



export type RepoFindParams = {
  // พารามิเตอร์สำหรับค้นหาและกรอง
  from?: Date | null;                 // กรอกตามวันที่เริ่มต้น
  to?: Date | null;                   // กรอกตามวันที่สิ้นสุด
  reference_number?: string | null;   // ค้นหาตามเลขอ้างอิง (แบบ fuzzy)
  category?: Category | string | null; // กรองตามหมวดหมู่
  ledger?: string | null;              // กรองตามสมุดบัญชี

  // กรองตามปริมาณทองคำ
  gold_out_min?: number | null; // ปริมาณทองออกขั้นต่ำ
  gold_out_max?: number | null; // ปริมาณทองออกสูงสุด
  net_gold_min?: number | null; // ปริมาณทองสุทธิขั้นต่ำ
  net_gold_max?: number | null; // ปริมาณทองสุทธิสูงสุด

  // พารามิเตอร์สำหรับการแบ่งหน้าและเรียงลำดับ
  limit?: number; // จำนวนรายการต่อหน้า
  offset?: number; // ข้ามกี่รายการ
  sort?: "timestamp_tz:asc" | "timestamp_tz:desc"; // การเรียงลำดับตามเวลา
}

/** สร้าง WHERE แบบ dynamic ตาม params ที่ส่งมา */
function buildWhere(params: RepoFindParams) {
  // สร้างเงื่อนไข WHERE สำหรับ SQL query แบบไดนามิก
  const where: string[] = [];   // เก็บเงื่อนไข WHERE
  const values: any[] = [];     // เก็บค่าที่จะใช้ prepared statement
  let i = 1;                    // ตัวนับสำหรับ parameter index

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

  // การค้นหาแบบ ILIKE สำหรับ reference_number
  if (params.reference_number) {
    where.push(`reference_number ILIKE '%' || $${i} || '%'`);
    values.push(params.reference_number);
    i++;
  }

  // เงื่อนไขสำหรับ category และ ledger
  if (params.category) {
    where.push(`category = $${i}`);
    values.push(params.category);
    i++;
  }
  if (params.ledger) {
    where.push(`ledger = $${i}`);
    values.push(params.ledger);
    i++;
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

  // สร้าง WHERE clause
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { clause, values, nextIndex: i };
}



export async function queryGolds(p: RepoFindParams): Promise<{ items: GoldRecord[]; total: number }> {
  log("queryGolds params=%o", p);

  // สร้าง WHERE clause และค่า parameters
  const { clause, values, nextIndex } = buildWhere(p);

  // กำหนดการเรียงลำดับ
  const orderBy = p.sort === "timestamp_tz:asc" ? `ORDER BY timestamp_tz ASC, id ASC` : `ORDER BY timestamp_tz DESC, id DESC`;

  // สร้าง SQL query สำหรับดึงข้อมูล
  const listSql = `
  SELECT id, timestamp_tz, reference_number, details,
           gold_in_grams, gold_out_grams, net_gold_grams,
           calculated_loss, remarks, category, ledger,
           created_at, updated_at
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
    pool.query<{ total: string}>(countSql, values),
  ]);

  const items = listRes.rows;
  const total = Number(countRes.rows[0]?.total ?? 0);
  log("queryGolds result items=%d total=%d", items.length, total);
  return { items, total };
}

export async function findGoldsById(id: string): Promise<GoldRecord | null> {
  log("findGoldsById %s", id);
  const { rows } = await pool.query(
    `SELECT id, timestamp_tz, reference_number, details,
            gold_in_grams, gold_out_grams, net_gold_grams,
            calculated_loss, remarks, category, ledger,
            created_at, updated_at
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
    details,
    gold_in_grams,
    gold_out_grams = 0,
    calculated_loss = null,
    remarks = null,
    category,
    ledger = null,
  } = dto;

  const query = `
    INSERT INTO gold_record (
      timestamp_tz, reference_number, details, gold_in_grams, gold_out_grams, calculated_loss, remarks, category, ledger
    )
    VALUES (
      COALESCE($1::timestamptz, NOW()),
      $2,$3,$4,$5,$6,$7,$8,$9
    )
    RETURNING *;
  `;

  log(`Inserting new gold_record with reference_number=%s${reference_number}`);
  log("Payload: %O", dto);
  log(`SQL Query: %s${query}`);

  const { rows } = await c.query(query, [
    timestamp_tz,
    reference_number,
    details,
    gold_in_grams,
    gold_out_grams,
    calculated_loss,
    remarks,
    category,
    ledger,
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
  if (dto.details !== undefined) pushFnHelper("details", dto.details);
  if (dto.gold_in_grams !== undefined)
    pushFnHelper("gold_in_grams", dto.gold_in_grams);
  if (dto.gold_out_grams !== undefined)
    pushFnHelper("gold_out_grams", dto.gold_out_grams);
  if (dto.calculated_loss !== undefined)
    pushFnHelper("calculated_loss", dto.calculated_loss);
  if (dto.remarks !== undefined) pushFnHelper("remarks", dto.remarks);
  if (dto.category !== undefined) pushFnHelper("category", dto.category);
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

export async function deleteGold(
  c: PoolClient,
  id: string
): Promise<boolean> {
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
