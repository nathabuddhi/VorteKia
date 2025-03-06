use chrono::{Duration, Utc};
use entity::notification::{self, Entity as NotificationEntities, ActiveModel as NotificationActiveModel};
use sea_orm::{QueryOrder, Set};
use sea_orm::{EntityTrait, QueryFilter, entity::prelude::*,ActiveValue};
use serde::{Deserialize, Serialize};
use tauri::{command, State};

use crate::{ApiResponse, AppState};

use super::ride_handler::SingleUidRequest;

pub async fn add_notification(
    state: State<'_, AppState>,
    user_id: String,
    message: String,
) -> Result<NotificationActiveModel, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let notification_id = Uuid::new_v4().to_string();

    let new_notification = NotificationActiveModel {
        notification_id: Set(notification_id),
        user_id: Set(user_id),
        content: Set(message),
        time: Set(Utc::now().naive_utc() + Duration::hours(7)),
    };

    let success = new_notification.clone()
        .insert(&db)
        .await
        .map_err(|e| format!("Database error: {}", e))?;
    if success.notification_id.is_empty() {
        Err("Failed to insert notification.".to_string())
    } else {
        Ok(new_notification)
    }
}

#[command]
pub async fn get_notification_by_user(
    state: State<'_, AppState>,
    payload: SingleUidRequest,
) -> Result<ApiResponse<Vec<notification::Model>>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let notifications = NotificationEntities::find()
        .filter(<NotificationEntities as EntityTrait>::Column::UserId.eq(payload.id))
        .order_by_asc(<NotificationEntities as EntityTrait>::Column::Time)
        .all(&db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(ApiResponse::success(notifications, "Successfully fetched notifications!".to_string()))
}

#[command]
pub async fn delete_notification(
    state: State<'_, AppState>,
    payload: SingleUidRequest,
) -> Result<ApiResponse<bool>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let _ = NotificationEntities::delete_many()
        .filter(<NotificationEntities as EntityTrait>::Column::NotificationId.eq(payload.id))
        .exec(&db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(ApiResponse::success(true, "Notifications deleted!".to_string()))
}