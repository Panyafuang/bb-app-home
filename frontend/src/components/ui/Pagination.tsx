import { useTranslation } from "react-i18next";

export default function Pagination({
  page,
  limit,
  total = 0,
  onPageChange,
  onLimitChange // (ถ้าจะมีตัวเลือกต่อหน้า)
}: {
  page: number;
  limit: number;
  total?: number;
  onPageChange: (nextPage: number) => void;
  onLimitChange?: (nextLimit: number) => void;
}) {
  const { t } = useTranslation("common");
  const totalPages = Math.max(1, Math.ceil((total ?? 0) / Math.max(1, limit)));
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total ?? 0);

  return (
    <div className="mt-3 flex flex-col items-start justify-between gap-3 text-sm md:flex-row md:items-center">
      <div className="text-gray-600">
        {t("pagination.showing")} <span className="font-medium">{start}-{end}</span> {t("pagination.of")}{" "}
        <span className="font-medium">{total ?? 0}</span>
      </div>

      <div className="flex items-center gap-3">
        {onLimitChange && (
          <label className="flex items-center gap-2">
            <span className="text-gray-600">{t("pagination.perPage")}</span>
            <select
              className="rounded-md border px-2 py-1"
              value={limit}
              onChange={(e) => onLimitChange?.(Number(e.target.value))}
            >
              {[5, 10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
        )}

        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border px-3 py-1 disabled:opacity-40"
            disabled={!canPrev}
            onClick={() => onPageChange(page - 1)}
          >
            {t("pagination.prev")}
          </button>

          {Array.from({ length: totalPages })
            .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
            .map((_, i) => {
              const firstShown = Math.max(1, page - 2);
              const p = firstShown + i;
              return (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`rounded-lg border px-3 py-1 ${
                    p === page ? "bg-gray-900 text-white" : "hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              );
            })}

          <button
            className="rounded-lg border px-3 py-1 disabled:opacity-40"
            disabled={!canNext}
            onClick={() => onPageChange(page + 1)}
          >
            {t("pagination.next")}
          </button>
        </div>
      </div>
    </div>
  );
}
