import { useMutation } from "@tanstack/react-query";
import { deleteGold } from "@/api/goldsClient";
import { notify } from "@/lib/toast";


export function useDeleteGold() {
    return useMutation({
        mutationFn: (id: string) => deleteGold(id),
        onSuccess: () => notify.success("Deleted"),
        onError: () => notify.error("Delete failed")
    });
}