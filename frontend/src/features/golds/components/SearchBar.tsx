import { useTranslation } from "react-i18next";
import { useRef, useState } from "react";
import { LEDGERS, SHIPPING_AGENT_LIST, COUNTERPART_LIST } from "../types";
import { FaFilterCircleXmark } from "react-icons/fa6";

// กำหนดค่าเริ่มต้นสำหรับ Reset
const initialState = {
  from: "",
  to: "",
  reference_number: "",
  counterpart: "",
  ledger: "",
  shipping_agent: "",
};

export default function SearchBar({
  onChange,
  onSubmit,
}: {
  onChange: (f: any) => void;
  onSubmit: () => void;
}) {
  const { t } = useTranslation("common");

  // Internal state สำหรับเก็บค่า filters
  const [filters, setFilters] = useState(initialState);

  // สร้าง Refs สำหรับทุก Input
  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);
  const refRef = useRef<HTMLInputElement>(null);
  const counterpartRef = useRef<HTMLSelectElement>(null);
  const ledRef = useRef<HTMLSelectElement>(null);
  const shippingAgentRef = useRef<HTMLSelectElement>(null);

  const inputStyle =
    "block w-full p-2 text-gray-900 border border-gray-300 rounded-md bg-white text-base focus:ring-blue-500 focus:border-blue-500";

  // Helper Func
  /** ดึงค่าวันที่ปัจจุบันในรูปแบบ YYYY-MM-DD */
  function getTodayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  // handleChange ที่อัปเดตทั้ง internal state และ parent
  const handleChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onChange(newFilters);
  };

  function handleClear() {
    // Reset state
    setFilters(initialState);
    onChange(initialState);

    // ล้างค่าในช่องกรอก (DOM)
    if (fromRef.current) fromRef.current.value = "";
    if (toRef.current) toRef.current.value = "";
    if (refRef.current) refRef.current.value = "";
    if (counterpartRef.current) counterpartRef.current.value = "";
    if (ledRef.current) ledRef.current.value = "";
    if (shippingAgentRef.current) shippingAgentRef.current.value = "";
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="grid grid-cols-1 gap-4 rounded-2xl border-gray-200 bg-white p-4 md:grid-cols-12 mt-5"
    >
      {/* From Date */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium">{t("search.from")}</label>
        <input
          ref={fromRef}
          type="date"
          className={inputStyle}
          max={getTodayISO()}
          onChange={(e) => handleChange("from", e.target.value)}
        />
      </div>

      {/* To Date */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium">{t("search.to")}</label>
        <input
          ref={toRef}
          type="date"
          className={inputStyle}
          max={getTodayISO()}
          // ห้ามเลือกวันย้อนหลังไปกว่าวันที่เริ่มต้น (From)
          min={filters.from}
          onChange={(e) => handleChange("to", e.target.value)}
        />
      </div>

      {/* Ledger */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium">
          {t("search.ledger")}
        </label>
        <select
          ref={ledRef}
          className={inputStyle}
          onChange={(e) => handleChange("ledger", e.target.value)}
        >
          <option value="">{t("search.all")}</option>
          {LEDGERS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {/* Reference Number */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium">
          {t("search.reference")}
        </label>
        <input
          ref={refRef}
          className={inputStyle}
          onChange={(e) => handleChange("reference_number", e.target.value)}
        />
      </div>

      {/* Counterpart */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium">
          {t("search.counterpart")}
        </label>
        <select
          ref={counterpartRef}
          className={inputStyle}
          onChange={(e) => handleChange("counterpart", e.target.value)}
        >
          <option value="">{t("search.all")}</option>
          {COUNTERPART_LIST.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Shipping Agent */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium">
          {t("search.shipping_agent")}
        </label>
        <select
          ref={shippingAgentRef}
          className={inputStyle}
          onChange={(e) => handleChange("shipping_agent", e.target.value)}
        >
          <option value="">{t("search.all")}</option>
          {SHIPPING_AGENT_LIST.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>


      {/* Clear Buttons */}
      <div className="md:col-span-12 flex items-end justify-end gap-2">
        <button
          type="button"
          onClick={handleClear}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <FaFilterCircleXmark />
          {t("search.clear")}
        </button>
      </div>
    </form>
  );
}
