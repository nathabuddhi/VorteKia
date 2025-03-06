import { ApiResponse, Notification } from "@/types";
import { invoke } from "@tauri-apps/api/core";
import { getUserSession } from "./user-controller";

export async function getNotificationByUser(): Promise<
    ApiResponse<Notification[]>
> {
    const user = getUserSession();
    try {
        return await invoke<ApiResponse<Notification[]>>(
            "get_notification_by_user",
            {
                payload: {
                    id: user?.user_id,
                },
            }
        );
    } catch (error) {
        return { success: false, data: null, message: String(error) };
    }
}

export async function deleteNotification(notification_id: string) {
    try {
        return await invoke<ApiResponse<boolean>>("delete_notification", {
            payload: {
                id: notification_id,
            },
        });
    } catch (error) {
        return { success: false, data: false, message: String(error) };
    }
}
