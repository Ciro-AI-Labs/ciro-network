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

// Enhanced job types for dual-purpose network
#[derive(Drop, Serde, starknet::Store)]
#[allow(starknet::store_no_default_variant)]
pub enum JobType {
    // AI Computation Jobs
    AIInference,
    AITraining,
    AIFineTuning,
    ImageGeneration,
    VideoProcessing,
    Audio3DRendering,
    GameAssetRendering,
    
    // ZK Proof Generation Jobs (NEW)
    StarknetBatchProof,
    ZKMLProof,
    RecursiveProof,
    BatchVerification,
    CrossChainProof,
}

// Enhanced job priority system for dual workloads
#[derive(Drop, Serde, starknet::Store)]
#[allow(starknet::store_no_default_variant)]
pub enum JobPriority {
    Low,
    Medium,
    High,
    Critical,      // For time-sensitive ZK proofs
    Emergency,     // For network liveness requirements
}

// Job specifications enhanced for ZK proofs
#[derive(Drop, Serde)]
pub struct JobSpec {
    pub job_type: JobType,
    pub requirements: ModelRequirements,
    pub priority: JobPriority,
    pub sla_deadline: u64,           // Block timestamp deadline
    pub max_reward: u256,            // Maximum payment in USDC
    pub verification_method: VerificationMethod,
}

// Verification methods for different job types
#[derive(Drop, Serde, starknet::Store)]
#[allow(starknet::store_no_default_variant)]
pub enum VerificationMethod {
    StatisticalSampling,    // For AI jobs
    CryptographicProof,     // For ZK jobs
    RedundantCompute,       // Two workers validate
    TestSetValidation,      // For ML training
}

// Enhanced model requirements supporting ZK proving
#[derive(Drop, Serde)]
pub struct ModelRequirements {
    pub min_vram_gb: u32,
    pub min_compute_units: u64,
    pub required_frameworks: Array<felt252>,  // ['pytorch', 'stwo', 'circom']
    pub docker_image: felt252,
    pub estimated_duration: u64,
    pub bandwidth_requirements: u64,
}

// ZK Proof specific job data
#[derive(Drop, Serde, starknet::Store)]
pub struct ProveJobData {
    pub batch_hash: felt252,         // Starknet batch to prove
    pub public_input: felt252,       // Public input for verification
    pub circuit_type: CircuitType,   // Which proving system
    pub recursion_level: u8,         // For recursive proofs
    pub expected_proof_size: u32,    // Expected output size
}

#[derive(Drop, Serde, starknet::Store)]
#[allow(starknet::store_no_default_variant)]
pub enum CircuitType {
    Stark,
    Plonk,
    Groth16,
    FRI,
    Custom,
}

// Enhanced job results supporting proof outputs
#[derive(Drop, Serde)]
pub struct JobResult {
    pub job_id: JobId,
    pub worker_id: WorkerId,
    pub result_type: ResultType,
    pub output_data: Array<felt252>,    // Flexible output format
    pub proof_data: Option<ProofData>,  // ZK proof specific data
    pub completion_time: u64,
    pub verification_status: VerificationStatus,
}

#[derive(Drop, Serde, starknet::Store)]
#[allow(starknet::store_no_default_variant)]
pub enum ResultType {
    AIInferenceResult,
    TrainingCheckpoint,
    GeneratedAsset,
    ZKProof,                    // NEW: ZK proof output
    VerificationResult,
}

#[derive(Drop, Serde)]
pub struct ProofData {
    pub proof: Array<felt252>,          // The actual ZK proof
    pub public_outputs: Array<felt252>, // Public outputs for verification
    pub proof_metadata: felt252,        // Additional metadata
}

#[derive(Drop, Serde, starknet::Store)]
#[allow(starknet::store_no_default_variant)]
pub enum VerificationStatus {
    Pending,
    Verified,
    Failed,
    CryptographicallyValid,    // For ZK proofs
    StatisticallyValid,        // For AI results
}

// Enhanced job states for dual workloads
#[derive(Drop, Serde, starknet::Store)]
#[allow(starknet::store_no_default_variant)]
pub enum JobState {
    Queued,
    Assigned,
    Computing,
    AwaitingVerification,
    Completed,
    Failed,
    Disputed,
    EscalatedReward,          // For time-critical ZK jobs
}

// Enhanced interface supporting dual-purpose jobs
#[starknet::interface]
pub trait IJobManager<TContractState> {
    // Core job management (enhanced)
    fn submit_ai_job(
        ref self: TContractState,
        job_spec: JobSpec,
        payment: u256,
        client: ContractAddress
    ) -> JobId;
    
    // NEW: ZK proof job submission
    fn submit_prove_job(
        ref self: TContractState,
        prove_data: ProveJobData,
        reward: u256,
        sla_deadline: u64
    ) -> JobId;
    
    // Enhanced job assignment with priority queuing
    fn assign_job_to_worker(
        ref self: TContractState, 
        worker_id: WorkerId,
        preferred_job_type: JobType
    ) -> Option<JobId>;
    
    // Enhanced result submission with proof verification
    fn submit_job_result(
        ref self: TContractState,
        job_id: JobId,
        result: JobResult
    ) -> bool;
    
    // NEW: Cryptographic proof verification for ZK jobs
    fn verify_zk_proof(
        ref self: TContractState,
        job_id: JobId,
        proof_data: ProofData
    ) -> bool;
    
    // Enhanced reward distribution for dual workloads
    fn distribute_rewards(
        ref self: TContractState,
        job_id: JobId,
        burn_percentage: u8  // Flexible burn rate
    );
    
    // Real-time reward escalation for critical ZK jobs
    fn escalate_prove_job_reward(
        ref self: TContractState,
        job_id: JobId,
        additional_reward: u256
    );
    
    // Priority queue management
    fn get_next_job_by_priority(
        self: @TContractState,
        worker_capabilities: ModelRequirements
    ) -> Option<JobId>;
    
    // Enhanced analytics for dual markets
    fn get_market_metrics(
        self: @TContractState
    ) -> (u256, u256, u256, u256); // ai_volume, zk_volume, ai_workers, zk_workers
    
    // View functions
    fn get_job_details(self: @TContractState, job_id: JobId) -> JobSpec;
    fn get_job_state(self: @TContractState, job_id: JobId) -> JobState;
    fn get_worker_stats(self: @TContractState, worker_id: WorkerId) -> (u64, u64, u256);
} 