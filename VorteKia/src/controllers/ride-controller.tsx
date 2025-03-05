import { ApiResponse, Ride } from "@/types";
import { invoke } from "@tauri-apps/api/core";

export const getRides = async () => {
    try {
        return await invoke<ApiResponse<Ride[]>>("get_all_rides");
    } catch (error) {
        return { success: false, data: [], message: error };
    }
};

export const queuePromise = async (ride_id: string) => {
    try {
        const user = localStorage.getItem("user");
        if (!user) {
            return { success: false, message: "User not logged in" };
        }
        const parsedUser = JSON.parse(user);
        if (parsedUser.role !== "customer")
            return {
                success: false,
                message: "Only customers can queue for rides",
            };
        return await invoke<ApiResponse<boolean>>("add_ride_queue", {
            payload: {
                user_id: parsedUser.user_id,
                ride_id: ride_id,
            },
        });
    } catch (error) {
        return { success: false, message: error };
    }
};

export const dequeuePromise = async (ride_id: string) => {
    try {
        const user = localStorage.getItem("user");
        if (!user) {
            return { success: false, message: "User not logged in" };
        }
        const parsedUser = JSON.parse(user);
        if (parsedUser.role !== "customer")
            return {
                success: false,
                message: "Only customers can queue for rides",
            };
        return await invoke<ApiResponse<boolean>>("leave_ride_queue", {
            payload: {
                user_id: parsedUser.user_id,
                ride_id: ride_id,
            },
        });
    } catch (error) {
        return { success: false, message: error };
    }
};

export const checkIsInQueue = async (user_id: string) => {
    try {
        return await invoke<ApiResponse<boolean>>("is_user_in_queue", {
            payload: {
                user_id: user_id,
            },
        });
    } catch (error) {
        return { data: false, success: false, message: error };
    }
};

export const getQueuePos = (ride_queue: string[]): number => {
    try {
        const user = localStorage.getItem("user");
        if (!user) return 0;
        const parsedUser = JSON.parse(user);
        if (!parsedUser) return 0;

        if (ride_queue === null) return 0;

        if (!ride_queue.includes(parsedUser.user_id)) return 0;

        for (let i = 0; i < ride_queue.length; i++) {
            if (ride_queue[i] === parsedUser.user_id) {
                return i + 1;
            }
        }
    } catch (error) {
        console.error("Error checking queue:", error);
        return 0;
    }
    return 0;
};
