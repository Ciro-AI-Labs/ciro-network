//! Milestone-Based Vesting Contract for Advisors
//! CIRO Network - KPI-Driven Vesting System
//! Handles Advisor allocations with quarterly milestone tracking

use starknet::ContractAddress;

#[starknet::interface]
pub trait IMilestoneVesting<TContractState> {
    // Core milestone vesting functions
    fn create_milestone_schedule(
        ref self: TContractState,
        beneficiary: ContractAddress,
        total_amount: u256,
        milestone_ids: Array<u256>,
        milestone_amounts: Array<u256>,
        milestone_deadlines: Array<u64>,
        schedule_id: u256
    );
    fn validate_milestone_completion(ref self: TContractState, milestone_id: u256, evidence_hash: felt252);
    fn release_milestone_tokens(ref self: TContractState, milestone_id: u256) -> u256;
    fn challenge_milestone(ref self: TContractState, milestone_id: u256, challenge_reason: felt252);
    
    // View functions
    fn get_milestone_schedule(self: @TContractState, schedule_id: u256) -> MilestoneSchedule;
    fn get_milestone_details(self: @TContractState, milestone_id: u256) -> Milestone;
    fn get_schedule_progress(self: @TContractState, schedule_id: u256) -> (u256, u256, u256); // (completed, total, released)
    fn get_advisor_schedules(self: @TContractState, advisor: ContractAddress) -> Array<u256>;
    fn get_pending_validations(self: @TContractState) -> Array<u256>;
    
    // KPI management
    fn add_kpi_validator(ref self: TContractState, validator: ContractAddress);
    fn remove_kpi_validator(ref self: TContractState, validator: ContractAddress);
    fn update_milestone_kpi(ref self: TContractState, milestone_id: u256, new_kpi_hash: felt252);
    fn set_milestone_grace_period(ref self: TContractState, grace_period: u64);
    
    // Emergency controls
    fn pause_milestone_schedule(ref self: TContractState, schedule_id: u256, reason: felt252);
    fn resume_milestone_schedule(ref self: TContractState, schedule_id: u256);
    fn revoke_milestone_schedule(ref self: TContractState, schedule_id: u256, reason: felt252);
    fn extend_milestone_deadline(ref self: TContractState, milestone_id: u256, extension: u64);
}

#[derive(Drop, Serde, starknet::Store)]
pub struct MilestoneSchedule {
    pub beneficiary: ContractAddress,
    pub total_amount: u256,
    pub released_amount: u256,
    pub milestones_count: u32,
    pub completed_milestones: u32,
    pub created_time: u64,
    pub is_active: bool,
    pub is_paused: bool,
    pub schedule_type: felt252,        // 'ADVISOR_QUARTERLY', 'ADVISOR_ANNUAL'
    pub compliance_approved: bool,
    pub grace_period: u64,             // Additional time for milestone completion
    pub performance_score: u64         // 0-10000 (percentage * 100)
}

#[derive(Drop, Serde, starknet::Store)]
pub struct Milestone {
    pub milestone_id: u256,
    pub schedule_id: u256,
    pub description_hash: felt252,      // IPFS hash of milestone description
    pub kpi_requirements_hash: felt252, // IPFS hash of KPI requirements
    pub amount: u256,
    pub deadline: u64,
    pub completion_time: u64,
    pub validator: ContractAddress,
    pub evidence_hash: felt252,         // IPFS hash of completion evidence
    pub status: MilestoneStatus,
    pub challenge_count: u32,
    pub validation_time: u64,
    pub is_released: bool
}

#[derive(Drop, Serde, starknet::Store)]
pub enum MilestoneStatus {
    Pending,
    Submitted,
    Validated,
    Challenged,
    Failed,
    Released
}

#[derive(Drop, Serde, starknet::Store)]
pub struct Challenge {
    pub challenger: ContractAddress,
    pub milestone_id: u256,
    pub reason: felt252,
    pub evidence_hash: felt252,
    pub created_time: u64,
    pub resolved: bool,
    pub resolution_time: u64,
    pub resolution_outcome: bool      // true = challenge upheld, false = milestone approved
}

// Component imports for production security
use openzeppelin::access::accesscontrol::AccessControlComponent;
use openzeppelin::security::reentrancyguard::ReentrancyGuardComponent;
use openzeppelin::security::pausable::PausableComponent;
use openzeppelin::upgrades::UpgradeableComponent;
use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};

#[starknet::contract]
mod MilestoneVesting {
    use super::*;
    use starknet::{
        ContractAddress, get_caller_address, get_contract_address, get_block_timestamp,
        storage::{Map, Vec}
    };

    // Component declarations
    component!(path: AccessControlComponent, storage: access_control, event: AccessControlEvent);
    component!(path: ReentrancyGuardComponent, storage: reentrancy_guard, event: ReentrancyGuardEvent);
    component!(path: PausableComponent, storage: pausable, event: PausableEvent);
    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);

    // Embedded implementations
    #[abi(embed_v0)]
    impl AccessControlImpl = AccessControlComponent::AccessControlImpl<ContractState>;
    #[abi(embed_v0)]
    impl ReentrancyGuardImpl = ReentrancyGuardComponent::ReentrancyGuardImpl<ContractState>;
    #[abi(embed_v0)]
    impl PausableImpl = PausableComponent::PausableImpl<ContractState>;
    #[abi(embed_v0)]
    impl UpgradeableImpl = UpgradeableComponent::UpgradeableImpl<ContractState>;

    // Internal implementations
    impl AccessControlInternalImpl = AccessControlComponent::InternalImpl<ContractState>;
    impl ReentrancyGuardInternalImpl = ReentrancyGuardComponent::InternalImpl<ContractState>;
    impl PausableInternalImpl = PausableComponent::InternalImpl<ContractState>;
    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;

    // Role constants
    const ADMIN_ROLE: felt252 = 0x0;
    const KPI_VALIDATOR_ROLE: felt252 = 'KPI_VALIDATOR';
    const CHALLENGE_ROLE: felt252 = 'CHALLENGER';
    const COMPLIANCE_ROLE: felt252 = 'COMPLIANCE';

    #[storage]
    struct Storage {
        // Component storages
        #[substorage(v0)]
        access_control: AccessControlComponent::Storage,
        #[substorage(v0)]
        reentrancy_guard: ReentrancyGuardComponent::Storage,
        #[substorage(v0)]
        pausable: PausableComponent::Storage,
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,

        // Core milestone vesting storage
        milestone_schedules: Map<u256, MilestoneSchedule>,
        milestones: Map<u256, Milestone>,
        schedule_milestones: Map<(u256, u32), u256>, // (schedule_id, index) -> milestone_id
        advisor_schedules: Map<ContractAddress, u32>, // Count per advisor
        advisor_schedule_ids: Map<(ContractAddress, u32), u256>, // (advisor, index) -> schedule_id
        total_schedules: u256,
        total_milestones: u256,

        // Token contract
        token_contract: ContractAddress,
        
        // KPI validation
        kpi_validators: Map<ContractAddress, bool>,
        validator_count: u32,
        pending_validations: Map<u256, bool>, // milestone_id -> pending status
        default_grace_period: u64,
        
        // Challenge system
        challenges: Map<u256, Challenge>,
        milestone_challenges: Map<u256, u32>, // milestone_id -> challenge count
        challenge_period: u64,               // Time window for challenges
        next_challenge_id: u256,

        // Performance tracking
        advisor_performance: Map<ContractAddress, u64>, // advisor -> score (0-10000)
        total_milestones_completed: u256,
        total_milestones_failed: u256,
        
        // Statistics for audit trail
        total_schedules_created: u256,
        total_schedules_revoked: u256,
        total_challenges_raised: u256,
        total_challenges_upheld: u256
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
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event,

        // Milestone vesting events
        MilestoneScheduleCreated: MilestoneScheduleCreated,
        MilestoneSubmitted: MilestoneSubmitted,
        MilestoneValidated: MilestoneValidated,
        MilestoneTokensReleased: MilestoneTokensReleased,
        MilestoneChallenged: MilestoneChallenged,
        ChallengeResolved: ChallengeResolved,
        MilestoneExtended: MilestoneExtended,
        
        // Schedule management events
        SchedulePaused: SchedulePaused,
        ScheduleResumed: ScheduleResumed,
        ScheduleRevoked: ScheduleRevoked,
        
        // KPI management events
        KPIValidatorAdded: KPIValidatorAdded,
        KPIValidatorRemoved: KPIValidatorRemoved,
        MilestoneKPIUpdated: MilestoneKPIUpdated,
        
        // Performance events
        AdvisorPerformanceUpdated: AdvisorPerformanceUpdated
    }

    // Event structures for comprehensive audit trail
    #[derive(Drop, starknet::Event)]
    struct MilestoneScheduleCreated {
        #[key]
        schedule_id: u256,
        #[key]
        beneficiary: ContractAddress,
        total_amount: u256,
        milestones_count: u32,
        created_by: ContractAddress,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct MilestoneSubmitted {
        #[key]
        milestone_id: u256,
        #[key]
        schedule_id: u256,
        #[key]
        beneficiary: ContractAddress,
        evidence_hash: felt252,
        submitted_by: ContractAddress,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct MilestoneValidated {
        #[key]
        milestone_id: u256,
        #[key]
        validator: ContractAddress,
        validation_outcome: bool,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct MilestoneTokensReleased {
        #[key]
        milestone_id: u256,
        #[key]
        beneficiary: ContractAddress,
        amount: u256,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct MilestoneChallenged {
        #[key]
        challenge_id: u256,
        #[key]
        milestone_id: u256,
        #[key]
        challenger: ContractAddress,
        reason: felt252,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct ChallengeResolved {
        #[key]
        challenge_id: u256,
        #[key]
        milestone_id: u256,
        resolution_outcome: bool,
        resolved_by: ContractAddress,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct MilestoneExtended {
        #[key]
        milestone_id: u256,
        old_deadline: u64,
        new_deadline: u64,
        extension_reason: felt252,
        authorized_by: ContractAddress,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct SchedulePaused {
        #[key]
        schedule_id: u256,
        #[key]
        beneficiary: ContractAddress,
        reason: felt252,
        paused_by: ContractAddress,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct ScheduleResumed {
        #[key]
        schedule_id: u256,
        #[key]
        beneficiary: ContractAddress,
        resumed_by: ContractAddress,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct ScheduleRevoked {
        #[key]
        schedule_id: u256,
        #[key]
        beneficiary: ContractAddress,
        revoked_amount: u256,
        reason: felt252,
        revoked_by: ContractAddress,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct KPIValidatorAdded {
        #[key]
        validator: ContractAddress,
        added_by: ContractAddress,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct KPIValidatorRemoved {
        #[key]
        validator: ContractAddress,
        removed_by: ContractAddress,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct MilestoneKPIUpdated {
        #[key]
        milestone_id: u256,
        old_kpi_hash: felt252,
        new_kpi_hash: felt252,
        updated_by: ContractAddress,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct AdvisorPerformanceUpdated {
        #[key]
        advisor: ContractAddress,
        old_score: u64,
        new_score: u64,
        milestone_id: u256,
        timestamp: u64
    }

    // Constructor for production deployment
    #[constructor]
    fn constructor(
        ref self: ContractState,
        token_contract: ContractAddress,
        initial_validators: Array<ContractAddress>,
        admin: ContractAddress,
        default_grace_period: u64,
        challenge_period: u64
    ) {
        // Initialize access control
        self.access_control.initializer();
        self.access_control._grant_role(ADMIN_ROLE, admin);
        
        // Initialize security components
        self.reentrancy_guard.initializer();
        self.pausable.initializer();
        self.upgradeable.initializer(admin);

        // Set token contract
        self.token_contract.write(token_contract);
        
        // Initialize KPI validators
        let mut i = 0;
        loop {
            if i >= initial_validators.len() {
                break;
            }
            let validator = *initial_validators.at(i);
            self.kpi_validators.write(validator, true);
            self.access_control._grant_role(KPI_VALIDATOR_ROLE, validator);
            i += 1;
        };
        self.validator_count.write(initial_validators.len().try_into().unwrap());

        // Set configuration
        self.default_grace_period.write(default_grace_period);
        self.challenge_period.write(challenge_period);
        
        // Initialize counters
        self.next_challenge_id.write(1);
        self.total_schedules.write(0);
        self.total_milestones.write(0);
    }

    #[abi(embed_v0)]
    impl MilestoneVestingImpl of super::IMilestoneVesting<ContractState> {
        
        fn create_milestone_schedule(
            ref self: ContractState,
            beneficiary: ContractAddress,
            total_amount: u256,
            milestone_ids: Array<u256>,
            milestone_amounts: Array<u256>,
            milestone_deadlines: Array<u64>,
            schedule_id: u256
        ) {
            // Security checks
            self.access_control.assert_only_role(ADMIN_ROLE);
            self.pausable.assert_not_paused();
            self.reentrancy_guard.start();

            // Input validation
            assert(!beneficiary.is_zero(), 'Invalid beneficiary');
            assert(total_amount > 0, 'Amount must be positive');
            assert(milestone_ids.len() == milestone_amounts.len(), 'Array length mismatch');
            assert(milestone_ids.len() == milestone_deadlines.len(), 'Array length mismatch');
            assert(milestone_ids.len() > 0, 'No milestones provided');
            assert(self.milestone_schedules.read(schedule_id).beneficiary.is_zero(), 'Schedule exists');

            // Validate milestone amounts sum to total
            let mut total_milestone_amount = 0;
            let mut i = 0;
            loop {
                if i >= milestone_amounts.len() {
                    break;
                }
                total_milestone_amount += *milestone_amounts.at(i);
                i += 1;
            };
            assert(total_milestone_amount == total_amount, 'Amount mismatch');

            // Check token balance
            let token = IERC20Dispatcher { contract_address: self.token_contract.read() };
            let contract_balance = token.balance_of(get_contract_address());
            assert(contract_balance >= total_amount, 'Insufficient balance');

            // Create milestone schedule
            let schedule = MilestoneSchedule {
                beneficiary,
                total_amount,
                released_amount: 0,
                milestones_count: milestone_ids.len().try_into().unwrap(),
                completed_milestones: 0,
                created_time: get_block_timestamp(),
                is_active: true,
                is_paused: false,
                schedule_type: 'ADVISOR_QUARTERLY',
                compliance_approved: true,
                grace_period: self.default_grace_period.read(),
                performance_score: 10000 // Perfect score initially
            };

            self.milestone_schedules.write(schedule_id, schedule);

            // Create individual milestones
            i = 0;
            loop {
                if i >= milestone_ids.len() {
                    break;
                }
                let milestone_id = *milestone_ids.at(i);
                let milestone = Milestone {
                    milestone_id,
                    schedule_id,
                    description_hash: 0, // To be set separately
                    kpi_requirements_hash: 0, // To be set separately
                    amount: *milestone_amounts.at(i),
                    deadline: *milestone_deadlines.at(i),
                    completion_time: 0,
                    validator: ContractAddress::default(),
                    evidence_hash: 0,
                    status: MilestoneStatus::Pending,
                    challenge_count: 0,
                    validation_time: 0,
                    is_released: false
                };

                self.milestones.write(milestone_id, milestone);
                self.schedule_milestones.write((schedule_id, i.try_into().unwrap()), milestone_id);
                i += 1;
            };

            // Update advisor tracking
            let advisor_count = self.advisor_schedules.read(beneficiary);
            self.advisor_schedule_ids.write((beneficiary, advisor_count), schedule_id);
            self.advisor_schedules.write(beneficiary, advisor_count + 1);
            
            // Update totals
            self.total_schedules.write(self.total_schedules.read() + 1);
            self.total_milestones.write(self.total_milestones.read() + milestone_ids.len().into());
            self.total_schedules_created.write(self.total_schedules_created.read() + 1);

            // Initialize advisor performance score
            if self.advisor_performance.read(beneficiary) == 0 {
                self.advisor_performance.write(beneficiary, 10000);
            }

            // Emit event for audit trail
            self.emit(MilestoneScheduleCreated {
                schedule_id,
                beneficiary,
                total_amount,
                milestones_count: milestone_ids.len().try_into().unwrap(),
                created_by: get_caller_address(),
                timestamp: get_block_timestamp()
            });

            self.reentrancy_guard.end();
        }

        fn validate_milestone_completion(ref self: ContractState, milestone_id: u256, evidence_hash: felt252) {
            self.access_control.assert_only_role(KPI_VALIDATOR_ROLE);
            self.pausable.assert_not_paused();

            let mut milestone = self.milestones.read(milestone_id);
            assert(milestone.status == MilestoneStatus::Submitted, 'Invalid milestone status');
            
            let current_time = get_block_timestamp();
            let extended_deadline = milestone.deadline + self.default_grace_period.read();
            
            // Check if within grace period
            let validation_outcome = if milestone.completion_time <= extended_deadline {
                milestone.status = MilestoneStatus::Validated;
                milestone.validator = get_caller_address();
                milestone.validation_time = current_time;
                true
            } else {
                milestone.status = MilestoneStatus::Failed;
                milestone.validation_time = current_time;
                false
            };

            self.milestones.write(milestone_id, milestone);
            self.pending_validations.write(milestone_id, false);

            // Update schedule progress if validated
            if validation_outcome {
                let mut schedule = self.milestone_schedules.read(milestone.schedule_id);
                schedule.completed_milestones += 1;
                self.milestone_schedules.write(milestone.schedule_id, schedule);
                
                // Update performance score
                self._update_advisor_performance(schedule.beneficiary, milestone_id, true);
                
                self.total_milestones_completed.write(self.total_milestones_completed.read() + 1);
            } else {
                // Update performance score for failure
                let schedule = self.milestone_schedules.read(milestone.schedule_id);
                self._update_advisor_performance(schedule.beneficiary, milestone_id, false);
                
                self.total_milestones_failed.write(self.total_milestones_failed.read() + 1);
            }

            self.emit(MilestoneValidated {
                milestone_id,
                validator: get_caller_address(),
                validation_outcome,
                timestamp: current_time
            });
        }

        fn release_milestone_tokens(ref self: ContractState, milestone_id: u256) -> u256 {
            self.pausable.assert_not_paused();
            self.reentrancy_guard.start();

            let mut milestone = self.milestones.read(milestone_id);
            assert(milestone.status == MilestoneStatus::Validated, 'Milestone not validated');
            assert(!milestone.is_released, 'Already released');

            let schedule = self.milestone_schedules.read(milestone.schedule_id);
            assert(schedule.is_active, 'Schedule not active');
            assert(!schedule.is_paused, 'Schedule is paused');

            // Check if challenge period has passed
            let challenge_window_end = milestone.validation_time + self.challenge_period.read();
            assert(get_block_timestamp() >= challenge_window_end, 'Challenge period active');

            // Mark as released
            milestone.is_released = true;
            milestone.status = MilestoneStatus::Released;
            self.milestones.write(milestone_id, milestone);

            // Update schedule
            let mut updated_schedule = schedule;
            updated_schedule.released_amount += milestone.amount;
            self.milestone_schedules.write(milestone.schedule_id, updated_schedule);

            // Transfer tokens
            let token = IERC20Dispatcher { contract_address: self.token_contract.read() };
            token.transfer(schedule.beneficiary, milestone.amount);

            self.emit(MilestoneTokensReleased {
                milestone_id,
                beneficiary: schedule.beneficiary,
                amount: milestone.amount,
                timestamp: get_block_timestamp()
            });

            self.reentrancy_guard.end();
            milestone.amount
        }

        fn challenge_milestone(ref self: ContractState, milestone_id: u256, challenge_reason: felt252) {
            self.access_control.assert_only_role(CHALLENGE_ROLE);
            
            let milestone = self.milestones.read(milestone_id);
            assert(milestone.status == MilestoneStatus::Validated, 'Invalid milestone status');
            assert(!milestone.is_released, 'Already released');

            // Check if within challenge period
            let challenge_deadline = milestone.validation_time + self.challenge_period.read();
            assert(get_block_timestamp() <= challenge_deadline, 'Challenge period expired');

            let challenge_id = self.next_challenge_id.read();
            let challenge = Challenge {
                challenger: get_caller_address(),
                milestone_id,
                reason: challenge_reason,
                evidence_hash: 0, // To be provided separately
                created_time: get_block_timestamp(),
                resolved: false,
                resolution_time: 0,
                resolution_outcome: false
            };

            self.challenges.write(challenge_id, challenge);
            let challenge_count = self.milestone_challenges.read(milestone_id);
            self.milestone_challenges.write(milestone_id, challenge_count + 1);
            self.next_challenge_id.write(challenge_id + 1);
            self.total_challenges_raised.write(self.total_challenges_raised.read() + 1);

            // Update milestone status
            let mut updated_milestone = milestone;
            updated_milestone.status = MilestoneStatus::Challenged;
            updated_milestone.challenge_count += 1;
            self.milestones.write(milestone_id, updated_milestone);

            self.emit(MilestoneChallenged {
                challenge_id,
                milestone_id,
                challenger: get_caller_address(),
                reason: challenge_reason,
                timestamp: get_block_timestamp()
            });
        }

        // View functions
        fn get_milestone_schedule(self: @ContractState, schedule_id: u256) -> MilestoneSchedule {
            self.milestone_schedules.read(schedule_id)
        }

        fn get_milestone_details(self: @ContractState, milestone_id: u256) -> Milestone {
            self.milestones.read(milestone_id)
        }

        fn get_schedule_progress(self: @ContractState, schedule_id: u256) -> (u256, u256, u256) {
            let schedule = self.milestone_schedules.read(schedule_id);
            (
                schedule.completed_milestones.into(),
                schedule.milestones_count.into(),
                schedule.released_amount
            )
        }

        fn get_advisor_schedules(self: @ContractState, advisor: ContractAddress) -> Array<u256> {
            let schedule_count = self.advisor_schedules.read(advisor);
            let mut schedules = ArrayTrait::new();
            let mut i = 0;
            
            loop {
                if i >= schedule_count {
                    break;
                }
                let schedule_id = self.advisor_schedule_ids.read((advisor, i));
                schedules.append(schedule_id);
                i += 1;
            };

            schedules
        }

        fn get_pending_validations(self: @ContractState) -> Array<u256> {
            let mut pending = ArrayTrait::new();
            let total_milestones = self.total_milestones.read();
            let mut i = 1;
            
            loop {
                if i > total_milestones {
                    break;
                }
                if self.pending_validations.read(i) {
                    pending.append(i);
                }
                i += 1;
            };

            pending
        }

        // KPI management functions
        fn add_kpi_validator(ref self: ContractState, validator: ContractAddress) {
            self.access_control.assert_only_role(ADMIN_ROLE);
            
            self.kpi_validators.write(validator, true);
            self.access_control._grant_role(KPI_VALIDATOR_ROLE, validator);
            self.validator_count.write(self.validator_count.read() + 1);

            self.emit(KPIValidatorAdded {
                validator,
                added_by: get_caller_address(),
                timestamp: get_block_timestamp()
            });
        }

        fn remove_kpi_validator(ref self: ContractState, validator: ContractAddress) {
            self.access_control.assert_only_role(ADMIN_ROLE);
            
            self.kpi_validators.write(validator, false);
            self.access_control._revoke_role(KPI_VALIDATOR_ROLE, validator);
            self.validator_count.write(self.validator_count.read() - 1);

            self.emit(KPIValidatorRemoved {
                validator,
                removed_by: get_caller_address(),
                timestamp: get_block_timestamp()
            });
        }

        fn update_milestone_kpi(ref self: ContractState, milestone_id: u256, new_kpi_hash: felt252) {
            self.access_control.assert_only_role(ADMIN_ROLE);
            
            let mut milestone = self.milestones.read(milestone_id);
            assert(milestone.status == MilestoneStatus::Pending, 'Cannot update KPI');
            
            let old_kpi_hash = milestone.kpi_requirements_hash;
            milestone.kpi_requirements_hash = new_kpi_hash;
            self.milestones.write(milestone_id, milestone);

            self.emit(MilestoneKPIUpdated {
                milestone_id,
                old_kpi_hash,
                new_kpi_hash,
                updated_by: get_caller_address(),
                timestamp: get_block_timestamp()
            });
        }

        fn set_milestone_grace_period(ref self: ContractState, grace_period: u64) {
            self.access_control.assert_only_role(ADMIN_ROLE);
            self.default_grace_period.write(grace_period);
        }

        // Emergency controls
        fn pause_milestone_schedule(ref self: ContractState, schedule_id: u256, reason: felt252) {
            self.access_control.assert_only_role(ADMIN_ROLE);
            
            let mut schedule = self.milestone_schedules.read(schedule_id);
            assert(schedule.is_active, 'Schedule not active');
            assert(!schedule.is_paused, 'Already paused');
            
            schedule.is_paused = true;
            self.milestone_schedules.write(schedule_id, schedule);

            self.emit(SchedulePaused {
                schedule_id,
                beneficiary: schedule.beneficiary,
                reason,
                paused_by: get_caller_address(),
                timestamp: get_block_timestamp()
            });
        }

        fn resume_milestone_schedule(ref self: ContractState, schedule_id: u256) {
            self.access_control.assert_only_role(ADMIN_ROLE);
            
            let mut schedule = self.milestone_schedules.read(schedule_id);
            assert(schedule.is_active, 'Schedule not active');
            assert(schedule.is_paused, 'Not paused');
            
            schedule.is_paused = false;
            self.milestone_schedules.write(schedule_id, schedule);

            self.emit(ScheduleResumed {
                schedule_id,
                beneficiary: schedule.beneficiary,
                resumed_by: get_caller_address(),
                timestamp: get_block_timestamp()
            });
        }

        fn revoke_milestone_schedule(ref self: ContractState, schedule_id: u256, reason: felt252) {
            self.access_control.assert_only_role(ADMIN_ROLE);
            
            let mut schedule = self.milestone_schedules.read(schedule_id);
            assert(schedule.is_active, 'Schedule not active');
            
            let revoked_amount = schedule.total_amount - schedule.released_amount;
            schedule.is_active = false;
            self.milestone_schedules.write(schedule_id, schedule);
            self.total_schedules_revoked.write(self.total_schedules_revoked.read() + 1);

            self.emit(ScheduleRevoked {
                schedule_id,
                beneficiary: schedule.beneficiary,
                revoked_amount,
                reason,
                revoked_by: get_caller_address(),
                timestamp: get_block_timestamp()
            });
        }

        fn extend_milestone_deadline(ref self: ContractState, milestone_id: u256, extension: u64) {
            self.access_control.assert_only_role(ADMIN_ROLE);
            
            let mut milestone = self.milestones.read(milestone_id);
            assert(milestone.status == MilestoneStatus::Pending, 'Cannot extend deadline');
            
            let old_deadline = milestone.deadline;
            milestone.deadline += extension;
            self.milestones.write(milestone_id, milestone);

            self.emit(MilestoneExtended {
                milestone_id,
                old_deadline,
                new_deadline: milestone.deadline,
                extension_reason: 'ADMIN_EXTENSION',
                authorized_by: get_caller_address(),
                timestamp: get_block_timestamp()
            });
        }
    }

    // Internal helper functions
    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn _update_advisor_performance(ref self: ContractState, advisor: ContractAddress, milestone_id: u256, success: bool) {
            let current_score = self.advisor_performance.read(advisor);
            
            // Performance scoring: success = +50 points, failure = -200 points
            let new_score = if success {
                if current_score < 9950 {
                    current_score + 50
                } else {
                    10000
                }
            } else {
                if current_score >= 200 {
                    current_score - 200
                } else {
                    0
                }
            };

            self.advisor_performance.write(advisor, new_score);

            self.emit(AdvisorPerformanceUpdated {
                advisor,
                old_score: current_score,
                new_score,
                milestone_id,
                timestamp: get_block_timestamp()
            });
        }
    }
} 