import { FaFilePdf } from "react-icons/fa6";
import { FaFileCsv } from "react-icons/fa";

import { useGoldsQuery } from "@/features/golds/hooks/useGoldsQuery";
import RecordsTable from "@/features/golds/components/RecordsTable";
import Pagination from "@/components/ui/Pagination";
import Breadcrumbs from "@/components/Breadcrumbs";
// import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SearchBar from "@/features/golds/components/SearchBar";
import { useCreateGold } from "@/features/golds/hooks/useCreateGold";
import GoldForm from "@/features/golds/components/GoldForm";

/**
 * หน้ารายการ: มี SearchBar + Table + Pagination
 */
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
        mode="create"
        // onSubmit={async (dto) => {
        //   await m.mutateAsync(dto);
        // }}

        onSubmit={async (dto) => {
          // 1. สั่งสร้างข้อมูล (เหมือนเดิม)
          await m.mutateAsync(dto);

          // 2. (เพิ่ม) สั่งให้ตารางโหลดข้อมูลใหม่!
          refetch();
        }}
      />

      {/* <hr className="h-px my-8 bg-gray-300 border-0"></hr> */}
      <hr className="w-48 h-1 mx-auto my-4 bg-gray-300 border-0 rounded-sm md:my-10"></hr>
      <div className="border border-gray-200 rounded-2xl p-4 mt-7">
        <div className="flex justify-between px-4">
          <h5
            className="mb-4 text-lg font-semibold text-gray-700 md:text-2xl lg:text-3xl"
            style={{ marginBottom: "0" }}
          >
            {t("header.transactions")}
            {/* <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-indigo-600"> */}
            {/* </span> */}
          </h5>

          {/* Buttons */}
          <div className="md:col-span-2 flex justify-end gap-2 self-end">
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg px-4 py-2 hover:bg-gray-50 text-sm border border-gray-200"
            >
              <FaFilePdf />
              {t("button.exports.pdf")}
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg px-4 py-2 hover:bg-gray-50 text-sm border border-gray-200"
            >
              <FaFileCsv />
              {t("button.exports.csv")}
            </button>
          </div>
        </div>

        <SearchBar onChange={setFilters} onSubmit={refetch} />
        <hr className="h-px mb-5 bg-gray-300 border-0"></hr>

        <RecordsTable
          rows={rows}
          loading={isLoading}
          onDeleted={refetch}
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
