use entity::ride::{ActiveModel as RideActiveModel, Model as RideInstance, Entity as RideEntities};
use sea_orm::{EntityTrait, QueryFilter, entity::prelude::*};
use serde::Serialize;
use tauri::{command, State};
use crate::{AppState, ApiResponse};

#[derive(Serialize)]
pub struct RideReturn {
    pub ride_id: String,
    pub ride_name: String,
    pub ride_description: Option<String>,
    pub ride_pictures: Option<Vec<String>>,
    pub ride_status: String,
    pub ride_queue: String,
}

// async fn get_ride_status(ride_id: &str, db: &sea_orm::DatabaseConnection) -> Result<String, String> {
//     match RideEntities::find()
//         .filter(<RideEntities as EntityTrait>::Column::RideId.eq(ride_id))
//         .one(db)
//         .await
//     {
        
//     }
// }

// #[command]
// pub async fn get_all_rides(
//     state: State<'_, AppState>,
// ) -> Result<ApiResponse<Vec<RideReturn>>, String> {
//     let db = state.get_db().await.map_err(|e| e)?;

//     match RideEntities::find()
//         .all(&db)
//         .await
//     {
//         Ok(rides) => {
//             let ride_returns: Vec<RideReturn> = rides.into_iter().map(|ride| RideReturn {
//                 ride_id: ride.ride_id.to_string(),
//                 ride_name: ride.name.clone(),
//                 ride_description: ride.description,
//                 ride_pictures: ride.pictures,
//                 ride_status: ride.status.clone(),
//                 ride_queue: ride.queue.to_string(),
//             }).collect();

//             Ok(ApiResponse::success(ride_returns, "Success!".to_string()))
//         }
//         Err(err) => Ok(ApiResponse::error(None, format!("Database error: {}", err)))
//     }
// }
