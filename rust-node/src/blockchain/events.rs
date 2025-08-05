//! # Blockchain Event Indexer
//!
//! Simplified event indexer for CIRO Network smart contracts on Starknet.

use anyhow::{Result, Context};
use serde::{Deserialize, Serialize};
use starknet::core::types::{BlockId, FieldElement, MaybePendingBlockWithTxs, Transaction, MaybePendingTransactionReceipt, Event};
use starknet::providers::Provider;
use std::sync::Arc;
use tokio::sync::RwLock;
use tracing::{info, debug, error};
use tokio::time::{Duration, interval};

use crate::blockchain::client::StarknetClient;
use crate::storage::database_simple::SimpleDatabase as DatabaseManager;

/// Configuration for the event indexer
#[derive(Debug, Clone)]
pub struct IndexerConfig {
    /// How often to poll for new blocks (in seconds)
    pub poll_interval_secs: u64,
    /// Number of blocks to process in each batch
    pub batch_size: u64,
    /// Maximum number of retries for failed operations
    pub max_retries: u32,
    /// Delay between retries (in milliseconds)
    pub retry_delay_ms: u64,
    /// Whether to index historical blocks on startup
    pub index_historical: bool,
    /// Starting block for historical indexing
    pub start_block: u64,
}

impl Default for IndexerConfig {
    fn default() -> Self {
        Self {
            poll_interval_secs: 5,
            batch_size: 100,
            max_retries: 3,
            retry_delay_ms: 1000,
            index_historical: true,
            start_block: 0,
        }
    }
}

/// Simple event type for indexing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CiroEvent {
    pub contract_address: String,
    pub event_type: String,
    pub block_number: u64,
    pub timestamp: u64,
    pub data: serde_json::Value,
}

/// Event indexer state
#[derive(Debug, Clone)]
pub struct IndexerState {
    /// Last processed block number
    pub last_block: u64,
    /// Number of events indexed
    pub events_indexed: u64,
    /// Number of blocks processed
    pub blocks_processed: u64,
    /// Indexer start time
    pub started_at: chrono::DateTime<chrono::Utc>,
    /// Last update time
    pub last_updated: chrono::DateTime<chrono::Utc>,
}

/// Smart contract addresses we're monitoring
#[derive(Debug, Clone)]
pub struct ContractAddresses {
    pub job_manager: FieldElement,
    pub cdc_pool: FieldElement,
    pub treasury_timelock: FieldElement,
    pub ciro_token: FieldElement,
    pub governance_treasury: FieldElement,
    pub reputation_manager: FieldElement,
    pub simple_events: FieldElement,
}

/// Main blockchain event indexer
#[derive(Clone)]
pub struct EventIndexer {
    client: Arc<StarknetClient>,
    database: Arc<DatabaseManager>,
    config: IndexerConfig,
    contracts: ContractAddresses,
    state: Arc<RwLock<IndexerState>>,
    running: Arc<RwLock<bool>>,
}

impl EventIndexer {
    /// Create a new event indexer
    pub fn new(
        client: Arc<StarknetClient>,
        database: Arc<DatabaseManager>,
        config: IndexerConfig,
        contracts: ContractAddresses,
    ) -> Self {
        let state = IndexerState {
            last_block: config.start_block,
            events_indexed: 0,
            blocks_processed: 0,
            started_at: chrono::Utc::now(),
            last_updated: chrono::Utc::now(),
        };

        Self {
            client,
            database,
            config,
            contracts,
            state: Arc::new(RwLock::new(state)),
            running: Arc::new(RwLock::new(false)),
        }
    }

    /// Start the indexer
    pub async fn start(&self) -> Result<()> {
        let mut running_guard = self.running.write().await;
        if *running_guard {
            return Ok(());
        }
        *running_guard = true;
        drop(running_guard);

        info!("Starting CIRO Network Event Indexer");

        // Start real-time indexing
        self.start_real_time_indexing().await?;

        Ok(())
    }

    /// Stop the indexer
    pub async fn stop(&self) {
        let mut running_guard = self.running.write().await;
        *running_guard = false;
        info!("Stopping CIRO Network Event Indexer");
    }

    /// Start real-time indexing loop
    async fn start_real_time_indexing(&self) -> Result<()> {
        info!("Starting real-time indexing");
        
        let mut ticker = interval(Duration::from_secs(self.config.poll_interval_secs));
        
        while *self.running.read().await {
            ticker.tick().await;
            
            if let Err(e) = self.process_new_blocks().await {
                error!("Failed to process new blocks: {}", e);
            }
        }

        Ok(())
    }

    /// Process new blocks since last update
    async fn process_new_blocks(&self) -> Result<()> {
        let current_block = self.client.get_block_number().await?;
        let state = self.state.read().await;
        let last_processed = state.last_block;
        drop(state);

        if current_block <= last_processed {
            return Ok(());
        }

        debug!("Processing blocks {} to {}", last_processed + 1, current_block);
        
        let mut total_events = 0;
        
        // Process each block individually for now (can batch later)
        for block_num in (last_processed + 1)..=current_block {
            match self.process_single_block(block_num).await {
                Ok(event_count) => {
                    total_events += event_count;
                    debug!("Block {}: {} events", block_num, event_count);
                },
                Err(e) => {
                    error!("Failed to process block {}: {}", block_num, e);
                    // Continue with next block rather than failing completely
                }
            }
        }
        
        // Update state
        let mut state = self.state.write().await;
        state.last_block = current_block;
        state.blocks_processed += current_block - last_processed;
        state.events_indexed += total_events;
        state.last_updated = chrono::Utc::now();

        info!("Processed {} blocks, current block: {}, found {} events", 
              current_block - last_processed, current_block, total_events);

        Ok(())
    }

    /// Process a single block and extract events
    async fn process_single_block(&self, block_number: u64) -> Result<u64> {
        // Get block with transactions
        let block_id = BlockId::Number(block_number);
        let block = self.client.provider().get_block_with_txs(block_id).await
            .context(format!("Failed to get block {}", block_number))?;

        let mut event_count = 0;

        // Handle MaybePendingBlockWithTxs
        match block {
            MaybePendingBlockWithTxs::Block(block) => {
                debug!("📦 Processing block {} with {} transactions", block_number, block.transactions.len());
                for (i, tx) in block.transactions.iter().enumerate() {
                    let tx_events = self.process_transaction_events(tx, block_number, block.timestamp).await?;
                    if tx_events > 0 {
                        info!("🎉 Found {} events in transaction {} of block {}", tx_events, i, block_number);
                    }
                    event_count += tx_events;
                }
            },
            MaybePendingBlockWithTxs::PendingBlock(pending_block) => {
                debug!("📦 Processing pending block {} with {} transactions", block_number, pending_block.transactions.len());
                // For pending blocks, use current timestamp
                let timestamp = chrono::Utc::now().timestamp() as u64;
                for (i, tx) in pending_block.transactions.iter().enumerate() {
                    let tx_events = self.process_transaction_events(tx, block_number, timestamp).await?;
                    if tx_events > 0 {
                        info!("🎉 Found {} events in pending transaction {} of block {}", tx_events, i, block_number);
                    }
                    event_count += tx_events;
                }
            }
        }

        if event_count > 0 {
            info!("🎯 Block {} total: {} events captured!", block_number, event_count);
        }

        Ok(event_count)
    }

    /// Process events from a single transaction
    async fn process_transaction_events(&self, transaction: &Transaction, block_number: u64, block_timestamp: u64) -> Result<u64> {
        let tx_hash = match transaction {
            Transaction::Invoke(tx) => *tx.transaction_hash(),
            Transaction::Declare(tx) => *tx.transaction_hash(),
            Transaction::Deploy(tx) => tx.transaction_hash,
            Transaction::DeployAccount(tx) => tx.transaction_hash,
            Transaction::L1Handler(tx) => tx.transaction_hash,
        };

        debug!("🔍 Processing transaction: 0x{:x}", tx_hash);

        // Get transaction receipt to access events
        let receipt = match self.client.provider().get_transaction_receipt(tx_hash).await {
            Ok(receipt) => receipt,
            Err(e) => {
                debug!("❌ Could not get receipt for tx 0x{:x}: {}", tx_hash, e);
                return Ok(0);
            }
        };

        debug!("✅ Got receipt for tx 0x{:x}", tx_hash);

        let events = match receipt {
            MaybePendingTransactionReceipt::Receipt(receipt) => {
                match receipt {
                    starknet::core::types::TransactionReceipt::Invoke(receipt) => {
                        debug!("📄 Invoke receipt with {} events", receipt.events.len());
                        &receipt.events
                    },
                    starknet::core::types::TransactionReceipt::Declare(receipt) => {
                        debug!("📄 Declare receipt with {} events", receipt.events.len());
                        &receipt.events
                    },
                    starknet::core::types::TransactionReceipt::Deploy(receipt) => {
                        debug!("📄 Deploy receipt with {} events", receipt.events.len());
                        &receipt.events
                    },
                    starknet::core::types::TransactionReceipt::DeployAccount(receipt) => {
                        debug!("📄 DeployAccount receipt with {} events", receipt.events.len());
                        &receipt.events
                    },
                    starknet::core::types::TransactionReceipt::L1Handler(receipt) => {
                        debug!("📄 L1Handler receipt with {} events", receipt.events.len());
                        &receipt.events
                    },
                }
            },
            MaybePendingTransactionReceipt::PendingReceipt(_) => {
                debug!("⏳ Skipping pending transaction 0x{:x}", tx_hash);
                return Ok(0);
            }
        };

        let mut processed_events = 0;

        debug!("🔎 Checking {} events in transaction 0x{:x}", events.len(), tx_hash);

        for (i, event) in events.iter().enumerate() {
            debug!("📋 Event {}: from_address=0x{:x}, keys={}, data={}", 
                   i, event.from_address, event.keys.len(), event.data.len());
            
            if self.is_monitored_contract(&event.from_address) {
                info!("🎯 MONITORED EVENT FOUND! Contract: 0x{:x}", event.from_address);
                match self.process_and_store_event(event, block_number, block_timestamp).await {
                    Ok(()) => {
                        processed_events += 1;
                        info!("✅ Stored event {} from contract 0x{:x}", processed_events, event.from_address);
                    },
                    Err(e) => {
                        error!("❌ Failed to store event: {}", e);
                    }
                }
            } else {
                debug!("⏭️ Skipping event from unmonitored contract 0x{:x}", event.from_address);
            }
        }

        if processed_events > 0 {
            info!("🎊 Transaction 0x{:x} yielded {} monitored events!", tx_hash, processed_events);
        }

        Ok(processed_events)
    }

    /// Check if a contract address is being monitored
    fn is_monitored_contract(&self, address: &FieldElement) -> bool {
        *address == self.contracts.treasury_timelock ||
        *address == self.contracts.reputation_manager ||
        *address == self.contracts.job_manager ||
        *address == self.contracts.cdc_pool ||
        *address == self.contracts.ciro_token ||
        *address == self.contracts.governance_treasury ||
        *address == self.contracts.simple_events
    }

    /// Process and store a single event
    async fn process_and_store_event(&self, event: &Event, block_number: u64, block_timestamp: u64) -> Result<()> {
        let contract_address = format!("0x{:x}", event.from_address);
        
        // Determine event type and contract type
        let (event_type, contract_type) = self.classify_event(event);
        
        // Create event data
        let event_data = serde_json::json!({
            "keys": event.keys.iter().map(|k| format!("0x{:x}", k)).collect::<Vec<_>>(),
            "data": event.data.iter().map(|d| format!("0x{:x}", d)).collect::<Vec<_>>(),
            "contract_type": contract_type,
        });

        let ciro_event = CiroEvent {
            contract_address: contract_address.clone(),
            event_type: event_type.clone(),
            block_number,
            timestamp: block_timestamp,
            data: event_data,
        };

        // Store in database
        self.database.store_event(&ciro_event).await
            .context("Failed to store event in database")?;

        debug!("Stored {} event from {}", event_type, contract_address);
        Ok(())
    }

    /// Classify event based on contract address and event signature
    fn classify_event(&self, event: &Event) -> (String, String) {
        let contract_type = if event.from_address == self.contracts.treasury_timelock {
            "treasury_timelock"
        } else if event.from_address == self.contracts.reputation_manager {
            "reputation_manager"
        } else if event.from_address == self.contracts.job_manager {
            "job_manager"
        } else if event.from_address == self.contracts.cdc_pool {
            "cdc_pool"
        } else if event.from_address == self.contracts.ciro_token {
            "ciro_token"
        } else if event.from_address == self.contracts.governance_treasury {
            "governance_treasury"
        } else if event.from_address == self.contracts.simple_events {
            "simple_events"
        } else {
            "unknown"
        };

        // For SimpleEvents contract, we know the event structure
        let event_type = if contract_type == "simple_events" && !event.keys.is_empty() {
            // SimpleEvents emits TestEvent with a specific key
            "TestEvent"
        } else if contract_type == "ciro_token" {
            // Common ERC20 events
            if !event.keys.is_empty() {
                match format!("0x{:x}", event.keys[0]).as_str() {
                    "0x99cd8bde557814842a3121e8ddfd433a539b8c9f14bf31ebf108d12e6196e9" => "Transfer",
                    "0x134692b230b9e1ffa39098904722134159652b09c5bc41d88d6698779d228ff" => "Approval",
                    _ => "TokenEvent"
                }
            } else {
                "TokenEvent"
            }
        } else {
            "GenericEvent"
        };

        (event_type.to_string(), contract_type.to_string())
    }

    /// Get indexer statistics
    pub async fn get_stats(&self) -> IndexerState {
        self.state.read().await.clone()
    }

    /// Get recent events from database
    pub async fn get_recent_events(&self, limit: usize) -> Result<Vec<CiroEvent>> {
        self.database.get_recent_events(limit as i64).await
    }

    /// Get events for specific contract from database
    pub async fn get_contract_events(
        &self,
        contract_address: &str,
        limit: usize,
    ) -> Result<Vec<CiroEvent>> {
        self.database.get_contract_events(contract_address, limit as i64).await
    }
}