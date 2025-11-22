import { useTranslation } from "react-i18next";
import { useMemo, useRef, useState, useEffect } from "react";
import {
  FINENESS_MAP_GOLD,
  FINENESS_MAP_PALLADIUM,
  FINENESS_MAP_PLATINUM,
  LEDGERS,
  SHIPPING_AGENT_LIST,
} from "../types";
import { FaFilterCircleXmark } from "react-icons/fa6";

// กำหนดค่าเริ่มต้นสำหรับ Reset
const initialState = {
  from: "",
  to: "",
  reference_number: "",
  counterpart: "",
  category: "",
  ledger: "",
  shipping_agent: "",
  gold_out_min: "",
  gold_out_max: "",
  net_out_min: "",
  net_out_max: "",
  calculated_loss: "",
  fineness: "",
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
  const counterpartRef = useRef<HTMLInputElement>(null);
  const catRef = useRef<HTMLSelectElement>(null);
  const ledRef = useRef<HTMLSelectElement>(null);
  const shippingAgentRef = useRef<HTMLSelectElement>(null);
  const finenessRef = useRef<HTMLSelectElement>(null);
  const minRef = useRef<HTMLInputElement>(null);
  const maxRef = useRef<HTMLInputElement>(null);
  const lossRef = useRef<HTMLInputElement>(null);

  const inputStyle =
    "block w-full p-2 text-gray-900 border border-gray-300 rounded-md bg-white text-base focus:ring-blue-500 focus:border-blue-500";

  // Derived state สำหรับ Fineness Options ตาม Ledger ที่เลือก
  const finenessOptions = useMemo(() => {
    const ledger = filters.ledger;
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
  }, [filters.ledger]);

  // Effect สำหรับ Reset Fineness เมื่อ Ledger เปลี่ยน
  useEffect(() => {
    if (filters.ledger) {
      const newFilters = { ...filters, fineness: "" };
      setFilters(newFilters);
      onChange(newFilters);
      if (finenessRef.current) finenessRef.current.value = "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.ledger]);

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
    if (catRef.current) catRef.current.value = "";
    if (ledRef.current) ledRef.current.value = "";
    if (shippingAgentRef.current) shippingAgentRef.current.value = "";
    if (finenessRef.current) finenessRef.current.value = "";
    if (minRef.current) minRef.current.value = "";
    if (maxRef.current) maxRef.current.value = "";
    if (lossRef.current) lossRef.current.value = "";
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
      <div className="md:col-span-1">
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
      <div className="md:col-span-1">
        <label className="block text-sm font-medium">{t("search.to")}</label>
        <input
          ref={toRef}
          type="date"
          className={inputStyle}
          max={getTodayISO()}
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
      {/* Fineness */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium">
          {t("search.fineness")}
        </label>
        <select
          ref={finenessRef}
          className={inputStyle}
          onChange={(e) => handleChange("fineness", e.target.value)}
          disabled={!filters.ledger}
        >
          <option value="">
            {filters.ledger ? t("search.all") : t("search.select_ledger_first")}
          </option>
          {finenessOptions.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
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
        <input
          ref={counterpartRef}
          className={inputStyle}
          onChange={(e) => handleChange("counterpart", e.target.value)}
        />
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
      {/* Buttons */}
      <div className="md:col-span-12 flex items-end justify-end gap-2">
        {/* Clear Button */}
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
