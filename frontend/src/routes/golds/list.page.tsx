import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useGoldsQuery } from "@/features/golds/hooks/useGoldsQuery";
import RecordsTable from "@/features/golds/components/RecordsTable";
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
    limit: 50, // จำนวนต่อหน้าเริ่มต้น
  });
  const rows = Array.isArray(data) ? data : data?.items ?? [];
  const page = data?.page ?? filters.page ?? 1;
  const limit = data?.limit ?? filters.limit ?? 10;
  const total = data?.total ?? 0;

  const [editingRow, setEditingRow] = useState<any | null>(null);

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
            // ----- UPDATE -----
            await updateGold(editingRow.id, dto); // ต้อง import API updateGold
            setEditingRow(null); // กลับเป็น create mode
            refetch();
          } else {
            // ----- CREATE -----
            await m.mutateAsync(dto);
            refetch();
          }
        }}
      />

      <div className="border border-gray-200 rounded-2xl p-4 mt-7 bg-white">
        <div className="flex justify-between px-4">
          <h5
            className="mb-4 text-2xl font-semibold text-gray-700 md:text-xl lg:text-3xl"
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
