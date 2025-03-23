use entity::ride::{ActiveModel as RideActiveModel, Entity as RideEntities};
use entity::maintenance_job::Entity as MaintenanceEntities;
use entity::ride_staff_allocation::{ActiveModel as RideStaffActiveModel, Entity as RideStaffEntities};
use entity::queue::{ActiveModel as QueueActiveModel, Entity as QueueEntities};
use sea_orm::{QueryOrder, Set};
use sea_orm::{EntityTrait, QueryFilter, entity::prelude::*};
use serde::{Deserialize, Serialize};
use tauri::{command, State};
use crate::controller::income_handler::get_income;
use crate::controller::user_handler::UserDetail;
use crate::{AppState, ApiResponse};
use chrono::{Duration, Utc, NaiveTime};

use super::income_handler::{update_income_data, UpdateIncomeRequest};
use super::notification_handler::add_notification;
use super::staff_handler::AllocateStaffRequest;
use super::user_handler::{change_user_balance, get_user_by_id, ChangeUserBalanceRequest, LoginUIDRequest};

#[derive(Deserialize)]
pub struct SingleUidRequest {
    pub id: String
}

#[derive(Serialize, Deserialize)]
pub struct RideReturn {
    pub ride_id: String,
    pub ride_name: String,
    pub ride_description: Option<String>,
    pub ride_pictures: Option<Vec<String>>,
    pub ride_status: String,
    pub ride_price: f32,
    pub ride_type: String,
    pub opening: String,
    pub closing: String,
    pub queue_count: usize,
    pub queue_list: Option<Vec<String>>,
    pub income: f32,
}

async fn get_ride_queue(ride_id: &str, db: &sea_orm::DatabaseConnection) -> Result<Option<Vec<String>>, String> {
    match QueueEntities::find()
        .filter(<QueueEntities as EntityTrait>::Column::RideId.eq(ride_id))
        .order_by_asc(<QueueEntities as EntityTrait>::Column::Time)
        .all(db)
        .await
    {
        Ok(queues) => {
            if queues.is_empty() {
                Ok(None)
            } else {
                Ok(Some(queues.into_iter().map(|queue| queue.customer_id).collect()))
            }
        }
        Err(err) => Err(format!("Database error: {}", err)),
    }
}

async fn check_ride_staffed(ride_id: &str, db: &sea_orm::DatabaseConnection) -> Result<bool, String> {
    RideStaffEntities::find()
        .filter(<RideStaffEntities as EntityTrait>::Column::RideId.eq(ride_id))
        .all(db)
        .await
        .map(|ride_staff_allocations| !ride_staff_allocations.is_empty())
        .map_err(|err| format!("Database error: {}", err))
}

async fn get_ride_status(ride_id: String, opening: NaiveTime, closing:NaiveTime, db: &sea_orm::DatabaseConnection) -> Result<String, String> {
    match MaintenanceEntities::find()
        .filter(<MaintenanceEntities as EntityTrait>::Column::Location.eq(ride_id.clone()))
        .filter(<MaintenanceEntities as EntityTrait>::Column::Status.is_in(vec!["pending", "in progress"]))
        .all(db)
        .await
    {
        Ok(maintenance_jobs) if !maintenance_jobs.is_empty() => return Ok("Under maintenance.".to_string()),
        Ok(_) => match check_ride_staffed(ride_id.as_str(), db).await {
            Ok(true) => Ok(
                if Utc::now().naive_utc().time() + Duration::hours(7) >= opening && Utc::now().naive_utc().time() + Duration::hours(7) <= closing {
                    "Operational.".to_string()
                } else {
                    "Closed.".to_string()
                }
            ),
            Ok(false) => Ok("Non Operational.".to_string()),
            Err(err) => Err(err),
        },
        Err(err) => Err(format!("Database error: {}", err)),
    }
}


#[command]
pub async fn get_all_rides(state: State<'_, AppState>) -> Result<ApiResponse<Vec<RideReturn>>, String> {
    let db = state.get_db().await.map_err(|e| e.to_string())?;

    let cache_key = "get_all_rides";

    if let Some(cached_rides) = state.cache.get_cache::<Vec<RideReturn>>(cache_key).await {
        let mut ride_returns = Vec::new();
        for ride in cached_rides {
            let opening_time = NaiveTime::parse_from_str(&ride.opening, "%H:%M:%S").unwrap_or_else(|_| NaiveTime::from_hms_opt(0, 0, 0).unwrap());
            let closing_time = NaiveTime::parse_from_str(&ride.closing, "%H:%M:%S").unwrap_or_else(|_| NaiveTime::from_hms_opt(23, 59, 59).unwrap());
            let ride_status = get_ride_status(ride.ride_id.clone(), opening_time, closing_time, &db).await.unwrap_or_else(|_| "Unknown".to_string());
            let ride_queue = get_ride_queue(&ride.ride_id, &db).await.unwrap_or(None);
            let ride_income = get_income(state.clone(), SingleUidRequest { id: ride.ride_id.clone() }).await.unwrap();
            let ride_income = match ride_income {
                ApiResponse::Success { data, .. } => data,
                ApiResponse::Error { data: Some(value), .. } => value,
                _ => 0.0,
            };

            ride_returns.push(RideReturn {
                ride_id: ride.ride_id.clone(),
                ride_name: ride.ride_name.clone(),
                ride_description: ride.ride_description.clone(),
                ride_pictures: ride.ride_pictures.clone(),
                ride_status,
                ride_type: ride.ride_type.clone(),
                opening: ride.opening.to_string(),
                closing: ride.closing.to_string(),
                ride_price: ride.ride_price.clone(),
                queue_count: ride_queue.as_ref().map_or(0, |q| q.len()),
                queue_list: ride_queue,
                income: ride_income
            });
        }

        return Ok(ApiResponse::success(ride_returns, "Successfully fetched rides!".to_string()));
    }

    let rides = RideEntities::find().all(&db).await.map_err(|err| format!("Database error: {}", err))?;
    let mut ride_returns = Vec::new();

    for ride in rides {
        let ride_status = get_ride_status(ride.ride_id.clone(), ride.opening.clone(), ride.closing.clone(), &db).await.unwrap_or_else(|_| "Unknown".to_string());
        let ride_queue = get_ride_queue(&ride.ride_id, &db).await.unwrap_or(None);
        let ride_income = get_income(state.clone(), SingleUidRequest { id: ride.ride_id.clone() }).await.unwrap();
        let ride_income = match ride_income {
            ApiResponse::Success { data, .. } => data,
            ApiResponse::Error { data: Some(value), .. } => value,
            _ => 0.0,
        };

        ride_returns.push(RideReturn {
            ride_id: ride.ride_id.clone(),
            ride_name: ride.name.clone(),
            ride_description: ride.description.clone(),
            ride_pictures: ride.pictures.clone(),
            ride_status,
            ride_type: ride.r#type.clone(),
            opening: ride.opening.to_string(),
            closing: ride.closing.to_string(),
            ride_price: ride.price.clone(),
            queue_count: ride_queue.as_ref().map_or(0, |q| q.len()),
            queue_list: ride_queue,
            income: ride_income,
        });
    }
    state.cache.set_cache(cache_key, &ride_returns, 60).await;
    Ok(ApiResponse::success(ride_returns, "Successfully fetched rides!".to_string()))
}

#[command]
pub async fn get_ride_by_id(
    state: State<'_, AppState>,
    payload: SingleUidRequest
) -> Result<ApiResponse<RideReturn>, String> {
    let db = state.get_db().await.map_err(|e| e.to_string())?;

    let ride = RideEntities::find()
    .filter(<RideEntities as EntityTrait>::Column::RideId.eq(payload.id))
    .one(&db)
    .await.map_err(|err| format!("Database error: {}", err))?;

    let ride = match ride {
        Some(ride) => ride,
        None => return Ok(ApiResponse::error(None, "Ride not found.".to_string())),
    };

    let ride_status = get_ride_status(ride.ride_id.clone(), ride.opening.clone(), ride.closing.clone(), &db).await.unwrap_or_else(|_| "Unknown".to_string());
    let ride_queue = get_ride_queue(&ride.ride_id, &db).await.unwrap_or(None);
    let ride_income = get_income(state.clone(), SingleUidRequest { id: ride.ride_id.clone() }).await.unwrap();
    let ride_income = match ride_income {
        ApiResponse::Success { data, .. } => data,
        ApiResponse::Error { data: Some(value), .. } => value,
        _ => 0.0,
    };

    let ride_return = RideReturn {
        ride_id: ride.ride_id.clone(),
        ride_name: ride.name.clone(),
        ride_description: ride.description.clone(),
        ride_pictures: ride.pictures.clone(),
        ride_status,
        ride_type: ride.r#type.clone(),
        opening: ride.opening.to_string(),
        closing: ride.closing.to_string(),
        ride_price: ride.price.clone(),
        queue_count: ride_queue.as_ref().map_or(0, |q| q.len()),
        queue_list: ride_queue,
        income: ride_income
    };

    Ok(ApiResponse::success(ride_return, "Successfully fetched ride!".to_string()))
}

#[derive(Deserialize)]
pub struct CreateRideRequest {
    id: String,
    name: String,
    description: Option<String>,
    opening: String,
    closing: String,
    pictures: Vec<String>,
    ride_type: String,
    price: f32,
}
#[command]
pub async fn create_ride(
    state: State<'_, AppState>,
    payload: CreateRideRequest,
) -> Result<ApiResponse<String>, String> {
    let db = state.get_db().await.map_err(|e| e.to_string())?;

    let generated_id = Uuid::new_v4();

    let opening_time = NaiveTime::parse_from_str(&payload.opening, "%H:%M:%S")
        .map_err(|e| format!("Invalid opening time: {}", e))?;

    let closing_time = NaiveTime::parse_from_str(&payload.closing, "%H:%M:%S")
        .map_err(|e| format!("Invalid closing time: {}", e))?;

    let new_ride = RideActiveModel {
        ride_id: Set(generated_id.to_string()),
        name: Set(payload.name),
        description: Set(payload.description),
        opening: Set(opening_time),
        closing: Set(closing_time),
        pictures: Set(Some(payload.pictures)),
        r#type: Set(payload.ride_type),
        price: Set(payload.price)
    };

    match new_ride.insert(&db).await {
        Ok(inserted_ride) => {
            state.cache.delete_cache("get_all_rides").await;
            Ok(ApiResponse::success(inserted_ride.ride_id.to_string(), "Successfully added ride!".to_string()))
        },
        Err(e) => Ok(ApiResponse::error(None, format!("Error adding ride: {}", e))),
    }
}

#[command]
pub async fn edit_ride(
    state: State<'_, AppState>,
    payload: CreateRideRequest,
) -> Result<ApiResponse<String>, String> {
    let db = state.get_db().await.map_err(|e| e.to_string())?;

    let opening_time = NaiveTime::parse_from_str(&payload.opening, "%H:%M:%S")
        .map_err(|e| format!("Invalid opening time: {}", e))?;

    let closing_time = NaiveTime::parse_from_str(&payload.closing, "%H:%M:%S")
        .map_err(|e| format!("Invalid closing time: {}", e))?;

    let existing_ride = RideEntities::find()
    .filter(<RideEntities as EntityTrait>::Column::RideId.eq(payload.id))
    .one(&db)
    .await.map_err(|err| format!("Database error: {}", err))?;

    let found_ride = match existing_ride {
        Some(ride) => ride,
        None => return Ok(ApiResponse::error(None, "Ride not found.".to_string())),
    };

    let old_pictures = found_ride.pictures.clone();

    let updated_ride = RideActiveModel {
        ride_id: Set(found_ride.ride_id.clone()),
        name: Set(payload.name),
        description: Set(payload.description),
        opening: Set(opening_time),
        closing: Set(closing_time),
        pictures: Set(old_pictures),
        r#type: Set(payload.ride_type),
        price: Set(payload.price),
    };

    match updated_ride.update(&db).await {
        Ok(_) => {
            state.cache.delete_cache("get_all_rides").await;
            Ok(ApiResponse::success(found_ride.ride_id, "Successfully updated ride!".to_string()))
        },
        Err(e) => Ok(ApiResponse::error(None, format!("Error updating ride: {}", e))),
    }
}


pub async fn get_ride_price(
    state: State<'_, AppState>,
    ride_id: String,
) -> Result<f32, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    match RideEntities::find()
        .filter(<RideEntities as EntityTrait>::Column::RideId.eq(ride_id))
        .one(&db)
        .await
    {
        Ok(Some(ride)) => Ok(ride.price),
        Ok(None) => Err("Ride not found.".to_string()),
        Err(err) => Err(format!("Database error: {}", err)),
    }
}

#[derive(Deserialize)]
pub struct AddQueueRequest {
    pub user_id: String,
    pub ride_id: String,
}
#[command]
pub async fn add_ride_queue(
    state: State<'_, AppState>,
    payload: AddQueueRequest,
) -> Result<ApiResponse<u64>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let response: Result<ApiResponse<bool>, _> = is_user_in_queue(
        state.clone(),
        IsUserInQueueRequest { user_id: payload.user_id.clone() }
    ).await;

    let is_in_queue = match response {
        Ok(ApiResponse::Success { data, .. }) => data,
        Ok(ApiResponse::Error { data: Some(value), .. }) => value,
        _ => false,
    };

    if is_in_queue {
        return Ok(ApiResponse::Error { 
            success: false, 
            data: None, 
            message: "User is already in queue.".to_string() 
        });
    }

    let ride_price: Result<f32, String> = get_ride_price(state.clone(), payload.ride_id.clone()).await;

    let deduct_user_balance: Result<ApiResponse<f32>, _> = change_user_balance(
        state.clone(),
        ChangeUserBalanceRequest { user_id: payload.user_id.clone(), mutation: -ride_price.clone()? }
    ).await;

    let deduct_user_balance = deduct_user_balance.unwrap();

    if let ApiResponse::Error { success, .. } = deduct_user_balance {
        if !success {
            return Ok(ApiResponse::error(None, "User balance is not enough!".to_string()));
        }
    }

    let _ = update_income_data(state.clone(), UpdateIncomeRequest { id: payload.ride_id.clone(), mutation: ride_price? }).await;

    let new_queue = QueueActiveModel {
        ride_id: Set(payload.ride_id.clone()),
        customer_id: Set(payload.user_id),
        time: Set(Utc::now().naive_utc() + Duration::hours(7)),
    };

    let queue_count = QueueEntities::find()
        .filter(<QueueEntities as EntityTrait>::Column::RideId.eq(&payload.ride_id))
        .count(&db)
        .await
        .map_err(|e| e.to_string())?;
    
    match new_queue.insert(&db).await {
        Ok(_) => {
            state.cache.delete_cache("get_all_rides").await;
            Ok(ApiResponse::success(queue_count, "Successfully enqueued for ride!".to_string()))
        },
        Err(e) => Ok(ApiResponse::error(None, format!("Error entering ride queue: {}", e))),
    }
}

#[derive(Deserialize)]
pub struct LeaveQueueRequest {
    user_id: String,
    ride_id: String,
}
#[command]
pub async fn leave_ride_queue(
    state: State<'_, AppState>,
    payload: LeaveQueueRequest,
) -> Result<ApiResponse<bool>, String> {
    let db = state.get_db().await.map_err(|e| e.to_string())?;

    match QueueEntities::find()
        .filter(<QueueEntities as EntityTrait>::Column::CustomerId.eq(payload.user_id))
        .filter(<QueueEntities as EntityTrait>::Column::RideId.eq(payload.ride_id))
        .one(&db)
        .await
    {
        Ok(Some(queue)) => {
            let _ = queue.delete(&db).await.map_err(|err| format!("Database error: {}", err))?;
            Ok(ApiResponse::success(true, "Successfully left queue.".to_string()))
        }
        Ok(None) => {
            state.cache.delete_cache("get_all_rides").await;
            Ok(ApiResponse::error(Some(false), "User not in queue.".to_string()))
        },
        Err(err) => Ok(ApiResponse::error(Some(false), "Unknown Error: ".to_string() + &err.to_string())),
    }
}

#[derive(Deserialize)]
pub struct IsUserInQueueRequest {
    user_id: String,
}
#[command]
pub async fn is_user_in_queue(
    state: State<'_, AppState>,
    payload: IsUserInQueueRequest,
) -> Result<ApiResponse<bool>, String> {
    let db = state.get_db().await.map_err(|e| e.to_string())?;

    match QueueEntities::find()
        .filter(<QueueEntities as EntityTrait>::Column::CustomerId.eq(payload.user_id))
        .one(&db)
        .await
    {
        Ok(Some(_)) => Ok(ApiResponse::success(true, "User is in queue.".to_string())),
        Ok(None) => Ok(ApiResponse::success(false, "User is not in queue.".to_string())),
        Err(err) => Ok(ApiResponse::error(Some(false), format!("Error checking queue status: {}", err))),
    }
}

#[command]
pub async fn clear_ride_staff_allocation(
    state: State<'_, AppState>,
    payload: SingleUidRequest,
) -> Result<ApiResponse<bool>, String> {
    let db = state.get_db().await.map_err(|e| e.to_string())?;

    match RideStaffEntities::delete_many()
        .filter(<RideStaffEntities as EntityTrait>::Column::RideId.eq(&payload.id))
        .exec(&db)
        .await
    {
        Ok(_) => Ok(ApiResponse::success(true, "Successfully cleared staff allocation".to_string())),
        Err(err) => Ok(ApiResponse::error(Some(false), format!("Error clearing staff allocation: {}", err))),
    }
}

#[command]
pub async fn allocate_ride_staff(
    state: State<'_, AppState>,
    payload: AllocateStaffRequest,
) -> Result<ApiResponse<bool>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    match RideStaffEntities::delete_many()
        .filter(<RideStaffEntities as EntityTrait>::Column::StaffId.eq(&payload.staff_id))
        .exec(&db)
        .await
    {
        Ok(_) => {}
        Err(err) => return Ok(ApiResponse::error(Some(false), format!("Staff already allocated. Failed deallocating: {}", err))),
    }

    let new_allocation = RideStaffActiveModel {
        staff_id: Set(payload.staff_id.clone()),
        ride_id: Set(payload.loc_id.clone()),
    };
    
    match new_allocation.insert(&db).await {
        Ok(_) => Ok(ApiResponse::success(true, "Successfully allocated staff!".to_string())),
        Err(e) => Ok(ApiResponse::error(Some(false), format!("Error allocating staff: {}", e))),
    }
}


#[derive(Deserialize)]
pub struct GetAllocatedStaffRequest {
    ride_id: String,
}
#[command]
pub async fn get_allocated_ride_staff(
    state: State<'_, AppState>,
    payload: GetAllocatedStaffRequest,
) -> Result<ApiResponse<Vec<UserDetail>>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let staff_allocations = RideStaffEntities::find()
        .filter(<RideStaffEntities as EntityTrait>::Column::RideId.eq(payload.ride_id))
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
pub async fn process_next_queue(
    state: State<'_, AppState>,
    payload: SingleUidRequest,
) -> Result<ApiResponse<bool>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let next_queue = QueueEntities::find()
        .filter(<QueueEntities as EntityTrait>::Column::RideId.eq(payload.id))
        .order_by_asc(<QueueEntities as EntityTrait>::Column::Time)
        .one(&db)
        .await
        .map_err(|err| format!("Database error: {}", err))?;

    match next_queue {
        Some(queue_item) => {
            let cust_id = queue_item.customer_id.clone();
            queue_item.delete(&db).await.map_err(|err| format!("Database error: {}", err))?;
            add_notification(state.clone(), cust_id, "Your turn is next!".to_string()).await?;
            Ok(ApiResponse::success(true, "Successfully processed next customer!".to_string()))
        }
        None => Ok(ApiResponse::error(Some(false), "No customer in queue.".to_string())),
    }
}

#[command]
pub async fn delete_ride(
    state: State<'_, AppState>,
    payload: SingleUidRequest,
) -> Result<ApiResponse<bool>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let ride = RideEntities::find()
        .filter(<RideEntities as EntityTrait>::Column::RideId.eq(payload.id))
        .one(&db)
        .await
        .map_err(|err| format!("Database error: {}", err))?;

    let ride = match ride {
        Some(ride) => ride,
        None => return Ok(ApiResponse::error(Some(false), "Ride not found.".to_string())),
    };

    match ride.delete(&db).await {
        Ok(_) => {
            state.cache.delete_cache("get_all_rides").await;
            Ok(ApiResponse::success(true, "Successfully deleted ride!".to_string()))
        },
        Err(e) => Ok(ApiResponse::error(Some(false), format!("Error deleting ride: {}", e))),
    }
}