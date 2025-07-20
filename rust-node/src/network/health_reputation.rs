//! # Network Health and Reputation System
//!
//! This module implements a comprehensive health monitoring and reputation system
//! that tracks worker performance, network health, and enforces penalties for
//! bad behavior.

use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, VecDeque};
use std::sync::Arc;
use tokio::sync::{mpsc, RwLock};
use tracing::{info, error};
use uuid::Uuid;
use chrono::{DateTime, Utc};

use crate::blockchain::types::WorkerCapabilities;
use crate::types::{JobId, WorkerId, NetworkAddress};

/// Health and reputation system configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthReputationConfig {
    /// Health check interval in seconds
    pub health_check_interval_secs: u64,
    /// Reputation decay rate per day (0.0 to 1.0)
    pub reputation_decay_rate: f64,
    /// Minimum reputation score for worker participation
    pub min_reputation_threshold: f64,
    /// Maximum reputation score
    pub max_reputation_score: f64,
    /// Penalty multiplier for failures
    pub failure_penalty_multiplier: f64,
    /// Bonus multiplier for successful completions
    pub success_bonus_multiplier: f64,
    /// Timeout penalty severity (0.0 to 1.0)
    pub timeout_penalty_severity: f64,
    /// Malicious behavior penalty severity (0.0 to 1.0)
    pub malicious_penalty_severity: f64,
    /// Reputation recovery rate per successful job
    pub reputation_recovery_rate: f64,
    /// Maximum penalty history to maintain
    pub max_penalty_history: usize,
    /// Health metrics window size (number of samples)
    pub health_metrics_window: usize,
    /// Network health threshold (0.0 to 1.0)
    pub network_health_threshold: f64,
    /// Enable automatic worker banning
    pub enable_auto_ban: bool,
    /// Minimum jobs before considering reputation decay
    pub min_jobs_for_decay: u32,
}

impl Default for HealthReputationConfig {
    fn default() -> Self {
        Self {
            health_check_interval_secs: 60,
            reputation_decay_rate: 0.01, // 1% decay per day
            min_reputation_threshold: 0.3,
            max_reputation_score: 1.0,
            failure_penalty_multiplier: 0.9,
            success_bonus_multiplier: 1.05,
            timeout_penalty_severity: 0.8,
            malicious_penalty_severity: 0.5,
            reputation_recovery_rate: 0.02,
            max_penalty_history: 100,
            health_metrics_window: 50,
            network_health_threshold: 0.7,
            enable_auto_ban: true,
            min_jobs_for_decay: 5,
        }
    }
}

/// Worker health status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkerHealth {
    pub worker_id: WorkerId,
    pub is_online: bool,
    pub last_heartbeat: DateTime<Utc>,
    pub response_time_ms: u64,
    pub cpu_usage_percent: f32,
    pub memory_usage_percent: f32,
    pub disk_usage_percent: f32,
    pub network_latency_ms: u64,
    pub uptime_seconds: u64,
    pub load_average: f32,
    pub temperature_celsius: Option<f32>,
    pub gpu_utilization_percent: Option<f32>,
    pub gpu_memory_usage_percent: Option<f32>,
    pub network_bandwidth_mbps: Option<f32>,
    pub error_count: u32,
    pub consecutive_failures: u32,
    pub health_score: f64,
}

impl WorkerHealth {
    /// Create a new worker health record
    pub fn new(worker_id: WorkerId) -> Self {
        Self {
            worker_id,
            is_online: false,
            last_heartbeat: Utc::now(),
            response_time_ms: 0,
            cpu_usage_percent: 0.0,
            memory_usage_percent: 0.0,
            disk_usage_percent: 0.0,
            network_latency_ms: 0,
            uptime_seconds: 0,
            load_average: 0.0,
            temperature_celsius: None,
            gpu_utilization_percent: None,
            gpu_memory_usage_percent: None,
            network_bandwidth_mbps: None,
            error_count: 0,
            consecutive_failures: 0,
            health_score: 1.0,
        }
    }

    /// Update health metrics
    pub fn update_metrics(&mut self, metrics: HealthMetrics) {
        self.response_time_ms = metrics.response_time_ms;
        self.cpu_usage_percent = metrics.cpu_usage_percent;
        self.memory_usage_percent = metrics.memory_usage_percent;
        self.disk_usage_percent = metrics.disk_usage_percent;
        self.network_latency_ms = metrics.network_latency_ms;
        self.uptime_seconds = metrics.uptime_seconds;
        self.load_average = metrics.load_average;
        self.temperature_celsius = metrics.temperature_celsius;
        self.gpu_utilization_percent = metrics.gpu_utilization_percent;
        self.gpu_memory_usage_percent = metrics.gpu_memory_usage_percent;
        self.network_bandwidth_mbps = metrics.network_bandwidth_mbps;
        self.last_heartbeat = Utc::now();
        self.is_online = true;
        
        // Calculate health score
        self.health_score = self.calculate_health_score();
    }

    /// Calculate overall health score
    fn calculate_health_score(&self) -> f64 {
        let mut score: f64 = 1.0;
        
        // Penalize high resource usage
        if self.cpu_usage_percent > 90.0 {
            score *= 0.8;
        } else if self.cpu_usage_percent > 80.0 {
            score *= 0.9;
        }
        
        if self.memory_usage_percent > 90.0 {
            score *= 0.8;
        } else if self.memory_usage_percent > 80.0 {
            score *= 0.9;
        }
        
        if self.disk_usage_percent > 95.0 {
            score *= 0.7;
        } else if self.disk_usage_percent > 85.0 {
            score *= 0.9;
        }
        
        // Penalize high latency
        if self.network_latency_ms > 1000 {
            score *= 0.8;
        } else if self.network_latency_ms > 500 {
            score *= 0.9;
        }
        
        // Penalize consecutive failures
        if self.consecutive_failures > 5 {
            score *= 0.5;
        } else if self.consecutive_failures > 2 {
            score *= 0.8;
        }
        
        // Penalize high temperature
        if let Some(temp) = self.temperature_celsius {
            if temp > 85.0 {
                score *= 0.7;
            } else if temp > 75.0 {
                score *= 0.9;
            }
        }
        
        score.max(0.1)
    }
}

/// Health metrics from worker
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthMetrics {
    pub response_time_ms: u64,
    pub cpu_usage_percent: f32,
    pub memory_usage_percent: f32,
    pub disk_usage_percent: f32,
    pub network_latency_ms: u64,
    pub uptime_seconds: u64,
    pub load_average: f32,
    pub temperature_celsius: Option<f32>,
    pub gpu_utilization_percent: Option<f32>,
    pub gpu_memory_usage_percent: Option<f32>,
    pub network_bandwidth_mbps: Option<f32>,
}

/// Enhanced worker reputation with detailed tracking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkerReputation {
    pub worker_id: WorkerId,
    pub reputation_score: f64,
    pub jobs_completed: u32,
    pub jobs_failed: u32,
    pub jobs_timeout: u32,
    pub total_earnings: u128,
    pub average_completion_time_ms: u64,
    pub last_job_completion: Option<DateTime<Utc>>,
    pub last_seen: DateTime<Utc>,
    pub capabilities: WorkerCapabilities,
    pub network_address: Option<NetworkAddress>,
    
    // Performance tracking
    pub success_rate: f64,
    pub reliability_score: f64,
    pub efficiency_score: f64,
    pub consistency_score: f64,
    
    // Penalty tracking
    pub penalty_history: VecDeque<PenaltyRecord>,
    pub total_penalties: u32,
    pub is_banned: bool,
    pub ban_reason: Option<String>,
    pub ban_expiry: Option<DateTime<Utc>>,
    
    // Reputation decay
    pub reputation_decay_start: Option<DateTime<Utc>>,
    pub last_decay_calculation: DateTime<Utc>,
    
    // Quality metrics
    pub result_quality_score: f64,
    pub average_result_confidence: f64,
    pub malicious_behavior_count: u32,
    pub suspicious_activity_count: u32,
}

impl WorkerReputation {
    /// Create a new worker reputation record
    pub fn new(worker_id: WorkerId, capabilities: WorkerCapabilities) -> Self {
        Self {
            worker_id,
            reputation_score: 0.8, // Default starting reputation
            jobs_completed: 0,
            jobs_failed: 0,
            jobs_timeout: 0,
            total_earnings: 0,
            average_completion_time_ms: 0,
            last_job_completion: None,
            last_seen: Utc::now(),
            capabilities,
            network_address: None,
            success_rate: 1.0,
            reliability_score: 1.0,
            efficiency_score: 1.0,
            consistency_score: 1.0,
            penalty_history: VecDeque::new(),
            total_penalties: 0,
            is_banned: false,
            ban_reason: None,
            ban_expiry: None,
            reputation_decay_start: None,
            last_decay_calculation: Utc::now(),
            result_quality_score: 1.0,
            average_result_confidence: 1.0,
            malicious_behavior_count: 0,
            suspicious_activity_count: 0,
        }
    }

    /// Update reputation after job completion
    pub fn update_after_job(&mut self, success: bool, execution_time_ms: u64, earnings: u128) {
        if success {
            self.jobs_completed += 1;
            self.total_earnings += earnings;
            self.last_job_completion = Some(Utc::now());
        } else {
            self.jobs_failed += 1;
        }
        
        // Update average completion time
        let total_jobs = self.jobs_completed + self.jobs_failed;
        self.average_completion_time_ms = 
            ((self.average_completion_time_ms * (total_jobs - 1) as u64) + execution_time_ms) / total_jobs as u64;
        
        // Update success rate
        self.success_rate = self.jobs_completed as f64 / total_jobs as f64;
        
        self.last_seen = Utc::now();
    }

    /// Add penalty record
    pub fn add_penalty(&mut self, penalty: PenaltyRecord) {
        self.penalty_history.push_back(penalty.clone());
        self.total_penalties += 1;
        
        // Keep only recent penalties
        if self.penalty_history.len() > 100 {
            self.penalty_history.pop_front();
        }
    }

    /// Check if worker is eligible for jobs
    pub fn is_eligible(&self) -> bool {
        !self.is_banned && 
        self.reputation_score >= 0.3 &&
        self.success_rate >= 0.5
    }
}

/// Penalty record for tracking worker violations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PenaltyRecord {
    pub penalty_id: String,
    pub penalty_type: PenaltyType,
    pub severity: f64,
    pub reason: String,
    pub job_id: Option<JobId>,
    pub timestamp: DateTime<Utc>,
    pub reputation_impact: f64,
    pub duration_seconds: Option<u64>,
}

/// Types of penalties that can be applied
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PenaltyType {
    JobTimeout,
    JobFailure,
    MaliciousBehavior,
    PoorPerformance,
    NetworkIssues,
    ResourceAbuse,
    InvalidResult,
    Spam,
    Ban,
}

/// Network health status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkHealth {
    pub total_workers: u32,
    pub active_workers: u32,
    pub healthy_workers: u32,
    pub banned_workers: u32,
    pub average_reputation: f64,
    pub network_uptime_percent: f64,
    pub average_response_time_ms: u64,
    pub total_jobs_processed: u32,
    pub success_rate: f64,
    pub last_updated: DateTime<Utc>,
    pub health_score: f64,
}

impl NetworkHealth {
    /// Calculate overall network health score
    pub fn calculate_health_score(&mut self) {
        let mut score = 1.0;
        
        // Factor in active worker ratio
        if self.total_workers > 0 {
            let active_ratio = self.active_workers as f64 / self.total_workers as f64;
            score *= active_ratio;
        }
        
        // Factor in healthy worker ratio
        if self.active_workers > 0 {
            let healthy_ratio = self.healthy_workers as f64 / self.active_workers as f64;
            score *= healthy_ratio;
        }
        
        // Factor in average reputation
        score *= self.average_reputation;
        
        // Factor in success rate
        score *= self.success_rate;
        
        // Penalize high response times
        if self.average_response_time_ms > 5000 {
            score *= 0.8;
        } else if self.average_response_time_ms > 2000 {
            score *= 0.9;
        }
        
        self.health_score = score.max(0.1);
    }
}

/// Health and reputation system events
#[derive(Debug, Clone)]
pub enum HealthReputationEvent {
    WorkerHealthUpdated(WorkerId, WorkerHealth),
    ReputationUpdated(WorkerId, f64),
    PenaltyApplied(WorkerId, PenaltyRecord),
    WorkerBanned(WorkerId, String),
    WorkerUnbanned(WorkerId),
    NetworkHealthUpdated(NetworkHealth),
    MaliciousBehaviorDetected(WorkerId, String),
    SuspiciousActivityDetected(WorkerId, String),
}

/// Main health and reputation system
pub struct HealthReputationSystem {
    config: HealthReputationConfig,
    
    // State management
    worker_health: Arc<RwLock<HashMap<WorkerId, WorkerHealth>>>,
    worker_reputations: Arc<RwLock<HashMap<WorkerId, WorkerReputation>>>,
    network_health: Arc<RwLock<NetworkHealth>>,
    
    // Communication channels
    event_sender: mpsc::UnboundedSender<HealthReputationEvent>,
    event_receiver: Arc<RwLock<Option<mpsc::UnboundedReceiver<HealthReputationEvent>>>>,
    
    // Internal state
    running: Arc<RwLock<bool>>,
    last_health_check: Arc<RwLock<DateTime<Utc>>>,
}

impl HealthReputationSystem {
    /// Create a new health and reputation system
    pub fn new(config: HealthReputationConfig) -> Self {
        let (event_sender, event_receiver) = mpsc::unbounded_channel();
        
        let network_health = NetworkHealth {
            total_workers: 0,
            active_workers: 0,
            healthy_workers: 0,
            banned_workers: 0,
            average_reputation: 0.8,
            network_uptime_percent: 100.0,
            average_response_time_ms: 0,
            total_jobs_processed: 0,
            success_rate: 1.0,
            last_updated: Utc::now(),
            health_score: 1.0,
        };
        
        Self {
            config,
            worker_health: Arc::new(RwLock::new(HashMap::new())),
            worker_reputations: Arc::new(RwLock::new(HashMap::new())),
            network_health: Arc::new(RwLock::new(network_health)),
            event_sender,
            event_receiver: Arc::new(RwLock::new(Some(event_receiver))),
            running: Arc::new(RwLock::new(false)),
            last_health_check: Arc::new(RwLock::new(Utc::now())),
        }
    }

    /// Start the health and reputation system
    pub async fn start(&self) -> Result<()> {
        info!("Starting Health and Reputation System...");
        
        {
            let mut running = self.running.write().await;
            if *running {
                return Err(anyhow::anyhow!("Health reputation system already running"));
            }
            *running = true;
        }

        info!("Health and reputation system started successfully");
        Ok(())
    }

    /// Stop the health and reputation system
    pub async fn stop(&self) -> Result<()> {
        info!("Stopping health and reputation system...");
        
        let mut running = self.running.write().await;
        *running = false;
        
        info!("Health and reputation system stopped");
        Ok(())
    }

    /// Update worker health metrics
    pub async fn update_worker_health(&self, worker_id: WorkerId, metrics: HealthMetrics) -> Result<()> {
        let mut health_records = self.worker_health.write().await;
        
        let health = health_records.entry(worker_id.clone()).or_insert_with(|| {
            WorkerHealth::new(worker_id.clone())
        });
        
        health.update_metrics(metrics);
        
        // Send health update event
        self.send_event(HealthReputationEvent::WorkerHealthUpdated(
            worker_id.clone(),
            health.clone()
        ));
        
        Ok(())
    }

    /// Update worker reputation after job completion
    pub async fn update_worker_reputation(
        &self,
        worker_id: WorkerId,
        success: bool,
        execution_time_ms: u64,
        earnings: u128,
        result_quality: Option<f64>,
    ) -> Result<()> {
        let mut reputations = self.worker_reputations.write().await;
        
        let reputation = reputations.entry(worker_id.clone()).or_insert_with(|| {
            WorkerReputation::new(worker_id.clone(), WorkerCapabilities::default())
        });
        
        // Update basic metrics
        reputation.update_after_job(success, execution_time_ms, earnings);
        
        // Update quality metrics
        if let Some(quality) = result_quality {
            reputation.result_quality_score = 
                (reputation.result_quality_score * 0.9 + quality * 0.1).max(0.0).min(1.0);
        }
        
        // Calculate new reputation score
        let new_score = self.calculate_reputation_score(reputation);
        reputation.reputation_score = new_score;
        
        // Apply success bonus or failure penalty
        if success {
            reputation.reputation_score = (reputation.reputation_score * self.config.success_bonus_multiplier)
                .min(self.config.max_reputation_score);
        } else {
            reputation.reputation_score = (reputation.reputation_score * self.config.failure_penalty_multiplier)
                .max(self.config.min_reputation_threshold);
        }
        
        // Send reputation update event
        self.send_event(HealthReputationEvent::ReputationUpdated(
            worker_id.clone(),
            reputation.reputation_score
        ));
        
        Ok(())
    }

    /// Apply penalty to worker
    pub async fn apply_penalty(
        &self,
        worker_id: WorkerId,
        penalty_type: PenaltyType,
        severity: f64,
        reason: String,
        job_id: Option<JobId>,
    ) -> Result<()> {
        let mut reputations = self.worker_reputations.write().await;
        
        // Create worker reputation if it doesn't exist
        let reputation = reputations.entry(worker_id.clone()).or_insert_with(|| {
            WorkerReputation::new(worker_id.clone(), WorkerCapabilities::default())
        });
        
        let penalty = PenaltyRecord {
            penalty_id: Uuid::new_v4().to_string(),
            penalty_type: penalty_type.clone(),
            severity,
            reason: reason.clone(),
            job_id,
            timestamp: Utc::now(),
            reputation_impact: severity * 0.1, // 10% of severity
            duration_seconds: None,
        };
        
        reputation.add_penalty(penalty.clone());
        
        // Apply reputation penalty
        reputation.reputation_score = (reputation.reputation_score * (1.0 - penalty.reputation_impact))
            .max(self.config.min_reputation_threshold);
        
        // Check for automatic banning
        if self.config.enable_auto_ban && reputation.reputation_score < self.config.min_reputation_threshold {
            // Need to drop the lock before calling ban_worker to avoid deadlock
            drop(reputations);
            self.ban_worker(&worker_id, "Reputation below threshold").await?;
        }
        
        // Send penalty event
        self.send_event(HealthReputationEvent::PenaltyApplied(worker_id.clone(), penalty));
        
        Ok(())
    }

    /// Ban a worker
    pub async fn ban_worker(&self, worker_id: &WorkerId, reason: &str) -> Result<()> {
        let mut reputations = self.worker_reputations.write().await;
        
        // Create worker reputation if it doesn't exist
        let reputation = reputations.entry(worker_id.clone()).or_insert_with(|| {
            WorkerReputation::new(worker_id.clone(), WorkerCapabilities::default())
        });
        
        reputation.is_banned = true;
        reputation.ban_reason = Some(reason.to_string());
        reputation.ban_expiry = Some(Utc::now() + chrono::Duration::hours(24)); // 24 hour ban
        
        // Add ban penalty
        let penalty = PenaltyRecord {
            penalty_id: Uuid::new_v4().to_string(),
            penalty_type: PenaltyType::Ban,
            severity: 1.0,
            reason: format!("Worker banned: {}", reason),
            job_id: None,
            timestamp: Utc::now(),
            reputation_impact: 0.5,
            duration_seconds: Some(86400), // 24 hours
        };
        
        reputation.add_penalty(penalty);
        
        self.send_event(HealthReputationEvent::WorkerBanned(worker_id.clone(), reason.to_string()));
        
        Ok(())
    }

    /// Unban a worker
    pub async fn unban_worker(&self, worker_id: &WorkerId) -> Result<()> {
        let mut reputations = self.worker_reputations.write().await;
        
        // Create worker reputation if it doesn't exist
        let reputation = reputations.entry(worker_id.clone()).or_insert_with(|| {
            WorkerReputation::new(worker_id.clone(), WorkerCapabilities::default())
        });
        
        reputation.is_banned = false;
        reputation.ban_reason = None;
        reputation.ban_expiry = None;
        
        self.send_event(HealthReputationEvent::WorkerUnbanned(worker_id.clone()));
        
        Ok(())
    }

    /// Detect and handle malicious behavior
    pub async fn detect_malicious_behavior(&self, worker_id: WorkerId, behavior: String) -> Result<()> {
        let mut reputations = self.worker_reputations.write().await;
        
        // Create worker reputation if it doesn't exist
        let reputation = reputations.entry(worker_id.clone()).or_insert_with(|| {
            WorkerReputation::new(worker_id.clone(), WorkerCapabilities::default())
        });
        
        reputation.malicious_behavior_count += 1;
        reputation.suspicious_activity_count += 1;
        
        // Apply severe penalty for malicious behavior
        let penalty = PenaltyRecord {
            penalty_id: Uuid::new_v4().to_string(),
            penalty_type: PenaltyType::MaliciousBehavior,
            severity: self.config.malicious_penalty_severity,
            reason: format!("Malicious behavior detected: {}", behavior),
            job_id: None,
            timestamp: Utc::now(),
            reputation_impact: self.config.malicious_penalty_severity,
            duration_seconds: None,
        };
        
        reputation.add_penalty(penalty.clone());
        reputation.reputation_score = (reputation.reputation_score * (1.0 - penalty.reputation_impact))
            .max(self.config.min_reputation_threshold);
        
        // Auto-ban for repeated malicious behavior
        if reputation.malicious_behavior_count >= 3 {
            // Need to drop the lock before calling ban_worker to avoid deadlock
            drop(reputations);
            self.ban_worker(&worker_id, "Repeated malicious behavior").await?;
        }
        
        self.send_event(HealthReputationEvent::MaliciousBehaviorDetected(worker_id, behavior));
        
        Ok(())
    }

    /// Calculate reputation score based on multiple factors
    fn calculate_reputation_score(&self, reputation: &WorkerReputation) -> f64 {
        let mut score = 0.0;
        
        // Base score from success rate (40%)
        score += reputation.success_rate * 0.4;
        
        // Reliability score (25%)
        score += reputation.reliability_score * 0.25;
        
        // Efficiency score (20%)
        score += reputation.efficiency_score * 0.2;
        
        // Consistency score (15%)
        score += reputation.consistency_score * 0.15;
        
        // Penalize for recent penalties
        let recent_penalties = reputation.penalty_history.iter()
            .filter(|p| p.timestamp > Utc::now() - chrono::Duration::hours(24))
            .count() as f64;
        
        let penalty_factor = (1.0 - (recent_penalties * 0.1)).max(0.1);
        score *= penalty_factor;
        
        score.max(self.config.min_reputation_threshold).min(self.config.max_reputation_score)
    }

    /// Update network health metrics
    async fn update_network_health(&self) -> Result<()> {
        let reputations = self.worker_reputations.read().await;
        let health_records = self.worker_health.read().await;
        
        let mut network_health = self.network_health.write().await;
        
        network_health.total_workers = reputations.len() as u32;
        network_health.active_workers = health_records.values()
            .filter(|h| h.is_online)
            .count() as u32;
        network_health.healthy_workers = health_records.values()
            .filter(|h| h.is_online && h.health_score > 0.7)
            .count() as u32;
        network_health.banned_workers = reputations.values()
            .filter(|r| r.is_banned)
            .count() as u32;
        
        // Calculate average reputation
        if !reputations.is_empty() {
            let total_reputation: f64 = reputations.values()
                .map(|r| r.reputation_score)
                .sum();
            network_health.average_reputation = total_reputation / reputations.len() as f64;
        }
        
        // Calculate average response time
        if !health_records.is_empty() {
            let total_response_time: u64 = health_records.values()
                .map(|h| h.response_time_ms)
                .sum();
            network_health.average_response_time_ms = total_response_time / health_records.len() as u64;
        }
        
        // Calculate success rate
        let total_jobs: u32 = reputations.values()
            .map(|r| r.jobs_completed + r.jobs_failed)
            .sum();
        let total_completed: u32 = reputations.values()
            .map(|r| r.jobs_completed)
            .sum();
        
        if total_jobs > 0 {
            network_health.success_rate = total_completed as f64 / total_jobs as f64;
        }
        
        network_health.total_jobs_processed = total_jobs;
        network_health.last_updated = Utc::now();
        network_health.calculate_health_score();
        
        self.send_event(HealthReputationEvent::NetworkHealthUpdated(network_health.clone()));
        
        Ok(())
    }

    /// Get worker reputation
    pub async fn get_worker_reputation(&self, worker_id: &WorkerId) -> Option<WorkerReputation> {
        let reputations = self.worker_reputations.read().await;
        reputations.get(worker_id).cloned()
    }

    /// Get worker health
    pub async fn get_worker_health(&self, worker_id: &WorkerId) -> Option<WorkerHealth> {
        let health_records = self.worker_health.read().await;
        health_records.get(worker_id).cloned()
    }

    /// Get network health
    pub async fn get_network_health(&self) -> NetworkHealth {
        let network_health = self.network_health.read().await;
        network_health.clone()
    }

    /// Get all worker reputations
    pub async fn get_all_reputations(&self) -> Vec<WorkerReputation> {
        let reputations = self.worker_reputations.read().await;
        reputations.values().cloned().collect()
    }

    /// Get all worker health records
    pub async fn get_all_health_records(&self) -> Vec<WorkerHealth> {
        let health_records = self.worker_health.read().await;
        health_records.values().cloned().collect()
    }

    /// Check if worker is eligible for jobs
    pub async fn is_worker_eligible(&self, worker_id: &WorkerId) -> bool {
        if let Some(reputation) = self.get_worker_reputation(worker_id).await {
            reputation.is_eligible()
        } else {
            false
        }
    }

    /// Send event to event channel
    fn send_event(&self, event: HealthReputationEvent) {
        if let Err(e) = self.event_sender.send(event) {
            error!("Failed to send health reputation event: {}", e);
        }
    }

    /// Periodic maintenance tasks
    pub async fn periodic_maintenance(&self) -> Result<()> {
        // Clean up expired bans
        let mut reputations = self.worker_reputations.write().await;
        let now = Utc::now();
        
        for reputation in reputations.values_mut() {
            if let Some(expiry) = reputation.ban_expiry {
                if now > expiry {
                    reputation.is_banned = false;
                    reputation.ban_reason = None;
                    reputation.ban_expiry = None;
                    
                    self.send_event(HealthReputationEvent::WorkerUnbanned(reputation.worker_id.clone()));
                }
            }
        }
        
        // Apply reputation decay
        for reputation in reputations.values_mut() {
            if reputation.jobs_completed + reputation.jobs_failed >= self.config.min_jobs_for_decay {
                let days_since_last_decay = (now - reputation.last_decay_calculation).num_days() as f64;
                if days_since_last_decay >= 1.0 {
                    let decay_factor = 1.0 - (self.config.reputation_decay_rate * days_since_last_decay);
                    reputation.reputation_score = (reputation.reputation_score * decay_factor)
                        .max(self.config.min_reputation_threshold);
                    reputation.last_decay_calculation = now;
                }
            }
        }
        
        Ok(())
    }
}

impl Default for WorkerCapabilities {
    fn default() -> Self {
        Self {
            gpu_memory: 0,
            cpu_cores: 0,
            ram: 0,
            storage: 0,
            bandwidth: 0,
            capability_flags: 0,
            gpu_model: starknet::core::types::FieldElement::from(0u32),
            cpu_model: starknet::core::types::FieldElement::from(0u32),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use starknet::core::types::FieldElement;

    #[tokio::test]
    async fn test_health_reputation_config() {
        let config = HealthReputationConfig::default();
        assert_eq!(config.health_check_interval_secs, 60);
        assert!(config.reputation_decay_rate > 0.0);
        assert!(config.min_reputation_threshold > 0.0);
    }

    #[tokio::test]
    async fn test_worker_health_creation() {
        let worker_id = WorkerId::new();
        let health = WorkerHealth::new(worker_id.clone());
        
        assert_eq!(health.worker_id, worker_id);
        assert!(!health.is_online);
        assert_eq!(health.health_score, 1.0);
    }

    #[tokio::test]
    async fn test_worker_reputation_creation() {
        let worker_id = WorkerId::new();
        let capabilities = WorkerCapabilities {
            gpu_memory: 8192,
            cpu_cores: 8,
            ram: 16384,
            storage: 1000,
            bandwidth: 1000,
            capability_flags: 0xFF,
            gpu_model: FieldElement::from(0x4090u32),
            cpu_model: FieldElement::from(0x7950u32),
        };
        
        let reputation = WorkerReputation::new(worker_id.clone(), capabilities);
        
        assert_eq!(reputation.worker_id, worker_id);
        assert_eq!(reputation.reputation_score, 0.8);
        assert_eq!(reputation.jobs_completed, 0);
        assert!(!reputation.is_banned);
    }

    #[tokio::test]
    async fn test_health_reputation_system() {
        let config = HealthReputationConfig::default();
        let system = HealthReputationSystem::new(config);
        
        let worker_id = WorkerId::new();
        let metrics = HealthMetrics {
            response_time_ms: 100,
            cpu_usage_percent: 50.0,
            memory_usage_percent: 60.0,
            disk_usage_percent: 70.0,
            network_latency_ms: 50,
            uptime_seconds: 3600,
            load_average: 1.5,
            temperature_celsius: Some(65.0),
            gpu_utilization_percent: Some(80.0),
            gpu_memory_usage_percent: Some(70.0),
            network_bandwidth_mbps: Some(100.0),
        };
        
        system.update_worker_health(worker_id.clone(), metrics).await.unwrap();
        
        let health = system.get_worker_health(&worker_id).await;
        assert!(health.is_some());
        assert!(health.unwrap().is_online);
    }

    #[tokio::test]
    async fn test_reputation_update() {
        let config = HealthReputationConfig::default();
        let system = HealthReputationSystem::new(config);
        
        let worker_id = WorkerId::new();
        
        // Test successful job completion
        system.update_worker_reputation(
            worker_id.clone(),
            true,
            5000,
            1000,
            Some(0.95),
        ).await.unwrap();
        
        let reputation = system.get_worker_reputation(&worker_id).await;
        assert!(reputation.is_some());
        assert_eq!(reputation.unwrap().jobs_completed, 1);
        
        // Test failed job
        system.update_worker_reputation(
            worker_id.clone(),
            false,
            3000,
            0,
            None,
        ).await.unwrap();
        
        let reputation = system.get_worker_reputation(&worker_id).await;
        assert!(reputation.is_some());
        assert_eq!(reputation.unwrap().jobs_failed, 1);
    }

    #[tokio::test]
    async fn test_penalty_system() {
        let config = HealthReputationConfig::default();
        let system = HealthReputationSystem::new(config);
        
        let worker_id = WorkerId::new();
        
        // Apply a penalty
        system.apply_penalty(
            worker_id.clone(),
            PenaltyType::JobTimeout,
            0.5,
            "Job timed out".to_string(),
            Some(JobId::new()),
        ).await.unwrap();
        
        let reputation = system.get_worker_reputation(&worker_id).await;
        assert!(reputation.is_some());
        assert_eq!(reputation.unwrap().total_penalties, 1);
    }

    #[tokio::test]
    async fn test_worker_banning() {
        let config = HealthReputationConfig::default();
        let system = HealthReputationSystem::new(config);
        
        let worker_id = WorkerId::new();
        
        // Ban worker
        system.ban_worker(&worker_id, "Test ban").await.unwrap();
        
        let reputation = system.get_worker_reputation(&worker_id).await;
        assert!(reputation.is_some());
        assert!(reputation.unwrap().is_banned);
        
        // Unban worker
        system.unban_worker(&worker_id).await.unwrap();
        
        let reputation = system.get_worker_reputation(&worker_id).await;
        assert!(reputation.is_some());
        assert!(!reputation.unwrap().is_banned);
    }

    #[tokio::test]
    async fn test_network_health_calculation() {
        let mut network_health = NetworkHealth {
            total_workers: 10,
            active_workers: 8,
            healthy_workers: 7,
            banned_workers: 1,
            average_reputation: 0.8,
            network_uptime_percent: 95.0,
            average_response_time_ms: 200,
            total_jobs_processed: 100,
            success_rate: 0.9,
            last_updated: Utc::now(),
            health_score: 0.0,
        };
        
        network_health.calculate_health_score();
        
        assert!(network_health.health_score > 0.0);
        assert!(network_health.health_score <= 1.0);
    }
} 