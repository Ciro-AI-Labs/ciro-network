// CIRO Network Core Types
// Optimized data structures for gas efficiency and functionality

use starknet::ContractAddress;

/// Packed job data structure optimized for storage
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct JobData {
    pub requester: ContractAddress,
    pub model_id: felt252,
    pub input_data_hash: felt252,
    pub status: u8,                  // JobStatus as u8 for packing
    pub priority: u8,                // Job priority level
    pub worker_id: felt252,          // 0 if not assigned
    pub result_hash: felt252,        // 0 if not completed
    pub payment_amount: u256,
    pub created_at: u64,
    pub updated_at: u64,
    pub timeout_at: u64,
}

/// Packed worker profile for efficient storage
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct WorkerProfile {
    pub owner: ContractAddress,
    pub stake_amount: u256,
    pub reputation_score: u16,       // 0-1000 scale
    pub completed_jobs: u32,
    pub successful_attestations: u32,
    pub failed_jobs: u32,
    pub status_flags: u8,            // Bitfield for various statuses
    pub capabilities: u64,           // Bitfield for supported capabilities
    pub last_active_time: u64,
    pub registration_time: u64,
}

/// Model requirements for job matching
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct ModelRequirements {
    pub min_gpu_memory: u64,         // Minimum GPU memory in GB
    pub min_cpu_cores: u8,           // Minimum CPU cores
    pub min_ram: u64,                // Minimum RAM in GB
    pub required_capabilities: u64,   // Required capability flags
    pub estimated_runtime: u64,      // Estimated runtime in seconds
    pub complexity_score: u8,        // 1-10 complexity rating
}

/// Result attestation structure
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct ResultAttestation {
    pub job_id: felt252,
    pub result_hash: felt252,
    pub worker_id: felt252,
    pub timestamp: u64,
    pub signature_r: felt252,        // ECDSA signature r component
    pub signature_s: felt252,        // ECDSA signature s component
    pub verification_status: u8,     // 0=pending, 1=verified, 2=disputed
}

/// Stake information with time-locking
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct StakeInfo {
    pub amount: u256,
    pub locked_until: u64,           // Timestamp when stake can be withdrawn
    pub lock_duration: u64,          // Original lock duration in seconds
    pub reward_multiplier: u16,      // Multiplier for rewards (100 = 1x)
    pub slash_count: u8,             // Number of times slashed
    pub last_slash_time: u64,        // Timestamp of last slash
}

/// Unstake request for delayed withdrawal
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct UnstakeRequest {
    pub amount: u256,
    pub requested_at: u64,
    pub available_at: u64,           // When withdrawal becomes available
    pub partial: bool,               // Whether this is a partial unstake
}

/// Performance metrics for workers
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct PerformanceMetrics {
    pub total_jobs: u32,
    pub successful_jobs: u32,
    pub failed_jobs: u32,
    pub disputed_jobs: u32,
    pub average_completion_time: u64,
    pub uptime_percentage: u16,      // 0-10000 (0.00% to 100.00%)
    pub last_updated: u64,
}

/// Subscription details for Paymaster
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct Subscription {
    pub tier: u8,                    // SubscriptionTier as u8
    pub expires_at: u64,
    pub daily_limit: u32,
    pub monthly_limit: u32,
    pub daily_used: u32,
    pub monthly_used: u32,
    pub last_reset_day: u32,         // Day of year for daily reset
    pub last_reset_month: u8,        // Month for monthly reset
}

/// Payment channel for micro-payments
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct PaymentChannel {
    pub sender: ContractAddress,
    pub recipient: ContractAddress,
    pub balance: u256,
    pub nonce: u64,
    pub expiration: u64,
    pub is_open: bool,
    pub last_settlement: u64,
}

/// Dispute information
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct DisputeInfo {
    pub job_id: felt252,
    pub initiator: ContractAddress,
    pub disputed_party: ContractAddress,
    pub dispute_type: u8,            // Type of dispute
    pub evidence_hash: felt252,
    pub created_at: u64,
    pub resolved_at: u64,            // 0 if not resolved
    pub resolution: u8,              // 0=pending, 1=favor_initiator, 2=favor_disputed
    pub arbitrator: ContractAddress,
}

/// Slash record for tracking penalties
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct SlashRecord {
    pub worker_id: felt252,
    pub reason: u8,                  // SlashReason as u8
    pub amount: u256,
    pub timestamp: u64,
    pub job_id: felt252,             // Related job if applicable
    pub evidence_hash: felt252,
}

/// Allocation result for job-worker matching
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct AllocationResult {
    pub job_id: felt252,
    pub worker_id: felt252,
    pub allocated_at: u64,
    pub expected_completion: u64,
    pub allocation_score: u16,       // Quality of the match (0-1000)
    pub backup_workers: Array<felt252>, // Backup workers for failover
}

/// Pagination info for efficient querying
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct PaginationInfo {
    pub offset: u32,
    pub limit: u32,
    pub total_count: u32,
    pub has_more: bool,
}

/// Rate limit information
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct RateLimit {
    pub requests_per_minute: u32,
    pub requests_per_hour: u32,
    pub requests_per_day: u32,
    pub current_minute_count: u32,
    pub current_hour_count: u32,
    pub current_day_count: u32,
    pub last_reset_minute: u64,
    pub last_reset_hour: u64,
    pub last_reset_day: u64,
}

/// Batch operation result
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct BatchResult {
    pub total_operations: u32,
    pub successful_operations: u32,
    pub failed_operations: u32,
    pub first_failure_index: u32,    // Index of first failure, u32::MAX if none
    pub gas_used: u64,
} 