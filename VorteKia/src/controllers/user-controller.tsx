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

export const TopUpFormSchema = z.object({
    amount: z.number().min(10.0, {
        message: "Minimum top-up amount is $10.00.",
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

export async function topUpBalancePromise(
    data: z.infer<typeof TopUpFormSchema>
) {
    try {
        return await invoke<ApiResponse<UserLoggedIn>>("change_user_balance", {
            payload: {
                user_id: getUserSession()?.user_id,
                mutation: data.amount,
            },
        });
    } catch (error) {
        throw new Error("Failed to top up balance: " + error);
    }
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

export function getUserBalance() {
    const parsedUser = getUserSession();

    if (parsedUser == null) return 0;

    return parsedUser?.balance;
}

export async function refreshUserSession(): Promise<void> {
    const currUser = getUserSession();
    if (currUser == null) return;
    const user = await invoke<ApiResponse<UserLoggedIn>>("login_uid", {
        payload: {
            user_id: currUser?.user_id,
        },
    });

    if (user.success) {
        localStorage.removeItem("user");
        localStorage.setItem("user", JSON.stringify(user.data));
    }
}

export async function getCustName(user_id: string) {
    const response = await invoke<ApiResponse<string>>("get_username", {
        payload: {
            id: user_id,
        },
    });

    return response.data;
}
