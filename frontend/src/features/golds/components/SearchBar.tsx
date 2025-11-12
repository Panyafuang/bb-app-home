import { useTranslation } from "react-i18next";
import { useRef } from "react";
// --- 2. เพิ่ม Constants สำหรับ Dropdowns
const LEDGERS = [
  "Beauty Bijoux",
  "Green Gold",
  "Palladium",
  "Platinum",
  "PV Accessories",
  "PV Fine Gold",
] as const;

const SHIPPING_AGENT = [
  "FedEx",
  "DHL",
  "RK International",
  "Ferrari",
  "Brinks",
  "Kerry Express",
  "Flash Express",
  "Thialand Post",
  "Others",
] as const;

// 3. กำหนดค่าเริ่มต้นสำหรับ Reset
const initialState = {
  from: "",
  to: "",
  reference_number: "",
  category: "",
  ledger: "",
  gold_out_min: "",
  gold_out_max: "",
  net_out_min: "",
  net_out_max: "",
  calculated_loss: "",
};

export default function SearchBar({
  onChange,
  onSubmit,
}: {
  onChange: (f: any) => void;
  onSubmit: () => void;
}) {
  const { t } = useTranslation("common");

  // --- 4. สร้าง Refs สำหรับทุก Input ---
  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);
  const refRef = useRef<HTMLInputElement>(null);
  const catRef = useRef<HTMLSelectElement>(null);
  const ledRef = useRef<HTMLSelectElement>(null);
  const minRef = useRef<HTMLInputElement>(null);
  const maxRef = useRef<HTMLInputElement>(null);
  //   const minNetRef = useRef<HTMLInputElement>(null);
  //   const maxNetRef = useRef<HTMLInputElement>(null);
  const lossRef = useRef<HTMLInputElement>(null);

  const inputStyle =
    "block w-full p-2 text-gray-900 border border-gray-300 rounded-md bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500";

  function handleClear() {
    // 1. Reset state ใน Component แม่
    onChange(initialState);

    // 2. ล้างค่าในช่องกรอก (DOM) ด้วยตนเอง
    if (fromRef.current) fromRef.current.value = "";
    if (toRef.current) toRef.current.value = "";
    if (refRef.current) refRef.current.value = "";
    if (catRef.current) catRef.current.value = "";
    if (ledRef.current) ledRef.current.value = "";
    if (minRef.current) minRef.current.value = "";
    if (maxRef.current) maxRef.current.value = "";
    // if (minNetRef.current) minNetRef.current.value = "";
    // if (maxNetRef.current) maxNetRef.current.value = "";
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
      <div className="md:col-span-3">
        <label className="block text-sm font-medium">{t("search.from")}</label>
        <input
          ref={fromRef}
          type="date"
          className={inputStyle}
          onChange={(e) =>
            onChange((v: any) => ({ ...v, from: e.target.value }))
          }
        />
      </div>

      {/* To Date */}
      <div className="md:col-span-3">
        <label className="block text-sm font-medium">{t("search.to")}</label>
        <input
          ref={toRef}
          type="date"
          className={inputStyle}
          onChange={(e) => onChange((v: any) => ({ ...v, to: e.target.value }))}
        />
      </div>

      {/* Ledger */}
      <div className="md:col-span-3">
        <label className="block text-sm font-medium">
          {t("search.ledger")}
        </label>
        <select
          ref={ledRef} // เพิ่ม ref
          className={inputStyle}
          onChange={(e) =>
            onChange((v: any) => ({ ...v, ledger: e.target.value }))
          }
        >
          <option value="">{t("search.all")}</option>
          {LEDGERS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {/* Shipping Agent */}
      <div className="md:col-span-3">
        <label className="block text-sm font-medium">
          {t("search.ledger")}
        </label>
        <select
          ref={ledRef} // เพิ่ม ref
          className={inputStyle}
          onChange={(e) =>
            onChange((v: any) => ({ ...v, ledger: e.target.value }))
          }
        >
          <option value="">{t("search.all")}</option>
          {SHIPPING_AGENT.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {/* Ref. Num */}
      <div className="md:col-span-3">
        <label className="block text-sm font-medium">
          {t("search.reference")}
        </label>
        <input
          ref={refRef}
          className={inputStyle}
          onChange={(e) =>
            onChange((v: any) => ({ ...v, reference_number: e.target.value }))
          }
        />
      </div>

      {/* <div className="md:col-span-2">
        <label className="block text-sm font-medium">
          {t("search.gold_out_min")}
        </label>
        <input
          ref={minRef} // เพิ่ม ref
          type="number"
          step="0.001"
          className={inputStyle}
          onChange={(e) =>
            onChange((v: any) => ({ ...v, gold_out_min: e.target.value }))
          }
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium">
          {t("search.gold_out_max")}
        </label>
        <input
          ref={maxRef} // เพิ่ม ref
          type="number"
          step="0.001"
          className={inputStyle}
          onChange={(e) =>
            onChange((v: any) => ({ ...v, gold_out_max: e.target.value }))
          }
        />
      </div> */}

      {/* <div className="md:col-span-2">
        <label className="block text-sm font-medium">
          {t("search.net_gold_min")}
        </label>
        <input
          ref={minNetRef}
          type="number"
          step="0.001"
          className={inputStyle}
          onChange={(e) =>
            onChange((v: any) => ({ ...v, net_gold_min: e.target.value }))
          }
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium">
          {t("search.net_gold_max")}
        </label>
        <input
          ref={maxNetRef}
          type="number"
          step="0.001"
          className={inputStyle}
          onChange={(e) =>
            onChange((v: any) => ({ ...v, net_gold_max: e.target.value }))
          }
        />
      </div> */}

      <div className="md:col-span-12 flex items-end justify-end gap-2">
        {/* (ปุ่มใหม่) Clear */}
        <button
          type="button"
          onClick={handleClear}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          {t("search.clear")}
        </button>
      </div>
    </form>
  );
}
