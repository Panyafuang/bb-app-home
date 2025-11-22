import { useState, useMemo, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { checkRefUnique as apiCheckRefUnique } from "@/api/goldsClient";
// (สมมติว่าคุณมี utils นี้อยู่แล้ว ถ้าไม่มีให้ใช้ new Date().toISOString().slice(0, 10) แทน)
import { COMPANY_FOUNDED, getTodayISO } from "@/utils/utils"; 
import { LEDGERS, COUNTERPART_LIST, STATUS_OPTIONS_IN, STATUS_OPTIONS_OUT, SHIPPING_AGENT_LIST, FINENESS_MAP_GOLD, FINENESS_MAP_PALLADIUM, FINENESS_MAP_PLATINUM } from "../types";



/** (Helper) เช็ค format YYYY-MM-DD และวันที่ถูกต้อง */
function isValidIsoDate(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s).getTime());
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

/** (Helper) ตรวจสอบ Reference Unique (เชื่อม API จริง) */
async function checkReferenceUniqueRemote(reference: string): Promise<boolean> {
  try {
    const res = await apiCheckRefUnique(reference);
    if (typeof res === "boolean") return res;
    if (res && typeof res === "object") {
      if ("exists" in res) return !Boolean((res as any).exists);
      if ("isUnique" in res) return Boolean((res as any).isUnique);
      if ("unique" in res) return Boolean((res as any).unique);
    }
    return false;
  } catch (error) {
    console.error("Failed to check reference uniqueness", error);
    return false;
  }
}

/**
 * GoldForm Component
 */
export default function GoldForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
}: {
  mode: "create" | "edit";
  defaultValues?: any;
  onSubmit: (dto: any) => Promise<void>;
  onCancel?: () => void;
}) {
  const { t } = useTranslation("common");

  // ============================
  // Local state ของฟอร์ม
  // ============================
  const [date, setDate] = useState<string>(
    defaultValues?.timestamp_tz?.slice(0, 10) || getTodayISO()
  );
  const [reference, setReference] = useState(
    defaultValues?.reference_number || ""
  );
  const [direction, setDirection] = useState<"" | "IN" | "OUT">(
    defaultValues
      ? Number(defaultValues.gold_out_grams) > 0 ? "OUT" : "IN"
      : ""
  );
  const [weightGrams, setWeightGrams] = useState(
    defaultValues
      ? String( defaultValues.gold_in_grams || defaultValues.gold_out_grams || "" )
      : ""
  );
  const [ledger, setLedger] = useState(defaultValues?.ledger || "");
  
  // ✅ (แก้ไข) Fineness Value as String (e.g., "333")
  const [fineness, setFineness] = useState(
    defaultValues?.fineness != null ? String(defaultValues.fineness) : ""
  );
  
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

  // ✅ (แก้ไข) State สำหรับ Loss (คำนวณกลับจาก Grams -> % ตอนโหลด)
  // const [calculatedLoss, setCalculatedLoss] = useState(() => {
  //   const lossGrams = Number(defaultValues?.calculated_loss);
  //   const weight = Number(defaultValues?.gold_in_grams || defaultValues?.gold_out_grams);
    
  //   if (lossGrams && weight && weight > 0) {
  //     return ((lossGrams / weight) * 100).toFixed(2); 
  //   }
  //   return "";
  // });
  const [calculatedLoss, setCalculatedLoss] = useState(() => {
    const lossGrams = Number(defaultValues?.calculated_loss);
    const weight = Number(defaultValues?.gold_in_grams || defaultValues?.gold_out_grams);
    if (lossGrams && weight && weight > 0) {
      // คำนวณกลับเป็น % แล้วปัดเศษเป็นจำนวนเต็ม (Math.round) เพื่อตัดทศนิยมทิ้งตอนโหลด
      return Math.round((lossGrams / weight) * 100).toString();
    }
    return "";
  });

  // (State สำหรับ Validation)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [refUnique, setRefUnique] = useState<boolean | null>(
    mode === "edit" ? true : null
  );
  const [checkingRef, setCheckingRef] = useState(false);
  // const [isInitialLoad, setIsInitialLoad] = useState(true);
  // useEffect(() => { setIsInitialLoad(false); }, []);

  // Refs
  const latestRef = useRef<string>(reference);
  const defaultValuesRef = useRef<any | null>(defaultValues ?? null);
  useEffect(() => { defaultValuesRef.current = defaultValues ?? null; }, [defaultValues]);

  // ============================
  // Sync defaultValues -> local state (เมื่อกด Edit)
  // ============================
  useEffect(() => {
    if (!defaultValues) {
      if (mode === "create") handleReset();
      return;
    }

    if (mode === "edit") {
      setDate(defaultValues.timestamp_tz ? String(defaultValues.timestamp_tz).slice(0, 10) : getTodayISO());
      setReference(defaultValues.reference_number ?? "");

      // Direction
      if (defaultValues.gold_out_grams != null && Number(defaultValues.gold_out_grams) > 0) {
        setDirection("OUT");
      } else if (defaultValues.gold_in_grams != null && Number(defaultValues.gold_in_grams) > 0) {
        setDirection("IN");
      } else if (defaultValues.net_gold_grams != null) {
        setDirection(Number(defaultValues.net_gold_grams) < 0 ? "OUT" : "IN");
      } else {
        setDirection("");
      }

      // Weight
      if (defaultValues.gold_in_grams != null && Number(defaultValues.gold_in_grams) > 0) {
        setWeightGrams(String(defaultValues.gold_in_grams));
      } else if (defaultValues.gold_out_grams != null && Number(defaultValues.gold_out_grams) > 0) {
        setWeightGrams(String(defaultValues.gold_out_grams));
      } else if (defaultValues.net_gold_grams != null) {
        setWeightGrams(String(Math.abs(Number(defaultValues.net_gold_grams))));
      } else {
        setWeightGrams("");
      }

      setLedger(defaultValues.ledger ?? "");
      setFineness(defaultValues.fineness != null ? String(defaultValues.fineness) : "");
      setRelatedReference(defaultValues.related_reference_number ?? "");
      setCounterpart(defaultValues.counterpart ?? "");
      setGoodDetails(defaultValues.good_details ?? "");
      setShippingAgent(defaultValues.shipping_agent ?? "");
      setRemarks(defaultValues.remarks ?? "");

      // ✅ Loss: Grams -> Integer %
      const lossG = Number(defaultValues.calculated_loss);
      const w = Number(defaultValues.gold_in_grams || defaultValues.gold_out_grams);
      if (lossG && w > 0) setCalculatedLoss(Math.round((lossG / w) * 100).toString());
      else setCalculatedLoss("");

      // Status
      const rawStatus = defaultValues.status ?? "";
      if (typeof rawStatus === "string" && rawStatus.trim() !== "") {
        const s = rawStatus.trim();
        const normalized = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
        if (["Purchased", "Received", "Invoiced", "Returned"].includes(normalized)) {
          setStatus(normalized);
        } else {
          setStatus(s);
        }
      } else {
        setStatus("");
      }

      setRefUnique(true);
      setCheckingRef(false);
    } else if (mode === "create") {
      handleReset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues?.id, defaultValues?.timestamp_tz, mode]);

  // ============================
  // Derived state + helpers
  // ============================
  const weightNumGrams = useMemo(() => {
    if (weightGrams === "") return NaN;
    const n = Number(weightGrams);
    return Number.isFinite(n) ? n : NaN;
  }, [weightGrams]);

  // ✅ (อัปเดต) Fineness Options (Map)
  const finenessOptions = useMemo(() => {
    if (['Beauty Bijoux', 'Green Gold', 'PV Accessories', 'PV Fine Gold'].includes(ledger)) {
      return FINENESS_MAP_GOLD;
    }
    if (ledger === 'Palladium') {
      return FINENESS_MAP_PALLADIUM;
    }
    if (ledger === 'Platinum') {
      return FINENESS_MAP_PLATINUM;
    }
    return [];
  }, [ledger]);

  // Reference Check
  useEffect(() => {
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

  // Validation Logic
  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    const today = getTodayISO();

    if (date.trim() === "") e.date = t("validation.required");
    else if (!isValidIsoDate(date)) e.date = t("validation.date.invalidFormat");
    else if (date > today) e.date = t("validation.date.future");
    else if (date < COMPANY_FOUNDED) e.date = t("validation.date.tooOld", { date: "11/03/1991" });

    if (reference.trim() === "") e.reference = t("validation.required");
    else if (reference.length > 100) e.reference = t("validation.ref.maxLength");
    else if (!/^[A-Za-z0-9_\-\s\/]+$/.test(reference)) e.reference = t("validation.ref.pattern");

    if (direction === "") e.direction = t("validation.required");

    if (weightGrams.trim() === "") e.weight = t("validation.required");
    else if (weightNumGrams <= 0) e.weight = t("validation.weight.positive");
    else if (weightNumGrams > 9999999.999) e.weight = t("validation.weight.max");

    if (ledger.trim() === "") e.ledger = t("validation.required");

    // (Validate Loss %)
    if (calculatedLoss.trim() !== "") {
      const dec = toDecimalFromPercentInput(calculatedLoss);
      if (dec === null) e.calculated_loss = t("validation.loss.invalidFormat");
      else if (dec < 0 || dec > 1) e.calculated_loss = t("validation.loss.range");
    }

    return e;
  }, [date, reference, direction, weightGrams, weightNumGrams, ledger, calculatedLoss, t]);

  const canSubmit = Object.keys(errors).length === 0 && !checkingRef;

  // CSS
  const inputStyle = "block w-full p-2 text-gray-900 border border-gray-300 rounded-md bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500";
  const errorStyle = "border-red-500 ring-2 ring-red-100 border-2";

  // Reset Function
  function handleReset() {
    const dv = defaultValuesRef.current;
    setShowErrors(false);
    setDate(dv?.timestamp_tz?.slice(0, 10) || getTodayISO());
    setReference(dv?.reference_number || "");

    if (dv) {
      if (dv.gold_out_grams != null && Number(dv.gold_out_grams) > 0) setDirection("OUT");
      else if (dv.gold_in_grams != null && Number(dv.gold_in_grams) > 0) setDirection("IN");
      else if (dv.net_gold_grams != null) setDirection(Number(dv.net_gold_grams) < 0 ? "OUT" : "IN");
      else setDirection("");
    } else {
      setDirection("");
    }

    if (dv?.gold_in_grams != null && Number(dv.gold_in_grams) > 0) setWeightGrams(String(dv.gold_in_grams));
    else if (dv?.gold_out_grams != null && Number(dv.gold_out_grams) > 0) setWeightGrams(String(dv.gold_out_grams));
    else if (dv?.net_gold_grams != null) setWeightGrams(String(Math.abs(Number(dv.net_gold_grams))));
    else setWeightGrams("");

    setLedger(dv?.ledger || "");
    setRemarks(dv?.remarks || "");
    
    // ✅ (Reset Loss %)
    const lossG = Number(dv?.calculated_loss);
    const w = Number(dv?.gold_in_grams || dv?.gold_out_grams);
    if (lossG && w > 0) setCalculatedLoss(((lossG / w) * 100).toFixed(2));
    else setCalculatedLoss("");

    setRelatedReference(dv?.related_reference_number || "");
    setCounterpart(dv?.counterpart || "");
    setFineness(dv?.fineness != null ? String(dv.fineness) : "");
    setGoodDetails(dv?.good_details || "");

    const rawStatus = dv?.status ?? "";
    if (typeof rawStatus === "string" && rawStatus.trim() !== "") {
      const s = rawStatus.trim();
      const normalized = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
      if (["Purchased", "Received", "Invoiced", "Returned"].includes(normalized)) setStatus(normalized);
      else setStatus(s);
    } else {
      setStatus("");
    }

    setShippingAgent(dv?.shipping_agent || "");
    setRefUnique(mode === "edit" ? true : null);
    setCheckingRef(false);
  }

  // Submit Function
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) { setShowErrors(true); return; }

    try {
      setIsSubmitting(true);
      const now = new Date();
      const dateParts = date.split("-").map(Number);
      const timestamp = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], now.getHours(), now.getMinutes(), now.getSeconds());

      const w = Number(weightGrams);
      // ✅ (คำนวณ) แปลง % เป็น Grams
      let lossGramsToSend = null;
      const lossDecimal = toDecimalFromPercentInput(calculatedLoss); 
      if (lossDecimal !== null && !Number.isNaN(w)) {
        // สูตร: น้ำหนัก * decimal (เช่น 2.000 * 0.50 = 1.000)
        // ❗️ ปัดเศษให้เหลือ 2 ตำแหน่ง
        lossGramsToSend = Number((w * lossDecimal).toFixed(2));
      }

      const dto: any = {
        timestamp_tz: timestamp.toISOString(),
        reference_number: reference.trim(),
        ledger: ledger,
        gold_in_grams: direction === "IN" ? w : 0,
        gold_out_grams: direction === "OUT" ? w : 0,
        calculated_loss: lossGramsToSend, // 👈 (ส่ง Grams)
        fineness: parseNumber(fineness), // 👈 (ส่ง Number)
        counterpart: counterpart || null,
        good_details: goodDetails || null,
        status: status || null,
        shipping_agent: shippingAgent || null,
        related_reference_number: relatedReference || null,
        remarks: remarks || null,
      };

      if (mode === "edit") {
        delete dto.reference_number;
      }

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

  function handleCancelEdit() {
    if (typeof onCancel === "function") {
      onCancel();
    } else {
      handleReset();
    }
  }

  const ErrorMessage = ({ field }: { field: string }) => {
    if (!showErrors || !errors[field]) return null;
    return <p className="mt-1 text-sm text-red-600">{errors[field]}</p>;
  };

  return (
    <div className="border border-gray-200 bg-white rounded-2xl p-4">
      <div className="flex justify-between p-4">
        <h5 className="mb-4 text-2xl font-semibold text-gray-700 md:text-xl lg:text-3xl" style={{ marginBottom: "0" }}>
          {mode === "edit" ? `${t("form.title.edit")}` : `${t("form.title.new")}`}
        </h5>
        {mode === "edit" && (
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleCancelEdit} className="rounded-lg px-3 py-2 text-sm border border-gray-200 hover:bg-gray-50">
              {t("form.cancel_edit") || "Cancel Edit"}
            </button>
          </div>
        )}
      </div>

      <form onSubmit={submit} className="grid grid-cols-1 gap-4 md:grid-cols-12 p-4">
        {/* date */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium"> {t("form.date")} <span className="text-red-600"> *</span> </label>
          <input type="date" className={`${inputStyle} ${showErrors && errors.date ? errorStyle : ""}`} value={date} onChange={(e) => setDate(e.target.value)} max={getTodayISO()} min={COMPANY_FOUNDED} />
          <ErrorMessage field="date" />
        </div>

        {/* ledger */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium"> {t("form.ledger")} <span className="text-red-600"> *</span> </label>
          <select className={`${inputStyle} ${showErrors && errors.ledger ? errorStyle : ""}`} value={ledger} onChange={(e) => setLedger(e.target.value)}>
            <option value="">Select…</option>
            {LEDGERS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <ErrorMessage field="ledger" />
        </div>

        {/* fineness */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium"> {t("form.fineness")} </label>
          <select className={inputStyle} value={fineness} onChange={(e) => setFineness(e.target.value)} disabled={!ledger}>
            <option value=""> {ledger ? t("form.fineness_options.select_one") : t("form.fineness_options.select_ledger_first")} </option>
            {finenessOptions.map((option) => (
              <option key={option.label} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* reference */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium"> {t("form.reference")} <span className="text-red-600"> *</span> </label>
          <input className={`${inputStyle} ${(showErrors && errors.reference) ? errorStyle : ""} ${mode === "edit" ? "bg-gray-100 cursor-not-allowed" : ""}`} value={reference} onChange={(e) => setReference(e.target.value)} maxLength={100} disabled={mode === "edit"} />
          {mode === "edit" && <p className="mt-1 text-xs text-gray-500">{t("form.reference_number_readonly") || "Reference number ไม่สามารถแก้ไขได้หลังการสร้าง"}</p>}
          {checkingRef && mode !== "edit" && <p className="mt-1 text-xs text-gray-500">{t("form.reference_number_checking")}</p>}
          {refUnique === false && !checkingRef && mode !== "edit" && (
            <div className="mt-2 p-3 mb-3 text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="font-medium">Warning</span> <span className="ml-1">{t("form.reference_number_exists")}</span>
            </div>
          )}
          <ErrorMessage field="reference" />
        </div>

        {/* related reference */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium"> {t("form.related_reference")} </label>
          <input className={inputStyle} value={relatedReference} onChange={(e) => setRelatedReference(e.target.value)} />
        </div>

        {/* counterpart */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium"> {t("form.counterpart")} </label>
          <select className={inputStyle} value={counterpart} onChange={(e) => setCounterpart(e.target.value)}>
            <option value="">Select...</option>
            {COUNTERPART_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>


        {/* direction */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium"> {t("form.direction")} <span className="text-red-600"> *</span> </label>
          <div className={`flex gap-2`}>
            <button type="button" onClick={() => setDirection("IN")} className={`flex-1 rounded-xl border border-gray-200 p-2 ${direction === "IN" ? "border-green-600 ring-2 ring-green-200" : "hover:bg-gray-50"}`}>{t("form.in")}</button>
            <button type="button" onClick={() => setDirection("OUT")} className={`flex-1 rounded-xl border border-gray-200 p-2 ${direction === "OUT" ? "border-red-600 ring-2 ring-red-200" : "hover:bg-gray-50"}`}>{t("form.out")}</button>
          </div>
          <ErrorMessage field="direction" />
        </div>

        {/* Weight */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium"> {t("form.net_weight")} <span className="text-red-600"> *</span> </label>
          <input type="number" step="0.001" className={`${inputStyle} ${showErrors && errors.weight ? errorStyle : ""}`} value={weightGrams} onChange={(e) => setWeightGrams(e.target.value)} />
          <ErrorMessage field="weight" />
        </div>


        {/* status */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium"> {t("form.status")} </label>
          <select className={inputStyle} value={status} onChange={(e) => setStatus(e.target.value)} disabled={!direction}>
            <option value="">{direction ? t("form.status_options.select_one") : t("form.status_options.select_direction_first")}</option>
            {direction === "IN" && STATUS_OPTIONS_IN.map((opt) => <option key={opt} value={opt}>{t(`form.status_options.${opt.toLowerCase()}`)}</option>)}
            {direction === "OUT" && STATUS_OPTIONS_OUT.map((opt) => <option key={opt} value={opt}>{t(`form.status_options.${opt.toLowerCase()}`)}</option>)}
          </select>
        </div>

        {/* Calculated Loss */}
        {/* <div className="md:col-span-3">
          <label className="block text-sm font-medium"> {t("form.calculated_loss_percent")} </label>
          <input type="text" className={`${inputStyle} ${showErrors && errors.calculated_loss ? errorStyle : ""}`} value={calculatedLoss} onChange={(e) => setCalculatedLoss(e.target.value)} placeholder="e.g. 5%" />
          <ErrorMessage field="calculated_loss" />
        </div> */}

        {/* ✅ Calculated Loss (Integer Only 0-100) */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium"> {t("form.calculated_loss_percent")} </label>
          <input 
            type="text" // ใช้ text เพื่อควบคุม input ได้ดีกว่า
            className={`${inputStyle} ${showErrors && errors.calculated_loss ? errorStyle : ""}`} 
            value={calculatedLoss} 
            onChange={(e) => {
              // ✅ Logic ล็อกให้พิมพ์ได้แค่ตัวเลข 0-9 เท่านั้น (No dots, No commas)
              const val = e.target.value;
              if (val === "" || /^\d+$/.test(val)) {
                 // ถ้าเป็นตัวเลข เช็คว่าไม่เกิน 100
                 if (val === "" || (Number(val) >= 0 && Number(val) <= 100)) {
                    setCalculatedLoss(val);
                 }
              }
            }} 
            placeholder="0-100" 
          />
          <ErrorMessage field="calculated_loss" />
        </div>

        {/* Shipping Agent */}
        <div className="md:col-span-4">
          <label className="block text-sm font-medium"> {t("form.shipping_agent")} </label>
          <select className={inputStyle} value={shippingAgent} onChange={(e) => setShippingAgent(e.target.value)}>
            <option value="">Select...</option>
            {SHIPPING_AGENT_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Good Details */}
        <div className="md:col-span-6">
          <label className="block text-sm font-medium">{t("form.good_details")}</label>
          <textarea rows={4} className={inputStyle} value={goodDetails} onChange={(e) => setGoodDetails(e.target.value)} />
        </div>

        {/* Remarks */}
        <div className="md:col-span-6">
          <label className="block text-sm font-medium">{t("form.remarks")}</label>
          <textarea rows={4} className={inputStyle} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
        </div>

        {/* Buttons */}
        <div className="md:col-span-12 flex justify-end gap-2 self-end">
          <button type="button" className="rounded-lg px-4 py-2 hover:bg-gray-50 text-sm p-2 border border-gray-200" onClick={handleReset}>
            {t("form.reset")}
          </button>
          <button type="submit" disabled={!canSubmit || isSubmitting} className={`rounded-lg px-4 py-2 text-white text-sm ${!canSubmit || isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}>
            {isSubmitting ? t("form.saving") : mode === "edit" ? t("form.update") || "Update" : t("form.save") || "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}