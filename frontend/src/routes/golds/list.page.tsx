import { useGoldsQuery } from "@/features/golds/hooks/useGoldsQuery";
import RecordsTable from "@/features/golds/components/RecordsTable";
import Pagination from "@/components/ui/Pagination";
import Breadcrumbs from "@/components/Breadcrumbs";

/**
 * หน้ารายการ: มี SearchBar + Table + Pagination
 */
export default function GoldListPage() {
  const { data, isLoading, filters, setFilters, refetch } = useGoldsQuery({
    page: 1,
    limit: 5, // จำนวนต่อหน้าเริ่มต้น
  });
  const rows = Array.isArray(data) ? data : data?.items ?? [];
  const page = data?.page ?? filters.page ?? 1;
  const limit = data?.limit ?? filters.limit ?? 10;
  const total = data?.total ?? 0;

  return (
    <div className="space-y-4">
      <Breadcrumbs />
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
