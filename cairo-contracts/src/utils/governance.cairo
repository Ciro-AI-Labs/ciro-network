// CIRO Network Governance and Upgradability Framework
// Comprehensive governance system for DePIN applications with tiered voting and job-aware upgrades

use starknet::ContractAddress;
use starknet::class_hash::ClassHash;
use starknet::get_caller_address;
use starknet::get_block_timestamp;
use starknet::storage::{Map};
use super::constants::*;
use super::types::*;

/// Governance proposal types with different requirements
#[derive(Drop, Serde, Copy, PartialEq)]
pub enum ProposalType {
    Emergency,      // Immediate execution, multisig only
    Critical,       // 24h timelock, simplified voting
    Standard,       // 7d timelock, full DAO voting
    Parameter,      // 3d timelock, parameter changes only
    Upgrade,        // 14d timelock, contract upgrades
}

/// Upgrade patterns supported by the framework
#[derive(Drop, Serde, Copy, PartialEq)]
pub enum UpgradePattern {
    UUPS,           // Universal Upgradeable Proxy Standard
    Transparent,    // Transparent Proxy Pattern
    Diamond,        // Diamond/Multi-Facet Proxy
    Direct,         // Direct contract replacement
}

/// Governance proposal structure
#[derive(Drop, Serde, starknet::Store)]
pub struct Proposal {
    pub id: u256,
    pub proposer: ContractAddress,
    pub proposal_type: ProposalType,
    pub title: felt252,
    pub description: Array<felt252>,
    pub target_contract: ContractAddress,
    pub function_selector: felt252,
    pub calldata: Array<felt252>,
    pub voting_start: u64,
    pub voting_end: u64,
    pub execution_eta: u64,
    pub votes_for: u256,
    pub votes_against: u256,
    pub votes_abstain: u256,
    pub executed: bool,
    pub cancelled: bool,
    pub quorum_reached: bool,
}

/// Voting power calculation parameters
#[derive(Drop, Serde, starknet::Store)]
pub struct VotingPower {
    pub token_balance: u256,
    pub stake_amount: u256,
    pub reputation_score: u16,
    pub lock_duration: u64,
    pub resource_contribution: u256,
    pub usage_weight: u256,
}

/// Governance configuration
#[derive(Drop, Serde, starknet::Store)]
pub struct GovernanceConfig {
    pub voting_period: u64,
    pub timelock_delay: u64,
    pub proposal_threshold: u256,
    pub quorum_threshold: u256,
    pub emergency_multisig: ContractAddress,
    pub governance_token: ContractAddress,
    pub max_operations_per_proposal: u8,
}

/// Main governance interface
#[starknet::interface]
pub trait IGovernance<TContractState> {
    // Proposal management
    fn propose(
        ref self: TContractState,
        proposal_type: ProposalType,
        title: felt252,
        description: Array<felt252>,
        targets: Array<ContractAddress>,
        selectors: Array<felt252>,
        calldatas: Array<Array<felt252>>
    ) -> u256;
    
    fn vote(ref self: TContractState, proposal_id: u256, support: u8, reason: felt252);
    fn execute(ref self: TContractState, proposal_id: u256);
    fn cancel(ref self: TContractState, proposal_id: u256);
    
    // Voting power
    fn get_voting_power(self: @TContractState, account: ContractAddress, block_number: u64) -> u256;
    fn delegate(ref self: TContractState, delegatee: ContractAddress);
    
    // Configuration
    fn update_config(ref self: TContractState, new_config: GovernanceConfig);
    fn get_proposal(self: @TContractState, proposal_id: u256) -> Proposal;
    fn get_proposal_state(self: @TContractState, proposal_id: u256) -> ProposalState;
}

/// Proposal states
#[derive(Drop, Serde, Copy, PartialEq)]
pub enum ProposalState {
    Pending,
    Active,
    Succeeded,
    Defeated,
    Queued,
    Executed,
    Cancelled,
    Expired,
}

/// Main governance component
#[starknet::component]
pub mod GovernanceComponent {
    use super::*;
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    #[storage]
    struct Storage {
        // Governance state
        proposal_count: u256,
        proposals: Map<u256, Proposal>,
        votes: Map<(u256, ContractAddress), bool>, // (proposal_id, voter) -> has_voted
        vote_receipts: Map<(u256, ContractAddress), VoteReceipt>,
        
        // Configuration
        config: GovernanceConfig,
        
        // Delegation
        delegates: Map<ContractAddress, ContractAddress>, // delegator -> delegatee
        delegate_votes: Map<ContractAddress, u256>, // delegatee -> vote count
        
        // Emergency controls
        emergency_council: Map<ContractAddress, bool>,
        emergency_proposals: Map<u256, bool>,
        
        // Timelock
        queued_operations: Map<felt252, QueuedOperation>,
    }

    #[derive(Drop, Serde, starknet::Store)]
    struct VoteReceipt {
        has_voted: bool,
        support: u8, // 0: Against, 1: For, 2: Abstain
        votes: u256,
        reason: felt252,
    }

    #[derive(Drop, Serde, starknet::Store)]
    struct QueuedOperation {
        target: ContractAddress,
        selector: felt252,
        calldata: Array<felt252>,
        eta: u64,
        executed: bool,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        ProposalCreated: ProposalCreated,
        VoteCast: VoteCast,
        ProposalExecuted: ProposalExecuted,
        ProposalCancelled: ProposalCancelled,
        ProposalQueued: ProposalQueued,
        DelegateChanged: DelegateChanged,
        EmergencyActionExecuted: EmergencyActionExecuted,
    }

    #[derive(Drop, starknet::Event)]
    pub struct ProposalCreated {
        pub proposal_id: u256,
        pub proposer: ContractAddress,
        pub proposal_type: ProposalType,
        pub voting_start: u64,
        pub voting_end: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct VoteCast {
        pub voter: ContractAddress,
        pub proposal_id: u256,
        pub support: u8,
        pub votes: u256,
        pub reason: felt252,
    }

    #[derive(Drop, starknet::Event)]
    pub struct ProposalExecuted {
        pub proposal_id: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct ProposalCancelled {
        pub proposal_id: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct ProposalQueued {
        pub proposal_id: u256,
        pub eta: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct DelegateChanged {
        pub delegator: ContractAddress,
        pub from_delegate: ContractAddress,
        pub to_delegate: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    pub struct EmergencyActionExecuted {
        pub executor: ContractAddress,
        pub target: ContractAddress,
        pub selector: felt252,
    }

    #[embeddable_as(GovernanceImpl)]
    impl Governance<
        TContractState, +HasComponent<TContractState>
    > of IGovernance<ComponentState<TContractState>> {
        fn propose(
            ref self: ComponentState<TContractState>,
            proposal_type: ProposalType,
            title: felt252,
            description: Array<felt252>,
            targets: Array<ContractAddress>,
            selectors: Array<felt252>,
            calldatas: Array<Array<felt252>>
        ) -> u256 {
            let caller = get_caller_address();
            let config = self.config.read();
            
            // Check proposal threshold
            let voting_power = self._get_voting_power(caller, get_block_timestamp());
            assert(voting_power >= config.proposal_threshold, 'Insufficient voting power');
            
            // Validate arrays length
            assert(targets.len() == selectors.len(), 'Arrays length mismatch');
            assert(targets.len() == calldatas.len(), 'Arrays length mismatch');
            assert(targets.len() <= config.max_operations_per_proposal.into(), 'Too many operations');
            
            let proposal_id = self.proposal_count.read() + 1;
            self.proposal_count.write(proposal_id);
            
            let current_time = get_block_timestamp();
            let (voting_start, voting_end, execution_eta) = self._calculate_proposal_timing(proposal_type, current_time);
            
            // For simplicity, store only the first target/selector/calldata
            // In production, you'd want to handle multiple operations
            let target = if targets.len() > 0 { *targets.at(0) } else { starknet::contract_address_const::<0>() };
            let selector = if selectors.len() > 0 { *selectors.at(0) } else { 0 };
            let calldata = if calldatas.len() > 0 { calldatas.at(0).clone() } else { ArrayTrait::new() };
            
            let proposal = Proposal {
                id: proposal_id,
                proposer: caller,
                proposal_type,
                title,
                description,
                target_contract: target,
                function_selector: selector,
                calldata,
                voting_start,
                voting_end,
                execution_eta,
                votes_for: 0,
                votes_against: 0,
                votes_abstain: 0,
                executed: false,
                cancelled: false,
                quorum_reached: false,
            };
            
            self.proposals.entry(proposal_id).write(proposal);
            
            self.emit(ProposalCreated {
                proposal_id,
                proposer: caller,
                proposal_type,
                voting_start,
                voting_end,
            });
            
            proposal_id
        }

        fn vote(ref self: ComponentState<TContractState>, proposal_id: u256, support: u8, reason: felt252) {
            let caller = get_caller_address();
            let proposal = self.proposals.entry(proposal_id).read();
            let current_time = get_block_timestamp();
            
            // Validate proposal state
            assert(proposal.id != 0, 'Proposal does not exist');
            assert(current_time >= proposal.voting_start, 'Voting not started');
            assert(current_time <= proposal.voting_end, 'Voting ended');
            assert(!proposal.executed, 'Proposal already executed');
            assert(!proposal.cancelled, 'Proposal cancelled');
            
            // Check if already voted
            assert(!self.votes.entry((proposal_id, caller)).read(), 'Already voted');
            
            // Get voting power at proposal start
            let voting_power = self._get_voting_power(caller, proposal.voting_start);
            assert(voting_power > 0, 'No voting power');
            
            // Record vote
            self.votes.entry((proposal_id, caller)).write(true);
            let vote_receipt = VoteReceipt {
                has_voted: true,
                support,
                votes: voting_power,
                reason,
            };
            self.vote_receipts.entry((proposal_id, caller)).write(vote_receipt);
            
            // Update proposal vote counts
            let mut updated_proposal = proposal;
            if support == 0 {
                updated_proposal.votes_against += voting_power;
            } else if support == 1 {
                updated_proposal.votes_for += voting_power;
            } else if support == 2 {
                updated_proposal.votes_abstain += voting_power;
            }
            
            // Check quorum
            let total_votes = updated_proposal.votes_for + updated_proposal.votes_against + updated_proposal.votes_abstain;
            if total_votes >= self.config.read().quorum_threshold {
                updated_proposal.quorum_reached = true;
            }
            
            self.proposals.entry(proposal_id).write(updated_proposal);
            
            self.emit(VoteCast {
                voter: caller,
                proposal_id,
                support,
                votes: voting_power,
                reason,
            });
        }

        fn execute(ref self: ComponentState<TContractState>, proposal_id: u256) {
            let proposal = self.proposals.entry(proposal_id).read();
            let current_time = get_block_timestamp();
            
            // Validate execution conditions
            assert(proposal.id != 0, 'Proposal does not exist');
            assert(!proposal.executed, 'Already executed');
            assert(!proposal.cancelled, 'Proposal cancelled');
            assert(current_time > proposal.voting_end, 'Voting not ended');
            assert(proposal.quorum_reached, 'Quorum not reached');
            assert(proposal.votes_for > proposal.votes_against, 'Proposal defeated');
            
            // Check timelock for non-emergency proposals
            if proposal.proposal_type != ProposalType::Emergency {
                assert(current_time >= proposal.execution_eta, 'Timelock not expired');
            }
            
            // Mark as executed
            let mut updated_proposal = proposal;
            updated_proposal.executed = true;
            self.proposals.entry(proposal_id).write(updated_proposal);
            
            // Execute the proposal
            if proposal.target_contract != starknet::contract_address_const::<0>() {
                starknet::call_contract_syscall(
                    proposal.target_contract,
                    proposal.function_selector,
                    proposal.calldata.span()
                ).unwrap();
            }
            
            self.emit(ProposalExecuted { proposal_id });
        }

        fn cancel(ref self: ComponentState<TContractState>, proposal_id: u256) {
            let caller = get_caller_address();
            let proposal = self.proposals.entry(proposal_id).read();
            let config = self.config.read();
            
            // Only proposer or emergency council can cancel
            assert(
                caller == proposal.proposer || 
                self.emergency_council.entry(caller).read() ||
                caller == config.emergency_multisig,
                'Not authorized to cancel'
            );
            
            assert(proposal.id != 0, 'Proposal does not exist');
            assert(!proposal.executed, 'Already executed');
            assert(!proposal.cancelled, 'Already cancelled');
            
            // Mark as cancelled
            let mut updated_proposal = proposal;
            updated_proposal.cancelled = true;
            self.proposals.entry(proposal_id).write(updated_proposal);
            
            self.emit(ProposalCancelled { proposal_id });
        }

        fn get_voting_power(self: @ComponentState<TContractState>, account: ContractAddress, block_number: u64) -> u256 {
            self._get_voting_power(account, block_number)
        }

        fn delegate(ref self: ComponentState<TContractState>, delegatee: ContractAddress) {
            let caller = get_caller_address();
            let current_delegate = self.delegates.entry(caller).read();
            
            if current_delegate != delegatee {
                // Update delegation
                self.delegates.entry(caller).write(delegatee);
                
                // Update delegate vote counts
                if current_delegate != starknet::contract_address_const::<0>() {
                    let current_votes = self.delegate_votes.entry(current_delegate).read();
                    let caller_power = self._get_voting_power(caller, get_block_timestamp());
                    self.delegate_votes.entry(current_delegate).write(current_votes - caller_power);
                }
                
                if delegatee != starknet::contract_address_const::<0>() {
                    let new_votes = self.delegate_votes.entry(delegatee).read();
                    let caller_power = self._get_voting_power(caller, get_block_timestamp());
                    self.delegate_votes.entry(delegatee).write(new_votes + caller_power);
                }
                
                self.emit(DelegateChanged {
                    delegator: caller,
                    from_delegate: current_delegate,
                    to_delegate: delegatee,
                });
            }
        }

        fn update_config(ref self: ComponentState<TContractState>, new_config: GovernanceConfig) {
            let caller = get_caller_address();
            let current_config = self.config.read();
            
            // Only emergency multisig can update config
            assert(caller == current_config.emergency_multisig, 'Not authorized');
            
            self.config.write(new_config);
        }

        fn get_proposal(self: @ComponentState<TContractState>, proposal_id: u256) -> Proposal {
            self.proposals.entry(proposal_id).read()
        }

        fn get_proposal_state(self: @ComponentState<TContractState>, proposal_id: u256) -> ProposalState {
            let proposal = self.proposals.entry(proposal_id).read();
            let current_time = get_block_timestamp();
            
            if proposal.id == 0 {
                return ProposalState::Pending;
            }
            
            if proposal.cancelled {
                return ProposalState::Cancelled;
            }
            
            if proposal.executed {
                return ProposalState::Executed;
            }
            
            if current_time < proposal.voting_start {
                return ProposalState::Pending;
            }
            
            if current_time <= proposal.voting_end {
                return ProposalState::Active;
            }
            
            if !proposal.quorum_reached || proposal.votes_for <= proposal.votes_against {
                return ProposalState::Defeated;
            }
            
            if current_time < proposal.execution_eta {
                return ProposalState::Queued;
            }
            
            // Check if expired (e.g., 30 days after execution_eta)
            if current_time > proposal.execution_eta + PROPOSAL_EXPIRY_PERIOD {
                return ProposalState::Expired;
            }
            
            ProposalState::Succeeded
        }
    }

    #[generate_trait]
    pub impl InternalImpl<
        TContractState, +HasComponent<TContractState>
    > of InternalTrait<TContractState> {
        fn initializer(
            ref self: ComponentState<TContractState>,
            config: GovernanceConfig
        ) {
            self.config.write(config);
        }

        fn _get_voting_power(
            self: @ComponentState<TContractState>,
            account: ContractAddress,
            timestamp: u64
        ) -> u256 {
            // This would integrate with the token contract, staking contract, and reputation system
            // For now, return a simplified calculation
            
            let config = self.config.read();
            let token_contract = config.governance_token;
            
            // Get token balance (this would call the actual token contract)
            let token_balance = 1000; // Placeholder
            
            // Get stake amount and reputation from other contracts
            let stake_amount = 500; // Placeholder
            let reputation_score = 750; // Placeholder
            let lock_duration = 86400; // Placeholder
            
            // Calculate voting power using quadratic voting with bonuses
            let base_power = token_balance.sqrt();
            let stake_bonus = (stake_amount * 50) / 100; // 50% bonus from staking
            let reputation_bonus = (reputation_score.into() * base_power) / REPUTATION_SCALE.into();
            let lock_bonus = if lock_duration >= 31536000 { // 1 year
                base_power / 2 // 50% bonus
            } else if lock_duration >= 15768000 { // 6 months
                base_power / 4 // 25% bonus
            } else {
                0
            };
            
            base_power + stake_bonus + reputation_bonus + lock_bonus
        }

        fn _calculate_proposal_timing(
            self: @ComponentState<TContractState>,
            proposal_type: ProposalType,
            current_time: u64
        ) -> (u64, u64, u64) {
            let config = self.config.read();
            
            let (voting_period, timelock_delay) = match proposal_type {
                ProposalType::Emergency => (3600, 0), // 1 hour voting, no timelock
                ProposalType::Critical => (86400, 86400), // 1 day voting, 1 day timelock
                ProposalType::Standard => (604800, 604800), // 7 days voting, 7 days timelock
                ProposalType::Parameter => (259200, 259200), // 3 days voting, 3 days timelock
                ProposalType::Upgrade => (604800, 1209600), // 7 days voting, 14 days timelock
            };
            
            let voting_start = current_time + PROPOSAL_DELAY; // Small delay for preparation
            let voting_end = voting_start + voting_period;
            let execution_eta = voting_end + timelock_delay;
            
            (voting_start, voting_end, execution_eta)
        }

        fn _execute_emergency_action(
            ref self: ComponentState<TContractState>,
            target: ContractAddress,
            selector: felt252,
            calldata: Array<felt252>
        ) {
            let caller = get_caller_address();
            let config = self.config.read();
            
            // Only emergency council or multisig can execute emergency actions
            assert(
                self.emergency_council.entry(caller).read() || 
                caller == config.emergency_multisig,
                'Not authorized for emergency action'
            );
            
            // Execute immediately without voting
            starknet::call_contract_syscall(target, selector, calldata.span()).unwrap();
            
            self.emit(EmergencyActionExecuted {
                executor: caller,
                target,
                selector,
            });
        }
    }
}

// Governance constants
pub const PROPOSAL_DELAY: u64 = 3600; // 1 hour delay before voting starts
pub const PROPOSAL_EXPIRY_PERIOD: u64 = 2592000; // 30 days after execution_eta
pub const MIN_VOTING_PERIOD: u64 = 3600; // 1 hour minimum
pub const MAX_VOTING_PERIOD: u64 = 1209600; // 14 days maximum
pub const MIN_TIMELOCK_DELAY: u64 = 0; // Emergency proposals
pub const MAX_TIMELOCK_DELAY: u64 = 2592000; // 30 days maximum

/// Governance utility functions
pub mod governance_utils {
    use super::*;

    /// Calculate required quorum based on proposal type
    pub fn calculate_quorum(
        proposal_type: ProposalType,
        total_supply: u256
    ) -> u256 {
        match proposal_type {
            ProposalType::Emergency => total_supply / 10, // 10%
            ProposalType::Critical => total_supply / 5, // 20%
            ProposalType::Standard => total_supply / 4, // 25%
            ProposalType::Parameter => total_supply / 6, // ~16.7%
            ProposalType::Upgrade => total_supply / 3, // ~33.3%
        }
    }

    /// Validate proposal parameters
    pub fn validate_proposal_params(
        proposal_type: ProposalType,
        targets: @Array<ContractAddress>,
        selectors: @Array<felt252>,
        calldatas: @Array<Array<felt252>>
    ) -> bool {
        // Basic validation
        if targets.len() != selectors.len() || targets.len() != calldatas.len() {
            return false;
        }

        // Type-specific validation
        match proposal_type {
            ProposalType::Emergency => {
                // Emergency proposals should be single operations
                targets.len() <= 1
            },
            ProposalType::Parameter => {
                // Parameter changes should only target specific contracts
                // Additional validation logic here
                true
            },
            _ => true
        }
    }

    /// Check if address is authorized for proposal type
    pub fn is_authorized_proposer(
        proposer: ContractAddress,
        proposal_type: ProposalType,
        voting_power: u256,
        threshold: u256
    ) -> bool {
        match proposal_type {
            ProposalType::Emergency => {
                // Emergency proposals require special authorization
                // This would check emergency council membership
                false // Placeholder
            },
            _ => voting_power >= threshold
        }
    }
} 