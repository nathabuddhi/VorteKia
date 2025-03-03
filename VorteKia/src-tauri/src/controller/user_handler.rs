use sea_orm::{EntityTrait, QueryFilter, entity::prelude::*};
use entity::user::{ActiveModel as UserActiveModel, Entity as UserEntities};
use entity::customer::{ActiveModel as CustomerActiveModel, Entity as CustomerEntities};
use entity::staff::{ActiveModel as StaffActiveModel, Entity as StaffEntities};
use entity::division::Entity as DivisionEntities;
use tauri::{command, State};
use crate::{AppState, ApiResponse};
use uuid::Uuid;
use serde::{Deserialize, Serialize};
use sea_orm::ActiveValue::Set;
use bcrypt::{hash, verify, DEFAULT_COST};

fn hash_password(plain_password: &str) -> Result<String, bcrypt::BcryptError> {
    hash(plain_password, DEFAULT_COST)
}

fn verify_password(plain_password: &str, hashed_password: &str) -> Result<bool, bcrypt::BcryptError> {
    verify(plain_password, hashed_password)
}

async fn get_user_division(
    db: &DatabaseConnection,
    user_id: String
) -> Result<String, String> {
    match CustomerEntities::find()
        .filter(<CustomerEntities as EntityTrait>::Column::UserId.eq(&user_id))
        .one(db)
        .await {
            Ok(Some(_user)) => {
                Ok("customer".to_string())
            }
            Ok(None) => {
                match StaffEntities::find()
                    .filter(<StaffEntities as EntityTrait>::Column::UserId.eq(&user_id))
                    .one(db)
                    .await {
                        Ok(Some(staff)) => {
                            match DivisionEntities::find()
                                .filter(<DivisionEntities as EntityTrait>::Column::DivisionId.eq(&staff.division_id))
                                .one(db)
                                .await {
                                    Ok(Some(division)) => {
                                        Ok(division.division_name)
                                    }
                                    Ok(None) => {
                                        Ok("NO DIVISION".to_string())
                                    }
                                    Err(err) => {
                                        Err(format!("Database error: {}", err))
                                    }
                                }
                        }
                        Ok(None) => {
                            Ok("NO ROLE".to_string())
                        }
                        Err(err) => {
                            Err(format!("Database error: {}", err))
                        }
                    }
            }
            Err(err) => {
                Err(format!("Database error: {}", err))
            }
        }
}

async fn get_user_role(
    db: &DatabaseConnection,
    user_id: String
) -> Result<String, String> {
    match CustomerEntities::find()
        .filter(<CustomerEntities as EntityTrait>::Column::UserId.eq(&user_id))
        .one(db)
        .await {
            Ok(Some(_user)) => {
                Ok("customer".to_string())
            }
            Ok(None) => {
                match StaffEntities::find()
                    .filter(<StaffEntities as EntityTrait>::Column::UserId.eq(&user_id))
                    .one(db)
                    .await {
                        Ok(Some(staff)) => {
                            Ok(staff.role)
                        }
                        Ok(None) => {
                            Ok("NO ROLE".to_string())
                        }
                        Err(err) => {
                            Err(format!("Database error: {}", err))
                        }
                    }
            }
            Err(err) => {
                Err(format!("Database error: {}", err))
            }
        }
}


#[derive(Serialize)]
pub struct UserDetail {
    name: String,
    user_id: String,
    role: String,
    division: String
}
#[derive(Deserialize)]
pub struct LoginRequest {
    email: String,
    password: String,
}
#[command]
pub async fn login(
    state: State<'_, AppState>,
    payload: LoginRequest
) -> Result<ApiResponse<UserDetail>, String> {
    let db = state.get_db().await.map_err(|e| e)?;

    match UserEntities::find()
        .filter(<UserEntities as EntityTrait>::Column::Email.eq(payload.email))
        .one(&db)
        .await
    {
        Ok(Some(user)) => {
            match verify_password(&payload.password, &user.password) {
                Ok(true) => {
                    let role_name = get_user_role(&db, user.user_id.clone()).await?;
                    let division_name = get_user_division(&db, user.user_id.clone()).await?;

                    let user_detail: UserDetail = UserDetail {
                        name: user.name.clone(),
                        user_id: user.user_id.clone(),
                        role: role_name,
                        division: division_name,
                    };
                    Ok(ApiResponse::success(user_detail, "Login successful!".to_string()))
                },
                Ok(false) => {
                    Ok(ApiResponse::error(None, "Invalid credentials.".to_string()))
                },
                Err(err) => {
                    Err(format!("Error verifying password: {}", err))
                }
            }
        }
        Ok(None) => {
            Ok(ApiResponse::error(None, "Email not registered!".to_string()))
        }
        Err(err) => {
            Err(format!("Database error: {}", err))
        }
    }
}


#[derive(Deserialize)]
pub struct LoginUIDRequest {
    user_id: String,
}
#[command]
pub async fn login_uid(
    state: State<'_, AppState>,
    payload: LoginUIDRequest
) -> Result<ApiResponse<UserDetail>, String> {
    let db = state.get_db().await.map_err(|e| e)?;

    match UserEntities::find()
        .filter(<UserEntities as EntityTrait>::Column::UserId.eq(payload.user_id))
        .one(&db)
        .await
    {
        Ok(Some(user)) => {
                let role_name = get_user_role(&db, user.user_id.clone()).await?;
                let division_name = get_user_division(&db, user.user_id.clone()).await?;

                let user_detail: UserDetail = UserDetail {
                    name: user.name.clone(),
                    user_id: user.user_id.clone(),
                    role: role_name.clone(),
                    division: division_name,
                };
                if role_name == "customer" {
                    Ok(ApiResponse::success(user_detail, "Login as Customer Successful!".to_string()))
                } else {
                    Ok(ApiResponse::error(None, "Detected as Staff. Please login using the staff login page.".to_string()))
                }
            }
        Ok(None) => {
            Ok(ApiResponse::error(None, "UID not found!".to_string()))
        }
        Err(err) => {
            Err(format!("Database error: {}", err))
        }
    }
}

#[derive(Deserialize)]
pub struct CreateUserRequest {
    email: String,
    password: String,
    name: String,
}
async fn create_user(
    state: State<'_, AppState>,
    payload: CreateUserRequest,
) -> Result<String, String> {
    let generated_id = Uuid::new_v4();

    let hashed_password = hash_password(&payload.password)
        .map_err(|e| format!("Password hashing error: {}", e))?;

    let new_user = UserActiveModel {
        user_id: Set(generated_id.to_string()),
        email: Set(payload.email),
        password: Set(hashed_password),
        name: Set(payload.name),
    };

    let db = state.get_db().await.map_err(|e| e.to_string())?;

    match new_user.insert(&db).await {
        Ok(inserted_user) => Ok(inserted_user.user_id),
        Err(e) => Err(e.to_string()),
    }
}


#[derive(Deserialize)]
pub struct CreateCustomerRequest {
    email: String,
    password: String,
    name: String,
    balance: f32,
}
#[command]
pub async fn create_customer_account(
    state: State<'_, AppState>,
    payload: CreateCustomerRequest,
) -> Result<ApiResponse<String>, String> {
    let response = create_user(
        state.clone(),
        CreateUserRequest {
            email: payload.email.clone(),
            password: payload.password.clone(),
            name: payload.name.clone(),
        },
    )
    .await
    .map_err(|err| format!("Failed to create user: {}", err))?;

    let db = state.get_db().await.map_err(|e| e)?;

    let new_customer = CustomerActiveModel {
        user_id: Set(response),
        balance: Set(payload.balance),
    };

    match new_customer.insert(&db).await {
        Ok(inserted_customer) => Ok(ApiResponse::Success { success: (true), data: (inserted_customer.user_id), message: ("Success created customer!".to_string()) }),
        Err(e) => Err(e.to_string()),
    }
}

#[derive(Deserialize)]
pub struct CreatStaffRequest {
    email: String,
    password: String,
    name: String,
    division_id: String,
    role: String
}
#[command]
pub async fn create_staff_account(
    state: State<'_, AppState>,
    payload: CreatStaffRequest,
) -> Result<ApiResponse<String>, String> {
    let response = create_user(
        state.clone(),
        CreateUserRequest {
            email: payload.email.clone(),
            password: payload.password.clone(),
            name: payload.name.clone(),
        },
    )
    .await
    .map_err(|err| format!("Failed to create user: {}", err))?;

    let db = state.get_db().await.map_err(|e| e)?;

    let new_staff = StaffActiveModel {
        user_id: Set(response),
        division_id: Set(payload.division_id),
        role: Set(payload.role),
    };

    match new_staff.insert(&db).await {
        Ok(inserted_staff) => Ok(ApiResponse::Success { success: (true), data: (inserted_staff.user_id), message: ("Success created staff!".to_string()) }),
        Err(e) => Err(e.to_string()),
    }
}