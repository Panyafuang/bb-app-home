// frontend/src/features/golds/components/GoldForm.tsx
import { useState, useMemo, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { checkRefUnique as apiCheckRefUnique } from "@/api/goldsClient";
import { getTodayISO } from "@/utils/help";

const LEDGERS = [
  "Beauty Bijoux",
  "Green Gold",
  "Palladium",
  "Platinum",
  "PV Accessories",
  "PV Fine Gold",
] as const;

// (Constants สำหรับ Status/Fineness)
const STATUS_OPTIONS_IN = ["Purchased", "Received"] as const;
const STATUS_OPTIONS_OUT = ["Invoiced", "Returned"] as const;

// (กลุ่ม Gold)
export const FINENESS_MAP_GOLD = [
  { label: "8K", value: 333 },
  { label: "9K", value: 375 },
  { label: "10K", value: 417 },
  { label: "18K", value: 750 },
  { label: "22K", value: 916 },
  { label: "23K", value: 958 },
  { label: "24K", value: 999 },
];
// (กลุ่ม Palladium)
export const FINENESS_MAP_PALLADIUM = [
  { label: "14%", value: 140 },
  { label: "95%", value: 950 },
];
// (กลุ่ม Platinum)
export const FINENESS_MAP_PLATINUM = [
  { label: "14%", value: 140 },
  { label: "95%", value: 950 },
];

// Lists สำหรับ Dropdown (ตาม Requirement ใหม่)
const COUNTERPART_LIST = [
  "Nakagawa",
  "Qnet",
  "Paspaley",
  "Poh Heng",
  "Germany",
  "BB stock",
  "Aspial",
  "Umicore",
  "Others",
] as const;

const SHIPPING_AGENT_LIST = [
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

const COMPANY_FOUNDED = "1991-03-11";

/** (Helper) เช็ค format YYYY-MM-DD และวันที่ถูกต้อง */
function isValidIsoDate(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s).getTime());
}

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

/** (Helper) ตรวจสอบ Reference Unique (เชื่อม API จริง)
 *  Note: apiCheckRefUnique should ideally return a plain boolean:
 *  true => unique (not used), false => not unique (already exists)
 *  If your API returns { exists: true } instead, the code below will handle it.
 */
async function checkReferenceUniqueRemote(reference: string): Promise<boolean> {
  try {
    const res = await apiCheckRefUnique(reference);
    // be robust: accept boolean or object { exists: boolean } or { isUnique: boolean }
    if (typeof res === "boolean") return res;
    if (res && typeof res === "object") {
      if ("exists" in res) return !Boolean((res as any).exists);
      if ("isUnique" in res) return Boolean((res as any).isUnique);
      if ("unique" in res) return Boolean((res as any).unique);
    }
    // default conservative: assume not unique if unknown shape
    return false;
  } catch (error) {
    console.error("Failed to check reference uniqueness", error);
    // conservative: mark as not unique (prevents accidental duplicates)
    return false;
  }
}

/**
 * GoldForm
 * - ปรับให้รับ prop onCancel?: () => void เพื่อสั่งกลับไปที่โหมด create (parent ควบคุม)
 * - ถ้า parent ไม่ส่ง onCancel จะ fallback ไปทำ handleReset() แทน (เคลียร์ form)
 *
 * Usage:
 * <GoldForm mode="create" ... />
 * <GoldForm mode="edit" defaultValues={row} onCancel={() => setMode('create')} ... />
 */
export default function GoldForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel, // <-- optional callback ให้ parent เปลี่ยนโหมดกลับเป็น 'create'
}: {
  mode: "create" | "edit";
  defaultValues?: any;
  onSubmit: (dto: any) => Promise<void>;
  onCancel?: () => void;
}) {
  const { t } = useTranslation("common");

  // ============================
  // State ของฟอร์ม (ค่าคอนโทรล)
  // ค่าเริ่มต้นมาจาก defaultValues แต่สำคัญ: เมื่อ defaultValues เปลี่ยน (เช่นจาก parent)
  // เราจะต้องมี useEffect มาซิงก์ค่า (ดู useEffect ด้านล่าง)
  // ============================
  const [date, setDate] = useState<string>(
    defaultValues?.timestamp_tz?.slice(0, 10) || getTodayISO()
  );
  const [reference, setReference] = useState(
    defaultValues?.reference_number || ""
  );
  const [direction, setDirection] = useState<"" | "IN" | "OUT">(
    defaultValues
      ? Number(defaultValues.gold_out_grams) > 0
        ? "OUT"
        : "IN"
      : ""
  );
  const [weightGrams, setWeightGrams] = useState(
    defaultValues
      ? String(
          defaultValues.gold_in_grams || defaultValues.gold_out_grams || ""
        )
      : ""
  );
  const [ledger, setLedger] = useState(defaultValues?.ledger || "");
  const [fineness, setFineness] = useState(
    defaultValues?.fineness != null ? String(defaultValues.fineness) : ""
  ); // เก็บเป็น string เพราะ select value เป็น string
  const [relatedReference, setRelatedReference] = useState(
    defaultValues?.related_reference_number || ""
  );
  const [counterpart, setCounterpart] = useState(
    defaultValues?.counterpart || ""
  );
  const [goodDetails, setGoodDetails] = useState(
    defaultValues?.good_details || ""
  );
  const [status, setStatus] = useState(defaultValues?.status || "");
  const [shippingAgent, setShippingAgent] = useState(
    defaultValues?.shipping_agent || ""
  );
  const [remarks, setRemarks] = useState(defaultValues?.remarks || "");

  // State สำหรับ Loss (เก็บเป็น percent string ให้ UI แสดง "5.00")
  const [calculatedLoss, setCalculatedLoss] = useState(() => {
    if (
      defaultValues?.calculated_loss === null ||
      defaultValues?.calculated_loss === undefined
    ) {
      return "";
    }
    return (Number(defaultValues.calculated_loss) * 100).toFixed(2);
  });

  // (State สำหรับ Validation)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  // refUnique: true = unique OK; false = duplicate (bad); null = not checked / unknown
  const [refUnique, setRefUnique] = useState<boolean | null>(
    mode === "edit" ? true : null
  );
  const [checkingRef, setCheckingRef] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  useEffect(() => {
    setIsInitialLoad(false);
  }, []);

  // keep latest reference to cancel race conditions
  const latestRef = useRef<string>(reference);

  // ============================
  // IMPORTANT: sync defaultValues -> local state when parent provides new defaultValues
  // - ทำงานเมื่อ defaultValues หรือ mode เปลี่ยน (เช่น กด Edit แล้ว parent ส่ง row มาเป็น defaultValues)
  // - ถ้า mode === "edit" จะ prefill ทุก field จาก defaultValues
  // - ถ้า mode === "create" จะเรียก handleReset() เพื่อเคลียร์ฟอร์ม
  // - ใช้ defaultValues?.id และ timestamp เพื่อป้องกันการ rerender เกินจำเป็น
  // ============================
  useEffect(() => {
    // ถ้าไม่มีค่า defaultValues
    if (!defaultValues) {
      if (mode === "create") {
        handleReset();
      }
      return;
    }

    if (mode === "edit") {
      // --- Date ---
      setDate(
        defaultValues.timestamp_tz
          ? String(defaultValues.timestamp_tz).slice(0, 10)
          : getTodayISO()
      );

      // --- Reference ---
      setReference(defaultValues.reference_number ?? "");

      // --- Direction (IN/OUT) ---
      // ถ้ามี gold_out_grams > 0 => OUT, ถ้ามี gold_in_grams > 0 => IN
      // ถ้าไม่มีทั้งสองแต่มี net_gold_grams ให้ดู sign (negative = OUT)
      if (
        defaultValues.gold_out_grams != null &&
        Number(defaultValues.gold_out_grams) > 0
      ) {
        setDirection("OUT");
      } else if (
        defaultValues.gold_in_grams != null &&
        Number(defaultValues.gold_in_grams) > 0
      ) {
        setDirection("IN");
      } else if (defaultValues.net_gold_grams != null) {
        const net = Number(defaultValues.net_gold_grams);
        setDirection(net < 0 ? "OUT" : "IN");
      } else {
        setDirection("");
      }

      // --- Weight (Net Weight visible to user) ---
      // Prioritize explicit gold_in_grams / gold_out_grams (existing logic),
      // but also fall back to net_gold_grams if provided by backend.
      if (
        defaultValues.gold_in_grams != null &&
        Number(defaultValues.gold_in_grams) > 0
      ) {
        setWeightGrams(String(defaultValues.gold_in_grams));
      } else if (
        defaultValues.gold_out_grams != null &&
        Number(defaultValues.gold_out_grams) > 0
      ) {
        setWeightGrams(String(defaultValues.gold_out_grams));
      } else if (defaultValues.net_gold_grams != null) {
        // if backend sends net_gold_grams (positive for IN, negative for OUT),
        // show absolute value in weight field so UX matches existing behavior.
        setWeightGrams(String(Math.abs(Number(defaultValues.net_gold_grams))));
      } else {
        setWeightGrams("");
      }

      // --- Ledger / Fineness / Related / Counterpart / Good details / Shipping / Remarks ---
      setLedger(defaultValues.ledger ?? "");
      setFineness(
        defaultValues.fineness != null ? String(defaultValues.fineness) : ""
      );
      setRelatedReference(defaultValues.related_reference_number ?? "");
      setCounterpart(defaultValues.counterpart ?? "");
      setGoodDetails(defaultValues.good_details ?? "");
      setShippingAgent(defaultValues.shipping_agent ?? "");
      setRemarks(defaultValues.remarks ?? "");

      // --- Calculated loss (decimal -> percent string) ---
      const lossVal =
        defaultValues.calculated_loss === null ||
        defaultValues.calculated_loss === undefined
          ? ""
          : (Number(defaultValues.calculated_loss) * 100).toFixed(2);
      setCalculatedLoss(lossVal);

      // --- Status: normalize to match select options ---
      // สถานการณ์ปกติ backend อาจส่ง "purchased" หรือ "Purchased"
      // UI options ใช้ "Purchased" / "Received" / "Invoiced" / "Returned"
      // ดังนั้น normalize: lower -> capitalize first char
      const rawStatus = defaultValues.status ?? "";
      if (typeof rawStatus === "string" && rawStatus.trim() !== "") {
        const s = rawStatus.trim();
        // ถ้า s เป็นทั้งหมดตัวพิมพ์เล็กหรือใหญ่ ให้แปลงเป็น Title Case แบบง่าย
        const normalized = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
        // แต่ก่อนจะ set ให้ตรวจว่า normalized อยู่ใน option list (เพื่อป้องกันค่าที่ไม่รู้จัก)
        if (
          ["Purchased", "Received", "Invoiced", "Returned"].includes(normalized)
        ) {
          setStatus(normalized);
        } else {
          // ถ้าไม่ match option ให้เก็บค่าเดิม (fallback)
          setStatus(s);
        }
      } else {
        setStatus("");
      }

      // validation / ref check states
      setRefUnique(true);
      setCheckingRef(false);
    } else if (mode === "create") {
      // กลับไปโหมดสร้างใหม่ -> reset
      handleReset();
    }
    // เฝ้าดู id/timestamp เพื่อป้องกันการ trigger บ่อยเกินไป ถ้า parent เปลี่ยน object reference แต่ข้อมูลไม่เปลี่ยน
  }, [defaultValues?.id, defaultValues?.timestamp_tz, mode]);

  // ============================
  // Derived state + helpers (เหมือนเดิม)
  // ============================
  const weightNumGrams = useMemo(() => {
    if (weightGrams === "") return NaN;
    const n = Number(weightGrams);
    return Number.isFinite(n) ? n : NaN;
  }, [weightGrams]);

  const finenessOptions = useMemo(() => {
    if (
      [
        "Beauty Bijoux",
        "Green Gold",
        "PV Accessories",
        "PV Fine Gold",
      ].includes(ledger)
    ) {
      return FINENESS_MAP_GOLD;
    }
    if (ledger === "Palladium") {
      return FINENESS_MAP_PALLADIUM;
    }
    if (ledger === "Platinum") {
      return FINENESS_MAP_PLATINUM;
    }
    return [];
  }, [ledger]);

  /* -----------------------
     Reference uniqueness check (เฉพาะ create เท่านั้น)
     - ในโหมด edit เราจะ disable ช่อง reference จึงไม่ต้องเช็ค
  ----------------------- */
  useEffect(() => {
    // ถ้าเป็นโหมด edit และยังไม่เปลี่ยน (ช่อง disabled) ให้ข้ามการเช็คทั้งหมด
    if (mode === "edit") {
      setCheckingRef(false);
      setRefUnique(true);
      return;
    }

    latestRef.current = reference;
    if (reference.trim() === "") {
      setCheckingRef(false);
      setRefUnique(null);
      return;
    }

    // basic client validation
    if (!/^[A-Za-z0-9_\-\s\/]+$/.test(reference) || reference.length > 100) {
      setRefUnique(null);
      setCheckingRef(false);
      return;
    }

    let mounted = true;
    setCheckingRef(true);
    setRefUnique(null);

    const timer = window.setTimeout(async () => {
      try {
        const refToCheck = reference.trim();
        latestRef.current = refToCheck;
        const isUnique = await checkReferenceUniqueRemote(refToCheck);
        if (!mounted) return;
        if (latestRef.current !== refToCheck) return;
        setRefUnique(Boolean(isUnique));
      } catch (err) {
        console.error("Reference check failed:", err);
        if (mounted) setRefUnique(false);
      } finally {
        if (mounted) setCheckingRef(false);
      }
    }, 400);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [reference, mode]);

  useEffect(() => {
    /* (Reset Status - เหมือนเดิม) */
  }, [direction, isInitialLoad, mode]);
  useEffect(() => {
    /* (Reset Fineness - เหมือนเดิม) */
  }, [ledger, isInitialLoad, mode]);

  // Validation Logic (useMemo)
  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    const today = getTodayISO();

    // (Date, Reference, Direction, Weight, Ledger - เหมือนเดิม)
    if (date.trim() === "") e.date = t("validation.required");
    else if (!isValidIsoDate(date)) e.date = t("validation.date.invalidFormat");
    else if (date > today) e.date = t("validation.date.future");
    else if (date < COMPANY_FOUNDED)
      e.date = t("validation.date.tooOld", { date: "11/03/1991" });

    if (reference.trim() === "") e.reference = t("validation.required");
    else if (reference.length > 100)
      e.reference = t("validation.ref.maxLength");
    else if (!/^[A-Za-z0-9_\-\s\/]+$/.test(reference))
      e.reference = t("validation.ref.pattern");

    if (direction === "") e.direction = t("validation.required");

    if (weightGrams.trim() === "") e.weight = t("validation.required");
    else if (weightNumGrams <= 0) e.weight = t("validation.weight.positive");
    else if (weightNumGrams > 9999999.999)
      e.weight = t("validation.weight.max");

    if (ledger.trim() === "") e.ledger = t("validation.required");

    // validation ของ Loss (กลับไปเป็นแบบ %)
    if (calculatedLoss.trim() !== "") {
      const dec = toDecimalFromPercentInput(calculatedLoss);
      if (dec === null) e.calculated_loss = t("validation.loss.invalidFormat");
      else if (dec < 0 || dec > 1)
        // (0% - 100%)
        e.calculated_loss = t("validation.loss.range");
    }

    return e;
  }, [
    date,
    reference,
    direction,
    weightGrams,
    weightNumGrams,
    ledger,
    calculatedLoss,
    t,
  ]);

  const canSubmit =
    Object.keys(errors).length === 0 && !checkingRef && refUnique !== false;

  // --- 💅 CSS Classes (ลบ readOnlyStyle) ---
  const inputStyle =
    "block w-full p-2 text-gray-900 border border-gray-300 rounded-md bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500";
  const errorStyle = "border-red-500 ring-2 ring-red-100 border-2";

  // ฟังก์ชันรีเซ็ตฟอร์ม (เรียกได้ทั้งตอน create และหลัง submit สำเร็จ)
  function handleReset() {
    setShowErrors(false);
    setDate(defaultValues?.timestamp_tz?.slice(0, 10) || getTodayISO());
    setReference(defaultValues?.reference_number || "");
    // direction reset: same logic as useEffect
    if (defaultValues) {
      if (
        defaultValues.gold_out_grams != null &&
        Number(defaultValues.gold_out_grams) > 0
      ) {
        setDirection("OUT");
      } else if (
        defaultValues.gold_in_grams != null &&
        Number(defaultValues.gold_in_grams) > 0
      ) {
        setDirection("IN");
      } else if (defaultValues.net_gold_grams != null) {
        setDirection(Number(defaultValues.net_gold_grams) < 0 ? "OUT" : "IN");
      } else {
        setDirection("");
      }
    } else {
      setDirection("");
    }

    // weight reset (รองรับ gold_in / gold_out / net_gold_grams)
    if (
      defaultValues?.gold_in_grams != null &&
      Number(defaultValues.gold_in_grams) > 0
    ) {
      setWeightGrams(String(defaultValues.gold_in_grams));
    } else if (
      defaultValues?.gold_out_grams != null &&
      Number(defaultValues.gold_out_grams) > 0
    ) {
      setWeightGrams(String(defaultValues.gold_out_grams));
    } else if (defaultValues?.net_gold_grams != null) {
      setWeightGrams(String(Math.abs(Number(defaultValues.net_gold_grams))));
    } else {
      setWeightGrams("");
    }

    setLedger(defaultValues?.ledger || "");
    setRemarks(defaultValues?.remarks || "");

    const defaultLoss =
      defaultValues?.calculated_loss === null ||
      defaultValues?.calculated_loss === undefined
        ? ""
        : (Number(defaultValues.calculated_loss) * 100).toFixed(2);
    setCalculatedLoss(defaultLoss);

    setRelatedReference(defaultValues?.related_reference_number || "");
    setCounterpart(defaultValues?.counterpart || "");
    setFineness(
      defaultValues?.fineness != null ? String(defaultValues.fineness) : ""
    );
    setGoodDetails(defaultValues?.good_details || "");

    // reset status (normalize same as useEffect)
    const rawStatus = defaultValues?.status ?? "";
    if (typeof rawStatus === "string" && rawStatus.trim() !== "") {
      const s = rawStatus.trim();
      const normalized = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
      if (
        ["Purchased", "Received", "Invoiced", "Returned"].includes(normalized)
      ) {
        setStatus(normalized);
      } else {
        setStatus(s);
      }
    } else {
      setStatus("");
    }

    setShippingAgent(defaultValues?.shipping_agent || "");
    setRefUnique(mode === "edit" ? true : null);
    setCheckingRef(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) {
      setShowErrors(true);
      return;
    }

    try {
      setIsSubmitting(true);
      const gold_in_grams = direction === "IN" ? Number(weightGrams) : 0;
      const gold_out_grams = direction === "OUT" ? Number(weightGrams) : 0;
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

      // ✅ (แก้ไข) 14. แปลง % กลับเป็น Decimal
      const decimalLoss = toDecimalFromPercentInput(calculatedLoss);

      // (อัปเดต DTO)
      const dto = {
        timestamp_tz: timestamp.toISOString(),
        reference_number: reference.trim(),
        ledger: ledger,
        gold_in_grams,
        gold_out_grams,
        calculated_loss: decimalLoss, // 👈 (ส่ง Decimal % ไป Backend)
        fineness: fineness || null,
        counterpart: counterpart || null,
        good_details: goodDetails || null,
        status: status || null,
        shipping_agent: shippingAgent || null,
        related_reference_number: relatedReference || null,
        remarks: remarks || null,
      };

      // ---------- สำคัญ ----------
      // ถ้าเป็นโหมด edit เราต้องการป้องกันการเปลี่ยน reference_number
      // ให้ลบฟิลด์ reference_number ออกจาก dto ก่อนส่ง (repo จะอัปเดตเฉพาะ field ที่ส่งมา)
      if (mode === "edit") {
        delete dto.reference_number;
      }

      // เรียก onSubmit (api client ของคุณ)
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

  // Cancel edit handler: ถ้ามี parent callback ให้เรียก ถ้าไม่มีก็ reset form เป็นค่า default (fallback)
  function handleCancelEdit() {
    if (typeof onCancel === "function") {
      onCancel();
    } else {
      // fallback: รีเซ็ต form เป็นค่า defaultValues และ set mode local เป็น create ไม่ได้เพราะ mode มาจาก prop
      // แต่ at least clear visible fields
      handleReset();
    }
  }

  // --- Helpers ---
  const ErrorMessage = ({ field }: { field: string }) => {
    if (!showErrors || !errors[field]) return null;
    return <p className="mt-1 text-sm text-red-600">{errors[field]}</p>;
  };

  return (
    <div className="border border-gray-200 bg-white rounded-2xl p-4">
      <div className="flex justify-between p-4">
        <h5
          className="mb-4 text-2xl font-semibold text-gray-700 md:text-xl lg:text-3xl"
          style={{ marginBottom: "0" }}
        >
          {mode === "edit"
            ? `${t("form.title.edit")}`
            : `${t("form.title.new")}`}
        </h5>

        {/* --- ถ้า edit ให้โชว์ปุ่ม Cancel Edit ทางขวา --- */}
        {mode === "edit" && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="rounded-lg px-3 py-2 text-sm border border-gray-200 hover:bg-gray-50"
            >
              {t("form.cancel_edit") || "Cancel Edit"}
            </button>
          </div>
        )}
      </div>

      <form
        onSubmit={submit}
        className="grid grid-cols-1 gap-4 md:grid-cols-12 p-4"
      >
        {/* date */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">
            {" "}
            {t("form.date")} <span className="text-red-600"> *</span>{" "}
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

        {/* (ledger */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">
            {" "}
            {t("form.ledger")} <span className="text-red-600"> *</span>{" "}
          </label>
          <select
            className={`${inputStyle} ${
              showErrors && errors.ledger ? errorStyle : ""
            }`}
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
          <ErrorMessage field="ledger" />
        </div>

        {/* fineness */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">
            {" "}
            {t("form.fineness")}{" "}
          </label>
          <select
            className={inputStyle}
            value={fineness} // 👈 (State คือ "333")
            onChange={(e) => setFineness(e.target.value)} // 👈 (Save "333")
            disabled={!ledger}
          >
            <option value="">
              {" "}
              {ledger
                ? t("form.fineness_options.select_one")
                : t("form.fineness_options.select_ledger_first")}{" "}
            </option>
            {finenessOptions.map((option) => (
              <option key={option.label} value={option.value}>
                {" "}
                {/* 👈 value={333} */}
                {option.label} {/* 👈 ผู้ใช้เห็น '8K' */}
              </option>
            ))}
          </select>
        </div>

        {/* reference number (แก้ไข: disable เมื่อ mode === 'edit') */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">
            {t("form.reference")} <span className="text-red-600"> *</span>
          </label>

          {/* 
          - disabled เมื่อแก้ไข (mode === 'edit') 
          - ไม่ใช้ errorStyle เมื่อ duplicate (duplicate เป็น warning เท่านั้น)
          - แต่ยังแสดง validation error (required/format) หากกด submit โดยไม่มีค่า
        */}
          <input
            className={`${inputStyle} ${
              showErrors && errors.reference ? errorStyle : ""
            } ${mode === "edit" ? "bg-gray-100 cursor-not-allowed" : ""}`}
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            maxLength={100}
            aria-invalid={Boolean(showErrors && errors.reference)}
            aria-describedby="ref-feedback"
            disabled={mode === "edit"}
          />

          {/* ข้อความอธิบายเมื่ออยู่ในโหมดแก้ไข */}
          {mode === "edit" && (
            <p className="mt-1 text-xs text-gray-500">
              {t("form.reference_number_readonly")}
            </p>
          )}

          {/* checking state (เฉพาะ create) */}
          {checkingRef && mode !== "edit" && (
            <p className="mt-1 text-xs text-gray-500">
              {t("form.reference_number_checking")}
            </p>
          )}

          {/* duplicate warning -> แต่ input จะไม่เป็น border แดง */}
          {refUnique === false && !checkingRef && mode !== "edit" && (
            <div
              id="ref-feedback-dup"
              role="alert"
              aria-live="polite"
              className="mt-2 p-3 mb-3 text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg"
            >
              <span className="font-medium">Warning</span>
              <span className="ml-1">{t("form.reference_number_exists")}</span>
            </div>
          )}

          <ErrorMessage field="reference" />
        </div>

        {/* related reference number */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">
            {" "}
            {t("form.related_reference")}{" "}
          </label>
          <input
            className={inputStyle}
            value={relatedReference}
            onChange={(e) => setRelatedReference(e.target.value)}
          />
        </div>

        {/* counterpart  */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">
            {" "}
            {t("form.counterpart")}{" "}
          </label>
          <select
            className={inputStyle}
            value={counterpart}
            onChange={(e) => setCounterpart(e.target.value)}
          >
            <option value="">Select...</option>
            {COUNTERPART_LIST.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Good Details */}
        <div className="md:col-span-4">
          <label className="block text-sm font-medium">
            {t("form.good_details")}
          </label>
          <textarea
            rows={1}
            className={inputStyle}
            value={goodDetails}
            onChange={(e) => setGoodDetails(e.target.value)}
          />
        </div>

        {/* direction (IN, OUT) */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">
            {" "}
            {t("form.direction")} <span className="text-red-600"> *</span>{" "}
          </label>
          <div className={`flex gap-2`}>
            <button
              type="button"
              onClick={() => setDirection("IN")}
              className={`flex-1 rounded-xl border border-gray-200 p-2 ${
                direction === "IN"
                  ? "border-green-600 ring-2 ring-green-200"
                  : "hover:bg-gray-50"
              }`}
            >
              {" "}
              {t("form.in")}{" "}
            </button>
            <button
              type="button"
              onClick={() => setDirection("OUT")}
              className={`flex-1 rounded-xl border border-gray-200 p-2 ${
                direction === "OUT"
                  ? "border-red-600 ring-2 ring-red-200"
                  : "hover:bg-gray-50"
              }`}
            >
              {" "}
              {t("form.out")}{" "}
            </button>
          </div>
          <ErrorMessage field="direction" />
        </div>

        {/* Weight (Grams) */}
        <div className="md:col-span-1">
          <label className="block text-sm font-medium">
            {t("form.net_weight")}
            <span className="text-red-600"> *</span>
          </label>
          <input
            type="number"
            step="0.001"
            className={`${inputStyle} ${
              showErrors && errors.weight ? errorStyle : ""
            }`}
            value={weightGrams}
            onChange={(e) => setWeightGrams(e.target.value)}
          />
          <ErrorMessage field="weight" />
        </div>

        {/* Status */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">
            {" "}
            {t("form.status")}{" "}
          </label>
          <select
            className={inputStyle}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={!direction}
          >
            <option value="">
              {" "}
              {direction
                ? t("form.status_options.select_one")
                : t("form.status_options.select_direction_first")}{" "}
            </option>
            {direction === "IN" &&
              STATUS_OPTIONS_IN.map((opt) => (
                <option key={opt} value={opt}>
                  {t(`form.status_options.${opt.toLowerCase()}`)}
                </option>
              ))}
            {direction === "OUT" &&
              STATUS_OPTIONS_OUT.map((opt) => (
                <option key={opt} value={opt}>
                  {t(`form.status_options.${opt.toLowerCase()}`)}
                </option>
              ))}
          </select>
        </div>

        {/* Calculated Loss (Percent) */}
        <div className="md:col-span-1">
          <label className="block text-sm font-medium">
            {" "}
            {t("form.calculated_loss_percent")}{" "}
          </label>
          <input
            type="text"
            className={`${inputStyle} ${
              showErrors && errors.calculated_loss ? errorStyle : ""
            }`}
            value={calculatedLoss}
            onChange={(e) => {
              setCalculatedLoss(e.target.value);
            }}
            placeholder="e.g. 0.5%"
          />
          <ErrorMessage field="calculated_loss" />
        </div>

        {/* Shipping Agent */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">
            {" "}
            {t("form.shipping_agent")}{" "}
          </label>
          <select
            className={inputStyle}
            value={shippingAgent}
            onChange={(e) => setShippingAgent(e.target.value)}
          >
            <option value="">Select...</option>
            {SHIPPING_AGENT_LIST.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Remarks */}
        <div className="md:col-span-4">
          <label className="block text-sm font-medium">
            {t("form.remarks")}
          </label>
          <textarea
            rows={4}
            className={inputStyle}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div className="md:col-span-12 flex justify-end gap-2 self-end">
          <button
            type="button"
            className="rounded-lg px-4 py-2 hover:bg-gray-50 text-sm p-2 border border-gray-200"
            onClick={handleReset}
          >
            {t("form.reset")}
          </button>
          {/* เมื่ออยู่ในโหมด edit เปลี่ยนปุ่มเป็น Update */}
          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className={`rounded-lg px-4 py-2 text-white text-sm ${
              !canSubmit || isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting
              ? t("form.saving")
              : mode === "edit"
              ? t("form.update") || "Update"
              : t("form.save") || "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
