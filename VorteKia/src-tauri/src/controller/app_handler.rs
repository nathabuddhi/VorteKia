use tauri::command;
use crate:: ApiResponse;
use std::env;

#[command]
pub async fn get_curr_app(
) -> Result<ApiResponse<String>, ApiResponse<String>> {
    let curr_app = env::var("CURR_APP").ok().and_then(|value| {
        if !value.is_empty() {
            Some(value)
        } else {
            None
        }
    });

    match curr_app {
        Some(app) => {
            let parts: Vec<&str> = app.split('_').collect();
            if parts.len() >= 2 {
                let part1 = parts[0];
                let part2 = parts[1];

                return Ok(ApiResponse::success(part1.to_string() + "/" + &part2.to_string(), "Success".to_string()));
            }
            Ok(ApiResponse::success("".to_string(), "CURR_APP INVALID!".to_string()))
        },
        None => {
            Ok(ApiResponse::success("".to_string(), "CURR_APP not set.".to_string()))
        }
    }
}