use entity::restaurant::Entity as RestaurantEntities;
use entity::menu::{ActiveModel as MenuActiveModel, Entity as MenuEntities};
use sea_orm::{IntoActiveModel, Set};
use sea_orm::{EntityTrait, QueryFilter, entity::prelude::*};
use serde::{Deserialize, Serialize};
use tauri::{command, State};
use crate::{AppState, ApiResponse};

use super::ride_handler::SingleUidRequest;

#[derive(Serialize, Deserialize)]
pub struct MenuReturn {
    pub menu_id: String,
    pub name: String,
    pub description: String,
    pub price: f32,
    pub pictures: Option<Vec<String>>,
}

#[command]
pub async fn get_restaurant_menu(
    state: State<'_, AppState>,
    payload: SingleUidRequest
) -> Result<ApiResponse<Vec<MenuReturn>>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let restaurant = RestaurantEntities::find()
        .filter(<RestaurantEntities as EntityTrait>::Column::RestaurantId.eq(payload.id))
        .one(&db)
        .await
        .map_err(|e| e.to_string())?;

    let restaurant = match restaurant {
        Some(restaurant) => restaurant,
        None => {
            return Ok(ApiResponse::error(None, "Restaurant not found".to_string()));
        }
    };

    let menus = MenuEntities::find()
        .filter(<MenuEntities as EntityTrait>::Column::RestaurantId.eq(restaurant.restaurant_id))
        .all(&db)
        .await
        .map_err(|e| e.to_string())?;

    let mut menu_returns = Vec::new();

    for menu in menus {
        let menu_return = MenuReturn {
            menu_id: menu.menu_id.clone(),
            name: menu.name.clone(),
            description: menu.description.clone(),
            price: menu.price,
            pictures: menu.pictures.clone(),
        };

        menu_returns.push(menu_return);
    }

    Ok(ApiResponse::success(menu_returns, "Menus fetched successfully".to_string()))
}

#[derive(Deserialize, Serialize)]
pub struct CreateMenuRequest {
    pub restaurant_id: String,
    pub name: String,
    pub description: String,
    pub price: f32,
    pub pictures: Option<Vec<String>>,
}
#[command]
pub async fn create_menu(
    state: State<'_, AppState>,
    payload: CreateMenuRequest
) -> Result<ApiResponse<MenuReturn>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let generated_id = Uuid::new_v4().to_string();

    let new_menu = MenuActiveModel {
        menu_id: Set(generated_id.clone()),
        restaurant_id: Set(payload.restaurant_id.clone()),
        name: Set(payload.name.clone()),
        description: Set(payload.description.clone()),
        price: Set(payload.price),
        pictures: Set(payload.pictures.clone()),
    };

    match new_menu.insert(&db).await {
        Ok(inserted_menu) => {
            let menureturn = MenuReturn {
                menu_id: inserted_menu.menu_id,
                name: inserted_menu.name,
                description: inserted_menu.description,
                price: inserted_menu.price,
                pictures: inserted_menu.pictures,
            };
            return Ok(ApiResponse::success(menureturn, "Menu created successfully".to_string()))
        },
        Err(e) => Ok(ApiResponse::error(None, format!("Error adding restaurant: {}", e))),
    }
}

#[command]
pub async fn edit_menu(
    state: State<'_, AppState>,
    payload: MenuReturn
) -> Result<ApiResponse<MenuReturn>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let menu = MenuEntities::find()
        .filter(<MenuEntities as EntityTrait>::Column::MenuId.eq(payload.menu_id))
        .one(&db)
        .await
        .map_err(|e| e.to_string())?;

    let mut menu = match menu {
        Some(menu) => menu.into_active_model(),
        None => {
            return Ok(ApiResponse::error(None, "Menu not found!".to_string()));
        }
    };

    menu.name = Set(payload.name);
    menu.description = Set(payload.description);
    menu.price = Set(payload.price);
    menu.pictures = Set(payload.pictures);

    let updated_menu = menu.update(&db).await.map_err(|e| e.to_string())?;

    let menu_return = MenuReturn {
        menu_id: updated_menu.menu_id,
        name: updated_menu.name,
        description: updated_menu.description,
        price: updated_menu.price,
        pictures: updated_menu.pictures,
    };

    Ok(ApiResponse::success(menu_return, "Menu edited successfully".to_string()))
}