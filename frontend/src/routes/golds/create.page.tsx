import Breadcrumbs from "@/components/Breadcrumbs";
import GoldForm from "@/features/golds/components/GoldForm";
import { useCreateGold } from "@/features/golds/hooks/useCreateGold";
import { useTranslation } from "react-i18next";

export default function GoldCreatePage() {
  const { t } = useTranslation("common");

  const m = useCreateGold();

  return (
    <div className="space-y-4">
      <Breadcrumbs />
      <div className="mb-6 flex items-center justify-start">
        <h1 className="mb-4 text-2xl font-semibold text-gray-700 dark:text-white md:text-2xl lg:text-3xl">
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-indigo-600">
            {t("header.material_report")}
          </span>
        </h1>
      </div>

      <GoldForm
        mode="create"
        onSubmit={async (dto) => {
          await m.mutateAsync(dto);
        }}
      />
    </div>
  );
}
