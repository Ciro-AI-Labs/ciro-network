//! # P2P Network Implementation
//!
//! This module implements the peer-to-peer networking layer using libp2p.

use anyhow::{Result, anyhow, Context};
use async_trait::async_trait;
use futures::prelude::*;
use libp2p::{
    gossipsub, identify, kad, mdns, noise, ping, tcp, yamux,
    core::upgrade::Version,
    identity::Keypair,
    swarm::{NetworkBehaviour, SwarmEvent, Swarm},
    Multiaddr, PeerId, Transport,
};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::time::Duration;
use tokio::sync::{mpsc, RwLock};
use tracing::{debug, error, info, warn};

use crate::types::{JobId, WorkerId, NetworkAddress};
use crate::blockchain::types::WorkerCapabilities;

/// P2P network configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct P2PConfig {
    /// Local peer identity keypair
    pub keypair: Option<Vec<u8>>,
    /// Listen addresses for the network
    pub listen_addresses: Vec<Multiaddr>,
    /// Bootstrap peers for initial discovery
    pub bootstrap_peers: Vec<(PeerId, Multiaddr)>,
    /// Maximum number of peers to connect to
    pub max_peers: usize,
    /// Connection timeout
    pub connection_timeout: Duration,
    /// Gossip configuration
    pub gossip_config: GossipConfig,
    /// Kademlia DHT configuration
    pub kad_config: KademliaConfig,
    /// Enable mDNS local discovery
    pub enable_mdns: bool,
}

/// Gossip protocol configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GossipConfig {
    /// Topics to subscribe to
    pub topics: Vec<String>,
    /// Message ID function
    pub message_id_fn: String,
    /// Duplicate cache time in seconds
    pub duplicate_cache_time: u64,
    /// Heartbeat interval
    pub heartbeat_interval: Duration,
}

/// Kademlia DHT configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KademliaConfig {
    /// Replication factor
    pub replication_factor: usize,
    /// Query timeout
    pub query_timeout: Duration,
    /// Enable automatic mode
    pub automatic_mode: bool,
}

/// Messages that can be sent over the P2P network
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum P2PMessage {
    /// Job announcement to the network
    JobAnnouncement {
        job_id: JobId,
        spec: crate::blockchain::types::JobSpec,
        max_reward: u128,
        deadline: u64,
    },
    /// Worker capability announcement
    WorkerCapabilities {
        worker_id: WorkerId,
        capabilities: crate::blockchain::types::WorkerCapabilities,
        network_address: NetworkAddress,
        stake_amount: u64,
    },
    /// Job result submission
    JobResult {
        job_id: JobId,
        worker_id: WorkerId,
        success: bool,
        data: Vec<u8>,
    },
    /// Worker bid for a job
    WorkerBid {
        job_id: JobId,
        worker_id: WorkerId,
        bid_amount: u128,
        estimated_completion_time: u64,
        reputation_score: f64,
    },
    /// Job assignment notification
    JobAssignment {
        job_id: JobId,
        worker_id: WorkerId,
        assignment_id: String,
        reward_amount: u128,
    },
    /// Reputation update
    ReputationUpdate {
        worker_id: WorkerId,
        reputation_score: f64,
        performance_metrics: HashMap<String, f64>,
    },
    /// Peer discovery request
    PeerDiscovery {
        capability_query: Option<String>,
        max_peers: usize,
    },
    /// Heartbeat/ping message
    Heartbeat {
        worker_id: WorkerId,
        timestamp: chrono::DateTime<chrono::Utc>,
        load: f32,
    },
}

/// Network events that can be emitted
#[derive(Debug, Clone)]
pub enum NetworkEvent {
    /// New peer connected
    PeerConnected(PeerId),
    /// Peer disconnected
    PeerDisconnected(PeerId),
    /// Message received from peer
    MessageReceived {
        peer_id: PeerId,
        message: P2PMessage,
    },
    /// Peer discovered through DHT
    PeerDiscovered {
        peer_id: PeerId,
        addresses: Vec<Multiaddr>,
    },
    /// Network error occurred
    NetworkError(String),
}



/// Custom network behavior combining multiple protocols
#[derive(NetworkBehaviour)]
pub struct CiroBehaviour {
    /// Gossip protocol for message broadcasting
    pub gossipsub: gossipsub::Behaviour,
    /// Kademlia DHT for peer discovery
    pub kademlia: kad::Behaviour<kad::store::MemoryStore>,
    /// Identify protocol for peer identification
    pub identify: identify::Behaviour,
    /// Ping protocol for connection health
    pub ping: ping::Behaviour,
    /// mDNS for local peer discovery
    pub mdns: mdns::tokio::Behaviour,
}

/// P2P network implementation
pub struct P2PNetwork {
    /// The libp2p swarm
    swarm: Swarm<CiroBehaviour>,
    /// Local peer ID
    local_peer_id: PeerId,
    /// Network configuration
    config: P2PConfig,
    /// Connected peers
    connected_peers: RwLock<HashSet<PeerId>>,
    /// Peer addresses
    peer_addresses: RwLock<HashMap<PeerId, Vec<Multiaddr>>>,
    /// Worker capabilities by peer ID
    worker_capabilities: RwLock<HashMap<PeerId, WorkerCapabilities>>,
    /// Event sender
    event_sender: mpsc::UnboundedSender<NetworkEvent>,
    /// Gossip topics
    gossip_topics: Vec<gossipsub::IdentTopic>,
}

impl P2PNetwork {
    /// Create a new P2P network
    pub fn new(config: P2PConfig) -> Result<(Self, mpsc::UnboundedReceiver<NetworkEvent>)> {
        // Generate or load keypair
        let keypair = if let Some(keypair_bytes) = &config.keypair {
            Keypair::from_protobuf_encoding(keypair_bytes)
                .context("Failed to decode keypair")?
        } else {
            Keypair::generate_ed25519()
        };

        let local_peer_id = PeerId::from(keypair.public());
        info!("Local peer ID: {}", local_peer_id);

        // Create transport
        let transport = tcp::tokio::Transport::new(tcp::Config::default().nodelay(true))
            .upgrade(Version::V1)
            .authenticate(noise::Config::new(&keypair).context("Failed to create noise config")?)
            .multiplex(yamux::Config::default())
            .timeout(config.connection_timeout)
            .boxed();

        // Create network behavior
        let behaviour = Self::create_behaviour(&keypair, &config)?;

        // Create swarm
        let swarm = Swarm::new(transport, behaviour, local_peer_id, libp2p::swarm::Config::with_tokio_executor());

        // Create event channel
        let (event_sender, event_receiver) = mpsc::unbounded_channel();

        // Create gossip topics
        let gossip_topics = config.gossip_config.topics
            .iter()
            .map(|topic| gossipsub::IdentTopic::new(topic))
            .collect();

        let network = Self {
            swarm,
            local_peer_id,
            config,
            connected_peers: RwLock::new(HashSet::new()),
            peer_addresses: RwLock::new(HashMap::new()),
            worker_capabilities: RwLock::new(HashMap::new()),
            event_sender,
            gossip_topics,
        };

        Ok((network, event_receiver))
    }

    /// Create the network behavior
    fn create_behaviour(keypair: &Keypair, config: &P2PConfig) -> Result<CiroBehaviour> {
        // Create gossipsub behavior
        let gossipsub_config = gossipsub::ConfigBuilder::default()
            .heartbeat_interval(config.gossip_config.heartbeat_interval)
            .validation_mode(gossipsub::ValidationMode::Strict)
            .build()
            .context("Failed to create gossipsub config")?;

        let gossipsub = gossipsub::Behaviour::new(
            gossipsub::MessageAuthenticity::Signed(keypair.clone()),
            gossipsub_config,
        ).map_err(|e| anyhow!("Failed to create gossipsub behavior: {}", e))?;

        // Create Kademlia behavior
        let store = kad::store::MemoryStore::new(keypair.public().to_peer_id());
        let kademlia = kad::Behaviour::new(keypair.public().to_peer_id(), store);

        // Create identify behavior
        let identify = identify::Behaviour::new(
            identify::Config::new("/ciro/1.0.0".to_string(), keypair.public())
                .with_agent_version("ciro-node/0.1.0".to_string()),
        );

        // Create ping behavior
        let ping = ping::Behaviour::new(ping::Config::new().with_interval(Duration::from_secs(30)));

        // Create mDNS behavior
        let mdns = mdns::tokio::Behaviour::new(
            mdns::Config::default(),
            keypair.public().to_peer_id(),
        ).context("Failed to create mDNS behavior")?;

        Ok(CiroBehaviour {
            gossipsub,
            kademlia,
            identify,
            ping,
            mdns,
        })
    }

    /// Start the P2P network
    pub async fn start(&mut self) -> Result<()> {
        info!("Starting P2P network...");

        // Start listening on configured addresses
        for addr in &self.config.listen_addresses {
            self.swarm.listen_on(addr.clone())
                .context("Failed to listen on address")?;
            info!("Listening on: {}", addr);
        }

        // Subscribe to gossip topics
        for topic in &self.gossip_topics {
            self.swarm.behaviour_mut().gossipsub.subscribe(topic)
                .context("Failed to subscribe to gossip topic")?;
            info!("Subscribed to gossip topic: {}", topic);
        }

        // Add bootstrap peers to Kademlia
        for (peer_id, addr) in &self.config.bootstrap_peers {
            self.swarm.behaviour_mut().kademlia.add_address(peer_id, addr.clone());
            info!("Added bootstrap peer: {} at {}", peer_id, addr);
        }

        // Start Kademlia bootstrap
        if !self.config.bootstrap_peers.is_empty() {
            self.swarm.behaviour_mut().kademlia.bootstrap()
                .context("Failed to start Kademlia bootstrap")?;
            info!("Started Kademlia bootstrap");
        }

        info!("P2P network started successfully");
        Ok(())
    }

    /// Stop the P2P network
    pub async fn stop(&mut self) -> Result<()> {
        info!("Stopping P2P network...");
        
        // Disconnect from all peers
        let connected_peers: Vec<PeerId> = self.connected_peers.read().await.iter().cloned().collect();
        for peer_id in connected_peers {
            self.swarm.disconnect_peer_id(peer_id).ok();
        }

        info!("P2P network stopped");
        Ok(())
    }

    /// Process network events
    pub async fn handle_events(&mut self) -> Result<()> {
        loop {
            match self.swarm.select_next_some().await {
                SwarmEvent::NewListenAddr { address, .. } => {
                    info!("Local node is listening on {}", address);
                }
                SwarmEvent::Behaviour(event) => {
                    self.handle_behaviour_event(event).await?;
                }
                SwarmEvent::ConnectionEstablished { peer_id, .. } => {
                    info!("Connected to peer: {}", peer_id);
                    self.connected_peers.write().await.insert(peer_id);
                    self.send_event(NetworkEvent::PeerConnected(peer_id));
                }
                SwarmEvent::ConnectionClosed { peer_id, .. } => {
                    info!("Disconnected from peer: {}", peer_id);
                    self.connected_peers.write().await.remove(&peer_id);
                    self.send_event(NetworkEvent::PeerDisconnected(peer_id));
                }
                SwarmEvent::IncomingConnectionError { error, .. } => {
                    warn!("Incoming connection error: {}", error);
                }
                SwarmEvent::OutgoingConnectionError { error, .. } => {
                    warn!("Outgoing connection error: {}", error);
                }
                _ => {}
            }
        }
    }

    /// Handle behavior-specific events
    async fn handle_behaviour_event(&mut self, event: <CiroBehaviour as NetworkBehaviour>::ToSwarm) -> Result<()> {
        match event {
            // Gossipsub events
            CiroBehaviourEvent::Gossipsub(gossipsub::Event::Message { message, .. }) => {
                self.handle_gossip_message(message).await?;
            }
            CiroBehaviourEvent::Gossipsub(gossipsub::Event::Subscribed { peer_id, topic }) => {
                debug!("Peer {} subscribed to topic {}", peer_id, topic);
            }
            CiroBehaviourEvent::Gossipsub(gossipsub::Event::Unsubscribed { peer_id, topic }) => {
                debug!("Peer {} unsubscribed from topic {}", peer_id, topic);
            }

            // Kademlia events
            CiroBehaviourEvent::Kademlia(kad::Event::OutboundQueryProgressed { result, .. }) => {
                self.handle_kademlia_query_result(result).await?;
            }
            CiroBehaviourEvent::Kademlia(kad::Event::RoutingUpdated { peer, .. }) => {
                debug!("Routing table updated with peer: {}", peer);
            }

            // Identify events
            CiroBehaviourEvent::Identify(identify::Event::Received { peer_id, info }) => {
                debug!("Received identify info from {}: {:?}", peer_id, info);
                // Store peer addresses
                self.peer_addresses.write().await.insert(peer_id, info.listen_addrs);
            }

            // Ping events
            CiroBehaviourEvent::Ping(ping::Event { peer, result, connection: _ }) => {
                match result {
                    Ok(rtt) => {
                        debug!("Ping to {} successful: {:?}", peer, rtt);
                    }
                    Err(failure) => {
                        warn!("Ping to {} failed: {:?}", peer, failure);
                    }
                }
            }

            // mDNS events
            CiroBehaviourEvent::Mdns(mdns::Event::Discovered(list)) => {
                for (peer_id, addr) in list {
                    info!("Discovered peer {} at {}", peer_id, addr);
                    self.swarm.behaviour_mut().kademlia.add_address(&peer_id, addr.clone());
                    self.send_event(NetworkEvent::PeerDiscovered {
                        peer_id,
                        addresses: vec![addr],
                    });
                }
            }
            CiroBehaviourEvent::Mdns(mdns::Event::Expired(list)) => {
                for (peer_id, addr) in list {
                    debug!("mDNS record expired for peer {} at {}", peer_id, addr);
                }
            }

            _ => {}
        }
        Ok(())
    }

    /// Handle gossip messages
    async fn handle_gossip_message(&mut self, message: gossipsub::Message) -> Result<()> {
        if let Ok(p2p_message) = bincode::deserialize::<P2PMessage>(&message.data) {
            debug!("Received gossip message: {:?}", p2p_message);
            self.send_event(NetworkEvent::MessageReceived {
                peer_id: message.source.unwrap_or(PeerId::random()),
                message: p2p_message,
            });
        }
        Ok(())
    }

    /// Handle Kademlia query results
    async fn handle_kademlia_query_result(&mut self, result: kad::QueryResult) -> Result<()> {
        match result {
            kad::QueryResult::GetClosestPeers(Ok(kad::GetClosestPeersOk { peers, .. })) => {
                debug!("Found {} closest peers", peers.len());
                for peer in peers {
                    if let Some(addrs) = self.peer_addresses.read().await.get(&peer) {
                        self.send_event(NetworkEvent::PeerDiscovered {
                            peer_id: peer,
                            addresses: addrs.clone(),
                        });
                    }
                }
            }
            kad::QueryResult::GetClosestPeers(Err(kad::GetClosestPeersError::Timeout { .. })) => {
                warn!("Kademlia query timed out");
            }
            _ => {}
        }
        Ok(())
    }



    /// Find peers with specific capability
    async fn find_peers_with_capability(&self, capability: Option<&str>, max_peers: usize) -> Vec<PeerId> {
        let capabilities = self.worker_capabilities.read().await;
        let mut matching_peers = Vec::new();

        for (peer_id, worker_caps) in capabilities.iter() {
            if let Some(_required_capability) = capability {
                // TODO: Add job type matching based on worker capabilities
                if worker_caps.capability_flags > 0 {
                    matching_peers.push(*peer_id);
                }
            } else {
                matching_peers.push(*peer_id);
            }

            if matching_peers.len() >= max_peers {
                break;
            }
        }

        matching_peers
    }

    /// Send event to event channel
    fn send_event(&self, event: NetworkEvent) {
        if let Err(e) = self.event_sender.send(event) {
            error!("Failed to send network event: {}", e);
        }
    }

    /// Broadcast message to all peers
    pub async fn broadcast_message(&mut self, message: P2PMessage, topic: &str) -> Result<()> {
        let topic = gossipsub::IdentTopic::new(topic);
        let data = bincode::serialize(&message)?;
        
        self.swarm.behaviour_mut().gossipsub.publish(topic, data)
            .context("Failed to publish message")?;
        
        Ok(())
    }

    /// Send direct message to specific peer via gossip
    pub async fn send_message(&mut self, _peer_id: PeerId, message: P2PMessage, topic: &str) -> Result<()> {
        // For now, we'll use gossip for direct messages
        // In a production system, we'd want to implement proper direct messaging
        self.broadcast_message(message, topic).await
    }

    /// Get connected peers
    pub async fn get_connected_peers(&self) -> Vec<PeerId> {
        self.connected_peers.read().await.iter().cloned().collect()
    }

    /// Get peer addresses
    pub async fn get_peer_addresses(&self, peer_id: &PeerId) -> Option<Vec<Multiaddr>> {
        self.peer_addresses.read().await.get(peer_id).cloned()
    }

    /// Register worker capabilities
    pub async fn register_worker_capabilities(&self, peer_id: PeerId, capabilities: WorkerCapabilities) {
        self.worker_capabilities.write().await.insert(peer_id, capabilities);
    }

    /// Get local peer ID
    pub fn local_peer_id(&self) -> PeerId {
        self.local_peer_id
    }

    /// Get network configuration
    pub fn config(&self) -> &P2PConfig {
        &self.config
    }
}

impl Default for P2PConfig {
    fn default() -> Self {
        Self {
            keypair: None,
            listen_addresses: vec![
                "/ip4/0.0.0.0/tcp/4001".parse().unwrap(),
                "/ip6/::/tcp/4001".parse().unwrap(),
            ],
            bootstrap_peers: vec![],
            max_peers: 100,
            connection_timeout: Duration::from_secs(30),
            gossip_config: GossipConfig::default(),
            kad_config: KademliaConfig::default(),
            enable_mdns: true,
        }
    }
}

impl Default for GossipConfig {
    fn default() -> Self {
        Self {
            topics: vec![
                "ciro-jobs".to_string(),
                "ciro-workers".to_string(),
                "ciro-results".to_string(),
                "ciro-reputation".to_string(),
            ],
            message_id_fn: "sha256".to_string(),
            duplicate_cache_time: 60,
            heartbeat_interval: Duration::from_secs(1),
        }
    }
}

impl Default for KademliaConfig {
    fn default() -> Self {
        Self {
            replication_factor: 20,
            query_timeout: Duration::from_secs(10),
            automatic_mode: true,
        }
    }
}

/// Trait for handling P2P network events
#[async_trait]
pub trait NetworkEventHandler {
    /// Handle network events
    async fn handle_network_event(&mut self, event: NetworkEvent) -> Result<()>;
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio::time::{sleep, Duration};
    use starknet::core::types::FieldElement;

    #[tokio::test]
    async fn test_p2p_network_creation() {
        // Create a test P2P network with default configuration
        let config = P2PConfig::default();
        let result = P2PNetwork::new(config);
        
        assert!(result.is_ok());
        let (network, _event_receiver) = result.unwrap();
        
        // Verify the network has the expected local peer ID
        assert!(!network.local_peer_id().to_string().is_empty());
        
        // Verify the configuration is stored correctly
        assert!(network.config().enable_mdns);
        assert_eq!(network.config().max_peers, 100);
    }

    #[tokio::test]
    async fn test_p2p_network_startup() {
        // Create a test P2P network
        let config = P2PConfig {
            listen_addresses: vec!["/ip4/127.0.0.1/tcp/0".parse().unwrap()],
            enable_mdns: false, // Disable mDNS for testing
            ..Default::default()
        };
        
        let result = P2PNetwork::new(config);
        assert!(result.is_ok());
        
        let (mut network, _event_receiver) = result.unwrap();
        
        // Test network startup
        let start_result = network.start().await;
        assert!(start_result.is_ok());
        
        // Test network shutdown
        let stop_result = network.stop().await;
        assert!(stop_result.is_ok());
    }

    #[tokio::test]
    async fn test_gossip_message_broadcast() {
        // Create a test P2P network
        let config = P2PConfig {
            listen_addresses: vec!["/ip4/127.0.0.1/tcp/0".parse().unwrap()],
            enable_mdns: false, // Disable mDNS for testing
            ..Default::default()
        };
        let (mut network, _event_receiver) = P2PNetwork::new(config).unwrap();
        
        // Start the network
        network.start().await.unwrap();
        
        // Subscribe to a test topic first
        let test_topic = gossipsub::IdentTopic::new("test-topic");
        let subscribe_result = network.swarm.behaviour_mut().gossipsub.subscribe(&test_topic);
        assert!(subscribe_result.is_ok());
        
        // Create a test message
        let test_message = P2PMessage::Heartbeat {
            worker_id: WorkerId::new(),
            timestamp: chrono::Utc::now(),
            load: 0.5,
        };
        
        // Test broadcasting the message (this will fail with InsufficientPeers in a single-node test)
        let broadcast_result = network.broadcast_message(test_message, "test-topic").await;
        
        // In a single-node test, we expect InsufficientPeers error, which is normal
        if let Err(e) = &broadcast_result {
            let error_msg = format!("{:?}", e);
            assert!(error_msg.contains("InsufficientPeers"), "Expected InsufficientPeers error, got: {}", error_msg);
        }
        // If there were peers available, the broadcast should succeed
        // For now, we'll just verify the network can attempt to broadcast
        
        // Stop the network
        network.stop().await.unwrap();
    }

    #[tokio::test]
    async fn test_worker_capabilities_registration() {
        // Create a test P2P network
        let config = P2PConfig::default();
        let (network, _event_receiver) = P2PNetwork::new(config).unwrap();
        
        // Create test capabilities
        let test_capabilities = WorkerCapabilities {
            gpu_memory: 8192,
            cpu_cores: 8,
            ram: 32 * 1024, // Convert GB to MB
            storage: 1000 * 1024, // Convert GB to MB
            bandwidth: 1000,
            capability_flags: 0xFF,
            gpu_model: FieldElement::from(0x4090u32), // RTX 4090
            cpu_model: FieldElement::from(0x7950u32), // Ryzen 7950X
        };
        
        let peer_id = PeerId::random();
        
        // Test capability registration
        network.register_worker_capabilities(peer_id, test_capabilities).await;
        
        // Verify capabilities are stored
        let capabilities = network.worker_capabilities.read().await;
        assert!(capabilities.contains_key(&peer_id));
        
        let stored_capabilities = capabilities.get(&peer_id).unwrap();
        assert_eq!(stored_capabilities.gpu_memory, 8192);
        assert_eq!(stored_capabilities.cpu_cores, 8);
        assert_eq!(stored_capabilities.ram, 32 * 1024);
        assert_eq!(stored_capabilities.storage, 1000 * 1024);
    }
} 