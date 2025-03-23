use entity::broadcast::ActiveModel as BroadcastActiveModel;
use entity::lost_item::{self, ActiveModel as LostItemActiveModel, Entity as LostItemEntities};
use sea_orm::{Set, EntityTrait, QueryFilter, entity::prelude::*};
use serde::{Deserialize, Serialize};
use tauri::{command, State};
use crate::{AppState, ApiResponse};

use super::notification_handler::add_notification;
use super::ride_handler::SingleUidRequest;
use super::staff_handler::get_staff_by_division;

#[derive(Deserialize)]
pub struct SendBroadcastRequest {
    pub content: String,
    pub recepients: Vec<String>
}

#[command]
pub async fn send_broadcast(
    state: State<'_, AppState>,
    payload: SendBroadcastRequest,
) -> Result<ApiResponse<String>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    for division_id in payload.recepients.clone() {
        let staff_members = match get_staff_by_division(state.clone(), SingleUidRequest {id: division_id.clone() }).await {
            Ok(staff) => staff,
            Err(_) => {
                return Err(format!("Failed to fetch staff members for division {}", division_id));
            }
        };

        let staff_members = match staff_members {
            ApiResponse::Success { data, .. } => data,
            ApiResponse::Error { data: Some(value), .. } => value,
            _ => {
                return Err("Failed to fetch staff members".to_string());
            }
        };

        for staff_member in staff_members {
            add_notification(state.clone(), staff_member.user_id.clone(), format!("A broadcast has been sent: {}", payload.content))
                .await.map_err(|e| e.to_string())?;
        }
    }

    let id = Uuid::new_v4().to_string();

    let broadcast = BroadcastActiveModel {
        message: Set(payload.content.clone()),
        recepients: Set(payload.recepients),
        broadcast_id: Set(id.clone()),
    };

    match broadcast.insert(&db).await {
        Ok(_) => Ok(ApiResponse::success(id, "Broadcast sent!".to_string())),
        Err(e) => Ok(ApiResponse::error(None, format!("Database error: {}", e))),
    }
}

#[derive(Deserialize, Serialize)]
pub struct LostItem {
    pub item_id: String,
    pub image: Option<String>,
    pub name: String,
    pub description: String,
    pub last_seen: String,
    pub color: Option<String>,
    pub status: Option<String>,
    pub found_at: Option<String>,
    pub finder_id: Option<String>,
    pub owner_id: Option<String>,
}

#[command]
pub async fn get_lost_items(
    state: State<'_, AppState>,
) -> Result<ApiResponse<Vec<LostItem>>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let lost_items = LostItemEntities::find()
        .all(&db)
        .await
        .map_err(|e| e.to_string())?;

    let mut lost_items_return = Vec::new();

    for item in lost_items {

        let lost_item = LostItem {
            item_id: item.item_id.clone(),
            image: item.image.clone(),
            name: item.name.clone(),
            description: item.description.clone(),
            last_seen: item.last_seen.clone(),
            color: item.color.clone(),
            status: item.status.clone(),
            found_at: item.found_at.clone(),
            finder_id: item.finder_id,
            owner_id: item.owner_id,
        };

        lost_items_return.push(lost_item);
    }

    Ok(ApiResponse::success(lost_items_return, "Lost items fetched successfully".to_string()))
}

#[command]
pub async fn get_lost_item_by_id(
    state: State<'_, AppState>,
    payload: SingleUidRequest
) -> Result<ApiResponse<LostItem>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let item = LostItemEntities::find()
        .filter(<LostItemEntities as EntityTrait>::Column::ItemId.eq(payload.id))
        .one(&db)
        .await
        .map_err(|e| e.to_string())?;

    let item = match item {
        Some(item) => item,
        None => return Ok(ApiResponse::error(None, "Lost item not found".to_string())),
    };

    let lost_item = LostItem {
        item_id: item.item_id.clone(),
        image: item.image.clone(),
        name: item.name.clone(),
        description: item.description.clone(),
        last_seen: item.last_seen.clone(),
        color: item.color.clone(),
        status: item.status.clone(),
        found_at: item.found_at.clone(),
        finder_id: item.finder_id,
        owner_id: item.owner_id,
    };

    Ok(ApiResponse::success(lost_item, "Lost items fetched successfully".to_string()))
}

#[derive(Deserialize, Serialize)]
pub struct CreateItemRequest {
    pub image: Option<String>,
    pub name: String,
    pub description: String,
    pub last_seen: String,
    pub color: Option<String>,
    pub status: Option<String>,
    pub found_at: Option<String>,
    pub finder_id: Option<String>,
    pub owner_id: Option<String>,
}

#[command]
pub async fn create_lost_item(
    state: State<'_, AppState>,
    payload: CreateItemRequest
) -> Result<ApiResponse<lost_item::Model>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let item = LostItemActiveModel {
        item_id: Set(Uuid::new_v4().to_string()),
        image: Set(Some("none".to_string())),
        name: Set(payload.name.clone()),
        description: Set(payload.description.clone()),
        last_seen: Set(payload.last_seen.clone()),
        color: Set(payload.color.clone()),
        status: Set(payload.status.clone()),
        found_at: Set(payload.found_at.clone()),
        finder_id: Set(payload.finder_id.clone()),
        owner_id: Set(payload.owner_id.clone()),
    };

    match item.insert(&db).await {
        Ok(inserted_item) => Ok(ApiResponse::success(inserted_item, "Lost item created!".to_string())),
        Err(e) => Err(format!("Database error: {}", e)),
    }
}

#[command]
pub async fn edit_item(
    state: State<'_, AppState>,
    payload: LostItem
) -> Result<ApiResponse<lost_item::Model>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let item = LostItemActiveModel {
        item_id: Set(payload.item_id.clone()),
        image: Set(payload.image.clone()),
        name: Set(payload.name.clone()),
        description: Set(payload.description.clone()),
        last_seen: Set(payload.last_seen.clone()),
        color: Set(payload.color.clone()),
        status: Set(payload.status.clone()),
        found_at: Set(payload.found_at.clone()),
        finder_id: Set(payload.finder_id.clone()),
        owner_id: Set(payload.owner_id.clone()),
    };

    match item.update(&db).await {
        Ok(updated_item) => Ok(ApiResponse::success(updated_item, "Lost item updated!".to_string())),
        Err(e) => Err(format!("Database error: {}", e)),
    }
}

#[command]
pub async fn delete_item(
    state: State<'_, AppState>,
    payload: SingleUidRequest
) -> Result<ApiResponse<bool>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let item_response = get_lost_item_by_id(state.clone(), payload).await.unwrap();

    match item_response {
        ApiResponse::Success { data: item, .. } => {
            let item = LostItemActiveModel {
                item_id: Set(item.item_id.clone()),
                image: Set(item.image.clone()),
                name: Set(item.name.clone()),
                description: Set(item.description.clone()),
                last_seen: Set(item.last_seen.clone()),
                color: Set(item.color.clone()),
                status: Set(item.status.clone()),
                found_at: Set(item.found_at.clone()),
                finder_id: Set(item.finder_id.clone()),
                owner_id: Set(item.owner_id.clone()),
            };

            match item.delete(&db).await {
                Ok(_) => Ok(ApiResponse::success(true, "Lost item deleted!".to_string())),
                Err(e) => Err(format!("Database error: {}", e)),
            }
        },
        ApiResponse::Error { .. } => Ok(ApiResponse::error(None, "Lost item not found".to_string())),
    }
}