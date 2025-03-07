use entity::maintenance_job::{ActiveModel as MaintenanceActiveModel, Entity as MaintenanceEntities};
use sea_orm::{Set, EntityTrait, QueryFilter, entity::prelude::*};
use serde::{Deserialize, Serialize};
use tauri::{command, State};
use crate::{AppState, ApiResponse};

use super::ride_handler::SingleUidRequest;

#[derive(Serialize, Deserialize)]
pub struct MaintenanceObject {
    pub job_id: String,
    pub location: Option<String>,
    pub deadline: Option<Date>,
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
        location: job.location, 
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
        status: Set("Pending".to_string()),
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