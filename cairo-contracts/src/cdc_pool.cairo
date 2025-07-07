//! CIRO Network CDC Pool Contract
//! 
//! Main contract for managing compute resources, worker registration, staking, and
//! reputation in the CIRO Distributed Compute Layer. This contract coordinates with
//! JobMgr and Paymaster contracts to provide secure, efficient worker management.

use starknet::{ContractAddress, get_caller_address, get_block_timestamp, contract_address_const};
use starknet::storage::{
    StoragePointerReadAccess, StoragePointerWriteAccess,
    StorageMapReadAccess, StorageMapWriteAccess,
    Map
};
use core::traits::Into;
use core::num::traits::Zero;

// Core interface imports
use super::interfaces::cdc_pool::{
    ICDCPool, WorkerId, WorkerStatus, WorkerCapabilities, WorkerProfile, 
    PerformanceMetrics, StakeInfo, UnstakeRequest, SlashRecord, SlashReason,
    WorkerTier, WorkerTierBenefits, HolderTier, AllocationResult,
    
    // Events
    WorkerRegistered, WorkerDeregistered, WorkerSlashed, RewardsDistributed,
    WorkerCapabilityUpdated, WorkerTierUpgraded, TierRequirementsUpdated, 
    TierAdjustmentPaused, StakeIncreased, StakeDecreased, UnstakeRequested,
    JobAllocated, WorkerReserved, WorkerReleased, ReputationUpdated
};

// Job Manager imports for model requirements
use super::interfaces::job_manager::{ModelRequirements, JobId};

// CIRO Token integration
use super::interfaces::ciro_token::{ICIROTokenDispatcher};

// Utility imports for symbiotic integration
use crate::utils::security::{
    AccessControlComponent, ReentrancyGuardComponent, PausableComponent,
    ADMIN_ROLE, COORDINATOR_ROLE, SLASHER_ROLE
};
use crate::utils::constants::{
    // Staking constants
    MIN_STAKE_AMOUNT, UNSTAKE_DELAY, HEARTBEAT_INTERVAL,
    
    // Reputation constants  
    REPUTATION_INITIAL,
    
    // Slashing constants
    SLASH_PERCENTAGE_MINOR, SLASH_PERCENTAGE_MAJOR, SLASH_PERCENTAGE_SEVERE,
    
    // Worker tier USD requirements (matching CIRO Token v3.1)
    WORKER_BASIC_USD, WORKER_PREMIUM_USD, WORKER_ENTERPRISE_USD, WORKER_INFRASTRUCTURE_USD,
    WORKER_FLEET_USD, WORKER_DATACENTER_USD, WORKER_HYPERSCALE_USD, WORKER_INSTITUTIONAL_USD,
    
    // Worker tier allocation priorities
    WORKER_BASIC_ALLOCATION_PRIORITY, WORKER_PREMIUM_ALLOCATION_PRIORITY,
    WORKER_ENTERPRISE_ALLOCATION_PRIORITY, WORKER_INFRASTRUCTURE_ALLOCATION_PRIORITY,
    WORKER_FLEET_ALLOCATION_PRIORITY, WORKER_DATACENTER_ALLOCATION_PRIORITY,
    WORKER_HYPERSCALE_ALLOCATION_PRIORITY, WORKER_INSTITUTIONAL_ALLOCATION_PRIORITY,
    
    // Worker tier bonus basis points  
    WORKER_BASIC_BONUS_BPS, WORKER_PREMIUM_BONUS_BPS, WORKER_ENTERPRISE_BONUS_BPS,
    WORKER_INFRASTRUCTURE_BONUS_BPS, WORKER_FLEET_BONUS_BPS, WORKER_DATACENTER_BONUS_BPS,
    WORKER_HYPERSCALE_BONUS_BPS, WORKER_INSTITUTIONAL_BONUS_BPS
};

// Status flags for efficient storage
const WORKER_STATUS_ACTIVE: u8 = 1;
const WORKER_STATUS_INACTIVE: u8 = 2;
const WORKER_STATUS_SLASHED: u8 = 4;
const WORKER_STATUS_EXITING: u8 = 8;
const WORKER_STATUS_BANNED: u8 = 16;

#[starknet::contract]
mod CDCPool {
    use super::*;
    
    // Component declarations
    component!(path: AccessControlComponent, storage: access_control, event: AccessControlEvent);
    component!(path: ReentrancyGuardComponent, storage: reentrancy_guard, event: ReentrancyGuardEvent);
    component!(path: PausableComponent, storage: pausable, event: PausableEvent);
    
    // Embedded impls
    #[abi(embed_v0)]
    impl AccessControlImpl = AccessControlComponent::AccessControlImpl<ContractState>;
    #[abi(embed_v0)]
    impl ReentrancyGuardImpl = ReentrancyGuardComponent::ReentrancyGuardImpl<ContractState>;
    #[abi(embed_v0)]
    impl PausableImpl = PausableComponent::PausableImpl<ContractState>;
    
    impl AccessControlInternalImpl = AccessControlComponent::InternalImpl<ContractState>;
    impl ReentrancyGuardInternalImpl = ReentrancyGuardComponent::InternalImpl<ContractState>;
    impl PausableInternalImpl = PausableComponent::InternalImpl<ContractState>;
    
    #[storage]
    struct Storage {
        // Security components
        #[substorage(v0)]
        access_control: AccessControlComponent::Storage,
        #[substorage(v0)]
        reentrancy_guard: ReentrancyGuardComponent::Storage,
        #[substorage(v0)]
        pausable: PausableComponent::Storage,
        
        // Contract references
        ciro_token: ContractAddress,        // CIRO token contract
        job_manager: ContractAddress,       // Job manager contract  
        treasury: ContractAddress,          // Treasury for fees
        
        // Worker management
        next_worker_id: felt252,            // Next worker ID to assign
        worker_owners: Map<ContractAddress, felt252>, // Owner -> Worker ID
        workers: Map<felt252, WorkerProfile>, // Worker ID -> Profile
        worker_capabilities: Map<felt252, WorkerCapabilities>, // Worker ID -> Capabilities
        worker_metrics: Map<felt252, PerformanceMetrics>, // Worker ID -> Metrics
        
        // Staking system  
        stakes: Map<ContractAddress, StakeInfo>, // Worker -> Stake info
        unstake_requests: Map<ContractAddress, UnstakeRequest>, // Worker -> Unstake request
        total_staked: u256,                 // Total CIRO tokens staked
        
        // Reputation and performance
        reputation_scores: Map<felt252, u64>, // Worker ID -> Reputation (0-1000)
        slash_count: Map<felt252, u32>, // Worker ID -> Number of slashes
        latest_slash: Map<felt252, SlashRecord>, // Worker ID -> Latest slash record
        
        // Job allocation tracking  
        job_assignments: Map<u256, felt252>, // Job ID -> Worker ID
        worker_current_job: Map<felt252, u256>, // Worker ID -> Current Job ID
        worker_job_expiry: Map<felt252, u64>, // Worker ID -> Job expiry time
        worker_reservations: Map<(felt252, u256), u64>, // (Worker ID, Job ID) -> Expiry time
        
        // Worker Tier Management (v3.1 Tokenomics)
        current_ciro_price_usd: u256,       // Current CIRO price in USD cents
        last_price_update: u64,             // Last price oracle update timestamp
        worker_tier_requirements: Map<u8, u256>, // WorkerTier -> CIRO token requirement
        worker_tier_benefits: Map<u8, WorkerTierBenefits>, // WorkerTier -> Benefits
        worker_current_tiers: Map<felt252, u8>, // Worker ID -> WorkerTier
        holder_tiers: Map<ContractAddress, u8>, // Holder -> HolderTier (for governance)
        tier_adjustment_paused: bool,        // Emergency pause for extreme volatility
        tier_adjustment_cooldown: u64,       // Cooldown period for tier adjustments
        
        // Enhanced Stake Management
        stake_usd_values: Map<ContractAddress, u256>, // Worker -> USD value of stake
        total_delegated_to_worker: Map<ContractAddress, u256>, // Worker -> Total delegated amount
        delegator_worker_stakes: Map<(ContractAddress, ContractAddress), u256>, // (Delegator, Worker) -> Amount
        
        // Network statistics
        total_workers: u32,
        active_workers: u32,
        total_jobs_processed: u32,
        network_hashrate: u256,             // Aggregate compute capacity
        
        // Indexing for efficient queries (simplified for Cairo 2.x compatibility)
        workers_by_capability: Map<u64, felt252>, // Single worker per capability for now
        workers_by_status: Map<u8, felt252>, // Single worker per status for now  
        reputation_sorted_count: u32, // Count of workers sorted by reputation
        
        // Configuration parameters
        min_stake_amount: u256,
        unstake_delay: u64,
        heartbeat_timeout: u64,
        base_reward_rate: u256,
        performance_bonus_multiplier: u8,
        slash_percentages: Map<u8, u8>,      // SlashReason -> Percentage
        min_reputation_threshold: u64,
        min_allocation_score: u256,          // Minimum score for job allocation
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        // Component events
        #[flat]
        AccessControlEvent: AccessControlComponent::Event,
        #[flat]
        ReentrancyGuardEvent: ReentrancyGuardComponent::Event,
        #[flat]
        PausableEvent: PausableComponent::Event,
        
        // Worker events
        WorkerRegistered: WorkerRegistered,
        WorkerDeregistered: WorkerDeregistered,
        WorkerCapabilityUpdated: WorkerCapabilityUpdated,
        WorkerTierUpgraded: WorkerTierUpgraded,
        
        // Staking events
        StakeIncreased: StakeIncreased,
        StakeDecreased: StakeDecreased,
        UnstakeRequested: UnstakeRequested,
        
        // Job allocation events
        JobAllocated: JobAllocated,
        WorkerReserved: WorkerReserved,
        WorkerReleased: WorkerReleased,
        
        // Performance events
        ReputationUpdated: ReputationUpdated,
        WorkerSlashed: WorkerSlashed,
        RewardsDistributed: RewardsDistributed,
        
        // Tier events
        TierRequirementsUpdated: TierRequirementsUpdated,
        TierAdjustmentPaused: TierAdjustmentPaused,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        admin: ContractAddress,
        ciro_token: ContractAddress,
        job_manager: ContractAddress,
        treasury: ContractAddress
    ) {
        // Initialize security components
        self.access_control.initializer(admin);
        
        // Set contract addresses
        self.ciro_token.write(ciro_token);
        self.job_manager.write(job_manager);
        self.treasury.write(treasury);
        
        // Initialize counters
        self.next_worker_id.write(1);
        self.total_workers.write(0);
        self.active_workers.write(0);
        self.total_jobs_processed.write(0);
        
        // Set default configuration
        self.min_stake_amount.write(MIN_STAKE_AMOUNT);
        self.unstake_delay.write(UNSTAKE_DELAY);
        self.heartbeat_timeout.write(HEARTBEAT_INTERVAL * 3); // 15 minutes timeout
        self.base_reward_rate.write(1000000000000000000); // 1 token per job
        self.performance_bonus_multiplier.write(50); // 50% max bonus
        self.min_reputation_threshold.write(REPUTATION_INITIAL);
        self.min_allocation_score.write(80); // Minimum 80% capability match
        
        // Initialize slashing percentages
        self.slash_percentages.write(SlashReason::Malicious.into(), SLASH_PERCENTAGE_SEVERE);
        self.slash_percentages.write(SlashReason::Unavailable.into(), SLASH_PERCENTAGE_MINOR);
        self.slash_percentages.write(SlashReason::PoorPerformance.into(), SLASH_PERCENTAGE_MINOR);
        self.slash_percentages.write(SlashReason::ProtocolViolation.into(), SLASH_PERCENTAGE_MAJOR);
        self.slash_percentages.write(SlashReason::Fraud.into(), SLASH_PERCENTAGE_SEVERE);

        // Initialize staking tier system
        self._initialize_worker_tiers();
        
        // Set initial CIRO price (will be updated by oracle)
        self.current_ciro_price_usd.write(50); // $0.50 initial price in USD cents
        self.last_price_update.write(get_block_timestamp());
    }

    #[abi(embed_v0)]
    impl CDCPoolImpl of ICDCPool<ContractState> {
        /// Register a new worker with capabilities and initial stake
        fn register_worker(
            ref self: ContractState,
            capabilities: WorkerCapabilities,
            proof_of_resources: Array<felt252>,
            location_hash: felt252
        ) -> WorkerId {
            // Security checks
            self.pausable.assert_not_paused();
            self.reentrancy_guard.start();
            
            let caller = get_caller_address();
            let current_time = get_block_timestamp();
            
            // Ensure caller is not already registered
            assert(self.worker_owners.read(caller) == 0, 'Worker already registered');
            
            // Validate capabilities
            assert(capabilities.gpu_memory > 0, 'GPU memory must be positive');
            assert(capabilities.cpu_cores > 0, 'CPU cores must be positive');
            assert(capabilities.ram > 0, 'RAM must be positive');
            
            // Get next worker ID
            let worker_id = self.next_worker_id.read();
            self.next_worker_id.write(worker_id + 1);
            
            // Check minimum stake requirement
            let stake_info = self.stakes.read(caller);
            assert(stake_info.amount >= self.min_stake_amount.read(), 'Insufficient stake');
            
            // Create worker profile
            let worker_profile = WorkerProfile {
                worker_id: WorkerId { value: worker_id },
                owner: caller,
                capabilities: capabilities,
                status: WorkerStatus::Active,
                registered_at: current_time,
                last_heartbeat: current_time,
                stake_amount: stake_info.amount,
                reputation_score: REPUTATION_INITIAL,
                jobs_completed: 0,
                jobs_failed: 0,
                total_earnings: 0,
                location_hash: location_hash,
            };
            
            // Store worker data
            self.worker_owners.write(caller, worker_id);
            self.workers.write(worker_id, worker_profile);
            self.worker_capabilities.write(worker_id, capabilities);
            self.reputation_scores.write(worker_id, REPUTATION_INITIAL);
            
            // Initialize performance metrics
            let initial_metrics = PerformanceMetrics {
                avg_response_time: 0,
                completion_rate: 100, // Start with perfect rate
                quality_score: 100,   // Start with perfect score
                uptime_percentage: 100,
                last_updated: current_time,
            };
            self.worker_metrics.write(worker_id, initial_metrics);
            
            // Update counters
            self.total_workers.write(self.total_workers.read() + 1);
            self.active_workers.write(self.active_workers.read() + 1);
            
            // Index worker by capabilities
            self._index_worker_by_capabilities(worker_id, capabilities.capability_flags);
            
            // Calculate and assign initial tier
            let initial_tier = self._calculate_worker_tier(caller);
            let tier_value = self._tier_to_u8(initial_tier);
            self.worker_current_tiers.write(worker_id, tier_value);
            
            // Emit registration event
            self.emit(WorkerRegistered {
                worker_id: WorkerId { value: worker_id },
                owner: caller,
                capabilities: capabilities,
                initial_tier: initial_tier,
                timestamp: current_time,
            });
            
            self.reentrancy_guard.end();
            WorkerId { value: worker_id }
        }
        
        /// Update worker capabilities (requires re-verification)
        fn update_worker_capabilities(
            ref self: ContractState,
            worker_id: WorkerId,
            new_capabilities: WorkerCapabilities,
            proof_of_resources: Array<felt252>
        ) {
            // Security checks
            self.pausable.assert_not_paused();
            self.reentrancy_guard.start();
            
            let caller = get_caller_address();
            let worker_profile = self.workers.read(worker_id.value);
            
            // Verify ownership
            assert(worker_profile.owner == caller, 'Not worker owner');
            assert(worker_profile.status == WorkerStatus::Active.into(), 'Worker not active');
            
            // Validate new capabilities
            assert(new_capabilities.gpu_memory > 0, 'GPU memory must be positive');
            assert(new_capabilities.cpu_cores > 0, 'CPU cores must be positive');
            assert(new_capabilities.ram > 0, 'RAM must be positive');
            
            // Update capabilities
            let old_capabilities = self.worker_capabilities.read(worker_id.value);
            self.worker_capabilities.write(worker_id.value, new_capabilities);
            
            // Re-index worker capabilities
            self._remove_worker_from_capability_index(worker_id.value, old_capabilities.capability_flags);
            self._index_worker_by_capabilities(worker_id.value, new_capabilities.capability_flags);
            
            // Emit update event
            self.emit(WorkerCapabilityUpdated {
                worker_id,
                old_capabilities,
                new_capabilities,
                timestamp: get_block_timestamp(),
            });
            
            self.reentrancy_guard.end();
        }
        
        /// Deactivate worker (temporarily unavailable)
        fn deactivate_worker(ref self: ContractState, worker_id: WorkerId, reason: felt252) {
            // Security checks
            self.pausable.assert_not_paused();
            
            let caller = get_caller_address();
            let mut worker_profile = self.workers.read(worker_id.value);
            
            // Verify ownership or admin role
            assert(
                worker_profile.owner == caller || 
                self.access_control.has_role(caller, ADMIN_ROLE),
                'Not authorized'
            );
            
            // Update status
            worker_profile.status = WorkerStatus::Inactive;
            self.workers.write(worker_id.value, worker_profile);
            
            // Update active workers count
            self.active_workers.write(self.active_workers.read() - 1);
            
            // Move from active to inactive index
            self._move_worker_status_index(worker_id.value, WorkerStatus::Active, WorkerStatus::Inactive);
        }
        
        /// Reactivate worker (return to active status)
        fn reactivate_worker(ref self: ContractState, worker_id: WorkerId) {
            // Security checks
            self.pausable.assert_not_paused();
            
            let caller = get_caller_address();
            let mut worker_profile = self.workers.read(worker_id.value);
            
            // Verify ownership
            assert(worker_profile.owner == caller, 'Not worker owner');
            assert(worker_profile.status == WorkerStatus::Inactive.into(), 'Worker not inactive');
            
            // Check minimum stake requirement
            let stake_info = self.stakes.read(caller);
            assert(stake_info.amount >= self.min_stake_amount.read(), 'Insufficient stake');
            
            // Update status
            worker_profile.status = WorkerStatus::Active;
            worker_profile.last_heartbeat = get_block_timestamp();
            self.workers.write(worker_id.value, worker_profile);
            
            // Update active workers count
            self.active_workers.write(self.active_workers.read() + 1);
            
            // Move from inactive to active index
            self._move_worker_status_index(worker_id.value, WorkerStatus::Inactive, WorkerStatus::Active);
        }
        
        /// Submit heartbeat to maintain active status
        fn submit_heartbeat(
            ref self: ContractState,
            worker_id: WorkerId,
            performance_data: PerformanceMetrics
        ) {
            // Security checks
            self.pausable.assert_not_paused();
            
            let caller = get_caller_address();
            let mut worker_profile = self.workers.read(worker_id.value);
            
            // Verify ownership and status
            assert(worker_profile.owner == caller, 'Not worker owner');
            assert(worker_profile.status == WorkerStatus::Active.into(), 'Worker not active');
            
            // Update heartbeat timestamp
            worker_profile.last_heartbeat = get_block_timestamp();
            self.workers.write(worker_id.value, worker_profile);
            
            // Update performance metrics
            self.worker_metrics.write(worker_id.value, performance_data);
        }
        
        /// Stake tokens to participate in the network
        fn stake(ref self: ContractState, amount: u256, lock_period: u64) {
            // Security checks
            self.pausable.assert_not_paused();
            self.reentrancy_guard.start();
            
            let caller = get_caller_address();
            let current_time = get_block_timestamp();
            
            // Validate amount
            assert(amount > 0, 'Amount must be positive');
            assert(amount >= self.min_stake_amount.read(), 'Below minimum stake');
            
            // Transfer tokens from user
            let ciro_token = ICIROTokenDispatcher { contract_address: self.ciro_token.read() };
            ciro_token.transfer_from(caller, self.treasury.read(), amount);
            
            // Update stake info
            let mut stake_info = self.stakes.read(caller);
            stake_info.amount += amount;
            stake_info.locked_until = if lock_period > 0 { 
                current_time + lock_period 
            } else { 
                stake_info.locked_until 
            };
            stake_info.last_adjustment = current_time;
            
            // Calculate USD value
            let current_price = self.current_ciro_price_usd.read();
            let usd_value = (stake_info.amount * current_price) / 1_000_000_000_000_000_000; // Convert from wei
            stake_info.usd_value = usd_value;
            
            self.stakes.write(caller, stake_info);
            self.stake_usd_values.write(caller, usd_value);
            self.total_staked.write(self.total_staked.read() + amount);
            
            // Update worker tier if registered
            let worker_id = self.worker_owners.read(caller);
            if worker_id != 0 {
                let new_tier = self._calculate_worker_tier(caller);
                let current_tier = self._u8_to_tier(self.worker_current_tiers.read(worker_id));
                
                if new_tier != current_tier {
                    let tier_value = self._tier_to_u8(new_tier);
                    self.worker_current_tiers.write(worker_id, tier_value);
                    
                    self.emit(WorkerTierUpgraded {
                        worker: caller,
                        new_tier,
                        usd_value,
                        timestamp: current_time,
                    });
                }
            }
            
            // Emit staking event
            self.emit(StakeIncreased {
                staker: caller,
                amount,
                total_stake: stake_info.amount,
                lock_period,
                timestamp: current_time,
            });
            
            self.reentrancy_guard.end();
        }
        
        /// Request unstaking (with time delay)
        fn request_unstake(ref self: ContractState, amount: u256) {
            // Security checks
            PausableInternalImpl::assert_not_paused(self);
            
            let caller = get_caller_address();
            let current_time = get_block_timestamp();
            let stake_info = self.stakes.read(caller);
            
            // Validate request
            assert(amount > 0, 'Amount must be positive');
            assert(amount <= stake_info.amount, 'Insufficient stake');
            assert(current_time >= stake_info.locked_until, 'Stake still locked');
            
            // Create unstake request
            let unlock_time = current_time + self.unstake_delay.read();
            let unstake_request = UnstakeRequest {
                worker: caller,
                amount,
                unlock_time,
                is_complete_exit: amount == stake_info.amount,
            };
            
            self.unstake_requests.write(caller, unstake_request);
            
            // Emit unstake request event
            self.emit(UnstakeRequested {
                staker: caller,
                amount,
                unlock_time,
                is_complete_exit: unstake_request.is_complete_exit,
                timestamp: current_time,
            });
        }
        
        /// Complete unstaking after delay period
        fn complete_unstake(ref self: ContractState) {
            // Security checks
            PausableInternalImpl::assert_not_paused(self);
            ReentrancyGuardInternalImpl::start(self);
            
            let caller = get_caller_address();
            let current_time = get_block_timestamp();
            let unstake_request = self.unstake_requests.read(caller);
            
            // Validate unstake request
            assert(unstake_request.worker == caller, 'No unstake request');
            assert(current_time >= unstake_request.unlock_time, 'Unstake period not complete');
            
            // Update stake
            let mut stake_info = self.stakes.read(caller);
            stake_info.amount -= unstake_request.amount;
            
            // Calculate new USD value
            let current_price = self.current_ciro_price_usd.read();
            let new_usd_value = (stake_info.amount * current_price) / 1_000_000_000_000_000_000;
            stake_info.usd_value = new_usd_value;
            
            self.stakes.write(caller, stake_info);
            self.stake_usd_values.write(caller, new_usd_value);
            self.total_staked.write(self.total_staked.read() - unstake_request.amount);
            
            // Clear unstake request
            let empty_request = UnstakeRequest {
                worker: contract_address_const::<0>(),
                amount: 0,
                unlock_time: 0,
                is_complete_exit: false,
            };
            self.unstake_requests.write(caller, empty_request);
            
            // Transfer tokens back to user
            let ciro_token = ICIROTokenDispatcher { contract_address: self.ciro_token.read() };
            ciro_token.transfer(caller, unstake_request.amount);
            
            // Update worker tier if applicable
            let worker_id = self.worker_owners.read(caller);
            if worker_id != 0 {
                let new_tier = self._calculate_worker_tier(caller);
                let tier_value = self._tier_to_u8(new_tier);
                self.worker_current_tiers.write(worker_id, tier_value);
            }
            
            // If complete exit, deregister worker
            if unstake_request.is_complete_exit && worker_id != 0 {
                self._deregister_worker_internal(WorkerId { value: worker_id });
            }
            
            // Emit unstake complete event
            self.emit(StakeDecreased {
                staker: caller,
                amount: unstake_request.amount,
                remaining_stake: stake_info.amount,
                timestamp: current_time,
            });
            
            ReentrancyGuardInternalImpl::end(self);
        }
        
        /// Increase stake amount
        fn increase_stake(ref self: ContractState, additional_amount: u256) {
            self.stake(additional_amount, 0);
        }
        
        /// Delegate stake to another worker
        fn delegate_stake(ref self: ContractState, worker: ContractAddress, amount: u256) {
            // Security checks
            PausableInternalImpl::assert_not_paused(self);
            ReentrancyGuardInternalImpl::start(self);
            
            let caller = get_caller_address();
            let stake_info = self.stakes.read(caller);
            
            // Validate amount
            assert(amount > 0, 'Amount must be positive');
            assert(amount <= stake_info.amount, 'Insufficient stake');
            
            // Check that target is a registered worker
            let worker_id = self.worker_owners.read(worker);
            assert(worker_id != 0, 'Target not a worker');
            
            // Update delegation mapping
            let current_delegation = self.delegator_worker_stakes.read((caller, worker));
            self.delegator_worker_stakes.write((caller, worker), current_delegation + amount);
            
            ReentrancyGuardInternalImpl::end(self);
        }

        /// Allocate a job to the best available worker
        fn allocate_job(
            ref self: ContractState,
            job_id: JobId,
            requirements: ModelRequirements,
            priority: u8,
            max_latency: u64
        ) -> AllocationResult {
            // Security checks
            PausableInternalImpl::assert_not_paused(self);
            AccessControlInternalImpl::assert_only_role(@self.access_control, COORDINATOR_ROLE);
            
            // Find best worker for the job
            let eligible_workers = self._find_eligible_workers(@requirements, max_latency);
            assert(eligible_workers.len() > 0, 'No eligible workers');
            
            // Score and rank workers
            let best_worker = self._select_best_worker(@eligible_workers, @requirements, priority);
            let worker_profile = self.workers.read(best_worker);
            
            // Calculate confidence score
            let confidence_score = self._calculate_confidence_score(best_worker, @requirements);
            
            // Estimate completion time
            let estimated_completion = self._estimate_completion_time(best_worker, @requirements);
            
            // Record allocation
            self.job_assignments.write(job_id.value, best_worker);
            
            // Update worker assignment count
            let mut metrics = self.worker_metrics.read(best_worker);
            metrics.last_updated = get_block_timestamp();
            self.worker_metrics.write(best_worker, metrics);
            
            let allocation_result = AllocationResult {
                worker: worker_profile.owner,
                confidence_score,
                estimated_completion,
            };
            
            // Emit event
            self.emit(JobAllocated {
                job_id,
                worker_id: WorkerId { value: best_worker },
                confidence_score,
                estimated_completion,
            });
            
            allocation_result
        }

        /// Get eligible workers for a job
        fn get_eligible_workers(
            self: @ContractState,
            requirements: ModelRequirements,
            max_results: u32
        ) -> Array<WorkerId> {
            let eligible = self._find_eligible_workers(@requirements, 0);
            let limit = max_results.min(PAGINATION_LIMIT.into());
            let mut result = ArrayTrait::new();
            
            let mut i = 0;
            while i < eligible.len() && i < limit {
                result.append(WorkerId { value: *eligible.at(i) });
                i += 1;
            };
            
            result
        }

        /// Reserve worker for a job (temporary allocation)
        fn reserve_worker(
            ref self: ContractState,
            worker_id: WorkerId,
            job_id: JobId,
            duration: u64
        ) {
            // Security checks
            PausableInternalImpl::assert_not_paused(self);
            AccessControlInternalImpl::assert_only_role(@self.access_control, COORDINATOR_ROLE);
            
            let current_time = get_block_timestamp();
            let expiry_time = current_time + duration;
            
            // Check worker availability
            let worker = self.workers.read(worker_id.value);
            assert(worker.owner.is_non_zero(), 'Worker does not exist');
            assert(worker.status == WorkerStatus::Active.into(), 'Worker not active');
            
            // Update reservation
            self.worker_reservations.write(worker_id.value, job_id.value, expiry_time);
            
            // Emit event
            self.emit(WorkerReserved {
                worker_id,
                job_id,
                duration,
            });
        }

        /// Release worker reservation
        fn release_worker(ref self: ContractState, worker_id: WorkerId, job_id: JobId) {
            // Security checks
            PausableInternalImpl::assert_not_paused(self);
            AccessControlInternalImpl::assert_only_role(@self.access_control, COORDINATOR_ROLE);
            
            // Remove reservation
            self.worker_reservations.write(worker_id.value, job_id.value, 0);
            
            // Emit event
            self.emit(WorkerReleased {
                worker_id,
                job_id,
            });
        }

        /// Update worker reputation based on job performance
        fn update_reputation(
            ref self: ContractState,
            worker_id: WorkerId,
            job_id: JobId,
            performance_score: u8,
            response_time: u64,
            quality_score: u8
        ) {
            // Security checks
            PausableInternalImpl::assert_not_paused(self);
            AccessControlInternalImpl::assert_only_role(@self.access_control, COORDINATOR_ROLE);
            
            let current_reputation = self.reputation_scores.read(worker_id.value);
            
            // Calculate new reputation using weighted average
            let performance_weight = performance_score.into();
            let quality_weight = quality_score.into();
            let combined_score = (performance_weight + quality_weight) / 2;
            
            // Apply reputation update (weighted toward recent performance)
            let new_reputation = (current_reputation * 90 + combined_score * 10) / 100;
            let capped_reputation = if new_reputation > REPUTATION_MAX { REPUTATION_MAX } else { new_reputation };
            
            // Extract inner value for storage access
            self.reputation_scores.write(worker_id.value, capped_reputation);
            
            // Update performance metrics
            let mut metrics = self.worker_metrics.read(worker_id.value);
            metrics.avg_response_time = (metrics.avg_response_time + response_time) / 2;
            metrics.quality_score = quality_score;
            metrics.last_updated = get_block_timestamp();
            self.worker_metrics.write(worker_id.value, metrics);
            
            // Emit reputation update event
            self.emit(ReputationUpdated {
                worker_id,
                old_score: current_reputation,
                new_score: capped_reputation,
                job_id,
            });
        }

        /// Slash worker for misconduct
        fn slash_worker(
            ref self: ContractState,
            worker_id: WorkerId,
            reason: SlashReason,
            evidence: Array<felt252>
        ) -> u256 {
            // Security checks
            PausableInternalImpl::assert_not_paused(self);
            AccessControlInternalImpl::assert_only_role(@self.access_control, SLASHER_ROLE);
            
            // Extract inner value for storage access
            let worker_profile = self.workers.read(worker_id.value);
            let slash_percentage = self.slash_percentages.read(reason.into());
            let stake_info = self.stakes.read(worker_profile.owner);
            
            // Calculate slash amount
            let slash_amount = (stake_info.amount * slash_percentage.into()) / 100;
            
            // Update stake
            let mut updated_stake = stake_info;
            updated_stake.amount -= slash_amount;
            self.stakes.write(worker_profile.owner, updated_stake);
            self.total_staked.write(self.total_staked.read() - slash_amount);
            
            // Create slash record (use first evidence item as hash if available)
            let evidence_hash = if evidence.len() > 0 { *evidence.at(0) } else { 0 };
            let slash_record = SlashRecord {
                worker: worker_profile.owner,
                reason,
                amount: slash_amount,
                timestamp: get_block_timestamp(),
                evidence_hash,
            };
            
            // Update worker status if severely slashed
            if slash_percentage >= SLASH_PERCENTAGE_MAJOR {
                let mut updated_profile = worker_profile;
                updated_profile.status = WorkerStatus::Slashed;
                self.workers.write(worker_id.value, updated_profile);
                
                // Update active workers count
                self.active_workers.write(self.active_workers.read() - 1);
            }
            
            // Emit slashing event
            self.emit(WorkerSlashed {
                worker_id,
                reason,
                amount: slash_amount,
                evidence_hash,
            });
            
            slash_amount
        }

        /// Distribute rewards to worker
        fn distribute_reward(
            ref self: ContractState,
            worker_id: WorkerId,
            base_reward: u256,
            performance_bonus: u256
        ) {
            // Security checks
            PausableInternalImpl::assert_not_paused(self);
            AccessControlInternalImpl::assert_only_role(@self.access_control, COORDINATOR_ROLE);
            
            // Extract inner value for storage access
            let worker_profile = self.workers.read(worker_id.value);
            let total_reward = base_reward + performance_bonus;
            
            // Transfer reward tokens
            let ciro_token = ICIROTokenDispatcher { contract_address: self.ciro_token.read() };
            ciro_token.transfer(worker_profile.owner, total_reward);
            
            // Update worker earnings
            let mut updated_profile = worker_profile;
            updated_profile.total_earnings += total_reward;
            self.workers.write(worker_id.value, updated_profile);
            
            // Emit reward event  
            self.emit(RewardsDistributed {
                worker_id,
                job_id: JobId { value: 0_u256 }, // Using default job_id since distribute_reward doesn't take a job_id
                base_reward,
                performance_bonus,
                total_reward,
            });
        }

        /// Get worker tier for a worker (CRITICAL FOR JOBMGR INTEGRATION)
        fn get_worker_tier(self: @ContractState, worker: ContractAddress) -> WorkerTier {
            let worker_id = self.worker_owners.read(worker);
            if worker_id == 0 {
                return WorkerTier::Basic; // Default to basic tier if not registered
            }
            
            let tier_value = self.worker_current_tiers.read(worker_id);
            self._u8_to_tier(tier_value)
        }
        
        /// Get worker tier benefits (CRITICAL FOR JOBMGR INTEGRATION)
        fn get_worker_tier_benefits(self: @ContractState, tier: WorkerTier) -> WorkerTierBenefits {
            let tier_value = self._tier_to_u8(tier);
            self.worker_tier_benefits.read(tier_value)
        }
        
        /// Get USD value of staked amount
        fn get_stake_usd_value(self: @ContractState, worker: ContractAddress) -> u256 {
            self.stake_usd_values.read(worker)
        }
        
        /// Get CIRO token requirement for a tier
        fn get_tier_ciro_requirement(self: @ContractState, tier: WorkerTier) -> u256 {
            let tier_value = self._tier_to_u8(tier);
            self.worker_tier_requirements.read(tier_value)
        }
        
        /// Update CIRO price (oracle function)
        fn update_ciro_price(ref self: ContractState, new_price: u256) {
            // Security checks
            AccessControlInternalImpl::assert_only_role(@self.access_control, ADMIN_ROLE);
            
            self.current_ciro_price_usd.write(new_price);
            self.last_price_update.write(get_block_timestamp());
            
            // Recalculate all worker tiers based on new price
            self._recalculate_all_worker_tiers();
        }
        
        /// Check if worker meets tier requirements
        fn meets_tier_requirements(self: @ContractState, worker: ContractAddress, tier: WorkerTier) -> bool {
            let stake_info = self.stakes.read(worker);
            let worker_id = self.worker_owners.read(worker);
            
            if worker_id == 0 {
                return false; // Not registered
            }
            
            let worker_data = self.workers.read(worker_id);
            let tier_benefits = self.get_worker_tier_benefits(tier);
            
            // Check stake requirement (USD value)
            if stake_info.usd_value < tier_benefits.usd_requirement {
                return false;
            }
            
            // Check reputation requirement
            if worker_data.reputation_score < tier_benefits.min_reputation_required {
                return false;
            }
            
            true
        }
        
        /// Get holder tier for governance
        fn get_holder_tier(self: @ContractState, holder: ContractAddress) -> HolderTier {
            let tier_value = self.holder_tiers.read(holder);
            match tier_value {
                0 => HolderTier::Regular,
                1 => HolderTier::Whale,
                2 => HolderTier::Institution,
                3 => HolderTier::HyperWhale,
                _ => HolderTier::Regular,
            }
        }
        
        /// Get tier-based allocation score for job assignment (CRITICAL FOR JOBMGR INTEGRATION)
        fn get_tier_allocation_score(
            self: @ContractState,
            worker: ContractAddress,
            requirements: ModelRequirements
        ) -> u256 {
            let worker_id = self.worker_owners.read(worker);
            assert(worker_id != 0, 'Worker not registered');
            
            let worker_data = self.workers.read(worker_id);
            assert(worker_data.status == WorkerStatus::Active.into(), 'Worker not active');
            
            // Base capability score (0-100)
            let capability_score = self._calculate_capability_score(worker_id, @requirements);
            
            // Get worker tier and benefits
            let worker_tier = self.get_worker_tier(worker);
            let tier_benefits = self.get_worker_tier_benefits(worker_tier);
            
            // Apply tier-based priority boost
            let priority_boost = tier_benefits.allocation_priority;
            
            // Calculate final allocation score
            let allocation_score = (capability_score * priority_boost) / 100;
            
            allocation_score
        }

        /// Query Functions
        
        /// Get worker profile by ID
        fn get_worker_profile(self: @ContractState, worker_id: WorkerId) -> WorkerProfile {
            self.workers.read(worker_id.value)
        }
        
        /// Get worker capabilities
        fn get_worker_capabilities(self: @ContractState, worker_id: WorkerId) -> WorkerCapabilities {
            self.worker_capabilities.read(worker_id.value)
        }
        
        /// Get worker performance metrics
        fn get_worker_metrics(self: @ContractState, worker_id: WorkerId) -> PerformanceMetrics {
            self.worker_metrics.read(worker_id.value)
        }
        
        /// Get stake information
        fn get_stake_info(self: @ContractState, worker: ContractAddress) -> StakeInfo {
            self.stakes.read(worker)
        }
        
        /// Get unstake requests
        fn get_unstake_requests(
            self: @ContractState,
            offset: u32,
            limit: u32
        ) -> Array<UnstakeRequest> {
            // Implementation would iterate through unstake requests
            ArrayTrait::new()
        }
    }

    // =================== INTERNAL HELPER FUNCTIONS ===================
    
    #[generate_trait]
    impl InternalImpl of InternalTrait {
        /// Initialize worker tier system
        fn _initialize_worker_tiers(ref self: ContractState) {
        // Initialize worker tier benefits using constants
        let basic_benefits = WorkerTierBenefits {
            tier: WorkerTier::Basic,
            usd_requirement: WORKER_BASIC_USD,
            allocation_priority: WORKER_BASIC_ALLOCATION_PRIORITY,
            performance_bonus_bps: WORKER_BASIC_BONUS_BPS,
            min_reputation_required: 0,
        };
        
        let premium_benefits = WorkerTierBenefits {
            tier: WorkerTier::Premium,
            usd_requirement: WORKER_PREMIUM_USD,
            allocation_priority: WORKER_PREMIUM_ALLOCATION_PRIORITY,
            performance_bonus_bps: WORKER_PREMIUM_BONUS_BPS,
            min_reputation_required: 100,
        };
        
        let enterprise_benefits = WorkerTierBenefits {
            tier: WorkerTier::Enterprise,
            usd_requirement: WORKER_ENTERPRISE_USD,
            allocation_priority: WORKER_ENTERPRISE_ALLOCATION_PRIORITY,
            performance_bonus_bps: WORKER_ENTERPRISE_BONUS_BPS,
            min_reputation_required: 500,
        };
        
        let infrastructure_benefits = WorkerTierBenefits {
            tier: WorkerTier::Infrastructure,
            usd_requirement: WORKER_INFRASTRUCTURE_USD,
            allocation_priority: WORKER_INFRASTRUCTURE_ALLOCATION_PRIORITY,
            performance_bonus_bps: WORKER_INFRASTRUCTURE_BONUS_BPS,
            min_reputation_required: 1000,
        };
        
        // Extended tier benefits for large capital deployment
        let fleet_benefits = WorkerTierBenefits {
            tier: WorkerTier::Fleet,
            usd_requirement: WORKER_FLEET_USD,
            allocation_priority: WORKER_FLEET_ALLOCATION_PRIORITY,
            performance_bonus_bps: WORKER_FLEET_BONUS_BPS,
            min_reputation_required: 2500,
        };
        
        let datacenter_benefits = WorkerTierBenefits {
            tier: WorkerTier::Datacenter,
            usd_requirement: WORKER_DATACENTER_USD,
            allocation_priority: WORKER_DATACENTER_ALLOCATION_PRIORITY,
            performance_bonus_bps: WORKER_DATACENTER_BONUS_BPS,
            min_reputation_required: 5000,
        };
        
        let hyperscale_benefits = WorkerTierBenefits {
            tier: WorkerTier::Hyperscale,
            usd_requirement: WORKER_HYPERSCALE_USD,
            allocation_priority: WORKER_HYPERSCALE_ALLOCATION_PRIORITY,
            performance_bonus_bps: WORKER_HYPERSCALE_BONUS_BPS,
            min_reputation_required: 10000,
        };
        
        let institutional_benefits = WorkerTierBenefits {
            tier: WorkerTier::Institutional,
            usd_requirement: WORKER_INSTITUTIONAL_USD,
            allocation_priority: WORKER_INSTITUTIONAL_ALLOCATION_PRIORITY,
            performance_bonus_bps: WORKER_INSTITUTIONAL_BONUS_BPS,
            min_reputation_required: 25000,
        };
        
        // Store tier benefits
        self.worker_tier_benefits.write(0, basic_benefits);
        self.worker_tier_benefits.write(1, premium_benefits);
        self.worker_tier_benefits.write(2, enterprise_benefits);
        self.worker_tier_benefits.write(3, infrastructure_benefits);
        self.worker_tier_benefits.write(4, fleet_benefits);
        self.worker_tier_benefits.write(5, datacenter_benefits);
        self.worker_tier_benefits.write(6, hyperscale_benefits);
        self.worker_tier_benefits.write(7, institutional_benefits);
        }
        
        /// Calculate worker tier based on stake and reputation
        fn _calculate_worker_tier(self: @ContractState, worker: ContractAddress) -> WorkerTier {
            let worker_id = self.worker_owners.read(worker);
            assert(worker_id != 0, 'Worker not registered');
            
            let worker_data = self.workers.read(worker_id);
            let usd_stake_value = self.get_stake_usd_value(worker);
            let reputation = worker_data.reputation_score;
            
            // Evaluate highest tier the worker qualifies for (checking both stake and reputation)
            if usd_stake_value >= WORKER_INSTITUTIONAL_USD && reputation >= 25000 {
                WorkerTier::Institutional
            } else if usd_stake_value >= WORKER_HYPERSCALE_USD && reputation >= 10000 {
                WorkerTier::Hyperscale
            } else if usd_stake_value >= WORKER_DATACENTER_USD && reputation >= 5000 {
                WorkerTier::Datacenter
            } else if usd_stake_value >= WORKER_FLEET_USD && reputation >= 2500 {
                WorkerTier::Fleet
            } else if usd_stake_value >= WORKER_INFRASTRUCTURE_USD && reputation >= 1000 {
                WorkerTier::Infrastructure
            } else if usd_stake_value >= WORKER_ENTERPRISE_USD && reputation >= 500 {
                WorkerTier::Enterprise
            } else if usd_stake_value >= WORKER_PREMIUM_USD && reputation >= 100 {
                WorkerTier::Premium
            } else {
                WorkerTier::Basic
            }
        }
        
        /// Convert WorkerTier enum to u8
        fn _tier_to_u8(self: @ContractState, tier: WorkerTier) -> u8 {
            match tier {
                WorkerTier::Basic => 0,
                WorkerTier::Premium => 1,
                WorkerTier::Enterprise => 2,
                WorkerTier::Infrastructure => 3,
                WorkerTier::Fleet => 4,
                WorkerTier::Datacenter => 5,
                WorkerTier::Hyperscale => 6,
                WorkerTier::Institutional => 7,
            }
        }
        
        /// Convert u8 to WorkerTier enum
        fn _u8_to_tier(self: @ContractState, tier_value: u8) -> WorkerTier {
            match tier_value {
                0 => WorkerTier::Basic,
                1 => WorkerTier::Premium,
                2 => WorkerTier::Enterprise,
                3 => WorkerTier::Infrastructure,
                4 => WorkerTier::Fleet,
                5 => WorkerTier::Datacenter,
                6 => WorkerTier::Hyperscale,
                7 => WorkerTier::Institutional,
                _ => WorkerTier::Basic,
            }
        }
        
        /// Find eligible workers for a job
        fn _find_eligible_workers(
            self: @ContractState,
            requirements: @ModelRequirements,
            max_latency: u64
        ) -> Array<felt252> {
            let mut eligible = ArrayTrait::new();
            
            // For now, return a simplified implementation
            // In production, this would query workers by capability indices
            eligible
        }
        
        /// Select best worker from eligible pool
        fn _select_best_worker(
            self: @ContractState,
            eligible_workers: @Array<felt252>,
            requirements: @ModelRequirements,
            priority: u8
        ) -> felt252 {
            // Return first eligible worker for now
            // In production, this would implement sophisticated scoring
            *eligible_workers.at(0)
        }
        
        /// Calculate confidence score for worker allocation
        fn _calculate_confidence_score(
            self: @ContractState,
            worker_id: felt252,
            requirements: @ModelRequirements
        ) -> u8 {
            // Simple implementation - return high confidence
            // In production, this would analyze worker capabilities vs requirements
            90
        }
        
        /// Estimate job completion time
        fn _estimate_completion_time(
            self: @ContractState,
            worker_id: felt252,
            requirements: @ModelRequirements
        ) -> u64 {
            // Simple implementation
            get_block_timestamp() + requirements.estimated_duration
        }
        
        /// Calculate capability score for job matching
        fn _calculate_capability_score(
            self: @ContractState,
            worker_id: felt252,
            requirements: @ModelRequirements
        ) -> u256 {
            let capabilities = self.worker_capabilities.read(worker_id);
            
            // Basic capability matching (0-100 scale)
            let mut score = 0_u256;
            
            // GPU memory check
            if capabilities.gpu_memory >= requirements.min_gpu_memory {
                score += 25;
            }
            
            // CPU cores check
            if capabilities.cpu_cores >= requirements.min_cpu_cores {
                score += 25;
            }
            
            // RAM check
            if capabilities.ram >= requirements.min_ram {
                score += 25;
            }
            
            // Feature flags check (simplified)
            score += 25; // Assume features match for now
            
            score
        }
        
        /// Index worker by capabilities for efficient searching
        fn _index_worker_by_capabilities(ref self: ContractState, worker_id: felt252, capability_flags: u64) {
            // Add worker to capability indices (single worker per capability for now)
            self.workers_by_capability.write(capability_flags, worker_id);
        }
        
        /// Remove worker from capability index
        fn _remove_worker_from_capability_index(ref self: ContractState, worker_id: felt252, capability_flags: u64) {
            // Remove worker from capability indices (simplified implementation)
            // In production, this would properly remove from the Vec
        }
        
        /// Move worker between status indices
        fn _move_worker_status_index(
            ref self: ContractState,
            worker_id: felt252,
            from_status: WorkerStatus,
            to_status: WorkerStatus
        ) {
            // Remove from old status index and add to new one (simplified implementation)
        }
        
        /// Deregister worker internal function
        fn _deregister_worker_internal(ref self: ContractState, worker_id: WorkerId) {
            let worker_profile = self.workers.read(worker_id.value);
            
            // Update counters
            self.total_workers.write(self.total_workers.read() - 1);
            if worker_profile.status == WorkerStatus::Active.into() {
                self.active_workers.write(self.active_workers.read() - 1);
            }
            
            // Clear worker data
            self.worker_owners.write(worker_profile.owner, 0);
            
            // Emit deregistration event
            self.emit(WorkerDeregistered {
                worker_id,
                owner: worker_profile.owner,
                timestamp: get_block_timestamp(),
            });
        }
        
        /// Recalculate all worker tiers (used when price updates)
        fn _recalculate_all_worker_tiers(ref self: ContractState) {
            // In production, this would iterate through all workers and update their tiers
            // For now, this is a placeholder
        }
    }
} 