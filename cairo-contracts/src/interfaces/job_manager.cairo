//! Enhanced Job Manager Interface for CIRO Network
//! Supports both AI computation and ZK proof generation workloads
//! 
//! Strategic Vision: CIRO as permissionless GPU "power plant" serving:
//! 1. AI/ML training & inference (market-based $/GPU-hour)
//! 2. ZK proof generation for Starknet (deterministic $/batch)

use starknet::ContractAddress;
use core::array::Array;

// Enhanced Job ID system supporting multiple job types
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct JobId {
    pub value: u256
}

#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct WorkerId {
    pub value: felt252
}

#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct ModelId {
    pub value: u256
}

// Dispute evidence structure - Remove Store trait due to Array field
#[derive(Drop, Serde)]
pub struct DisputeEvidence {
    pub evidence_type: felt252,
    pub data: Array<felt252>, // Arrays can't be stored directly
    pub timestamp: u64,
    pub submitter: ContractAddress
}

// Job specification for AI workloads - Remove Store trait due to Array fields
#[derive(Drop, Serde)]
pub struct JobSpec {
    pub job_type: JobType,
    pub model_id: ModelId,
    pub input_data_hash: felt252,
    pub expected_output_format: felt252,
    pub verification_method: VerificationMethod,
    pub max_reward: u256,
    pub sla_deadline: u64,
    pub compute_requirements: Array<felt252>, // Arrays can't be stored directly
    pub metadata: Array<felt252> // Arrays can't be stored directly
}

// Result submission from workers - Remove Store trait due to Array field
#[derive(Drop, Serde)]
pub struct JobResult {
    pub job_id: JobId,
    pub worker_id: WorkerId,
    pub output_data_hash: felt252,
    pub computation_proof: Array<felt252>, // Arrays can't be stored directly
    pub gas_used: u256,
    pub execution_time: u64
}

// Job type enumeration
#[derive(Copy, Drop, Serde, starknet::Store, PartialEq)]
#[allow(starknet::store_no_default_variant)]
pub enum JobType {
    AIInference,
    AITraining,
    ProofGeneration,
    ProofVerification
}

// Verification method enumeration  
#[derive(Copy, Drop, Serde, starknet::Store, PartialEq)]
#[allow(starknet::store_no_default_variant)]
pub enum VerificationMethod {
    None,
    StatisticalSampling,
    ZeroKnowledgeProof,
    ConsensusValidation
}

// Job state enumeration
#[derive(Copy, Drop, Serde, starknet::Store, PartialEq)]
#[allow(starknet::store_no_default_variant)]
pub enum JobState {
    Queued,
    Processing,
    Completed,
    Failed,
    Cancelled
}

// Model requirements - Remove Store trait due to Array field
#[derive(Drop, Serde)]
pub struct ModelRequirements {
    pub min_memory_gb: u32,
    pub min_compute_units: u32,
    pub required_gpu_type: felt252,
    pub framework_dependencies: Array<felt252> // Arrays can't be stored directly
}

// Proof job specific data - Remove Store trait due to Array field
#[derive(Drop, Serde)]
pub struct ProveJobData {
    pub circuit_id: felt252,
    pub public_inputs: Array<felt252>, // Arrays can't be stored directly
    pub private_inputs_hash: felt252,
    pub expected_proof_size: u32
}

// Job details for queries - simplified to avoid Array issues
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct JobDetails {
    pub job_id: JobId,
    pub job_type: JobType,
    pub client: ContractAddress,
    pub worker: ContractAddress,
    pub state: JobState,
    pub payment_amount: u256,
    pub created_at: u64,
    pub assigned_at: u64,
    pub completed_at: u64,
    pub result_hash: felt252
}

// Worker statistics
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct WorkerStats {
    pub total_jobs_completed: u64,
    pub success_rate: u8, // Percentage
    pub average_completion_time: u64,
    pub reputation_score: u256,
    pub total_earnings: u256
}

/// Main Job Manager Interface
#[starknet::interface]
pub trait IJobManager<TContractState> {
    /// Submit a new AI inference/training job
    fn submit_ai_job(
        ref self: TContractState,
        job_spec: JobSpec,
        payment: u256,
        client: ContractAddress
    ) -> JobId;

    /// Submit a new proof generation job  
    fn submit_prove_job(
        ref self: TContractState,
        prove_job_data: ProveJobData,
        payment: u256,
        client: ContractAddress
    ) -> JobId;

    /// Assign a job to a specific worker
    fn assign_job_to_worker(
        ref self: TContractState,
        job_id: JobId,
        worker_id: WorkerId
    );

    /// Submit job execution results
    fn submit_job_result(
        ref self: TContractState,
        job_id: JobId,
        result: JobResult
    );

    /// Distribute rewards after job completion and verification
    fn distribute_rewards(ref self: TContractState, job_id: JobId);

    /// Register a new model for job execution
    fn register_model(
        ref self: TContractState,
        model_hash: felt252,
        requirements: ModelRequirements,
        pricing: u256
    ) -> ModelId;

    /// Get detailed information about a job
    fn get_job_details(self: @TContractState, job_id: JobId) -> JobDetails;

    /// Get current state of a job
    fn get_job_state(self: @TContractState, job_id: JobId) -> JobState;

    /// Get worker statistics
    fn get_worker_stats(self: @TContractState, worker_id: WorkerId) -> WorkerStats;

    /// Admin: Update configuration parameters
    fn update_config(ref self: TContractState, config_key: felt252, config_value: felt252);

    /// Admin: Pause the contract
    fn pause(ref self: TContractState);

    /// Admin: Unpause the contract  
    fn unpause(ref self: TContractState);

    /// Admin: Emergency withdraw
    fn emergency_withdraw(ref self: TContractState, token: ContractAddress, amount: u256);

    /// Register a worker with their address
    fn register_worker(ref self: TContractState, worker_id: WorkerId, worker_address: ContractAddress);

    // Cairo 2.12.0: Gas Reserve Functions for Compute Job Optimization
    
    /// Estimate gas requirement for a job based on job specification
    fn estimate_job_gas_requirement(self: @TContractState, job_spec: JobSpec) -> u256;

    /// Reserve gas for job execution to prevent failures
    fn reserve_gas_for_job(ref self: TContractState, job_id: JobId, estimated_gas: u256);

    /// Optimize gas allocation based on worker efficiency
    fn optimize_worker_gas_allocation(
        self: @TContractState, 
        worker_id: WorkerId, 
        job_type: JobType
    ) -> u256;

    /// Update base gas cost for a specific model
    fn update_model_gas_cost(
        ref self: TContractState, 
        model_id: ModelId, 
        base_gas_cost: u256
    );

    /// Get gas efficiency metrics for a job (estimated, reserved, actual)
    fn get_job_gas_efficiency(self: @TContractState, job_id: JobId) -> (u256, u256, u256);
} 