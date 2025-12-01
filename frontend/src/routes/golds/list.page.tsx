import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { useGoldsQuery } from "@/features/golds/hooks/useGoldsQuery";
import RecordsTable, {
  type SortConfig,
} from "@/features/golds/components/RecordsTable";
import Pagination from "@/components/ui/Pagination";
import Breadcrumbs from "@/components/Breadcrumbs";
import SearchBar from "@/features/golds/components/SearchBar";
import { useCreateGold } from "@/features/golds/hooks/useCreateGold";
import GoldForm from "@/features/golds/components/GoldForm";
import ExportButtons from "@/features/golds/components/ExportButtons";
import { updateGold } from "@/api/goldsClient";

export default function GoldListPage() {
  const { t } = useTranslation("common");
  const m = useCreateGold();

  const { data, isLoading, filters, setFilters, refetch } = useGoldsQuery({
    page: 1,
    limit: 50,
    sort: "updated_at:desc"
  });

  const rows = Array.isArray(data) ? data : data?.items ?? [];
  const page = data?.page ?? filters.page ?? 1;
  const limit = data?.limit ?? filters.limit ?? 10;
  const total = data?.total ?? 0;
  const [editingRow, setEditingRow] = useState<any | null>(null);

  /** Logic สำหรับการ Sort */
  // แปลง string "key:direction" จาก filters ให้เป็น Object { key, direction } เพื่อส่งให้ Table แสดงผล
  const currentSortStr = filters.sort || "updated_at:desc"; // ค่า default
  const [currentSortKey, currentSortDir] = currentSortStr.split(":");

  const sortConfig: SortConfig = {
    key: currentSortKey,
    direction: currentSortDir as "asc" | "desc",
  };

  // ฟังก์ชัน Callback เมื่อ User กดหัวตาราง
  const handleSort = (key: string) => {
    setFilters((prev: any) => {
      const prevSortStr = prev.sort || "timestamp_tz:desc";
      const [prevKey, prevDir] = prevSortStr.split(":");

      let newDirection = "desc"; // เริ่มต้นด้วย desc เสมอถ้ากดคอลัมน์ใหม่

      if (prevKey === key) {
        // ถ้ากดคอลัมน์เดิม -> สลับ direction
        newDirection = prevDir === "asc" ? "desc" : "asc";
      }

      // อัปเดต state filters -> Hook useGoldsQuery จะยิง API ใหม่ให้อัตโนมัติ
      return { ...prev, sort: `${key}:${newDirection}` };
    });
  };

  return (
    <div className="space-y-4">
      <Breadcrumbs />
      <div className="mb-6 flex items-center justify-start">
        <h1 className="mb-3 text-2xl font-semibold text-gray-700 dark:text-white md:text-2xl lg:text-3xl">
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-indigo-600">
            {t("header.material_report")}
          </span>
        </h1>
      </div>

      <GoldForm
        mode={editingRow ? "edit" : "create"} // ถ้ามี editingRow → edit mode
        defaultValues={editingRow ?? undefined} // ส่งค่าเข้า GoldForm
        onCancel={() => {
          // onCancel: ถูกเรียกเมื่อผู้ใช้กด "Cancel Edit" ใน GoldForm
          setEditingRow(null);
        }}
        onSubmit={async (dto) => {
          if (editingRow) {
            try {
              // ----- UPDATE -----
              await updateGold(editingRow.id, dto); // ต้อง import API updateGold
              toast.success("Update successful!");
              setEditingRow(null); // กลับเป็น create mode
              // ✅ เพิ่มบรรทัดนี้: บังคับ Reset Sort กลับมาเป็น "แก้ไขล่าสุด"
              setFilters((prev: any) => ({ ...prev, sort: "updated_at:desc" }));

              refetch();
            } catch (error) {
              toast.error("Update failed");
            }
          } else {
            // ----- CREATE -----
            // อันนี้มี toast ใน hook useCreateGold อยู่แล้ว ไม่ต้องทำอะไร
            await m.mutateAsync(dto);
            // ✅ เพิ่มบรรทัดนี้: บังคับ Reset Sort กลับมาเป็น "แก้ไขล่าสุด" เช่นกัน
            setFilters((prev: any) => ({ ...prev, sort: "updated_at:desc" }));

            refetch();
          }
        }}
      />

      <div className="border border-gray-200 rounded-2xl p-4 mt-7 bg-white">
        <div className="flex justify-between px-4">
          <h5
            className="mb-4 text-lg font-semibold text-gray-700 md:text-lg lg:text-xl"
            style={{ marginBottom: "0" }}
          >
            {t("header.transactions")}
          </h5>
          {/* Exports */}
          <ExportButtons />
        </div>

        <SearchBar onChange={setFilters} onSubmit={refetch} />
        <hr className="h-px mb-5 bg-gray-300 border-0"></hr>

        <RecordsTable
          rows={rows}
          loading={isLoading}
          onDeleted={refetch}
          onEdit={(row) => setEditingRow(row)} // <<< ส่งค่าเข้า state
          page={page}
          limit={limit}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
        <Pagination
          page={page}
          limit={limit}
          total={total}
          onPageChange={(next) =>
            setFilters((prev) => ({ ...prev, page: next }))
          }
          onLimitChange={(next) =>
            setFilters((prev) => ({ ...prev, page: 1, limit: next }))
          }
        />
      </div>
    </div>
  );
}
