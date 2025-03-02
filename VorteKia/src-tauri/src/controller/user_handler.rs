use sea_orm::{EntityTrait, QueryFilter, entity::prelude::*};
use entity::user::{Model as UserInstance, ActiveModel as UserActiveModel, Entity as UserEntities};
use entity::customer::Entity as CustomerEntities;
use entity::staff::Entity as StaffEntities;
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
pub struct CreateUserRequest {
    email: String,
    password: String,
    name: String,
}
#[command]
pub async fn create_user(
    state: State<'_, AppState>,
    payload: CreateUserRequest,
) -> Result<ApiResponse<UserInstance>, String> {
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
        Ok(inserted_user) => Ok(ApiResponse::success(inserted_user, "User created successfully.".to_string())),
        Err(e) => Err(e.to_string()),
    }
}