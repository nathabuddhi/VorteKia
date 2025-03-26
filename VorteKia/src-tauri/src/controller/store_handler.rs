use entity::store::{ActiveModel as StoreActiveModel, Entity as StoreEntities};
use entity::division::{self, Entity as DivisionEntities};
use entity::staff::Entity as StaffEntities;
use entity::sales_associate_allocation::{ActiveModel as SalesAssociateActiveModel, Entity as SalesAssociateEntities};
use sea_orm::{Set, EntityTrait, QueryFilter, entity::prelude::*};
use serde::{Deserialize, Serialize};
use tauri::{command, State};
use crate::controller::user_handler::UserDetail;
use crate::{AppState, ApiResponse};
use chrono::{Duration, Utc, NaiveTime};

use super::income_handler::get_income;
use super::ride_handler::SingleUidRequest;
use super::staff_handler::AllocateStaffRequest;
use super::user_handler::{get_user_by_id, LoginUIDRequest};

#[derive(Serialize, Deserialize)]
pub struct StoreReturn {
    pub id: String,
    pub name: String,
    pub description: String,
    pub pictures: Vec<String>,
    pub status: String,
    pub income: f32,
    pub opening: String,
    pub closing: String,
}

async fn check_store_staffed(
    state: State<'_, AppState>,
    store_id: String,
) -> Result<bool, String> {
    let db = state.get_db().await.map_err(|e| e.to_string())?;

    let sales_associate = SalesAssociateEntities::find()
        .filter(<SalesAssociateEntities as EntityTrait>::Column::StoreId.eq(store_id.clone()))
        .all(&db)
        .await
        .map(|store_staff_allocations| !store_staff_allocations.is_empty())
        .map_err(|err| format!("Database error: {}", err)).unwrap();

    Ok(sales_associate)
}

async fn get_store_status(
    state: State<'_, AppState>,
    store_id: String, opening: NaiveTime, closing:NaiveTime
) -> Result<String, String> {
    match check_store_staffed(state.clone(), store_id.clone()).await {
        Ok(true) => Ok(
            if Utc::now().naive_utc().time() + Duration::hours(7) >= opening && Utc::now().naive_utc().time() + Duration::hours(7) <= closing {
                "Open.".to_string()
            } else {
                "Closed.".to_string()
            }
        ),
        Ok(false) => Ok("Closed.".to_string()),
        Err(err) => Err(err),
    }
}

#[command]
pub async fn get_store_by_id(
    state: State<'_, AppState>,
    payload: SingleUidRequest
) -> Result<ApiResponse<StoreReturn>, String> {
    let db = state.get_db().await.map_err(|e| e.to_string())?;

    let store = StoreEntities::find()
    .filter(<StoreEntities as EntityTrait>::Column::StoreId.eq(payload.id))
    .one(&db)
    .await.map_err(|err| format!("Database error: {}", err))?;

    let store = match store {
        Some(store) => store,
        None => return Ok(ApiResponse::error(None, "Store not found.".to_string())),
    };

    let store_status = get_store_status(state.clone(), store.store_id.clone(), store.opening.clone(), store.closing.clone()).await.unwrap();

    let store_income = get_income(state.clone(), SingleUidRequest { id: store.store_id.clone() }).await.unwrap();
    let store_income = match store_income {
        ApiResponse::Success { data, .. } => data,
        ApiResponse::Error { data: Some(value), .. } => value,
        _ => 0.0,
    };

    let store_return = StoreReturn {
        id: store.store_id,
        name: store.name,
        description: store.description.unwrap_or_default(),
        pictures: store.pictures.unwrap_or_default(),
        status: store_status,
        income: store_income,
        opening: store.opening.to_string(),
        closing: store.closing.to_string(),
    };

    Ok(ApiResponse::success(store_return, "Successfully fetched store!".to_string()))
}

#[command]
pub async fn get_all_stores(state: State<'_, AppState>) -> Result<ApiResponse<Vec<StoreReturn>>, String> {
    let db = state.get_db().await.map_err(|e| e.to_string())?;

    let cache_key = "get_all_stores";

    if let Some(cached_stores) = state.cache.get_cache::<Vec<StoreReturn>>(cache_key).await {
        let mut store_returns = Vec::new();
        for store in cached_stores {
            let store = get_store_by_id(state.clone(), SingleUidRequest { id: store.id.clone() }).await.unwrap();

            match store {
                ApiResponse::Success { data, .. } => store_returns.push(data),
                _ => continue,
            }
        }

        return Ok(ApiResponse::success(store_returns, "Successfully fetched stores!".to_string()));
    }

    let stores = StoreEntities::find().all(&db).await.map_err(|err| format!("Database error: {}", err))?;
    let mut store_returns = Vec::new();

    for store in stores {
            let store = get_store_by_id(state.clone(), SingleUidRequest { id: store.store_id.clone() }).await.unwrap();

            match store {
                ApiResponse::Success { data, .. } => store_returns.push(data),
                _ => continue,
            }
        }

    state.cache.set_cache(cache_key, &store_returns, 60).await;
    Ok(ApiResponse::success(store_returns, "Successfully fetched stores!".to_string()))
}

#[derive(Serialize, Deserialize)]
pub struct CreateStoreRequest {
    pub name: String,
    pub description: String,
    pub pictures: Vec<String>,
    pub opening: String,
    pub closing: String,
}
#[command]
pub async fn create_store(
    state: State<'_, AppState>,
    payload: CreateStoreRequest
) -> Result<ApiResponse<StoreReturn>, String> {
    let db = state.get_db().await.map_err(|e| e.to_string())?;

    let generated_id = Uuid::new_v4().to_string();

    let opening_time = NaiveTime::parse_from_str(&payload.opening, "%H:%M:%S")
        .map_err(|e| format!("Invalid opening time: {}", e))?;

    let closing_time = NaiveTime::parse_from_str(&payload.closing, "%H:%M:%S")
        .map_err(|e| format!("Invalid closing time: {}", e))?;

    let new_store = StoreActiveModel {
        store_id: Set(generated_id),
        name: Set(payload.name.clone()),
        description: Set(Some(payload.description.clone())),
        pictures: Set(Some(payload.pictures.clone())),
        opening: Set(opening_time),
        closing: Set(closing_time),
    };

    match new_store.insert(&db).await {
        Ok(inserted_store) => {
            state.cache.delete_cache("get_all_stores").await;
            get_store_by_id(state.clone(), SingleUidRequest { id: inserted_store.store_id }).await
        },
        Err(e) => Ok(ApiResponse::error(None, format!("Error adding store: {}", e))),
    }
}

#[command]
pub async fn clear_store_associate_allocation(
    state: State<'_, AppState>,
    payload: SingleUidRequest,
) -> Result<ApiResponse<bool>, String> {
    let db = state.get_db().await.map_err(|e| e.to_string())?;

    match SalesAssociateEntities::delete_many()
        .filter(<SalesAssociateEntities as EntityTrait>::Column::StoreId.eq(&payload.id))
        .exec(&db)
        .await
    {
        Ok(_) => Ok(ApiResponse::success(true, "Successfully cleared sales associate allocation".to_string())),
        Err(err) => Ok(ApiResponse::error(Some(false), format!("Error clearing sales associate allocation: {}", err))),
    }
}

#[command]
pub async fn allocate_store_associate(
    state: State<'_, AppState>,
    payload: AllocateStaffRequest,
) -> Result<ApiResponse<bool>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    match SalesAssociateEntities::delete_many()
        .filter(<SalesAssociateEntities as EntityTrait>::Column::StaffId.eq(&payload.staff_id))
        .exec(&db)
        .await
    {
        Ok(_) => {}
        Err(err) => return Ok(ApiResponse::error(Some(false), format!("Sales Associate already allocated. Failed deallocating: {}", err))),
    }

    let new_allocation = SalesAssociateActiveModel {
        staff_id: Set(payload.staff_id.clone()),
        store_id: Set(Some(payload.loc_id.clone())),
    };
    
    match new_allocation.insert(&db).await {
        Ok(_) => Ok(ApiResponse::success(true, "Successfully allocated Sales Associate!".to_string())),
        Err(e) => Ok(ApiResponse::error(Some(false), format!("Error allocating Sales Associate: {}", e))),
    }
}

#[command]
pub async fn get_allocated_store_associate(
    state: State<'_, AppState>,
    payload: SingleUidRequest,
) -> Result<ApiResponse<Vec<UserDetail>>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let staff_allocations = SalesAssociateEntities::find()
        .filter(<SalesAssociateEntities as EntityTrait>::Column::StoreId.eq(payload.id))
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
pub async fn get_assigned_store(
    state: State<'_, AppState>,
    payload: SingleUidRequest,
) -> Result<ApiResponse<StoreReturn>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let sales_associate = SalesAssociateEntities::find()
        .filter(<SalesAssociateEntities as EntityTrait>::Column::StaffId.eq(&payload.id))
        .one(&db)
        .await
        .map_err(|e| e.to_string())?;

    let store_id = if  let Some(sales_associate) = sales_associate {
        sales_associate.store_id
    } else {
        return Ok(ApiResponse::error(None, "No store assigned to this staff.".to_string()));
    };

    let store = get_store_by_id(state.clone(), SingleUidRequest { id: store_id.unwrap() }).await;
    let store = match store {
        Ok(ApiResponse::Success { data, .. }) => data,
        _ => return Ok(ApiResponse::error(None, "Failed to fetch store details.".to_string())),
    };

    Ok(ApiResponse::success(store, "Successfully fetched store!".to_string()))
}

#[command]
pub async fn get_all_sales_associate(
    state: State<'_, AppState>,
) -> Result<ApiResponse<Vec<UserDetail>>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let staff_allocations = StaffEntities::find()
        .find_also_related(division::Entity)
        .filter(<DivisionEntities as EntityTrait>::Column::DivisionName.eq("retail"))
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

    Ok(ApiResponse::success(staff_returns, "Successfully fetched sales associates!".to_string()))
}

#[derive(Deserialize)]
pub struct EditStoreRequest {
    pub id: String,
    pub name: String,
    pub description: String,
    pub pictures: Vec<String>,
    pub opening: String,
    pub closing: String,
}

#[command]
pub async fn edit_store(
    state: State<'_, AppState>,
    payload: EditStoreRequest,
) -> Result<ApiResponse<String>, String> {
    let db = state.get_db().await.map_err(|e| e.to_string())?;

    let opening_time = NaiveTime::parse_from_str(&payload.opening, "%H:%M:%S")
        .map_err(|e| format!("Invalid opening time: {}", e))?;

    let closing_time = NaiveTime::parse_from_str(&payload.closing, "%H:%M:%S")
        .map_err(|e| format!("Invalid closing time: {}", e))?;

    let existing_store = StoreEntities::find()
    .filter(<StoreEntities as EntityTrait>::Column::StoreId.eq(payload.id))
    .one(&db)
    .await.map_err(|err| format!("Database error: {}", err))?;

    let found_store = match existing_store {
        Some(store) => store,
        None => return Ok(ApiResponse::error(None, "Store not found.".to_string())),
    };

    let old_pictures = found_store.pictures.clone();

    let updated_store = StoreActiveModel {
        store_id: Set(found_store.store_id.clone()),
        name: Set(payload.name),
        description: Set(Some(payload.description)),
        opening: Set(opening_time),
        closing: Set(closing_time),
        pictures: Set(old_pictures),
    };

    match updated_store.update(&db).await {
        Ok(_) => {
            state.cache.delete_cache("get_all_stores").await;
            Ok(ApiResponse::success(found_store.store_id, "Successfully updated store!".to_string()))
        },
        Err(e) => Ok(ApiResponse::error(None, format!("Error updating store: {}", e))),
    }
}

#[command]
pub async fn delete_store(
    state: State<'_, AppState>,
    payload: SingleUidRequest,
) -> Result<ApiResponse<bool>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let store = StoreEntities::find()
        .filter(<StoreEntities as EntityTrait>::Column::StoreId.eq(payload.id))
        .one(&db)
        .await
        .map_err(|err| format!("Database error: {}", err))?;

    let store = match store {
        Some(store) => store,
        None => return Ok(ApiResponse::error(Some(false), "Store not found.".to_string())),
    };

    match store.delete(&db).await {
        Ok(_) => {
            state.cache.delete_cache("get_all_stores").await;
            Ok(ApiResponse::success(true, "Successfully deleted store!".to_string()))
        },
        Err(e) => Ok(ApiResponse::error(Some(false), format!("Error deleting store: {}", e))),
    }
}