import { ApiResponse, Proposal } from "@/types";
import { invoke } from "@tauri-apps/api/core";
import { z } from "zod";

export async function getProposals(user_role: string) {
    return await invoke<ApiResponse<Proposal[]>>("get_proposal_by_user", {
        payload: {
            id: user_role,
        },
    });
}

export const CreateProposalSchema = z.object({
    subject: z.string().min(5, {
        message: "At least 5 characters.",
    }),
    recepient: z.string().length(3, {
        message: "Recepient must be an executive level staff!",
    }),
    content: z.string().min(10, {
        message: "At least 10 characters.",
    }),
});

export async function createProposalPromise(
    data: z.infer<typeof CreateProposalSchema>
): Promise<ApiResponse<String>> {
    try {
        return await invoke<ApiResponse<String>>("create_proposal", {
            payload: {
                subject: data.subject,
                recepient: data.recepient,
                content: data.content,
            },
        });
    } catch (error) {
        return { success: false, data: null, message: String(error) };
    }
}
