use entity::order::{ActiveModel as OrderActiveModel, Entity as OrderEntities};
use entity::order_detail::{ActiveModel as DetailActiveModel, Entity as DetailEntities};
use entity::restaurant::Entity as RestaurantEntities;
use entity::menu::Entity as MenuEntities;
use sea_orm::{IntoActiveModel, Set};
use sea_orm::{EntityTrait, QueryFilter, entity::prelude::*};
use serde::{Deserialize, Serialize};
use tauri::{command, State};
use crate::{AppState, ApiResponse};

use super::income_handler::{update_income_data, UpdateIncomeRequest};
use super::notification_handler::add_notification;
use super::ride_handler::SingleUidRequest;
use super::user_handler::{change_user_balance, ChangeUserBalanceRequest};

#[derive(Serialize, Deserialize)]
pub struct OrderMenuRequest {
    pub user_id: String,
    pub menu_id: String,
    pub quantity: i32,
}

#[command]
pub async fn order_menu(
    state: State<'_, AppState>,
    payload: OrderMenuRequest
) -> Result<ApiResponse<bool>, String> {
    let db = state.get_db().await.map_err(|e| e.to_string())?;

    let menu = MenuEntities::find()
        .filter(<MenuEntities as EntityTrait>::Column::MenuId.eq(payload.menu_id.clone()))
        .one(&db)
        .await
        .map_err(|e| e.to_string())?.unwrap();

    let income = menu.price * payload.quantity as f32;

    let deduct_user_balance = change_user_balance(
        state.clone(),
        ChangeUserBalanceRequest { user_id: payload.user_id.clone(), mutation: -income.clone() }
    ).await.unwrap();

    if let ApiResponse::Error { success, .. } = deduct_user_balance {
        if !success {
            return Ok(ApiResponse::error(None, "User balance is not enough!".to_string()));
        }
    }
    
    let restaurant = RestaurantEntities::find()
        .filter(<RestaurantEntities as EntityTrait>::Column::RestaurantId.eq(menu.restaurant_id.clone()))
        .one(&db)
        .await
        .map_err(|e| e.to_string())?.unwrap();

    let generated_id = Uuid::new_v4().to_string();
    
    let new_order = OrderActiveModel {
        order_id: Set(generated_id.clone()),
        customer_id: Set(payload.user_id.clone()),
        status: Set("pending".to_string()),
        restaurant_id: Set(restaurant.restaurant_id.clone()),
    };

    let new_detail = DetailActiveModel {
        order_id: Set(generated_id.clone()),
        menu_id: Set(payload.menu_id.clone()),
        quantity: Set(payload.quantity),
    };

    new_order.insert(&db).await.map_err(|e| e.to_string())?;
    new_detail.insert(&db).await.map_err(|e| e.to_string())?;

    update_income_data(state.clone(), UpdateIncomeRequest { id: restaurant.restaurant_id.clone(), mutation: income }).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success(true, "Order placed successfully!".to_string()))
}

#[command]
pub async fn take_order(
    state: State<'_, AppState>,
    payload: SingleUidRequest
) -> Result<ApiResponse<bool>, String> {
    let db = state.get_db().await.map_err(|e| e.to_string())?;

    let order = OrderEntities::find()
        .filter(<OrderEntities as EntityTrait>::Column::OrderId.eq(payload.id))
        .one(&db)
        .await
        .map_err(|e| e.to_string())?.unwrap();

    let mut active_order: OrderActiveModel = order.into_active_model();
    active_order.status = Set("cooking".to_string());
    active_order.update(&db).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success(true, "Order sent to kitchen successfully!".to_string()))
}

#[command]
pub async fn cook_order(
    state: State<'_, AppState>,
    payload: SingleUidRequest
) -> Result<ApiResponse<bool>, String> {
    let db = state.get_db().await.map_err(|e| e.to_string())?;

    let order = OrderEntities::find()
        .filter(<OrderEntities as EntityTrait>::Column::OrderId.eq(payload.id))
        .one(&db)
        .await
        .map_err(|e| e.to_string())?.unwrap();

    let mut active_order: OrderActiveModel = order.into_active_model();
    active_order.status = Set("ready to serve".to_string());
    active_order.update(&db).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success(true, "Order cooked successfully!".to_string()))
}

#[command]
pub async fn deliver_order(
    state: State<'_, AppState>,
    payload: SingleUidRequest
) -> Result<ApiResponse<bool>, String> {
    let db = state.get_db().await.map_err(|e| e.to_string())?;

    let order = OrderEntities::find()
        .filter(<OrderEntities as EntityTrait>::Column::OrderId.eq(payload.id))
        .one(&db)
        .await
        .map_err(|e| e.to_string())?.unwrap();

    let mut active_order: OrderActiveModel = order.clone().into_active_model();
    active_order.status = Set("complete".to_string());
    active_order.update(&db).await.map_err(|e| e.to_string())?;

    add_notification(state.clone(), order.customer_id.clone(), format!("Your order {} has been delivered.", order.order_id)).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success(true, "Order delivered to customer successfully!".to_string()))
}

#[derive(Serialize, Deserialize)]
pub struct OrderReturn {
    pub order_id: String,
    pub customer_id: String,
    pub status: String,
    pub menu_name: String,
    pub quantity: i32,
}

#[command]
pub async fn get_orders_chef(
    state: State<'_, AppState>,
    payload: SingleUidRequest
) -> Result<ApiResponse<Vec<OrderReturn>>, String> {
    let db = state.get_db().await.map_err(|e| e.to_string())?;

    let orders = OrderEntities::find()
        .filter(<OrderEntities as EntityTrait>::Column::RestaurantId.eq(payload.id))
        .filter(<OrderEntities as EntityTrait>::Column::Status.eq("cooking"))
        .all(&db)
        .await
        .map_err(|e| e.to_string())?;

    let mut orders_return = Vec::new();

    for o in orders {
        let details = DetailEntities::find()
            .filter(<DetailEntities as EntityTrait>::Column::OrderId.eq(o.order_id.clone()))
            .one(&db)
            .await
            .map_err(|e| e.to_string())?.unwrap();
        let menu_name = MenuEntities::find()
            .filter(<MenuEntities as EntityTrait>::Column::MenuId.eq(details.menu_id.clone()))
            .one(&db)
            .await
            .map_err(|e| e.to_string())?.unwrap().name;

        let order = OrderReturn {
            order_id: o.order_id.clone(),
            customer_id: o.customer_id.clone(),
            status: o.status.clone(),
            menu_name: menu_name.clone(),
            quantity: details.quantity.clone(),
        };

        orders_return.push(order);
    }

    Ok(ApiResponse::success(orders_return, "Orders fetched successfully!".to_string()))
}

#[command]
pub async fn get_orders_waiter(
    state: State<'_, AppState>,
    payload: SingleUidRequest
) -> Result<ApiResponse<Vec<OrderReturn>>, String> {
    let db = state.get_db().await.map_err(|e| e.to_string())?;

    let orders = OrderEntities::find()
        .filter(<OrderEntities as EntityTrait>::Column::RestaurantId.eq(payload.id))
        .filter(<OrderEntities as EntityTrait>::Column::Status.eq("pending").or(<OrderEntities as EntityTrait>::Column::Status.eq("ready to serve")))
        .all(&db)
        .await
        .map_err(|e| e.to_string())?;

    let mut orders_return = Vec::new();

    for o in orders {
        let details = DetailEntities::find()
            .filter(<DetailEntities as EntityTrait>::Column::OrderId.eq(o.order_id.clone()))
            .one(&db)
            .await
            .map_err(|e| e.to_string())?.unwrap();
        let menu_name = MenuEntities::find()
            .filter(<MenuEntities as EntityTrait>::Column::MenuId.eq(details.menu_id.clone()))
            .one(&db)
            .await
            .map_err(|e| e.to_string())?.unwrap().name;

        let order = OrderReturn {
            order_id: o.order_id.clone(),
            customer_id: o.customer_id.clone(),
            status: o.status.clone(),
            menu_name: menu_name.clone(),
            quantity: details.quantity.clone(),
        };

        orders_return.push(order);
    }

    Ok(ApiResponse::success(orders_return, "Orders fetched successfully!".to_string()))
}

#[derive(Deserialize)]
pub struct GetCustomerOrdersRequest {
    pub user_id: String,
    pub restaurant_id: String,
}

#[command]
pub async fn get_orders_customer(
    state: State<'_, AppState>,
    payload: GetCustomerOrdersRequest
) -> Result<ApiResponse<Vec<OrderReturn>>, String> {
    let db = state.get_db().await.map_err(|e| e.to_string())?;

    let orders = OrderEntities::find()
        .filter(<OrderEntities as EntityTrait>::Column::RestaurantId.eq(payload.restaurant_id))
        .filter(<OrderEntities as EntityTrait>::Column::CustomerId.eq(payload.user_id))
        .all(&db)
        .await
        .map_err(|e| e.to_string())?;

    let mut orders_return = Vec::new();

    for o in orders {
        let details = DetailEntities::find()
            .filter(<DetailEntities as EntityTrait>::Column::OrderId.eq(o.order_id.clone()))
            .one(&db)
            .await
            .map_err(|e| e.to_string())?.unwrap();
        let menu_name = MenuEntities::find()
            .filter(<MenuEntities as EntityTrait>::Column::MenuId.eq(details.menu_id.clone()))
            .one(&db)
            .await
            .map_err(|e| e.to_string())?.unwrap().name;

        let order = OrderReturn {
            order_id: o.order_id.clone(),
            customer_id: o.customer_id.clone(),
            status: o.status.clone(),
            menu_name: menu_name.clone(),
            quantity: details.quantity.clone(),
        };

        orders_return.push(order);
    }

    Ok(ApiResponse::success(orders_return, "Orders fetched successfully!".to_string()))
}

#[command]
pub async fn get_orders_restaurant(
    state: State<'_, AppState>,
    payload: SingleUidRequest
) -> Result<ApiResponse<Vec<OrderReturn>>, String> {
    let db = state.get_db().await.map_err(|e| e.to_string())?;

    let orders = OrderEntities::find()
        .filter(<OrderEntities as EntityTrait>::Column::RestaurantId.eq(payload.id))
        .all(&db)
        .await
        .map_err(|e| e.to_string())?;

    let mut orders_return = Vec::new();

    for o in orders {
        let details = DetailEntities::find()
            .filter(<DetailEntities as EntityTrait>::Column::OrderId.eq(o.order_id.clone()))
            .one(&db)
            .await
            .map_err(|e| e.to_string())?.unwrap();
        let menu_name = MenuEntities::find()
            .filter(<MenuEntities as EntityTrait>::Column::MenuId.eq(details.menu_id.clone()))
            .one(&db)
            .await
            .map_err(|e| e.to_string())?.unwrap().name;

        let order = OrderReturn {
            order_id: o.order_id.clone(),
            customer_id: o.customer_id.clone(),
            status: o.status.clone(),
            menu_name: menu_name.clone(),
            quantity: details.quantity.clone(),
        };

        orders_return.push(order);
    }

    Ok(ApiResponse::success(orders_return, "Orders fetched successfully!".to_string()))
}