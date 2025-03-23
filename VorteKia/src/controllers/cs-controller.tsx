import { ApiResponse, LostItem } from "@/types";
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

export async function getLostItems() {
    return await invoke<ApiResponse<LostItem[]>>("get_lost_items");
}

export async function getLostItemById(id: string) {
    return await invoke<ApiResponse<LostItem>>("get_lost_item_by_id", {
        payload: {
            id: id,
        },
    });
}

export const CreateLostItemSchema = z
    .object({
        image: z
            .string()
            .optional()
            .nullable()
            .transform((val) => val ?? "none"),
        name: z.string().min(3, {
            message: "At least 5 characters.",
        }),
        description: z.string().min(10, {
            message: "At least 10 characters.",
        }),
        last_seen: z
            .string()
            .optional()
            .nullable()
            .transform((val) => val ?? ""),
        color: z
            .string()
            .optional()
            .nullable()
            .transform((val) => val ?? ""),
        status: z
            .string()
            .optional()
            .nullable()
            .transform((val) => val ?? ""),
        found_at: z
            .string()
            .optional()
            .nullable()
            .transform((val) => val ?? ""),
        finder_id: z
            .string()
            .optional()
            .nullable()
            .transform((val) => val ?? ""),
        owner_id: z
            .string()
            .optional()
            .nullable()
            .transform((val) => val ?? ""),
    })
    .superRefine((data, ctx) => {
        if (data.status === "Found") {
            if (!data.image) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Image is required when status is Found.",
                    path: ["image"],
                });
            }
            if (!data.found_at || data.found_at.trim() === "") {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Found At is required when status is Found.",
                    path: ["found_at"],
                });
            }
            if (!data.finder_id || data.finder_id.trim() === "") {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Finder ID is required when status is Found.",
                    path: ["finder_id"],
                });
            }
        }

        if (data.status === "Missing") {
            if (!data.last_seen || data.last_seen.trim() === "") {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Last Seen is required when status is Missing.",
                    path: ["last_seen"],
                });
            }
            if (!data.owner_id || data.owner_id.trim() === "") {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Owner ID is required when status is Missing.",
                    path: ["owner_id"],
                });
            }
        }
    });

export const EditLostItemSchema = z
    .object({
        item_id: z.string().length(36, {
            message: "Invalid item id.",
        }),
        image: z
            .string()
            .optional()
            .nullable()
            .transform((val) => val ?? "none"),
        name: z.string().min(3, {
            message: "At least 5 characters.",
        }),
        description: z.string().min(10, {
            message: "At least 10 characters.",
        }),
        last_seen: z
            .string()
            .optional()
            .nullable()
            .transform((val) => val ?? ""),
        color: z
            .string()
            .optional()
            .nullable()
            .transform((val) => val ?? ""),
        status: z
            .string()
            .optional()
            .nullable()
            .transform((val) => val ?? ""),
        found_at: z
            .string()
            .optional()
            .nullable()
            .transform((val) => val ?? ""),
        finder_id: z
            .string()
            .optional()
            .nullable()
            .transform((val) => val ?? ""),
        owner_id: z
            .string()
            .optional()
            .nullable()
            .transform((val) => val ?? ""),
    })
    .superRefine((data, ctx) => {
        if (data.status === "Found") {
            if (!data.image) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Image is required when status is Found.",
                    path: ["image"],
                });
            }
            if (!data.found_at || data.found_at.trim() === "") {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Found At is required when status is Found.",
                    path: ["found_at"],
                });
            }
            if (!data.finder_id || data.finder_id.trim() === "") {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Finder ID is required when status is Found.",
                    path: ["finder_id"],
                });
            }
        }

        if (data.status === "Missing") {
            if (!data.last_seen || data.last_seen.trim() === "") {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Last Seen is required when status is Missing.",
                    path: ["last_seen"],
                });
            }
            if (!data.owner_id || data.owner_id.trim() === "") {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Owner ID is required when status is Missing.",
                    path: ["owner_id"],
                });
            }
        }
    });

export async function EditLostItemPromise(
    data: z.infer<typeof EditLostItemSchema>
) {
    return await invoke<ApiResponse<string>>("edit_item", {
        payload: data,
    });
}

export async function CreateLostItemPromise(
    data: z.infer<typeof CreateLostItemSchema>
) {
    return await invoke<ApiResponse<string>>("create_lost_item", {
        payload: data,
    });
}

export async function DeleteLostItemPromise(id: string) {
    return await invoke<ApiResponse<string>>("delete_item", {
        payload: {
            id: id,
        },
    });
}
