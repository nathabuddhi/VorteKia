use entity::division::{Model as DivisionModel, Entity as DivisionEntities};
use sea_orm::EntityTrait;
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
