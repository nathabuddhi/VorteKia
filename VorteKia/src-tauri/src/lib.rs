use anyhow::Result;
use dotenv::dotenv;
use sea_orm::{Database, DatabaseConnection};
use serde::Serialize;
use std::env;
use std::sync::Arc;
use tauri::Manager;
use tokio::sync::Mutex;

pub mod controller;
pub mod cache_handler;
pub mod message_listener;

pub struct AppState {
    db: Arc<Mutex<Option<DatabaseConnection>>>,
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

            let app_state = AppState {
                db: Arc::new(Mutex::new(Some(db))),
            };

            app.manage(app_state);

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            controller::app_handler::get_all_apps,            
            controller::user_handler::login,
            controller::user_handler::login_uid,
            controller::user_handler::create_customer_account,
            controller::user_handler::create_staff_account,
            controller::division_handler::get_all_divisions,
            controller::ride_handler::get_all_rides,
            controller::ride_handler::add_ride_queue,
            controller::ride_handler::leave_ride_queue,
            controller::ride_handler::is_user_in_queue,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
