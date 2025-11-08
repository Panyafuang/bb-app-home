import { useGoldsQuery } from "@/features/golds/hooks/useGoldsQuery";
import RecordsTable from "@/features/golds/components/RecordsTable";
import Pagination from "@/components/ui/Pagination";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/**
 * หน้ารายการ: มี SearchBar + Table + Pagination
 */
export default function GoldListPage() {
  const { t } = useTranslation("common");

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
      <div className="flex items-center justify-end">
        {/* <Breadcrumbs
          items={[
            { label: t("crumb.home"), href: "/" },
            { label: t("crumb.golds") },
          ]}
        /> */}

        {/* ปุ่ม “เพิ่มรายการ” */}
        <Link
          to="/materials/golds/new"
          className="inline-flex items-center text-white bg-linear-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-linear-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
        >
          + {t("actions.add")}
        </Link>
      </div>
      {/* <SearchBar onChange={setFilters} onSubmit={refetch} /> */}
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
        onPageChange={(next) => setFilters((prev) => ({ ...prev, page: next }))}
        onLimitChange={(next) =>
          setFilters((prev) => ({ ...prev, page: 1, limit: next }))
        }
      />
    </div>
  );
}
