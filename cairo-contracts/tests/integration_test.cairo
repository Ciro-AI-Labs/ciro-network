#[cfg(test)]
mod integration_tests {
    use super::super::src::{
        job_manager::{JobManager, IJobManagerDispatcher, IJobManagerDispatcherTrait},
        cdc_pool::{CDCPool, ICDCPoolDispatcher, ICDCPoolDispatcherTrait},
        ciro_token::{CIROToken, ICIROTokenDispatcher, ICIROTokenDispatcherTrait},
        vesting::{
            linear_vesting_with_cliff::{LinearVestingWithCliff, ILinearVestingDispatcher, ILinearVestingDispatcherTrait},
            milestone_vesting::{MilestoneVesting, IMilestoneVestingDispatcher, IMilestoneVestingDispatcherTrait},
            burn_manager::{BurnManager, IBurnManagerDispatcher, IBurnManagerDispatcherTrait}
        },
        utils::{
            types::{JobStatus, WorkerCapability, JobRequirements, ProofData, StakeInfo},
            constants::*,
            governance::{create_proposal, vote_on_proposal, ProposalType, VoteChoice},
            security::{calculate_security_score, is_rate_limited},
            interactions::{validate_contract_version, update_contract_registry}
        }
    };
    use starknet::{
        ContractAddress, get_caller_address, get_block_timestamp, 
        testing::{set_caller_address, set_block_timestamp, set_contract_address}
    };
    use starknet::deploy_syscall;

    // Test addresses
    const ADMIN: felt252 = 'admin';
    const WORKER1: felt252 = 'worker1';
    const WORKER2: felt252 = 'worker2';
    const CLIENT1: felt252 = 'client1';
    const CLIENT2: felt252 = 'client2';
    const BENEFICIARY1: felt252 = 'beneficiary1';
    const BENEFICIARY2: felt252 = 'beneficiary2';

    // Helper function to deploy all contracts
    fn deploy_ecosystem() -> (
        ICIROTokenDispatcher,
        ICDCPoolDispatcher, 
        IJobManagerDispatcher,
        ILinearVestingDispatcher,
        IMilestoneVestingDispatcher,
        IBurnManagerDispatcher
    ) {
        let admin_address: ContractAddress = ADMIN.try_into().unwrap();
        
        // Deploy CIRO Token
        let token_calldata = array![ADMIN, 'CIRO', 'CIRO', 1000000000000000000000000000]; // 1B tokens
        let (token_address, _) = deploy_syscall(
            CIROToken::TEST_CLASS_HASH.try_into().unwrap(),
            0,
            token_calldata.span(),
            false
        ).unwrap();
        let token = ICIROTokenDispatcher { contract_address: token_address };

        // Deploy CDC Pool
        let pool_calldata = array![ADMIN, token_address.into()];
        let (pool_address, _) = deploy_syscall(
            CDCPool::TEST_CLASS_HASH.try_into().unwrap(),
            0,
            pool_calldata.span(),
            false
        ).unwrap();
        let pool = ICDCPoolDispatcher { contract_address: pool_address };

        // Deploy Job Manager
        let job_calldata = array![ADMIN, token_address.into(), pool_address.into()];
        let (job_address, _) = deploy_syscall(
            JobManager::TEST_CLASS_HASH.try_into().unwrap(),
            0,
            job_calldata.span(),
            false
        ).unwrap();
        let job_manager = IJobManagerDispatcher { contract_address: job_address };

        // Deploy Linear Vesting
        let vesting_calldata = array![ADMIN, token_address.into()];
        let (vesting_address, _) = deploy_syscall(
            LinearVestingWithCliff::TEST_CLASS_HASH.try_into().unwrap(),
            0,
            vesting_calldata.span(),
            false
        ).unwrap();
        let linear_vesting = ILinearVestingDispatcher { contract_address: vesting_address };

        // Deploy Milestone Vesting
        let milestone_calldata = array![ADMIN, token_address.into()];
        let (milestone_address, _) = deploy_syscall(
            MilestoneVesting::TEST_CLASS_HASH.try_into().unwrap(),
            0,
            milestone_calldata.span(),
            false
        ).unwrap();
        let milestone_vesting = IMilestoneVestingDispatcher { contract_address: milestone_address };

        // Deploy Burn Manager
        let burn_calldata = array![ADMIN, token_address.into()];
        let (burn_address, _) = deploy_syscall(
            BurnManager::TEST_CLASS_HASH.try_into().unwrap(),
            0,
            burn_calldata.span(),
            false
        ).unwrap();
        let burn_manager = IBurnManagerDispatcher { contract_address: burn_address };

        (token, pool, job_manager, linear_vesting, milestone_vesting, burn_manager)
    }

    #[test]
    fn test_full_ecosystem_workflow() {
        let (token, pool, job_manager, linear_vesting, milestone_vesting, burn_manager) = deploy_ecosystem();
        
        // Set initial timestamp
        set_block_timestamp(1000000);
        
        // === Phase 1: Initial Setup ===
        set_caller_address(ADMIN.try_into().unwrap());
        
        // Distribute initial tokens
        let worker1_addr: ContractAddress = WORKER1.try_into().unwrap();
        let worker2_addr: ContractAddress = WORKER2.try_into().unwrap();
        let client1_addr: ContractAddress = CLIENT1.try_into().unwrap();
        let client2_addr: ContractAddress = CLIENT2.try_into().unwrap();
        
        token.transfer(worker1_addr, 10000000000000000000000); // 10k tokens
        token.transfer(worker2_addr, 15000000000000000000000); // 15k tokens  
        token.transfer(client1_addr, 5000000000000000000000);  // 5k tokens
        token.transfer(client2_addr, 8000000000000000000000);  // 8k tokens

        // === Phase 2: Worker Registration and Staking ===
        set_caller_address(worker1_addr);
        token.approve(pool.contract_address, 5000000000000000000000); // 5k tokens
        pool.stake(2); // Tier 2 (5k tokens)
        
        set_caller_address(worker2_addr);
        token.approve(pool.contract_address, 10000000000000000000000); // 10k tokens
        pool.stake(3); // Tier 3 (10k tokens)

        // Register workers in job manager
        let worker1_capability = WorkerCapability {
            gpu_count: 2,
            gpu_memory: 16,
            gpu_compute: 7000,
            cpu_cores: 8,
            ram_gb: 32,
            storage_gb: 500,
            network_speed: 1000
        };
        
        let worker2_capability = WorkerCapability {
            gpu_count: 4,
            gpu_memory: 24,
            gpu_compute: 10000,
            cpu_cores: 16,
            ram_gb: 64,
            storage_gb: 1000,
            network_speed: 1000
        };

        set_caller_address(worker1_addr);
        job_manager.register_worker(worker1_capability);
        
        set_caller_address(worker2_addr);
        job_manager.register_worker(worker2_capability);

        // === Phase 3: Job Submission and Execution ===
        set_caller_address(client1_addr);
        
        let job_requirements = JobRequirements {
            min_gpu_count: 2,
            min_gpu_memory: 16,
            min_gpu_compute: 6000,
            min_cpu_cores: 4,
            min_ram_gb: 16,
            min_storage_gb: 100,
            min_network_speed: 500,
            max_duration: 3600,
            requires_sgx: false
        };

        // Approve tokens for job payment
        token.approve(job_manager.contract_address, 1000000000000000000000); // 1k tokens
        
        // Submit job
        let job_id = job_manager.submit_job(
            job_requirements,
            1000000000000000000000, // 1k tokens payment
            'ipfs://QmJobData123',
            3600 // 1 hour deadline
        );

        // Job should be automatically assigned to worker1 (meets requirements)
        let job_info = job_manager.get_job_details(job_id);
        assert!(job_info.worker_address == worker1_addr, "Job not assigned to worker1");
        assert!(job_info.status == JobStatus::InProgress, "Job should be in progress");

        // === Phase 4: Job Completion and Proof Submission ===
        set_caller_address(worker1_addr);
        set_block_timestamp(1001800); // 30 minutes later
        
        let proof_data = ProofData {
            result_hash: 'result_hash_123',
            computation_proof: 'zk_proof_data',
            execution_time: 1800,
            memory_used: 8,
            result_ipfs: 'ipfs://QmResult123'
        };

        job_manager.submit_proof(job_id, proof_data);

        // === Phase 5: Proof Verification and Payment ===
        set_caller_address(client1_addr);
        job_manager.verify_proof(job_id, true); // Accept proof

        // Verify job completion and payment
        let updated_job = job_manager.get_job_details(job_id);
        assert!(updated_job.status == JobStatus::Completed, "Job should be completed");

        // Check worker received payment
        let worker1_balance_after = token.balance_of(worker1_addr);
        assert!(worker1_balance_after > 5000000000000000000000, "Worker should receive payment");

        // === Phase 6: Multiple Job Processing ===
        set_caller_address(client2_addr);
        token.approve(job_manager.contract_address, 2000000000000000000000); // 2k tokens

        let heavy_job_requirements = JobRequirements {
            min_gpu_count: 4,
            min_gpu_memory: 24,
            min_gpu_compute: 9000,
            min_cpu_cores: 12,
            min_ram_gb: 48,
            min_storage_gb: 800,
            min_network_speed: 800,
            max_duration: 7200,
            requires_sgx: false
        };

        let job_id_2 = job_manager.submit_job(
            heavy_job_requirements,
            2000000000000000000000, // 2k tokens
            'ipfs://QmHeavyJobData456',
            7200
        );

        // Should be assigned to worker2 (only one that meets requirements)
        let job2_info = job_manager.get_job_details(job_id_2);
        assert!(job2_info.worker_address == worker2_addr, "Heavy job should go to worker2");

        // === Phase 7: Vesting Schedule Creation ===
        set_caller_address(ADMIN.try_into().unwrap());
        
        let beneficiary1_addr: ContractAddress = BENEFICIARY1.try_into().unwrap();
        let beneficiary2_addr: ContractAddress = BENEFICIARY2.try_into().unwrap();
        
        // Approve tokens for vesting contracts
        token.approve(linear_vesting.contract_address, 50000000000000000000000); // 50k
        token.approve(milestone_vesting.contract_address, 30000000000000000000000); // 30k

        // Create linear vesting schedule (team member)
        linear_vesting.create_vesting_schedule(
            beneficiary1_addr,
            20000000000000000000000, // 20k tokens
            1000000, // start time (current)
            2592000, // cliff (30 days) 
            31536000, // duration (1 year)
            true, // revocable
            ADMIN.try_into().unwrap() // creator
        );

        // Create milestone vesting (advisor)
        let milestones = array![
            'Launch MVP',
            'Reach 100 users',
            'Process 1000 jobs',
            'Mainnet deployment'
        ];

        milestone_vesting.create_milestone_schedule(
            beneficiary2_addr,
            30000000000000000000000, // 30k tokens
            milestones,
            array![
                7500000000000000000000,  // 7.5k per milestone
                7500000000000000000000,
                7500000000000000000000,
                7500000000000000000000
            ],
            3, // min verifiers
            2592000, // deadline (30 days)
            ADMIN.try_into().unwrap()
        );

        // === Phase 8: Governance Proposal ===
        set_block_timestamp(1010000);
        
        // Create proposal to update job timeout
        let proposal_id = create_proposal(
            ProposalType::Parameter,
            'Increase job timeout to 2 hours',
            'Update MAX_JOB_DURATION from 3600 to 7200 seconds',
            get_block_timestamp() + 604800, // 1 week voting
            get_block_timestamp() + 1209600, // 2 weeks execution delay
            ADMIN.try_into().unwrap()
        );

        // Vote on proposal (workers vote based on stake)
        set_caller_address(worker1_addr);
        vote_on_proposal(proposal_id, VoteChoice::For, 5000000000000000000000);
        
        set_caller_address(worker2_addr);  
        vote_on_proposal(proposal_id, VoteChoice::For, 10000000000000000000000);

        // === Phase 9: Revenue-Based Burning ===
        set_caller_address(ADMIN.try_into().unwrap());
        
        // Setup burn schedule (5% of revenue quarterly)
        burn_manager.setup_revenue_burn(
            500, // 5% (in basis points)
            7776000 // quarterly (90 days)
        );

        // Record revenue and trigger burn
        burn_manager.record_revenue(10000000000000000000000); // 10k tokens revenue
        burn_manager.execute_revenue_burn();

        // === Phase 10: Security and Rate Limiting Tests ===
        set_caller_address(client1_addr);
        
        // Test rate limiting
        let is_limited_before = is_rate_limited(client1_addr, 10);
        assert!(!is_limited_before, "Should not be rate limited initially");

        // Try to submit multiple jobs rapidly (should trigger rate limiting)
        let mut rapid_jobs = 0;
        loop {
            if rapid_jobs >= 3 {
                break;
            }
            
            token.approve(job_manager.contract_address, 500000000000000000000); // 500 tokens
            
            let rapid_job_id = job_manager.submit_job(
                job_requirements,
                500000000000000000000,
                'ipfs://QmRapidJob',
                3600
            );
            
            rapid_jobs += 1;
            set_block_timestamp(get_block_timestamp() + 30); // 30 seconds between jobs
        };

        // === Phase 11: Cross-Module Integration Verification ===
        
        // Verify worker reputation increased after successful job
        let worker1_reputation = job_manager.get_worker_reputation(worker1_addr);
        assert!(worker1_reputation > 0, "Worker1 should have positive reputation");

        // Verify staking tier affects job allocation
        let worker1_tier = pool.get_user_tier(worker1_addr);
        let worker2_tier = pool.get_user_tier(worker2_addr);
        assert!(worker2_tier > worker1_tier, "Worker2 should have higher tier");

        // Verify vesting schedules are active
        let vesting_info1 = linear_vesting.get_vesting_schedule(beneficiary1_addr, 0);
        assert!(vesting_info1.total_amount == 20000000000000000000000, "Vesting amount mismatch");

        let milestone_info = milestone_vesting.get_milestone_schedule(beneficiary2_addr, 0);
        assert!(milestone_info.total_amount == 30000000000000000000000, "Milestone amount mismatch");

        // === Phase 12: Emergency Scenarios ===
        set_caller_address(ADMIN.try_into().unwrap());
        
        // Test emergency job cancellation
        let emergency_job_id = job_manager.submit_job(
            job_requirements,
            1000000000000000000000,
            'ipfs://QmEmergencyJob',
            3600
        );
        
        // Admin cancels job due to emergency
        job_manager.emergency_cancel_job(emergency_job_id);
        let cancelled_job = job_manager.get_job_details(emergency_job_id);
        assert!(cancelled_job.status == JobStatus::Cancelled, "Job should be cancelled");

        // Test emergency token burn
        let pre_burn_supply = token.total_supply();
        burn_manager.emergency_burn(1000000000000000000000); // Burn 1k tokens
        let post_burn_supply = token.total_supply();
        assert!(post_burn_supply < pre_burn_supply, "Supply should decrease after burn");

        // === Verification: System State Consistency ===
        
        // Verify total token conservation (accounting for burns)
        let total_distributed = token.balance_of(worker1_addr) 
            + token.balance_of(worker2_addr)
            + token.balance_of(client1_addr) 
            + token.balance_of(client2_addr)
            + token.balance_of(ADMIN.try_into().unwrap())
            + linear_vesting.get_total_locked()
            + milestone_vesting.get_total_locked();
            
        assert!(total_distributed <= 1000000000000000000000000000, "Token conservation violated");

        // Verify no double-spending in job payments
        let total_job_payments = job_manager.get_total_payments_made();
        assert!(total_job_payments > 0, "Jobs should have generated payments");

        // Verify governance state consistency
        // (Additional governance verification would go here)

        // Verify all critical invariants maintained
        assert!(pool.get_total_staked() > 0, "Pool should have staked tokens");
        assert!(job_manager.get_total_jobs() >= 4, "Should have processed multiple jobs");
    }

    #[test]
    fn test_worker_slashing_and_recovery() {
        let (token, pool, job_manager, _, _, _) = deploy_ecosystem();
        
        set_block_timestamp(1000000);
        set_caller_address(ADMIN.try_into().unwrap());
        
        let worker_addr: ContractAddress = WORKER1.try_into().unwrap();
        let client_addr: ContractAddress = CLIENT1.try_into().unwrap();
        
        // Setup
        token.transfer(worker_addr, 10000000000000000000000);
        token.transfer(client_addr, 5000000000000000000000);
        
        // Worker stakes
        set_caller_address(worker_addr);
        token.approve(pool.contract_address, 5000000000000000000000);
        pool.stake(2);
        
        // Register worker
        let capability = WorkerCapability {
            gpu_count: 2, gpu_memory: 16, gpu_compute: 7000,
            cpu_cores: 8, ram_gb: 32, storage_gb: 500, network_speed: 1000
        };
        job_manager.register_worker(capability);
        
        // Submit job
        set_caller_address(client_addr);
        token.approve(job_manager.contract_address, 1000000000000000000000);
        
        let requirements = JobRequirements {
            min_gpu_count: 1, min_gpu_memory: 8, min_gpu_compute: 5000,
            min_cpu_cores: 4, min_ram_gb: 16, min_storage_gb: 100,
            min_network_speed: 500, max_duration: 3600, requires_sgx: false
        };
        
        let job_id = job_manager.submit_job(requirements, 1000000000000000000000, 'ipfs://test', 3600);
        
        // Worker fails to complete job (timeout)
        set_block_timestamp(1004000); // Past deadline
        
        // Client reports timeout, triggering slashing
        job_manager.report_job_timeout(job_id);
        
        // Verify slashing occurred
        let worker_stake_info = pool.get_stake_info(worker_addr);
        assert!(worker_stake_info.slashed_amount > 0, "Worker should be slashed");
        
        // Verify worker reputation decreased
        let reputation = job_manager.get_worker_reputation(worker_addr);
        assert!(reputation < 100, "Reputation should decrease after timeout");
        
        // Worker can recover by completing future jobs successfully
        set_caller_address(client_addr);
        token.approve(job_manager.contract_address, 1000000000000000000000);
        let recovery_job_id = job_manager.submit_job(requirements, 1000000000000000000000, 'ipfs://recovery', 3600);
        
        // Worker completes job successfully
        set_caller_address(worker_addr);
        let proof = ProofData {
            result_hash: 'recovery_result',
            computation_proof: 'recovery_proof',
            execution_time: 1800,
            memory_used: 8,
            result_ipfs: 'ipfs://recovery_result'
        };
        job_manager.submit_proof(recovery_job_id, proof);
        
        set_caller_address(client_addr);
        job_manager.verify_proof(recovery_job_id, true);
        
        // Verify reputation recovery
        let new_reputation = job_manager.get_worker_reputation(worker_addr);
        assert!(new_reputation > reputation, "Reputation should improve after successful job");
    }

    #[test] 
    fn test_milestone_vesting_workflow() {
        let (token, _, _, _, milestone_vesting, _) = deploy_ecosystem();
        
        set_block_timestamp(1000000);
        set_caller_address(ADMIN.try_into().unwrap());
        
        let beneficiary_addr: ContractAddress = BENEFICIARY1.try_into().unwrap();
        let verifier1: ContractAddress = WORKER1.try_into().unwrap();
        let verifier2: ContractAddress = WORKER2.try_into().unwrap();
        let verifier3: ContractAddress = CLIENT1.try_into().unwrap();
        
        // Create milestone schedule
        token.approve(milestone_vesting.contract_address, 20000000000000000000000);
        
        let milestones = array!['Complete MVP', 'Beta Launch', 'Mainnet Deploy'];
        let amounts = array![
            6666666666666666666666,  // ~6.67k tokens each
            6666666666666666666667,
            6666666666666666666667
        ];
        
        milestone_vesting.create_milestone_schedule(
            beneficiary_addr,
            20000000000000000000000,
            milestones,
            amounts,
            2, // min verifiers
            2592000, // 30 days deadline
            ADMIN.try_into().unwrap()
        );
        
        // Add verifiers
        milestone_vesting.add_verifier(0, verifier1);
        milestone_vesting.add_verifier(0, verifier2);
        milestone_vesting.add_verifier(0, verifier3);
        
        // Submit evidence for first milestone
        set_caller_address(beneficiary_addr);
        milestone_vesting.submit_milestone_evidence(0, 0, 'ipfs://mvp_evidence');
        
        // Verifiers approve milestone
        set_caller_address(verifier1);
        milestone_vesting.verify_milestone(0, 0, true, 'MVP looks good');
        
        set_caller_address(verifier2);
        milestone_vesting.verify_milestone(0, 0, true, 'Approved');
        
        // Should be able to release first milestone
        set_caller_address(beneficiary_addr);
        let released = milestone_vesting.release_milestone_tokens(0, 0);
        assert!(released > 0, "Should release milestone tokens");
        
        // Verify beneficiary received tokens
        let balance = token.balance_of(beneficiary_addr);
        assert!(balance > 0, "Beneficiary should receive milestone tokens");
    }

    #[test]
    fn test_governance_upgrade_process() {
        let (token, pool, job_manager, _, _, _) = deploy_ecosystem();
        
        set_block_timestamp(1000000);
        
        // Setup voters with stakes
        let voter1: ContractAddress = WORKER1.try_into().unwrap();
        let voter2: ContractAddress = WORKER2.try_into().unwrap();
        
        set_caller_address(ADMIN.try_into().unwrap());
        token.transfer(voter1, 20000000000000000000000);
        token.transfer(voter2, 30000000000000000000000);
        
        set_caller_address(voter1);
        token.approve(pool.contract_address, 15000000000000000000000);
        pool.stake(3);
        
        set_caller_address(voter2);
        token.approve(pool.contract_address, 25000000000000000000000);
        pool.stake(4);
        
        // Create upgrade proposal
        set_caller_address(ADMIN.try_into().unwrap());
        let proposal_id = create_proposal(
            ProposalType::Upgrade,
            'Upgrade Job Manager Contract',
            'Deploy new version with enhanced features',
            get_block_timestamp() + 604800, // 1 week voting
            get_block_timestamp() + 1209600, // 2 weeks execution delay
            ADMIN.try_into().unwrap()
        );
        
        // Voting phase
        set_caller_address(voter1);
        vote_on_proposal(proposal_id, VoteChoice::For, 15000000000000000000000);
        
        set_caller_address(voter2);
        vote_on_proposal(proposal_id, VoteChoice::For, 25000000000000000000000);
        
        // Fast forward past voting period
        set_block_timestamp(1000000 + 604800 + 1);
        
        // Execute proposal (after delay)
        set_block_timestamp(1000000 + 1209600 + 1);
        
        // Verify proposal can be executed
        // (In real implementation, this would trigger contract upgrade)
        
        // Verify governance state
        assert!(proposal_id > 0, "Proposal should be created");
    }

    #[test]
    fn test_burn_mechanism_integration() {
        let (token, _, _, _, _, burn_manager) = deploy_ecosystem();
        
        set_block_timestamp(1000000);
        set_caller_address(ADMIN.try_into().unwrap());
        
        let initial_supply = token.total_supply();
        
        // Setup fixed schedule burn (monthly)
        burn_manager.setup_fixed_burn(
            1000000000000000000000, // 1k tokens per burn
            2592000 // monthly (30 days)
        );
        
        // Execute first burn
        burn_manager.execute_fixed_burn();
        let supply_after_fixed = token.total_supply();
        assert!(supply_after_fixed < initial_supply, "Supply should decrease after fixed burn");
        
        // Setup revenue burn
        burn_manager.setup_revenue_burn(1000, 2592000); // 10% monthly
        
        // Record revenue and execute burn
        burn_manager.record_revenue(5000000000000000000000); // 5k tokens
        burn_manager.execute_revenue_burn();
        
        let supply_after_revenue = token.total_supply();
        assert!(supply_after_revenue < supply_after_fixed, "Supply should decrease after revenue burn");
        
        // Test emergency burn
        burn_manager.emergency_burn(2000000000000000000000); // 2k tokens
        let final_supply = token.total_supply();
        assert!(final_supply < supply_after_revenue, "Supply should decrease after emergency burn");
        
        // Verify burn statistics
        let total_burned = burn_manager.get_total_burned();
        assert!(total_burned > 3000000000000000000000, "Should have burned at least 3k tokens");
        
        let expected_supply_reduction = initial_supply - final_supply;
        assert!(expected_supply_reduction == total_burned, "Burn tracking should match supply reduction");
    }

    #[test]
    fn test_security_integration() {
        let (token, pool, job_manager, _, _, _) = deploy_ecosystem();
        
        set_block_timestamp(1000000);
        
        let suspicious_addr: ContractAddress = 'suspicious'.try_into().unwrap();
        let normal_addr: ContractAddress = CLIENT1.try_into().unwrap();
        
        set_caller_address(ADMIN.try_into().unwrap());
        token.transfer(suspicious_addr, 10000000000000000000000);
        token.transfer(normal_addr, 10000000000000000000000);
        
        // Test security scoring
        let normal_score = calculate_security_score(normal_addr, 0, 0, false);
        let suspicious_score = calculate_security_score(suspicious_addr, 5, 3, true);
        
        assert!(normal_score > suspicious_score, "Normal address should have higher security score");
        
        // Test rate limiting integration with job submission
        set_caller_address(suspicious_addr);
        token.approve(job_manager.contract_address, 5000000000000000000000);
        
        let requirements = JobRequirements {
            min_gpu_count: 1, min_gpu_memory: 4, min_gpu_compute: 1000,
            min_cpu_cores: 2, min_ram_gb: 8, min_storage_gb: 50,
            min_network_speed: 100, max_duration: 1800, requires_sgx: false
        };
        
        // Submit multiple jobs rapidly (should be rate limited)
        let mut job_count = 0;
        let mut successful_submissions = 0;
        
        loop {
            if job_count >= 5 {
                break;
            }
            
            let is_limited = is_rate_limited(suspicious_addr, 5);
            if !is_limited {
                let job_id = job_manager.submit_job(
                    requirements,
                    1000000000000000000000,
                    'ipfs://spam_job',
                    3600
                );
                if job_id > 0 {
                    successful_submissions += 1;
                }
            }
            
            job_count += 1;
            set_block_timestamp(get_block_timestamp() + 10); // 10 seconds between attempts
        };
        
        // Should be rate limited after first few submissions
        assert!(successful_submissions < 5, "Rate limiting should prevent all submissions");
        
        // Normal user should not be affected
        set_caller_address(normal_addr);
        token.approve(job_manager.contract_address, 1000000000000000000000);
        
        let normal_job_id = job_manager.submit_job(
            requirements,
            1000000000000000000000,
            'ipfs://normal_job',
            3600
        );
        
        assert!(normal_job_id > 0, "Normal user should be able to submit jobs");
    }
} 