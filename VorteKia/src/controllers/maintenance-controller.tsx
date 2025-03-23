import { ApiResponse, MaintenanceJob, User } from "@/types";
import { invoke } from "@tauri-apps/api/core";
import { z } from "zod";
import { getUserSession } from "./user-controller";

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

export async function createMaintenanceJob(
    data: z.infer<typeof CreateJobSchema>
) {
    try {
        return await invoke<ApiResponse<MaintenanceJob[]>>(
            "create_maintenance_job",
            {
                payload: {
                    location: data.location,
                    description: data.description,
                    notes: data.notes,
                },
            }
        );
    } catch (error) {
        return { success: false, data: [], message: error };
    }
}

export const CreateJobSchema = z.object({
    location: z.string().min(3, {
        message: "At least 3 characters.",
    }),
    description: z.string().max(20, {
        message: "Maximum 20 characters.",
    }),
    notes: z.string().min(20, {
        message: "At least 20 characters.",
    }),
});

export async function submitJobReport(report: string, job: MaintenanceJob) {
    try {
        return await invoke<ApiResponse<MaintenanceJob>>("edit_job_details", {
            payload: {
                job_id: job.job_id,
                location: job.location,
                deadline: job.deadline,
                description: job.description,
                status: job.status,
                notes: job.notes,
                report: report,
            },
        });
    } catch (error) {
        return { success: false, data: null, message: error };
    }
}

export async function assignMaintenanceJob(job_id: string, staff_id: string) {
    try {
        return await invoke<ApiResponse<string>>("allocate_ride_staff", {
            payload: {
                staff_id: staff_id,
                loc_id: job_id,
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

export async function getAllJobs() {
    return await invoke<ApiResponse<MaintenanceJob[]>>("get_all_jobs", {});
}

export async function getJobById(jobId: string) {
    return await invoke<ApiResponse<MaintenanceJob>>("get_job_by_id", {
        payload: { id: jobId },
    });
}

export async function getAssignedStaffByJob(jobId: string) {
    return await invoke<ApiResponse<User[]>>(
        "get_allocated_maintenance_staff",
        {
            payload: {
                id: jobId,
            },
        }
    );
}

export async function clearMaintenanceJobStaff(jobId: string) {
    return await invoke<ApiResponse<string>>("clear_job_allocation", {
        payload: {
            id: jobId,
        },
    });
}

export async function editJobPromise(data: z.infer<typeof EditJobSchema>) {
    const pre_payload: MaintenanceJob = {
        job_id: data.job_id ?? "",
        description: data.description,
        notes: data.notes,
        status: data.status,
        report: data.report ?? "",
        deadline: data.deadline?.toISOString().split("T")[0] ?? "",
        location: data.location,
    };

    const payload = JSON.stringify({
        job_id: pre_payload.job_id,
        description: pre_payload.description,
        notes: pre_payload.notes,
        status: pre_payload.status,
        report: pre_payload.report,
        deadline: pre_payload.deadline,
        location: pre_payload.location,
    });

    return await invoke<ApiResponse<MaintenanceJob>>("edit_job_details", {
        payload: payload,
    });
}

export const EditJobSchema = z.object({
    job_id: z
        .string()
        .length(36, {
            message: "Invalid job ID",
        })
        .optional(),
    description: z.string().min(3, {
        message: "At least 3 characters.",
    }),
    notes: z.string().min(10, {
        message: "At least 10 characters.",
    }),
    status: z.string().min(3, {
        message: "At least 3 characters.",
    }),
    report: z.string().optional(),
    deadline: z.date().optional(),
    location: z.string().min(3, {
        message: "At least 3 characters.",
    }),
});

export async function getAllMaintenanceStaff() {
    return await invoke<ApiResponse<User[]>>("get_all_maintenance_staff", {});
}

export async function allocateMaintenanceStaffPromise(
    jobId: string,
    staffId: string
) {
    return await invoke<ApiResponse<string>>("assign_maintenance_job", {
        payload: {
            loc_id: jobId,
            staff_id: staffId,
        },
    });
}

export async function getStaffAssignment() {
    const user = getUserSession();
    if (!user) return { success: false, data: null, message: "No user found." };
    return await invoke<ApiResponse<MaintenanceJob>>("get_assigned_job", {
        payload: {
            id: user.user_id,
        },
    });
}

export async function deleteJobPromise(id: string) {
    return await invoke<ApiResponse<boolean>>("delete_job", {
        payload: {
            id: id,
        },
    });
}