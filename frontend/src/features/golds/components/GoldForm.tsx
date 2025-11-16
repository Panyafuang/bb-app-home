// import { useState, useMemo, useEffect } from "react";
// import { useTranslation } from "react-i18next";

// import { checkRefUnique as apiCheckRefUnique } from "@/api/goldsClient";
// import { getTodayISO } from "@/utils/help";

// const LEDGERS = [
//   "Beauty Bijoux",
//   "Green Gold",
//   "Palladium",
//   "Platinum",
//   "PV Accessories",
//   "PV Fine Gold",
// ] as const;

// // (Constants สำหรับ Status/Fineness)
// const STATUS_OPTIONS_IN = ["Purchased", "Received"] as const;
// const STATUS_OPTIONS_OUT = ["Invoiced", "Returned"] as const;

// // (กลุ่ม Gold)
// export const FINENESS_MAP_GOLD = [
//   { label: "8K", value: 333 },
//   { label: "9K", value: 375 },
//   { label: "10K", value: 417 },
//   { label: "18K", value: 750 },
//   { label: "22K", value: 916 },
//   { label: "23K", value: 958 },
//   { label: "24K", value: 999 },
// ];
// // (กลุ่ม Palladium)
// export const FINENESS_MAP_PALLADIUM = [
//   { label: "14%", value: 140 },
//   { label: "95%", value: 950 },
// ];
// // (กลุ่ม Platinum)
// export const FINENESS_MAP_PLATINUM = [
//   { label: "14%", value: 140 },
//   { label: "95%", value: 950 },
// ];

// // Lists สำหรับ Dropdown (ตาม Requirement ใหม่)
// const COUNTERPART_LIST = [
//   "Nakagawa",
//   "Qnet",
//   "Paspaley",
//   "Poh Heng",
//   "Germany",
//   "BB stock",
//   "Aspial",
//   "Umicore",
//   "Others",
// ] as const;

// const SHIPPING_AGENT_LIST = [
//   "FedEx",
//   "DHL",
//   "RK International",
//   "Ferrari",
//   "Brinks",
//   "Kerry Express",
//   "Flash Express",
//   "Thailand Post",
//   "Others",
// ] as const;

// const COMPANY_FOUNDED = "1991-03-11";

// /** (Helper) เช็ค format YYYY-MM-DD และวันที่ถูกต้อง */
// function isValidIsoDate(s: string) {
//   return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s).getTime());
// }

// /** (Helper) แปลง Input "6" หรือ "6%" หรือ "0.06" ให้เป็น Decimal 0.06 */
// function toDecimalFromPercentInput(str: string): number | null {
//   if (!str) return null;
//   const s = str.replace(/%/g, "").trim(); // ลบ %
//   if (s === "") return null;
//   const n = Number(s);
//   if (Number.isNaN(n)) return null;
//   // ถ้าผู้ใช้พิมพ์ค่ามากกว่า 1 (เช่น 6) ให้หาร 100
//   // ถ้าผู้ใช้พิมพ์ค่าน้อยกว่า 1 (เช่น 0.06) ให้ใช้ค่านั้นเลย
//   return n > 1 ? n / 100 : n;
// }

// /** (Helper) ตรวจสอบ Reference Unique (เชื่อม API จริง) */
// async function checkReferenceUnique(reference: string): Promise<boolean> {
//   try {
//     const isUnique = await apiCheckRefUnique(reference);
//     return isUnique;
//   } catch (error) {
//     console.error("Failed to check reference uniqueness", error);
//     return false; // (ถ้า API error ให้ถือว่าซ้ำ)
//   }
// }

// export default function GoldForm({
//   mode,
//   defaultValues,
//   onSubmit,
// }: {
//   mode: "create" | "edit";
//   defaultValues?: any;
//   onSubmit: (dto: any) => Promise<void>;
// }) {
//   const { t } = useTranslation("common");

//   // ✅ 4. State ของฟอร์ม
//   const [date, setDate] = useState<string>(
//     defaultValues?.timestamp_tz?.slice(0, 10) || getTodayISO()
//   );
//   const [reference, setReference] = useState(
//     defaultValues?.reference_number || ""
//   );
//   const [direction, setDirection] = useState<"" | "IN" | "OUT">(
//     defaultValues
//       ? Number(defaultValues.gold_out_grams) > 0
//         ? "OUT"
//         : "IN"
//       : ""
//   );
//   const [weightGrams, setWeightGrams] = useState(
//     defaultValues
//       ? String(
//           defaultValues.gold_in_grams || defaultValues.gold_out_grams || ""
//         )
//       : ""
//   );
//   const [ledger, setLedger] = useState(defaultValues?.ledger || "");
//   const [fineness, setFineness] = useState(defaultValues?.fineness || "");
//   const [relatedReference, setRelatedReference] = useState(
//     defaultValues?.related_reference_number || ""
//   );
//   const [counterpart, setCounterpart] = useState(
//     defaultValues?.counterpart || ""
//   );
//   const [goodDetails, setGoodDetails] = useState(
//     defaultValues?.good_details || ""
//   );
//   const [status, setStatus] = useState(defaultValues?.status || "");
//   const [shippingAgent, setShippingAgent] = useState(
//     defaultValues?.shipping_agent || ""
//   );
//   const [remarks, setRemarks] = useState(defaultValues?.remarks || "");

//   // ✅ (แก้ไข) 5. State สำหรับ Loss (กลับไปเป็นแบบ %)
//   const [calculatedLoss, setCalculatedLoss] = useState(() => {
//     // (Logic จากไฟล์เก่าของคุณ ในการแปลง Decimal 0.05 กลับเป็น "5.00")
//     if (
//       defaultValues?.calculated_loss === null ||
//       defaultValues?.calculated_loss === undefined
//     ) {
//       return "";
//     }
//     return (Number(defaultValues.calculated_loss) * 100).toFixed(2);
//   });

//   // (State สำหรับ Validation - เหมือนเดิม)
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [showErrors, setShowErrors] = useState(false);
//   const [refUnique, setRefUnique] = useState<boolean | null>(
//     mode === "edit" ? true : null
//   );
//   const [checkingRef, setCheckingRef] = useState(false);
//   const [isInitialLoad, setIsInitialLoad] = useState(true);
//   useEffect(() => {
//     setIsInitialLoad(false);
//   }, []);

//   // ✅ 6. Derived State
//   const weightNumGrams = useMemo(() => {
//     if (weightGrams === "") return NaN;
//     const n = Number(weightGrams);
//     return Number.isFinite(n) ? n : NaN;
//   }, [weightGrams]);

//   // (Net Gold - เหมือนเดิม)
//   const netGold = useMemo(() => {
//     if (!direction || Number.isNaN(weightNumGrams)) return 0;
//     return direction === "IN" ? weightNumGrams : -weightNumGrams;
//   }, [direction, weightNumGrams]);
//   const goldIn =
//     direction === "IN"
//       ? Number.isNaN(weightNumGrams)
//         ? 0
//         : weightNumGrams
//       : 0;
//   const goldOut =
//     direction === "OUT"
//       ? Number.isNaN(weightNumGrams)
//         ? 0
//         : weightNumGrams
//       : 0;

//   const finenessOptions = useMemo(() => {
//     if (
//       [
//         "Beauty Bijoux",
//         "Green Gold",
//         "PV Accessories",
//         "PV Fine Gold",
//       ].includes(ledger)
//     ) {
//       return FINENESS_MAP_GOLD;
//     }
//     if (ledger === "Palladium") {
//       return FINENESS_MAP_PALLADIUM;
//     }
//     if (ledger === "Platinum") {
//       return FINENESS_MAP_PLATINUM;
//     }
//     return [];
//   }, [ledger]);

//   useEffect(() => {
//     /* (Check Reference Unique - เหมือนเดิม) */
//   }, [reference, mode]);
//   useEffect(() => {
//     /* (Reset Status - เหมือนเดิม) */
//   }, [direction, isInitialLoad, mode]);
//   useEffect(() => {
//     /* (Reset Fineness - เหมือนเดิม) */
//   }, [ledger, isInitialLoad, mode]);

//   // Validation Logic (useMemo)
//   const errors = useMemo(() => {
//     const e: Record<string, string> = {};
//     const today = getTodayISO();

//     // (Date, Reference, Direction, Weight, Ledger - เหมือนเดิม)
//     if (date.trim() === "") e.date = t("validation.required");
//     else if (!isValidIsoDate(date)) e.date = t("validation.date.invalidFormat");
//     else if (date > today) e.date = t("validation.date.future");
//     else if (date < COMPANY_FOUNDED)
//       e.date = t("validation.date.tooOld", { date: "11/03/1991" });

//     if (reference.trim() === "") e.reference = t("validation.required");
//     else if (reference.length > 100)
//       e.reference = t("validation.ref.maxLength");
//     else if (!/^[A-Za-z0-9_\-\s\/]+$/.test(reference))
//       e.reference = t("validation.ref.pattern");

//     if (direction === "") e.direction = t("validation.required");

//     if (weightGrams.trim() === "") e.weight = t("validation.required");
//     else if (weightNumGrams <= 0) e.weight = t("validation.weight.positive");
//     else if (weightNumGrams > 9999999.999)
//       e.weight = t("validation.weight.max");

//     if (ledger.trim() === "") e.ledger = t("validation.required");

//     // validation ของ Loss (กลับไปเป็นแบบ %)
//     if (calculatedLoss.trim() !== "") {
//       const dec = toDecimalFromPercentInput(calculatedLoss);
//       if (dec === null) e.calculated_loss = t("validation.loss.invalidFormat");
//       else if (dec < 0 || dec > 1)
//         // (0% - 100%)
//         e.calculated_loss = t("validation.loss.range");
//     }

//     return e;
//   }, [
//     date,
//     reference,
//     direction,
//     weightGrams,
//     weightNumGrams,
//     ledger,
//     calculatedLoss,
//     t,
//   ]);

//   const canSubmit =
//     Object.keys(errors).length === 0 && !checkingRef && refUnique !== false;

//   // --- 💅 CSS Classes (ลบ readOnlyStyle) ---
//   const inputStyle =
//     "block w-full p-2 text-gray-900 border border-gray-300 rounded-md bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500";
//   const errorStyle = "border-red-500 ring-2 ring-red-100 border-2";

//   function handleReset() {
//     setShowErrors(false);
//     setDate(defaultValues?.timestamp_tz?.slice(0, 10) || getTodayISO());
//     setReference(defaultValues?.reference_number || "");
//     setDirection(
//       defaultValues
//         ? Number(defaultValues.gold_out_grams) > 0
//           ? "OUT"
//           : "IN"
//         : ""
//     );
//     setWeightGrams(
//       defaultValues
//         ? String(
//             defaultValues.gold_in_grams || defaultValues.gold_out_grams || ""
//           )
//         : ""
//     );
//     setLedger(defaultValues?.ledger || "");
//     setRemarks(defaultValues?.remarks || "");

//     // (Reset Calculated Loss - ใช้ Logic จากไฟล์เก่า)
//     const defaultLoss =
//       defaultValues?.calculated_loss === null ||
//       defaultValues?.calculated_loss === undefined
//         ? ""
//         : (Number(defaultValues.calculated_loss) * 100).toFixed(2);
//     setCalculatedLoss(defaultLoss);

//     setRelatedReference(defaultValues?.related_reference_number || "");
//     setCounterpart(defaultValues?.counterpart || "");
//     setFineness(defaultValues?.fineness || "");
//     setGoodDetails(defaultValues?.good_details || "");
//     setStatus(defaultValues?.status || "");
//     setShippingAgent(defaultValues?.shipping_agent || "");
//     setRefUnique(mode === "edit" ? true : null);
//     setCheckingRef(false);
//   }

//   async function submit(e: React.FormEvent) {
//     e.preventDefault();
//     if (!canSubmit) {
//       setShowErrors(true);
//       return;
//     }

//     try {
//       setIsSubmitting(true);
//       const gold_in_grams = direction === "IN" ? Number(weightGrams) : 0;
//       const gold_out_grams = direction === "OUT" ? Number(weightGrams) : 0;
//       const now = new Date();
//       const dateParts = date.split("-").map(Number);
//       const timestamp = new Date(
//         dateParts[0],
//         dateParts[1] - 1,
//         dateParts[2],
//         now.getHours(),
//         now.getMinutes(),
//         now.getSeconds()
//       );

//       // ✅ (แก้ไข) 14. แปลง % กลับเป็น Decimal
//       const decimalLoss = toDecimalFromPercentInput(calculatedLoss);

//       // (อัปเดต DTO)
//       const dto = {
//         timestamp_tz: timestamp.toISOString(),
//         reference_number: reference.trim(),
//         ledger: ledger,
//         gold_in_grams,
//         gold_out_grams,
//         calculated_loss: decimalLoss, // 👈 (ส่ง Decimal % ไป Backend)
//         fineness: fineness || null,
//         counterpart: counterpart || null,
//         good_details: goodDetails || null,
//         status: status || null,
//         shipping_agent: shippingAgent || null,
//         related_reference_number: relatedReference || null,
//         remarks: remarks || null,
//       };

//       await onSubmit(dto);
//       if (mode === "create") {
//         handleReset();
//       }
//     } catch (err) {
//       console.error("Submit error", err);
//     } finally {
//       setIsSubmitting(false);
//     }
//   }

//   // --- Helpers ---
//   const ErrorMessage = ({ field }: { field: string }) => {
//     if (!showErrors || !errors[field]) return null;
//     return <p className="mt-1 text-sm text-red-600">{errors[field]}</p>;
//   };

//   return (
//     <form
//       onSubmit={submit}
//       className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-12"
//     >
//       {/* date */}
//       <div className="md:col-span-2">
//         <label className="block text-sm font-medium">
//           {" "}
//           {t("form.date")} <span className="text-red-600"> *</span>{" "}
//         </label>
//         <input
//           type="date"
//           className={`${inputStyle} ${
//             showErrors && errors.date ? errorStyle : ""
//           }`}
//           value={date}
//           onChange={(e) => setDate(e.target.value)}
//           max={getTodayISO()}
//           min={COMPANY_FOUNDED}
//         />
//         <ErrorMessage field="date" />
//       </div>

//       {/* (ledger */}
//       <div className="md:col-span-2">
//         <label className="block text-sm font-medium">
//           {" "}
//           {t("form.ledger")} <span className="text-red-600"> *</span>{" "}
//         </label>
//         <select
//           className={`${inputStyle} ${
//             showErrors && errors.ledger ? errorStyle : ""
//           }`}
//           value={ledger}
//           onChange={(e) => setLedger(e.target.value)}
//         >
//           <option value="">Select…</option>
//           {LEDGERS.map((l) => (
//             <option key={l} value={l}>
//               {l}
//             </option>
//           ))}
//         </select>
//         <ErrorMessage field="ledger" />
//       </div>

//       {/* fineness */}
//       <div className="md:col-span-2">
//         <label className="block text-sm font-medium">
//           {" "}
//           {t("form.fineness")}{" "}
//         </label>
//         <select
//           className={inputStyle}
//           value={fineness} // 👈 (State คือ "333")
//           onChange={(e) => setFineness(e.target.value)} // 👈 (Save "333")
//           disabled={!ledger}
//         >
//           <option value="">
//             {" "}
//             {ledger
//               ? t("form.fineness_options.select_one")
//               : t("form.fineness_options.select_ledger_first")}{" "}
//           </option>
//           {finenessOptions.map((option) => (
//             <option key={option.label} value={option.value}>
//               {" "}
//               {/* 👈 value={333} */}
//               {option.label} {/* 👈 ผู้ใช้เห็น '8K' */}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* reference number */}
//       <div className="md:col-span-2">
//         <label className="block text-sm font-medium">
//           {" "}
//           {t("form.reference")} <span className="text-red-600"> *</span>{" "}
//         </label>
//         <input
//           className={`${inputStyle} ${
//             (showErrors && errors.reference) || refUnique === false
//               ? errorStyle
//               : ""
//           }`}
//           value={reference}
//           onChange={(e) => setReference(e.target.value)}
//           maxLength={100}
//         />
//         {/* (Ref unique status - เหมือนเดิม) */}
//       </div>

//       {/* related reference number */}
//       <div className="md:col-span-2">
//         <label className="block text-sm font-medium">
//           {" "}
//           {t("form.related_reference")}{" "}
//         </label>
//         <input
//           className={inputStyle}
//           value={relatedReference}
//           onChange={(e) => setRelatedReference(e.target.value)}
//         />
//       </div>

//       {/* counterpart  */}
//       <div className="md:col-span-2">
//         <label className="block text-sm font-medium">
//           {" "}
//           {t("form.counterpart")}{" "}
//         </label>
//         <select
//           className={inputStyle}
//           value={counterpart}
//           onChange={(e) => setCounterpart(e.target.value)}
//         >
//           <option value="">Select...</option>
//           {COUNTERPART_LIST.map((s) => (
//             <option key={s} value={s}>
//               {s}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Good Details */}
//       <div className="md:col-span-2">
//         <label className="block text-sm font-medium">
//           {t("form.good_details")}
//         </label>
//         <textarea
//           rows={1}
//           className={inputStyle}
//           value={goodDetails}
//           onChange={(e) => setGoodDetails(e.target.value)}
//         />
//       </div>

//       {/* direction (IN, OUT) */}
//       <div className="md:col-span-2">
//         <label className="block text-sm font-medium">
//           {" "}
//           {t("form.direction")} <span className="text-red-600"> *</span>{" "}
//         </label>
//         <div
//           className={`flex gap-2 ${
//             showErrors && errors.direction
//               ? "rounded-xl ring-2 ring-red-500"
//               : ""
//           }`}
//         >
//           <button
//             type="button"
//             onClick={() => setDirection("IN")}
//             className={`flex-1 rounded-xl border border-gray-200 p-2 ${
//               direction === "IN"
//                 ? "border-green-600 ring-2 ring-green-200"
//                 : "hover:bg-gray-50"
//             }`}
//           >
//             {" "}
//             {t("form.in")}{" "}
//           </button>
//           <button
//             type="button"
//             onClick={() => setDirection("OUT")}
//             className={`flex-1 rounded-xl border border-gray-200 p-2 ${
//               direction === "OUT"
//                 ? "border-red-600 ring-2 ring-red-200"
//                 : "hover:bg-gray-50"
//             }`}
//           >
//             {" "}
//             {t("form.out")}{" "}
//           </button>
//         </div>
//         <ErrorMessage field="direction" />
//       </div>

//       {/* Weight (Grams) */}
//       <div className="md:col-span-1">
//         <label className="block text-sm font-medium">
//           {/* {direction === "OUT"
//             ? t("form.weight_sent")
//             : direction === "IN"
//             ? t("form.weight_received")
//             : t("form.weight")} */}
//           {t("form.net_weight")}
//           <span className="text-red-600"> *</span>
//         </label>
//         <input
//           type="number"
//           step="0.001"
//           className={`${inputStyle} ${
//             showErrors && errors.weight ? errorStyle : ""
//           }`}
//           value={weightGrams}
//           onChange={(e) => setWeightGrams(e.target.value)}
//         />
//         <ErrorMessage field="weight" />
//       </div>

//       {/* Status */}
//       <div className="md:col-span-2">
//         <label className="block text-sm font-medium">
//           {" "}
//           {t("form.status")}{" "}
//         </label>
//         <select
//           className={inputStyle}
//           value={status}
//           onChange={(e) => setStatus(e.target.value)}
//           disabled={!direction}
//         >
//           <option value="">
//             {" "}
//             {direction
//               ? t("form.status_options.select_one")
//               : t("form.status_options.select_direction_first")}{" "}
//           </option>
//           {direction === "IN" &&
//             STATUS_OPTIONS_IN.map((opt) => (
//               <option key={opt} value={opt}>
//                 {t(`form.status_options.${opt.toLowerCase()}`)}
//               </option>
//             ))}
//           {direction === "OUT" &&
//             STATUS_OPTIONS_OUT.map((opt) => (
//               <option key={opt} value={opt}>
//                 {t(`form.status_options.${opt.toLowerCase()}`)}
//               </option>
//             ))}
//         </select>
//       </div>

//       {/* Calculated Loss (Percent) */}
//       <div className="md:col-span-1">
//         <label className="block text-sm font-medium">
//           {" "}
//           {t("form.calculated_loss_percent")}{" "}
//         </label>
//         <input
//           type="text" // (ใช้ text เพื่อรับ '%')
//           className={`${inputStyle} ${
//             showErrors && errors.calculated_loss ? errorStyle : ""
//           }`}
//           value={calculatedLoss}
//           onChange={(e) => {
//             setCalculatedLoss(e.target.value);
//             // (ลบ setLossManuallySet)
//           }}
//           placeholder="e.g. 0.5%"
//         />
//         <ErrorMessage field="calculated_loss" />
//       </div>

//       {/* Shipping Agent */}
//       <div className="md:col-span-2">
//         <label className="block text-sm font-medium">
//           {" "}
//           {t("form.shipping_agent")}{" "}
//         </label>
//         <select
//           className={inputStyle}
//           value={shippingAgent}
//           onChange={(e) => setShippingAgent(e.target.value)}
//         >
//           <option value="">Select...</option>
//           {SHIPPING_AGENT_LIST.map((s) => (
//             <option key={s} value={s}>
//               {s}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Remarks */}
//       <div className="md:col-span-2">
//         <label className="block text-sm font-medium">{t("form.remarks")}</label>
//         <textarea
//           rows={1}
//           className={inputStyle}
//           value={remarks}
//           onChange={(e) => setRemarks(e.target.value)}
//         />
//       </div>

//       {/* Buttons */}
//       <div className="md:col-span-12 flex justify-end gap-2 self-end">
//         <button
//           type="button"
//           className="rounded-lg px-4 py-2 hover:bg-gray-50 text-sm p-2 border border-gray-200"
//           onClick={handleReset}
//         >
//           {t("form.reset")}
//         </button>
//         <button
//           type="submit"
//           disabled={!canSubmit || isSubmitting}
//           className={`rounded-lg px-4 py-2 text-white text-sm ${
//             !canSubmit || isSubmitting
//               ? "bg-gray-400 cursor-not-allowed"
//               : "bg-blue-600 hover:bg-blue-700"
//           }`}
//         >
//           {isSubmitting ? t("form.saving") : t("form.save")}
//         </button>
//       </div>
//     </form>
//   );
// }

// (ทั้งไฟล์ของคุณ แต่ส่วนที่แก้จริง ๆ อยู่ใน useEffect และ JSX ใต้ input reference)
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
 *    true => unique (not used), false => not unique (already exists)
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

  // ✅ 4. State ของฟอร์ม
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
  const [fineness, setFineness] = useState(defaultValues?.fineness || "");
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

  // ✅ (แก้ไข) 5. State สำหรับ Loss (กลับไปเป็นแบบ %)
  const [calculatedLoss, setCalculatedLoss] = useState(() => {
    // (Logic จากไฟล์เก่าของคุณ ในการแปลง Decimal 0.05 กลับเป็น "5.00")
    if (
      defaultValues?.calculated_loss === null ||
      defaultValues?.calculated_loss === undefined
    ) {
      return "";
    }
    return (Number(defaultValues.calculated_loss) * 100).toFixed(2);
  });

  // (State สำหรับ Validation - เหมือนเดิม)
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

  // ✅ 6. Derived State
  const weightNumGrams = useMemo(() => {
    if (weightGrams === "") return NaN;
    const n = Number(weightGrams);
    return Number.isFinite(n) ? n : NaN;
  }, [weightGrams]);

  // (Net Gold - เหมือนเดิม)
  const netGold = useMemo(() => {
    if (!direction || Number.isNaN(weightNumGrams)) return 0;
    return direction === "IN" ? weightNumGrams : -weightNumGrams;
  }, [direction, weightNumGrams]);

  const goldIn = direction === "IN" ? Number.isNaN(weightNumGrams) ? 0 : weightNumGrams : 0;
  const goldOut = direction === "OUT" ? Number.isNaN(weightNumGrams) ? 0 : weightNumGrams : 0;

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

  // -----------------------
  // 🔔 Reference uniqueness check (debounced, robust)
  // -----------------------
  useEffect(() => {
    latestRef.current = reference;
    // If editing and reference not changed from default, consider it unique
    const originalRef = defaultValues?.reference_number ?? "";

    // small helper - don't check when reference empty or validation fails
    if (
      (mode === "edit" && reference === originalRef) ||
      reference.trim() === ""
    ) {
      // reset checking states
      setCheckingRef(false);
      // If edit mode and unchanged -> unique; if create and empty -> unknown (null)
      setRefUnique(mode === "edit" && reference === originalRef ? true : null);
      return;
    }

    // If the reference fails client-side basic validation, skip remote check
    if (!/^[A-Za-z0-9_\-\s\/]+$/.test(reference) || reference.length > 100) {
      setRefUnique(null);
      setCheckingRef(false);
      return;
    }

    let mounted = true;
    setCheckingRef(true);
    setRefUnique(null); // in-progress: unknown

    const timer = window.setTimeout(async () => {
      try {
        const refToCheck = reference.trim();
        latestRef.current = refToCheck;
        const isUnique = await checkReferenceUniqueRemote(refToCheck);
        // only update state if this effect is still valid and reference hasn't changed
        if (!mounted) return;
        if (latestRef.current !== refToCheck) {
          // a newer check started, ignore this result
          return;
        }
        setRefUnique(Boolean(isUnique));
      } catch (err) {
        console.error("Reference check failed:", err);
        if (mounted) {
          setRefUnique(false); // conservative: treat as duplicate on error
        }
      } finally {
        if (mounted) setCheckingRef(false);
      }
    }, 400); // debounce 400ms

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference, mode, defaultValues?.reference_number]);

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

  // const canSubmit = Object.keys(errors).length === 0 && !checkingRef && refUnique !== false;
  const canSubmit = Object.keys(errors).length === 0 && !checkingRef;
  // --- 💅 CSS Classes (ลบ readOnlyStyle) ---
  const inputStyle =
    "block w-full p-2 text-gray-900 border border-gray-300 rounded-md bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500";
  const errorStyle = "border-red-500 ring-2 ring-red-100 border-2";

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
    setWeightGrams(
      defaultValues
        ? String(
          defaultValues.gold_in_grams || defaultValues.gold_out_grams || ""
        )
        : ""
    );
    setLedger(defaultValues?.ledger || "");
    setRemarks(defaultValues?.remarks || "");

    // (Reset Calculated Loss - ใช้ Logic จากไฟล์เก่า)
    const defaultLoss =
      defaultValues?.calculated_loss === null ||
        defaultValues?.calculated_loss === undefined
        ? ""
        : (Number(defaultValues.calculated_loss) * 100).toFixed(2);
    setCalculatedLoss(defaultLoss);

    setRelatedReference(defaultValues?.related_reference_number || "");
    setCounterpart(defaultValues?.counterpart || "");
    setFineness(defaultValues?.fineness || "");
    setGoodDetails(defaultValues?.good_details || "");
    setStatus(defaultValues?.status || "");
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
      {/* date */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium">
          {" "}
          {t("form.date")} <span className="text-red-600"> *</span>{" "}
        </label>
        <input
          type="date"
          className={`${inputStyle} ${showErrors && errors.date ? errorStyle : ""
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
          className={`${inputStyle} ${showErrors && errors.ledger ? errorStyle : ""
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

      {/* reference number */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium">
          {" "}
          {t("form.reference")} <span className="text-red-600"> *</span>{" "}
        </label>
        <input
          className={`${inputStyle} ${showErrors && errors.reference ? errorStyle : ""
            }`}
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          maxLength={100}
          aria-invalid={Boolean(showErrors && errors.reference)}
          aria-describedby="ref-feedback"
        />
        {/* ---- NEW: show checking / duplicate message below input ---- */}
        {checkingRef && (
          <p className="mt-1 text-xs text-gray-500">
            {t("form.reference_number_checking")}
          </p>
        )}

        {/* duplicate warning -> styled with standard Tailwind so background shows */}
        {refUnique === false && !checkingRef && (
          <div
            id="ref-feedback-dup"
            role="alert"
            aria-live="polite"
            className="mt-2 p-3 mb-3 text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg"
          >
            <span className="font-medium">Warning alert!</span>{" "}
            <span className="ml-1">{t("form.reference_number_exists")}</span>
          </div>
        )}

        {/* validation message (required/format) - keep below */}
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
            className={`flex-1 rounded-xl border border-gray-200 p-2 ${direction === "IN"
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
            className={`flex-1 rounded-xl border border-gray-200 p-2 ${direction === "OUT"
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
          {/* {direction === "OUT"
            ? t("form.weight_sent")
            : direction === "IN"
            ? t("form.weight_received")
            : t("form.weight")} */}
          {t("form.net_weight")}
          <span className="text-red-600"> *</span>
        </label>
        <input
          type="number"
          step="0.001"
          className={`${inputStyle} ${showErrors && errors.weight ? errorStyle : ""
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
          type="text" // (ใช้ text เพื่อรับ '%')
          className={`${inputStyle} ${showErrors && errors.calculated_loss ? errorStyle : ""
            }`}
          value={calculatedLoss}
          onChange={(e) => {
            setCalculatedLoss(e.target.value);
            // (ลบ setLossManuallySet)
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
        <label className="block text-sm font-medium">{t("form.remarks")}</label>
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
        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className={`rounded-lg px-4 py-2 text-white text-sm ${!canSubmit || isSubmitting
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {isSubmitting ? t("form.saving") : t("form.save")}
        </button>
      </div>
    </form>
  );
}
