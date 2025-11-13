import { createGold } from "@/api/goldsClient";
import { notify } from "@/lib/toast";
import { useMutation } from "@tanstack/react-query";

export function useCreateGold() {
    return useMutation({
        mutationFn: createGold,
        onSuccess: () => notify.success("Created"),
        onError: () => notify.error("Create failed")
    });
}