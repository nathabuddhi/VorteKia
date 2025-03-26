use entity::income::{self, Entity as IncomeEntities, ActiveModel as IncomeActiveModel};
use entity::order::{self, Entity as OrderEntities};
use entity::order_detail::{self, Entity as OrderDetailEntities};
use entity::transaction::{self, Entity as TransactionEntities};
use entity::transaction_detail::{self, Entity as TransactionDetailEntities};
use entity::ride::Entity as RideEntities;
use entity::menu::{self, Entity as MenuEntities};
use entity::souvenir::{self, Entity as SouvenirEntities};
use sea_orm::{ActiveModelTrait, DatabaseConnection, Set};
use sea_orm::{EntityTrait, QueryFilter, ColumnTrait};
use serde::{Deserialize, Serialize};
use tauri::{command, State};

use chrono::{Local, Duration};

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

#[derive(Deserialize, Serialize)]
pub struct IncomeReturn {
    pub income_type: String,
    pub total: f32,
    pub consumption: f32,
    pub operational: f32,
    pub marketing: f32
}

#[command]
pub async fn get_cfo_income(
    state: State<'_, AppState>,
    payload: String,
) -> Result<ApiResponse<IncomeReturn>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let mut all_orders: Vec<order::Model> = Vec::new();
    let mut all_transactions: Vec<transaction::Model> = Vec::new();
    let all_rides = RideEntities::find()
            .all(&db)
            .await
            .map_err(|e| e.to_string())?;

    if &payload == "all" {
        all_orders = OrderEntities::find()
            .all(&db)
            .await
            .map_err(|e| e.to_string())?;

        all_transactions = TransactionEntities::find()
        .all(&db)
            .await
            .map_err(|e| e.to_string())?;

    } else if &payload == "day" {
        let twenty_four_hours_ago = Local::now().naive_local() - Duration::hours(24);

        all_orders = OrderEntities::find()
            .filter(order::Column::Timestamp.gt(twenty_four_hours_ago))
            .all(&db)
            .await
            .map_err(|e| e.to_string())?;

        all_transactions = TransactionEntities::find()
            .filter(transaction::Column::Time.gt(twenty_four_hours_ago))
            .all(&db)
            .await
            .map_err(|e| e.to_string())?;
    } else if &payload == "week" {
        let seven_days_ago = Local::now().naive_local() - Duration::days(7);

        all_orders = OrderEntities::find()
            .filter(order::Column::Timestamp.gt(seven_days_ago))
            .all(&db)
            .await
            .map_err(|e| e.to_string())?;

        all_transactions = TransactionEntities::find()
            .filter(transaction::Column::Time.gt(seven_days_ago))
            .all(&db)
            .await
            .map_err(|e| e.to_string())?;
    } else if &payload == "month" {
        let thirty_days_ago = Local::now().naive_local() - Duration::days(30);

        all_orders = OrderEntities::find()
            .filter(order::Column::Timestamp.gt(thirty_days_ago))
            .all(&db)
            .await
            .map_err(|e| e.to_string())?;

        all_transactions = TransactionEntities::find()
            .filter(transaction::Column::Time.gt(thirty_days_ago))
            .all(&db)
            .await
            .map_err(|e| e.to_string())?;
    }

    let mut restaurant_income: f32 = 0.0;
    let mut ride_income: f32 = 0.0;
    let mut store_income: f32 = 0.0;

    for o in all_orders {
        let details = OrderDetailEntities::find()
            .filter(order_detail::Column::OrderId.eq(&o.order_id))
            .all(&db)
            .await
            .map_err(|e| e.to_string())?;

        for d in details {
            let menu = MenuEntities::find()
                .filter(menu::Column::MenuId.eq(&d.menu_id))
                .one(&db)
                .await
                .map_err(|e| e.to_string())?.unwrap();

            restaurant_income += menu.price * d.quantity as f32;
        }
    }

    for t in all_transactions {
        let details = TransactionDetailEntities::find()
            .filter(transaction_detail::Column::TransactionId.eq(&t.transaction_id))
            .all(&db)
            .await
            .map_err(|e| e.to_string())?;

        for d in details {
            let souvenir = SouvenirEntities::find()
                .filter(souvenir::Column::SouvenirId.eq(&d.souvenir_id))
                .one(&db)
                .await
                .map_err(|e| e.to_string())?.unwrap();

            store_income += souvenir.price * d.quantity as f32;
        }
    }

    for r in all_rides {
        let all_income = IncomeEntities::find()
            .filter(income::Column::LocationId.eq(&r.ride_id))
            .one(&db)
            .await
            .map_err(|e| e.to_string())?.unwrap();

        ride_income += all_income.income;
    }

    if &payload == "week" {
        ride_income /= 7.0;
    } else if & payload == "day" {
        ride_income /= 30.0;
    }

    let total_income = restaurant_income + ride_income + store_income;

    let income_return = IncomeReturn {
        income_type: payload.clone(),
        total: total_income,
        consumption: restaurant_income,
        operational: ride_income,
        marketing: store_income
    };

    Ok(ApiResponse::success(income_return, "Successfully fetched income!".to_string()))
}

#[command] 
pub async fn get_store_income_day(
    state: State<'_, AppState>,
    payload: SingleUidRequest,
) -> Result<ApiResponse<f32>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let twenty_four_hours_ago = Local::now().naive_local() - Duration::hours(24);
    let all_transactions = TransactionEntities::find()
        .filter(transaction::Column::Time.gt(twenty_four_hours_ago))
        .filter(transaction::Column::StoreId.eq(payload.id))
        .all(&db)
        .await
        .map_err(|e| e.to_string())?;

    let mut store_income: f32 = 0.0;

    for t in all_transactions {
        let details = TransactionDetailEntities::find()
            .filter(transaction_detail::Column::TransactionId.eq(&t.transaction_id))
            .all(&db)
            .await
            .map_err(|e| e.to_string())?;

        for d in details {
            let souvenir = SouvenirEntities::find()
                .filter(souvenir::Column::SouvenirId.eq(&d.souvenir_id))
                .one(&db)
                .await
                .map_err(|e| e.to_string())?.unwrap();

            store_income += souvenir.price * d.quantity as f32;
        }
    }

    Ok(ApiResponse::success(store_income, "Successfully fetched store income!".to_string()))
}