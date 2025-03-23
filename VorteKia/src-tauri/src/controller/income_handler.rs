use entity::income::{self, Entity as IncomeEntities, ActiveModel as IncomeActiveModel};
use sea_orm::{ActiveModelTrait, DatabaseConnection, Set};
use sea_orm::{EntityTrait, QueryFilter, ColumnTrait};
use serde::Deserialize;
use tauri::{command, State};

use crate::{ApiResponse, AppState};

use super::ride_handler::SingleUidRequest;

#[command]
pub async fn get_income(
    state: State<'_, AppState>,
    payload: SingleUidRequest,
) -> Result<ApiResponse<f32>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let incomes = IncomeEntities::find()
        .filter(income::Column::LocationId.eq(&payload.id))
        .one(&db)
        .await
        .map_err(|e| e.to_string())?;

    let income = match incomes {
        Some(income) => income.income,
        None => {
            create_income_data(state.clone(), SingleUidRequest { id: payload.id.clone() }).await?;
            0.0
        },
    };

    Ok(ApiResponse::success(income, "Successfully fetched income!".to_string()))
}

#[command]
pub async fn create_income_data(
    state: State<'_, AppState>,
    payload: SingleUidRequest,
) -> Result<ApiResponse<bool>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let income = IncomeActiveModel {
        location_id: Set(payload.id.clone()),
        income: Set(0.0),
    };

    income.insert(&db).await.map_err(|e| e.to_string())?;
    Ok(ApiResponse::success(true, "Successfully created income data!".to_string()))
}

#[derive(Deserialize)]
pub struct UpdateIncomeRequest {
    pub id: String,
    pub mutation: f32,
}

#[command]
pub async fn update_income_data(
    state: State<'_, AppState>,
    payload: UpdateIncomeRequest,
) -> Result<ApiResponse<f32>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let incomes = IncomeEntities::find()
        .filter(income::Column::LocationId.eq(&payload.id))
        .one(&db)
        .await
        .map_err(|e| e.to_string())?;

    let income = match incomes {
        Some(income) => income.income,
        None => {
            create_income_data(state.clone(), SingleUidRequest { id: payload.id.clone() }).await?;
            0.0
        },
    };

    let new_income = income + payload.mutation;
    let income = IncomeActiveModel {
        location_id: Set(payload.id.clone()),
        income: Set(new_income),
    };

    income.update(&db).await.map_err(|e| e.to_string())?;
    Ok(ApiResponse::success(new_income, "Successfully updated income!".to_string()))
}