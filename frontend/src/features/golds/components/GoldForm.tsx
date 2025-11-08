// ✅ ฟอร์ม Create/Edit — กรอกวันที่, เลขอ้างอิง, ทิศทาง IN/OUT, น้ำหนัก, ledger, details, remarks
// หมายเหตุ: ทำเวอร์ชันง่ายก่อน (useState) — ภายหลังอัปเกรดเป็น react-hook-form + zod ได้
import { useState, useMemo, useEffect } from "react"; // 1. Import useEffect
import { useTranslation } from "react-i18next";

// --- ✅ 1. เพิ่มค่าคงที่และฟังก์ชัน Helpers (นอก Component) ---
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
  if (v == null || v === "") return null; // อนุญาตสตริงว่าง
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

// --- ✅ 2. เพิ่ม Helpers สำหรับ Calculated Loss (ตาม Spec) ---

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
    if (isExport) return 0.10;
  }
  return null; // Ledgers อื่นๆ ให้เป็นค่าว่าง
}
// --- จบส่วน Helpers ---

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

  // ✅ สร้าง state จาก defaultValues (ถ้ามี)
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
  const [weight, setWeight] = useState(
    defaultValues
      ? String(
          defaultValues.gold_in_grams || defaultValues.gold_out_grams || ""
        )
      : ""
  );
  const [ledger, setLedger] = useState(defaultValues?.ledger || "");
  const [details, setDetails] = useState(defaultValues?.details || "");
  const [remarks, setRemarks] = useState(defaultValues?.remarks || "");
  const [category, setCategory] = useState(defaultValues?.category || "");

  // --- ✅ 3. อัปเดต State สำหรับ Calculated Loss (ให้เก็บเป็น Display String) ---
  const [calculatedLoss, setCalculatedLoss] = useState(() => {
    // แปลง Decimal (0.06) จาก DB มาเป็น String ("6.00") เพื่อแสดงผล
    if (
      defaultValues?.calculated_loss === null ||
      defaultValues?.calculated_loss === undefined
    ) {
      return "";
    }
    return (Number(defaultValues.calculated_loss) * 100).toFixed(2);
  });
  // State เพื่อติดตามว่าผู้ใช้ได้แก้ไขฟิลด์นี้เองหรือยัง (เพื่อหยุด Auto-fill)
  const [lossManuallySet, setLossManuallySet] = useState(mode === "edit");

  // --- State สำหรับจัดการ Validation ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false); // State เพื่อบอกว่า "ให้เริ่มแสดง Error ได้"

  // --- ✅ 4. เพิ่ม Auto-fill Logic (useEffect) ---
  useEffect(() => {
    // ถ้าผู้ใช้พิมพ์เองแล้ว หรืออยู่ในโหมด Edit ให้หยุด
    if (lossManuallySet) return;

    const inferredDecimal = inferCalculatedLoss(ledger, reference);
    if (inferredDecimal !== null) {
      // Auto-fill ค่าที่ได้ (เช่น 0.10) เป็น Display String ("10.00")
      setCalculatedLoss((inferredDecimal * 100).toFixed(2));
    } else {
      // ถ้าเปลี่ยน Ledger แล้วไม่มีกฎ ให้ล้างค่า (ถ้ายังไม่ถูกพิมพ์)
      setCalculatedLoss("");
    }
  }, [ledger, reference, lossManuallySet]); // ทำงานเมื่อ Ledger หรือ Reference เปลี่ยน

  // 5. สร้าง Error Object แบบ Real-time
  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    const today = getTodayISO();

    if (date.trim() === "") {
      e.date = t("validation.required");
    } else if (!isValidIsoDate(date)) {
      e.date = t("validation.date.invalidFormat");
    } else if (date > today) {
      e.date = t("validation.date.future");
    } else if (date < COMPANY_FOUNDED) {
      e.date = t("validation.date.tooOld", { date: "11/03/1991" });
    }

    if (reference.trim() === "") e.reference = t("validation.required");
    if (direction === "") e.direction = t("validation.required");
    if (weight.trim() === "") e.weight = t("validation.required");
    else if (Number(weight) <= 0) e.weight = t("validation.weight.positive");
    if (category.trim() === "") e.category = t("validation.required");

    // --- ✅ 6. อัปเดต Validation สำหรับ Calculated Loss (ตาม Spec) ---
    if (calculatedLoss.trim() !== "") {
      const dec = toDecimalFromPercentInput(calculatedLoss);
      if (dec === null) {
        e.calculated_loss = t("validation.loss.invalidFormat"); // "Invalid percentage format"
      } else if (dec < 0 || dec > 1) {
        e.calculated_loss = t("validation.loss.range"); // "between 0% and 100%"
      }
    }

    return e;
  }, [date, reference, direction, weight, category, calculatedLoss, t]); // <-- เพิ่ม calculatedLoss และ t

  // 7. ตรวจสอบว่าฟอร์มพร้อมส่งหรือไม่
  const canSubmit = Object.keys(errors).length === 0;

  // --- 💅 CSS Classes ที่คุณกำหนด (ไม่เปลี่ยนแปลง) ---
  const inputStyle =
    "block w-full p-2 text-gray-900 border border-gray-300 rounded-md bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500";
  const errorStyle = "border-red-500 ring-2 ring-red-100 border-2";
  // --- จบส่วน CSS ---

  // ✅ 8. อัปเดตฟังก์ชัน Reset
  function handleReset() {
    setShowErrors(false); // ซ่อน Error
    setDate(
      defaultValues?.timestamp_tz?.slice(0, 10) || getTodayISO()
    );
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

    // รีเซ็ต Calculated Loss กลับไปเป็นค่าเริ่มต้น
    const defaultLoss =
      defaultValues?.calculated_loss === null ||
      defaultValues?.calculated_loss === undefined
        ? ""
        : (Number(defaultValues.calculated_loss) * 100).toFixed(2);
    setCalculatedLoss(defaultLoss);
    setLossManuallySet(mode === "edit"); // ถ้าเป็นโหมด Edit ให้ถือว่า Manual (ไม่ Auto-fill)
  }

  // ✅ 9. อัปเดตฟังก์ชัน Submit
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
        ledger: ledger || null,
        remarks: remarks || null,
        category: category || null, // แก้ไขจากโค้ดเดิมของคุณ
        calculated_loss: decimalLoss, // ส่ง Decimal หรือ null
      };
      await onSubmit(dto);

      // รีเซ็ตฟอร์มเฉพาะโหมด 'create'
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
      <div className="md:col-span-2">
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

      <div className="md:col-span-4">
        <label className="block text-sm font-medium">
          {t("form.reference")}
          <span className="text-red-600"> *</span>
        </label>
        <input
          className={`${inputStyle} ${
            showErrors && errors.reference ? errorStyle : ""
          }`}
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="INV-2025/BB-001"
        />
        <ErrorMessage field="reference" />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium">
          {t("form.direction")}
          <span className="text-red-600"> *</span>
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDirection("IN")}
            className={`flex-1 rounded-xl border border-gray-300 p-2 text-sm ${
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
            className={`flex-1 rounded-xl border border-gray-300 p-2 text-sm ${
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

      <div className="md:col-span-2">
        <label className="block text-sm font-medium">
          {t("form.weight")}
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

      {/* --- ⬇️ ฟิลด์ที่แก้ไข (ตาม Spec) ⬇️ --- */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium">
          {t("form.calculated_loss")}
        </label>
        <input
          type="text" // 1. เปลี่ยนเป็น "text"
          className={`${inputStyle} ${
            showErrors && errors.calculated_loss ? errorStyle : ""
          }`}
          value={calculatedLoss}
          onChange={(e) => {
            setCalculatedLoss(e.target.value);
            setLossManuallySet(true); // 2. ผู้ใช้พิมพ์เองแล้ว
          }}
          placeholder="e.g. 6% or 0.06" // 3. อัปเดต placeholder
        />
        <ErrorMessage field="calculated_loss" />
      </div>
      {/* --- ⬆️ จบฟิลด์ที่แก้ไข ⬆️ --- */}

      <div className="md:col-span-3">
        <label className="block text-sm font-medium">{t("form.ledger")}</label>
        <select
          className={inputStyle}
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
      </div>

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
      {/* --- จบส่วน JSX --- */}

      <div className="md:col-span-6">
        <label className="block text-sm font-medium">{t("form.details")}</label>
        <input
          className={inputStyle}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
      </div>

      <div className="md:col-span-6">
        <label className="block text-sm font-medium">{t("form.remarks")}</label>
        <textarea
          rows={2}
          className={inputStyle}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </div>

      <div className="md:col-span-12 flex justify-end gap-2">
        <button
          type="button" // ❗️ เปลี่ยนจาก "reset" เป็น "button"
          className="rounded-xl px-4 py-2 hover:bg-gray-50 text-sm"
          onClick={handleReset}
        >
          {t("form.reset")}
        </button>
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