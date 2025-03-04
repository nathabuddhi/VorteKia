use deadpool_redis::{redis::cmd, Pool as RedisPool};
use serde::{Deserialize, Serialize};
use serde_json;
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Serialize, Deserialize)]
struct CachedData<T> {
    data: T,
}

pub struct CacheHandler {
    redis_pool: Arc<Mutex<RedisPool>>,
}

impl CacheHandler {
    pub fn new(redis_pool: RedisPool) -> Self {
        CacheHandler {
            redis_pool: Arc::new(Mutex::new(redis_pool)),
        }
    }

    pub async fn set_cache<T: Serialize>(&self, key: &str, value: &T, ttl: usize) {
        let mut conn = match self.redis_pool.lock().await.get().await {
            Ok(conn) => conn,
            Err(err) => {
                eprintln!("Redis Connection Error: {}", err);
                return;
            }
        };

        let json_value = match serde_json::to_string(&CachedData { data: value }) {
            Ok(json) => json,
            Err(err) => {
                eprintln!("Cache Serialization Error: {}", err);
                return;
            }
        };

        if let Err(err) = cmd("SETEX")
            .arg(&[key, &ttl.to_string(), &json_value])
            .query_async::<()>(&mut conn)
            .await
        {
            eprintln!("Redis Set Cache Error: {}", err);
        }
    }

    pub async fn get_cache<T: for<'de> Deserialize<'de>>(&self, key: &str) -> Option<T> {
        let mut conn = match self.redis_pool.lock().await.get().await {
            Ok(conn) => conn,
            Err(err) => {
                eprintln!("Redis Connection Error: {}", err);
                return None;
            }
        };

        let cached_data: Option<String> = match cmd("GET").arg(&[key]).query_async(&mut conn).await {
            Ok(value) => value,
            Err(err) => {
                eprintln!("Redis Get Cache Error: {}", err);
                return None;
            }
        };

        if let Some(json_str) = cached_data {
            match serde_json::from_str::<CachedData<T>>(&json_str) {
                Ok(wrapper) => Some(wrapper.data),
                Err(err) => {
                    eprintln!("Cache Deserialization Error: {}", err);
                    None
                }
            }
        } else {
            None
        }
    }

    pub async fn delete_cache(&self, key: &str) {
        let mut conn = match self.redis_pool.lock().await.get().await {
            Ok(conn) => conn,
            Err(err) => {
                eprintln!("Redis Connection Error: {}", err);
                return;
            }
        };

        if let Err(err) = cmd("DEL").arg(&[key]).query_async::<()>(&mut conn).await {
            eprintln!("Redis Delete Cache Error: {}", err);
        }
    }
}