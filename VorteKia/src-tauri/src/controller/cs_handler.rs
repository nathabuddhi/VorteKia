use entity::division::{self, Entity as DivisionEntities};
use entity::staff::Entity as StaffEntities;
use entity::broadcast::{Entity as BroadcastEntities, ActiveModel as BroadcastActiveModel};
use entity::maintenance_job::{ActiveModel as MaintenanceActiveModel, Entity as MaintenanceEntities};
use entity::maintenance_job_allocation::{ActiveModel as JobAllocationActiveModel, Entity as JobAllocationEntities};
use sea_orm::{Set, EntityTrait, QueryFilter, entity::prelude::*};
use serde::{Deserialize, Serialize};
use tauri::{command, State};
use crate::controller::user_handler::UserDetail;
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
