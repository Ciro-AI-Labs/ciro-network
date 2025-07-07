//! Burn Manager Contract - Hybrid Burning System
//! CIRO Network - Sophisticated Token Burning Mechanics
//! Implements automatic protocol burns + DAO-triggered Treasury burns with KPI gates

use starknet::ContractAddress;

#[starknet::interface]
pub trait IBurnManager<TContractState> {
    // Automatic burning functions
    fn burn_from_job_fees(ref self: TContractState, amount: u256);
    fn burn_from_slashing(ref self: TContractState, amount: u256);
    fn burn_from_gas_fees(ref self: TContractState, amount: u256);
    
    // KPI-based Treasury burns
    fn propose_kpi_burn(ref self: TContractState, milestone_type: felt252, required_amount: u256, evidence_hash: felt252);
    fn validate_kpi_achievement(ref self: TContractState, proposal_id: u256, validation_result: bool, validator_evidence: felt252);
    fn execute_kpi_burn(ref self: TContractState, proposal_id: u256);
    fn challenge_kpi_validation(ref self: TContractState, proposal_id: u256, challenge_reason: felt252);
    
    // Emergency burns
    fn propose_emergency_burn(ref self: TContractState, amount: u256, reason: felt252);
    fn execute_emergency_burn(ref self: TContractState, proposal_id: u256);
    
    // View functions
    fn get_total_burned(self: @TContractState) -> u256;
    fn get_burn_statistics(self: @TContractState) -> BurnStatistics;
    fn get_kpi_burn_proposal(self: @TContractState, proposal_id: u256) -> KPIBurnProposal;
    fn get_daily_burn_limits(self: @TContractState) -> (u256, u256, u256); // (automatic, treasury, total)
    fn get_remaining_daily_limits(self: @TContractState) -> (u256, u256, u256);
    fn can_execute_burn(self: @TContractState, burn_type: felt252, amount: u256) -> bool;
    
    // Administration
    fn update_burn_limits(ref self: TContractState, automatic_daily_limit: u256, treasury_daily_limit: u256);
    fn update_kpi_milestones(ref self: TContractState, milestone_updates: Array<KPIMilestone>);
    fn add_burn_authority(ref self: TContractState, authority: ContractAddress, role: felt252);
    fn remove_burn_authority(ref self: TContractState, authority: ContractAddress);
    fn pause_burn_type(ref self: TContractState, burn_type: felt252, reason: felt252);
    fn resume_burn_type(ref self: TContractState, burn_type: felt252);
}

#[derive(Drop, Serde, starknet::Store)]
pub struct BurnStatistics {
    pub total_burned: u256,
    pub job_fee_burns: u256,
    pub slashing_burns: u256,
    pub gas_fee_burns: u256,
    pub kpi_burns: u256,
    pub emergency_burns: u256,
    pub total_burn_events: u256,
    pub daily_burned_today: u256,
    pub last_burn_timestamp: u64,
    pub average_daily_burn: u256,
    pub burn_rate_7d: u256,       // 7-day moving average
    pub burn_rate_30d: u256       // 30-day moving average
}

#[derive(Drop, Serde, starknet::Store)]
pub struct KPIBurnProposal {
    pub proposal_id: u256,
    pub proposer: ContractAddress,
    pub milestone_type: felt252,   // 'ARR_250K', 'WORKERS_250', 'BREAKEVEN', etc.
    pub required_burn_amount: u256,
    pub evidence_hash: felt252,    // IPFS hash of achievement evidence
    pub created_time: u64,
    pub validation_deadline: u64,
    pub execution_deadline: u64,
    pub validator: ContractAddress,
    pub validation_result: bool,
    pub validation_evidence: felt252,
    pub validation_time: u64,
    pub status: ProposalStatus,
    pub challenge_count: u32,
    pub dao_approvals: u32,
    pub dao_threshold: u32,
    pub executed: bool,
    pub execution_time: u64
}

#[derive(Drop, Serde, starknet::Store)]
pub struct KPIMilestone {
    pub milestone_id: felt252,     // 'ARR_250K', 'WORKERS_250', etc.
    pub description: felt252,      // Short description
    pub target_value: u256,        // Target achievement value
    pub burn_amount: u256,         // Tokens to burn upon achievement
    pub oracle_source: ContractAddress, // Oracle for verification
    pub is_active: bool,
    pub achieved: bool,
    pub achievement_time: u64,
    pub evidence_hash: felt252,
    pub validator_required: bool
}

#[derive(Drop, Serde, starknet::Store)]
pub enum ProposalStatus {
    Pending,
    Validated,
    Challenged,
    Approved,
    Rejected,
    Executed,
    Expired
}

#[derive(Drop, Serde, starknet::Store)]
pub struct DailyBurnData {
    pub date: u64,                 // Unix timestamp (day start)
    pub automatic_burns: u256,
    pub treasury_burns: u256,
    pub total_burns: u256,
    pub burn_events_count: u32
}

#[derive(Drop, Serde, starknet::Store)]
pub struct Challenge {
    pub challenge_id: u256,
    pub proposal_id: u256,
    pub challenger: ContractAddress,
    pub reason: felt252,
    pub evidence_hash: felt252,
    pub created_time: u64,
    pub resolved: bool,
    pub resolution_outcome: bool,
    pub resolved_by: ContractAddress,
    pub resolution_time: u64
}

// Component imports for production security
use openzeppelin::access::accesscontrol::AccessControlComponent;
use openzeppelin::security::reentrancyguard::ReentrancyGuardComponent;
use openzeppelin::security::pausable::PausableComponent;
use openzeppelin::upgrades::UpgradeableComponent;
use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};

#[starknet::contract]
mod BurnManager {
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
    const BURN_AUTHORITY_ROLE: felt252 = 'BURN_AUTHORITY';
    const KPI_VALIDATOR_ROLE: felt252 = 'KPI_VALIDATOR';
    const DAO_ROLE: felt252 = 'DAO';
    const ORACLE_ROLE: felt252 = 'ORACLE';
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

        // Core burn tracking
        total_burned: u256,
        burn_statistics: BurnStatistics,
        daily_burn_data: Map<u64, DailyBurnData>, // date -> burn data

        // Token contracts
        ciro_token: ContractAddress,
        treasury_contract: ContractAddress,

        // Burn limits and controls
        automatic_daily_limit: u256,      // Max automatic burns per day
        treasury_daily_limit: u256,       // Max treasury burns per day
        total_daily_limit: u256,         // Max total burns per day
        emergency_daily_limit: u256,      // Max emergency burns per day
        
        // Daily tracking
        today_date: u64,                  // Current day timestamp
        today_automatic_burned: u256,
        today_treasury_burned: u256,
        today_total_burned: u256,

        // KPI burn proposals
        kpi_burn_proposals: Map<u256, KPIBurnProposal>,
        next_proposal_id: u256,
        kpi_milestones: Map<felt252, KPIMilestone>,
        active_milestone_count: u32,

        // Challenge system
        challenges: Map<u256, Challenge>,
        proposal_challenges: Map<u256, u32>, // proposal_id -> challenge count
        next_challenge_id: u256,
        challenge_period: u64,             // Time window for challenges

        // DAO governance
        dao_multisig_threshold: u32,
        dao_proposal_votes: Map<(u256, ContractAddress), bool>, // (proposal_id, voter) -> voted

        // Burn type controls
        burn_type_paused: Map<felt252, bool>, // burn_type -> paused status
        burn_type_pause_reason: Map<felt252, felt252>,

        // Historical tracking for analytics
        burn_history: Map<u256, u256>,     // block_number -> amount burned
        monthly_burns: Map<u64, u256>,     // month -> total burned
        yearly_burns: Map<u64, u256>,      // year -> total burned

        // Oracle integration
        price_oracle: ContractAddress,
        kpi_oracles: Map<felt252, ContractAddress>, // milestone_type -> oracle

        // Statistics for audit trail
        total_proposals_created: u256,
        total_proposals_executed: u256,
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

        // Burn events for audit trail
        AutomaticBurnExecuted: AutomaticBurnExecuted,
        KPIBurnProposed: KPIBurnProposed,
        KPIBurnValidated: KPIBurnValidated,
        KPIBurnExecuted: KPIBurnExecuted,
        EmergencyBurnExecuted: EmergencyBurnExecuted,
        
        // Challenge events
        BurnProposalChallenged: BurnProposalChallenged,
        ChallengeResolved: ChallengeResolved,
        
        // Administration events
        BurnLimitsUpdated: BurnLimitsUpdated,
        KPIMilestoneUpdated: KPIMilestoneUpdated,
        BurnTypePaused: BurnTypePaused,
        BurnTypeResumed: BurnTypeResumed,
        BurnAuthorityUpdated: BurnAuthorityUpdated,
        
        // Milestone achievement events
        KPIMilestoneAchieved: KPIMilestoneAchieved,
        
        // Analytics events
        DailyBurnLimitReached: DailyBurnLimitReached,
        BurnRateAlert: BurnRateAlert
    }

    // Event structures for comprehensive audit trail
    #[derive(Drop, starknet::Event)]
    struct AutomaticBurnExecuted {
        #[key]
        burn_type: felt252,
        amount: u256,
        source_contract: ContractAddress,
        total_burned_today: u256,
        remaining_daily_limit: u256,
        executor: ContractAddress,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct KPIBurnProposed {
        #[key]
        proposal_id: u256,
        #[key]
        proposer: ContractAddress,
        milestone_type: felt252,
        required_amount: u256,
        evidence_hash: felt252,
        validation_deadline: u64,
        execution_deadline: u64,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct KPIBurnValidated {
        #[key]
        proposal_id: u256,
        #[key]
        validator: ContractAddress,
        validation_result: bool,
        validation_evidence: felt252,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct KPIBurnExecuted {
        #[key]
        proposal_id: u256,
        milestone_type: felt252,
        amount: u256,
        treasury_balance_before: u256,
        treasury_balance_after: u256,
        executor: ContractAddress,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct EmergencyBurnExecuted {
        #[key]
        proposal_id: u256,
        amount: u256,
        reason: felt252,
        executor: ContractAddress,
        approvals_count: u32,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct BurnProposalChallenged {
        #[key]
        challenge_id: u256,
        #[key]
        proposal_id: u256,
        #[key]
        challenger: ContractAddress,
        reason: felt252,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct ChallengeResolved {
        #[key]
        challenge_id: u256,
        proposal_id: u256,
        resolution_outcome: bool,
        resolved_by: ContractAddress,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct BurnLimitsUpdated {
        old_automatic_limit: u256,
        new_automatic_limit: u256,
        old_treasury_limit: u256,
        new_treasury_limit: u256,
        updated_by: ContractAddress,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct KPIMilestoneUpdated {
        #[key]
        milestone_id: felt252,
        target_value: u256,
        burn_amount: u256,
        oracle_source: ContractAddress,
        updated_by: ContractAddress,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct BurnTypePaused {
        #[key]
        burn_type: felt252,
        reason: felt252,
        paused_by: ContractAddress,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct BurnTypeResumed {
        #[key]
        burn_type: felt252,
        resumed_by: ContractAddress,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct BurnAuthorityUpdated {
        #[key]
        authority: ContractAddress,
        role: felt252,
        action: felt252, // 'ADDED' or 'REMOVED'
        updated_by: ContractAddress,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct KPIMilestoneAchieved {
        #[key]
        milestone_id: felt252,
        achieved_value: u256,
        target_value: u256,
        burn_amount: u256,
        evidence_hash: felt252,
        validator: ContractAddress,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct DailyBurnLimitReached {
        #[key]
        limit_type: felt252,
        limit_amount: u256,
        attempted_amount: u256,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct BurnRateAlert {
        alert_type: felt252, // 'HIGH_RATE' or 'LOW_RATE'
        current_rate: u256,
        threshold_rate: u256,
        period: felt252, // '7D' or '30D'
        timestamp: u64
    }

    // Constructor for production deployment
    #[constructor]
    fn constructor(
        ref self: ContractState,
        ciro_token: ContractAddress,
        treasury_contract: ContractAddress,
        price_oracle: ContractAddress,
        admin: ContractAddress,
        dao_multisig_threshold: u32,
        initial_limits: (u256, u256, u256, u256) // (automatic, treasury, total, emergency)
    ) {
        // Initialize access control
        self.access_control.initializer();
        self.access_control._grant_role(ADMIN_ROLE, admin);
        
        // Initialize security components
        self.reentrancy_guard.initializer();
        self.pausable.initializer();
        self.upgradeable.initializer(admin);

        // Set contracts
        self.ciro_token.write(ciro_token);
        self.treasury_contract.write(treasury_contract);
        self.price_oracle.write(price_oracle);

        // Set limits
        let (automatic_limit, treasury_limit, total_limit, emergency_limit) = initial_limits;
        self.automatic_daily_limit.write(automatic_limit);
        self.treasury_daily_limit.write(treasury_limit);
        self.total_daily_limit.write(total_limit);
        self.emergency_daily_limit.write(emergency_limit);

        // Initialize governance
        self.dao_multisig_threshold.write(dao_multisig_threshold);

        // Initialize counters
        self.next_proposal_id.write(1);
        self.next_challenge_id.write(1);
        
        // Set challenge period to 72 hours
        self.challenge_period.write(259200);

        // Initialize daily tracking
        self.today_date.write(self._get_day_start(get_block_timestamp()));

        // Initialize burn statistics
        let initial_stats = BurnStatistics {
            total_burned: 0,
            job_fee_burns: 0,
            slashing_burns: 0,
            gas_fee_burns: 0,
            kpi_burns: 0,
            emergency_burns: 0,
            total_burn_events: 0,
            daily_burned_today: 0,
            last_burn_timestamp: 0,
            average_daily_burn: 0,
            burn_rate_7d: 0,
            burn_rate_30d: 0
        };
        self.burn_statistics.write(initial_stats);
    }

    #[abi(embed_v0)]
    impl BurnManagerImpl of super::IBurnManager<ContractState> {
        
        fn burn_from_job_fees(ref self: ContractState, amount: u256) {
            // Only authorized contracts can trigger automatic burns
            self.access_control.assert_only_role(BURN_AUTHORITY_ROLE);
            self.pausable.assert_not_paused();
            assert(!self.burn_type_paused.read('JOB_FEES'), 'Job fee burns paused');
            
            self._execute_automatic_burn('JOB_FEES', amount);
        }

        fn burn_from_slashing(ref self: ContractState, amount: u256) {
            self.access_control.assert_only_role(BURN_AUTHORITY_ROLE);
            self.pausable.assert_not_paused();
            assert(!self.burn_type_paused.read('SLASHING'), 'Slashing burns paused');
            
            self._execute_automatic_burn('SLASHING', amount);
        }

        fn burn_from_gas_fees(ref self: ContractState, amount: u256) {
            self.access_control.assert_only_role(BURN_AUTHORITY_ROLE);
            self.pausable.assert_not_paused();
            assert(!self.burn_type_paused.read('GAS_FEES'), 'Gas fee burns paused');
            
            self._execute_automatic_burn('GAS_FEES', amount);
        }

        fn propose_kpi_burn(ref self: ContractState, milestone_type: felt252, required_amount: u256, evidence_hash: felt252) {
            self.access_control.assert_only_role(DAO_ROLE);
            self.pausable.assert_not_paused();
            
            // Validate milestone exists and is active
            let milestone = self.kpi_milestones.read(milestone_type);
            assert(milestone.is_active, 'Milestone not active');
            assert(!milestone.achieved, 'Milestone already achieved');
            assert(required_amount == milestone.burn_amount, 'Amount mismatch');

            // Check treasury-only source protection
            let treasury_balance = IERC20Dispatcher { contract_address: self.ciro_token.read() }
                .balance_of(self.treasury_contract.read());
            assert(treasury_balance >= required_amount, 'Insufficient treasury balance');

            let proposal_id = self.next_proposal_id.read();
            let current_time = get_block_timestamp();
            
            let proposal = KPIBurnProposal {
                proposal_id,
                proposer: get_caller_address(),
                milestone_type,
                required_burn_amount: required_amount,
                evidence_hash,
                created_time: current_time,
                validation_deadline: current_time + 604800, // 7 days
                execution_deadline: current_time + 1209600, // 14 days
                validator: ContractAddress::default(),
                validation_result: false,
                validation_evidence: 0,
                validation_time: 0,
                status: ProposalStatus::Pending,
                challenge_count: 0,
                dao_approvals: 1, // Proposer's vote
                dao_threshold: self.dao_multisig_threshold.read(),
                executed: false,
                execution_time: 0
            };

            self.kpi_burn_proposals.write(proposal_id, proposal);
            self.dao_proposal_votes.write((proposal_id, get_caller_address()), true);
            self.next_proposal_id.write(proposal_id + 1);
            self.total_proposals_created.write(self.total_proposals_created.read() + 1);

            self.emit(KPIBurnProposed {
                proposal_id,
                proposer: get_caller_address(),
                milestone_type,
                required_amount,
                evidence_hash,
                validation_deadline: proposal.validation_deadline,
                execution_deadline: proposal.execution_deadline,
                timestamp: current_time
            });
        }

        fn validate_kpi_achievement(ref self: ContractState, proposal_id: u256, validation_result: bool, validator_evidence: felt252) {
            self.access_control.assert_only_role(KPI_VALIDATOR_ROLE);
            
            let mut proposal = self.kpi_burn_proposals.read(proposal_id);
            assert(proposal.status == ProposalStatus::Pending, 'Invalid proposal status');
            assert(get_block_timestamp() <= proposal.validation_deadline, 'Validation deadline passed');

            // Update proposal with validation
            proposal.validator = get_caller_address();
            proposal.validation_result = validation_result;
            proposal.validation_evidence = validator_evidence;
            proposal.validation_time = get_block_timestamp();
            proposal.status = if validation_result { ProposalStatus::Validated } else { ProposalStatus::Rejected };

            self.kpi_burn_proposals.write(proposal_id, proposal);

            // If validated, mark milestone as achieved
            if validation_result {
                let mut milestone = self.kpi_milestones.read(proposal.milestone_type);
                milestone.achieved = true;
                milestone.achievement_time = get_block_timestamp();
                milestone.evidence_hash = proposal.evidence_hash;
                self.kpi_milestones.write(proposal.milestone_type, milestone);

                self.emit(KPIMilestoneAchieved {
                    milestone_id: proposal.milestone_type,
                    achieved_value: milestone.target_value,
                    target_value: milestone.target_value,
                    burn_amount: milestone.burn_amount,
                    evidence_hash: proposal.evidence_hash,
                    validator: get_caller_address(),
                    timestamp: get_block_timestamp()
                });
            }

            self.emit(KPIBurnValidated {
                proposal_id,
                validator: get_caller_address(),
                validation_result,
                validation_evidence: validator_evidence,
                timestamp: get_block_timestamp()
            });
        }

        fn execute_kpi_burn(ref self: ContractState, proposal_id: u256) {
            self.access_control.assert_only_role(DAO_ROLE);
            self.reentrancy_guard.start();

            let mut proposal = self.kpi_burn_proposals.read(proposal_id);
            assert(proposal.status == ProposalStatus::Validated, 'Proposal not validated');
            assert(!proposal.executed, 'Already executed');
            assert(get_block_timestamp() <= proposal.execution_deadline, 'Execution deadline passed');

            // Check if caller already voted
            if !self.dao_proposal_votes.read((proposal_id, get_caller_address())) {
                proposal.dao_approvals += 1;
                self.dao_proposal_votes.write((proposal_id, get_caller_address()), true);
            }

            // Check if DAO threshold met
            assert(proposal.dao_approvals >= proposal.dao_threshold, 'Insufficient DAO approvals');

            // Check challenge period has passed
            let challenge_window_end = proposal.validation_time + self.challenge_period.read();
            assert(get_block_timestamp() >= challenge_window_end, 'Challenge period active');

            // Check daily limits for treasury burns
            self._update_daily_tracking();
            let remaining_treasury_limit = self._get_remaining_treasury_limit();
            assert(proposal.required_burn_amount <= remaining_treasury_limit, 'Daily treasury limit exceeded');

            // Execute burn from treasury (TREASURY-ONLY SOURCE PROTECTION)
            let treasury_balance_before = IERC20Dispatcher { contract_address: self.ciro_token.read() }
                .balance_of(self.treasury_contract.read());
            
            // Transfer tokens from treasury to burn manager and burn them
            let token = IERC20Dispatcher { contract_address: self.ciro_token.read() };
            // Note: This requires treasury contract to approve burn manager first
            token.transfer_from(self.treasury_contract.read(), get_contract_address(), proposal.required_burn_amount);
            token.burn(proposal.required_burn_amount);

            let treasury_balance_after = token.balance_of(self.treasury_contract.read());

            // Update tracking
            self._update_burn_statistics('KPI_BURN', proposal.required_burn_amount);
            proposal.executed = true;
            proposal.execution_time = get_block_timestamp();
            proposal.status = ProposalStatus::Executed;
            self.kpi_burn_proposals.write(proposal_id, proposal);
            self.total_proposals_executed.write(self.total_proposals_executed.read() + 1);

            self.emit(KPIBurnExecuted {
                proposal_id,
                milestone_type: proposal.milestone_type,
                amount: proposal.required_burn_amount,
                treasury_balance_before,
                treasury_balance_after,
                executor: get_caller_address(),
                timestamp: get_block_timestamp()
            });

            self.reentrancy_guard.end();
        }

        fn challenge_kpi_validation(ref self: ContractState, proposal_id: u256, challenge_reason: felt252) {
            // Any DAO member can challenge
            self.access_control.assert_only_role(DAO_ROLE);
            
            let proposal = self.kpi_burn_proposals.read(proposal_id);
            assert(proposal.status == ProposalStatus::Validated, 'Invalid proposal status');
            assert(!proposal.executed, 'Already executed');

            // Check if within challenge period
            let challenge_deadline = proposal.validation_time + self.challenge_period.read();
            assert(get_block_timestamp() <= challenge_deadline, 'Challenge period expired');

            let challenge_id = self.next_challenge_id.read();
            let challenge = Challenge {
                challenge_id,
                proposal_id,
                challenger: get_caller_address(),
                reason: challenge_reason,
                evidence_hash: 0, // To be provided separately
                created_time: get_block_timestamp(),
                resolved: false,
                resolution_outcome: false,
                resolved_by: ContractAddress::default(),
                resolution_time: 0
            };

            self.challenges.write(challenge_id, challenge);
            let challenge_count = self.proposal_challenges.read(proposal_id);
            self.proposal_challenges.write(proposal_id, challenge_count + 1);
            self.next_challenge_id.write(challenge_id + 1);
            self.total_challenges_raised.write(self.total_challenges_raised.read() + 1);

            // Update proposal status
            let mut updated_proposal = proposal;
            updated_proposal.status = ProposalStatus::Challenged;
            updated_proposal.challenge_count += 1;
            self.kpi_burn_proposals.write(proposal_id, updated_proposal);

            self.emit(BurnProposalChallenged {
                challenge_id,
                proposal_id,
                challenger: get_caller_address(),
                reason: challenge_reason,
                timestamp: get_block_timestamp()
            });
        }

        fn propose_emergency_burn(ref self: ContractState, amount: u256, reason: felt252) {
            self.access_control.assert_only_role(EMERGENCY_ROLE);
            
            // Create emergency proposal with shorter timeframes
            let proposal_id = self.next_proposal_id.read();
            let current_time = get_block_timestamp();
            
            let proposal = KPIBurnProposal {
                proposal_id,
                proposer: get_caller_address(),
                milestone_type: 'EMERGENCY',
                required_burn_amount: amount,
                evidence_hash: reason,
                created_time: current_time,
                validation_deadline: current_time + 86400, // 24 hours
                execution_deadline: current_time + 172800, // 48 hours
                validator: get_caller_address(),
                validation_result: true,
                validation_evidence: reason,
                validation_time: current_time,
                status: ProposalStatus::Validated,
                challenge_count: 0,
                dao_approvals: 1,
                dao_threshold: 2, // Lower threshold for emergencies
                executed: false,
                execution_time: 0
            };

            self.kpi_burn_proposals.write(proposal_id, proposal);
            self.dao_proposal_votes.write((proposal_id, get_caller_address()), true);
            self.next_proposal_id.write(proposal_id + 1);
        }

        fn execute_emergency_burn(ref self: ContractState, proposal_id: u256) {
            self.access_control.assert_only_role(EMERGENCY_ROLE);
            self.reentrancy_guard.start();

            let mut proposal = self.kpi_burn_proposals.read(proposal_id);
            assert(proposal.milestone_type == 'EMERGENCY', 'Not emergency proposal');
            assert(proposal.status == ProposalStatus::Validated, 'Not validated');
            assert(!proposal.executed, 'Already executed');

            // Check emergency limits
            self._update_daily_tracking();
            assert(proposal.required_burn_amount <= self.emergency_daily_limit.read(), 'Emergency limit exceeded');

            // Vote if not already voted
            if !self.dao_proposal_votes.read((proposal_id, get_caller_address())) {
                proposal.dao_approvals += 1;
                self.dao_proposal_votes.write((proposal_id, get_caller_address()), true);
            }

            assert(proposal.dao_approvals >= proposal.dao_threshold, 'Insufficient approvals');

            // Execute emergency burn
            let token = IERC20Dispatcher { contract_address: self.ciro_token.read() };
            token.transfer_from(self.treasury_contract.read(), get_contract_address(), proposal.required_burn_amount);
            token.burn(proposal.required_burn_amount);

            // Update tracking
            self._update_burn_statistics('EMERGENCY', proposal.required_burn_amount);
            proposal.executed = true;
            proposal.execution_time = get_block_timestamp();
            proposal.status = ProposalStatus::Executed;
            self.kpi_burn_proposals.write(proposal_id, proposal);

            self.emit(EmergencyBurnExecuted {
                proposal_id,
                amount: proposal.required_burn_amount,
                reason: proposal.evidence_hash,
                executor: get_caller_address(),
                approvals_count: proposal.dao_approvals,
                timestamp: get_block_timestamp()
            });

            self.reentrancy_guard.end();
        }

        // View functions
        fn get_total_burned(self: @ContractState) -> u256 {
            self.total_burned.read()
        }

        fn get_burn_statistics(self: @ContractState) -> BurnStatistics {
            self.burn_statistics.read()
        }

        fn get_kpi_burn_proposal(self: @ContractState, proposal_id: u256) -> KPIBurnProposal {
            self.kpi_burn_proposals.read(proposal_id)
        }

        fn get_daily_burn_limits(self: @ContractState) -> (u256, u256, u256) {
            (
                self.automatic_daily_limit.read(),
                self.treasury_daily_limit.read(),
                self.total_daily_limit.read()
            )
        }

        fn get_remaining_daily_limits(self: @ContractState) -> (u256, u256, u256) {
            let automatic_remaining = self._get_remaining_automatic_limit();
            let treasury_remaining = self._get_remaining_treasury_limit();
            let total_remaining = self._get_remaining_total_limit();
            
            (automatic_remaining, treasury_remaining, total_remaining)
        }

        fn can_execute_burn(self: @ContractState, burn_type: felt252, amount: u256) -> bool {
            if self.burn_type_paused.read(burn_type) {
                return false;
            }

            if burn_type == 'JOB_FEES' || burn_type == 'SLASHING' || burn_type == 'GAS_FEES' {
                amount <= self._get_remaining_automatic_limit()
            } else {
                amount <= self._get_remaining_treasury_limit()
            }
        }

        // Administration functions
        fn update_burn_limits(ref self: ContractState, automatic_daily_limit: u256, treasury_daily_limit: u256) {
            self.access_control.assert_only_role(ADMIN_ROLE);
            
            let old_automatic = self.automatic_daily_limit.read();
            let old_treasury = self.treasury_daily_limit.read();
            
            self.automatic_daily_limit.write(automatic_daily_limit);
            self.treasury_daily_limit.write(treasury_daily_limit);
            self.total_daily_limit.write(automatic_daily_limit + treasury_daily_limit);

            self.emit(BurnLimitsUpdated {
                old_automatic_limit: old_automatic,
                new_automatic_limit: automatic_daily_limit,
                old_treasury_limit: old_treasury,
                new_treasury_limit: treasury_daily_limit,
                updated_by: get_caller_address(),
                timestamp: get_block_timestamp()
            });
        }

        fn update_kpi_milestones(ref self: ContractState, milestone_updates: Array<KPIMilestone>) {
            self.access_control.assert_only_role(ADMIN_ROLE);
            
            let mut i = 0;
            loop {
                if i >= milestone_updates.len() {
                    break;
                }
                let milestone = *milestone_updates.at(i);
                self.kpi_milestones.write(milestone.milestone_id, milestone);

                self.emit(KPIMilestoneUpdated {
                    milestone_id: milestone.milestone_id,
                    target_value: milestone.target_value,
                    burn_amount: milestone.burn_amount,
                    oracle_source: milestone.oracle_source,
                    updated_by: get_caller_address(),
                    timestamp: get_block_timestamp()
                });
                
                i += 1;
            };
        }

        fn add_burn_authority(ref self: ContractState, authority: ContractAddress, role: felt252) {
            self.access_control.assert_only_role(ADMIN_ROLE);
            
            self.access_control._grant_role(BURN_AUTHORITY_ROLE, authority);

            self.emit(BurnAuthorityUpdated {
                authority,
                role,
                action: 'ADDED',
                updated_by: get_caller_address(),
                timestamp: get_block_timestamp()
            });
        }

        fn remove_burn_authority(ref self: ContractState, authority: ContractAddress) {
            self.access_control.assert_only_role(ADMIN_ROLE);
            
            self.access_control._revoke_role(BURN_AUTHORITY_ROLE, authority);

            self.emit(BurnAuthorityUpdated {
                authority,
                role: BURN_AUTHORITY_ROLE,
                action: 'REMOVED',
                updated_by: get_caller_address(),
                timestamp: get_block_timestamp()
            });
        }

        fn pause_burn_type(ref self: ContractState, burn_type: felt252, reason: felt252) {
            self.access_control.assert_only_role(ADMIN_ROLE);
            
            self.burn_type_paused.write(burn_type, true);
            self.burn_type_pause_reason.write(burn_type, reason);

            self.emit(BurnTypePaused {
                burn_type,
                reason,
                paused_by: get_caller_address(),
                timestamp: get_block_timestamp()
            });
        }

        fn resume_burn_type(ref self: ContractState, burn_type: felt252) {
            self.access_control.assert_only_role(ADMIN_ROLE);
            
            self.burn_type_paused.write(burn_type, false);
            self.burn_type_pause_reason.write(burn_type, 0);

            self.emit(BurnTypeResumed {
                burn_type,
                resumed_by: get_caller_address(),
                timestamp: get_block_timestamp()
            });
        }
    }

    // Internal helper functions
    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn _execute_automatic_burn(ref self: ContractState, burn_type: felt252, amount: u256) {
            self.reentrancy_guard.start();

            // Update daily tracking
            self._update_daily_tracking();

            // Check automatic burn limits
            let remaining_automatic_limit = self._get_remaining_automatic_limit();
            let remaining_total_limit = self._get_remaining_total_limit();
            
            assert(amount <= remaining_automatic_limit, 'Automatic daily limit exceeded');
            assert(amount <= remaining_total_limit, 'Total daily limit exceeded');

            // Execute burn
            let token = IERC20Dispatcher { contract_address: self.ciro_token.read() };
            token.burn(amount);

            // Update tracking
            self._update_burn_statistics(burn_type, amount);

            self.emit(AutomaticBurnExecuted {
                burn_type,
                amount,
                source_contract: get_caller_address(),
                total_burned_today: self.today_total_burned.read() + amount,
                remaining_daily_limit: remaining_automatic_limit - amount,
                executor: get_caller_address(),
                timestamp: get_block_timestamp()
            });

            self.reentrancy_guard.end();
        }

        fn _update_burn_statistics(ref self: ContractState, burn_type: felt252, amount: u256) {
            let mut stats = self.burn_statistics.read();
            
            // Update totals
            stats.total_burned += amount;
            stats.total_burn_events += 1;
            stats.last_burn_timestamp = get_block_timestamp();

            // Update by type
            if burn_type == 'JOB_FEES' {
                stats.job_fee_burns += amount;
            } else if burn_type == 'SLASHING' {
                stats.slashing_burns += amount;
            } else if burn_type == 'GAS_FEES' {
                stats.gas_fee_burns += amount;
            } else if burn_type == 'KPI_BURN' {
                stats.kpi_burns += amount;
            } else if burn_type == 'EMERGENCY' {
                stats.emergency_burns += amount;
            }

            // Update daily tracking
            let today_burned = self.today_total_burned.read() + amount;
            self.today_total_burned.write(today_burned);
            
            if burn_type == 'JOB_FEES' || burn_type == 'SLASHING' || burn_type == 'GAS_FEES' {
                self.today_automatic_burned.write(self.today_automatic_burned.read() + amount);
            } else {
                self.today_treasury_burned.write(self.today_treasury_burned.read() + amount);
            }

            stats.daily_burned_today = today_burned;

            // Update total burned in contract storage
            self.total_burned.write(stats.total_burned);
            self.burn_statistics.write(stats);
        }

        fn _update_daily_tracking(ref self: ContractState) {
            let current_day = self._get_day_start(get_block_timestamp());
            let today_stored = self.today_date.read();

            if current_day != today_stored {
                // Store yesterday's data
                let yesterday_data = DailyBurnData {
                    date: today_stored,
                    automatic_burns: self.today_automatic_burned.read(),
                    treasury_burns: self.today_treasury_burned.read(),
                    total_burns: self.today_total_burned.read(),
                    burn_events_count: 0 // Could be tracked separately
                };
                self.daily_burn_data.write(today_stored, yesterday_data);

                // Reset for new day
                self.today_date.write(current_day);
                self.today_automatic_burned.write(0);
                self.today_treasury_burned.write(0);
                self.today_total_burned.write(0);
            }
        }

        fn _get_day_start(self: @ContractState, timestamp: u64) -> u64 {
            (timestamp / 86400) * 86400
        }

        fn _get_remaining_automatic_limit(self: @ContractState) -> u256 {
            let limit = self.automatic_daily_limit.read();
            let used = self.today_automatic_burned.read();
            if used >= limit { 0 } else { limit - used }
        }

        fn _get_remaining_treasury_limit(self: @ContractState) -> u256 {
            let limit = self.treasury_daily_limit.read();
            let used = self.today_treasury_burned.read();
            if used >= limit { 0 } else { limit - used }
        }

        fn _get_remaining_total_limit(self: @ContractState) -> u256 {
            let limit = self.total_daily_limit.read();
            let used = self.today_total_burned.read();
            if used >= limit { 0 } else { limit - used }
        }
    }
} 