/** mapping HTTP → controller */

import { Router } from "express";
import { body, param, query } from "express-validator";

import * as goldsController from "../controllers/golds.controller";
import { validateRequest } from "../middlewares/validate-request";

const router = Router();
const CATEGORY_LIST = ["Beauty Bijoux", "PV fine", "PV green", "PV Accessories"];

// GET: /api/v1/gold_records/check-unique?reference=<REFERENCE NUM>
router.get("/check-unique", goldsController.checkUnique);

// GET: /api/v1/gold_records?page&limit
router.get(
    "/",
    [
        query("page").optional().toInt().isInt({ min: 1 }).withMessage("page must be >= 1"),
        query("limit").optional().toInt().isInt({ min: 1, max: 100 }).withMessage("limit must be 1..100"),
        query("offset").optional().toInt().isInt({ min: 0 }).withMessage("offset must be >= 0"),

        query("from").optional().isISO8601().withMessage("from must be ISO8601").toDate(),
        query("to").optional().isISO8601().withMessage("to must be ISO8601").toDate(),

        query("reference_number").optional().trim().isString(),
        query("category").optional().isIn(CATEGORY_LIST).withMessage("invalid category"),
        query("ledger").optional().trim().isString(),

        query("gold_out_min").optional().toFloat().isFloat({ min: 0 }).withMessage("gold_out_min must be >= 0"),
        query("gold_out_max").optional().toFloat().isFloat({ min: 0 }).withMessage("gold_out_max must be >= 0"),
        query("net_gold_min").optional().toFloat().isFloat({ min: 0 }).withMessage("net_gold_min must be >= 0"),
        query("net_gold_max").optional().toFloat().isFloat({ min: 0 }).withMessage("net_gold_max must be >= 0"),

        query("sort")
            .optional()
            .isIn(["timestamp_tz:asc", "timestamp_tz:desc"])
            .withMessage("sort must be 'timestamp_tz:asc' or 'timestamp_tz:desc'"),
    ],
    validateRequest,
    goldsController.listGolds
);

// GET: /api/v1/gold_records/:id
router.get(
    "/:id",
    [param("id").isUUID().withMessage("id must be a valid UUID")],
    validateRequest,
    goldsController.getGoldById
);

// POST: /api/v1/gold_records/
router.post(
    "/",
    [
        body("reference_number").trim().notEmpty().withMessage("reference_number is required"),
        body("category")
            .isIn(["Beauty Bijoux", "PV fine", "PV green", "PV Accessories"])
            .withMessage("invalid category"),
        body("gold_in_grams").isFloat({ min: 0 }).withMessage("gold_in_grams must be >= 0").toFloat(),
        body("gold_out_grams").optional({ nullable: true }).isFloat({ min: 0 }).withMessage("gold_out_grams must be >= 0").toFloat(),
        body("calculated_loss").optional({ nullable: true }).isFloat({ min: 0 }).withMessage("calculated_loss must be >= 0").toFloat(),
        body("timestamp_tz").isISO8601().withMessage("timestamp_tz must be ISO8601"),
        body("details").optional({ nullable: true }).isString(),
        body("remarks").optional({ nullable: true }).isString(),
        body("ledger").optional({ nullable: true }).isString().trim(),
    ],
    validateRequest,
    goldsController.createGold
);

// PUT: /api/v1/gold_records/:id
router.put(
    "/:id",
    [
        param("id").isUUID().withMessage("id must be a valid UUID"),
        body("reference_number").optional().trim().notEmpty(),
        body("category").optional().isIn(["Beauty Bijoux", "PV fine", "PV green", "PV Accessories"]),
        body("gold_in_grams").optional().isFloat({ min: 0 }).toFloat(),
        body("gold_out_grams").optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),
        body("calculated_loss").optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),
        body("timestamp_tz").optional().isISO8601(),
        body("details").optional({ nullable: true }).isString(),
        body("remarks").optional({ nullable: true }).isString(),
        body("ledger").optional({ nullable: true }).isString().trim(),
    ],
    validateRequest,
    goldsController.updateGold
);

// DELETE: /api/v1/gold_records/:id
router.delete(
    "/:id",
    [param("id").isUUID().withMessage("id must be a valid UUID")],
    validateRequest,
    goldsController.removeGold
);

export default router;