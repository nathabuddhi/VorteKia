use anyhow::Result;
use cache_handler::CacheHandler;
use dotenv::dotenv;
use sea_orm::{Database, DatabaseConnection};
use serde::Serialize;
use std::env;
use std::sync::Arc;
use tauri::Manager;
use tokio::sync::Mutex;
use deadpool_redis::{Config as RedisConfig, Runtime};
pub mod controller;
pub mod cache_handler;

pub struct AppState {
    db: Arc<Mutex<Option<DatabaseConnection>>>,
    cache: Arc<CacheHandler>
}

impl AppState {
    pub async fn get_db(&self) -> Result<DatabaseConnection, String> {
        let db_lock = self.db.lock().await;

        if let Some(ref db_connection) = *db_lock {
            Ok(db_connection.clone())
        } else {
            self.reconnect_db().await
        }
    }

    async fn reconnect_db(&self) -> Result<DatabaseConnection, String> {
        let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");

        match Database::connect(&database_url).await {
            Ok(new_connection) => {
                let mut db_lock = self.db.lock().await;
                *db_lock = Some(new_connection.clone());
                Ok(new_connection)
            }
            Err(e) => Err(format!("Failed to reconnect to database: {}", e)),
        }
    }
}

#[derive(Serialize)]
#[serde(tag = "status", rename_all = "lowercase")]
pub enum ApiResponse<T: Serialize> {
    Success { success: bool, data: T, message: String },
    Error { success: bool, data: Option<T>, message: String },
}

impl<T: Serialize> ApiResponse<T> {
    fn success(data: T, message: String) -> Self {
        ApiResponse::Success {
            success: true,
            data,
            message
        }
    }

    fn error(data: Option<T>, message: String) -> Self {
        ApiResponse::Error {
            success: false,
            data,
            message,
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            dotenv().ok();

            let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

            let rt = tokio::runtime::Runtime::new().unwrap();

            let db = rt
                .block_on(Database::connect(&database_url))
                .expect("Failed to connect to database");

            let redis_url = env::var("REDIS_URL").expect("DATABASE_URL must be set");
            let redis_cfg = RedisConfig::from_url(redis_url);
            let redis_pool = redis_cfg.create_pool(Some(Runtime::Tokio1)).expect("Failed to create Redis pool");

            let cache_handler = Arc::new(CacheHandler::new(redis_pool));


            let app_state = AppState {
                db: Arc::new(Mutex::new(Some(db))),
                cache: cache_handler,
            };

            app.manage(app_state);

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            controller::app_handler::get_curr_app,            
            controller::user_handler::login,
            controller::user_handler::login_uid,
            controller::user_handler::create_customer_account,
            controller::user_handler::create_staff_account,
            controller::user_handler::change_user_balance,
            controller::division_handler::get_all_divisions,
            controller::staff_handler::get_all_ride_staff,
            controller::staff_handler::get_assigned_ride,
            controller::maintenance_handler::get_all_jobs,
            controller::maintenance_handler::get_all_jobs_by_location,
            controller::maintenance_handler::get_job_by_id,
            controller::maintenance_handler::create_maintenance_job,
            controller::maintenance_handler::update_job_status,
            controller::maintenance_handler::assign_maintenance_job,
            controller::maintenance_handler::clear_job_allocation,
            controller::maintenance_handler::get_allocated_maintenance_staff,
            controller::maintenance_handler::get_all_maintenance_staff,
            controller::maintenance_handler::get_assigned_job,
            controller::maintenance_handler::edit_job_details,
            controller::maintenance_handler::delete_job,
            controller::ride_handler::get_all_rides,
            controller::ride_handler::get_ride_by_id,
            controller::ride_handler::add_ride_queue,
            controller::ride_handler::leave_ride_queue,
            controller::ride_handler::is_user_in_queue,
            controller::ride_handler::allocate_ride_staff,
            controller::ride_handler::get_allocated_ride_staff,
            controller::ride_handler::clear_ride_staff_allocation,
            controller::ride_handler::create_ride,
            controller::ride_handler::edit_ride,
            controller::ride_handler::delete_ride,
            controller::ride_handler::process_next_queue,
            controller::notification_handler::get_notification_by_user,
            controller::notification_handler::delete_notification,
            controller::chat_handler::get_chat_rooms_by_user,
            controller::chat_handler::get_messages_by_room,
            controller::chat_handler::send_message,
            controller::chat_handler::create_cs_room,
            controller::chat_handler::get_all_cs_chats,
            controller::cs_handler::send_broadcast,
            controller::cs_handler::get_lost_item_by_id,
            controller::cs_handler::get_lost_items,
            controller::cs_handler::delete_item,
            controller::cs_handler::edit_item,
            controller::cs_handler::create_lost_item,
            controller::proposal_handler::get_proposal_by_id,
            controller::proposal_handler::get_proposal_by_user,
            controller::proposal_handler::create_proposal,
            controller::proposal_handler::process_proposal,
            controller::restaurant_handler::create_restaurant,
            controller::restaurant_handler::get_restaurant_by_id,
            controller::restaurant_handler::get_all_restaurants,
            controller::restaurant_handler::clear_restaurant_chef_allocation,
            controller::restaurant_handler::clear_restaurant_waiter_allocation,
            controller::restaurant_handler::allocate_restaurant_chef,
            controller::restaurant_handler::allocate_restaurant_waiter,
            controller::restaurant_handler::get_allocated_restaurant_chef,
            controller::restaurant_handler::get_allocated_restaurant_waiter,
            controller::restaurant_handler::get_assigned_restaurant,
            controller::restaurant_handler::get_all_waiters,
            controller::restaurant_handler::get_all_chefs,
            controller::menu_handler::get_restaurant_menu,
            controller::menu_handler::create_menu,
            controller::menu_handler::edit_menu,
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
