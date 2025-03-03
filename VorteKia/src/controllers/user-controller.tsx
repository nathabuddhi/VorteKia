import { ApiResponse, UserLoggedIn } from "@/types";
import { invoke } from "@tauri-apps/api/core";
import { z } from "zod";

export const LoginFormSchema = z.object({
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
});

export const UIDLoginFormSchema = z.object({
    uid: z.string().length(36, {
        message: "Your UID should be 36 characters longs.",
    }),
});

export async function loginUIDPromise(
    data: z.infer<typeof UIDLoginFormSchema>
) {
    return await invoke<ApiResponse<UserLoggedIn>>("login_uid", {
        payload: {
            user_id: data.uid,
        },
    });
}

export async function loginPromise(data: z.infer<typeof LoginFormSchema>) {
    return await invoke<ApiResponse<UserLoggedIn>>("login", {
        payload: {
            email: data.email,
            password: data.password,
        },
    });
}

export async function requestUIDPromise(data: z.infer<typeof LoginFormSchema>) {
    return await invoke<ApiResponse<UserLoggedIn>>("login", {
        payload: {
            email: data.email,
            password: data.password,
        },
    });
}

export function getUserSession() {
    const userStorage = localStorage.getItem("user");
    const parsedUser: UserLoggedIn | null = userStorage
        ? JSON.parse(userStorage)
        : null;

    return parsedUser;
}

export function getUserName() {
    const parsedUser = getUserSession();

    if (parsedUser == null) return "Guest";

    return parsedUser?.name;
}

export function getUserDivision() {
    const parsedUser = getUserSession();

    if (parsedUser == null) return "";

    return parsedUser?.division;
}

export function getUserRole() {
    const parsedUser = getUserSession();

    if (parsedUser == null) return "";

    return parsedUser?.role;
}
