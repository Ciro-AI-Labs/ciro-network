use core::result::ResultTrait;
use core::option::OptionTrait;
use core::traits::TryInto;
use core::traits::Into;
use core::serde::Serde;
use core::array::ArrayTrait;
use starknet::{ContractAddress, contract_address_const, get_caller_address, get_block_timestamp};
use starknet::testing::{set_caller_address, set_block_timestamp, set_contract_address};

use ciro_contracts::ciro_token::CiroToken;
use ciro_contracts::interfaces::ciro_token::{
    ICiroToken, WorkerTier, WorkerTierBenefits, GovernanceProposal, GovernanceRights, GovernanceStats, 
    ProposalType, SecurityBudget, PendingTransfer, SecurityAuditReport, RateLimitInfo, EmergencyOperation
};
use ciro_contracts::constants::{
    TOTAL_SUPPLY, MAX_MINT_PERCENTAGE, SCALE, SECONDS_PER_YEAR, SECONDS_PER_MONTH,
    BASIC_WORKER_THRESHOLD, PREMIUM_WORKER_THRESHOLD, ENTERPRISE_WORKER_THRESHOLD,
    INFRASTRUCTURE_WORKER_THRESHOLD, FLEET_WORKER_THRESHOLD, DATACENTER_WORKER_THRESHOLD,
    HYPERSCALE_WORKER_THRESHOLD, INSTITUTIONAL_WORKER_THRESHOLD
};

// Test helper functions
fn deploy_ciro_token() -> (ContractAddress, ICiroToken) {
    let owner = contract_address_const::<'owner'>();
    let job_manager = contract_address_const::<'job_manager'>();
    let cdc_pool = contract_address_const::<'cdc_pool'>();
    let paymaster = contract_address_const::<'paymaster'>();
    
    set_caller_address(owner);
    
    let contract = CiroToken::deploy(
        owner,
        job_manager,
        cdc_pool,
        paymaster,
        'CIRO_v3.1' // network_phase
    );
    
    (contract, ICiroToken { contract_address: contract })
}

fn get_test_addresses() -> (ContractAddress, ContractAddress, ContractAddress, ContractAddress) {
    (
        contract_address_const::<'owner'>(),
        contract_address_const::<'user1'>(),
        contract_address_const::<'user2'>(),
        contract_address_const::<'auditor'>()
    )
}

// Core ERC20 Tests
#[test]
fn test_initial_supply() {
    let (contract_address, ciro_token) = deploy_ciro_token();
    let (owner, _, _, _) = get_test_addresses();
    
    let total_supply = ciro_token.total_supply();
    assert(total_supply == TOTAL_SUPPLY, 'Wrong total supply');
    
    let owner_balance = ciro_token.balance_of(owner);
    let expected_initial = (TOTAL_SUPPLY * 150) / 1000; // 15% initial circulation
    assert(owner_balance == expected_initial, 'Wrong owner balance');
}

#[test]
fn test_basic_transfer() {
    let (contract_address, ciro_token) = deploy_ciro_token();
    let (owner, user1, _, _) = get_test_addresses();
    
    set_caller_address(owner);
    
    let transfer_amount = 1000 * SCALE;
    let success = ciro_token.transfer(user1, transfer_amount);
    assert(success, 'Transfer failed');
    
    let user1_balance = ciro_token.balance_of(user1);
    assert(user1_balance == transfer_amount, 'Wrong user1 balance');
}

#[test]
fn test_allowance_system() {
    let (contract_address, ciro_token) = deploy_ciro_token();
    let (owner, user1, user2, _) = get_test_addresses();
    
    set_caller_address(owner);
    
    let allowance_amount = 500 * SCALE;
    ciro_token.approve(user1, allowance_amount);
    
    let allowance = ciro_token.allowance(owner, user1);
    assert(allowance == allowance_amount, 'Wrong allowance');
    
    set_caller_address(user1);
    let transfer_amount = 200 * SCALE;
    let success = ciro_token.transfer_from(owner, user2, transfer_amount);
    assert(success, 'Transfer from failed');
    
    let user2_balance = ciro_token.balance_of(user2);
    assert(user2_balance == transfer_amount, 'Wrong user2 balance');
    
    let remaining_allowance = ciro_token.allowance(owner, user1);
    assert(remaining_allowance == allowance_amount - transfer_amount, 'Wrong remaining allowance');
}

// Worker Tier Tests
#[test]
fn test_worker_tier_calculation() {
    let (contract_address, ciro_token) = deploy_ciro_token();
    let (owner, user1, _, _) = get_test_addresses();
    
    set_caller_address(owner);
    
    // Test Basic Worker tier
    let basic_amount = BASIC_WORKER_THRESHOLD;
    ciro_token.transfer(user1, basic_amount);
    
    let tier = ciro_token.get_worker_tier(user1);
    assert(tier == WorkerTier::Basic, 'Wrong basic tier');
    
    let benefits = ciro_token.get_worker_tier_benefits(user1);
    assert(benefits.allocation_multiplier == 10, 'Wrong basic multiplier'); // 1.0x as 10
    assert(benefits.performance_bonus == 5, 'Wrong basic bonus');
    
    // Test Premium Worker tier
    let premium_amount = PREMIUM_WORKER_THRESHOLD;
    ciro_token.transfer(user1, premium_amount - basic_amount);
    
    let tier = ciro_token.get_worker_tier(user1);
    assert(tier == WorkerTier::Premium, 'Wrong premium tier');
    
    let benefits = ciro_token.get_worker_tier_benefits(user1);
    assert(benefits.allocation_multiplier == 12, 'Wrong premium multiplier'); // 1.2x as 12
    assert(benefits.performance_bonus == 10, 'Wrong premium bonus');
}

#[test]
fn test_all_worker_tiers() {
    let (contract_address, ciro_token) = deploy_ciro_token();
    let (owner, user1, _, _) = get_test_addresses();
    
    set_caller_address(owner);
    
    // Test all tier thresholds
    let test_cases = array![
        (BASIC_WORKER_THRESHOLD, WorkerTier::Basic, 10_u32, 5_u32),
        (PREMIUM_WORKER_THRESHOLD, WorkerTier::Premium, 12_u32, 10_u32),
        (ENTERPRISE_WORKER_THRESHOLD, WorkerTier::Enterprise, 15_u32, 15_u32),
        (INFRASTRUCTURE_WORKER_THRESHOLD, WorkerTier::Infrastructure, 20_u32, 25_u32),
        (FLEET_WORKER_THRESHOLD, WorkerTier::Fleet, 25_u32, 30_u32),
        (DATACENTER_WORKER_THRESHOLD, WorkerTier::Datacenter, 30_u32, 35_u32),
        (HYPERSCALE_WORKER_THRESHOLD, WorkerTier::Hyperscale, 40_u32, 40_u32),
        (INSTITUTIONAL_WORKER_THRESHOLD, WorkerTier::Institutional, 50_u32, 50_u32),
    ];
    
    let mut i = 0;
    while i < test_cases.len() {
        let (threshold, expected_tier, expected_multiplier, expected_bonus) = *test_cases.at(i);
        
        // Transfer enough to reach this tier
        ciro_token.transfer(user1, threshold);
        
        let tier = ciro_token.get_worker_tier(user1);
        assert(tier == expected_tier, 'Wrong tier');
        
        let benefits = ciro_token.get_worker_tier_benefits(user1);
        assert(benefits.allocation_multiplier == expected_multiplier, 'Wrong multiplier');
        assert(benefits.performance_bonus == expected_bonus, 'Wrong bonus');
        
        // Reset for next test
        let current_balance = ciro_token.balance_of(user1);
        set_caller_address(user1);
        ciro_token.transfer(owner, current_balance);
        set_caller_address(owner);
        
        i += 1;
    };
}

// Tokenomics Tests
#[test]
fn test_revenue_processing() {
    let (contract_address, ciro_token) = deploy_ciro_token();
    let (owner, _, _, _) = get_test_addresses();
    
    set_caller_address(owner);
    
    let revenue_amount = 10000 * SCALE;
    ciro_token.process_revenue(revenue_amount);
    
    let revenue_stats = ciro_token.get_revenue_stats();
    let (total_revenue, monthly_revenue, burn_efficiency) = revenue_stats;
    
    assert(total_revenue >= revenue_amount, 'Wrong total revenue');
    assert(monthly_revenue >= revenue_amount, 'Wrong monthly revenue');
}

#[test]
fn test_inflation_adjustment() {
    let (contract_address, ciro_token) = deploy_ciro_token();
    let (owner, _, _, _) = get_test_addresses();
    
    set_caller_address(owner);
    
    let initial_rate = ciro_token.get_inflation_rate();
    let new_rate = initial_rate + 50; // Increase by 0.5%
    
    ciro_token.adjust_inflation_rate(new_rate);
    
    let updated_rate = ciro_token.get_inflation_rate();
    assert(updated_rate == new_rate, 'Inflation rate not updated');
}

#[test]
fn test_inflation_rate_limiting() {
    let (contract_address, ciro_token) = deploy_ciro_token();
    let (owner, _, _, _) = get_test_addresses();
    
    set_caller_address(owner);
    
    // Check initial rate limit status
    let (can_adjust, next_available, adjustments_remaining) = ciro_token.check_inflation_adjustment_rate_limit();
    assert(can_adjust, 'Should be able to adjust initially');
    assert(adjustments_remaining == 2, 'Should have 2 adjustments remaining');
    
    // Make first adjustment
    ciro_token.adjust_inflation_rate(250);
    
    // Check after first adjustment
    let (can_adjust, next_available, adjustments_remaining) = ciro_token.check_inflation_adjustment_rate_limit();
    assert(can_adjust, 'Should still be able to adjust');
    assert(adjustments_remaining == 1, 'Should have 1 adjustment remaining');
    
    // Make second adjustment
    ciro_token.adjust_inflation_rate(300);
    
    // Check after second adjustment
    let (can_adjust, next_available, adjustments_remaining) = ciro_token.check_inflation_adjustment_rate_limit();
    assert(!can_adjust, 'Should not be able to adjust');
    assert(adjustments_remaining == 0, 'Should have 0 adjustments remaining');
}

// Governance Tests
#[test]
fn test_governance_proposal_creation() {
    let (contract_address, ciro_token) = deploy_ciro_token();
    let (owner, user1, _, _) = get_test_addresses();
    
    set_caller_address(owner);
    
    // Give user1 enough tokens for governance
    let governance_amount = 50000 * SCALE; // Minor proposal threshold
    ciro_token.transfer(user1, governance_amount);
    
    set_caller_address(user1);
    
    let proposal_id = ciro_token.create_typed_proposal(
        'Test Proposal',
        'Description',
        0, // Minor change
        7 * 24 * 3600 // 7 days
    );
    
    assert(proposal_id > 0, 'Proposal not created');
    
    let proposal = ciro_token.get_proposal(proposal_id);
    assert(proposal.id == proposal_id, 'Wrong proposal ID');
    assert(proposal.proposer == user1, 'Wrong proposer');
}

#[test]
fn test_governance_voting() {
    let (contract_address, ciro_token) = deploy_ciro_token();
    let (owner, user1, user2, _) = get_test_addresses();
    
    set_caller_address(owner);
    
    // Setup governance tokens
    let governance_amount = 100000 * SCALE;
    ciro_token.transfer(user1, governance_amount);
    ciro_token.transfer(user2, governance_amount);
    
    set_caller_address(user1);
    
    // Create proposal
    let proposal_id = ciro_token.create_typed_proposal(
        'Test Proposal',
        'Description',
        0, // Minor change
        7 * 24 * 3600 // 7 days
    );
    
    // Vote on proposal
    ciro_token.vote_on_proposal(proposal_id, true);
    
    set_caller_address(user2);
    ciro_token.vote_on_proposal(proposal_id, false);
    
    let proposal = ciro_token.get_proposal(proposal_id);
    assert(proposal.yes_votes > 0, 'No yes votes recorded');
    assert(proposal.no_votes > 0, 'No no votes recorded');
}

#[test]
fn test_progressive_governance_rights() {
    let (contract_address, ciro_token) = deploy_ciro_token();
    let (owner, user1, _, _) = get_test_addresses();
    
    set_caller_address(owner);
    
    let governance_amount = 100000 * SCALE;
    ciro_token.transfer(user1, governance_amount);
    
    // Check initial governance rights
    let rights = ciro_token.get_governance_rights(user1);
    assert(rights.base_voting_power == governance_amount, 'Wrong base voting power');
    assert(rights.multiplied_voting_power == governance_amount, 'Wrong multiplied voting power');
    assert(rights.governance_tier == 0, 'Wrong initial tier'); // Basic tier
    
    // Simulate holding for 1 year
    set_block_timestamp(get_block_timestamp() + SECONDS_PER_YEAR);
    
    let rights_after_year = ciro_token.get_governance_rights(user1);
    assert(rights_after_year.multiplied_voting_power > governance_amount, 'No multiplier applied');
}

// Security Tests
#[test]
fn test_security_audit_submission() {
    let (contract_address, ciro_token) = deploy_ciro_token();
    let (owner, _, _, auditor) = get_test_addresses();
    
    set_caller_address(owner);
    
    // Authorize auditor
    ciro_token.authorize_upgrade(auditor, 0);
    
    set_caller_address(auditor);
    
    // Submit security audit
    ciro_token.submit_security_audit(5, 85, 2, 'High priority fixes needed');
    
    let (last_audit, security_score, days_since_audit) = ciro_token.get_security_audit_status();
    assert(last_audit > 0, 'No audit timestamp');
    assert(security_score == 85, 'Wrong security score');
    assert(days_since_audit == 0, 'Wrong days since audit');
}

#[test]
fn test_large_transfer_mechanism() {
    let (contract_address, ciro_token) = deploy_ciro_token();
    let (owner, user1, user2, _) = get_test_addresses();
    
    set_caller_address(owner);
    
    let large_amount = 150000 * SCALE; // Above large transfer threshold
    ciro_token.transfer(user1, large_amount);
    
    set_caller_address(user1);
    
    // Initiate large transfer
    let transfer_id = ciro_token.initiate_large_transfer(user2, large_amount);
    assert(transfer_id > 0, 'Large transfer not initiated');
    
    // Check pending transfer
    let pending_transfer = ciro_token.get_pending_transfer(transfer_id);
    assert(pending_transfer.id == transfer_id, 'Wrong transfer ID');
    assert(pending_transfer.from == user1, 'Wrong sender');
    assert(pending_transfer.to == user2, 'Wrong recipient');
    assert(pending_transfer.amount == large_amount, 'Wrong amount');
    
    // Try to execute before delay - should fail
    // This would panic in real scenario, but we can't test panics directly
    
    // Simulate delay passing
    set_block_timestamp(get_block_timestamp() + 3 * 3600); // 3 hours later
    
    // Execute transfer
    ciro_token.execute_large_transfer(transfer_id);
    
    // Check balances
    let user1_balance = ciro_token.balance_of(user1);
    let user2_balance = ciro_token.balance_of(user2);
    
    assert(user1_balance == 0, 'User1 should have 0 balance');
    assert(user2_balance == large_amount, 'User2 should have large amount');
}

#[test]
fn test_rate_limiting() {
    let (contract_address, ciro_token) = deploy_ciro_token();
    let (owner, user1, user2, _) = get_test_addresses();
    
    set_caller_address(owner);
    
    let transfer_amount = 50000 * SCALE;
    ciro_token.transfer(user1, transfer_amount * 2);
    
    set_caller_address(user1);
    
    // Check rate limit before transfer
    let (allowed, limit_info) = ciro_token.check_transfer_rate_limit(user1, transfer_amount);
    assert(allowed, 'Transfer should be allowed');
    assert(limit_info.current_usage == 0, 'Should have no current usage');
    
    // Make transfer
    ciro_token.transfer(user2, transfer_amount);
    
    // Check rate limit after transfer
    let (allowed, limit_info) = ciro_token.check_transfer_rate_limit(user1, transfer_amount);
    assert(limit_info.current_usage == transfer_amount, 'Wrong current usage');
}

#[test]
fn test_batch_transfer() {
    let (contract_address, ciro_token) = deploy_ciro_token();
    let (owner, user1, user2, _) = get_test_addresses();
    
    set_caller_address(owner);
    
    let transfer_amount = 10000 * SCALE;
    ciro_token.transfer(user1, transfer_amount * 2);
    
    set_caller_address(user1);
    
    // Prepare batch transfer
    let mut recipients = array![];
    let mut amounts = array![];
    
    recipients.append(user2);
    recipients.append(owner);
    amounts.append(transfer_amount);
    amounts.append(transfer_amount);
    
    // Execute batch transfer
    let success = ciro_token.batch_transfer(recipients, amounts);
    assert(success, 'Batch transfer failed');
    
    // Check balances
    let user1_balance = ciro_token.balance_of(user1);
    let user2_balance = ciro_token.balance_of(user2);
    
    assert(user1_balance == 0, 'User1 should have 0 balance');
    assert(user2_balance == transfer_amount, 'User2 should have transfer amount');
}

#[test]
fn test_emergency_operations() {
    let (contract_address, ciro_token) = deploy_ciro_token();
    let (owner, _, _, _) = get_test_addresses();
    
    set_caller_address(owner);
    
    // Test emergency operation logging
    ciro_token.log_emergency_operation('pause', 'System maintenance');
    
    // Test emergency operation retrieval
    let operation = ciro_token.get_emergency_operation(1);
    assert(operation.id == 1, 'Wrong operation ID');
    assert(operation.operation_type == 'pause', 'Wrong operation type');
}

#[test]
fn test_suspicious_activity_monitoring() {
    let (contract_address, ciro_token) = deploy_ciro_token();
    let (owner, user1, _, _) = get_test_addresses();
    
    set_caller_address(user1);
    
    // Report suspicious activity
    ciro_token.report_suspicious_activity('unusual_pattern', 7);
    
    // Check monitoring status
    let (suspicious_count, alert_threshold, last_review) = ciro_token.get_security_monitoring_status();
    assert(suspicious_count == 1, 'Wrong suspicious count');
    assert(alert_threshold == 10, 'Wrong alert threshold');
}

#[test]
fn test_gas_optimization() {
    let (contract_address, ciro_token) = deploy_ciro_token();
    let (owner, _, _, _) = get_test_addresses();
    
    set_caller_address(owner);
    
    // Test gas optimization toggle
    ciro_token.set_gas_optimization(false);
    
    // Check contract info
    let (version, upgrade_authorized, timelock_remaining) = ciro_token.get_contract_info();
    assert(version == 'v3.1.0', 'Wrong contract version');
}

#[test]
fn test_contract_upgrade_authorization() {
    let (contract_address, ciro_token) = deploy_ciro_token();
    let (owner, _, _, _) = get_test_addresses();
    
    set_caller_address(owner);
    
    let new_implementation = contract_address_const::<'new_impl'>();
    let timelock_duration = 24 * 3600; // 24 hours
    
    // Authorize upgrade
    ciro_token.authorize_upgrade(new_implementation, timelock_duration);
    
    // Check authorization
    let (version, upgrade_authorized, timelock_remaining) = ciro_token.get_contract_info();
    assert(timelock_remaining > 0, 'No timelock set');
}

// Integration Tests
#[test]
fn test_complete_user_journey() {
    let (contract_address, ciro_token) = deploy_ciro_token();
    let (owner, user1, user2, _) = get_test_addresses();
    
    set_caller_address(owner);
    
    // 1. User receives tokens
    let initial_amount = 25000 * SCALE;
    ciro_token.transfer(user1, initial_amount);
    
    // 2. Check worker tier
    let tier = ciro_token.get_worker_tier(user1);
    assert(tier == WorkerTier::Enterprise, 'Wrong initial tier');
    
    // 3. User participates in governance
    set_caller_address(user1);
    let proposal_id = ciro_token.create_typed_proposal(
        'Increase rewards',
        'Proposal to increase worker rewards',
        0, // Minor change
        7 * 24 * 3600
    );
    
    // 4. User votes on proposal
    ciro_token.vote_on_proposal(proposal_id, true);
    
    // 5. User makes transfers
    let transfer_amount = 5000 * SCALE;
    ciro_token.transfer(user2, transfer_amount);
    
    // 6. Check final balances and tier
    let user1_balance = ciro_token.balance_of(user1);
    let user2_balance = ciro_token.balance_of(user2);
    let final_tier = ciro_token.get_worker_tier(user1);
    
    assert(user1_balance == initial_amount - transfer_amount, 'Wrong final user1 balance');
    assert(user2_balance == transfer_amount, 'Wrong final user2 balance');
    assert(final_tier == WorkerTier::Enterprise, 'Tier changed unexpectedly');
}

#[test]
fn test_tokenomics_integration() {
    let (contract_address, ciro_token) = deploy_ciro_token();
    let (owner, _, _, _) = get_test_addresses();
    
    set_caller_address(owner);
    
    // Process revenue
    let revenue_amount = 50000 * SCALE;
    ciro_token.process_revenue(revenue_amount);
    
    // Check supply effects
    let total_supply_after = ciro_token.total_supply();
    assert(total_supply_after < TOTAL_SUPPLY, 'Supply should decrease due to burning');
    
    // Get revenue stats
    let (total_revenue, monthly_revenue, burn_efficiency) = ciro_token.get_revenue_stats();
    assert(total_revenue >= revenue_amount, 'Revenue not processed');
    assert(burn_efficiency > 0, 'No burn efficiency');
}

#[test]
fn test_security_features_integration() {
    let (contract_address, ciro_token) = deploy_ciro_token();
    let (owner, user1, _, auditor) = get_test_addresses();
    
    set_caller_address(owner);
    
    // Setup
    ciro_token.authorize_upgrade(auditor, 0);
    let amount = 200000 * SCALE;
    ciro_token.transfer(user1, amount);
    
    // 1. Security audit
    set_caller_address(auditor);
    ciro_token.submit_security_audit(3, 92, 1, 'Minor issues found');
    
    // 2. Large transfer
    set_caller_address(user1);
    let transfer_id = ciro_token.initiate_large_transfer(owner, amount);
    
    // 3. Suspicious activity
    ciro_token.report_suspicious_activity('large_transfer', 5);
    
    // 4. Emergency operation
    set_caller_address(owner);
    ciro_token.log_emergency_operation('security_review', 'Reviewing large transfer');
    
    // Verify all systems working
    let (last_audit, security_score, days_since_audit) = ciro_token.get_security_audit_status();
    assert(security_score == 92, 'Wrong security score');
    
    let pending_transfer = ciro_token.get_pending_transfer(transfer_id);
    assert(pending_transfer.id == transfer_id, 'Transfer not pending');
    
    let (suspicious_count, alert_threshold, last_review) = ciro_token.get_security_monitoring_status();
    assert(suspicious_count == 1, 'Activity not recorded');
} 