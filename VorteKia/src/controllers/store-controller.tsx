import { ApiResponse, Souvenir, Transaction, Store } from "@/types";
import { invoke } from "@tauri-apps/api/core";
import { z } from "zod";
import { getUserSession } from "./user-controller";

export const getStoreById = async (store_id: string) => {
    try {
        return await invoke<ApiResponse<Store>>("get_store_by_id", {
            payload: {
                id: store_id,
            },
        });
    } catch (error) {
        return { success: false, data: null, message: error };
    }
};

export const getAllStores = async () => {
    try {
        return await invoke<ApiResponse<Store[]>>("get_all_stores");
    } catch (error) {
        return { success: false, data: null, message: error };
    }
};

export const UpdateStoreSchema = z.object({
    id: z.string().length(36, {
        message: "Invalid store ID",
    }),
    name: z.string().min(3, {
        message: "At least 3 characters.",
    }),
    description: z.string().min(10, {
        message: "At least 10 characters.",
    }),
    // pictures: z.array(z.string()).min(1, {
    //     message: "At least 1 picture.",
    // }),
    opening: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/, {
        message: "Time format must be HH:MM:SS",
    }),
    closing: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/, {
        message: "Time format must be HH:MM:SS",
    }),
});

export const CreateStoreSchema = z.object({
    name: z.string().min(3, {
        message: "At least 3 characters.",
    }),
    description: z.string().min(10, {
        message: "At least 10 characters.",
    }),
    // pictures: z.array(z.string()).min(1, {
    //     message: "At least 1 picture.",
    // }),
    opening: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/, {
        message: "Time format must be HH:MM:SS",
    }),
    closing: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/, {
        message: "Time format must be HH:MM:SS",
    }),
});

export async function createStorePromise(
    data: z.infer<typeof CreateStoreSchema>
) {
    try {
        return await invoke<ApiResponse<String>>("create_store", {
            payload: {
                name: data.name,
                description: data.description,
                opening: data.opening,
                closing: data.closing,
                pictures: [""],
            },
        });
    } catch (error) {
        return { success: false, data: null, message: String(error) };
    }
}

export async function createTransactionPromise(souvenir_id: string) {
    return await invoke<ApiResponse<String>>("create_transaction", {
        payload: {
            user_id: getUserSession()?.user_id,
            souvenir_id: souvenir_id,
            quantity: 1,
            payment: "VorteKia Balance",
        },
    });
}

export async function getAllSouvenirByStore(store_id: string) {
    return await invoke<ApiResponse<Souvenir[]>>("get_store_souvenir", {
        payload: {
            id: store_id,
        },
    });
}

export async function getCustomerTransactions(store_id: string) {
    return await invoke<ApiResponse<Transaction[]>>(
        "get_transactions_customer",
        {
            payload: {
                user_id: getUserSession()?.user_id,
                store_id: store_id,
            },
        }
    );
}

export async function getAssignedStore() {
    return await invoke<ApiResponse<Store>>("get_assigned_store", {
        payload: {
            id: getUserSession()?.user_id,
        },
    });
}

export async function getAllStoreTransactions(store_id: string) {
    return await invoke<ApiResponse<Transaction[]>>("get_transactions_store", {
        payload: {
            id: store_id,
        },
    });
}

export async function clearStaffAllocation(store_id: string) {
    try {
        return await invoke<ApiResponse<string>>(
            "clear_store_associate_allocation",
            {
                payload: {
                    id: store_id,
                },
            }
        );
    } catch (error) {
        return { success: false, data: null, message: error };
    }
}

export async function allocateStaffPromise(store_id: string, staff_id: string) {
    try {
        return await invoke<ApiResponse<string>>("allocate_store_associate", {
            payload: {
                staff_id: staff_id,
                loc_id: store_id,
            },
        });
    } catch (error) {
        return { success: false, data: null, message: error };
    }
}

export async function editStorePromise(
    data: z.infer<typeof UpdateStoreSchema>
): Promise<ApiResponse<String>> {
    try {
        return await invoke<ApiResponse<String>>("edit_store", {
            payload: {
                id: data.id,
                name: data.name,
                description: data.description,
                opening: data.opening,
                closing: data.closing,
                pictures: [""],
            },
        });
    } catch (error) {
        return { success: false, data: null, message: String(error) };
    }
}

export async function deleteStorePromise(
    id: string
): Promise<ApiResponse<boolean>> {
    return await invoke<ApiResponse<boolean>>("delete_store", {
        payload: {
            id: id,
        },
    });
}
