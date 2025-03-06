import { ApiResponse, Division, UserLoggedIn } from "@/types";
import { invoke } from "@tauri-apps/api/core";
import { z } from "zod";

export const StaffFormSchema = z.object({
    email: z
        .string()
        .min(1, {
            message: "Required",
        })
        .email({
            message: "Email must be a valid email address.",
        }),
    password: z.string().min(1, {
        message: "Required",
    }),
    name: z.string().min(1, {
        message: "Required",
    }),
    division_id: z.string().min(1, {
        message: "Required",
    }),
    role: z.string().min(1, {
        message: "Required",
    }),
});

export const CreateCustomerFormSchema = z.object({
    email: z
        .string()
        .min(1, {
            message: "Required",
        })
        .email({
            message: "Email must be a valid email address.",
        }),
    password: z.string().min(8, {
        message: "At least 8 characters long.",
    }),
    name: z.string().min(5, {
        message: "At least 8 characters long.",
    }),
});

export async function createStaffPromise(
    data: z.infer<typeof StaffFormSchema>
) {
    try {
        return await invoke<ApiResponse<string>>("create_staff_account", {
            payload: {
                email: data.email,
                password: data.password,
                name: data.name,
                division_id: data.division_id,
                role: data.role,
            },
        });
    } catch (error) {
        return { success: false, data: null, message: error };
    }
}

export async function createCustomerPromise(
    data: z.infer<typeof CreateCustomerFormSchema>
) {
    try {
        return await invoke<ApiResponse<string>>("create_customer_account", {
            payload: {
                email: data.email,
                password: data.password,
                name: data.name,
                balance: 0,
            },
        });
    } catch (error) {
        return { success: false, data: null, message: error };
    }
}

export const getDivisions = async () => {
    try {
        return await invoke<ApiResponse<Division[]>>("get_all_divisions");
    } catch (error) {
        return { success: false, data: [], message: error };
    }
};
