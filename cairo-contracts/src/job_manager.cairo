//! CIRO Network JobManager Contract
//! 
//! Main contract for managing job submissions, assignments, execution, and payments
//! in the CIRO Distributed Compute Layer. This contract coordinates with CDC Pool
//! and Paymaster contracts to provide a complete decentralized compute solution.

use starknet::{
    ContractAddress, get_caller_address, get_block_timestamp, contract_address_const,
    selector
};
use starknet::storage::{
    StoragePointerReadAccess, StoragePointerWriteAccess,
    StorageMapReadAccess, StorageMapWriteAccess,
    Map
};
use core::array::ArrayTrait;

// Core interface imports
use super::interfaces::job_manager::{
    IJobManager, JobId, ModelId, WorkerId, JobStatus, JobSpec, 
    JobResult, DisputeEvidence, ModelRequirements,
    JobSubmitted, JobAssigned, JobCompleted, PaymentReleased,
    DisputeOpened, DisputeResolved, ModelRegistered, ModelDeactivated, JobCancelled
};

// CDC Pool integration for worker tiers
use super::interfaces::cdc_pool::{ICDCPoolDispatcher, WorkerTier};

// Utility imports for symbiotic integration
use crate::utils::security::{
    AccessControlComponent, ReentrancyGuardComponent, PausableComponent,
    ADMIN_ROLE, COORDINATOR_ROLE
};
use crate::utils::types::{JobData, ResultAttestation, DisputeInfo};

/// Job allocation information with tier details
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct JobAllocationInfo {
    pub worker_tier: WorkerTier,
    pub allocation_score: u256,
    pub tier_bonus_applied: u8,
    pub assigned_at: u64,
}

use crate::utils::constants::{
    JOB_TIMEOUT, DISPUTE_PERIOD, PAGINATION_LIMIT
};

// ERC20 interface for payment handling
#[starknet::interface]
trait IERC20<TState> {
    fn transfer(ref self: TState, recipient: ContractAddress, amount: u256) -> bool;
    fn transfer_from(ref self: TState, sender: ContractAddress, recipient: ContractAddress, amount: u256) -> bool;
    fn balance_of(self: @TState, account: ContractAddress) -> u256;
    fn allowance(self: @TState, owner: ContractAddress, spender: ContractAddress) -> u256;
}

// Dispatcher for IERC20
#[derive(Copy, Drop, starknet::Store)]
struct IERC20Dispatcher {
    pub contract_address: ContractAddress,
}

trait IERC20DispatcherTrait {
    fn transfer(self: IERC20Dispatcher, recipient: ContractAddress, amount: u256) -> bool;
    fn transfer_from(self: IERC20Dispatcher, sender: ContractAddress, recipient: ContractAddress, amount: u256) -> bool;
    fn balance_of(self: IERC20Dispatcher, account: ContractAddress) -> u256;
    fn allowance(self: IERC20Dispatcher, owner: ContractAddress, spender: ContractAddress) -> u256;
}

impl IERC20DispatcherImpl of IERC20DispatcherTrait {
    fn transfer(self: IERC20Dispatcher, recipient: ContractAddress, amount: u256) -> bool {
        let mut calldata = array![];
        calldata.append(recipient.into());
        calldata.append(amount.low.into());
        calldata.append(amount.high.into());
        
        let mut res = starknet::call_contract_syscall(
            self.contract_address, selector!("transfer"), calldata.span()
        ).unwrap();
        
        Serde::<bool>::deserialize(ref res).unwrap()
    }
    
    fn transfer_from(self: IERC20Dispatcher, sender: ContractAddress, recipient: ContractAddress, amount: u256) -> bool {
        let mut calldata = array![];
        calldata.append(sender.into());
        calldata.append(recipient.into());
        calldata.append(amount.low.into());
        calldata.append(amount.high.into());
        
        let mut res = starknet::call_contract_syscall(
            self.contract_address, selector!("transfer_from"), calldata.span()
        ).unwrap();
        
        Serde::<bool>::deserialize(ref res).unwrap()
    }
    
    fn balance_of(self: IERC20Dispatcher, account: ContractAddress) -> u256 {
        let mut calldata = array![];
        calldata.append(account.into());
        
        let mut res = starknet::call_contract_syscall(
            self.contract_address, selector!("balance_of"), calldata.span()
        ).unwrap();
        
        Serde::<u256>::deserialize(ref res).unwrap()
    }
    
    fn allowance(self: IERC20Dispatcher, owner: ContractAddress, spender: ContractAddress) -> u256 {
        let mut calldata = array![];
        calldata.append(owner.into());
        calldata.append(spender.into());
        
        let mut res = starknet::call_contract_syscall(
            self.contract_address, selector!("allowance"), calldata.span()
        ).unwrap();
        
        Serde::<u256>::deserialize(ref res).unwrap()
    }
}

#[starknet::contract]
mod JobManagerContract {
    use super::*;
    
    // Component integration for symbiotic architecture
    component!(path: AccessControlComponent, storage: access_control, event: AccessControlEvent);
    component!(path: ReentrancyGuardComponent, storage: reentrancy_guard, event: ReentrancyEvent);
    component!(path: PausableComponent, storage: pausable, event: PausableEvent);
    
    // Component implementations
    #[abi(embed_v0)]
    impl AccessControlImpl = AccessControlComponent::AccessControlImpl<ContractState>;
    #[abi(embed_v0)]
    impl ReentrancyGuardImpl = ReentrancyGuardComponent::ReentrancyGuardImpl<ContractState>;
    #[abi(embed_v0)]
    impl PausableImpl = PausableComponent::PausableImpl<ContractState>;
    
    impl AccessControlInternalImpl = AccessControlComponent::InternalImpl<ContractState>;
    impl ReentrancyInternalImpl = ReentrancyGuardComponent::InternalImpl<ContractState>;
    impl PausableInternalImpl = PausableComponent::InternalImpl<ContractState>;

    #[storage]
    #[allow(starknet::invalid_storage_member_types)]
    struct Storage {
        // Component storage
        #[substorage(v0)]
        access_control: AccessControlComponent::Storage,
        #[substorage(v0)]
        reentrancy_guard: ReentrancyGuardComponent::Storage,
        #[substorage(v0)]
        pausable: PausableComponent::Storage,
        
        // Configuration parameters
        payment_token: ContractAddress,
        treasury: ContractAddress,
        cdc_pool_contract: ContractAddress,
        platform_fee_bps: u16,
        min_job_payment: u256,
        max_job_duration: u64,
        dispute_fee: u256,
        min_allocation_score: u256,
        
        // Counters and state
        next_job_id: u256,
        next_model_id: felt252,
        jobs: Map<u256, JobData>,
        job_results: Map<u256, ResultAttestation>,
        job_disputes: Map<u256, DisputeInfo>,
        job_allocations: Map<u256, JobAllocationInfo>,
        
        // Model registry
        models: Map<felt252, ModelRequirements>,
        model_owners: Map<felt252, ContractAddress>,
        model_active: Map<felt252, bool>,
        model_hashes: Map<felt252, felt252>,
        model_pricing: Map<felt252, u256>,
        
        // Indexing for efficient queries
        jobs_by_client: Map<ContractAddress, Vec<u256>>,
        jobs_by_worker: Map<felt252, Vec<u256>>,
        jobs_by_status: Map<u8, Vec<u256>>,
        models_by_owner: Map<ContractAddress, Vec<felt252>>,
        
        // Configuration
        // platform_fee_bps: u16,        // Fee in basis points (100 = 1%)
        // min_job_payment: u256,
        // max_job_duration: u64,
        // dispute_fee: u256,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        AccessControlEvent: AccessControlComponent::Event,
        #[flat]
        ReentrancyEvent: ReentrancyGuardComponent::Event,
        #[flat]
        PausableEvent: PausableComponent::Event,
        
        // Job lifecycle events
        JobSubmitted: JobSubmitted,
        JobAssigned: JobAssigned,
        JobCompleted: JobCompleted,
        PaymentReleased: PaymentReleased,
        JobCancelled: JobCancelled,
        
        // Model registry events
        ModelRegistered: ModelRegistered,
        ModelDeactivated: ModelDeactivated,
        
        // Dispute events
        DisputeOpened: DisputeOpened,
        DisputeResolved: DisputeResolved,
        
        // Configuration events
        ConfigUpdated: ConfigUpdated,
        ContractUpgraded: ContractUpgraded,
    }
    
    #[derive(Drop, starknet::Event)]
    struct ConfigUpdated {
        pub config_key: felt252,
        pub old_value: felt252,
        pub new_value: felt252,
        pub updated_by: ContractAddress,
    }
    
    #[derive(Drop, starknet::Event)]
    struct ContractUpgraded {
        pub old_implementation: ContractAddress,
        pub new_implementation: ContractAddress,
        pub upgraded_by: ContractAddress,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        admin: ContractAddress,
        payment_token: ContractAddress,
        treasury: ContractAddress,
        cdc_pool_contract: ContractAddress,
        platform_fee_bps: u16
    ) {
        // Initialize security components
        AccessControlInternalImpl::initializer(ref self, admin);
        
        // Set initial configuration
        self.payment_token.write(payment_token);
        self.treasury.write(treasury);
        self.cdc_pool_contract.write(cdc_pool_contract);
        self.platform_fee_bps.write(platform_fee_bps);
        
        // Initialize counters
        self.next_job_id.write(1);
        self.next_model_id.write(1);
        
        // Set default values
        self.min_job_payment.write(1000000000000000); // 0.001 tokens minimum
        self.max_job_duration.write(JOB_TIMEOUT);
        self.dispute_fee.write(100000000000000000); // 0.1 tokens dispute fee
        self.min_allocation_score.write(100); // Minimum allocation score (base tier gets 100)
    }

    #[abi(embed_v0)]
    impl JobManagerImpl of IJobManager<ContractState> {
        /// Submit a new job to the network
        fn submit_job(ref self: ContractState, job_spec: JobSpec) -> JobId {
            // Security checks
            PausableInternalImpl::assert_not_paused(@self);
            ReentrancyInternalImpl::start(ref self);
            
            let caller = get_caller_address();
            let current_time = get_block_timestamp();
            let job_id = JobId { value: self.next_job_id.read( });
            
            // Validate job specification
            self._validate_job_spec(@job_spec, current_time);
            
            // Check model exists and is active
            assert(self.model_active.read(job_spec.model_id.value), 'Model not active');
            
            // Handle payment escrow
            self._handle_job_payment(@job_spec, caller);
            
            // Create job record
            let job_data = JobData {
                requester: caller,
                model_id: job_spec.model_id.value,
                input_data_hash: job_spec.input_data_hash,
                status: JobStatus::Pending.into(),
                priority: self._calculate_job_priority(@job_spec),
                worker_id: 0,
                result_hash: 0,
                payment_amount: job_spec.payment_amount,
                created_at: current_time,
                updated_at: current_time,
                timeout_at: current_time + self.max_job_duration.read(),
            };
            
            // Store job data
            self.jobs.write(job_id.value, job_data);
            
            // Update indices for efficient querying
            self._add_to_client_jobs(caller, job_id.value);
            self._add_to_status_jobs(JobStatus::Pending.into(), job_id.value);
            
            // Increment job counter
            self.next_job_id.write(job_id.value + 1);
            
            // Emit event
            self.emit(JobSubmitted {
                job_id,
                client: caller,
                model_id: job_spec.model_id,
                payment_amount: job_spec.payment_amount,
                deadline: job_data.timeout_at,
            });
            
            ReentrancyInternalImpl::end(ref self);
            job_id
        }

        /// Assign a job to a specific worker
        fn assign_job(
            ref self: ContractState, 
            job_id: JobId, 
            worker_id: WorkerId,
            estimated_completion: u64
        ) {
            // Security checks
            PausableInternalImpl::assert_not_paused(@self);
            ReentrancyInternalImpl::start(ref self);
            AccessControlInternalImpl::assert_only_role(@self, COORDINATOR_ROLE);
            
            let current_time = get_block_timestamp();
            let mut job_data = self.jobs.read(job_id.value);
            
            // Validate job can be assigned
            assert(job_data.requester.is_non_zero(), 'Job does not exist');
            assert(job_data.status == JobStatus::Pending.into(), 'Job not pending');
            assert(current_time <= job_data.timeout_at, 'Job expired');
            
            // Get job requirements and verify worker capabilities via CDC Pool
            let job_requirements = self.models.read(job_data.model_id);
            let cdc_pool = ICDCPoolDispatcher { contract_address: self.cdc_pool_contract.read() };
            let worker_data = self.workers.read(worker_id.value);
            let worker_tier = cdc_pool.get_worker_tier(worker_data.owner);
            let allocation_score = cdc_pool.get_tier_allocation_score(worker_data.owner, job_data.requirements);
            
            // Validate allocation score meets minimum requirement
            assert(allocation_score >= self.min_allocation_score.read(), 'Allocation score too low');
            
            // Update job with assignment information
            job_data.assigned_to = worker_id;
            job_data.assigned_at = current_time;
            job_data.estimated_completion = estimated_completion;
            job_data.status = JobStatus::Assigned.into();
            
            // Create allocation info
            let allocation_info = JobAllocationInfo {
                worker_tier: worker_tier,
                allocation_score: allocation_score,
                tier_bonus_applied: 0, // Will be set during payment
                assigned_at: current_time,
            };
            
            self.jobs.write(job_id.value, job_data);
            self.job_allocations.write(job_id.value, allocation_info);
            
            // Emit event with tier information
            self.emit(JobAssigned {
                job_id: job_id,
                worker_id: worker_id,
                estimated_completion: estimated_completion,
                worker_tier: worker_tier,
                allocation_score: allocation_score,
            });
            
            ReentrancyInternalImpl::end(ref self);
        }

        /// Submit computation result for a job
        fn submit_result(ref self: ContractState, job_id: JobId, result: JobResult) {
            // Security checks
            PausableInternalImpl::assert_not_paused(@self);
            ReentrancyInternalImpl::start(ref self);
            
            let caller = get_caller_address();
            let current_time = get_block_timestamp();
            let mut job_data = self.jobs.read(job_id.value);
            
            // Validate submission
            assert(job_data.requester.is_non_zero(), 'Job does not exist');
            assert(job_data.status == JobStatus::Assigned.into() || 
                   job_data.status == JobStatus::InProgress.into(), 'Invalid job status');
            
            // Verify caller is assigned worker or has worker role
            let has_worker_role = AccessControlInternalImpl::has_role(@self, caller, WORKER_ROLE);
            assert(job_data.worker_id != 0 || has_worker_role, 'Not authorized worker');
            
            // Validate result signature (basic check for now)
            assert(result.result_hash != 0, 'Invalid result hash');
            assert(result.worker_signature.len() > 0, 'Missing signature');
            
            // Update job status
            job_data.status = JobStatus::Completed.into();
            job_data.result_hash = result.result_hash;
            job_data.updated_at = current_time;
            
            self.jobs.write(job_id.value, job_data);
            
            // Store result attestation
            let attestation = ResultAttestation {
                job_id: job_id.value.try_into().unwrap(),
                result_hash: result.result_hash,
                worker_id: job_data.worker_id,
                timestamp: current_time,
                signature_r: *result.worker_signature.at(0),
                signature_s: *result.worker_signature.at(1),
                verification_status: 0, // Pending verification
            };
            
            self.job_results.write(job_id.value, attestation);
            
            // Update indices
            self._remove_from_status_jobs(JobStatus::Assigned.into(), job_id.value);
            self._add_to_status_jobs(JobStatus::Completed.into(), job_id.value);
            
            // Emit event
            self.emit(JobCompleted {
                job_id,
                worker_id: WorkerId { value: job_data.worker_id },
                result_hash: result.result_hash,
                completion_time: current_time,
                quality_score: result.quality_score,
            });
            
            ReentrancyInternalImpl::end(ref self);
        }

        /// Verify and accept a job result
        fn verify_result(ref self: ContractState, job_id: JobId, verification_data: Array<felt252>) {
            // Security checks
            PausableInternalImpl::assert_not_paused(@self);
            ReentrancyInternalImpl::start(ref self);
            
            let caller = get_caller_address();
            let job_data = self.jobs.read(job_id.value);
            
            // Only job requester or admin can verify
            assert(
                caller == job_data.requester || 
                AccessControlInternalImpl::has_role(@self, caller, ADMIN_ROLE),
                'Not authorized to verify'
            );
            
            assert(job_data.status == JobStatus::Completed.into(), 'Job not completed');
            
            // Update attestation status
            let mut attestation = self.job_results.read(job_id.value);
            attestation.verification_status = 1; // Verified
            self.job_results.write(job_id.value, attestation);
            
            // Job is now ready for payment release
            // This could trigger automatic payment or wait for explicit release
            
            ReentrancyInternalImpl::end(ref self);
        }

        /// Release payment for a completed job
        fn release_payment(ref self: ContractState, job_id: JobId) {
            // Security checks
            PausableInternalImpl::assert_not_paused(@self);
            ReentrancyInternalImpl::start(ref self);
            
            let caller = get_caller_address();
            let current_time = get_block_timestamp();
            let mut job_data = self.jobs.read(job_id.value);
            
            // Validate payment release
            assert(job_data.requester.is_non_zero(), 'Job does not exist');
            assert(job_data.status == JobStatus::Completed.into(), 'Job not completed');
            
            // Check if verification period has passed or result is verified
            let attestation = self.job_results.read(job_id.value);
            let verification_passed = attestation.verification_status == 1 ||
                                    (current_time > attestation.timestamp + DISPUTE_PERIOD);
            
            assert(verification_passed, 'Verification period not complete');
            
            // Only requester, admin, or automatic system can release payment
            assert(
                caller == job_data.requester || 
                AccessControlInternalImpl::has_role(@self, caller, ADMIN_ROLE) ||
                AccessControlInternalImpl::has_role(@self, caller, COORDINATOR_ROLE),
                'Not authorized to release payment'
            );
            
            // Calculate tier-based payment
            let allocation_info = self.job_allocations.read(job_id.value);
            let tier_benefits = self._get_tier_benefits(allocation_info.worker_tier);
            
            // Apply tier-based performance bonus
            let tier_bonus = (job_data.payment_amount * tier_benefits.performance_bonus_bps) / 10000;
            let total_payment = job_data.payment_amount + tier_bonus;
            
            // Platform fee calculation (with potential tier discounts)
            let platform_fee = (total_payment * self.platform_fee_bps.read().into()) / 10000;
            let worker_payment = total_payment - platform_fee;
            
            // Update job status
            job_data.status = JobStatus::Paid.into();
            job_data.paid_at = current_time;
            self.jobs.write(job_id.value, job_data);
            
            // Transfer payment
            let payment_token = IERC20Dispatcher { contract_address: self.payment_token.read() };
            let worker_data = self.workers.read(job_data.assigned_to.value);
            payment_token.transfer(worker_data.owner, worker_payment);
            
            // Transfer platform fee to treasury
            if platform_fee > 0 {
                payment_token.transfer(self.treasury.read(), platform_fee);
            }
            
            // Emit payment event with tier information
            self.emit(PaymentReleased {
                job_id: job_id,
                worker_id: job_data.assigned_to,
                client: job_data.requester,
                amount: worker_payment,
                tier_bonus: tier_bonus,
                worker_tier: allocation_info.worker_tier,
            });
            
            self.reentrancy_guard.end();
        }

        /// Cancel a job (only by client or admin)
        fn cancel_job(ref self: ContractState, job_id: JobId, reason: felt252) {
            // Security checks
            self.pausable.assert_not_paused();
            self.reentrancy_guard.start();
            
            let caller = get_caller_address();
            let current_time = get_block_timestamp();
            let mut job_data = self.jobs.read(job_id.value);
            
            // Validate cancellation
            assert(job_data.requester.is_non_zero(), 'Job does not exist');
            assert(
                job_data.status == JobStatus::Pending.into() || 
                job_data.status == JobStatus::Assigned.into(),
                'Cannot cancel job in current status'
            );
            
            // Only requester or admin can cancel
            assert(
                caller == job_data.requester || 
                self.access_control.has_role(caller, ADMIN_ROLE),
                'Not authorized to cancel'
            );
            
            // Refund payment to requester
            let token = IERC20Dispatcher { contract_address: self.payment_token.read() };
            token.transfer(job_data.requester, job_data.payment_amount);
            
            // Update job status
            let old_status = job_data.status;
            job_data.status = JobStatus::Cancelled.into();
            job_data.updated_at = current_time;
            self.jobs.write(job_id.value, job_data);
            
            // Update indices
            self._remove_from_status_jobs(old_status, job_id.value);
            self._add_to_status_jobs(JobStatus::Cancelled.into(), job_id.value);
            
            if job_data.worker_id != 0 {
                self._remove_from_worker_jobs(job_data.worker_id, job_id.value);
            }
            
            // Emit event
            self.emit(JobCancelled {
                job_id,
                client: job_data.requester,
                reason,
            });
            
            self.reentrancy_guard.end();
        }

        // ... Additional interface methods will be implemented in subsequent parts
        // This includes model registry, dispute resolution, and query functions

        /// Register a new computation model
        fn register_model(
            ref self: ContractState,
            model_hash: felt252,
            requirements: ModelRequirements,
            pricing: u256
        ) -> ModelId {
            // Security checks
            self.pausable.assert_not_paused();
            self.reentrancy_guard.start();
            
            let caller = get_caller_address();
            let model_id = ModelId { value: self.next_model_id.read( });
            
            // Validate model registration
            assert(model_hash != 0, 'Invalid model hash');
            assert(requirements.min_gpu_memory > 0 || requirements.min_cpu_cores > 0, 'Invalid requirements');
            assert(pricing >= self.min_job_payment.read(), 'Pricing too low');
            
            // Store model data
            self.models.write(model_id.value, requirements);
            self.model_owners.write(model_id.value, caller);
            self.model_active.write(model_id.value, true);
            self.model_hashes.write(model_id.value, model_hash);
            self.model_pricing.write(model_id.value, pricing);
            
            // Update owner index
            self._add_to_owner_models(caller, model_id.value);
            
            // Increment model counter
            self.next_model_id.write(model_id.value + 1);
            
            // Emit event
            self.emit(ModelRegistered {
                model_id,
                owner: caller,
                model_hash,
                suggested_price: pricing,
            });
            
            self.reentrancy_guard.end();
            model_id
        }

        /// Update model requirements (only by model owner or admin)
        fn update_model_requirements(
            ref self: ContractState,
            model_id: ModelId,
            new_requirements: ModelRequirements
        ) {
            // Security checks
            self.pausable.assert_not_paused();
            self.reentrancy_guard.start();
            
            let caller = get_caller_address();
            let owner = self.model_owners.read(model_id.value);
            
            // Only owner or admin can update
            assert(
                caller == owner || 
                self.access_control.has_role(caller, ADMIN_ROLE),
                'Not authorized to update model'
            );
            
            assert(self.model_active.read(model_id.value), 'Model not active');
            
            // Update requirements
            self.models.write(model_id.value, new_requirements);
            
            self.reentrancy_guard.end();
        }

        /// Deactivate a model (only by model owner or admin)
        fn deactivate_model(ref self: ContractState, model_id: ModelId) {
            // Security checks
            self.pausable.assert_not_paused();
            self.reentrancy_guard.start();
            
            let caller = get_caller_address();
            let owner = self.model_owners.read(model_id.value);
            
            // Only owner or admin can deactivate
            assert(
                caller == owner || 
                self.access_control.has_role(caller, ADMIN_ROLE),
                'Not authorized to deactivate model'
            );
            
            assert(self.model_active.read(model_id.value), 'Model already inactive');
            
            // Deactivate model
            self.model_active.write(model_id.value, false);
            
            // Emit event
            self.emit(ModelDeactivated {
                model_id,
                owner,
            });
            
            self.reentrancy_guard.end();
        }

        /// Open a dispute for a job result
        fn open_dispute(ref self: ContractState, job_id: JobId, evidence: DisputeEvidence) {
            // Security checks
            self.pausable.assert_not_paused();
            self.reentrancy_guard.start();
            
            let caller = get_caller_address();
            let current_time = get_block_timestamp();
            let mut job_data = self.jobs.read(job_id.value);
            
            // Validate dispute
            assert(job_data.requester.is_non_zero(), 'Job does not exist');
            assert(job_data.status == JobStatus::Completed.into(), 'Job not completed');
            assert(!self.job_disputes.read(job_id.value).initiator.is_non_zero(), 'Dispute already exists');
            
            // Only job requester can open dispute
            assert(caller == job_data.requester, 'Not authorized to dispute');
            
            // Check dispute period
            let attestation = self.job_results.read(job_id.value);
            assert(current_time <= attestation.timestamp + DISPUTE_PERIOD, 'Dispute period expired');
            
            // Collect dispute fee
            let token = IERC20Dispatcher { contract_address: self.payment_token.read() };
            token.transfer_from(caller, starknet::get_contract_address(), self.dispute_fee.read());
            
            // Create dispute record
            let dispute = DisputeInfo {
                job_id: job_id.value.try_into().unwrap(),
                initiator: caller,
                disputed_party: self._get_worker_address(job_data.worker_id),
                dispute_type: 1, // Result dispute
                evidence_hash: evidence.evidence_hash,
                created_at: current_time,
                resolved_at: 0,
                resolution: 0, // Pending
                arbitrator: contract_address_const::<0>(),
            };
            
            self.job_disputes.write(job_id.value, dispute);
            
            // Update job status
            job_data.status = JobStatus::Disputed.into();
            job_data.updated_at = current_time;
            self.jobs.write(job_id.value, job_data);
            
            // Update indices
            self._remove_from_status_jobs(JobStatus::Completed.into(), job_id.value);
            self._add_to_status_jobs(JobStatus::Disputed.into(), job_id.value);
            
            // Emit event
            self.emit(DisputeOpened {
                job_id,
                disputant: caller,
                evidence_hash: evidence.evidence_hash,
            });
            
            self.reentrancy_guard.end();
        }

        /// Submit additional evidence for an existing dispute
        fn submit_dispute_evidence(ref self: ContractState, job_id: JobId, evidence: DisputeEvidence) {
            // Security checks
            self.pausable.assert_not_paused();
            self.reentrancy_guard.start();
            
            let caller = get_caller_address();
            let dispute = self.job_disputes.read(job_id.value);
            
            // Validate evidence submission
            assert(dispute.initiator.is_non_zero(), 'No dispute exists');
            assert(dispute.resolved_at == 0, 'Dispute already resolved');
            assert(
                caller == dispute.initiator || 
                caller == dispute.disputed_party ||
                self.access_control.has_role(caller, ADMIN_ROLE),
                'Not authorized to submit evidence'
            );
            
            // Evidence submission logic would be implemented here
            // For now, we'll just emit an event
            
            self.reentrancy_guard.end();
        }

        /// Resolve a dispute (only by authorized resolvers)
        fn resolve_dispute(
            ref self: ContractState,
            job_id: JobId,
            resolution: JobStatus,
            penalty_amount: u256
        ) {
            // Security checks
            self.pausable.assert_not_paused();
            self.reentrancy_guard.start();
            self.access_control.assert_only_role(ADMIN_ROLE);
            
            let current_time = get_block_timestamp();
            let mut dispute = self.job_disputes.read(job_id.value);
            let mut job_data = self.jobs.read(job_id.value);
            
            // Validate resolution
            assert(dispute.initiator.is_non_zero(), 'No dispute exists');
            assert(dispute.resolved_at == 0, 'Dispute already resolved');
            assert(job_data.status == JobStatus::Disputed.into(), 'Job not in dispute');
            
            // Resolve dispute
            dispute.resolved_at = current_time;
            dispute.resolution = match resolution {
                JobStatus::Completed => 2, // Favor disputed party (worker)
                JobStatus::Cancelled => 1, // Favor initiator (client)
                _ => 0, // Invalid resolution
            };
            dispute.arbitrator = get_caller_address();
            
            self.job_disputes.write(job_id.value, dispute);
            
            // Update job status based on resolution
            job_data.status = resolution.into();
            job_data.updated_at = current_time;
            self.jobs.write(job_id.value, job_data);
            
            // Handle penalties and refunds based on resolution
            let token = IERC20Dispatcher { contract_address: self.payment_token.read() };
            
            if resolution == JobStatus::Completed {
                // Worker wins - release payment and refund dispute fee to client
                self._release_job_payment(job_id.value);
                token.transfer(dispute.initiator, self.dispute_fee.read());
            } else if resolution == JobStatus::Cancelled {
                // Client wins - refund job payment and forfeit dispute fee
                token.transfer(job_data.requester, job_data.payment_amount);
                // Dispute fee goes to treasury
                token.transfer(self.treasury.read(), self.dispute_fee.read());
            }
            
            // Update indices
            self._remove_from_status_jobs(JobStatus::Disputed.into(), job_id.value);
            self._add_to_status_jobs(resolution.into(), job_id.value);
            
            // Emit event
            self.emit(DisputeResolved {
                job_id,
                resolution,
                penalty_amount,
            });
            
            self.reentrancy_guard.end();
        }

        /// Get job details by ID
        fn get_job_details(
            self: @ContractState,
            job_id: JobId
        ) -> (JobSpec, JobStatus, Option<WorkerId>) {
            let job_data = self.jobs.read(job_id.value);
            assert(job_data.requester.is_non_zero(), 'Job does not exist');
            
            let job_spec = JobSpec {
                model_id: ModelId { value: job_data.model_id },
                input_data_hash: job_data.input_data_hash,
                payment_amount: job_data.payment_amount,
                deadline: job_data.timeout_at,
                client: job_data.requester,
                requirements: self.models.read(job_data.model_id),
            };
            
            let status = self._u8_to_job_status(job_data.status);
            let worker = if job_data.worker_id != 0 {
                Option::Some(WorkerId { value: job_data.worker_id })
            } else {
                Option::None
            };
            
            (job_spec, status, worker)
        }

        /// Get job result by ID
        fn get_job_result(self: @ContractState, job_id: JobId) -> Option<JobResult> {
            let job_data = self.jobs.read(job_id.value);
            if job_data.result_hash == 0 {
                return Option::None;
            }
            
            let attestation = self.job_results.read(job_id.value);
            let result = JobResult {
                result_hash: job_data.result_hash,
                worker_signature: array![attestation.signature_r, attestation.signature_s],
                completion_time: attestation.timestamp,
                gas_used: 0, // Would be calculated based on actual execution
                quality_score: 100, // Would be determined by verification process
            };
            
            Option::Some(result)
        }

        /// Get model details by ID
        fn get_model_details(
            self: @ContractState,
            model_id: ModelId
        ) -> (felt252, ModelRequirements, bool) {
            let model_hash = self.model_hashes.read(model_id.value);
            let requirements = self.models.read(model_id.value);
            let is_active = self.model_active.read(model_id.value);
            
            (model_hash, requirements, is_active)
        }

        /// Get jobs by client address
        fn get_jobs_by_client(
            self: @ContractState,
            client: ContractAddress,
            offset: u32,
            limit: u32
        ) -> Array<JobId> {
            let jobs_vec = self.jobs_by_client.read(client);
            let mut result = ArrayTrait::new();
            let max_limit = if limit > PAGINATION_LIMIT { PAGINATION_LIMIT } else { limit };
            
            let mut i = offset;
            let end = offset + max_limit;
            let jobs_len = jobs_vec.len();
            
            while i < end && i < jobs_len {
                result.append(JobId { value: jobs_vec.get(i).unwrap() });
                i += 1;
            };
            
            result
        }

        /// Get jobs by worker ID
        fn get_jobs_by_worker(
            self: @ContractState,
            worker_id: WorkerId,
            offset: u32,
            limit: u32
        ) -> Array<JobId> {
            let jobs_vec = self.jobs_by_worker.read(worker_id.value);
            let mut result = ArrayTrait::new();
            let max_limit = if limit > PAGINATION_LIMIT { PAGINATION_LIMIT } else { limit };
            
            let mut i = offset;
            let end = offset + max_limit;
            let jobs_len = jobs_vec.len();
            
            while i < end && i < jobs_len {
                result.append(JobId { value: jobs_vec.get(i).unwrap() });
                i += 1;
            };
            
            result
        }

        /// Get pending jobs matching specific requirements
        fn get_pending_jobs(
            self: @ContractState,
            requirements: ModelRequirements,
            max_results: u32
        ) -> Array<JobId> {
            let pending_jobs = self.jobs_by_status.read(JobStatus::Pending.into());
            let mut result = ArrayTrait::new();
            let limit = if max_results > PAGINATION_LIMIT { PAGINATION_LIMIT } else { max_results };
            
            let mut i = 0;
            let mut found = 0;
            let jobs_len = pending_jobs.len();
            
            while i < jobs_len && found < limit {
                let job_id = pending_jobs.get(i).unwrap();
                let job_data = self.jobs.read(job_id);
                let job_requirements = self.models.read(job_data.model_id);
                
                // Check if worker capabilities match job requirements
                if self._requirements_match(@requirements, @job_requirements) {
                    result.append(JobId { value: job_id });
                    found += 1;
                }
                i += 1;
            };
            
            result
        }

    }

    // =================== ADMIN FUNCTIONS ===================

    #[generate_trait]
    impl AdminFunctions of AdminFunctionsTrait {
        /// Update contract configuration (only admin)
        fn update_config(ref self: ContractState, config_key: felt252, config_value: felt252) {
            self.pausable.assert_not_paused();
            self.access_control.assert_only_role(ADMIN_ROLE);
            
            let caller = get_caller_address();
            let old_value = self._get_config_value(config_key);
            
            // Update configuration based on key
            self._set_config_value(config_key, config_value);
            
            // Emit event
            self.emit(ConfigUpdated {
                config_key,
                old_value,
                new_value: config_value,
                updated_by: caller,
            });
        }

        /// Pause contract operations (only admin)
        fn pause_contract(ref self: ContractState) {
            self.access_control.assert_only_role(ADMIN_ROLE);
            self.pausable.pause();
        }

        /// Resume contract operations (only admin)
        fn resume_contract(ref self: ContractState) {
            self.access_control.assert_only_role(ADMIN_ROLE);
            self.pausable.unpause();
        }

        /// Emergency withdrawal (only admin, when paused)
        fn emergency_withdraw(ref self: ContractState, token: ContractAddress, amount: u256) {
            self.access_control.assert_only_role(ADMIN_ROLE);
            self.pausable.assert_paused();
            
            let treasury = self.treasury.read();
            
            if token.is_zero() {
                // Withdraw ETH (if any)
                // Note: ETH withdrawal would need platform-specific implementation
            } else {
                // Withdraw ERC20 tokens
                let token_contract = IERC20Dispatcher { contract_address: token };
                token_contract.transfer(treasury, amount);
            }
        }
    }

    // =================== INTERNAL HELPER FUNCTIONS ===================

    #[generate_trait]
    impl InternalFunctions of InternalFunctionsTrait {
        /// Validate job specification
        fn _validate_job_spec(self: @ContractState, job_spec: @JobSpec, current_time: u64) {
            assert!(job_spec.payment_amount >= self.min_job_payment.read(), 'Payment too low');
            assert!(job_spec.deadline > current_time, 'Invalid deadline');
            assert!(job_spec.input_data_hash != 0, 'Invalid input hash');
        }

        /// Handle job payment escrow
        fn _handle_job_payment(ref self: ContractState, job_spec: @JobSpec, caller: ContractAddress) {
            let token = IERC20Dispatcher { contract_address: self.payment_token.read() };
            let contract_address = starknet::get_contract_address();
            
            // Transfer payment to escrow
            token.transfer_from(caller, contract_address, *job_spec.payment_amount);
        }

        /// Calculate job priority based on payment and deadline
        fn _calculate_job_priority(self: @ContractState, job_spec: @JobSpec) -> u8 {
            let base_payment = self.min_job_payment.read();
            let payment_ratio = *job_spec.payment_amount / base_payment;
            
            if payment_ratio >= 10 {
                return 4; // Urgent
            } else if payment_ratio >= 5 {
                return 3; // High
            } else if payment_ratio >= 2 {
                return 2; // Normal
            } else {
                return 1; // Low
            }
        }

        /// Add job to client index
        fn _add_to_client_jobs(ref self: ContractState, client: ContractAddress, job_id: u256) {
            let mut jobs_vec = self.jobs_by_client.read(client);
            jobs_vec.append().write(job_id);
            self.jobs_by_client.write(client, jobs_vec);
        }

        /// Add job to status index
        fn _add_to_status_jobs(ref self: ContractState, status: u8, job_id: u256) {
            let mut jobs_vec = self.jobs_by_status.read(status);
            jobs_vec.append().write(job_id);
            self.jobs_by_status.write(status, jobs_vec);
        }

        /// Remove job from status index
        fn _remove_from_status_jobs(ref self: ContractState, status: u8, job_id: u256) {
            let mut jobs_vec = self.jobs_by_status.read(status);
            let mut i = 0;
            let len = jobs_vec.len();
            
            while i < len {
                if jobs_vec.get(i).unwrap() == job_id {
                    // Swap with last element and remove
                    let last_job = jobs_vec.get(len - 1).unwrap();
                    jobs_vec.set(i, last_job);
                    jobs_vec.pop_front();
                    break;
                }
                i += 1;
            };
            
            self.jobs_by_status.write(status, jobs_vec);
        }

        /// Add job to worker index
        fn _add_to_worker_jobs(ref self: ContractState, worker_id: felt252, job_id: u256) {
            let mut jobs_vec = self.jobs_by_worker.read(worker_id);
            jobs_vec.append().write(job_id);
            self.jobs_by_worker.write(worker_id, jobs_vec);
        }

        /// Remove job from worker index
        fn _remove_from_worker_jobs(ref self: ContractState, worker_id: felt252, job_id: u256) {
            let mut jobs_vec = self.jobs_by_worker.read(worker_id);
            let mut i = 0;
            let len = jobs_vec.len();
            
            while i < len {
                if jobs_vec.get(i).unwrap() == job_id {
                    let last_job = jobs_vec.get(len - 1).unwrap();
                    jobs_vec.set(i, last_job);
                    jobs_vec.pop_front();
                    break;
                }
                i += 1;
            };
            
            self.jobs_by_worker.write(worker_id, jobs_vec);
        }

        /// Add model to owner index
        fn _add_to_owner_models(ref self: ContractState, owner: ContractAddress, model_id: felt252) {
            let mut models_vec = self.models_by_owner.read(owner);
            models_vec.append().write(model_id);
            self.models_by_owner.write(owner, models_vec);
        }

        /// Get worker address by ID (would interface with CDC Pool)
        fn _get_worker_address(self: @ContractState, worker_id: felt252) -> ContractAddress {
            // This would interface with the CDC Pool contract to get worker address
            // For now, we'll return a placeholder
            contract_address_const::<0x1234>()
        }

        /// Check if worker requirements match job requirements
        fn _requirements_match(
            self: @ContractState, 
            worker_reqs: @ModelRequirements, 
            job_reqs: @ModelRequirements
        ) -> bool {
            *worker_reqs.min_gpu_memory >= *job_reqs.min_gpu_memory &&
            *worker_reqs.min_cpu_cores >= *job_reqs.min_cpu_cores &&
            *worker_reqs.min_ram >= *job_reqs.min_ram
        }

        /// Convert u8 to JobStatus enum
        fn _u8_to_job_status(self: @ContractState, status: u8) -> JobStatus {
            if status == 0 { JobStatus::Pending }
            else if status == 1 { JobStatus::Assigned }
            else if status == 2 { JobStatus::InProgress }
            else if status == 3 { JobStatus::Completed }
            else if status == 4 { JobStatus::Disputed }
            else if status == 5 { JobStatus::Cancelled }
            else if status == 6 { JobStatus::PaymentReleased }
            else { JobStatus::Pending } // Default
        }

        /// Get configuration value
        fn _get_config_value(self: @ContractState, config_key: felt252) -> felt252 {
            if config_key == 'platform_fee_bps' {
                self.platform_fee_bps.read().into()
            } else if config_key == 'min_job_payment' {
                self.min_job_payment.read().try_into().unwrap_or(0)
            } else if config_key == 'max_job_duration' {
                self.max_job_duration.read().into()
            } else if config_key == 'dispute_fee' {
                self.dispute_fee.read().try_into().unwrap_or(0)
            } else {
                0
            }
        }

        /// Set configuration value
        fn _set_config_value(ref self: ContractState, config_key: felt252, config_value: felt252) {
            if config_key == 'platform_fee_bps' {
                self.platform_fee_bps.write(config_value.try_into().unwrap());
            } else if config_key == 'min_job_payment' {
                self.min_job_payment.write(config_value.into());
            } else if config_key == 'max_job_duration' {
                self.max_job_duration.write(config_value.try_into().unwrap());
            } else if config_key == 'dispute_fee' {
                self.dispute_fee.write(config_value.into());
            }
        }

        /// Release job payment (internal helper)
        fn _release_job_payment(ref self: ContractState, job_id: u256) {
            let job_data = self.jobs.read(job_id);
            let total_payment = job_data.payment_amount;
            let platform_fee = (total_payment * self.platform_fee_bps.read().into()) / 10000;
            let worker_payment = total_payment - platform_fee;
            
            let token = IERC20Dispatcher { contract_address: self.payment_token.read() };
            let worker_address = self._get_worker_address(job_data.worker_id);
            
            token.transfer(worker_address, worker_payment);
            if platform_fee > 0 {
                token.transfer(self.treasury.read(), platform_fee);
            }
        }

        /// Get tier benefits for a given tier
        fn _get_tier_benefits(self: @ContractState, tier: WorkerTier) -> WorkerTierBenefits {
            match tier {
                WorkerTier::Basic => WorkerTierBenefits { 
                    tier: WorkerTier::Basic,
                    usd_requirement: 100_00, // $100 in USD cents
                    allocation_priority: 100,
                    performance_bonus_bps: 500, // 5%
                    min_reputation_required: 0,
                },
                WorkerTier::Premium => WorkerTierBenefits {
                    tier: WorkerTier::Premium,
                    usd_requirement: 500_00, // $500 in USD cents
                    allocation_priority: 120,
                    performance_bonus_bps: 1000, // 10%
                    min_reputation_required: 100,
                },
                WorkerTier::Enterprise => WorkerTierBenefits {
                    tier: WorkerTier::Enterprise,
                    usd_requirement: 2500_00, // $2,500 in USD cents
                    allocation_priority: 150,
                    performance_bonus_bps: 1500, // 15%
                    min_reputation_required: 500,
                },
                WorkerTier::Infrastructure => WorkerTierBenefits {
                    tier: WorkerTier::Infrastructure,
                    usd_requirement: 10000_00, // $10,000 in USD cents
                    allocation_priority: 200,
                    performance_bonus_bps: 2500, // 25%
                    min_reputation_required: 1000,
                },
                WorkerTier::Fleet => WorkerTierBenefits {
                    tier: WorkerTier::Fleet,
                    usd_requirement: 5000000, // $50,000 in USD cents
                    allocation_priority: 250,
                    performance_bonus_bps: 3000, // 30%
                    min_reputation_required: 2500,
                },
                WorkerTier::Datacenter => WorkerTierBenefits {
                    tier: WorkerTier::Datacenter,
                    usd_requirement: 10000000, // $100,000 in USD cents
                    allocation_priority: 300,
                    performance_bonus_bps: 3500, // 35%
                    min_reputation_required: 5000,
                },
                WorkerTier::Hyperscale => WorkerTierBenefits {
                    tier: WorkerTier::Hyperscale,
                    usd_requirement: 25000000, // $250,000 in USD cents
                    allocation_priority: 400,
                    performance_bonus_bps: 4000, // 40%
                    min_reputation_required: 10000,
                },
                WorkerTier::Institutional => WorkerTierBenefits {
                    tier: WorkerTier::Institutional,
                    usd_requirement: 50000000, // $500,000 in USD cents
                    allocation_priority: 500,
                    performance_bonus_bps: 5000, // 50%
                    min_reputation_required: 25000,
                },
            }
        }

        /// Get configuration value by key
        fn _get_config_value(self: @ContractState, key: felt252) -> felt252 {
            if key == 'platform_fee_bps' {
                self.platform_fee_bps.read().into()
            } else if key == 'min_job_payment' {
                self.min_job_payment.read().try_into().unwrap()
            } else if key == 'max_job_duration' {
                self.max_job_duration.read().into()
            } else if key == 'dispute_fee' {
                self.dispute_fee.read().try_into().unwrap()
            } else {
                0
            }
        }

        /// Set configuration value by key
        fn _set_config_value(ref self: ContractState, key: felt252, value: felt252) {
            if key == 'platform_fee_bps' {
                self.platform_fee_bps.write(value.try_into().unwrap());
            } else if key == 'min_job_payment' {
                self.min_job_payment.write(value.into());
            } else if key == 'max_job_duration' {
                self.max_job_duration.write(value.try_into().unwrap());
            } else if key == 'dispute_fee' {
                self.dispute_fee.write(value.into());
            }
        }
    }
} 