use chrono::{Duration, Utc};
use sea_orm::{ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, QueryOrder, Set, ActiveModelTrait};
use serde::{Deserialize, Serialize};
use tauri::{command, State};
use uuid::Uuid;
use crate::{ApiResponse, AppState};
use super::division_handler::get_id_by_name;
use super::ride_handler::SingleUidRequest;
use super::user_handler::{get_user_by_id, LoginUIDRequest};
use entity::chat_room::{ActiveModel as ChatRoomActiveModel, Model as ChatRoomModel, Entity as ChatRoomEntities};
use entity::chat_room_detail::{Entity as ChatRoomDetailEntities, ActiveModel as ChatRoomDetailActiveModel};
use entity::message::{Model as MessageModel, Entity as MessageEntities, ActiveModel as MessageActiveModel};
use chrono::NaiveDateTime;

#[command] 
pub async fn get_chat_rooms_by_user(
    state: State<'_, AppState>,
    payload: SingleUidRequest,
) -> Result<ApiResponse<Vec<ChatRoomModel>>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let user = get_user_by_id(state.clone(), LoginUIDRequest { user_id: payload.id.clone() }).await;

    let user_detail = match user {
        Ok(ApiResponse::Success { data, .. }) => data,
        _ => return Err("Failed to get user details".to_string()),
    };

    let division_id_response = get_id_by_name(state.clone(), user_detail.division).await;

    let division_id = match division_id_response {
        Ok(api_response) => match api_response {
            api_response => api_response
        },
        Err(_) => "Unknown".to_string(),
    };
    
    let chat_room_details = ChatRoomDetailEntities::find()
        .filter(
            <ChatRoomDetailEntities as EntityTrait>::Column::UserId.eq(payload.id.clone())
        )
        .all(&db)
        .await
        .map_err(|e| format!("Error fetching chat room details: {}", e))?;

    let chat_room_ids: Vec<String> = chat_room_details.iter()
        .map(|detail| detail.room_id.clone())
        .collect();

    let chat_rooms = ChatRoomEntities::find()
        .filter(<ChatRoomEntities as EntityTrait>::Column::RoomId.is_in(chat_room_ids)
        .or(<ChatRoomEntities as EntityTrait>::Column::RoomId.eq(division_id.clone())))
        .all(&db)
        .await
        .map_err(|e| format!("Error fetching chat rooms: {}", e))?;

    Ok(ApiResponse::success(chat_rooms, "Successfully fetched chat rooms!".to_string()))
}

#[derive(Deserialize, Serialize)]
pub struct MessageReturn {
    pub message_id: String,
    pub sender_name: String,
    pub room_id: String,
    pub content: String,
    pub timestamp: NaiveDateTime,
}

#[command]
pub async fn get_messages_by_room(
    state: State<'_, AppState>,
    payload: SingleUidRequest,
) -> Result<ApiResponse<Vec<MessageReturn>>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    match MessageEntities::find()
        .filter(<MessageEntities as EntityTrait>::Column::RoomId.eq(payload.id))
        .order_by_asc(<MessageEntities as EntityTrait>::Column::Timestamp)
        .all(&db)
        .await
    {
        Ok(messages) => {
            let mut message_returns = Vec::new();
            
            for message in messages {
                let user_res = get_user_by_id(state.clone(), LoginUIDRequest { user_id: message.sender_id}).await;
                let sender_name = match user_res {
                    Ok(api_response) => match api_response {
                        ApiResponse::Success { data, .. } => data.name.clone(), 
                        ApiResponse::Error { .. } => "Unknown".to_string(), 
                    },
                    Err(_) => "Unknown".to_string(),
                };

                message_returns.push( MessageReturn {
                    message_id: message.message_id.clone(),
                    sender_name: sender_name.to_string(),
                    room_id: message.room_id.clone(),
                    content: message.content.clone(),
                    timestamp: message.timestamp.clone(),
                })
            }

            Ok(ApiResponse::success(message_returns, "Successfully fetched messages!".to_string()))
        },
        Err(err) => Ok(ApiResponse::error(None, format!("Database error: {}", err))),
    }
}

#[derive(Deserialize)]
pub struct SendMessageRequest {
    pub room_id: String,
    pub user_id: String,
    pub message: String,
}
#[command] 
pub async fn send_message(
    state: State<'_, AppState>,
    payload: SendMessageRequest,
) -> Result<ApiResponse<MessageModel>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let generated_id = Uuid::new_v4();

    let new_message = MessageActiveModel {
        message_id: Set(generated_id.to_string()),
        room_id: Set(payload.room_id.clone()),
        sender_id: Set(payload.user_id.clone()),
        content: Set(payload.message.clone()),
        timestamp: Set(Utc::now().naive_utc() + Duration::hours(7)),
    };

    match new_message.insert(&db).await {
        Ok(inserted_message) => Ok(ApiResponse::success(inserted_message, "Message sent!".to_string())),
        Err(e) => Err(format!("Database error: {}", e)),
    }
}

#[command]
pub async fn create_cs_room(
    state: State<'_, AppState>,
    payload: SingleUidRequest,
) -> Result<ApiResponse<ChatRoomModel>, String> { 
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let generated_id = Uuid::new_v4();

    let new_room = ChatRoomActiveModel {
        room_id: Set(generated_id.to_string()),
        name: Set(format!("Customer Service - {}", payload.id)),
    };

    match new_room.insert(&db).await {
        Ok(inserted_room) => {
            match add_user_to_room(state.clone(), payload.id.clone(), generated_id.to_string()).await {
                Ok(_) => {
                    match add_user_to_room(state.clone(), "7514e1dd-cd4b-4507-acc2-baa72385c361".to_string(), generated_id.to_string()).await {
                        Ok(_) => Ok(ApiResponse::success(inserted_room, "Room created!".to_string())),
                        Err(e) => Err(format!("Database error: {}", e)),
                    }
                },
                Err(e) => Err(format!("Database error: {}", e)),
            }
        },
        Err(e) => Err(format!("Database error: {}", e)),
    }
}

pub async fn add_user_to_room(
    state: State<'_, AppState>,
    user_id: String,
    room_id: String,
) -> Result<bool, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let new_room_detail = ChatRoomDetailActiveModel {
        room_id: Set(room_id.clone()),
        user_id: Set(user_id.clone()),
    };

    match new_room_detail.insert(&db).await {
        Ok(_) => Ok(true),
        Err(e) => Err(format!("Database error: {}", e)),
    }
}

#[command]
pub async fn get_all_cs_chats(
    state: State<'_, AppState>,
) -> Result<ApiResponse<Vec<ChatRoomModel>>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let chat_rooms = ChatRoomEntities::find()
        .filter(<ChatRoomEntities as EntityTrait>::Column::Name.starts_with("Customer Service - "))
        .all(&db)
        .await
        .map_err(|e| format!("Error fetching chat rooms: {}", e))?;

    Ok(ApiResponse::success(chat_rooms, "Successfully fetched chat rooms!".to_string()))
}