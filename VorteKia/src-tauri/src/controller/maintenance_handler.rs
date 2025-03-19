use entity::division::{self, Entity as DivisionEntities};
use entity::staff::Entity as StaffEntities;
use entity::maintenance_job::{ActiveModel as MaintenanceActiveModel, Entity as MaintenanceEntities};
use entity::restaurant::Entity as RestaurantEntities;
use entity::store::Entity as StoreEntities;
use entity::ride::Entity as RideEntities;
use entity::maintenance_job_allocation::{ActiveModel as JobAllocationActiveModel, Entity as JobAllocationEntities};
use sea_orm::{Set, EntityTrait, QueryFilter, entity::prelude::*};
use serde::{Deserialize, Serialize};
use tauri::{command, State};
use crate::controller::user_handler::UserDetail;
use crate::{AppState, ApiResponse};
use chrono::NaiveDate;

use super::user_handler::{get_user_by_id, LoginUIDRequest};
use super::{ride_handler::SingleUidRequest, staff_handler::AllocateStaffRequest};

#[derive(Serialize, Deserialize)]
pub struct MaintenanceObject {
    pub job_id: String,
    pub location: Option<String>,
    pub deadline: Option<NaiveDate>,
    pub description: String,
    pub status: String,
    pub notes: Option<String>,
    pub report: Option<String>,
}

#[command] 
pub async fn get_all_jobs(
    state: State<'_, AppState>,
) -> Result<ApiResponse<Vec<MaintenanceObject>>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let maintenance_jobs = MaintenanceEntities::find()
        .all(&db)
        .await
        .map_err(|e| e.to_string())?;

    let mut maintenance_returns = Vec::new();

    for maintenance in maintenance_jobs {
        let maintenance_request: Result<ApiResponse<MaintenanceObject>, _> = get_job_by_id(state.clone(), SingleUidRequest { id: maintenance.job_id }).await;

        let maintenance_object = match maintenance_request {
            Ok(ApiResponse::Success { data, .. }) => data,
            Ok(ApiResponse::Error { data: Some(value), .. }) => value,
            _ => return Err("Failed to fetch maintenance job details.".to_string()),
        };

        maintenance_returns.push(maintenance_object);
    }

    Ok(ApiResponse::success(maintenance_returns, "Successfully fetched maintenance jobs!".to_string()))
}

#[command]
pub async fn get_job_location(
    state: State<'_, AppState>,
    location: String,
) -> Result<String, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    if location.len() != 36 {
        return Ok(location);
    } else {
         let restaurant = RestaurantEntities::find()
        .filter(<RestaurantEntities as EntityTrait>::Column::RestaurantId.eq(location.clone()))
        .one(&db)
        .await
        .map_err(|e| format!("Error querying Restaurant: {}", e))?;

        let store = StoreEntities::find()
            .filter(<StoreEntities as EntityTrait>::Column::StoreId.eq(location.clone()))
            .one(&db)
            .await
            .map_err(|e| format!("Error querying Store: {}", e))?;

        let ride = RideEntities::find()
            .filter(<RideEntities as EntityTrait>::Column::RideId.eq(location.clone()))
            .one(&db)
            .await
            .map_err(|e| format!("Error querying Ride: {}", e))?;

        if let Some(re) = restaurant {
            return Ok(format!("Restaurant: {}", re.name)); 
        }
        if let Some(s) = store {
            return Ok(format!("Store: {}", s.name)); 
        }
        if let Some(ri) = ride {
            return Ok(format!("Ride: {}", ri.name)); 
        }

        Ok(location)
    }
}

#[command] 
pub async fn get_all_jobs_by_location(
    state: State<'_, AppState>,
    payload: SingleUidRequest
) -> Result<ApiResponse<Vec<MaintenanceObject>>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let maintenance_jobs = MaintenanceEntities::find()
        .filter(<MaintenanceEntities as EntityTrait>::Column::Location.eq(payload.id))
        .all(&db)
        .await
        .map_err(|e| e.to_string())?;

    let mut maintenance_returns = Vec::new();

    for maintenance in maintenance_jobs {
        let maintenance_request: Result<ApiResponse<MaintenanceObject>, _> = get_job_by_id(state.clone(), SingleUidRequest { id: maintenance.job_id }).await;

        let maintenance_object = match maintenance_request {
            Ok(ApiResponse::Success { data, .. }) => data,
            Ok(ApiResponse::Error { data: Some(value), .. }) => value,
            _ => return Err("Failed to fetch maintenance job details.".to_string()),
        };

        maintenance_returns.push(maintenance_object);
    }

    Ok(ApiResponse::success(maintenance_returns, "Successfully fetched maintenance jobs!".to_string()))
}

#[command]
pub async fn get_job_by_id(
    state: State<'_, AppState>,
    payload: SingleUidRequest,
) -> Result<ApiResponse<MaintenanceObject>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let maintenance_job = MaintenanceEntities::find()
        .filter(<MaintenanceEntities as EntityTrait>::Column::JobId.eq(&payload.id))
        .one(&db)
        .await
        .map_err(|e| format!("Database error: {}", e))?;

    let job = match maintenance_job {
        Some(job) => job,
        None => return Ok(ApiResponse::error(None, "Maintenance job not found.".to_string())),
    };

    let maintenance_return = MaintenanceObject {
        job_id: job.job_id,
        description: job.description,
        location: Some(get_job_location(state.clone(), job.location.unwrap()).await?),    
        deadline: job.deadline,
        status: job.status,
        notes: job.notes,
        report: job.report,
    };

    Ok(ApiResponse::success(
        maintenance_return,
        "Successfully fetched maintenance job!".to_string(),
    ))
}


#[derive(Deserialize)]
pub struct CreateMaintenanceJobRequest {
    pub location: String,
    pub description: String,
    pub notes: String,
}
#[command] 
pub async fn create_maintenance_job(
    state: State<'_, AppState>,
    payload: CreateMaintenanceJobRequest,
) -> Result<ApiResponse<MaintenanceObject>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let generated_id = Uuid::new_v4();

    let new_job = MaintenanceActiveModel {
        job_id: Set(generated_id.to_string()),
        deadline: Set(None),
        description: Set(payload.description),
        status: Set("pending".to_string()),
        location: Set(Some(payload.location)),
        notes: Set(Some(payload.notes)),
        report: Set(None),
    };

    let new_job = new_job.insert(&db).await.map_err(|e| format!("Database error: {}", e))?;

    let maintenance_return = MaintenanceObject {
        job_id: new_job.job_id,
        description: new_job.description,
        location: new_job.location, 
        deadline: new_job.deadline,
        status: new_job.status,
        notes: new_job.notes,
        report: new_job.report,
    };

    Ok(ApiResponse::success(
        maintenance_return,
        "Successfully created maintenance job!".to_string(),
    ))
}

#[derive(Deserialize)]
pub struct UpdateMaintenanceStatusRequest {
    pub job_id: String,
    pub status: String,
}

#[command] 
pub async fn update_job_status(
    state: State<'_, AppState>,
    payload: UpdateMaintenanceStatusRequest,
) -> Result<ApiResponse<MaintenanceObject>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let maintenance_job = MaintenanceEntities::find()
        .filter(<MaintenanceEntities as EntityTrait>::Column::JobId.eq(&payload.job_id))
        .one(&db)
        .await
        .map_err(|e| format!("Database error: {}", e))?;

    if let Some(existing) = maintenance_job {
        let mut active: MaintenanceActiveModel = existing.into();
        active.status = Set(payload.status);
        let updated = active.update(&db).await.map_err(|e| format!("Database error: {}", e))?;
        let out = MaintenanceObject {
            job_id: updated.job_id,
            description: updated.description,
            location: updated.location,
            deadline: updated.deadline,
            status: updated.status,
            notes: updated.notes,
            report: updated.report,
        };
        Ok(ApiResponse::success(out, "Successfully updated job status!".into()))
    } else {
        Ok(ApiResponse::error(None, "Maintenance job not found.".into()))
    }
}

#[command]
pub async fn assign_maintenance_job(
    state: State<'_, AppState>,
    payload: AllocateStaffRequest,
) -> Result<ApiResponse<bool>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    match JobAllocationEntities::delete_many()
        .filter(<JobAllocationEntities as EntityTrait>::Column::StaffId.eq(&payload.staff_id))
        .exec(&db)
        .await
    {
        Ok(_) => {}
        Err(err) => return Ok(ApiResponse::error(Some(false), format!("Staff already allocated. Failed deallocating: {}", err))),
    }

    let new_allocation = JobAllocationActiveModel {
        job_id: Set(payload.loc_id.clone()),
        staff_id: Set(payload.staff_id.clone()),
    };
    
    match new_allocation.insert(&db).await {
        Ok(_) => Ok(ApiResponse::success(true, "Successfully allocated staff!".to_string())),
        Err(e) => Ok(ApiResponse::error(Some(false), format!("Error allocating staff: {}", e))),
    }
}

#[command]
pub async fn clear_job_allocation(
    state: State<'_, AppState>,
    payload: SingleUidRequest,
) -> Result<ApiResponse<bool>, String> {
    let db = state.get_db().await.map_err(|e| e.to_string())?;

    match JobAllocationEntities::delete_many()
        .filter(<JobAllocationEntities as EntityTrait>::Column::JobId.eq(&payload.id))
        .exec(&db)
        .await
    {
        Ok(_) => Ok(ApiResponse::success(true, "Successfully cleared maintenance staff allocation".to_string())),
        Err(err) => Ok(ApiResponse::error(Some(false), format!("Error clearing staff allocation: {}", err))),
    }
}

#[command]
pub async fn get_allocated_maintenance_staff(
    state: State<'_, AppState>,
    payload: SingleUidRequest,
) -> Result<ApiResponse<Vec<UserDetail>>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let staff_allocations = JobAllocationEntities::find()
        .filter(<JobAllocationEntities as EntityTrait>::Column::JobId.eq(payload.id))
        .all(&db)
        .await
        .map_err(|e| e.to_string())?;

    let mut staff_returns = Vec::new();

    for staff in staff_allocations {
        let staff_request: Result<ApiResponse<UserDetail>, _> = get_user_by_id(state.clone(), LoginUIDRequest { user_id: staff.staff_id }).await;

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
pub async fn get_all_maintenance_staff(
    state: State<'_, AppState>,
) -> Result<ApiResponse<Vec<UserDetail>>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let staff_allocations = StaffEntities::find()
        .find_also_related(division::Entity)
        .filter(<DivisionEntities as EntityTrait>::Column::DivisionName.eq("maintenance"))
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
pub async fn get_assigned_job(
    state: State<'_, AppState>,
    payload: SingleUidRequest,
) -> Result<ApiResponse<MaintenanceObject>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let maintenance_staff = JobAllocationEntities::find()
        .filter(<JobAllocationEntities as EntityTrait>::Column::StaffId.eq(&payload.id))
        .one(&db)
        .await
        .map_err(|e| e.to_string())?;

    let maintenance_staff = match maintenance_staff {
        Some(maintenance_staff) => maintenance_staff,
        None => return Ok(ApiResponse::error(None, "No job assigned to this staff.".to_string())),
    };

    let job = get_job_by_id(state.clone(), SingleUidRequest { id: maintenance_staff.job_id.clone() }).await;
    let job = match job {
        Ok(ApiResponse::Success { data, .. }) => data,
        _ => return Err("Failed to fetch job details.".to_string()),
    };

    Ok(ApiResponse::success(job, "Successfully fetched job!".to_string()))
}

#[command] 
pub async fn edit_job_details(
    state: State<'_, AppState>,
    payload: String,
) -> Result<ApiResponse<MaintenanceObject>, String> {
    let db = state.get_db().await.map_err(|e| e.to_string())?;

    let payload: MaintenanceObject = serde_json::from_str(&payload).map_err(|e| format!("Error parsing payload: {}", e))?;

    let existing_job = MaintenanceEntities::find()
    .filter(<MaintenanceEntities as EntityTrait>::Column::JobId.eq(payload.job_id.clone()))
    .one(&db)
    .await.map_err(|err| format!("Database error: {}", err))?.unwrap();

    let updated_job: MaintenanceActiveModel = MaintenanceActiveModel {
        job_id: Set(existing_job.job_id),
        location: Set(existing_job.location),
        deadline: Set(payload.deadline.clone()),
        description: Set(payload.description.clone()),
        status: Set(payload.status.clone()),
        notes: Set(payload.notes.clone()),
        report: Set(payload.report.clone()),
    };

    let job: Result<ApiResponse<MaintenanceObject>, String> = get_job_by_id(state.clone(), SingleUidRequest { id: payload.job_id.clone() }).await;

    let job = match job {
        Ok(ApiResponse::Success { data, .. }) => data,
        _ => return Err("Failed to fetch job details.".to_string()),
    };

    match updated_job.update(&db).await {
        Ok(_) => Ok(ApiResponse::success(job, "Successfully updated job!".to_string())),
        Err(e) => Ok(ApiResponse::error(None, format!("Error updating job: {}", e))),
    }
}