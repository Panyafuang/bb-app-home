import Breadcrumbs from "@/components/Breadcrumbs";
import GoldForm from "@/features/golds/components/GoldForm";
import { useCreateGold } from "@/features/golds/hooks/useCreateGold";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function GoldCreatePage() {
  const { t } = useTranslation("common");

  const m = useCreateGold();
  const nav = useNavigate();

  return (
    <div className="space-y-4">
      <div className="mb-6 flex items-center justify-between">
        {/* ส่วนที่แก้ไข: เพิ่มหัวข้อ รายงานสินค้า/วัตถุดิบ */}
        <h1 className="text-2xl font-semibold">
          <span className="text-blue-700">{t("header.material_report")}</span>
        </h1>
      </div>
      <Breadcrumbs />

      <GoldForm
        mode="create"
        onSubmit={async (dto) => {
          await m.mutateAsync(dto);
        }}
      />
    </div>
  );
}
