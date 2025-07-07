//! Comprehensive tests for the vesting system
//! Tests both LinearVestingWithCliff and MilestoneVesting contracts

use snforge_std::{declare, ContractClassTrait, start_cheat_caller_address, stop_cheat_caller_address, cheat_block_timestamp}; 
use starknet::{ContractAddress, contract_address_const};

// Import the correct interfaces from the updated vesting contracts
use ciro_contracts::vesting::linear_vesting_with_cliff::{
    ILinearVestingWithCliffDispatcher, ILinearVestingWithCliffDispatcherTrait,
    VestingSchedule
};

use ciro_contracts::vesting::milestone_vesting::{
    IMilestoneVestingDispatcher, IMilestoneVestingDispatcherTrait, 
    MilestoneSchedule, Milestone, MilestoneStatus
};

// Mock ERC20 token for testing
use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};

// Constants for testing
const ADMIN: felt252 = 'admin';
const BENEFICIARY: felt252 = 'beneficiary';
const ADVISOR: felt252 = 'advisor';
const COMPLIANCE_OFFICER: felt252 = 'compliance';
const TOKEN_AMOUNT: u256 = 1000000_u256; // 1M tokens
const CLIFF_DURATION: u64 = 86400_u64 * 30; // 30 days
const VESTING_DURATION: u64 = 86400_u64 * 365; // 1 year

// Helper function to deploy test token
fn deploy_test_token() -> ContractAddress {
    let class_hash = declare("TestERC20Token").unwrap().class_hash;
    let constructor_calldata = array![
        TOKEN_AMOUNT.low.into(),
        TOKEN_AMOUNT.high.into(),
        'Test Token',
        'TEST',
        contract_address_const::<ADMIN>().into()
    ];
    
    let (contract_address, _) = starknet::deploy_syscall(
        class_hash, 
        0, 
        constructor_calldata.span(), 
        false
    ).unwrap();
    
    contract_address
}

#[test]
fn test_linear_vesting_deployment() {
    let token_address = deploy_test_token();
    
    let class_hash = declare("LinearVestingWithCliff").unwrap().class_hash;
    let constructor_calldata = array![
        token_address.into(),
        contract_address_const::<ADMIN>().into()
    ];
    
    let (contract_address, _) = starknet::deploy_syscall(
        class_hash,
        0,
        constructor_calldata.span(),
        false
    ).unwrap();
    
    let vesting_contract = ILinearVestingWithCliffDispatcher { contract_address };
    assert(vesting_contract.get_total_vesting_schedules() == 0, 'Should start with 0 schedules');
}

#[test]
fn test_milestone_vesting_deployment() {
    let token_address = deploy_test_token();
    
    let class_hash = declare("MilestoneVesting").unwrap().class_hash;
    let constructor_calldata = array![
        token_address.into(),
        contract_address_const::<ADMIN>().into()
    ];
    
    let (contract_address, _) = starknet::deploy_syscall(
        class_hash,
        0,
        constructor_calldata.span(),
        false
    ).unwrap();
    
    let vesting_contract = IMilestoneVestingDispatcher { contract_address };
    // Basic deployment test - contracts should be properly initialized
    assert(contract_address != contract_address_const::<0>(), 'Contract should be deployed');
}

#[test]
fn test_linear_vesting_schedule_creation() {
    let token_address = deploy_test_token();
    let class_hash = declare("LinearVestingWithCliff").unwrap().class_hash;
    let constructor_calldata = array![
        token_address.into(),
        contract_address_const::<ADMIN>().into()
    ];
    
    let (contract_address, _) = starknet::deploy_syscall(
        class_hash,
        0,
        constructor_calldata.span(),
        false
    ).unwrap();
    
    let vesting_contract = ILinearVestingWithCliffDispatcher { contract_address };
    
    // Set admin as caller
    start_cheat_caller_address(contract_address, contract_address_const::<ADMIN>());
    
    // Create vesting schedule
    let schedule_id = 1_u256;
    let start_time = starknet::get_block_timestamp();
    
    vesting_contract.create_vesting_schedule(
        contract_address_const::<BENEFICIARY>(),
        TOKEN_AMOUNT / 2, // 500k tokens
        CLIFF_DURATION,
        VESTING_DURATION,
        start_time,
        schedule_id
    );
    
    stop_cheat_caller_address(contract_address);
    
    // Verify schedule was created
    let schedule = vesting_contract.get_vesting_schedule(schedule_id);
    assert(schedule.beneficiary == contract_address_const::<BENEFICIARY>(), 'Wrong beneficiary');
    assert(schedule.total_amount == TOKEN_AMOUNT / 2, 'Wrong total amount');
    assert(schedule.cliff_duration == CLIFF_DURATION, 'Wrong cliff duration');
}

#[test] 
fn test_milestone_schedule_creation() {
    let token_address = deploy_test_token();
    let class_hash = declare("MilestoneVesting").unwrap().class_hash;
    let constructor_calldata = array![
        token_address.into(),
        contract_address_const::<ADMIN>().into()
    ];
    
    let (contract_address, _) = starknet::deploy_syscall(
        class_hash,
        0,
        constructor_calldata.span(),
        false
    ).unwrap();
    
    let vesting_contract = IMilestoneVestingDispatcher { contract_address };
    
    // Set admin as caller
    start_cheat_caller_address(contract_address, contract_address_const::<ADMIN>());
    
    // Create milestone schedule with 3 milestones
    let schedule_id = 1_u256;
    let milestone_ids = array![1_u256, 2_u256, 3_u256];
    let milestone_amounts = array![100000_u256, 150000_u256, 250000_u256]; // Total: 500k
    let now = starknet::get_block_timestamp();
    let milestone_deadlines = array![
        now + 86400 * 90,  // 3 months
        now + 86400 * 180, // 6 months  
        now + 86400 * 365  // 1 year
    ];
    
    vesting_contract.create_milestone_schedule(
        contract_address_const::<ADVISOR>(),
        500000_u256,
        milestone_ids,
        milestone_amounts,
        milestone_deadlines,
        schedule_id
    );
    
    stop_cheat_caller_address(contract_address);
    
    // Verify schedule was created
    let schedule = vesting_contract.get_milestone_schedule(schedule_id);
    assert(schedule.beneficiary == contract_address_const::<ADVISOR>(), 'Wrong beneficiary');
    assert(schedule.total_amount == 500000_u256, 'Wrong total amount');
    assert(schedule.milestones_count == 3, 'Wrong milestone count');
}

#[test]
fn test_vesting_schedule_release() {
    let token_address = deploy_test_token();
    let class_hash = declare("LinearVestingWithCliff").unwrap().class_hash;
    let constructor_calldata = array![
        token_address.into(),
        contract_address_const::<ADMIN>().into()
    ];
    
    let (contract_address, _) = starknet::deploy_syscall(
        class_hash,
        0,
        constructor_calldata.span(),
        false
    ).unwrap();
    
    let vesting_contract = ILinearVestingWithCliffDispatcher { contract_address };
    
    // Set admin as caller and create schedule
    start_cheat_caller_address(contract_address, contract_address_const::<ADMIN>());
    
    let schedule_id = 1_u256;
    let start_time = starknet::get_block_timestamp();
    
    vesting_contract.create_vesting_schedule(
        contract_address_const::<BENEFICIARY>(),
        TOKEN_AMOUNT / 4, // 250k tokens
        CLIFF_DURATION,
        VESTING_DURATION,
        start_time,
        schedule_id
    );
    
    stop_cheat_caller_address(contract_address);
    
    // Before cliff period - should have 0 releasable
    let releasable = vesting_contract.get_releasable_amount(schedule_id);
    assert(releasable == 0, 'Should be 0 before cliff');
    
    // Fast-forward past cliff but not full vesting
    cheat_block_timestamp(contract_address, start_time + CLIFF_DURATION + 86400 * 30, 86400 * 30); // 30 days after cliff
    
    // Now there should be some releasable amount
    let releasable_after_cliff = vesting_contract.get_releasable_amount(schedule_id);
    assert(releasable_after_cliff > 0, 'Should have releasable after cliff');
}

// Integration test to verify the complete vesting ecosystem
#[test]
fn test_vesting_ecosystem_integration() {
    let token_address = deploy_test_token();
    
    // Deploy both vesting contracts
    let linear_class = declare("LinearVestingWithCliff").unwrap().class_hash;
    let milestone_class = declare("MilestoneVesting").unwrap().class_hash;
    
    let constructor_calldata = array![
        token_address.into(),
        contract_address_const::<ADMIN>().into()
    ];
    
    let (linear_address, _) = starknet::deploy_syscall(
        linear_class,
        0,
        constructor_calldata.span(),
        false
    ).unwrap();
    
    let (milestone_address, _) = starknet::deploy_syscall(
        milestone_class,
        0,
        constructor_calldata.span(),
        false
    ).unwrap();
    
    let linear_vesting = ILinearVestingWithCliffDispatcher { contract_address: linear_address };
    let milestone_vesting = IMilestoneVestingDispatcher { contract_address: milestone_address };
    
    // Both contracts should be properly deployed and initialized
    assert(linear_vesting.get_total_vesting_schedules() == 0, 'Linear should start empty');
    assert(linear_address != milestone_address, 'Contracts should be different');
    
    // This tests that the vesting ecosystem can be deployed and initialized properly
} 