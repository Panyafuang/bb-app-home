/**
 * ดึงรายการรายการทองแบบมีฟิลเตอร์/พารามิเตอร์ (page/limit/...)
 * - เก็บ state ฟิลเตอร์ไว้ใน component (setFilters)
 * - ให้ react-query เรียก listGolds ตาม filters
 */
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { listGolds } from "@/api/goldsClient";
import { useState } from "react";
import type { GoldRecord, ListParams, Paged } from "@/features/golds/types";


/**
 * โหลดรายการทองแบบมีพารามิเตอร์ (page/limit/filters)
 */
export function useGoldsQuery(initial: ListParams = { page: 1, limit: 100 }) {
  // เก็บตัวกรองค้นหา/หน้า/จำนวนต่อหน้าไว้ใน state
  const [filters, setFilters] = useState<ListParams>(initial);

  const q = useQuery<Paged<GoldRecord>, Error>({
    queryKey: ["golds", filters], // key เปลี่ยนเมื่อ filters เปลี่ยน → refetch
    queryFn: () => listGolds(filters),
    placeholderData: keepPreviousData, // v5 ใช้แบบนี้แทน
  });

  return { ...q, filters, setFilters };
}
