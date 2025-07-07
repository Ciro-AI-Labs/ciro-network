//! ZK Proof Verifier Interface for CIRO Network
//! Handles proof generation jobs for Starknet and other ZK rollups
//! Critical component for positioning CIRO as blockchain scaling infrastructure

use core::array::Array;
use super::job_manager::{WorkerId};

// ZK Proof specific identifiers
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct ProofJobId {
    pub value: u256
}

#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct BatchHash {
    pub value: felt252
}

#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct ProofHash {
    pub value: felt252
}

// ZK Proof job types
#[derive(Copy, Drop, Serde, starknet::Store)]
#[allow(starknet::store_no_default_variant)]
pub enum ProofType {
    StarknetBatch,      // Standard Starknet block proofs
    RecursiveProof,     // SHARP aggregation proofs
    ZKMLInference,      // AI inference with zkML verification
    CrossChainBridge,   // Cross-rollup bridge proofs
    ApplicationSpecific // Custom app-rollup proofs
}

// Priority levels for time-critical blockchain operations
#[derive(Copy, Drop, Serde, starknet::Store)]
#[allow(starknet::store_no_default_variant)]
pub enum ProofPriority {
    Standard,    // Normal block proving cadence
    High,        // During congestion periods
    Critical,    // Network liveness at risk
    Emergency    // Sequencer failure scenarios
}

// Proof job specification
#[derive(Drop, Serde, starknet::Store)]
pub struct ProofJobSpec {
    pub job_id: ProofJobId,
    pub proof_type: ProofType,
    pub batch_hash: BatchHash,
    pub public_input: Array<felt252>,
    pub priority: ProofPriority,
    pub reward_usdc: u256,          // USD-denominated reward
    pub bonus_ciro: u256,           // Additional CIRO bonus for performance
    pub deadline_timestamp: u64,    // SLA requirement
    pub required_attestations: u8,  // Number of worker confirmations needed
    pub min_stake_requirement: u256 // Minimum CIRO stake for eligible workers
}

// Proof submission from workers
#[derive(Drop, Serde, starknet::Store)]
pub struct ProofSubmission {
    pub job_id: ProofJobId,
    pub worker_id: WorkerId,
    pub proof_data: Array<felt252>,  // Actual ZK proof
    pub proof_hash: ProofHash,
    pub computation_time_ms: u64,
    pub gas_used: u64,
    pub attestation_signature: Array<felt252>
}

// Proof verification result
#[derive(Copy, Drop, Serde, starknet::Store)]
#[allow(starknet::store_no_default_variant)]
pub enum ProofStatus {
    Pending,        // Job posted, awaiting workers
    InProgress,     // Workers actively computing
    Verified,       // Valid proof accepted
    Failed,         // Proof verification failed
    Expired,        // Deadline passed without valid proof
    Disputed        // Conflicting proofs submitted
}

// Performance metrics for workers
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct ProverMetrics {
    pub worker_id: WorkerId,
    pub proofs_completed: u64,
    pub success_rate: u16,          // Basis points (10000 = 100%)
    pub average_completion_time: u64,
    pub stake_amount: u256,
    pub total_rewards_earned: u256,
    pub reputation_score: u16       // Basis points (10000 = 100%)
}

// Economic parameters for different proof types
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct ProofEconomics {
    pub proof_type: ProofType,
    pub base_reward_usdc: u256,      // Standard payment per proof
    pub performance_multiplier: u16,  // Bonus for fast completion (basis points)
    pub stake_requirement: u256,      // Minimum CIRO stake needed
    pub slashing_amount: u256,        // Penalty for invalid proof submission
    pub max_computation_time: u64     // SLA deadline in milliseconds
}

#[starknet::interface]
pub trait IProofVerifier<TContractState> {
    // ========================================================================
    // PROOF JOB MANAGEMENT
    // ========================================================================
    
    /// Submit a new ZK proof generation job
    /// Called by Starknet sequencer or other rollups
    fn submit_proof_job(
        ref self: TContractState,
        spec: ProofJobSpec
    ) -> ProofJobId;
    
    /// Get details of a specific proof job
    fn get_proof_job(
        self: @TContractState,
        job_id: ProofJobId
    ) -> ProofJobSpec;
    
    /// List all pending proof jobs (for worker discovery)
    fn get_pending_jobs(
        self: @TContractState,
        proof_type: ProofType,
        max_count: u32
    ) -> Array<ProofJobId>;
    
    /// Cancel a proof job (before deadline)
    fn cancel_proof_job(
        ref self: TContractState,
        job_id: ProofJobId
    );

    // ========================================================================
    // PROOF SUBMISSION & VERIFICATION
    // ========================================================================
    
    /// Submit a computed proof for verification
    /// Called by CIRO workers
    fn submit_proof(
        ref self: TContractState,
        submission: ProofSubmission
    ) -> bool;
    
    /// Verify a submitted proof cryptographically
    /// Internal function called after submission
    fn verify_proof(
        ref self: TContractState,
        job_id: ProofJobId,
        proof_data: Array<felt252>
    ) -> bool;
    
    /// Get current status of a proof job
    fn get_proof_status(
        self: @TContractState,
        job_id: ProofJobId
    ) -> ProofStatus;
    
    /// Resolve disputes between conflicting proof submissions
    fn resolve_dispute(
        ref self: TContractState,
        job_id: ProofJobId,
        canonical_proof: Array<felt252>
    );

    // ========================================================================
    // WORKER COORDINATION
    // ========================================================================
    
    /// Register as an eligible ZK proof worker
    fn register_as_prover(
        ref self: TContractState,
        worker_id: WorkerId,
        stake_amount: u256,
        supported_proof_types: Array<ProofType>
    );
    
    /// Claim a proof job for computation
    fn claim_proof_job(
        ref self: TContractState,
        job_id: ProofJobId,
        worker_id: WorkerId
    ) -> bool;
    
    /// Get worker's proving metrics and reputation
    fn get_prover_metrics(
        self: @TContractState,
        worker_id: WorkerId
    ) -> ProverMetrics;
    
    /// Update worker reputation based on performance
    fn update_reputation(
        ref self: TContractState,
        worker_id: WorkerId,
        performance_score: u16
    );

    // ========================================================================
    // ECONOMIC COORDINATION
    // ========================================================================
    
    /// Distribute rewards for completed proofs
    fn distribute_proof_rewards(
        ref self: TContractState,
        job_id: ProofJobId,
        winning_worker: WorkerId
    );
    
    /// Slash stakes for invalid proof submissions
    fn slash_invalid_prover(
        ref self: TContractState,
        job_id: ProofJobId,
        guilty_worker: WorkerId,
        slash_amount: u256
    );
    
    /// Get economic parameters for proof types
    fn get_proof_economics(
        self: @TContractState,
        proof_type: ProofType
    ) -> ProofEconomics;
    
    /// Update reward parameters (governance)
    fn update_proof_economics(
        ref self: TContractState,
        proof_type: ProofType,
        new_economics: ProofEconomics
    );

    // ========================================================================
    // NETWORK HEALTH MONITORING
    // ========================================================================
    
    /// Get current network proving capacity
    fn get_network_capacity(
        self: @TContractState
    ) -> (u32, u32); // (active_provers, queue_depth)
    
    /// Check SLA compliance for proof types
    fn get_sla_metrics(
        self: @TContractState,
        proof_type: ProofType,
        time_window_hours: u32
    ) -> (u16, u64); // (success_rate_bp, avg_completion_time)
    
    /// Emergency fallback for critical network operations
    fn emergency_proof_request(
        ref self: TContractState,
        urgent_spec: ProofJobSpec,
        emergency_multiplier: u16
    ) -> ProofJobId;

    // ========================================================================
    // INTEGRATION POINTS
    // ========================================================================
    
    /// Post verified proof to destination (L1, other rollups)
    fn post_proof_to_destination(
        ref self: TContractState,
        job_id: ProofJobId,
        destination_chain: felt252
    );
    
    /// Bridge rewards cross-chain if needed
    fn bridge_rewards(
        ref self: TContractState,
        worker_id: WorkerId,
        amount: u256,
        destination_chain: felt252
    );
}

// Events for proof verification lifecycle
#[derive(Drop, starknet::Event)]
pub struct ProofJobSubmitted {
    #[key]
    pub job_id: ProofJobId,
    pub proof_type: ProofType,
    pub reward_usdc: u256,
    pub deadline: u64
}

#[derive(Drop, starknet::Event)]
pub struct ProofJobClaimed {
    #[key]
    pub job_id: ProofJobId,
    #[key] 
    pub worker_id: WorkerId,
    pub claim_timestamp: u64
}

#[derive(Drop, starknet::Event)]
pub struct ProofVerified {
    #[key]
    pub job_id: ProofJobId,
    #[key]
    pub worker_id: WorkerId,
    pub completion_time: u64,
    pub reward_paid: u256
}

#[derive(Drop, starknet::Event)]
pub struct ProofFailed {
    #[key]
    pub job_id: ProofJobId,
    #[key]
    pub worker_id: WorkerId,
    pub reason: felt252,
    pub slash_amount: u256
}

#[derive(Drop, starknet::Event)]
pub struct NetworkCapacityAlert {
    pub proof_type: ProofType,
    pub queue_depth: u32,
    pub available_provers: u32,
    pub alert_level: felt252
}

#[derive(Drop, starknet::Event)]
pub struct EmergencyProofActivated {
    #[key]
    pub job_id: ProofJobId,
    pub original_reward: u256,
    pub emergency_multiplier: u16,
    pub reason: felt252
} 