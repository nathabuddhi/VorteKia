use entity::restaurant::{ActiveModel as RestaurantActiveModel, Entity as RestaurantEntities};
use entity::restaurant_waiter_allocation::{ActiveModel as RestaurantWaiterActiveModel, Entity as RestaurantWaiterEntities};
use entity::restaurant_chef_allocation::{ActiveModel as RestaurantChefActiveModel, Entity as RestaurantChefEntities};
use sea_orm::{QueryOrder, Set};
use sea_orm::{EntityTrait, QueryFilter, entity::prelude::*};
use serde::{Deserialize, Serialize};
use tauri::{command, State};
use crate::controller::user_handler::UserDetail;
use crate::{AppState, ApiResponse};
use chrono::{Duration, Utc, NaiveTime};

use super::income_handler::{get_income, update_income_data, UpdateIncomeRequest};
use super::notification_handler::add_notification;
use super::ride_handler::SingleUidRequest;
use super::staff_handler::AllocateStaffRequest;
use super::user_handler::{change_user_balance, get_user_by_id, ChangeUserBalanceRequest, LoginUIDRequest};

#[derive(Serialize, Deserialize)]
pub struct RestaurantReturn {
    pub id: String,
    pub name: String,
    pub description: String,
    pub cuisine: String,
    pub pictures: Vec<String>,
    pub status: String,
    pub income: f32,
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
        .map_err(|err| format!("Database error: {}", err));

    let chefs = RestaurantChefEntities::find()
        .filter(<RestaurantChefEntities as EntityTrait>::Column::RestaurantId.eq(restaurant_id))
        .all(&db)
        .await
        .map(|restaurant_chef_allocations| !restaurant_chef_allocations.is_empty())
        .map_err(|err| format!("Database error: {}", err));

    if waiters.unwrap() && chefs.unwrap() {
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
                "Operational.".to_string()
            } else {
                "Closed.".to_string()
            }
        ),
        Ok(false) => Ok("Non Operational.".to_string()),
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

        return Ok(ApiResponse::success(restaurant_returns, "Successfully fetched rides!".to_string()));
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
    Ok(ApiResponse::success(restaurant_returns, "Successfully fetched rides!".to_string()))
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