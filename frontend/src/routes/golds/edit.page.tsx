import Breadcrumbs from "@/components/Breadcrumbs";
import GoldForm from "@/features/golds/components/GoldForm";
import { useGold } from "@/features/golds/hooks/useGold";
import { useUpdateGold } from "@/features/golds/hooks/useUpdateGold";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

export default function GoldEditPage() {
  const { t } = useTranslation("common");

  // ดึง id จาก URL
  const { id = "" } = useParams();

  // ดึงข้อมูลทองคำจาก backend
  const { data } = useGold(id);

  // ฟังก์ชันสำหรับอัปเดตข้อมูล
  const updateGold = useUpdateGold(id);

  // ฟังก์ชันสำหรับเปลี่ยนหน้า
  const navigate = useNavigate();

  // ถ้ายังไม่มีข้อมูล แสดงข้อความโหลด
  if (!data) {
    return <div className="p-4">{t("utils.loading")}</div>;
  }

  // ฟังก์ชันที่เรียกเมื่อกดบันทึก
  const handleSubmit = async (
    formData: Parameters<typeof updateGold.mutateAsync>[0]
  ) => {
    await updateGold.mutateAsync(formData);
    navigate("/material/golds");
  };

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
      <GoldForm key={data.id} mode="edit" defaultValues={data} onSubmit={handleSubmit} />
    </div>
  );
}
