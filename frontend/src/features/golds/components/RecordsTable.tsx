import { FiTrash2 } from "react-icons/fi";
import { FiEdit } from "react-icons/fi";
import { useTranslation } from "react-i18next"; // Hook สำหรับการแปลภาษา
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Modal from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDeleteGold } from "@/features/golds/hooks/useDeleteGold"; // Custom Hook จาก React Query
import { formatDate } from "@/utils/date";
import { finenessToKarat } from "@/utils/help";


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
  const navigate = useNavigate();

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
    <div id="gold-table" className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="text-sm text-gray-700 uppercase bg-gray-50">
          <tr>
            <th className="border border-gray-200 px-4 py-3">{t("table.date")}</th>
            <th className="border border-gray-200 px-4 py-3 min-w-[180px]">{t("table.ledger")}</th>
            <th className="border border-gray-200 px-4 py-3 min-w-[180px]">{t("table.reference")}</th>
            <th className="border border-gray-200 px-4 py-3 min-w-[180px]">
              {t("table.related_reference_number")}
            </th>
            <th className="border border-gray-200 px-4 py-3">{t("table.direction")}</th>
            <th className="border border-gray-200 px-4 py-3 text-center">{t("table.weight")}</th>
            <th className="border border-gray-200 px-4 py-3 min-w-[180px]">
              {t("table.counterpart")}
            </th>
            <th className="border border-gray-200 px-4 py-3">{t("table.fineness")}</th>
            <th className="border border-gray-200 px-4 py-3">{t("table.status")}</th>
            <th className="border border-gray-200 px-4 py-3 min-w-[200px]">
              {t("table.good_details")}
            </th>
            <th className="border border-gray-200 px-4 py-3">{t("table.shipping_agent")}</th>
            <th className="border border-gray-200 px-4 py-3 text-center">
              {t("table.calculated_loss")}
            </th>
            <th className="border border-gray-200 px-4 py-3 min-w-[220px]">{t("table.remarks")}</th>
            <th className="sticky right-0 bg-gray-50 px-2 py-3 text-center">
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
                  <td className="border border-gray-200 px-6 py-4">
                    {formatDate(r.timestamp_tz, i18n.language)}
                  </td>
                  <td className="border border-gray-200 px-6 py-4 min-w-[180px]">{r.ledger}</td>
                  <td className="border border-gray-200 px-6 py-4 min-w-[180px]">
                    {r.reference_number}
                  </td>
                  <td className="border border-gray-200 px-6 py-4 min-w-[180px]">
                    {r.related_reference_number}
                  </td>
                  <td
                    className={`border border-gray-200 px-6 py-4 ${
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
                    className={`border border-gray-200 px-6 py-4 text-right ${
                      Number(r.gold_out_grams) > 0
                        ? "text-red-600"
                        : "text-green-700"
                    }`}
                  >
                    {r.gold_in_grams > 0 ? r.gold_in_grams : r.gold_out_grams}
                  </td>
                  <td className="border border-gray-200 px-6 py-4 min-w-[180px]">{r.counterpart}</td>
                  <td className="border border-gray-200 px-6 py-4">{finenessToKarat(r.fineness)}</td>
                  <td className="border border-gray-200 px-6 py-4">{r.status}</td>
                  <td className="border border-gray-200 px-6 py-4 min-w-[200px]">{r.good_details}</td>
                  <td className="border border-gray-200 px-6 py-4">{r.shipping_agent}</td>
                  <td className="border border-gray-200 px-6 py-4 text-right">
                    {r.calculated_loss != null
                      ? `${(r.calculated_loss * 100).toFixed(2)}%`
                      : ""}
                  </td>

                  {/* <td
                    className={`px-6 py-4 text-right ${
                      Number(r.net_gold_grams) < 0
                        ? "text-red-600"
                        : "text-green-700"
                    }`}
                  >
                    {r.net_gold_grams}
                  </td> */}

                  <td className="border border-gray-200 px-6 py-4 min-w-[220px]">{r.remarks}</td>
                  {/* <td className="px-6 py-4"> */}
                  <td className="border border-gray-200 sticky right-0 bg-gray-50 px-6 py-4 hover:bg-gray-50">
                    <div className="flex justify-end">
                      <button
                        title={t("table.edit") || "Edit"}
                        // onClick={() =>
                        //   navigate(`/materials/golds/edit/${r.id}`)
                        // }
                        onClick={() => {
                          // 2. สั่งให้ย้ายหน้า
                          navigate(`/materials/golds/edit/${r.id}`);

                          // ✅ 3. (เพิ่ม) สั่งให้เลื่อนไปบนสุด
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
