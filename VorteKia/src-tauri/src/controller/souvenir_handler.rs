use entity::store::Entity as StoreEntities;
use entity::souvenir::{ActiveModel as SouvenirActiveModel, Entity as SouvenirEntities};
use sea_orm::{IntoActiveModel, Set};
use sea_orm::{EntityTrait, QueryFilter, entity::prelude::*};
use serde::{Deserialize, Serialize};
use tauri::{command, State};
use crate::{AppState, ApiResponse};

use super::ride_handler::SingleUidRequest;

#[derive(Serialize, Deserialize)]
pub struct SouvenirReturn {
    pub souvenir_id: String,
    pub name: String,
    pub description: String,
    pub price: f32,
    pub pictures: Option<Vec<String>>,
}

#[command]
pub async fn get_store_souvenir(
    state: State<'_, AppState>,
    payload: SingleUidRequest
) -> Result<ApiResponse<Vec<SouvenirReturn>>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let store = StoreEntities::find()
        .filter(<StoreEntities as EntityTrait>::Column::StoreId.eq(payload.id))
        .one(&db)
        .await
        .map_err(|e| e.to_string())?;

    let store = match store {
        Some(store) => store,
        None => {
            return Ok(ApiResponse::error(None, "Store not found".to_string()));
        }
    };

    let souvenirs = SouvenirEntities::find()
        .filter(<SouvenirEntities as EntityTrait>::Column::StoreId.eq(store.store_id))
        .all(&db)
        .await
        .map_err(|e| e.to_string())?;

    let mut souvenir_returns = Vec::new();

    for souvenir in souvenirs {
        let souvenir_return = SouvenirReturn {
            souvenir_id: souvenir.souvenir_id.clone(),
            name: souvenir.name.clone(),
            description: souvenir.description.unwrap().clone(),
            price: souvenir.price,
            pictures: souvenir.pictures.clone(),
        };

        souvenir_returns.push(souvenir_return);
    }

    Ok(ApiResponse::success(souvenir_returns, "Souvenirs fetched successfully".to_string()))
}

#[derive(Deserialize, Serialize)]
pub struct CreateSouvenirRequest {
    pub store_id: String,
    pub name: String,
    pub description: String,
    pub price: f32,
    pub pictures: Option<Vec<String>>,
}
#[command]
pub async fn create_souvenir(
    state: State<'_, AppState>,
    payload: CreateSouvenirRequest
) -> Result<ApiResponse<SouvenirReturn>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let generated_id = Uuid::new_v4().to_string();

    let new_souvenir = SouvenirActiveModel {
        souvenir_id: Set(generated_id.clone()),
        store_id: Set(payload.store_id.clone()),
        name: Set(payload.name.clone()),
        description: Set(Some(payload.description.clone())),
        price: Set(payload.price),
        pictures: Set(payload.pictures.clone()),
    };

    match new_souvenir.insert(&db).await {
        Ok(inserted_souvenir) => {
            let souvenirreturn = SouvenirReturn {
                souvenir_id: inserted_souvenir.souvenir_id,
                name: inserted_souvenir.name,
                description: inserted_souvenir.description.unwrap(),
                price: inserted_souvenir.price,
                pictures: inserted_souvenir.pictures,
            };
            return Ok(ApiResponse::success(souvenirreturn, "Souvenir created successfully".to_string()))
        },
        Err(e) => Ok(ApiResponse::error(None, format!("Error adding store: {}", e))),
    }
}

#[command]
pub async fn get_souvenir_by_id(
    state: State<'_, AppState>,
    payload: SingleUidRequest
) -> Result<ApiResponse<SouvenirReturn>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let souvenir = SouvenirEntities::find()
        .filter(<SouvenirEntities as EntityTrait>::Column::SouvenirId.eq(payload.id))
        .one(&db)
        .await
        .map_err(|e| e.to_string())?;

    let souvenir = match souvenir {
        Some(souvenir) => souvenir,
        None => {
            return Ok(ApiResponse::error(None, "Souvenir not found".to_string()));
        }
    };

    let souvenir_return = SouvenirReturn {
        souvenir_id: souvenir.souvenir_id.clone(),
        name: souvenir.name.clone(),
        description: souvenir.description.unwrap().clone(),
        price: souvenir.price,
        pictures: souvenir.pictures.clone(),
    };

    Ok(ApiResponse::success(souvenir_return, "Souvenir fetched successfully".to_string()))
}


#[command]
pub async fn edit_souvenir(
    state: State<'_, AppState>,
    payload: SouvenirReturn
) -> Result<ApiResponse<SouvenirReturn>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let souvenir = SouvenirEntities::find()
        .filter(<SouvenirEntities as EntityTrait>::Column::SouvenirId.eq(payload.souvenir_id))
        .one(&db)
        .await
        .map_err(|e| e.to_string())?;

    let mut souvenir = match souvenir {
        Some(souvenir) => souvenir.into_active_model(),
        None => {
            return Ok(ApiResponse::error(None, "Souvenir not found!".to_string()));
        }
    };

    souvenir.name = Set(payload.name);
    souvenir.description = Set(Some(payload.description));
    souvenir.price = Set(payload.price);
    souvenir.pictures = Set(payload.pictures);

    let updated_souvenir = souvenir.update(&db).await.map_err(|e| e.to_string())?;

    let souvenir_return = SouvenirReturn {
        souvenir_id: updated_souvenir.souvenir_id,
        name: updated_souvenir.name,
        description: updated_souvenir.description.unwrap(),
        price: updated_souvenir.price,
        pictures: updated_souvenir.pictures,
    };

    Ok(ApiResponse::success(souvenir_return, "Souvenir edited successfully".to_string()))
}

#[command]
pub async fn delete_souvenir(
    state: State<'_, AppState>,
    payload: SingleUidRequest,
) -> Result<ApiResponse<bool>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let souvenir = SouvenirEntities::find()
        .filter(<SouvenirEntities as EntityTrait>::Column::SouvenirId.eq(payload.id))
        .one(&db)
        .await
        .map_err(|e| e.to_string())?;

    let souvenir = match souvenir {
        Some(souvenir) => souvenir,
        None => {
            return Ok(ApiResponse::error(None, "Souvenir not found!".to_string()));
        }
    };

    let _ = souvenir.delete(&db).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success(true, "Souvenir deleted successfully".to_string()))
}