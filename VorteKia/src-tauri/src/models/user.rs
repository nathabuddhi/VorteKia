use serde::{Serialize, Deserialize, Clone};

#[derive(Serialize, Deserialize, Clone)]
pub struct User {
    userID : String,
    password: String,
    email: String,
    name: String
}