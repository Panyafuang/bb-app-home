import { getDashboardSummary } from "@/api/goldsClient";
import { useQuery } from "@tanstack/react-query";

export function useDashboardSummary() {
    return useQuery({
        queryKey: ["dashboard-summary"],
        queryFn: getDashboardSummary,
        // refetch ทุกๆ 1 นาที เพื่อให้ข้อมูลสดใหม่เสมอ (Optional)
        // refetchInterval: 60 * 1000,
    });
}