//! # Gossip Protocol Implementation
//!
//! Implements an efficient gossip protocol for network state synchronization,
//! worker discovery, and job distribution in the CIRO Network.

use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::sync::Arc;
use tokio::sync::{mpsc, RwLock};
use tokio::time::{sleep, Duration};
use tracing::{info, debug, warn, error};
use uuid::Uuid;

use crate::types::{WorkerId, JobId, NodeId};
use crate::network::p2p::P2PNetwork;
use crate::network::health_reputation::{HealthReputationSystem, WorkerHealth, NetworkHealth, HealthMetrics};

/// Gossip protocol configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GossipConfig {
    /// Gossip interval in milliseconds
    pub gossip_interval_ms: u64,
    /// Number of peers to gossip to per round
    pub fanout: usize,
    /// Maximum message age in seconds
    pub max_message_age_secs: u64,
    /// Anti-entropy interval in seconds
    pub anti_entropy_interval_secs: u64,
    /// Message deduplication window in seconds
    pub dedup_window_secs: u64,
    /// Maximum message size in bytes
    pub max_message_size_bytes: usize,
    /// Enable message compression
    pub enable_compression: bool,
    /// Gossip message types to handle
    pub enabled_message_types: Vec<GossipMessageType>,
}

impl Default for GossipConfig {
    fn default() -> Self {
        Self {
            gossip_interval_ms: 1000,
            fanout: 3,
            max_message_age_secs: 300,
            anti_entropy_interval_secs: 60,
            dedup_window_secs: 30,
            max_message_size_bytes: 1024 * 1024, // 1MB
            enable_compression: true,
            enabled_message_types: vec![
                GossipMessageType::WorkerState,
                GossipMessageType::JobAnnouncement,
                GossipMessageType::HealthUpdate,
                GossipMessageType::NetworkMetrics,
            ],
        }
    }
}

/// Gossip message types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum GossipMessageType {
    WorkerState,
    JobAnnouncement,
    HealthUpdate,
    NetworkMetrics,
    PeerDiscovery,
    AntiEntropy,
    Custom(String),
}

/// Gossip message structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GossipMessage {
    pub message_id: String,
    pub message_type: GossipMessageType,
    pub sender_id: NodeId,
    pub payload: GossipPayload,
    pub timestamp: u64,
    pub ttl: u32, // Time to live in hops
    pub sequence_number: u64,
    pub signature: Option<String>,
}

/// Gossip message payload
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum GossipPayload {
    /// Worker state update
    WorkerState {
        worker_id: WorkerId,
        capabilities: WorkerCapabilities,
        health: Option<WorkerHealth>,
        current_load: f32,
        last_seen: u64,
    },
    /// Job announcement
    JobAnnouncement {
        job_id: JobId,
        job_type: String,
        requirements: JobRequirements,
        max_reward: u128,
        deadline: u64,
    },
    /// Health update
    HealthUpdate {
        worker_id: WorkerId,
        health_metrics: WorkerHealth,
        network_health: NetworkHealth,
    },
    /// Network metrics
    NetworkMetrics {
        total_workers: usize,
        active_jobs: usize,
        network_load: f32,
        average_latency_ms: u32,
        success_rate: f64,
    },
    /// Peer discovery
    PeerDiscovery {
        peer_id: NodeId,
        address: String,
        capabilities: Vec<String>,
        last_seen: u64,
    },
    /// Anti-entropy sync
    AntiEntropy {
        node_id: NodeId,
        state_hash: String,
        missing_messages: Vec<String>,
    },
    /// Custom payload
    Custom {
        data_type: String,
        data: serde_json::Value,
    },
}

/// Worker capabilities for gossip
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkerCapabilities {
    pub gpu_memory_gb: u32,
    pub cpu_cores: u32,
    pub ram_gb: u32,
    pub supported_job_types: Vec<String>,
    pub ai_frameworks: Vec<String>,
    pub specialized_hardware: Vec<String>,
    pub max_parallel_tasks: u32,
    pub network_bandwidth_mbps: u32,
    pub storage_gb: u32,
    pub supports_fp16: bool,
    pub supports_int8: bool,
    pub cuda_compute_capability: Option<String>,
}

/// Job requirements for gossip
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JobRequirements {
    pub min_gpu_memory_gb: u32,
    pub min_cpu_cores: u32,
    pub min_ram_gb: u32,
    pub required_job_types: Vec<String>,
    pub required_frameworks: Vec<String>,
    pub max_network_latency_ms: u32,
    pub preferred_regions: Vec<String>,
    pub max_worker_load: f32,
    pub min_reputation_score: f64,
}

/// Gossip events
#[derive(Debug, Clone)]
pub enum GossipEvent {
    MessageReceived(GossipMessage),
    MessageSent(GossipMessage),
    PeerDiscovered(NodeId),
    PeerLost(NodeId),
    StateSyncRequest(NodeId),
    StateSyncResponse(NodeId, Vec<GossipMessage>),
    AntiEntropyTriggered,
}

/// Message deduplication entry
#[derive(Debug, Clone)]
pub struct DedupEntry {
    pub message_id: String,
    pub received_at: u64,
    pub source_peers: HashSet<NodeId>,
}

/// Gossip protocol state
#[derive(Debug, Clone)]
pub struct GossipState {
    pub node_id: NodeId,
    pub sequence_number: u64,
    pub known_messages: HashMap<String, GossipMessage>,
    pub peer_states: HashMap<NodeId, PeerState>,
    pub message_dedup: HashMap<String, DedupEntry>,
    pub last_anti_entropy: u64,
}

/// Peer state information
#[derive(Debug, Clone)]
pub struct PeerState {
    pub node_id: NodeId,
    pub address: String,
    pub last_seen: u64,
    pub capabilities: Vec<String>,
    pub sequence_number: u64,
    pub is_active: bool,
}

/// Main gossip protocol implementation
pub struct GossipProtocol {
    config: GossipConfig,
    p2p_network: Arc<P2PNetwork>,
    health_reputation_system: Arc<HealthReputationSystem>,
    
    // State management
    state: Arc<RwLock<GossipState>>,
    
    // Communication channels
    event_sender: mpsc::UnboundedSender<GossipEvent>,
    event_receiver: Arc<RwLock<Option<mpsc::UnboundedReceiver<GossipEvent>>>>,
    
    // Internal state
    running: Arc<RwLock<bool>>,
    last_gossip_round: Arc<RwLock<u64>>,
}

impl GossipProtocol {
    /// Create a new gossip protocol instance
    pub fn new(
        config: GossipConfig,
        p2p_network: Arc<P2PNetwork>,
        health_reputation_system: Arc<HealthReputationSystem>,
        node_id: NodeId,
    ) -> Self {
        let (event_sender, event_receiver) = mpsc::unbounded_channel();
        
        let state = GossipState {
            node_id,
            sequence_number: 0,
            known_messages: HashMap::new(),
            peer_states: HashMap::new(),
            message_dedup: HashMap::new(),
            last_anti_entropy: 0,
        };
        
        Self {
            config,
            p2p_network,
            health_reputation_system,
            state: Arc::new(RwLock::new(state)),
            event_sender,
            event_receiver: Arc::new(RwLock::new(Some(event_receiver))),
            running: Arc::new(RwLock::new(false)),
            last_gossip_round: Arc::new(RwLock::new(0)),
        }
    }

    /// Start the gossip protocol
    pub async fn start(&self) -> Result<()> {
        info!("Starting Gossip Protocol...");
        
        {
            let mut running = self.running.write().await;
            if *running {
                return Err(anyhow::anyhow!("Gossip protocol already running"));
            }
            *running = true;
        }

        // Start background tasks
        let p2p_network = Arc::clone(&self.p2p_network);
        let state = Arc::clone(&self.state);
        let config = self.config.clone();
        let _event_sender = self.event_sender.clone();
        let running = Arc::clone(&self.running);
        let last_gossip_round = Arc::clone(&self.last_gossip_round);
        
        let _gossip_handle = tokio::spawn(async move {
            // TODO: Implement gossip rounds
            loop {
                tokio::time::sleep(tokio::time::Duration::from_millis(config.gossip_interval_ms)).await;
            }
        });
        
        let _anti_entropy_handle = tokio::spawn(async move {
            // TODO: Implement anti-entropy
            loop {
                tokio::time::sleep(tokio::time::Duration::from_secs(config.anti_entropy_interval_secs)).await;
            }
        });
        
        let _message_handling_handle = tokio::spawn(async move {
            // TODO: Implement message handling
            loop {
                tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
            }
        });

        // Wait for any task to complete (they should run indefinitely)
        tokio::select! {
            _ = _gossip_handle => {},
            _ = _anti_entropy_handle => {},
            _ = _message_handling_handle => {},
        }

        Ok(())
    }

    /// Stop the gossip protocol
    pub async fn stop(&self) -> Result<()> {
        info!("Stopping Gossip Protocol...");
        
        {
            let mut running = self.running.write().await;
            *running = false;
        }

        info!("Gossip protocol stopped");
        Ok(())
    }

    /// Start gossip rounds
    async fn start_gossip_rounds(&self) -> Result<()> {
        let config = self.config.clone();
        let p2p_network = Arc::clone(&self.p2p_network);
        let state = Arc::clone(&self.state);
        let _event_sender = self.event_sender.clone();

        tokio::spawn(async move {
            let mut interval = tokio::time::interval(Duration::from_millis(config.gossip_interval_ms));
            
            loop {
                interval.tick().await;
                
                // Select messages to gossip
                let messages = Self::select_messages_to_gossip(&state, &config).await;
                
                // Select peers to gossip to
                let peers = Self::select_peers_to_gossip(&state, config.fanout).await;
                
                // Send messages to selected peers
                for (_peer_id, messages_for_peer) in peers {
                    for _message in messages_for_peer {
                        // TODO: Fix Send trait issue with P2PNetwork in tokio::spawn
                        // if let Err(e) = p2p_network.send_message(libp2p::PeerId::random(), P2PMessage::JobAnnouncement {
                        //     job_id: JobId::new(), // TODO: Get actual job ID
                        //     spec: crate::blockchain::types::JobSpec {
                        //         job_type: crate::blockchain::types::JobType::AIInference,
                        //         model_id: crate::blockchain::types::ModelId::new(starknet::core::types::FieldElement::from_hex_be("0x0").unwrap()),
                        //         input_data_hash: starknet::core::types::FieldElement::from_hex_be("0x0").unwrap(),
                        //         expected_output_format: starknet::core::types::FieldElement::from_hex_be("0x0").unwrap(),
                        //         verification_method: crate::blockchain::types::VerificationMethod::None,
                        //         max_reward: 0,
                        //         sla_deadline: chrono::Utc::now().timestamp() as u64 + 3600,
                        //         compute_requirements: vec![],
                        //         metadata: vec![],
                        //     },
                        //     max_reward: 0,
                        //     deadline: chrono::Utc::now().timestamp() as u64 + 3600,
                        // }, "gossip").await {
                        //     warn!("Failed to send gossip message to peer {}: {}", peer_id, e);
                        // } else {
                        //     if let Err(e) = event_sender.send(GossipEvent::MessageSent(message.clone())) {
                        //         error!("Failed to send message sent event: {}", e);
                        //     }
                        // }
                        debug!("Would send gossip message to peer {} (temporarily disabled due to Send trait)", _peer_id);
                        if let Err(e) = _event_sender.send(GossipEvent::MessageSent(_message.clone())) {
                            error!("Failed to send message sent event: {}", e);
                        }
                    }
                }
            }
        });

        Ok(())
    }

    /// Start anti-entropy process
    async fn start_anti_entropy(&self) -> Result<()> {
        let config = self.config.clone();
        let state = Arc::clone(&self.state);
        let _event_sender = self.event_sender.clone();

        tokio::spawn(async move {
            let mut interval = tokio::time::interval(Duration::from_secs(config.anti_entropy_interval_secs));
            
            loop {
                interval.tick().await;
                
                // Trigger anti-entropy
                if let Err(e) = _event_sender.send(GossipEvent::AntiEntropyTriggered) {
                    error!("Failed to send anti-entropy event: {}", e);
                }
                
                // Clean up old messages
                Self::cleanup_old_messages(&state, config.max_message_age_secs).await;
                
                // Clean up old dedup entries
                Self::cleanup_old_dedup_entries(&state, config.dedup_window_secs).await;
            }
        });

        Ok(())
    }

    /// Start message handling
    async fn start_message_handling(&self) -> Result<()> {
        let p2p_network = Arc::clone(&self.p2p_network);
        let state = Arc::clone(&self.state);
        let _event_sender = self.event_sender.clone();

        tokio::spawn(async move {
            loop {
                // TODO: Implement actual P2P message handling
                // This would receive messages from the P2P network and process them
                
                sleep(Duration::from_millis(100)).await;
            }
        });

        Ok(())
    }

    /// Handle incoming gossip message
    pub async fn handle_gossip_message(&self, message: GossipMessage) -> Result<()> {
        // Check message age
        let now = chrono::Utc::now().timestamp() as u64;
        if now - message.timestamp > self.config.max_message_age_secs as u64 {
            debug!("Dropping old gossip message: {}", message.message_id);
            return Ok(());
        }

        // Check message size
        let message_size = serde_json::to_string(&message)?.len();
        if message_size > self.config.max_message_size_bytes {
            warn!("Dropping oversized gossip message: {} bytes", message_size);
            return Ok(());
        }

        // Check deduplication
        if !self.check_message_dedup(&message).await? {
            debug!("Dropping duplicate gossip message: {}", message.message_id);
            return Ok(());
        }

        // Store message
        self.store_message(message.clone()).await?;

        // Process message based on type
        self.process_message(&message).await?;

        // Forward message to other peers if needed
        if self.should_forward_message(&message) {
            self.forward_message(message.clone()).await?;
        }

        // Send event to coordinator
        if let Err(e) = self.event_sender.send(GossipEvent::MessageReceived(message)) {
            error!("Failed to send message received event: {}", e);
        }

        Ok(())
    }

    /// Check message deduplication
    async fn check_message_dedup(&self, message: &GossipMessage) -> Result<bool> {
        let mut state = self.state.write().await;
        let now = chrono::Utc::now().timestamp() as u64;
        
        if let Some(entry) = state.message_dedup.get_mut(&message.message_id) {
            // Message already seen
            if entry.source_peers.contains(&message.sender_id) {
                return Ok(false); // Duplicate
            }
            
            // Add new source peer
            entry.source_peers.insert(message.sender_id);
            entry.received_at = now;
        } else {
            // New message
            let entry = DedupEntry {
                message_id: message.message_id.clone(),
                received_at: now,
                source_peers: HashSet::from([message.sender_id]),
            };
            state.message_dedup.insert(message.message_id.clone(), entry);
        }
        
        Ok(true) // Not duplicate
    }

    /// Store message in local state
    async fn store_message(&self, message: GossipMessage) -> Result<()> {
        let mut state = self.state.write().await;
        state.known_messages.insert(message.message_id.clone(), message);
        Ok(())
    }

    /// Process message based on type
    async fn process_message(&self, message: &GossipMessage) -> Result<()> {
        match &message.payload {
            GossipPayload::WorkerState { worker_id, capabilities, health, current_load, last_seen } => {
                self.handle_worker_state(*worker_id, capabilities.clone(), health.clone(), *current_load, *last_seen).await?;
            }
            GossipPayload::JobAnnouncement { job_id, job_type, requirements, max_reward, deadline } => {
                self.handle_job_announcement(*job_id, job_type.clone(), requirements.clone(), *max_reward, *deadline).await?;
            }
            GossipPayload::HealthUpdate { worker_id, health_metrics, network_health } => {
                self.handle_health_update(*worker_id, health_metrics.clone(), network_health.clone()).await?;
            }
            GossipPayload::NetworkMetrics { total_workers, active_jobs, network_load, average_latency_ms, success_rate } => {
                self.handle_network_metrics(*total_workers, *active_jobs, *network_load, *average_latency_ms, *success_rate).await?;
            }
            GossipPayload::PeerDiscovery { peer_id, address, capabilities, last_seen } => {
                self.handle_peer_discovery(*peer_id, address.clone(), capabilities.clone(), *last_seen).await?;
            }
            GossipPayload::AntiEntropy { node_id, state_hash, missing_messages } => {
                self.handle_anti_entropy(*node_id, state_hash.clone(), missing_messages.clone()).await?;
            }
            GossipPayload::Custom { data_type, data } => {
                self.handle_custom_message(data_type.clone(), data.clone()).await?;
            }
        }
        Ok(())
    }

    /// Forward message to other peers
    async fn forward_message(&self, message: GossipMessage) -> Result<()> {
        // Clone the message for forwarding
        let _message_clone = message.clone();
        
        // Get connected peers
        let peers = self.p2p_network.get_connected_peers().await;
        
        // Forward to a subset of peers
        for (_i, _peer_id) in peers.into_iter().enumerate() {
            // Convert GossipMessage to P2PMessage using JobAnnouncement
            // TODO: Fix Arc mutability issue
            // let p2p_message = P2PMessage::JobAnnouncement {
            //     job_id: JobId::new(), // TODO: Get actual job ID
            //     spec: crate::blockchain::types::JobSpec {
            //         job_type: crate::blockchain::types::JobType::AIInference,
            //         model_id: crate::blockchain::types::ModelId::new(starknet::core::types::FieldElement::from_hex_be("0x0").unwrap()),
            //         input_data_hash: starknet::core::types::FieldElement::from_hex_be("0x0").unwrap(),
            //         expected_output_format: starknet::core::types::FieldElement::from_hex_be("0x0").unwrap(),
            //         verification_method: crate::blockchain::types::VerificationMethod::None,
            //         max_reward: 0,
            //         sla_deadline: chrono::Utc::now().timestamp() as u64 + 3600,
            //         compute_requirements: vec![],
            //         metadata: vec![],
            //     },
            //     max_reward: 0,
            //     deadline: chrono::Utc::now().timestamp() as u64 + 3600,
            // };
            
            // if let Err(e) = self.p2p_network.send_message(peer_id, p2p_message, "gossip").await {
            //     warn!("Failed to forward message to peer {}: {}", peer_id, e);
            // } else {
            //     if let Err(e) = event_sender.send(GossipEvent::MessageSent(message_clone.clone())) {
            //         error!("Failed to send message sent event: {}", e);
            //     }
            // }
        }
        
        Ok(())
    }

    /// Handle worker state update
    async fn handle_worker_state(&self, worker_id: WorkerId, capabilities: WorkerCapabilities, _health: Option<WorkerHealth>, current_load: f32, last_seen: u64) -> Result<()> {
        debug!("Received worker state update for worker {}", worker_id);
        
        // Update health reputation system
        if let Some(health_metrics) = _health {
            self.handle_worker_health_update(worker_id, health_metrics).await?;
        }
        
        // TODO: Update local worker state tracking
        Ok(())
    }

    /// Handle job announcement
    async fn handle_job_announcement(&self, job_id: JobId, _job_type: String, _requirements: JobRequirements, _max_reward: u128, _deadline: u64) -> Result<()> {
        debug!("Received job announcement for job {}", job_id);
        
        // TODO: Process job announcement
        // This would integrate with the job distribution system
        Ok(())
    }

    /// Handle health update
    async fn handle_health_update(&self, worker_id: WorkerId, health_metrics: WorkerHealth, _network_health: NetworkHealth) -> Result<()> {
        debug!("Received health update for worker {}", worker_id);
        
        // Update health reputation system
        self.handle_worker_health_report(worker_id, health_metrics).await?;
        
        // TODO: Update network health tracking
        Ok(())
    }

    /// Handle network metrics
    async fn handle_network_metrics(&self, total_workers: usize, active_jobs: usize, network_load: f32, _average_latency_ms: u32, _success_rate: f64) -> Result<()> {
        debug!("Received network metrics: {} workers, {} jobs, {:.2} load", total_workers, active_jobs, network_load);
        
        // TODO: Update network metrics tracking
        Ok(())
    }

    /// Handle peer discovery
    async fn handle_peer_discovery(&self, peer_id: NodeId, _address: String, _capabilities: Vec<String>, last_seen: u64) -> Result<()> {
        debug!("Received peer discovery for peer {}", peer_id);
        
        // Update peer state
        let mut state = self.state.write().await;
        let peer_state = PeerState {
            node_id: peer_id,
            address: "".to_string(), // Capabilities are not directly stored in PeerState for simplicity
            last_seen,
            capabilities: vec![], // Capabilities are not directly stored in PeerState for simplicity
            sequence_number: 0, // TODO: Get actual sequence number
            is_active: true,
        };
        state.peer_states.insert(peer_id, peer_state);
        
        // Send peer discovered event
        if let Err(e) = self.event_sender.send(GossipEvent::PeerDiscovered(peer_id)) {
            error!("Failed to send peer discovered event: {}", e);
        }
        
        Ok(())
    }

    /// Handle anti-entropy
    async fn handle_anti_entropy(&self, node_id: NodeId, _state_hash: String, _missing_messages: Vec<String>) -> Result<()> {
        debug!("Received anti-entropy from node {}", node_id);
        
        // TODO: Implement state synchronization
        // This would compare state hashes and exchange missing messages
        
        Ok(())
    }

    /// Handle custom message
    async fn handle_custom_message(&self, data_type: String, data: serde_json::Value) -> Result<()> {
        // Handle custom message types
        match data_type.as_str() {
            "worker_health" => {
                // Handle worker health updates
                info!("Received worker health update: {:?}", data);
            },
            "network_stats" => {
                // Handle network statistics
                info!("Received network stats: {:?}", data);
            },
            "job_progress" => {
                // Handle job progress updates
                info!("Received job progress: {:?}", data);
            },
            _ => {
                warn!("Unknown custom message type: {}", data_type);
            }
        }
        Ok(())
    }

    /// Select messages to gossip
    async fn select_messages_to_gossip(state: &Arc<RwLock<GossipState>>, config: &GossipConfig) -> Vec<GossipMessage> {
        let state = state.read().await;
        let now = chrono::Utc::now().timestamp() as u64;
        
        state.known_messages.values()
            .filter(|msg| {
                // Check if message type is enabled
                config.enabled_message_types.contains(&msg.message_type) &&
                // Check if message is not too old
                now - msg.timestamp < config.max_message_age_secs as u64 &&
                // Check if message has remaining TTL
                msg.ttl > 0
            })
            .cloned()
            .collect()
    }

    /// Select peers to gossip to
    async fn select_peers_to_gossip(state: &Arc<RwLock<GossipState>>, fanout: usize) -> HashMap<NodeId, Vec<GossipMessage>> {
        let state = state.read().await;
        
        // Select random peers
        let peers: Vec<NodeId> = state.peer_states.keys()
            .filter(|&&peer_id| peer_id != state.node_id)
            .take(fanout)
            .cloned()
            .collect();
        
        // Distribute messages among peers
        let mut result = HashMap::new();
        for (_i, peer_id) in peers.into_iter().enumerate() {
            // TODO: Implement proper message distribution strategy
            result.insert(peer_id, vec![]);
        }
        
        result
    }

    /// Clean up old messages
    async fn cleanup_old_messages(state: &Arc<RwLock<GossipState>>, max_age_secs: u64) {
        let mut state = state.write().await;
        let now = chrono::Utc::now().timestamp() as u64;
        
        state.known_messages.retain(|_, msg| {
            now - msg.timestamp < max_age_secs as u64
        });
    }

    /// Clean up old dedup entries
    async fn cleanup_old_dedup_entries(state: &Arc<RwLock<GossipState>>, dedup_window_secs: u64) {
        let mut state = state.write().await;
        let now = chrono::Utc::now().timestamp() as u64;
        
        state.message_dedup.retain(|_, entry| {
            now - entry.received_at < dedup_window_secs as u64
        });
    }

    /// Broadcast a message to the network
    pub async fn broadcast_message(&self, message_type: GossipMessageType, payload: GossipPayload) -> Result<()> {
        let mut state = self.state.write().await;
        state.sequence_number += 1;
        
        let message = GossipMessage {
            message_id: Uuid::new_v4().to_string(),
            message_type,
            sender_id: state.node_id,
            payload,
            timestamp: chrono::Utc::now().timestamp() as u64,
            ttl: 5, // Default TTL
            sequence_number: state.sequence_number,
            signature: None, // TODO: Add signature
        };
        
        // Store message locally
        state.known_messages.insert(message.message_id.clone(), message.clone());
        
        // TODO: Fix Arc mutability issue - broadcast via P2P network
        // let p2p_message = P2PMessage::JobAnnouncement {
        //     job_id: JobId::new(), // TODO: Get actual job ID
        //     spec: crate::blockchain::types::JobSpec {
        //         job_type: crate::blockchain::types::JobType::AIInference,
        //         model_id: crate::blockchain::types::ModelId::new(starknet::core::types::FieldElement::from_hex_be("0x0").unwrap()),
        //         input_data_hash: starknet::core::types::FieldElement::from_hex_be("0x0").unwrap(),
        //         expected_output_format: starknet::core::types::FieldElement::from_hex_be("0x0").unwrap(),
        //         verification_method: crate::blockchain::types::VerificationMethod::None,
        //         max_reward: 0,
        //         sla_deadline: chrono::Utc::now().timestamp() as u64 + 3600,
        //         compute_requirements: vec![],
        //         metadata: vec![],
        //     },
        //     max_reward: 0,
        //     deadline: chrono::Utc::now().timestamp() as u64 + 3600,
        // };
        // if let Err(e) = self.p2p_network.broadcast_message(p2p_message, "gossip").await {
        //     error!("Failed to broadcast gossip message: {}", e);
        // }
        
        Ok(())
    }

    /// Get current gossip state
    pub async fn get_gossip_state(&self) -> GossipState {
        self.state.read().await.clone()
    }

    /// Get active peers count
    pub async fn get_active_peers_count(&self) -> usize {
        let state = self.state.read().await;
        state.peer_states.values().filter(|p| p.is_active).count()
    }

    /// Get known messages count
    pub async fn get_known_messages_count(&self) -> usize {
        let state = self.state.read().await;
        state.known_messages.len()
    }

    async fn handle_worker_health_update(&self, worker_id: WorkerId, health_metrics: WorkerHealth) -> Result<()> {
        // Convert WorkerHealth to HealthMetrics
        let health_metrics_converted = HealthMetrics {
            response_time_ms: health_metrics.response_time_ms,
            cpu_usage_percent: health_metrics.cpu_usage_percent,
            memory_usage_percent: health_metrics.memory_usage_percent,
            disk_usage_percent: health_metrics.disk_usage_percent,
            network_latency_ms: health_metrics.network_latency_ms,
            uptime_seconds: health_metrics.uptime_seconds,
            load_average: health_metrics.load_average,
            temperature_celsius: health_metrics.temperature_celsius,
            gpu_utilization_percent: health_metrics.gpu_utilization_percent,
            gpu_memory_usage_percent: health_metrics.gpu_memory_usage_percent,
            network_bandwidth_mbps: health_metrics.network_bandwidth_mbps,
        };
        
        self.health_reputation_system.update_worker_health(worker_id, health_metrics_converted).await?;
        Ok(())
    }

    async fn handle_job_distribution(&self, _job_id: JobId, _job_type: String, _requirements: JobRequirements, _max_reward: u128, _deadline: u64) -> Result<()> {
        // TODO: Implement job distribution logic
        Ok(())
    }

    async fn handle_worker_health_report(&self, worker_id: WorkerId, health_metrics: WorkerHealth) -> Result<()> {
        // Convert WorkerHealth to HealthMetrics
        let health_metrics_converted = HealthMetrics {
            response_time_ms: health_metrics.response_time_ms,
            cpu_usage_percent: health_metrics.cpu_usage_percent,
            memory_usage_percent: health_metrics.memory_usage_percent,
            disk_usage_percent: health_metrics.disk_usage_percent,
            network_latency_ms: health_metrics.network_latency_ms,
            uptime_seconds: health_metrics.uptime_seconds,
            load_average: health_metrics.load_average,
            temperature_celsius: health_metrics.temperature_celsius,
            gpu_utilization_percent: health_metrics.gpu_utilization_percent,
            gpu_memory_usage_percent: health_metrics.gpu_memory_usage_percent,
            network_bandwidth_mbps: health_metrics.network_bandwidth_mbps,
        };
        
        self.health_reputation_system.update_worker_health(worker_id, health_metrics_converted).await?;
        Ok(())
    }

    async fn handle_network_stats_update(&self, _node_id: NodeId, _active_jobs: usize, _network_load: f32, _average_latency_ms: u32, _success_rate: f64) -> Result<()> {
        // TODO: Implement network stats update logic
        Ok(())
    }

    async fn handle_state_sync_request(&self, _node_id: NodeId, _state_hash: String, _missing_messages: Vec<String>) -> Result<()> {
        // TODO: Implement state sync request handling
        Ok(())
    }

    async fn broadcast_job_announcement(&self, job_id: JobId, job_type: String, requirements: JobRequirements, max_reward: u128, deadline: u64) -> Result<()> {
        // Create a job announcement message
        let message = GossipMessage {
            message_id: uuid::Uuid::new_v4().to_string(),
            message_type: GossipMessageType::JobAnnouncement,
            sender_id: self.state.read().await.node_id,
            payload: GossipPayload::JobAnnouncement {
                job_id,
                job_type,
                requirements,
                max_reward,
                deadline,
            },
            timestamp: chrono::Utc::now().timestamp() as u64,
            ttl: 5, // Default TTL
            sequence_number: 0, // TODO: Get actual sequence number
            signature: None, // TODO: Add signature
        };
        
        // Convert to P2PMessage and broadcast
        // Since P2PMessage doesn't have a Custom variant, we'll use JobAnnouncement
        // TODO: Fix Arc mutability issue
        // let p2p_message = P2PMessage::JobAnnouncement {
        //     job_id,
        //     spec: crate::blockchain::types::JobSpec {
        //         job_type: crate::blockchain::types::JobType::AIInference, // TODO: Convert job_type string to enum
        //         model_id: crate::blockchain::types::ModelId::new(starknet::core::types::FieldElement::from_hex_be("0x0").unwrap()),
        //         input_data_hash: starknet::core::types::FieldElement::from_hex_be("0x0").unwrap(),
        //         expected_output_format: starknet::core::types::FieldElement::from_hex_be("0x0").unwrap(),
        //         verification_method: crate::blockchain::types::VerificationMethod::None,
        //         max_reward,
        //         sla_deadline: deadline,
        //         compute_requirements: vec![],
        //         metadata: vec![],
        //     },
        //     max_reward,
        //     deadline,
        // };
        // if let Err(e) = self.p2p_network.broadcast_message(p2p_message, "gossip").await {
        //     warn!("Failed to broadcast job announcement: {}", e);
        // }
        
        Ok(())
    }

    /// Check if message should be forwarded
    fn should_forward_message(&self, message: &GossipMessage) -> bool {
        message.ttl > 0
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_gossip_config_default() {
        let config = GossipConfig::default();
        assert_eq!(config.gossip_interval_ms, 1000);
        assert_eq!(config.fanout, 3);
        assert_eq!(config.max_message_age_secs, 300);
        assert_eq!(config.anti_entropy_interval_secs, 60);
        assert!(config.enable_compression);
    }

    #[tokio::test]
    async fn test_gossip_message_creation() {
        let message = GossipMessage {
            message_id: "test-123".to_string(),
            message_type: GossipMessageType::WorkerState,
            sender_id: NodeId::new(),
            payload: GossipPayload::WorkerState {
                worker_id: WorkerId::new(),
                capabilities: WorkerCapabilities {
                    gpu_memory_gb: 8,
                    cpu_cores: 4,
                    ram_gb: 16,
                    supported_job_types: vec!["ai".to_string()],
                    ai_frameworks: vec!["pytorch".to_string()],
                    specialized_hardware: vec![],
                    max_parallel_tasks: 2,
                    network_bandwidth_mbps: 100,
                    storage_gb: 100,
                    supports_fp16: true,
                    supports_int8: false,
                    cuda_compute_capability: Some("8.6".to_string()),
                },
                health: None,
                current_load: 0.3,
                last_seen: chrono::Utc::now().timestamp() as u64,
            },
            timestamp: chrono::Utc::now().timestamp() as u64,
            ttl: 5,
            sequence_number: 1,
            signature: None,
        };

        assert_eq!(message.message_type, GossipMessageType::WorkerState);
        assert_eq!(message.ttl, 5);
        assert_eq!(message.sequence_number, 1);
    }
}
