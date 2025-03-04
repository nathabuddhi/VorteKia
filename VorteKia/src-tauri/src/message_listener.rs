use tokio_postgres::{NoTls, Error};
use futures::stream::StreamExt;
use std::env;
use sqlx::postgres::PgListener;

#[tokio::main]
async fn main() -> Result<(), Error> {
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let mut listener: PgListener = PgListener::connect(database_url.as_str()).await.unwrap();
    let (client, connection) =
        tokio_postgres::connect(database_url.as_str(), NoTls).await?;
    
    tokio::spawn(async move {
        if let Err(e) = connection.await {
            eprintln!("Connection error: {}", e);
        }
    });

    client.batch_execute("LISTEN new_message").await?;

    println!("Listening for new messages...");

    let mut listener = client;

    Ok(())
}
