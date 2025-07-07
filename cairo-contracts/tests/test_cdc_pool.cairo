//! CIRO Network CDC Pool Smart Contract Test Suite
//! 
//! Comprehensive testing for worker management, staking, job allocation,
//! reward distribution, and integration with CIRO Token and JobMgr contracts.

use snforge_std::{
    declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address,
    stop_cheat_caller_address, start_cheat_block_timestamp, get_contract_address,
    spy_events, EventSpy, EventSpyTrait, EventSpyAssertionsTrait, test_address
};

use starknet::{ContractAddress, contract_address_const, get_block_timestamp};
use ciro_contracts::interfaces::cdc_pool::{
    ICDCPoolDispatcher, ICDCPoolDispatcherTrait, WorkerId, WorkerStatus, 
    WorkerTier, WorkerCapabilities, WorkerProfile, JobRequirements,
    StakeInfo, PerformanceMetrics, SlashReason, SlashRecord
};

use ciro_contracts::interfaces::ciro_token::{ICIROTokenDispatcher, ICIROTokenDispatcherTrait};
use ciro_contracts::interfaces::job_manager::{IJobManagerDispatcher, IJobManagerDispatcherTrait};

// Test constants
const ADMIN: felt252 = 'admin';
const WORKER1: felt252 = 'worker1';
const WORKER2: felt252 = 'worker2';
const COORDINATOR: felt252 = 'coordinator';
const INITIAL_SUPPLY: u256 = 1000000000; // 1B tokens
const CIRO_PRICE: u256 = 1000000; // $1.00 in 6 decimals

#[derive(Drop)]
struct TestSetup {
    cdc_pool: ICDCPoolDispatcher,
    ciro_token: ICIROTokenDispatcher,
    job_manager: IJobManagerDispatcher,
    admin: ContractAddress,
    worker1: ContractAddress,
    worker2: ContractAddress,
    coordinator: ContractAddress,
}

fn setup() -> TestSetup {
    // Deploy CIRO Token
    let ciro_token_class = declare("CIROToken").unwrap().contract_class();
    let admin_addr = contract_address_const::<'admin'>();
    let ciro_token = ICIROTokenDispatcher { 
        contract_address: ciro_token_class.deploy(@array![admin_addr.into()]).unwrap()
    };

    // Deploy Job Manager
    let job_mgr_class = declare("JobManager").unwrap().contract_class();
    let job_manager = IJobManagerDispatcher {
        contract_address: job_mgr_class.deploy(@array![
            admin_addr.into(),
            ciro_token.contract_address.into()
        ]).unwrap()
    };

    // Deploy CDC Pool
    let cdc_pool_class = declare("CDCPool").unwrap().contract_class();
    let cdc_pool = ICDCPoolDispatcher {
        contract_address: cdc_pool_class.deploy(@array![
            admin_addr.into(),
            ciro_token.contract_address.into(),
            job_manager.contract_address.into()
        ]).unwrap()
    };

    TestSetup {
        cdc_pool,
        ciro_token,
        job_manager,
        admin: admin_addr,
        worker1: contract_address_const::<'worker1'>(),
        worker2: contract_address_const::<'worker2'>(),
        coordinator: contract_address_const::<'coordinator'>(),
    }
}

#[test]
fn test_worker_registration() {
    let setup = setup();
    
    start_cheat_caller_address(setup.cdc_pool.contract_address, setup.worker1);
    
    let capabilities = WorkerCapabilities {
        gpu_memory_gb: 24,
        cpu_cores: 32,
        ram_gb: 128,
        storage_gb: 2000,
        network_bandwidth_mbps: 1000,
        cuda_support: true,
        opengl_support: true,
        fp16_support: true,
        int8_support: true,
        nvlink_support: false,
        infiniband_support: false,
        tensor_cores: true,
        multi_gpu: false,
        gpu_model: 'RTX4090',
        cpu_model: 'Intel-Xeon'
    };
    
    let proof_of_resources = array!['proof1', 'proof2'].span();
    
    setup.cdc_pool.register_worker(capabilities, proof_of_resources);
    
    let profile = setup.cdc_pool.get_worker_profile(setup.worker1);
    assert(profile.status == WorkerStatus::Active, 'Worker should be active');
    assert(profile.capabilities.gpu_memory_gb == 24, 'GPU memory mismatch');
    assert(profile.capabilities.cuda_support == true, 'CUDA support mismatch');
    
    stop_cheat_caller_address(setup.cdc_pool.contract_address);
}

#[test]
fn test_ciro_token_staking() {
    let setup = setup();
    let stake_amount = 1000 * 1000000; // 1000 CIRO tokens
    
    // Setup CIRO tokens for worker
    start_cheat_caller_address(setup.ciro_token.contract_address, setup.admin);
    setup.ciro_token.transfer(setup.worker1, stake_amount);
    stop_cheat_caller_address(setup.ciro_token.contract_address);
    
    // Register worker first
    start_cheat_caller_address(setup.cdc_pool.contract_address, setup.worker1);
    let capabilities = WorkerCapabilities {
        gpu_memory_gb: 24, cpu_cores: 32, ram_gb: 128, storage_gb: 2000,
        network_bandwidth_mbps: 1000, cuda_support: true, opengl_support: true,
        fp16_support: true, int8_support: true, nvlink_support: false,
        infiniband_support: false, tensor_cores: true, multi_gpu: false,
        gpu_model: 'RTX4090', cpu_model: 'Intel-Xeon'
    };
    setup.cdc_pool.register_worker(capabilities, array!['proof'].span());
    
    // Approve CIRO token spending
    start_cheat_caller_address(setup.ciro_token.contract_address, setup.worker1);
    setup.ciro_token.approve(setup.cdc_pool.contract_address, stake_amount);
    stop_cheat_caller_address(setup.ciro_token.contract_address);
    
    // Stake tokens
    setup.cdc_pool.stake(stake_amount, 0);
    
    let stake_info = setup.cdc_pool.get_stake_info(setup.worker1);
    assert(stake_info.amount == stake_amount, 'Stake amount mismatch');
    
    let usd_value = setup.cdc_pool.get_stake_usd_value(setup.worker1);
    assert(usd_value > 0, 'USD value should be positive');
    
    stop_cheat_caller_address(setup.cdc_pool.contract_address);
}

#[test]
fn test_worker_tier_calculation() {
    let setup = setup();
    let stake_amount = 10000 * 1000000; // 10K CIRO ($10K USD)
    
    // Setup worker with stake
    start_cheat_caller_address(setup.ciro_token.contract_address, setup.admin);
    setup.ciro_token.transfer(setup.worker1, stake_amount);
    stop_cheat_caller_address(setup.ciro_token.contract_address);
    
    start_cheat_caller_address(setup.cdc_pool.contract_address, setup.worker1);
    let capabilities = WorkerCapabilities {
        gpu_memory_gb: 24, cpu_cores: 32, ram_gb: 128, storage_gb: 2000,
        network_bandwidth_mbps: 1000, cuda_support: true, opengl_support: true,
        fp16_support: true, int8_support: true, nvlink_support: false,
        infiniband_support: false, tensor_cores: true, multi_gpu: false,
        gpu_model: 'RTX4090', cpu_model: 'Intel-Xeon'
    };
    setup.cdc_pool.register_worker(capabilities, array!['proof'].span());
    
    start_cheat_caller_address(setup.ciro_token.contract_address, setup.worker1);
    setup.ciro_token.approve(setup.cdc_pool.contract_address, stake_amount);
    stop_cheat_caller_address(setup.ciro_token.contract_address);
    
    setup.cdc_pool.stake(stake_amount, 0);
    
    let tier = setup.cdc_pool.get_worker_tier(setup.worker1);
    // With $10K stake, should be Enterprise tier (>$5K requirement)
    assert(tier == WorkerTier::Enterprise, 'Should be Enterprise tier');
    
    stop_cheat_caller_address(setup.cdc_pool.contract_address);
}

#[test]
fn test_job_allocation_scoring() {
    let setup = setup();
    
    // Setup worker
    start_cheat_caller_address(setup.cdc_pool.contract_address, setup.worker1);
    let capabilities = WorkerCapabilities {
        gpu_memory_gb: 24, cpu_cores: 32, ram_gb: 128, storage_gb: 2000,
        network_bandwidth_mbps: 1000, cuda_support: true, opengl_support: true,
        fp16_support: true, int8_support: true, nvlink_support: false,
        infiniband_support: false, tensor_cores: true, multi_gpu: false,
        gpu_model: 'RTX4090', cpu_model: 'Intel-Xeon'
    };
    setup.cdc_pool.register_worker(capabilities, array!['proof'].span());
    
    // Test job requirements
    let requirements = JobRequirements {
        min_gpu_memory_gb: 16,
        min_cpu_cores: 16,
        min_ram_gb: 64,
        requires_cuda: true,
        requires_opengl: false,
        requires_fp16: true,
        requires_int8: false,
        requires_nvlink: false,
        requires_infiniband: false,
        requires_tensor_cores: true,
        requires_multi_gpu: false,
        min_network_bandwidth_mbps: 500,
        estimated_duration_minutes: 30
    };
    
    let score = setup.cdc_pool.get_tier_allocation_score(setup.worker1, requirements);
    assert(score > 50, 'Score should be high for matching capabilities');
    
    stop_cheat_caller_address(setup.cdc_pool.contract_address);
}

#[test]
fn test_reward_distribution() {
    let setup = setup();
    let stake_amount = 1000 * 1000000;
    let reward_amount = 100 * 1000000; // 100 CIRO
    
    // Setup worker and coordinator
    start_cheat_caller_address(setup.cdc_pool.contract_address, setup.admin);
    setup.cdc_pool.grant_role(setup.cdc_pool.COORDINATOR_ROLE(), setup.coordinator);
    stop_cheat_caller_address(setup.cdc_pool.contract_address);
    
    // Register and stake
    start_cheat_caller_address(setup.ciro_token.contract_address, setup.admin);
    setup.ciro_token.transfer(setup.worker1, stake_amount);
    setup.ciro_token.transfer(setup.cdc_pool.contract_address, reward_amount);
    stop_cheat_caller_address(setup.ciro_token.contract_address);
    
    start_cheat_caller_address(setup.cdc_pool.contract_address, setup.worker1);
    let capabilities = WorkerCapabilities {
        gpu_memory_gb: 24, cpu_cores: 32, ram_gb: 128, storage_gb: 2000,
        network_bandwidth_mbps: 1000, cuda_support: true, opengl_support: true,
        fp16_support: true, int8_support: true, nvlink_support: false,
        infiniband_support: false, tensor_cores: true, multi_gpu: false,
        gpu_model: 'RTX4090', cpu_model: 'Intel-Xeon'
    };
    setup.cdc_pool.register_worker(capabilities, array!['proof'].span());
    
    start_cheat_caller_address(setup.ciro_token.contract_address, setup.worker1);
    setup.ciro_token.approve(setup.cdc_pool.contract_address, stake_amount);
    stop_cheat_caller_address(setup.ciro_token.contract_address);
    
    setup.cdc_pool.stake(stake_amount, 0);
    stop_cheat_caller_address(setup.cdc_pool.contract_address);
    
    let initial_balance = setup.ciro_token.balance_of(setup.worker1);
    
    // Distribute reward
    start_cheat_caller_address(setup.cdc_pool.contract_address, setup.coordinator);
    setup.cdc_pool.distribute_reward(1, reward_amount, 0);
    stop_cheat_caller_address(setup.cdc_pool.contract_address);
    
    let final_balance = setup.ciro_token.balance_of(setup.worker1);
    assert(final_balance > initial_balance, 'Worker should receive reward');
}

#[test]
fn test_reputation_updates() {
    let setup = setup();
    
    // Setup coordinator
    start_cheat_caller_address(setup.cdc_pool.contract_address, setup.admin);
    setup.cdc_pool.grant_role(setup.cdc_pool.COORDINATOR_ROLE(), setup.coordinator);
    stop_cheat_caller_address(setup.cdc_pool.contract_address);
    
    // Register worker
    start_cheat_caller_address(setup.cdc_pool.contract_address, setup.worker1);
    let capabilities = WorkerCapabilities {
        gpu_memory_gb: 24, cpu_cores: 32, ram_gb: 128, storage_gb: 2000,
        network_bandwidth_mbps: 1000, cuda_support: true, opengl_support: true,
        fp16_support: true, int8_support: true, nvlink_support: false,
        infiniband_support: false, tensor_cores: true, multi_gpu: false,
        gpu_model: 'RTX4090', cpu_model: 'Intel-Xeon'
    };
    setup.cdc_pool.register_worker(capabilities, array!['proof'].span());
    stop_cheat_caller_address(setup.cdc_pool.contract_address);
    
    // Update reputation
    start_cheat_caller_address(setup.cdc_pool.contract_address, setup.coordinator);
    setup.cdc_pool.update_reputation(1, 12345, 90, 120, 95);
    stop_cheat_caller_address(setup.cdc_pool.contract_address);
    
    let profile = setup.cdc_pool.get_worker_profile(setup.worker1);
    assert(profile.performance_metrics.reputation_score > 0, 'Reputation should be updated');
}

#[test]
fn test_slashing_mechanism() {
    let setup = setup();
    let stake_amount = 1000 * 1000000;
    
    // Setup slasher
    start_cheat_caller_address(setup.cdc_pool.contract_address, setup.admin);
    setup.cdc_pool.grant_role(setup.cdc_pool.SLASHER_ROLE(), setup.coordinator);
    stop_cheat_caller_address(setup.cdc_pool.contract_address);
    
    // Register and stake worker
    start_cheat_caller_address(setup.ciro_token.contract_address, setup.admin);
    setup.ciro_token.transfer(setup.worker1, stake_amount);
    stop_cheat_caller_address(setup.ciro_token.contract_address);
    
    start_cheat_caller_address(setup.cdc_pool.contract_address, setup.worker1);
    let capabilities = WorkerCapabilities {
        gpu_memory_gb: 24, cpu_cores: 32, ram_gb: 128, storage_gb: 2000,
        network_bandwidth_mbps: 1000, cuda_support: true, opengl_support: true,
        fp16_support: true, int8_support: true, nvlink_support: false,
        infiniband_support: false, tensor_cores: true, multi_gpu: false,
        gpu_model: 'RTX4090', cpu_model: 'Intel-Xeon'
    };
    setup.cdc_pool.register_worker(capabilities, array!['proof'].span());
    
    start_cheat_caller_address(setup.ciro_token.contract_address, setup.worker1);
    setup.ciro_token.approve(setup.cdc_pool.contract_address, stake_amount);
    stop_cheat_caller_address(setup.ciro_token.contract_address);
    
    setup.cdc_pool.stake(stake_amount, 0);
    stop_cheat_caller_address(setup.cdc_pool.contract_address);
    
    let initial_stake = setup.cdc_pool.get_stake_info(setup.worker1).amount;
    
    // Slash worker
    start_cheat_caller_address(setup.cdc_pool.contract_address, setup.coordinator);
    setup.cdc_pool.slash_worker(1, SlashReason::JOB_ABANDONMENT, 'evidence_hash');
    stop_cheat_caller_address(setup.cdc_pool.contract_address);
    
    let final_stake = setup.cdc_pool.get_stake_info(setup.worker1).amount;
    assert(final_stake < initial_stake, 'Stake should be reduced after slashing');
}

#[test]
fn test_unstaking_process() {
    let setup = setup();
    let stake_amount = 1000 * 1000000;
    
    // Setup and stake
    start_cheat_caller_address(setup.ciro_token.contract_address, setup.admin);
    setup.ciro_token.transfer(setup.worker1, stake_amount);
    stop_cheat_caller_address(setup.ciro_token.contract_address);
    
    start_cheat_caller_address(setup.cdc_pool.contract_address, setup.worker1);
    let capabilities = WorkerCapabilities {
        gpu_memory_gb: 24, cpu_cores: 32, ram_gb: 128, storage_gb: 2000,
        network_bandwidth_mbps: 1000, cuda_support: true, opengl_support: true,
        fp16_support: true, int8_support: true, nvlink_support: false,
        infiniband_support: false, tensor_cores: true, multi_gpu: false,
        gpu_model: 'RTX4090', cpu_model: 'Intel-Xeon'
    };
    setup.cdc_pool.register_worker(capabilities, array!['proof'].span());
    
    start_cheat_caller_address(setup.ciro_token.contract_address, setup.worker1);
    setup.ciro_token.approve(setup.cdc_pool.contract_address, stake_amount);
    stop_cheat_caller_address(setup.ciro_token.contract_address);
    
    setup.cdc_pool.stake(stake_amount, 0);
    
    // Request unstaking
    let unstake_amount = 500 * 1000000;
    setup.cdc_pool.request_unstake(unstake_amount);
    
    // Fast forward time past delay period
    start_cheat_block_timestamp(setup.cdc_pool.contract_address, get_block_timestamp() + 7 * 24 * 60 * 60 + 1);
    
    let initial_balance = setup.ciro_token.balance_of(setup.worker1);
    setup.cdc_pool.complete_unstake();
    let final_balance = setup.ciro_token.balance_of(setup.worker1);
    
    assert(final_balance > initial_balance, 'Should receive unstaked tokens');
    
    stop_cheat_caller_address(setup.cdc_pool.contract_address);
}

#[test]
fn test_integration_with_jobmgr() {
    let setup = setup();
    
    // Register worker in CDC Pool
    start_cheat_caller_address(setup.cdc_pool.contract_address, setup.worker1);
    let capabilities = WorkerCapabilities {
        gpu_memory_gb: 24, cpu_cores: 32, ram_gb: 128, storage_gb: 2000,
        network_bandwidth_mbps: 1000, cuda_support: true, opengl_support: true,
        fp16_support: true, int8_support: true, nvlink_support: false,
        infiniband_support: false, tensor_cores: true, multi_gpu: false,
        gpu_model: 'RTX4090', cpu_model: 'Intel-Xeon'
    };
    setup.cdc_pool.register_worker(capabilities, array!['proof'].span());
    stop_cheat_caller_address(setup.cdc_pool.contract_address);
    
    // Test JobMgr can query worker tier
    let tier = setup.cdc_pool.get_worker_tier(setup.worker1);
    assert(tier == WorkerTier::Basic, 'Should start as Basic tier');
    
    // Test tier benefits query
    let benefits = setup.cdc_pool.get_worker_tier_benefits(WorkerTier::Enterprise);
    assert(benefits.bonus_percentage > 0, 'Enterprise tier should have bonuses');
} 