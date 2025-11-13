import { updateGold } from "@/api/goldsClient";
import { notify } from "@/lib/toast";
import { useMutation } from "@tanstack/react-query";

export function useUpdateGold(id: string) {
  return useMutation({
    mutationFn: (dto: any) => updateGold(id, dto),
    onSuccess: () => notify.success("Updated"),
    onError: () => notify.error("Update failed"),
  });
}
