import { ApiResponse, Ride, User } from "@/types";
import { invoke } from "@tauri-apps/api/core";

export async function getAssignedRide(): Promise<ApiResponse<Ride>> {
    const user = localStorage.getItem("user");
    if (!user) {
        return { success: false, message: "User not logged in", data: null };
    }
    const parsedUser = JSON.parse(user);
    if (parsedUser.role !== "staff" || parsedUser.division !== "operational")
        return {
            success: false,
            message: "Only ride staff can view assigned rides",
            data: null,
        };
    return await invoke<ApiResponse<Ride>>("get_assigned_ride", {
        payload: {
            id: parsedUser.user_id,
        },
    });
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
