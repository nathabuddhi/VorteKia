import { ApiResponse, MaintenanceJob } from "@/types";
import { invoke } from "@tauri-apps/api/core";
import { z } from "zod";

export async function getMaintenanceHistory(rideId: string) {
    try {
        return await invoke<ApiResponse<MaintenanceJob[]>>(
            "get_all_jobs_by_location",
            {
                payload: {
                    id: rideId,
                },
            }
        );
    } catch (error) {
        return { success: false, data: [], message: error };
    }
}

export async function createMaintenanceRequest(
    data: z.infer<typeof MaintenanceRequestSchema>,
    loc_id: string
) {
    try {
        return await invoke<ApiResponse<MaintenanceJob[]>>(
            "create_maintenance_job",
            {
                payload: {
                    location: loc_id,
                    description: data.description,
                    notes: data.notes,
                },
            }
        );
    } catch (error) {
        return { success: false, data: [], message: error };
    }
}

export const MaintenanceRequestSchema = z.object({
    description: z.string().max(20, {
        message: "Maximum 20 characters.",
    }),
    notes: z.string().min(50, {
        message: "At least 50 characters.",
    }),
});
