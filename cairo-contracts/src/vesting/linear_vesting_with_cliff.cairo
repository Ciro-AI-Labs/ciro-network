//! Linear Vesting with Cliff Contract
//! CIRO Network - Production-Ready Vesting System
//! Handles Team, Private Sale, Seed Round, and Development allocations

use starknet::ContractAddress;

#[starknet::interface]
pub trait ILinearVestingWithCliff<TContractState> {
    // Core vesting functions
    fn create_vesting_schedule(
        ref self: TContractState,
        beneficiary: ContractAddress,
        total_amount: u256,
        cliff_duration: u64,
        vesting_duration: u64,
        start_time: u64,
        schedule_id: u256
    );
    fn release_vested_tokens(ref self: TContractState, schedule_id: u256) -> u256;
    fn release_vested_tokens_for_beneficiary(ref self: TContractState, beneficiary: ContractAddress) -> u256;
    
    // View functions
    fn get_vesting_schedule(self: @TContractState, schedule_id: u256) -> VestingSchedule;
    fn get_vested_amount(self: @TContractState, schedule_id: u256) -> u256;
    fn get_releasable_amount(self: @TContractState, schedule_id: u256) -> u256;
    fn get_total_vesting_schedules(self: @TContractState) -> u256;
    fn get_beneficiary_schedules(self: @TContractState, beneficiary: ContractAddress) -> Array<u256>;
    
    // Multi-sig administration  
    fn propose_emergency_pause(ref self: TContractState, reason: felt252);
    fn execute_emergency_pause(ref self: TContractState, proposal_id: u256);
    fn propose_schedule_revocation(ref self: TContractState, schedule_id: u256, reason: felt252);
    fn execute_schedule_revocation(ref self: TContractState, proposal_id: u256);
    fn update_multisig_threshold(ref self: TContractState, new_threshold: u8);
    
    // Compliance functions
    fn add_compliance_officer(ref self: TContractState, officer: ContractAddress);
    fn remove_compliance_officer(ref self: TContractState, officer: ContractAddress);
    fn flag_schedule_for_review(ref self: TContractState, schedule_id: u256, reason: felt252);
    fn approve_flagged_schedule(ref self: TContractState, schedule_id: u256);
}

#[derive(Drop, Serde, starknet::Store)]
pub struct VestingSchedule {
    pub beneficiary: ContractAddress,
    pub total_amount: u256,
    pub released_amount: u256,
    pub cliff_duration: u64,      // Cliff period in seconds
    pub vesting_duration: u64,    // Total vesting duration in seconds
    pub start_time: u64,          // Unix timestamp
    pub created_time: u64,        // Creation timestamp
    pub is_revocable: bool,       // Can be revoked by governance
    pub is_active: bool,          // Schedule status
    pub schedule_type: felt252,   // 'TEAM', 'PRIVATE', 'SEED', 'DEVELOPMENT'
    pub compliance_approved: bool // KYC/AML approval status
}

#[derive(Drop, Serde, starknet::Store)]
pub struct MultiSigProposal {
    pub proposer: ContractAddress,
    pub proposal_type: felt252,   // 'PAUSE', 'REVOKE', 'THRESHOLD'
    pub target_id: u256,          // Schedule ID or new threshold
    pub reason: felt252,
    pub approvals: u8,
    pub executed: bool,
    pub created_time: u64,
    pub deadline: u64
}

// Component imports for production security
use openzeppelin::access::accesscontrol::AccessControlComponent;
use openzeppelin::security::reentrancyguard::ReentrancyGuardComponent;
use openzeppelin::security::pausable::PausableComponent;
use openzeppelin::upgrades::UpgradeableComponent;
use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};

#[starknet::contract]
mod LinearVestingWithCliff {
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
    const MULTISIG_ROLE: felt252 = 'MULTISIG';
    const COMPLIANCE_ROLE: felt252 = 'COMPLIANCE';
    const EMERGENCY_ROLE: felt252 = 'EMERGENCY';

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

        // Core vesting storage
        vesting_schedules: Map<u256, VestingSchedule>,
        beneficiary_schedules: Map<ContractAddress, u32>, // Count per beneficiary
        beneficiary_schedule_ids: Map<(ContractAddress, u32), u256>, // (beneficiary, index) -> schedule_id
        total_schedules: u256,
        total_vested_amount: u256,
        total_released_amount: u256,

        // Token contract
        token_contract: ContractAddress,
        
        // Multi-sig governance
        multisig_threshold: u8,
        multisig_members: Map<ContractAddress, bool>,
        multisig_member_count: u8,
        proposals: Map<u256, MultiSigProposal>,
        proposal_votes: Map<(u256, ContractAddress), bool>, // (proposal_id, voter) -> voted
        next_proposal_id: u256,

        // Compliance tracking
        compliance_officers: Map<ContractAddress, bool>,
        flagged_schedules: Map<u256, felt252>, // schedule_id -> reason
        kyc_approved_addresses: Map<ContractAddress, bool>,

        // Emergency controls
        emergency_pause_active: bool,
        emergency_pause_reason: felt252,
        emergency_pause_timestamp: u64,

        // Statistics for audit trail
        total_schedules_created: u256,
        total_schedules_revoked: u256,
        total_emergency_pauses: u256
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

        // Vesting events for audit trail
        VestingScheduleCreated: VestingScheduleCreated,
        TokensReleased: TokensReleased,
        VestingScheduleRevoked: VestingScheduleRevoked,
        
        // Multi-sig governance events
        ProposalCreated: ProposalCreated,
        ProposalExecuted: ProposalExecuted,
        MultiSigThresholdUpdated: MultiSigThresholdUpdated,
        
        // Compliance events
        ScheduleFlaggedForReview: ScheduleFlaggedForReview,
        ScheduleApproved: ScheduleApproved,
        ComplianceOfficerAdded: ComplianceOfficerAdded,
        ComplianceOfficerRemoved: ComplianceOfficerRemoved,
        
        // Emergency events
        EmergencyPauseProposed: EmergencyPauseProposed,
        EmergencyPauseExecuted: EmergencyPauseExecuted,
        EmergencyPauseRevoked: EmergencyPauseRevoked
    }

    // Event structures for comprehensive audit trail
    #[derive(Drop, starknet::Event)]
    struct VestingScheduleCreated {
        #[key]
        schedule_id: u256,
        #[key]
        beneficiary: ContractAddress,
        total_amount: u256,
        cliff_duration: u64,
        vesting_duration: u64,
        start_time: u64,
        schedule_type: felt252,
        creator: ContractAddress,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct TokensReleased {
        #[key]
        schedule_id: u256,
        #[key]
        beneficiary: ContractAddress,
        amount: u256,
        total_released: u256,
        remaining_amount: u256,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct VestingScheduleRevoked {
        #[key]
        schedule_id: u256,
        #[key]
        beneficiary: ContractAddress,
        revoked_amount: u256,
        reason: felt252,
        executor: ContractAddress,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct ProposalCreated {
        #[key]
        proposal_id: u256,
        proposer: ContractAddress,
        proposal_type: felt252,
        target_id: u256,
        reason: felt252,
        deadline: u64,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct ProposalExecuted {
        #[key]
        proposal_id: u256,
        executor: ContractAddress,
        final_approvals: u8,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct MultiSigThresholdUpdated {
        old_threshold: u8,
        new_threshold: u8,
        updated_by: ContractAddress,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct ScheduleFlaggedForReview {
        #[key]
        schedule_id: u256,
        #[key]
        beneficiary: ContractAddress,
        reason: felt252,
        flagged_by: ContractAddress,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct ScheduleApproved {
        #[key]
        schedule_id: u256,
        #[key]
        beneficiary: ContractAddress,
        approved_by: ContractAddress,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct ComplianceOfficerAdded {
        #[key]
        officer: ContractAddress,
        added_by: ContractAddress,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct ComplianceOfficerRemoved {
        #[key]
        officer: ContractAddress,
        removed_by: ContractAddress,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct EmergencyPauseProposed {
        #[key]
        proposal_id: u256,
        proposer: ContractAddress,
        reason: felt252,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct EmergencyPauseExecuted {
        #[key]
        proposal_id: u256,
        executor: ContractAddress,
        reason: felt252,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct EmergencyPauseRevoked {
        #[key]
        executor: ContractAddress,
        timestamp: u64
    }

    // Constructor for production deployment
    #[constructor]
    fn constructor(
        ref self: ContractState,
        token_contract: ContractAddress,
        initial_multisig_members: Array<ContractAddress>,
        multisig_threshold: u8,
        admin: ContractAddress
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
        
        // Initialize multi-sig
        assert(multisig_threshold > 0 && multisig_threshold <= initial_multisig_members.len().into(), 'Invalid threshold');
        self.multisig_threshold.write(multisig_threshold);
        self.multisig_member_count.write(initial_multisig_members.len().try_into().unwrap());
        
        let mut i = 0;
        loop {
            if i >= initial_multisig_members.len() {
                break;
            }
            let member = *initial_multisig_members.at(i);
            self.multisig_members.write(member, true);
            self.access_control._grant_role(MULTISIG_ROLE, member);
            i += 1;
        };

        // Initialize counters
        self.next_proposal_id.write(1);
        self.total_schedules.write(0);
    }

    #[abi(embed_v0)]
    impl LinearVestingWithCliffImpl of super::ILinearVestingWithCliff<ContractState> {
        
        fn create_vesting_schedule(
            ref self: ContractState,
            beneficiary: ContractAddress,
            total_amount: u256,
            cliff_duration: u64,
            vesting_duration: u64,
            start_time: u64,
            schedule_id: u256
        ) {
            // Security checks
            self.access_control.assert_only_role(ADMIN_ROLE);
            self.pausable.assert_not_paused();
            self.reentrancy_guard.start();

            // Input validation
            assert(!beneficiary.is_zero(), 'Invalid beneficiary');
            assert(total_amount > 0, 'Amount must be positive');
            assert(vesting_duration > cliff_duration, 'Invalid vesting duration');
            assert(start_time >= get_block_timestamp(), 'Start time in past');
            assert(self.vesting_schedules.read(schedule_id).beneficiary.is_zero(), 'Schedule ID exists');

            // Check token balance
            let token = IERC20Dispatcher { contract_address: self.token_contract.read() };
            let contract_balance = token.balance_of(get_contract_address());
            assert(contract_balance >= total_amount, 'Insufficient token balance');

            // Create vesting schedule
            let schedule = VestingSchedule {
                beneficiary,
                total_amount,
                released_amount: 0,
                cliff_duration,
                vesting_duration,
                start_time,
                created_time: get_block_timestamp(),
                is_revocable: true,
                is_active: true,
                schedule_type: 'LINEAR',
                compliance_approved: self.kyc_approved_addresses.read(beneficiary)
            };

            // Store schedule
            self.vesting_schedules.write(schedule_id, schedule);
            
            // Update beneficiary tracking
            let beneficiary_count = self.beneficiary_schedules.read(beneficiary);
            self.beneficiary_schedule_ids.write((beneficiary, beneficiary_count), schedule_id);
            self.beneficiary_schedules.write(beneficiary, beneficiary_count + 1);
            
            // Update totals
            let total_schedules = self.total_schedules.read() + 1;
            self.total_schedules.write(total_schedules);
            self.total_vested_amount.write(self.total_vested_amount.read() + total_amount);
            self.total_schedules_created.write(self.total_schedules_created.read() + 1);

            // Emit event for audit trail
            self.emit(VestingScheduleCreated {
                schedule_id,
                beneficiary,
                total_amount,
                cliff_duration,
                vesting_duration,
                start_time,
                schedule_type: 'LINEAR',
                creator: get_caller_address(),
                timestamp: get_block_timestamp()
            });

            self.reentrancy_guard.end();
        }

        fn release_vested_tokens(ref self: ContractState, schedule_id: u256) -> u256 {
            self.pausable.assert_not_paused();
            self.reentrancy_guard.start();

            let mut schedule = self.vesting_schedules.read(schedule_id);
            assert(schedule.is_active, 'Schedule not active');
            assert(!self.emergency_pause_active.read(), 'Emergency pause active');

            // Check compliance approval
            if !schedule.compliance_approved {
                assert(self.flagged_schedules.read(schedule_id) == 0, 'Schedule flagged for review');
            }

            // Calculate releasable amount
            let releasable = self._calculate_releasable_amount(schedule_id);
            assert(releasable > 0, 'No tokens to release');

            // Update schedule
            schedule.released_amount += releasable;
            self.vesting_schedules.write(schedule_id, schedule);
            
            // Update totals
            self.total_released_amount.write(self.total_released_amount.read() + releasable);

            // Transfer tokens
            let token = IERC20Dispatcher { contract_address: self.token_contract.read() };
            token.transfer(schedule.beneficiary, releasable);

            // Emit event for audit trail
            self.emit(TokensReleased {
                schedule_id,
                beneficiary: schedule.beneficiary,
                amount: releasable,
                total_released: schedule.released_amount,
                remaining_amount: schedule.total_amount - schedule.released_amount,
                timestamp: get_block_timestamp()
            });

            self.reentrancy_guard.end();
            releasable
        }

        fn release_vested_tokens_for_beneficiary(ref self: ContractState, beneficiary: ContractAddress) -> u256 {
            self.pausable.assert_not_paused();
            
            let schedule_count = self.beneficiary_schedules.read(beneficiary);
            let mut total_released = 0;
            let mut i = 0;
            
            loop {
                if i >= schedule_count {
                    break;
                }
                let schedule_id = self.beneficiary_schedule_ids.read((beneficiary, i));
                let releasable = self.get_releasable_amount(schedule_id);
                if releasable > 0 {
                    total_released += self.release_vested_tokens(schedule_id);
                }
                i += 1;
            };

            total_released
        }

        // View functions
        fn get_vesting_schedule(self: @ContractState, schedule_id: u256) -> VestingSchedule {
            self.vesting_schedules.read(schedule_id)
        }

        fn get_vested_amount(self: @ContractState, schedule_id: u256) -> u256 {
            self._calculate_vested_amount(schedule_id)
        }

        fn get_releasable_amount(self: @ContractState, schedule_id: u256) -> u256 {
            self._calculate_releasable_amount(schedule_id)
        }

        fn get_total_vesting_schedules(self: @ContractState) -> u256 {
            self.total_schedules.read()
        }

        fn get_beneficiary_schedules(self: @ContractState, beneficiary: ContractAddress) -> Array<u256> {
            let schedule_count = self.beneficiary_schedules.read(beneficiary);
            let mut schedules = ArrayTrait::new();
            let mut i = 0;
            
            loop {
                if i >= schedule_count {
                    break;
                }
                let schedule_id = self.beneficiary_schedule_ids.read((beneficiary, i));
                schedules.append(schedule_id);
                i += 1;
            };

            schedules
        }

        // Multi-sig administration functions
        fn propose_emergency_pause(ref self: ContractState, reason: felt252) {
            self.access_control.assert_only_role(EMERGENCY_ROLE);
            
            let proposal_id = self.next_proposal_id.read();
            let proposal = MultiSigProposal {
                proposer: get_caller_address(),
                proposal_type: 'PAUSE',
                target_id: 0,
                reason,
                approvals: 1,
                executed: false,
                created_time: get_block_timestamp(),
                deadline: get_block_timestamp() + 86400 // 24 hours
            };

            self.proposals.write(proposal_id, proposal);
            self.proposal_votes.write((proposal_id, get_caller_address()), true);
            self.next_proposal_id.write(proposal_id + 1);

            self.emit(EmergencyPauseProposed {
                proposal_id,
                proposer: get_caller_address(),
                reason,
                timestamp: get_block_timestamp()
            });
        }

        fn execute_emergency_pause(ref self: ContractState, proposal_id: u256) {
            self.access_control.assert_only_role(EMERGENCY_ROLE);
            
            let mut proposal = self.proposals.read(proposal_id);
            assert(proposal.proposal_type == 'PAUSE', 'Invalid proposal type');
            assert(!proposal.executed, 'Already executed');
            assert(get_block_timestamp() <= proposal.deadline, 'Proposal expired');

            // Check if caller already voted
            if !self.proposal_votes.read((proposal_id, get_caller_address())) {
                proposal.approvals += 1;
                self.proposal_votes.write((proposal_id, get_caller_address()), true);
            }

            // Check if threshold met
            if proposal.approvals >= self.multisig_threshold.read() {
                proposal.executed = true;
                self.emergency_pause_active.write(true);
                self.emergency_pause_reason.write(proposal.reason);
                self.emergency_pause_timestamp.write(get_block_timestamp());
                self.total_emergency_pauses.write(self.total_emergency_pauses.read() + 1);

                self.emit(EmergencyPauseExecuted {
                    proposal_id,
                    executor: get_caller_address(),
                    reason: proposal.reason,
                    timestamp: get_block_timestamp()
                });
            }

            self.proposals.write(proposal_id, proposal);
        }

        fn propose_schedule_revocation(ref self: ContractState, schedule_id: u256, reason: felt252) {
            self.access_control.assert_only_role(ADMIN_ROLE);
            
            let schedule = self.vesting_schedules.read(schedule_id);
            assert(schedule.is_active, 'Schedule not active');
            assert(schedule.is_revocable, 'Schedule not revocable');

            let proposal_id = self.next_proposal_id.read();
            let proposal = MultiSigProposal {
                proposer: get_caller_address(),
                proposal_type: 'REVOKE',
                target_id: schedule_id,
                reason,
                approvals: 1,
                executed: false,
                created_time: get_block_timestamp(),
                deadline: get_block_timestamp() + 604800 // 7 days
            };

            self.proposals.write(proposal_id, proposal);
            self.proposal_votes.write((proposal_id, get_caller_address()), true);
            self.next_proposal_id.write(proposal_id + 1);

            self.emit(ProposalCreated {
                proposal_id,
                proposer: get_caller_address(),
                proposal_type: 'REVOKE',
                target_id: schedule_id,
                reason,
                deadline: proposal.deadline,
                timestamp: get_block_timestamp()
            });
        }

        fn execute_schedule_revocation(ref self: ContractState, proposal_id: u256) {
            self.access_control.assert_only_role(MULTISIG_ROLE);
            
            let mut proposal = self.proposals.read(proposal_id);
            assert(proposal.proposal_type == 'REVOKE', 'Invalid proposal type');
            assert(!proposal.executed, 'Already executed');
            assert(get_block_timestamp() <= proposal.deadline, 'Proposal expired');

            // Check if caller already voted
            if !self.proposal_votes.read((proposal_id, get_caller_address())) {
                proposal.approvals += 1;
                self.proposal_votes.write((proposal_id, get_caller_address()), true);
            }

            // Check if threshold met
            if proposal.approvals >= self.multisig_threshold.read() {
                proposal.executed = true;
                
                // Revoke the schedule
                let schedule_id = proposal.target_id;
                let mut schedule = self.vesting_schedules.read(schedule_id);
                let revoked_amount = schedule.total_amount - schedule.released_amount;
                
                schedule.is_active = false;
                self.vesting_schedules.write(schedule_id, schedule);
                self.total_schedules_revoked.write(self.total_schedules_revoked.read() + 1);

                self.emit(VestingScheduleRevoked {
                    schedule_id,
                    beneficiary: schedule.beneficiary,
                    revoked_amount,
                    reason: proposal.reason,
                    executor: get_caller_address(),
                    timestamp: get_block_timestamp()
                });

                self.emit(ProposalExecuted {
                    proposal_id,
                    executor: get_caller_address(),
                    final_approvals: proposal.approvals,
                    timestamp: get_block_timestamp()
                });
            }

            self.proposals.write(proposal_id, proposal);
        }

        fn update_multisig_threshold(ref self: ContractState, new_threshold: u8) {
            self.access_control.assert_only_role(ADMIN_ROLE);
            
            let member_count = self.multisig_member_count.read();
            assert(new_threshold > 0 && new_threshold <= member_count, 'Invalid threshold');
            
            let old_threshold = self.multisig_threshold.read();
            self.multisig_threshold.write(new_threshold);

            self.emit(MultiSigThresholdUpdated {
                old_threshold,
                new_threshold,
                updated_by: get_caller_address(),
                timestamp: get_block_timestamp()
            });
        }

        // Compliance functions
        fn add_compliance_officer(ref self: ContractState, officer: ContractAddress) {
            self.access_control.assert_only_role(ADMIN_ROLE);
            
            self.compliance_officers.write(officer, true);
            self.access_control._grant_role(COMPLIANCE_ROLE, officer);

            self.emit(ComplianceOfficerAdded {
                officer,
                added_by: get_caller_address(),
                timestamp: get_block_timestamp()
            });
        }

        fn remove_compliance_officer(ref self: ContractState, officer: ContractAddress) {
            self.access_control.assert_only_role(ADMIN_ROLE);
            
            self.compliance_officers.write(officer, false);
            self.access_control._revoke_role(COMPLIANCE_ROLE, officer);

            self.emit(ComplianceOfficerRemoved {
                officer,
                removed_by: get_caller_address(),
                timestamp: get_block_timestamp()
            });
        }

        fn flag_schedule_for_review(ref self: ContractState, schedule_id: u256, reason: felt252) {
            self.access_control.assert_only_role(COMPLIANCE_ROLE);
            
            let schedule = self.vesting_schedules.read(schedule_id);
            assert(schedule.is_active, 'Schedule not active');
            
            self.flagged_schedules.write(schedule_id, reason);

            self.emit(ScheduleFlaggedForReview {
                schedule_id,
                beneficiary: schedule.beneficiary,
                reason,
                flagged_by: get_caller_address(),
                timestamp: get_block_timestamp()
            });
        }

        fn approve_flagged_schedule(ref self: ContractState, schedule_id: u256) {
            self.access_control.assert_only_role(COMPLIANCE_ROLE);
            
            let schedule = self.vesting_schedules.read(schedule_id);
            assert(schedule.is_active, 'Schedule not active');
            assert(self.flagged_schedules.read(schedule_id) != 0, 'Schedule not flagged');
            
            self.flagged_schedules.write(schedule_id, 0);

            self.emit(ScheduleApproved {
                schedule_id,
                beneficiary: schedule.beneficiary,
                approved_by: get_caller_address(),
                timestamp: get_block_timestamp()
            });
        }
    }

    // Internal helper functions
    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn _calculate_vested_amount(self: @ContractState, schedule_id: u256) -> u256 {
            let schedule = self.vesting_schedules.read(schedule_id);
            if !schedule.is_active {
                return 0;
            }

            let current_time = get_block_timestamp();
            let cliff_end = schedule.start_time + schedule.cliff_duration;
            
            // Before cliff
            if current_time < cliff_end {
                return 0;
            }

            let vesting_end = schedule.start_time + schedule.vesting_duration;
            
            // After vesting completed
            if current_time >= vesting_end {
                return schedule.total_amount;
            }

            // Linear vesting calculation
            let vesting_time_elapsed = current_time - cliff_end;
            let total_vesting_time = vesting_end - cliff_end;
            
            (schedule.total_amount * vesting_time_elapsed.into()) / total_vesting_time.into()
        }

        fn _calculate_releasable_amount(self: @ContractState, schedule_id: u256) -> u256 {
            let schedule = self.vesting_schedules.read(schedule_id);
            let vested_amount = self._calculate_vested_amount(schedule_id);
            
            if vested_amount <= schedule.released_amount {
                0
            } else {
                vested_amount - schedule.released_amount
            }
        }
    }
} 