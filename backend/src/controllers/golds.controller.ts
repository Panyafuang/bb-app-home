/** แปลง request → เรียก service → คืน response */

import { NextFunction, Request, Response } from "express";
import debugFactory from "debug";

import * as goldsService from "../services/golds.service";
import { created, deleted, listOk, ok } from "../common/api-response";
import { AppError } from "../common/app-error";
import { pool } from "../db/pool";
import { PoolClient } from "pg";
import { format } from "fast-csv";

const log = debugFactory("app:controller:golds");

/**
 * GET /api/v1/gold_records
 * รองรับ ?q=, ?category=, ?from=, ?to=, ?limit=, ?offset=
 */
export async function listGolds(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    log('listGolds');
    // ส่ง validated/sanitized query object ให้ service จัดการ parsing + business validation
    const { items, total, page, limit } = await goldsService.searchGolds(req.query as any);
    return listOk(res, items, page, limit, total);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/gold_records/:id
 */
export async function getGoldById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    log(`getGoldById ${id}`);

    const gold = await goldsService.getGoldById(id);
    if (!gold) {
      throw AppError.notFound("gold_record not found");
    }

    return ok(res, gold);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/gold_records
 */
export async function createGold(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    log("createGold");
    const dto = req.body;

    const gold = await goldsService.addGold(dto);
    log("createGold gold_record: %s", gold.id);

    return created(res, gold);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/v1/gold_records/:id
 * Allow reference_number duplication (just return meta.warning)
 */
export async function updateGold(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    log("updateGold gold_record: %s", req.params.id);
    const { id } = req.params;
    const dto = req.body;

    // --- 1) ดึงข้อมูลเดิมของ record ---
    const existing = await goldsService.getGoldById(id);
    if (!existing) throw AppError.notFound("gold_record not found");

    // --- 4) ทำการ update ---
    const goldUpdated = await goldsService.updateGold(id, dto);
    if (!goldUpdated) {
      throw AppError.notFound("gold_record not found");
    }

    return ok(res, goldUpdated);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/gold_records/:id
 */
export async function removeGold(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    log("removeGold gold_record: %s", req.params.id);
    const { id } = req.params;
    const success = await goldsService.removeGold(id);
    if (!success) {
      throw AppError.notFound("gold_record not found");
    }

    return deleted(res);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/gold_records/check-unique?reference=...
 */
export async function checkUnique(req: Request, res: Response, next: NextFunction) {
  try {
    const reference = req.query.reference as string;
    log("checkUnique refernce=%s", reference);

    const isUnique = await goldsService.isReferenceUnique(reference);
    return ok(res, { isUnique }); // คืนค่า { isUnique: true } หรือ { isUnique: false }
  } catch (err) {
    next(err);
  }
}


/**
 * GET /api/v1/gold_records/export-csv
 */
export async function exportGoldsCsv(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let client: PoolClient | null = null;

  // ✅ 1. สร้างตัวแปรกันการ Release ซ้ำ
  let isReleased = false;
  const safeRelease = () => {
    if (!isReleased && client) {
      client.release();
      isReleased = true;
      console.log("DB Client released successfully.");
    }
  };
  try {
    client = await pool.connect();

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="gold_records_${new Date().toISOString().split('T')[0]}.csv"`
    );

    const dbStream = await goldsService.getGoldsStream(client);

    // ✅ (เปลี่ยน) สร้างตัวแปลง CSV ด้วย fast-csv
    const csvStream = format({
      headers: true, // ใช้ชื่อคอลัมน์จาก SQL (เช่น "Date", "Reference") เป็น Header เลย
      writeBOM: true, // (Optional) เพิ่ม BOM ให้ Excel เปิดแล้วภาษาไทยไม่เพี้ยน
    })
      .transform((row: any) => {
        // (Optional) จัดรูปแบบวันที่ให้สวยงาม (ถ้าค่ามาเป็น Date Object)
        return {
          ...row,
          "Date": row["Date"] ? new Date(row["Date"]).toISOString().split('T')[0] : "",
        };
      });

    // ต่อท่อ: DB -> CSV -> Response
    dbStream
      .pipe(csvStream)
      .pipe(res);

    // กรณี 1: โหลดเสร็จสมบูรณ์
    dbStream.on("end", () => {
      safeRelease();
    });

    // กรณี 2: เกิด Error ระหว่าง Stream จาก DB
    dbStream.on("error", (err) => {
      console.error("Stream error:", err);
      safeRelease();
      if (!res.headersSent) res.status(500).send("Export failed");
    });

    // กรณี 3: User กดยกเลิก หรือเน็ตหลุด (Response ปิดตัว)
    res.on("close", () => {
      dbStream.destroy();
      safeRelease();
    });

    // (เพิ่มเติม) กรณี CSV Stream Error
    csvStream.on("error", (err) => {
      console.error("CSV error:", err);
      dbStream.destroy();
      safeRelease();
    });

  } catch (err) {
    // กรณี 4: Error ตั้งแต่ตอนเริ่ม (เช่น connect ไม่ได้)
    safeRelease(); // ✅ ใช้ safeRelease
    next(err);
  }
}


/**
 * GET /api/v1/gold_records/summary
 */
export async function getDashboardSummary(req: Request, res: Response, next: NextFunction) {
  try {
    log("getDashboardSummary");

    const summary = await goldsService.getDashboardSummary()
    return ok(res, summary);
  } catch (err) {
    next(err);
  }
}