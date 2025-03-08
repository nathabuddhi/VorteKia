import { ApiResponse } from "@/types";
import { invoke } from "@tauri-apps/api/core";
import { z } from "zod";

export const BroadcastFormSchema = z.object({
    content: z.string().min(3, {
        message: "At least 3 characters.",
    }),
});

export async function broadcastPromise(
    data: z.infer<typeof BroadcastFormSchema>,
    recepients: string[]
) {
    return await invoke<ApiResponse<string>>("send_broadcast", {
        payload: {
            content: data.content,
            recepients: recepients,
        },
    });
}
