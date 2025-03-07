import { ApiResponse, ChatRoom, Message } from "@/types";
import { invoke } from "@tauri-apps/api/core";
import { getUserSession } from "./user-controller";

export function getChats(user_id: string) {
    return invoke<ApiResponse<ChatRoom[]>>("get_chat_rooms_by_user", {
        payload: {
            id: user_id,
        },
    });
}

export function getMessages(room_id: string) {
    return invoke<ApiResponse<Message[]>>("get_messages_by_room", {
        payload: {
            id: room_id,
        },
    });
}

export function getCSChats() {
    return invoke<ApiResponse<ChatRoom[]>>("get_all_cs_chats");
}

export function sendMessage(content: string, room_id: string) {
    const user = getUserSession();
    if (!user || !user.user_id) {
        return { success: false, data: null, message: "User not logged in" };
    }
    return invoke<ApiResponse<boolean>>("send_message", {
        payload: {
            message: content,
            room_id: room_id,
            user_id: user.user_id,
        },
    });
}
