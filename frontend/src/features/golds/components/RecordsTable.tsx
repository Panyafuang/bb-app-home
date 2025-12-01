import { FiTrash2 } from "react-icons/fi";
import { FiEdit } from "react-icons/fi";
import { useTranslation } from "react-i18next"; // Hook สำหรับการแปลภาษา
import { useState } from "react";

import Modal from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDeleteGold } from "@/features/golds/hooks/useDeleteGold"; // Custom Hook จาก React Query
import { formatThaiDateExceptYear } from "@/utils/utils";
import CopyButton from "@/components/CopyButton";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";

export type SortConfig = {
  key: string;
  direction: "asc" | "desc";
} | null;

export default function RecordsTable({
  rows,
  loading = false,
  onDeleted,
  onEdit,
  sortConfig,
  onSort,
}: {
  rows: any[];
  loading?: boolean;
  onDeleted?: () => void;
  onEdit?: (row: any) => void;
  page?: number;
  limit?: number;
  sortConfig?: SortConfig;
  onSort?: (key: string) => void;
}) {
  /** การจัดการสถานะ (State) */
  // ป็น Object ที่ได้จาก useDeleteGold() (useMutation) ซึ่งจะเก็บฟังก์ชันสำหรับลบ
  const del = useDeleteGold();
  // เก็บ ID ของรายการที่ผู้ใช้เลือกกดปุ่มลบ
  const [targetId, setTargetId] = useState<string | null>(null);
  const { t } = useTranslation("common");

  /** ฟังก์ชันการลบ (Business Logic) */
  const doDelete = async () => {
    if (!targetId) return;
    try {
      await del.mutateAsync(targetId);
      setTargetId(null);
      onDeleted?.();
    } catch {}
  };

  const SortableTh = ({
    label,
    sortKey,
    className = "",
    minWidth,
    center = false,
  }: {
    label: string;
    sortKey?: string; // ถ้าไม่ส่งมา แปลว่าคอลัมน์นี้ห้าม Sort
    className?: string;
    minWidth?: string;
    center?: boolean;
  }) => {
    const isSortable = !!onSort && !!sortKey;
    const isActive = sortConfig?.key === sortKey;

    return (
      <th
        scope="col"
        className={`border border-gray-200 px-4 py-4 select-none ${className} ${
          minWidth ? `min-w-[${minWidth}]` : ""
        } ${
          isSortable ? "cursor-pointer hover:bg-gray-100 transition-colors" : ""
        }`}
        onClick={() => isSortable && onSort(sortKey)}
        style={{ minWidth }} // Tailwind dynamic class บางทีไม่ work ใช้ style ชัวร์กว่า
      >
        <div
          className={`flex items-center gap-1 ${
            center ? "justify-center" : "justify-between"
          }`}
        >
          <span>{label}</span>
          {isSortable && (
            <span className="ml-1 text-gray-400">
              {isActive ? (
                sortConfig?.direction === "asc" ? (
                  <FaSortUp className="text-blue-600" />
                ) : (
                  <FaSortDown className="text-blue-600" />
                )
              ) : (
                <FaSort className="opacity-50" />
              )}
            </span>
          )}
        </div>
      </th>
    );
  };

  const skeletonRows = Array.from({ length: 5 }).map((_, i) => (
    <tr key={i}>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-40" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-16" />
      </td>
      <td className="px-4 py-3 text-right">
        <Skeleton className="ml-auto h-4 w-20" />
      </td>
      <td className="px-4 py-3 text-right">
        <Skeleton className="ml-auto h-4 w-20" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-28" />
      </td>
      <td className="px-4 py-3 text-right">
        <Skeleton className="ml-auto h-4 w-6" />
      </td>
    </tr>
  ));

  return (
    <div
      id="gold-table"
      className="overflow-x-auto rounded-xl border border-gray-200 bg-white"
    >
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="text-gray-600 uppercase bg-gray-50">
          <tr>
            <SortableTh label={t("table.date")} sortKey="timestamp_tz" center />
            <SortableTh label={t("table.ledger")} sortKey="ledger" minWidth="150px" center/>
            <SortableTh label={t("table.reference")} sortKey="reference_number" minWidth="180px" center/>
            <SortableTh label={t("table.related_reference_number")} sortKey="related_reference_number" minWidth="190px" center/>
            <SortableTh label={t("table.direction")} sortKey="gold_out_grams" center/>
            
            <SortableTh label={t("table.weight")} sortKey="net_gold_grams" center minWidth="150px"/>
            
            <SortableTh label={t("table.counterpart")} sortKey="counterpart" minWidth="180px" center />
            <SortableTh label={t("table.fineness")} sortKey="fineness" minWidth="150px" center/>
            <SortableTh label={t("table.status")} sortKey="status" center />
            <SortableTh label={t("table.good_details")} sortKey="good_details" minWidth="200px" center/>
            <SortableTh label={t("table.shipping_agent")} sortKey="shipping_agent" minWidth="180px" center/>
            <SortableTh label={t("table.calculated_loss")} sortKey="calculated_loss" center minWidth="170px"/>
            <SortableTh label={t("table.remarks")} minWidth="220px" center/>
            
            <th className="sticky right-0 bg-gray-50 px-2 py-4 text-center border border-gray-200">
              {t("table.actions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {loading && skeletonRows}
          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                {t("table.empty")}
              </td>
            </tr>
          )}
          {!loading &&
            rows.map((r: any, i: number) => {
              return (
                <tr
                  key={i}
                  className="bg-white border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="border border-gray-200 px-6 py-3">
                    {/* {formatDate(r.timestamp_tz, i18n.language)} */}
                    {formatThaiDateExceptYear(r.timestamp_tz)}
                  </td>
                  <td className="border border-gray-200 px-6 py-3 min-w-[150px]">
                    {r.ledger}
                  </td>
                  <td className="border border-gray-200 px-6 py-3 min-w-[180px]">
                    <div className="flex items-center gap-2">
                      <span className="whitespace-nowrap">
                        {r.reference_number}
                      </span>
                      <CopyButton value={r.reference_number} />
                    </div>
                  </td>
                  <td className="border border-gray-200 px-6 py-3 min-w-[190px]">
                    {r.related_reference_number}
                  </td>
                  <td
                    className={`border border-gray-200 px-6 py-3 ${
                      Number(r.gold_out_grams) > 0
                        ? "text-red-600"
                        : "text-green-700"
                    }`}
                  >
                    {Number(r.gold_out_grams) > 0 ? (
                      <>
                        <span className="text-lg">↑</span>
                        OUT
                      </>
                    ) : (
                      <>
                        <span className="text-lg">↓</span>
                        IN
                      </>
                    )}
                  </td>
                  <td
                    className={`border border-gray-200 px-6 py-3 text-right ${
                      Number(r.gold_out_grams) > 0
                        ? "text-red-600"
                        : "text-green-700"
                    }`}
                  >
                    {r.gold_in_grams > 0 ? r.gold_in_grams : r.gold_out_grams}
                  </td>
                  <td className="border border-gray-200 px-6 py-3 min-w-[180px]">
                    {r.counterpart}
                  </td>
                  <td className="border border-gray-200 px-6 py-3">
                    {r.fineness}
                  </td>
                  <td className="border border-gray-200 px-6 py-3">
                    {r.status}
                  </td>
                  <td className="border border-gray-200 px-6 py-3 min-w-[200px]">
                    {r.good_details}
                  </td>
                  <td className="border border-gray-200 px-6 py-3 min-w-[180px]">
                    {r.shipping_agent}
                  </td>
                  <td className="border border-gray-200 px-6 py-3 text-right">
                    {r.calculated_loss != null ? r.calculated_loss : ""}
                  </td>

                  <td className="border border-gray-200 px-6 py-3 min-w-[220px]">
                    {r.remarks}
                  </td>
                  <td className="border border-gray-200 sticky right-0 bg-gray-50 px-6 py-3 hover:bg-gray-50">
                    <div className="flex justify-end">
                      <button
                        title={t("table.edit") || "Edit"}
                        onClick={() => {
                          onEdit?.(r); // ส่งข้อมูล row กลับไปที่ GoldListPage
                          window.scrollTo(0, 0);
                        }}
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 mr-2"
                      >
                        <FiEdit />
                      </button>
                      <button
                        title={t("modal.confirm")}
                        onClick={() => setTargetId(r.id)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>

      {/* Modal ยืนยันลบ */}
      <Modal
        open={!!targetId}
        title={t("modal.delete.title")}
        description={t("modal.delete.desc")}
        confirmText={
          del.isPending ? t("modal.confirm") + "..." : t("modal.confirm")
        }
        onConfirm={doDelete}
        onClose={() => setTargetId(null)}
      />
    </div>
  );
}
