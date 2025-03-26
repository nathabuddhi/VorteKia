use chrono::Utc;
use entity::transaction::{ActiveModel as TransactionActiveModel, Entity as TransactionEntities};
use entity::transaction_detail::{ActiveModel as DetailActiveModel, Entity as DetailEntities};
use entity::store::Entity as StoreEntities;
use entity::souvenir::Entity as SouvenirEntities;
use sea_orm::{EntityTrait, QueryFilter, entity::prelude::*, Set};
use serde::{Deserialize, Serialize};
use tauri::{command, State};
use crate::{AppState, ApiResponse};

use super::income_handler::{update_income_data, UpdateIncomeRequest};
use super::ride_handler::SingleUidRequest;
use super::user_handler::{change_user_balance, ChangeUserBalanceRequest};

#[derive(Serialize, Deserialize)]
pub struct CreateTransactionRequest {
    pub user_id: String,
    pub souvenir_id: String,
    pub payment: String,
    pub quantity: i32,
}

#[command]
pub async fn create_transaction(
    state: State<'_, AppState>,
    payload: CreateTransactionRequest
) -> Result<ApiResponse<bool>, String> {
    let db = state.get_db().await.map_err(|e| e.to_string())?;

    let souvenir = SouvenirEntities::find()
        .filter(<SouvenirEntities as EntityTrait>::Column::SouvenirId.eq(payload.souvenir_id.clone()))
        .one(&db)
        .await
        .map_err(|e| e.to_string())?.unwrap();

    let income = souvenir.price * payload.quantity as f32;

    let deduct_user_balance = change_user_balance(
        state.clone(),
        ChangeUserBalanceRequest { user_id: payload.user_id.clone(), mutation: -income.clone() }
    ).await.unwrap();

    if let ApiResponse::Error { success, .. } = deduct_user_balance {
        if !success {
            return Ok(ApiResponse::error(None, "User balance is not enough!".to_string()));
        }
    }
    
    let store = StoreEntities::find()
        .filter(<StoreEntities as EntityTrait>::Column::StoreId.eq(souvenir.store_id.clone()))
        .one(&db)
        .await
        .map_err(|e| e.to_string())?.unwrap();

    let generated_id = Uuid::new_v4().to_string();
    
    let new_transaction = TransactionActiveModel {
        transaction_id: Set(generated_id.clone()),
        customer_id: Set(payload.user_id.clone()),
        status: Set("pending".to_string()),
        store_id: Set(store.store_id.clone()),
        payment: Set(payload.payment.clone()),
        time: Set(Utc::now().naive_utc().date()),
    };

    let new_detail = DetailActiveModel {
        transaction_id: Set(generated_id.clone()),
        souvenir_id: Set(payload.souvenir_id.clone()),
        quantity: Set(payload.quantity),
    };

    new_transaction.insert(&db).await.map_err(|e| e.to_string())?;
    new_detail.insert(&db).await.map_err(|e| e.to_string())?;

    update_income_data(state.clone(), UpdateIncomeRequest { id: store.store_id.clone(), mutation: income }).await.map_err(|e| e.to_string())?;

    Ok(ApiResponse::success(true, "Transaction placed successfully!".to_string()))
}

#[derive(Serialize, Deserialize)]
pub struct TransactionReturn {
    pub transaction_id: String,
    pub customer_id: String,
    pub status: String,
    pub souvenir_name: String,
    pub quantity: i32,
    pub time: String,
}

#[derive(Deserialize)]
pub struct GetCustomerTransactionsRequest {
    pub user_id: String,
    pub store_id: String,
}

#[command]
pub async fn get_transactions_customer(
    state: State<'_, AppState>,
    payload: GetCustomerTransactionsRequest
) -> Result<ApiResponse<Vec<TransactionReturn>>, String> {
    let db = state.get_db().await.map_err(|e| e.to_string())?;

    let transactions = TransactionEntities::find()
        .filter(<TransactionEntities as EntityTrait>::Column::StoreId.eq(payload.store_id))
        .filter(<TransactionEntities as EntityTrait>::Column::CustomerId.eq(payload.user_id))
        .all(&db)
        .await
        .map_err(|e| e.to_string())?;

    let mut transactions_return = Vec::new();

    for o in transactions {
        let details = DetailEntities::find()
            .filter(<DetailEntities as EntityTrait>::Column::TransactionId.eq(o.transaction_id.clone()))
            .one(&db)
            .await
            .map_err(|e| e.to_string())?.unwrap();
        let souvenir_name = SouvenirEntities::find()
            .filter(<SouvenirEntities as EntityTrait>::Column::SouvenirId.eq(details.souvenir_id.clone()))
            .one(&db)
            .await
            .map_err(|e| e.to_string())?.unwrap().name;

        let transaction = TransactionReturn {
            transaction_id: o.transaction_id.clone(),
            customer_id: o.customer_id.clone(),
            status: o.status.clone(),
            souvenir_name: souvenir_name.clone(),
            quantity: details.quantity.clone(),
            time: o.time.to_string(),
        };

        transactions_return.push(transaction);
    }

    Ok(ApiResponse::success(transactions_return, "Transactions fetched successfully!".to_string()))
}

#[command]
pub async fn get_transactions_store(
    state: State<'_, AppState>,
    payload: SingleUidRequest
) -> Result<ApiResponse<Vec<TransactionReturn>>, String> {
    let db = state.get_db().await.map_err(|e| e.to_string())?;

    let transactions = TransactionEntities::find()
        .filter(<TransactionEntities as EntityTrait>::Column::StoreId.eq(payload.id))
        .all(&db)
        .await
        .map_err(|e| e.to_string())?;

    let mut transactions_return = Vec::new();

    for o in transactions {
        let details = DetailEntities::find()
            .filter(<DetailEntities as EntityTrait>::Column::TransactionId.eq(o.transaction_id.clone()))
            .one(&db)
            .await
            .map_err(|e| e.to_string())?.unwrap();
        let souvenir_name = SouvenirEntities::find()
            .filter(<SouvenirEntities as EntityTrait>::Column::SouvenirId.eq(details.souvenir_id.clone()))
            .one(&db)
            .await
            .map_err(|e| e.to_string())?.unwrap().name;

        let transaction = TransactionReturn {
            transaction_id: o.transaction_id.clone(),
            customer_id: o.customer_id.clone(),
            status: o.status.clone(),
            souvenir_name: souvenir_name.clone(),
            quantity: details.quantity.clone(),
            time: o.time.to_string(),
        };

        transactions_return.push(transaction);
    }

    Ok(ApiResponse::success(transactions_return, "Transactions fetched successfully!".to_string()))
}