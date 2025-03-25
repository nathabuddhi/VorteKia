use entity::restaurant::{ActiveModel as RestaurantActiveModel, Entity as RestaurantEntities};
use entity::division::{self, Entity as DivisionEntities};
use entity::staff::Entity as StaffEntities;
use entity::restaurant_waiter_allocation::{ActiveModel as RestaurantWaiterActiveModel, Entity as RestaurantWaiterEntities};
use entity::restaurant_chef_allocation::{ActiveModel as RestaurantChefActiveModel, Entity as RestaurantChefEntities};
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
pub struct RestaurantReturn {
    pub id: String,
    pub name: String,
    pub description: String,
    pub cuisine: String,
    pub pictures: Vec<String>,
    pub status: String,
    pub income: f32,
    pub opening: String,
    pub closing: String,
}

async fn check_restaurant_staffed(
    state: State<'_, AppState>,
    restaurant_id: String,
) -> Result<bool, String> {
    let db = state.get_db().await.map_err(|e| e.to_string())?;

    let waiters = RestaurantWaiterEntities::find()
        .filter(<RestaurantWaiterEntities as EntityTrait>::Column::RestaurantId.eq(restaurant_id.clone()))
        .all(&db)
        .await
        .map(|restaurant_waiter_allocations| !restaurant_waiter_allocations.is_empty())
        .map_err(|err| format!("Database error: {}", err)).unwrap();

    let chefs = RestaurantChefEntities::find()
        .filter(<RestaurantChefEntities as EntityTrait>::Column::RestaurantId.eq(restaurant_id))
        .all(&db)
        .await
        .map(|restaurant_chef_allocations| !restaurant_chef_allocations.is_empty())
        .map_err(|err| format!("Database error: {}", err)).unwrap();

    if waiters && chefs {
        Ok(true)
    } else {
        Ok(false)
    }
}

async fn get_restaurant_status(
    state: State<'_, AppState>,
    restaurant_id: String, opening: NaiveTime, closing:NaiveTime
) -> Result<String, String> {
    match check_restaurant_staffed(state.clone(), restaurant_id.clone()).await {
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
pub async fn get_restaurant_by_id(
    state: State<'_, AppState>,
    payload: SingleUidRequest
) -> Result<ApiResponse<RestaurantReturn>, String> {
    let db = state.get_db().await.map_err(|e| e.to_string())?;

    let restaurant = RestaurantEntities::find()
    .filter(<RestaurantEntities as EntityTrait>::Column::RestaurantId.eq(payload.id))
    .one(&db)
    .await.map_err(|err| format!("Database error: {}", err))?;

    let restaurant = match restaurant {
        Some(restaurant) => restaurant,
        None => return Ok(ApiResponse::error(None, "Restaurant not found.".to_string())),
    };

    let restaurant_status = get_restaurant_status(state.clone(), restaurant.restaurant_id.clone(), restaurant.opening.clone(), restaurant.closing.clone()).await.unwrap();

    let restaurant_income = get_income(state.clone(), SingleUidRequest { id: restaurant.restaurant_id.clone() }).await.unwrap();
    let restaurant_income = match restaurant_income {
        ApiResponse::Success { data, .. } => data,
        ApiResponse::Error { data: Some(value), .. } => value,
        _ => 0.0,
    };

    let restaurant_return = RestaurantReturn {
        id: restaurant.restaurant_id,
        name: restaurant.name,
        description: restaurant.description,
        cuisine: restaurant.cuisine,
        pictures: restaurant.pictures.unwrap_or_default(),
        status: restaurant_status,
        income: restaurant_income,
        opening: restaurant.opening.to_string(),
        closing: restaurant.closing.to_string(),
    };

    Ok(ApiResponse::success(restaurant_return, "Successfully fetched restaurant!".to_string()))
}

#[command]
pub async fn get_all_restaurants(state: State<'_, AppState>) -> Result<ApiResponse<Vec<RestaurantReturn>>, String> {
    let db = state.get_db().await.map_err(|e| e.to_string())?;

    let cache_key = "get_all_restaurants";

    if let Some(cached_restaurants) = state.cache.get_cache::<Vec<RestaurantReturn>>(cache_key).await {
        let mut restaurant_returns = Vec::new();
        for restaurant in cached_restaurants {
            let restaurant = get_restaurant_by_id(state.clone(), SingleUidRequest { id: restaurant.id.clone() }).await.unwrap();

            match restaurant {
                ApiResponse::Success { data, .. } => restaurant_returns.push(data),
                _ => continue,
            }
        }

        return Ok(ApiResponse::success(restaurant_returns, "Successfully fetched restaurants!".to_string()));
    }

    let restaurants = RestaurantEntities::find().all(&db).await.map_err(|err| format!("Database error: {}", err))?;
    let mut restaurant_returns = Vec::new();

    for restaurant in restaurants {
            let restaurant = get_restaurant_by_id(state.clone(), SingleUidRequest { id: restaurant.restaurant_id.clone() }).await.unwrap();

            match restaurant {
                ApiResponse::Success { data, .. } => restaurant_returns.push(data),
                _ => continue,
            }
        }

    state.cache.set_cache(cache_key, &restaurant_returns, 60).await;
    Ok(ApiResponse::success(restaurant_returns, "Successfully fetched restaurants!".to_string()))
}

#[derive(Serialize, Deserialize)]
pub struct CreateRestaurantRequest {
    pub name: String,
    pub description: String,
    pub cuisine: String,
    pub pictures: Vec<String>,
    pub opening: String,
    pub closing: String,
}
#[command]
pub async fn create_restaurant(
    state: State<'_, AppState>,
    payload: CreateRestaurantRequest
) -> Result<ApiResponse<RestaurantReturn>, String> {
    let db = state.get_db().await.map_err(|e| e.to_string())?;

    let generated_id = Uuid::new_v4().to_string();

    let opening_time = NaiveTime::parse_from_str(&payload.opening, "%H:%M:%S")
        .map_err(|e| format!("Invalid opening time: {}", e))?;

    let closing_time = NaiveTime::parse_from_str(&payload.closing, "%H:%M:%S")
        .map_err(|e| format!("Invalid closing time: {}", e))?;

    let new_restaurant = RestaurantActiveModel {
        restaurant_id: Set(generated_id),
        name: Set(payload.name.clone()),
        description: Set(payload.description.clone()),
        cuisine: Set(payload.cuisine.clone()),
        pictures: Set(Some(payload.pictures.clone())),
        opening: Set(opening_time),
        closing: Set(closing_time),
    };

    match new_restaurant.insert(&db).await {
        Ok(inserted_restaurant) => {
            state.cache.delete_cache("get_all_restaurants").await;
            get_restaurant_by_id(state.clone(), SingleUidRequest { id: inserted_restaurant.restaurant_id }).await
        },
        Err(e) => Ok(ApiResponse::error(None, format!("Error adding restaurant: {}", e))),
    }
}

#[command]
pub async fn clear_restaurant_waiter_allocation(
    state: State<'_, AppState>,
    payload: SingleUidRequest,
) -> Result<ApiResponse<bool>, String> {
    let db = state.get_db().await.map_err(|e| e.to_string())?;

    match RestaurantWaiterEntities::delete_many()
        .filter(<RestaurantWaiterEntities as EntityTrait>::Column::RestaurantId.eq(&payload.id))
        .exec(&db)
        .await
    {
        Ok(_) => Ok(ApiResponse::success(true, "Successfully cleared waiter allocation".to_string())),
        Err(err) => Ok(ApiResponse::error(Some(false), format!("Error clearing waiter allocation: {}", err))),
    }
}

#[command]
pub async fn clear_restaurant_chef_allocation(
    state: State<'_, AppState>,
    payload: SingleUidRequest,
) -> Result<ApiResponse<bool>, String> {
    let db = state.get_db().await.map_err(|e| e.to_string())?;

    match RestaurantChefEntities::delete_many()
        .filter(<RestaurantWaiterEntities as EntityTrait>::Column::RestaurantId.eq(&payload.id))
        .exec(&db)
        .await
    {
        Ok(_) => Ok(ApiResponse::success(true, "Successfully cleared chef allocation".to_string())),
        Err(err) => Ok(ApiResponse::error(Some(false), format!("Error clearing chef allocation: {}", err))),
    }
}

#[command]
pub async fn allocate_restaurant_waiter(
    state: State<'_, AppState>,
    payload: AllocateStaffRequest,
) -> Result<ApiResponse<bool>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    match RestaurantWaiterEntities::delete_many()
        .filter(<RestaurantWaiterEntities as EntityTrait>::Column::StaffId.eq(&payload.staff_id))
        .exec(&db)
        .await
    {
        Ok(_) => {}
        Err(err) => return Ok(ApiResponse::error(Some(false), format!("Waiter already allocated. Failed deallocating: {}", err))),
    }

    let new_allocation = RestaurantWaiterActiveModel {
        staff_id: Set(payload.staff_id.clone()),
        restaurant_id: Set(Some(payload.loc_id.clone())),
    };
    
    match new_allocation.insert(&db).await {
        Ok(_) => Ok(ApiResponse::success(true, "Successfully allocated waiter!".to_string())),
        Err(e) => Ok(ApiResponse::error(Some(false), format!("Error allocating waiter: {}", e))),
    }
}

#[command]
pub async fn allocate_restaurant_chef(
    state: State<'_, AppState>,
    payload: AllocateStaffRequest,
) -> Result<ApiResponse<bool>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    match RestaurantChefEntities::delete_many()
        .filter(<RestaurantChefEntities as EntityTrait>::Column::StaffId.eq(&payload.staff_id))
        .exec(&db)
        .await
    {
        Ok(_) => {}
        Err(err) => return Ok(ApiResponse::error(Some(false), format!("Chef already allocated. Failed deallocating: {}", err))),
    }

    let new_allocation = RestaurantChefActiveModel {
        staff_id: Set(payload.staff_id.clone()),
        restaurant_id: Set(Some(payload.loc_id.clone())),
    };
    
    match new_allocation.insert(&db).await {
        Ok(_) => Ok(ApiResponse::success(true, "Successfully allocated chef!".to_string())),
        Err(e) => Ok(ApiResponse::error(Some(false), format!("Error allocating chef: {}", e))),
    }
}

#[command]
pub async fn get_allocated_restaurant_chef(
    state: State<'_, AppState>,
    payload: SingleUidRequest,
) -> Result<ApiResponse<Vec<UserDetail>>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let staff_allocations = RestaurantChefEntities::find()
        .filter(<RestaurantChefEntities as EntityTrait>::Column::RestaurantId.eq(payload.id))
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
pub async fn get_allocated_restaurant_waiter(
    state: State<'_, AppState>,
    payload: SingleUidRequest,
) -> Result<ApiResponse<Vec<UserDetail>>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let staff_allocations = RestaurantWaiterEntities::find()
        .filter(<RestaurantWaiterEntities as EntityTrait>::Column::RestaurantId.eq(payload.id))
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
pub async fn get_assigned_restaurant(
    state: State<'_, AppState>,
    payload: SingleUidRequest,
) -> Result<ApiResponse<RestaurantReturn>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let restaurant_chef = RestaurantChefEntities::find()
        .filter(<RestaurantChefEntities as EntityTrait>::Column::StaffId.eq(&payload.id))
        .one(&db)
        .await
        .map_err(|e| e.to_string())?;

    let restaurant_waiter = RestaurantWaiterEntities::find()
        .filter(<RestaurantWaiterEntities as EntityTrait>::Column::StaffId.eq(&payload.id))
        .one(&db)
        .await
        .map_err(|e| e.to_string())?;

    let restaurant_id = if let Some(restaurant_chef) = restaurant_chef {
        restaurant_chef.restaurant_id
    } else if let Some(restaurant_waiter) = restaurant_waiter {
        restaurant_waiter.restaurant_id
    } else {
        return Ok(ApiResponse::error(None, "No restaurant assigned to this staff.".to_string()));
    };

    let restaurant = get_restaurant_by_id(state.clone(), SingleUidRequest { id: restaurant_id.unwrap() }).await;
    let restaurant = match restaurant {
        Ok(ApiResponse::Success { data, .. }) => data,
        _ => return Ok(ApiResponse::error(None, "Failed to fetch restaurant details.".to_string())),
    };

    Ok(ApiResponse::success(restaurant, "Successfully fetched restaurant!".to_string()))
}

#[command]
pub async fn get_all_chefs(
    state: State<'_, AppState>,
) -> Result<ApiResponse<Vec<UserDetail>>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let staff_allocations = StaffEntities::find()
        .find_also_related(division::Entity)
        .filter(<DivisionEntities as EntityTrait>::Column::DivisionName.eq("consumption"))
        .filter(<StaffEntities as EntityTrait>::Column::Role.eq("chef"))
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

    Ok(ApiResponse::success(staff_returns, "Successfully fetched chefs!".to_string()))
}

#[command]
pub async fn get_all_waiters(
    state: State<'_, AppState>,
) -> Result<ApiResponse<Vec<UserDetail>>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let staff_allocations = StaffEntities::find()
        .find_also_related(division::Entity)
        .filter(<DivisionEntities as EntityTrait>::Column::DivisionName.eq("consumption"))
        .filter(<StaffEntities as EntityTrait>::Column::Role.eq("waiter"))
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

    Ok(ApiResponse::success(staff_returns, "Successfully fetched waiters!".to_string()))
}

#[derive(Deserialize)]
pub struct EditRestaurantRequest {
    pub id: String,
    pub name: String,
    pub description: String,
    pub cuisine: String,
    pub pictures: Vec<String>,
    pub opening: String,
    pub closing: String,
}

#[command]
pub async fn edit_restaurant(
    state: State<'_, AppState>,
    payload: EditRestaurantRequest,
) -> Result<ApiResponse<String>, String> {
    let db = state.get_db().await.map_err(|e| e.to_string())?;

    let opening_time = NaiveTime::parse_from_str(&payload.opening, "%H:%M:%S")
        .map_err(|e| format!("Invalid opening time: {}", e))?;

    let closing_time = NaiveTime::parse_from_str(&payload.closing, "%H:%M:%S")
        .map_err(|e| format!("Invalid closing time: {}", e))?;

    let existing_restaurant = RestaurantEntities::find()
    .filter(<RestaurantEntities as EntityTrait>::Column::RestaurantId.eq(payload.id))
    .one(&db)
    .await.map_err(|err| format!("Database error: {}", err))?;

    let found_restaurant = match existing_restaurant {
        Some(restaurant) => restaurant,
        None => return Ok(ApiResponse::error(None, "Restaurant not found.".to_string())),
    };

    let old_pictures = found_restaurant.pictures.clone();

    let updated_restaurant = RestaurantActiveModel {
        restaurant_id: Set(found_restaurant.restaurant_id.clone()),
        name: Set(payload.name),
        description: Set(payload.description),
        opening: Set(opening_time),
        closing: Set(closing_time),
        pictures: Set(old_pictures),
        cuisine: Set(payload.cuisine),
    };

    match updated_restaurant.update(&db).await {
        Ok(_) => {
            state.cache.delete_cache("get_all_restaurants").await;
            Ok(ApiResponse::success(found_restaurant.restaurant_id, "Successfully updated restaurant!".to_string()))
        },
        Err(e) => Ok(ApiResponse::error(None, format!("Error updating restaurant: {}", e))),
    }
}

#[command]
pub async fn delete_restaurant(
    state: State<'_, AppState>,
    payload: SingleUidRequest,
) -> Result<ApiResponse<bool>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let restaurant = RestaurantEntities::find()
        .filter(<RestaurantEntities as EntityTrait>::Column::RestaurantId.eq(payload.id))
        .one(&db)
        .await
        .map_err(|err| format!("Database error: {}", err))?;

    let restaurant = match restaurant {
        Some(restaurant) => restaurant,
        None => return Ok(ApiResponse::error(Some(false), "Restaurant not found.".to_string())),
    };

    match restaurant.delete(&db).await {
        Ok(_) => {
            state.cache.delete_cache("get_all_restaurants").await;
            Ok(ApiResponse::success(true, "Successfully deleted restaurant!".to_string()))
        },
        Err(e) => Ok(ApiResponse::error(Some(false), format!("Error deleting restaurant: {}", e))),
    }
}