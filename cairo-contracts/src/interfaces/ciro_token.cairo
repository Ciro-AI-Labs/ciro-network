use starknet::ContractAddress;

/// Governance proposal structure (Enhanced v3.1)
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct GovernanceProposal {
    pub id: u256,
    pub proposer: ContractAddress,
    pub description: felt252,
    pub proposal_type: u32,         // 0=minor, 1=major, 2=protocol, 3=emergency, 4=strategic
    pub inflation_change: i32,      // Percentage change in inflation rate (basis points)
    pub burn_rate_change: i32,      // Percentage change in burn rate (basis points)
    pub votes_for: u256,
    pub votes_against: u256,
    pub created_at: u64,
    pub voting_ends_at: u64,
    pub executed: bool,
    pub quorum_achieved: bool,      // Whether minimum quorum was reached
    pub supermajority_required: bool, // Whether supermajority is required
}

/// Progressive governance rights information
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct GovernanceRights {
    pub base_voting_power: u256,
    pub multiplied_voting_power: u256,
    pub governance_tier: u32,       // 0=basic, 1=long-term, 2=veteran
    pub can_create_proposals: bool,
    pub proposal_threshold_met: u32, // Which threshold level they meet (0-4)
}

/// Governance statistics for transparency
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct GovernanceStats {
    pub total_proposals: u256,
    pub successful_proposals: u256,
    pub current_quorum_requirement: u256,
    pub average_participation_rate: u32,
}

/// Burn event structure for transparency
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct BurnEvent {
    pub amount: u256,
    pub revenue_source: u256,
    pub timestamp: u64,
    pub burn_rate: u32,             // Burn rate in basis points
    pub execution_price: u256,      // Price at which tokens were burned
}

/// Security budget tracking
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct SecurityBudget {
    pub annual_budget_usd: u256,
    pub current_reserves: u256,
    pub last_replenishment: u64,
    pub guard_band_active: bool,
}

/// Pending large transfer structure for anti-manipulation
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct PendingTransfer {
    pub id: u256,
    pub from: ContractAddress,
    pub to: ContractAddress,
    pub amount: u256,
    pub timestamp: u64,
    pub execute_after: u64,
    pub approved_by_council: bool,
}

/// Security audit report structure
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct SecurityAuditReport {
    pub audit_id: u256,
    pub timestamp: u64,
    pub auditor: ContractAddress,
    pub findings_count: u32,
    pub security_score: u32,
    pub critical_issues: u32,
    pub recommendations: felt252,
}

/// Rate limiting information
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct RateLimitInfo {
    pub current_limit: u256,
    pub window_start: u64,
    pub window_duration: u64,
    pub current_usage: u256,
    pub remaining_capacity: u256,
}

/// Emergency operation log entry
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct EmergencyOperation {
    pub id: u256,
    pub operation_type: felt252,
    pub executor: ContractAddress,
    pub timestamp: u64,
    pub details: felt252,
    pub approved_by_council: bool,
}

/// CIRO Token interface extending ERC20 with tokenomics features
#[starknet::interface]
pub trait ICIROToken<TContractState> {
    /// Standard ERC20 Functions
    
    /// Get token name
    fn name(self: @TContractState) -> felt252;
    
    /// Get token symbol
    fn symbol(self: @TContractState) -> felt252;
    
    /// Get token decimals
    fn decimals(self: @TContractState) -> u8;
    
    /// Get total supply
    fn total_supply(self: @TContractState) -> u256;
    
    /// Get balance of account
    fn balance_of(self: @TContractState, account: ContractAddress) -> u256;
    
    /// Get allowance for spender
    fn allowance(self: @TContractState, owner: ContractAddress, spender: ContractAddress) -> u256;
    
    /// Transfer tokens
    fn transfer(ref self: TContractState, recipient: ContractAddress, amount: u256) -> bool;
    
    /// Transfer tokens from account
    fn transfer_from(
        ref self: TContractState,
        sender: ContractAddress,
        recipient: ContractAddress,
        amount: u256
    ) -> bool;
    
    /// Approve spender
    fn approve(ref self: TContractState, spender: ContractAddress, amount: u256) -> bool;
    
    /// Increase allowance
    fn increase_allowance(ref self: TContractState, spender: ContractAddress, added_value: u256) -> bool;
    
    /// Decrease allowance
    fn decrease_allowance(ref self: TContractState, spender: ContractAddress, subtracted_value: u256) -> bool;
    
    /// Tokenomics Functions
    
    /// Mint tokens (governance controlled)
    /// @param to: Address to mint to
    /// @param amount: Amount to mint
    /// @param reason: Reason for minting (inflation, security budget, etc.)
    fn mint(ref self: TContractState, to: ContractAddress, amount: u256, reason: felt252);
    
    /// Burn tokens from revenue
    /// @param amount: Amount to burn
    /// @param revenue_source: Source of revenue in USD
    /// @param execution_price: Price at which burn was executed
    fn burn_from_revenue(ref self: TContractState, amount: u256, revenue_source: u256, execution_price: u256);
    
    /// Get current inflation rate
    fn get_inflation_rate(self: @TContractState) -> u32;
    
    /// Get current burn rate
    fn get_burn_rate(self: @TContractState) -> u32;
    
    /// Get total burned tokens
    fn get_total_burned(self: @TContractState) -> u256;
    
    /// Get security budget status
    fn get_security_budget(self: @TContractState) -> SecurityBudget;
    
    /// Governance Functions (Enhanced v3.1)
    
    /// Create governance proposal with type validation
    /// @param description: Proposal description
    /// @param proposal_type: Type of proposal (0-4)
    /// @param inflation_change: Proposed inflation change (basis points)
    /// @param burn_rate_change: Proposed burn rate change (basis points)
    /// @return proposal_id: Created proposal ID
    fn create_typed_proposal(
        ref self: TContractState,
        description: felt252,
        proposal_type: u32,
        inflation_change: i32,
        burn_rate_change: i32
    ) -> u256;
    
    /// Create governance proposal (legacy compatibility)
    /// @param description: Proposal description
    /// @param inflation_change: Proposed inflation change (basis points)
    /// @param burn_rate_change: Proposed burn rate change (basis points)
    /// @return proposal_id: Created proposal ID
    fn create_proposal(
        ref self: TContractState,
        description: felt252,
        inflation_change: i32,
        burn_rate_change: i32
    ) -> u256;
    
    /// Vote on governance proposal
    /// @param proposal_id: Proposal to vote on
    /// @param vote_for: True for yes, false for no
    /// @param voting_power: Voting power to use
    fn vote_on_proposal(
        ref self: TContractState,
        proposal_id: u256,
        vote_for: bool,
        voting_power: u256
    );
    
    /// Execute governance proposal (after voting period)
    /// @param proposal_id: Proposal to execute
    fn execute_proposal(ref self: TContractState, proposal_id: u256);
    
    /// Get governance proposal details
    /// @param proposal_id: Proposal ID
    /// @return proposal: Proposal details
    fn get_proposal(self: @TContractState, proposal_id: u256) -> GovernanceProposal;
    
    /// Get voting power for account (legacy)
    /// @param account: Account to check
    /// @return voting_power: Current voting power
    fn get_voting_power(self: @TContractState, account: ContractAddress) -> u256;
    
    /// Get complete governance rights for account
    /// @param account: Account to check
    /// @return rights: Complete governance rights information
    fn get_governance_rights(self: @TContractState, account: ContractAddress) -> GovernanceRights;
    
    /// Get governance statistics
    /// @return stats: Current governance statistics
    fn get_governance_stats(self: @TContractState) -> GovernanceStats;
    
    /// Check if account can create proposals of specific type
    /// @param account: Account to check
    /// @param proposal_type: Type of proposal (0-4)
    /// @return can_create: Whether account can create this type of proposal
    fn can_create_proposal_type(self: @TContractState, account: ContractAddress, proposal_type: u32) -> bool;
    
    /// Emergency governance pause (security measure)
    /// @param duration: Duration to pause governance in seconds
    fn emergency_governance_pause(ref self: TContractState, duration: u64);
    
    /// Resume governance after emergency pause
    fn resume_governance(ref self: TContractState);
    
    /// Contract Integration Functions
    
    /// Collect fees from JobManager
    /// @param amount: Fee amount collected
    /// @param job_id: Job ID for tracking
    fn collect_job_fee(ref self: TContractState, amount: u256, job_id: u256);
    
    /// Distribute rewards to CDC Pool
    /// @param pool_address: CDC Pool contract address
    /// @param amount: Amount to distribute
    fn distribute_pool_rewards(ref self: TContractState, pool_address: ContractAddress, amount: u256);
    
    /// Pay for gas-free transaction (Paymaster integration)
    /// @param user: User address
    /// @param gas_cost: Gas cost to pay
    /// @return success: Whether payment was successful
    fn pay_gas_fee(ref self: TContractState, user: ContractAddress, gas_cost: u256) -> bool;
    
    /// Replenish security budget
    /// @param amount: Additional amount for security budget
    fn replenish_security_budget(ref self: TContractState, amount: u256);
    
    /// Emergency Functions
    
    /// Pause contract (emergency only)
    fn pause(ref self: TContractState);
    
    /// Unpause contract
    fn unpause(ref self: TContractState);
    
    /// Check if contract is paused
    fn is_paused(self: @TContractState) -> bool;
    
    /// Emergency mint (security budget protection)
    /// @param amount: Amount to mint
    /// @param justification: Justification for emergency mint
    fn emergency_mint(ref self: TContractState, amount: u256, justification: felt252);
    
    /// View Functions
    
    /// Get burn history
    /// @param offset: Pagination offset
    /// @param limit: Number of records to return
    /// @return burns: Array of burn events
    fn get_burn_history(self: @TContractState, offset: u32, limit: u32) -> Array<BurnEvent>;
    
    /// Get current network phase
    /// @return phase: Current network phase (bootstrap, growth, mature, etc.)
    fn get_network_phase(self: @TContractState) -> felt252;
    
    /// Get revenue statistics
    /// @return total_revenue: Total revenue collected
    /// @return monthly_revenue: Revenue in last 30 days
    /// @return burn_efficiency: Burn efficiency percentage
    fn get_revenue_stats(self: @TContractState) -> (u256, u256, u32);
    
    /// Security Functions (v3.1 Enhanced)
    
    /// Check rate limit status for inflation adjustments
    /// @return can_adjust: Whether inflation can be adjusted
    /// @return next_available: When next adjustment is available
    /// @return adjustments_remaining: How many adjustments left this month
    fn check_inflation_adjustment_rate_limit(self: @TContractState) -> (bool, u64, u32);
    
    /// Submit security audit report
    /// @param findings_count: Number of findings
    /// @param security_score: Overall security score (0-100)
    /// @param critical_issues: Number of critical issues
    /// @param recommendations: Audit recommendations
    fn submit_security_audit(
        ref self: TContractState,
        findings_count: u32,
        security_score: u32,
        critical_issues: u32,
        recommendations: felt252
    );
    
    /// Get security audit status
    /// @return last_audit: Last audit timestamp
    /// @return security_score: Current security score
    /// @return days_since_audit: Days since last audit
    fn get_security_audit_status(self: @TContractState) -> (u64, u32, u32);
    
    /// Initialize large transfer (anti-manipulation)
    /// @param to: Recipient address
    /// @param amount: Amount to transfer
    /// @return transfer_id: ID for tracking the transfer
    fn initiate_large_transfer(ref self: TContractState, to: ContractAddress, amount: u256) -> u256;
    
    /// Execute pending large transfer
    /// @param transfer_id: ID of the transfer to execute
    fn execute_large_transfer(ref self: TContractState, transfer_id: u256);
    
    /// Get pending large transfer details
    /// @param transfer_id: Transfer ID
    /// @return transfer: Transfer details
    fn get_pending_transfer(self: @TContractState, transfer_id: u256) -> PendingTransfer;
    
    /// Check rate limit for regular transfers
    /// @param user: User address
    /// @param amount: Amount to transfer
    /// @return allowed: Whether transfer is allowed
    /// @return limit_info: Rate limit information
    fn check_transfer_rate_limit(self: @TContractState, user: ContractAddress, amount: u256) -> (bool, RateLimitInfo);
    
    /// Enable/disable gas optimizations
    /// @param enabled: Whether to enable gas optimizations
    fn set_gas_optimization(ref self: TContractState, enabled: bool);
    
    /// Get contract version and upgrade info
    /// @return version: Current contract version
    /// @return upgrade_authorized: Whether upgrades are authorized
    /// @return timelock_remaining: Remaining timelock for critical operations
    fn get_contract_info(self: @TContractState) -> (felt252, bool, u64);
    
    /// Log emergency operation
    /// @param operation_type: Type of emergency operation
    /// @param details: Operation details
    fn log_emergency_operation(ref self: TContractState, operation_type: felt252, details: felt252);
    
    /// Get emergency operation log
    /// @param operation_id: Operation ID
    /// @return operation: Emergency operation details
    fn get_emergency_operation(self: @TContractState, operation_id: u256) -> EmergencyOperation;
    
    /// Batch operations for gas optimization
    /// @param recipients: Array of recipient addresses
    /// @param amounts: Array of amounts to transfer
    /// @return success: Whether all transfers succeeded
    fn batch_transfer(ref self: TContractState, recipients: Array<ContractAddress>, amounts: Array<u256>) -> bool;
    
    /// Monitor suspicious activity
    /// @param activity_type: Type of suspicious activity
    /// @param severity: Severity level (1-10)
    fn report_suspicious_activity(ref self: TContractState, activity_type: felt252, severity: u32);
    
    /// Get security monitoring status
    /// @return suspicious_count: Number of suspicious activities
    /// @return alert_threshold: Current alert threshold
    /// @return last_review: Last security review timestamp
    fn get_security_monitoring_status(self: @TContractState) -> (u32, u32, u64);
    
    /// Emergency functions with enhanced security
    /// @param amount: Amount to withdraw
    /// @param justification: Justification for emergency withdrawal
    fn emergency_withdraw(ref self: TContractState, amount: u256, justification: felt252);
    
    /// Authorize contract upgrade
    /// @param new_implementation: New implementation address
    /// @param timelock_duration: Timelock duration in seconds
    fn authorize_upgrade(ref self: TContractState, new_implementation: ContractAddress, timelock_duration: u64);
} 