import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { checkRefUnique as apiCheckRefUnique } from "@/api/goldsClient";

// --- 1. Constants & Helpers (นอก Component) ---
const LEDGERS = [
  "Beauty Bijoux",
  "Green Gold",
  "Palladium",
  "Platinum",
  "PV Accessories",
  "PV Fine Gold",
] as const;

const CATEGORY = [
  "Beauty Bijoux",
  "PV fine",
  "PV green",
  "PV Accessories",
] as const;

const COMPANY_FOUNDED = "1991-03-11"; // 11 มีนาคม 2534

/** (Helper) เช็ค format YYYY-MM-DD และวันที่ถูกต้อง */
function isValidIsoDate(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s).getTime());
}

/** (Helper) ดึงค่าวันที่ปัจจุบันในรูปแบบ YYYY-MM-DD */
function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** (Helper) แปลงค่าตัวเลขอย่างปลอดภัย */
const parseNumber = (v: any): number | null => {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

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

/** (Helper) ตรรกะการ Auto-fill (ตาม Spec) */
function inferCalculatedLoss(ledger: string, reference: string): number | null {
  if (!ledger) return null;
  const isRefining = /(refining|umicore)/i.test(reference);
  const isExport = /(export|exp\b|shipment)/i.test(reference);

  if (ledger === "Beauty Bijoux") {
    if (isRefining) return 0.0;
    if (isExport) return 0.1;
  }
  return null; // Ledgers อื่นๆ ให้เป็นค่าว่าง
}

/** (Helper) ตรวจสอบ Reference Unique (เชื่อม API จริง) */
async function checkReferenceUnique(reference: string): Promise<boolean> {
  try {
    // เรียก API client ที่เราสร้างในขั้นตอน 2.1
    // (true = unique, false = exists)
    const isUnique = await apiCheckRefUnique(reference);
    return isUnique;
  } catch (error) {
    // ถ้า API error, เพื่อความปลอดภัย ให้ถือว่า "ซ้ำ" (false)
    console.error("Failed to check reference uniqueness", error);
    return false;
  }
}

export default function GoldForm({
  mode,
  defaultValues,
  onSubmit,
}: {
  mode: "create" | "edit";
  defaultValues?: any;
  onSubmit: (dto: any) => Promise<void>;
}) {
  const { t } = useTranslation("common");

  // --- ✅ 1. (แก้ไข) คำนวณ Direction เริ่มต้นก่อน ---
  const initialDirection = useMemo(() => {
    if (!defaultValues) return "";
    return Number(defaultValues.gold_out_grams) > 0 ? "OUT" : "IN";
  }, [defaultValues]);

  // --- ✅ 2. (แก้ไข) คำนวณ Weight เริ่มต้น โดยอิงจาก Direction ---
  const initialWeight = useMemo(() => {
    if (!defaultValues) return "";
    // ถ้าเป็น OUT ให้ใช้ gold_out_grams
    if (initialDirection === "OUT") {
      return String(defaultValues.gold_out_grams || "");
    }
    // ถ้าเป็น IN (หรืออื่นๆ) ให้ใช้ gold_in_grams
    return String(defaultValues.gold_in_grams || "");
  }, [defaultValues, initialDirection]);

  // State ของฟอร์ม
  const [date, setDate] = useState<string>(
    defaultValues?.timestamp_tz?.slice(0, 10) || getTodayISO()
  );
  const [reference, setReference] = useState(
    defaultValues?.reference_number || ""
  );
  const [direction, setDirection] = useState<"" | "IN" | "OUT">(
    // defaultValues
    //   ? Number(defaultValues.gold_out_grams) > 0
    //     ? "OUT"
    //     : "IN"
    //   : ""
    initialDirection
  );
  const [weight, setWeight] = useState(
    // defaultValues
    //   ? String(
    //       defaultValues.gold_in_grams || defaultValues.gold_out_grams || ""
    //     )
    //   : ""
    initialWeight
  );
  const [ledger, setLedger] = useState(defaultValues?.ledger || "");
  const [details, setDetails] = useState(defaultValues?.details || "");
  const [remarks, setRemarks] = useState(defaultValues?.remarks || "");
  const [category, setCategory] = useState(defaultValues?.category || "");

  // --- State สำหรับ Calculated Loss (ตาม Spec) ---
  const [calculatedLoss, setCalculatedLoss] = useState(() => {
    if (
      defaultValues?.calculated_loss === null ||
      defaultValues?.calculated_loss === undefined
    ) {
      return "";
    }
    return (Number(defaultValues.calculated_loss) * 100).toFixed(2);
  });
  const [lossManuallySet, setLossManuallySet] = useState(mode === "edit");

  // --- State สำหรับ Validation ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [refUnique, setRefUnique] = useState<boolean | null>(
    mode === "edit" ? true : null
  );
  const [checkingRef, setCheckingRef] = useState(false);

  // ✅ 2. Derived State (สำหรับ Net Gold Read-only)
  const weightNum = useMemo(() => {
    if (weight === "") return NaN;
    const n = Number(weight);
    return Number.isFinite(n) ? n : NaN;
  }, [weight]);

  const netGold = useMemo(() => {
    if (!direction || Number.isNaN(weightNum)) return 0;
    return direction === "IN" ? weightNum : -weightNum;
  }, [direction, weightNum]);

  const goldIn =
    direction === "IN" ? (Number.isNaN(weightNum) ? 0 : weightNum) : 0;
  const goldOut =
    direction === "OUT" ? (Number.isNaN(weightNum) ? 0 : weightNum) : 0;

  // ✅ 3. Effects (Auto-fill Loss & Check Reference)
  useEffect(() => {
    if (lossManuallySet) return;
    const inferredDecimal = inferCalculatedLoss(ledger, reference);
    if (inferredDecimal !== null) {
      setCalculatedLoss((inferredDecimal * 100).toFixed(2));
    } else if (!lossManuallySet) {
      setCalculatedLoss("");
    }
  }, [ledger, reference, lossManuallySet]);

  useEffect(() => {
    if (mode === "edit") return; // ไม่เช็ค Unique ถ้าเป็นโหมด Edit
    if (!reference) {
      setRefUnique(null);
      return;
    }
    const id = setTimeout(async () => {
      setCheckingRef(true);
      try {
        const ok = await checkReferenceUnique(reference);
        setRefUnique(ok);
      } finally {
        setCheckingRef(false);
      }
    }, 350);
    return () => clearTimeout(id);
  }, [reference, mode]);

  // ✅ 4. Validation Logic (useMemo)
  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    const today = getTodayISO();

    // Date
    if (date.trim() === "") e.date = t("validation.required");
    else if (!isValidIsoDate(date)) e.date = t("validation.date.invalidFormat");
    else if (date > today) e.date = t("validation.date.future");
    else if (date < COMPANY_FOUNDED)
      e.date = t("validation.date.tooOld", { date: "11/03/1991" });

    // Reference
    if (reference.trim() === "") e.reference = t("validation.required");
    else if (reference.length > 100)
      e.reference = t("validation.ref.maxLength");
    else if (!/^[A-Za-z0-9_\-\s\/]+$/.test(reference))
      e.reference = t("validation.ref.pattern");
    // else if (refUnique === false) e.reference = t("validation.ref.exists");

    // Direction
    if (direction === "") e.direction = t("validation.required");

    // Weight
    const w = Number(weight);
    if (weight.trim() === "") e.weight = t("validation.required");
    else if (w <= 0) e.weight = t("validation.weight.positive");
    else if (w > 9999999.999) e.weight = t("validation.weight.max");

    // Calculated Loss
    if (calculatedLoss.trim() !== "") {
      const dec = toDecimalFromPercentInput(calculatedLoss);
      if (dec === null) e.calculated_loss = t("validation.loss.invalidFormat");
      else if (dec < 0 || dec > 1)
        e.calculated_loss = t("validation.loss.range");
    }

    // Category (Required)
    if (category.trim() === "") e.category = t("validation.required");

    return e;
  }, [date, reference, direction, weight, category, calculatedLoss, t]);

  // ตรวจสอบว่าฟอร์มพร้อมส่งหรือไม่
  const canSubmit =
    Object.keys(errors).length === 0 && !checkingRef && refUnique !== false; // <-- ✅ 1. แก้ไข canSubmit (เอา refUnique ออกจาก errors)

  // --- 💅 CSS Classes (ไม่เปลี่ยนแปลง) ---
  const inputStyle =
    "block w-full p-2 text-gray-900 border border-gray-300 rounded-md bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500";
  const errorStyle = "border-red-500 ring-2 ring-red-100 border-2";

  // ✅ 5. อัปเดตฟังก์ชัน Reset
  function handleReset() {
    setShowErrors(false);
    setDate(defaultValues?.timestamp_tz?.slice(0, 10) || getTodayISO());
    setReference(defaultValues?.reference_number || "");
    setDirection(
      defaultValues
        ? Number(defaultValues.gold_out_grams) > 0
          ? "OUT"
          : "IN"
        : ""
    );
    setWeight(
      defaultValues
        ? String(
            defaultValues.gold_in_grams || defaultValues.gold_out_grams || ""
          )
        : ""
    );
    setLedger(defaultValues?.ledger || "");
    setDetails(defaultValues?.details || "");
    setRemarks(defaultValues?.remarks || "");
    setCategory(defaultValues?.category || "");

    // รีเซ็ต Calculated Loss
    const defaultLoss =
      defaultValues?.calculated_loss === null ||
      defaultValues?.calculated_loss === undefined
        ? ""
        : (Number(defaultValues.calculated_loss) * 100).toFixed(2);
    setCalculatedLoss(defaultLoss);
    setLossManuallySet(mode === "edit");

    // รีเซ็ต Reference
    setRefUnique(mode === "edit" ? true : null);
    setCheckingRef(false);
  }

  // ✅ 6. อัปเดตฟังก์ชัน Submit
  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!canSubmit) {
      setShowErrors(true);
      return;
    }

    try {
      setIsSubmitting(true);
      const gold_in_grams = direction === "IN" ? Number(weight) : 0;
      const gold_out_grams = direction === "OUT" ? Number(weight) : 0;

      const now = new Date();
      const dateParts = date.split("-").map(Number);
      const timestamp = new Date(
        dateParts[0],
        dateParts[1] - 1,
        dateParts[2],
        now.getHours(),
        now.getMinutes(),
        now.getSeconds()
      );

      // แปลง Display String ("6.00") กลับเป็น Decimal (0.06)
      const decimalLoss = toDecimalFromPercentInput(calculatedLoss);

      const dto = {
        timestamp_tz: timestamp.toISOString(),
        reference_number: reference.trim(),
        details: details || null,
        gold_in_grams,
        gold_out_grams,
        ledger: ledger || null, // (ส่ง null ถ้าว่าง)
        remarks: remarks || null,
        category: category || null, // (ส่ง null ถ้าว่าง)
        calculated_loss: decimalLoss,
      };
      await onSubmit(dto);

      if (mode === "create") {
        handleReset();
      }
    } catch (err) {
      console.error("Submit error", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  // --- Helpers ---
  const ErrorMessage = ({ field }: { field: string }) => {
    if (!showErrors || !errors[field]) return null;
    return <p className="mt-1 text-sm text-red-600">{errors[field]}</p>;
  };

  return (
    <form
      onSubmit={submit}
      className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-12"
    >
      {/* Date */}
      <div className="md:col-span-3">
        <label className="block text-sm font-medium">
          {t("form.date")}
          <span className="text-red-600"> *</span>
        </label>
        <input
          type="date"
          className={`${inputStyle} ${
            showErrors && errors.date ? errorStyle : ""
          }`}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={getTodayISO()}
          min={COMPANY_FOUNDED}
        />
        <ErrorMessage field="date" />
      </div>

      {/* Reference */}
      <div className="md:col-span-3">
        <label className="block text-sm font-medium">
          {t("form.reference")}
          <span className="text-red-600"> *</span>
        </label>
        <input
          className={`${inputStyle} ${
            (showErrors && errors.reference) || refUnique === false
              ? errorStyle
              : ""
          }`}
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="INV-2025/BB-001"
          maxLength={100} // <-- Spec: Max length 100
        />
        {/* Feedback การเช็ค Unique */}
        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
          {checkingRef && <span className="animate-pulse">• checking…</span>}
          {refUnique && reference && !checkingRef && (
            <span className="text-green-600">✓ looks unique</span>
          )}
        </div>
        {/* (แก้ไข) แสดง Error ทันทีถ้าซ้ำ */}
        {showErrors && errors.reference ? (
          <ErrorMessage field="reference" />
        ) : refUnique === false ? (
          <p className="mt-1 text-sm text-red-600">
            {t("validation.ref.exists")}
          </p>
        ) : null}
      </div>

      {/* Direction */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium">
          {t("form.direction")}
          <span className="text-red-600"> *</span>
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDirection("IN")}
            className={`flex-1 rounded-xl border border-gray-300 p-2 ${
              direction === "IN"
                ? "border-green-600 ring-2 ring-green-200"
                : "hover:bg-gray-50"
            }`}
          >
            {t("form.in")}
          </button>
          <button
            type="button"
            onClick={() => setDirection("OUT")}
            className={`flex-1 rounded-xl border border-gray-300 p-2 ${
              direction === "OUT"
                ? "border-red-600 ring-2 ring-red-200"
                : "hover:bg-gray-50"
            }`}
          >
            {t("form.out")}
          </button>
        </div>
        <ErrorMessage field="direction" />
      </div>

      {/* Weight (Dynamic Label) */}
      <div className="md:col-span-2">
        {/* Spec: Dynamic Label */}
        <label className="block text-sm font-medium">
          {direction === "OUT"
            ? t("form.weight_sent")
            : direction === "IN"
            ? t("form.weight_received")
            : t("form.weight")}
          <span className="text-red-600"> *</span>
        </label>
        <input
          type="number"
          step="0.001"
          className={`${inputStyle} ${
            showErrors && errors.weight ? errorStyle : ""
          }`}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
        <ErrorMessage field="weight" />
      </div>

      {/* Calculated Loss (UI %%) */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium">
          {t("form.calculated_loss")}
        </label>
        <input
          type="text" // Spec: UI as %
          className={`${inputStyle} ${
            showErrors && errors.calculated_loss ? errorStyle : ""
          }`}
          value={calculatedLoss}
          onChange={(e) => {
            setCalculatedLoss(e.target.value);
            setLossManuallySet(true); // Spec: Manual override
          }}
          placeholder="e.g. 6% or 0.06"
        />
        <ErrorMessage field="calculated_loss" />
      </div>

      {/* ✅ 2. Ledger (แก้ไข) */}
      <div className="md:col-span-3">
        <label className="block text-sm font-medium">
          {t("form.ledger")}
          {/* <span className="text-red-600"> *</span> */}{" "}
          {/* <-- ลบ * สีแดง */}
        </label>
        <select
          className={inputStyle} // <-- ลบตรรกะ Error
          value={ledger}
          onChange={(e) => setLedger(e.target.value)}
        >
          <option value="">Select…</option>
          {LEDGERS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        {/* <ErrorMessage field="ledger" /> */} {/* <-- ลบ Error Message */}
      </div>

      {/* Category (Required) */}
      <div className="md:col-span-3">
        <label className="block text-sm font-medium">
          {t("form.category")}
          <span className="text-red-600"> *</span>
        </label>
        <select
          className={`${inputStyle} ${
            showErrors && errors.category ? errorStyle : ""
          }`}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select…</option>
          {CATEGORY.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <ErrorMessage field="category" />
      </div>

      {/* Details */}
      <div className="md:col-span-6">
        <label className="block text-sm font-medium">{t("form.details")}</label>
        <input
          className={inputStyle}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
      </div>

      {/* Remarks */}
      <div className="md:col-span-6">
        <label className="block text-sm font-medium">{t("form.remarks")}</label>
        <textarea
          rows={2}
          className={inputStyle}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </div>

      {/* Net Gold Read-only */}
      <div className="md:col-span-12">
        <label className="block text-sm font-medium">
          {t("form.net_gold")} (Read-only)
        </label>
        <div
          className={`rounded-md p-3 text-sm ${
            netGold === 0
              ? "bg-gray-100 text-gray-800"
              : netGold < 0
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          <span className="font-semibold">
            {netGold >= 0 ? "+" : ""}
            {Number.isNaN(netGold) ? "0.000" : netGold.toFixed(3)} g
          </span>
          <span className="ml-4 text-gray-500">
            (IN: {goldIn.toFixed(3)} g • OUT: {goldOut.toFixed(3)} g)
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div className="md:col-span-12 flex justify-end gap-2">
        <button
          type="button"
          className="rounded-lg px-4 py-2 hover:bg-gray-50 text-sm p-2 border border-gray-200 "
          onClick={handleReset}
        >
          {t("form.reset")}
        </button>
        {/* <button
          type="submit"
          // disabled={!canSubmit || isSubmitting} // Disable ถ้าไม่ Valid หรือกำลังส่ง
          className={`rounded-lg px-4 py-2 text-white text-sm ${
            !canSubmit || isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? t("form.saving") : t("form.save")}
        </button> */}

        <button
          type="submit"
          disabled={isSubmitting} // Req 1: Disable ปุ่มขณะกำลังบันทึก
          className={`rounded-lg px-4 py-2 text-white text-sm ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed" // สไตล์ตอน Disable
              : "bg-blue-600 hover:bg-blue-700" // สไตล์ปกติ (สีน้ำเงิน)
          }`}
        >
          {isSubmitting ? t("form.saving") : t("form.save")}
        </button>
      </div>
    </form>
  );
}
