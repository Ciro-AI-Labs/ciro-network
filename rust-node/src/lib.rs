//! # CIRO Network Worker/Coordinator
//!
//! This library provides the core functionality for the CIRO Network distributed compute system.
//! It includes both worker nodes that execute compute tasks and coordinator nodes that manage
//! job distribution and result assembly.

pub mod types;
pub mod node;
pub mod compute;
pub mod network;
pub mod blockchain;
pub mod storage;
pub mod utils;
pub mod ai;
pub mod coordinator;
// TODO: coordinator_main is now a separate binary
// pub mod coordinator_main;

// Re-export commonly used types
pub use types::{
    JobId, TaskId, WorkerId, NetworkAddress, StarknetAddress, CiroAmount,
    ResourceRequirements, Priority, CiroError, CiroResult,
};

// Re-export main coordinator functionality
pub use node::coordinator::{
    JobCoordinator, JobType, JobRequest, JobResult, JobStatus,
    Task, TaskStatus, TaskResult, WorkerInfo, WorkerCapabilities,
    ParallelizationStrategy,
};

// Re-export enhanced coordinator functionality
pub use coordinator::{
    EnhancedCoordinator, CoordinatorStatus,
};
pub use coordinator::config::CoordinatorConfig;
pub use coordinator::kafka::KafkaCoordinator;
pub use coordinator::network_coordinator::NetworkCoordinatorService;
pub use coordinator::job_processor::JobProcessor;

// Re-export worker functionality
pub use node::worker::Worker;

// Re-export compute engine
pub use compute::executor::ComputeExecutor;

// Re-export networking
pub use network::p2p::P2PNetwork;

// Re-export blockchain integration
pub use blockchain::client::StarknetClient;

/// Version information
pub const VERSION: &str = env!("CARGO_PKG_VERSION");
pub const NAME: &str = env!("CARGO_PKG_NAME");

/// Initialize the CIRO Network library
pub fn init() -> CiroResult<()> {
    // Initialize logging
    tracing_subscriber::fmt::init();
    
    // Initialize other components as needed
    Ok(())
} 