use serde::Serialize;
use tauri::command;
use crate:: ApiResponse;
use std::env;

#[derive(Serialize)]
pub struct AppPaths {
    pub customer: String,
    pub staff: String,
    pub ride: String,
    pub restaurant: String,
    pub store: String,
}

#[command]
pub async fn get_all_apps(
) -> Result<ApiResponse<AppPaths>, ApiResponse<String>> {
    let restaurant: Option<String> = env::var("RESTAURANT_APP").ok();
    let staff = env::var("STAFF_APP").ok();
    let customer = env::var("CUSTOMER_APP").ok();
    let ride = env::var("RIDE_APP").ok();
    let store = env::var("STORE_APP").ok();

    let app_paths = AppPaths {
        customer: customer.unwrap_or("".to_string()),
        staff: staff.unwrap_or("".to_string()),
        ride: ride.unwrap_or("".to_string()),
        restaurant: restaurant.unwrap_or("".to_string()),
        store: store.unwrap_or("".to_string()),
    };
    Ok(ApiResponse::success(app_paths, "Success!".to_string()))
}