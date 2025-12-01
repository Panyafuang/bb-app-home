import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  FaChartLine,
  FaClock,
  FaCoins,
  FaListUl,
  FaPlus,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { useDashboardSummary } from "../hooks/useDashboardSummary";
import { formatNumber, formatThaiDateExceptYear } from "@/utils/utils";
import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardOverview({
  onAddNew,
}: {
  onAddNew: () => void;
}) {
  const { t } = useTranslation("common");
  const { data, isLoading } = useDashboardSummary();

  // Component ย่อยสำหรับ Card
  const StatCard = ({ title, value, icon, colorClass, loading }: any) => (
    <div className="flex items-center p-6 bg-white border border-gray-200 rounded-2xl hover:shadow-sm transition-shadow">
      <div className={`p-4 rounded-xl ${colorClass} text-white mr-4`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        {loading ? (
          <Skeleton className="h-8 w-24 mt-1" />
        ) : (
          <h4 className="text-2xl font-bold text-gray-800 mt-1 truncate">
            {value}
          </h4>
        )}
      </div>
    </div>
  );

  // จัดการค่าที่จะแสดง (Handle null/undefined)
  const totalBalance = data?.totalBalance ? Number(data.totalBalance) : 0;
  const txCount = data?.transactionCount ? Number(data.transactionCount) : 0;
  const lastDate = data?.lastTransactionDate ? data.lastTransactionDate : null;

  return (
    <div className="space-y-8">
      {/* --- 1. Quick Summary Section --- */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          {t("dashboard.summary_title") || "Overview"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Gold Balance */}
          <StatCard
            title={t("dashboard.total_balance") || "Total Gold Balance"}
            value={`${formatNumber(totalBalance, 3)} g`}
            icon={<FaCoins size={24} />}
            colorClass="bg-gradient-to-br from-yellow-400 to-orange-500"
            loading={isLoading}
          />

          {/* Card 2: Recent Transactions */}
          <StatCard
            title={t("dashboard.recent_transactions") || "Recent Transactions"}
            value={`${txCount} รายการ`}
            icon={<FaListUl size={24} />}
            colorClass="bg-gradient-to-br from-blue-400 to-blue-600"
            loading={isLoading}
          />

          {/* Card 3: Last Transaction Date */}
          <StatCard
            title={t("dashboard.last_transaction") || "Last Update"}
            value={lastDate ? formatThaiDateExceptYear(lastDate) : "-"}
            icon={<FaClock size={24} />}
            colorClass="bg-gradient-to-br from-green-400 to-emerald-600"
            loading={isLoading}
          />

          {/* Card 4: Analytics Link (Clickable Card) */}
          <a
            href="http://170.60.215.99:3000" // ลิงก์ไป Grafana
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-6 bg-gray-900 border border-gray-900 rounded-2xl shadow-sm hover:bg-gray-800 transition-colors group cursor-pointer"
          >
            <div className="p-4 rounded-xl bg-gray-700 text-white mr-4 group-hover:bg-gray-600">
              <FaChartLine size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Analytics</p>
              <div className="flex items-center gap-2 text-white font-bold text-lg mt-1">
                Go to Grafana <FaExternalLinkAlt size={14} />
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* --- 2. Quick Actions Section --- */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          {t("dashboard.quick_actions") || "Quick Actions"}
        </h3>

        <div className="flex flex-wrap gap-4">
          {/* Button: Add New */}
          <button
            onClick={onAddNew}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transition-all transform active:scale-95"
          >
            <FaPlus />
            <span className="font-medium">
              {t("dashboard.add_new") || "Add Transaction"}
            </span>
          </button>

          {/* Button: View All */}
          <Link
            to="/materials/golds" // ลิงก์ไปหน้ารายการ
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            <FaListUl />
            <span className="font-medium">
              {t("dashboard.view_all") || "View All Records"}
            </span>
          </Link>

          {/* Button: Grafana */}
          <a
            href="http://170.60.215.99:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-white border border-orange-200 text-orange-700 rounded-xl hover:bg-orange-50 hover:border-orange-300 transition-all"
          >
            <FaChartLine />
            <span className="font-medium">
              {t("dashboard.open_grafana") || "Open Analytics"}
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
