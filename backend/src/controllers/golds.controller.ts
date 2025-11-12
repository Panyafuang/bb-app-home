/** แปลง request → เรียก service → คืน response */

import { NextFunction, Request, Response } from "express";
import debugFactory from "debug";

import * as goldsService from "../services/golds.service";
import { created, deleted, listOk, ok } from "../common/api-response";
import { AppError } from "../common/app-error";

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