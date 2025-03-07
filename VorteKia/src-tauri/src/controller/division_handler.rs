use entity::division::{Model as DivisionModel, Entity as DivisionEntities};
use sea_orm::{EntityTrait, QueryFilter, ColumnTrait};
use tauri::{command, State};
use crate::{AppState, ApiResponse};

#[command]
pub async fn get_all_divisions(
    state: State<'_, AppState>,
) -> Result<ApiResponse<Vec<DivisionModel>>, String> {
    let db = state.get_db().await.map_err(|e| e)?;

    match DivisionEntities::find()
        .all(&db)
        .await
    {
        Ok(divisions) => {
            Ok(ApiResponse::success(divisions, "Success!".to_string()))
        }
        Err(err) => Ok(ApiResponse::error(None, format!("Database error: {}", err)))
    }
}

pub async fn get_id_by_name(
    state: State<'_, AppState>,
    name: String,
) -> Result<String, String> {
    let db = state.get_db().await.map_err(|e| e)?;

    match DivisionEntities::find()
        .filter(entity::division::Column::DivisionName.eq(name))
        .one(&db)
        .await
    {
        Ok(division) => {
            Ok(division.unwrap().division_id)
        }
        Err(err) => Err(format!("Database error: {}", err))
    }
}