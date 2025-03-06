import { ApiResponse, Ride } from "@/types";
import { invoke } from "@tauri-apps/api/core";
import { z } from "zod";

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

export const getRideById = async (ride_id: string) => {
    try {
        return await invoke<ApiResponse<Ride>>("get_ride_by_id", {
            payload: {
                id: ride_id,
            },
        });
    } catch (error) {
        return { success: false, data: null, message: error };
    }
};

export const DeleteRideSchema = z.object({
    reason: z.string().min(50, {
        message: "At least 50 characters.",
    }),
});

export const UpdateRideSchema = z.object({
    id: z.string().length(36, {
        message: "Invalid ride ID",
    }),
    name: z.string().min(3, {
        message: "At least 3 characters.",
    }),
    description: z.string().min(10, {
        message: "At least 10 characters.",
    }),
    type: z.string().min(3, {
        message: "At least 3 characters.",
    }),
    pictures: z.array(z.string()).min(1, {
        message: "At least 1 picture.",
    }),
});

export async function allocateRideStaffPromise(
    ride_id: string,
    staff_id: string
) {
    try {
        return await invoke<ApiResponse<string>>("allocate_ride_staff", {
            payload: {
                staff_id: staff_id,
                ride_id: ride_id,
            },
        });
    } catch (error) {
        return { success: false, data: null, message: error };
    }
}

export async function clearRideStaff(ride_id: string) {
    try {
        return await invoke<ApiResponse<string>>(
            "clear_ride_staff_allocation",
            {
                payload: {
                    id: ride_id,
                },
            }
        );
    } catch (error) {
        return { success: false, data: null, message: error };
    }
}
