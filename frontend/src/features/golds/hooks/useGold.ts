import { getGold } from "@/api/goldsClient";
import { useQuery } from "@tanstack/react-query";

export function useGold(id: string) {
    return useQuery({
        queryKey: ["gold", id],
        queryFn: () => getGold(id),
        enabled: !!id
    });
}