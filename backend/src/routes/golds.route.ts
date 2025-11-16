/** mapping HTTP → controller */

import { Router } from "express";
import { body, param, query } from "express-validator";

import * as goldsController from "../controllers/golds.controller";
import { validateRequest } from "../middlewares/validate-request";
import {
  LEDGER_LIST,
  FINENESS_GOLD_NUMERIC,
  FINENESS_PALLADIUM_NUMERIC,
  FINENESS_PLATINUM_NUMERIC,
  ALL_FINENESS_VALUES_NUMERIC,
} from "../types/golds";

const router = Router();

// status (import, export)
const STATUS_LIST_IN = ["purchased", "received"];
const STATUS_LIST_OUT = ["invoiced", "returned"];

const SHIPPING_AGENT = [
  "FedEx",
  "DHL",
  "RK International",
  "Ferrari",
  "Brinks",
  "Kerry Express",
  "Flash Express",
  "Thailand Post",
  "Others",
] as const;

const getGoldsValidation = [
  query("page")
    .optional()
    .toInt()
    .isInt({ min: 1 })
    .withMessage("page must be >= 1"),
  query("limit")
    .optional()
    .toInt()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be 1..100"),
  query("offset")
    .optional()
    .toInt()
    .isInt({ min: 0 })
    .withMessage("offset must be >= 0"),

  query("from")
    .optional()
    .isISO8601()
    .withMessage("from must be ISO8601")
    .toDate(),
  query("to").optional().isISO8601().withMessage("to must be ISO8601").toDate(),

  query("reference_number").optional().trim().isString(),
  query("ledger").optional().isIn(LEDGER_LIST).withMessage("invalid ledger"),
  query("counterpart").optional().trim().isString(),
  query("status").optional().trim().isString(),
  query("shipping_agent")
    .optional()
    .isIn(SHIPPING_AGENT)
    .withMessage("Invalid shipping agent"),
  // query("fineness").optional().isIn(ALL_FINENESS_VALUES_NUMERIC).withMessage("Invalid fineness agent"),
  query("fineness")
    .optional()
    .isIn(ALL_FINENESS_VALUES_NUMERIC) // 1. ตรวจสอบว่าอยู่ใน List (ที่เป็น String)
    .toFloat() // 2. แปลงเป็นตัวเลข
    .withMessage("Invalid fineness value"),

  query("gold_out_min")
    .optional()
    .toFloat()
    .isFloat({ min: 0 })
    .withMessage("gold_out_min must be >= 0"),
  query("gold_out_max")
    .optional()
    .toFloat()
    .isFloat({ min: 0 })
    .withMessage("gold_out_max must be >= 0"),
  query("net_gold_min")
    .optional()
    .toFloat()
    .isFloat({ min: 0 })
    .withMessage("net_gold_min must be >= 0"),
  query("net_gold_max")
    .optional()
    .toFloat()
    .isFloat({ min: 0 })
    .withMessage("net_gold_max must be >= 0"),
  query("calculated_loss")
    .optional()
    .toFloat()
    .isFloat()
    .withMessage("calculated_loss must be >= 0"),

  query("sort")
    .optional()
    .isIn(["timestamp_tz:asc", "timestamp_tz:desc"])
    .withMessage("sort must be 'timestamp_tz:asc' or 'timestamp_tz:desc'"),
];

const createGoldValidation = [
  // (ฟิลด์บังคับ)
  body("timestamp_tz")
    .isISO8601()
    .withMessage("timestamp_tz must be ISO8601")
    .toDate(),
  body("reference_number")
    .trim()
    .notEmpty()
    .withMessage("reference_number is required"),
  body("ledger").isIn(LEDGER_LIST).withMessage("ledger is required"),
  // ถ้า IN -> gold_in_grams ถ้า OUT -> gold_out_grams
  body("gold_in_grams")
    .toFloat()
    .isFloat({ min: 0 })
    .withMessage("gold_in_grams must be >= 0"),
  body("gold_out_grams")
    .toFloat()
    .isFloat({ min: 0 })
    .withMessage("gold_out_grams must be >= 0"),

  // (ฟิลด์ Optional)
  body("related_reference_number")
    .optional({ checkFalsy: true })
    .trim()
    .isString(), // falsy (เช่น null, undefined, 0, "", false)
  body("calculated_loss")
    .optional({ checkFalsy: true })
    .toFloat()
    .isFloat({ min: 0 })
    .withMessage("calculated_loss must be >= 0 (grams)"),
  body("counterpart").optional({ checkFalsy: true }).trim().isString(),
  body("good_details").optional({ checkFalsy: true }).trim().isString(),
  body("shipping_agent").optional({ checkFalsy: true }).trim().isString(),
  body("remarks").optional({ checkFalsy: true }).trim().isString(),
  body("status").optional({ checkFalsy: true }).trim().isString(),

  body("fineness")
    .optional({ checkFalsy: true })
    .toFloat() // 1. แปลงค่า (เช่น '333') เป็นตัวเลข 333
    .custom((value, { req }) => {
      // 2. ตรวจสอบ Logic ความสัมพันธ์กับ Ledger
      const ledger = req.body.ledger;
      if (!value || !ledger) return true;

      // (ใช้ List ตัวเลขในการตรวจสอบ)
      if (
        [
          "Beauty Bijoux",
          "Green Gold",
          "PV Accessories",
          "PV Fine Gold",
        ].includes(ledger)
      ) {
        if (!FINENESS_GOLD_NUMERIC.includes(value))
          throw new Error(`Invalid fineness ${value} for Gold ledger.`);
      } else if (ledger === "Palladium") {
        if (!FINENESS_PALLADIUM_NUMERIC.includes(value))
          throw new Error(`Invalid fineness ${value} for Palladium ledger.`);
      } else if (ledger === "Platinum") {
        if (!FINENESS_PLATINUM_NUMERIC.includes(value))
          throw new Error(`Invalid fineness ${value} for Platinum ledger.`);
      }
      return true;
    }),
  body("status")
    .optional({ checkFalsy: true })
    .trim()
    .isString()
    .toLowerCase()
    .custom((value, { req }) => {
      if (!value) return true; // ถ้าไม่ส่งมา (optional) ก็ถือว่าผ่าน

      // เราอ่านค่าที่ .toFloat() มาแล้ว
      const goldIn = Number(req.body.gold_in_grams);
      const goldOut = Number(req.body.gold_out_grams);

      // Import
      if (goldIn > 0 && goldOut === 0) {
        if (!STATUS_LIST_IN.includes(value)) {
          throw new Error(
            `Invalid status '${value}'. For Imports (gold_in > 0), must be 'Purchased' or 'Received'.`
          );
        }
        // Export
      } else if (goldOut > 0 && goldIn === 0) {
        if (!STATUS_LIST_OUT.includes(value)) {
          throw new Error(
            `Invalid status '${value}'. For Exports (gold_out > 0), must be 'Invoiced' or 'Returned'.`
          );
        }
      }
      return true;
    }),
];

const updateGoldValidation = [
  body("timestamp_tz").optional().isISO8601().toDate(),
  body("reference_number").optional().trim().notEmpty(),
  body("ledger").optional().isIn(LEDGER_LIST),
  body("gold_in_grams").optional().toFloat().isFloat({ min: 0 }),
  body("gold_out_grams").optional().toFloat().isFloat({ min: 0 }),
  body("related_reference_number")
    .optional({ checkFalsy: true })
    .trim()
    .isString(),
  body("calculated_loss")
    .optional({ checkFalsy: true })
    .toFloat()
    .isFloat({ min: 0 }),
  body("counterpart").optional({ checkFalsy: true }).trim().isString(),
  body("good_details").optional({ checkFalsy: true }).trim().isString(),
  body("shipping_agent").optional({ checkFalsy: true }).trim().isString(),
  body("remarks").optional({ checkFalsy: true }).trim().isString(),
  // body("fineness").optional({ checkFalsy: true }).trim().isString(),
  // body("status").optional({ checkFalsy: true }).trim().isString(),
  body("fineness")
    .optional({ checkFalsy: true })
    .toFloat()
    .custom((value, { req }) => {
      // if no ledger or no value, pass
      const ledger = req.body.ledger || req.query?.ledger; // allow ledger from body (edit) ; query not expected here but safe
      if (!value || !ledger) return true;

      if (
        [
          "Beauty Bijoux",
          "Green Gold",
          "PV Accessories",
          "PV Fine Gold",
        ].includes(ledger)
      ) {
        if (!FINENESS_GOLD_NUMERIC.includes(Number(value))) {
          throw new Error(`Invalid fineness ${value} for Gold ledger.`);
        }
      } else if (ledger === "Palladium") {
        if (!FINENESS_PALLADIUM_NUMERIC.includes(Number(value))) {
          throw new Error(`Invalid fineness ${value} for Palladium ledger.`);
        }
      } else if (ledger === "Platinum") {
        if (!FINENESS_PLATINUM_NUMERIC.includes(Number(value))) {
          throw new Error(`Invalid fineness ${value} for Platinum ledger.`);
        }
      }
      return true;
    }),

  body("status")
    .optional({ checkFalsy: true })
    .trim()
    .toLowerCase()
    .custom((value, { req }) => {
      if (!value) return true;
      const goldIn = Number(req.body.gold_in_grams ?? 0);
      const goldOut = Number(req.body.gold_out_grams ?? 0);

      if (goldIn > 0 && goldOut === 0) {
        // import
        if (!STATUS_LIST_IN.includes(value)) {
          throw new Error(
            `Invalid status '${value}'. For imports must be 'purchased' or 'received'.`
          );
        }
      } else if (goldOut > 0 && goldIn === 0) {
        // export
        if (!STATUS_LIST_OUT.includes(value)) {
          throw new Error(
            `Invalid status '${value}'. For exports must be 'invoiced' or 'returned'.`
          );
        }
      }
      return true;
    }),
];

// GET: /api/v1/gold_records/check-unique?reference=<REFERENCE NUM>
router.get("/check-unique", goldsController.checkUnique);

// GET: /api/v1/gold_records?page&limit
router.get("/", getGoldsValidation, validateRequest, goldsController.listGolds);

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
  createGoldValidation,
  validateRequest,
  goldsController.createGold
);

// PUT: /api/v1/gold_records/:id
router.put(
  "/:id",
  updateGoldValidation,
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
