/**
 * features/golds/components/RecordsTable.tsx
 * ตารางแสดงรายการทอง:
 * - แสดง skeleton ระหว่างโหลด
 * - ปุ่มลบพร้อม Modal ยืนยัน
 * - ลบสำเร็จเรียก onDeleted() เพื่อให้หน้าหลัก refetch
 */
import { FiTrash2 } from "react-icons/fi";
import { useTranslation } from "react-i18next"; // Hook สำหรับการแปลภาษา
import { useState } from "react";

import Modal from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDeleteGold } from "@/features/golds/hooks/useDeleteGold"; // Custom Hook จาก React Query
import { formatDate } from "@/utils/date";

/**
 * เพิ่มคอลัมน์ "#" โดยคำนวณจาก (page-1)*limit + index + 1
 */
export default function RecordsTable({
  rows,
  loading = false,
  onDeleted,
  page = 1,
  limit = 100,
}: {
  rows: any[];
  loading?: boolean;
  onDeleted?: () => void;
  page?: number;
  limit?: number;
}) {
  /** การจัดการสถานะ (State) */
  // ป็น Object ที่ได้จาก useDeleteGold() (useMutation) ซึ่งจะเก็บฟังก์ชันสำหรับลบ
  const del = useDeleteGold();
  // เก็บ ID ของรายการที่ผู้ใช้เลือกกดปุ่มลบ
  const [targetId, setTargetId] = useState<string | null>(null);
  const { t, i18n } = useTranslation("common");

  /** ฟังก์ชันการลบ (Business Logic) */
  const doDelete = async () => {
    if (!targetId) return;
    try {
      await del.mutateAsync(targetId);
      setTargetId(null);
      onDeleted?.();
    } catch {}
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
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="text-sm text-gray-700 uppercase bg-gray-50">
          <tr>
            <th className="px-4 py-3 w-14">#</th>
            <th className="px-4 py-3">{t("table.date")}</th>
            <th className="px-4 py-3">{t("table.reference")}</th>
            <th className="px-4 py-3">{t("table.details")}</th>
            <th className="px-4 py-3">{t("table.direction")}</th>
            <th className="px-4 py-3 text-center">{t("table.weight")}</th>
            <th className="px-4 py-3 text-center">{t("table.net")}</th>
            <th className="px-4 py-3">{t("table.ledger")}</th>
            <th className="px-4 py-3">{t("table.remarks")}</th>
            <th className="px-2 py-3 text-center">{t("table.actions")}</th>
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
              const order = (page - 1) * limit + i + 1; // 👈 คำนวณลำดับ
              // const dir = Number(r.gold_out_grams) > 0 ? "OUT" : "IN";
              // const net = Number(r.net_gold_grams ?? 0);

              return (
                <tr
                  key={i}
                  className="bg-white border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-6 py-4">{order}</td>
                  <td className="px-6 py-4">
                    {formatDate(r.timestamp_tz, i18n.language)}
                  </td>
                  <td className="px-6 py-4">
                    {r.reference_number || r.reference}
                  </td>
                  <td className="px-6 py-4">
                    {r.details || r.details}
                  </td>
                  <td className="px-6 py-4">
                    {Number(r.gold_out_grams) > 0 ? "OUT" : "IN"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {r.gold_in_grams || r.gold_out_grams}
                  </td>
                  <td
                    className={`px-6 py-4 text-right ${
                      Number(r.net_gold_grams) < 0
                        ? "text-red-600"
                        : "text-green-700"
                    }`}
                  >
                    {r.net_gold_grams}
                  </td>
                  <td className="px-6 py-4">{r.ledger}</td>
                  <td className="px-6 py-4">{r.remarks}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end">
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
