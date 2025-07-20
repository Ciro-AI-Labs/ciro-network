//! # Worker Node
//!
//! Worker nodes execute compute tasks assigned by coordinators.

use crate::types::*;
use anyhow::Result;

/// Worker node implementation
pub struct Worker {
    id: WorkerId,
    capabilities: WorkerCapabilities,
}

impl Worker {
    /// Create a new worker
    pub fn new(id: WorkerId, capabilities: WorkerCapabilities) -> Self {
        Self { id, capabilities }
    }

    /// Start the worker
    pub async fn start(&self) -> Result<()> {
        // TODO: Implement worker startup logic
        Ok(())
    }

    /// Stop the worker
    pub async fn stop(&self) -> Result<()> {
        // TODO: Implement worker shutdown logic
        Ok(())
    }
}

/// Worker capabilities
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct WorkerCapabilities {
    pub gpu_memory: u64,
    pub cpu_cores: u32,
    pub ram_gb: u32,
    pub supported_job_types: Vec<String>,
    pub docker_enabled: bool,
    pub max_parallel_tasks: u32,
} 