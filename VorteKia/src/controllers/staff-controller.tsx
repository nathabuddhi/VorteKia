import { ApiResponse, Ride, User } from "@/types";
import { invoke } from "@tauri-apps/api/core";
import { getUserSession } from "./user-controller";

export async function getAssignedRide() {
    const user = getUserSession();
    if (user === null)
        return { success: false, message: "User not found", data: null };
    if (user.role !== "staff" || user.division !== "operational")
        return {
            success: false,
            message: "Only ride staff can view assigned rides",
            data: null,
        };
    try {
        return await invoke<ApiResponse<Ride>>("get_assigned_ride", {
            payload: {
                id: user.user_id,
            },
        });
    } catch (error) {
        return { success: false, error, data: null };
    }
}

export async function getAllRideStaff(): Promise<ApiResponse<User[]>> {
    return await invoke<ApiResponse<User[]>>("get_all_ride_staff");
}

export async function getAssignedRideStaffByRide(rideId: string) {
    return await invoke<ApiResponse<User[]>>("get_allocated_ride_staff", {
        payload: {
            ride_id: rideId,
        },
    });
}
