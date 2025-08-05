//! # CIRO Network Indexer Dashboard
//!
//! Simple web dashboard to view indexed blockchain events.

use anyhow::Result;
use axum::{
    extract::Query,
    http::StatusCode,
    response::{Html, Json},
    routing::get,
    Router,
};
use clap::Parser;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::net::TcpListener;
use tower::ServiceBuilder;
use tower_http::cors::CorsLayer;
use tracing::{info, error};
use tracing_subscriber;

use ciro_worker::SimpleDatabase as DatabaseManager;

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct Args {
    /// Database URL
    #[arg(long)]
    database_url: String,
    
    /// Port to run dashboard on
    #[arg(long, default_value = "3000")]
    port: u16,
}

#[derive(Debug, Serialize)]
struct DashboardStats {
    total_events: u64,
    total_blocks: u64,
    last_block: u64,
    events_by_type: HashMap<String, u64>,
    events_by_contract: HashMap<String, u64>,
}

#[derive(Debug, Serialize)]
struct EventSummary {
    event_type: String,
    contract_address: String,
    block_number: u64,
    timestamp: u64,
    data: serde_json::Value,
}

#[derive(Debug, Deserialize)]
struct EventQuery {
    limit: Option<u32>,
    contract: Option<String>,
    event_type: Option<String>,
}

struct AppState {
    database: Arc<DatabaseManager>,
}

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize logging
    tracing_subscriber::fmt()
        .with_env_filter("info,ciro_node=debug")
        .init();

    let args = Args::parse();

    info!("Starting CIRO Network Indexer Dashboard");
    
    // Initialize database
    let database = Arc::new(DatabaseManager::new(&args.database_url).await?);
    
    // Test database connection
    match database.health_check().await {
        Ok(_) => info!("✅ Connected to database successfully"),
        Err(e) => {
            error!("❌ Failed to connect to database: {}", e);
            return Err(e);
        }
    }

    let state = Arc::new(AppState { database });

    // Build router
    let app = Router::new()
        .route("/", get(dashboard_html))
        .route("/api/stats", get(get_stats))
        .route("/api/events", get(get_events))
        .route("/api/contracts", get(get_contracts))
        .with_state(state)
        .layer(ServiceBuilder::new().layer(CorsLayer::permissive()));

    let listener = TcpListener::bind(&format!("0.0.0.0:{}", args.port)).await?;
    
    info!("🚀 Dashboard running on http://localhost:{}", args.port);
    info!("📊 View your indexed events at http://localhost:{}", args.port);
    
    axum::serve(listener, app).await?;

    Ok(())
}

async fn dashboard_html() -> Html<&'static str> {
    Html(include_str!("../../templates/dashboard.html"))
}

async fn get_stats(
    axum::extract::State(state): axum::extract::State<Arc<AppState>>,
) -> Result<Json<DashboardStats>, StatusCode> {
    // Get real event statistics from database
    let (total_events, events_by_type, events_by_contract) = state.database
        .get_event_stats()
        .await
        .map_err(|e| {
            tracing::error!("Failed to get event stats: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    let stats = DashboardStats {
        total_events: total_events as u64,
        total_blocks: 0, // TODO: Get from indexer state
        last_block: 0,   // TODO: Get from indexer state
        events_by_type: events_by_type.into_iter().map(|(k, v)| (k, v as u64)).collect(),
        events_by_contract: events_by_contract.into_iter().map(|(k, v)| (k, v as u64)).collect(),
    };
    
    Ok(Json(stats))
}

async fn get_events(
    Query(params): Query<EventQuery>,
    axum::extract::State(state): axum::extract::State<Arc<AppState>>,
) -> Result<Json<Vec<EventSummary>>, StatusCode> {
    let limit = params.limit.unwrap_or(50) as i64;
    
    // Get recent events from database
    let events = state.database
        .get_recent_events(limit)
        .await
        .map_err(|e| {
            tracing::error!("Failed to get events: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    // Convert to EventSummary format
    let event_summaries: Vec<EventSummary> = events
        .into_iter()
        .map(|event| EventSummary {
            contract_address: event.contract_address,
            event_type: event.event_type,
            block_number: event.block_number,
            timestamp: event.timestamp,
            data: event.data,
        })
        .collect();
    
    Ok(Json(event_summaries))
}

async fn get_contracts(
    axum::extract::State(_state): axum::extract::State<Arc<AppState>>,
) -> Result<Json<Vec<serde_json::Value>>, StatusCode> {
    // Return the 5 real CIRO Network contracts
    let contracts = vec![
        serde_json::json!({
            "name": "CIRO Token",
            "address": "0x03c0f7574905d7cbc2cca18d6c090265fa35b572d8e9dc62efeb5339908720d8",
            "contract_type": "ciro_token",
            "is_active": true
        }),
        serde_json::json!({
            "name": "CDC Pool",
            "address": "0x05f73c551dbfda890090c8ee89858992dfeea9794a63ad83e6b1706e9836aeba",
            "contract_type": "cdc_pool",
            "is_active": true
        }),
        serde_json::json!({
            "name": "Job Manager",
            "address": "0x00bf025663b8a7c7e43393f082b10afe66bd9ddb06fb5e521e3adbcf693094bd",
            "contract_type": "job_manager",
            "is_active": true
        }),
        serde_json::json!({
            "name": "Treasury Timelock",
            "address": "0x04736828c69fda6977bdb97c982db6bf1bbcae0396a2faac450b2ec7338089c7",
            "contract_type": "treasury_timelock",
            "is_active": true
        }),
        serde_json::json!({
            "name": "Reputation Manager",
            "address": "0x02f0ce7e13e113e91f3a4669f742e7470f2bdfb3c7146aff1d449fddf92b7dc0",
            "contract_type": "reputation_manager",
            "is_active": true
        }),
        serde_json::json!({
            "name": "SimpleEvents",
            "address": "0x02b4841412c3c27eab3c6e7cf2baefea15c3570bf349b68e215a82815a2abea8",
            "contract_type": "simple_events",
            "is_active": true
        })
    ];
    
    Ok(Json(contracts))
}