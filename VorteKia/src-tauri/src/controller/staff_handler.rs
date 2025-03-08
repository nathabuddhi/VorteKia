use entity::division::{self, Entity as DivisionEntities};
use entity::staff::Entity as StaffEntities;
use entity::ride_staff_allocation::Entity as RideStaffEntities;
use sea_orm::{EntityTrait, QueryFilter, entity::prelude::*};
use serde::Deserialize;
use tauri::{command, State};
use crate::controller::user_handler::UserDetail;
use crate::{AppState, ApiResponse};

use super::ride_handler::{get_ride_by_id, RideReturn, SingleUidRequest};
use super::user_handler::{get_user_by_id, LoginUIDRequest};

#[derive(Deserialize)]
pub struct AllocateStaffRequest {
    pub staff_id: String,
    pub loc_id: String,
}
#[command]
pub async fn get_all_ride_staff(
    state: State<'_, AppState>,
) -> Result<ApiResponse<Vec<UserDetail>>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let staff_allocations = StaffEntities::find()
        .find_also_related(division::Entity)
        .filter(<DivisionEntities as EntityTrait>::Column::DivisionName.eq("operational"))
        .filter(<StaffEntities as EntityTrait>::Column::Role.eq("staff"))
        .all(&db)
        .await
        .map_err(|e| e.to_string())?;

    let mut staff_returns = Vec::new();

    for staff in staff_allocations {
        let staff_request: Result<ApiResponse<UserDetail>, _> = get_user_by_id(state.clone(), LoginUIDRequest { user_id: staff.0.user_id }).await;

        let staff_object = match staff_request {
            Ok(ApiResponse::Success { data, .. }) => data,
            Ok(ApiResponse::Error { data: Some(value), .. }) => value,
            _ => return Err("Failed to fetch user details.".to_string()),
        };

        staff_returns.push(staff_object);
    }

    Ok(ApiResponse::success(staff_returns, "Successfully fetched staff!".to_string()))
}

#[command]
pub async fn get_staff_by_division(
    state: State<'_, AppState>,
    payload: SingleUidRequest,
) -> Result<ApiResponse<Vec<UserDetail>>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let staffs = StaffEntities::find()
        .filter(<StaffEntities as EntityTrait>::Column::DivisionId.eq(payload.id))
        .all(&db)
        .await
        .map_err(|e| e.to_string())?;

    let mut staff_returns = Vec::new();

    for staff in staffs {
        let staff_request: Result<ApiResponse<UserDetail>, _> = get_user_by_id(state.clone(), LoginUIDRequest { user_id: staff.user_id }).await;

        let staff_object = match staff_request {
            Ok(ApiResponse::Success { data, .. }) => data,
            Ok(ApiResponse::Error { data: Some(value), .. }) => value,
            _ => return Err("Failed to fetch user details.".to_string()),
        };

        staff_returns.push(staff_object);
    }

    Ok(ApiResponse::success(staff_returns, "Successfully fetched staff!".to_string()))
}


#[command]
pub async fn get_assigned_ride(
    state: State<'_, AppState>,
    payload: SingleUidRequest,
) -> Result<ApiResponse<RideReturn>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let ride_staff = RideStaffEntities::find()
        .filter(<RideStaffEntities as EntityTrait>::Column::StaffId.eq(&payload.id))
        .one(&db)
        .await
        .map_err(|e| e.to_string())?;

    let ride_staff = match ride_staff {
        Some(ride_staff) => ride_staff,
        None => return Ok(ApiResponse::error(None, "No ride assigned to this staff.".to_string())),
    };

    let ride = get_ride_by_id(state.clone(), SingleUidRequest { id: ride_staff.ride_id.clone() }).await;
    let ride = match ride {
        Ok(ApiResponse::Success { data, .. }) => data,
        _ => return Err("Failed to fetch ride details.".to_string()),
    };

    Ok(ApiResponse::success(ride, "Successfully fetched ride!".to_string()))
}