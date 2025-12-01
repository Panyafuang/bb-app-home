import DashboardOverview from "@/features/dashboard/components/DashboardOverview";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <DashboardOverview
      // ✅ สั่งให้เปลี่ยนหน้าไปที่ /materials/golds เมื่อกดปุ่ม
      onAddNew={() => navigate("/materials/golds")}
    />
  );
}
