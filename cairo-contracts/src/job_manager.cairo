// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2025 CIRO Network Foundation
//
// This file is part of CIRO Network.
//
// Licensed under the Business Source License 1.1 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at:
//     https://github.com/Ciro-AI-Labs/ciro-network/blob/main/LICENSE-BSL
//
// Change Date: January 1, 2029
// Change License: Apache License, Version 2.0
//
// For more information see: https://github.com/Ciro-AI-Labs/ciro-network/blob/main/WHY_BSL_FOR_CIRO.md

//! CIRO Network JobManager Contract
//! 
//! Main contract for managing job submissions, assignments, execution, and payments
//! in the CIRO Distributed Compute Layer. This contract coordinates with CDC Pool
//! and Payment systems to provide the core job orchestration functionality.

// Core Starknet imports
use starknet::{ContractAddress, get_caller_address, get_block_timestamp};

// Storage trait imports - CRITICAL for Map operations
use starknet::storage::{
    StoragePointerReadAccess, StoragePointerWriteAccess, 
    StorageMapReadAccess, StorageMapWriteAccess, Map
};

// Interface imports
use ciro_contracts::interfaces::job_manager::{
    IJobManager, JobId, ModelId, WorkerId, JobType, JobSpec, JobResult, 
    VerificationMethod, ModelRequirements, JobState, JobDetails, WorkerStats,
    ProveJobData
};

// Token interface
use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};

#[starknet::contract]
mod JobManager {
    use super::{
        IJobManager, JobId, ModelId, WorkerId, JobType, JobSpec, JobResult, 
        VerificationMethod, ModelRequirements, JobState, JobDetails, WorkerStats,
        ProveJobData, ContractAddress, get_caller_address, get_block_timestamp,
        StoragePointerReadAccess, StoragePointerWriteAccess, 
        StorageMapReadAccess, StorageMapWriteAccess, Map,
        IERC20Dispatcher, IERC20DispatcherTrait
    };

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        // Custom contract events
        JobSubmitted: JobSubmitted,
        JobAssigned: JobAssigned,
        JobCompleted: JobCompleted,
        PaymentReleased: PaymentReleased,
        ModelRegistered: ModelRegistered
    }

    #[derive(Drop, starknet::Event)]
    struct JobSubmitted {
        #[key]
        job_id: u256,
        #[key]
        client: ContractAddress,
        payment: u256
    }

    #[derive(Drop, starknet::Event)]
    struct JobAssigned {
        #[key]
        job_id: u256,
        #[key]
        worker: ContractAddress
    }

    #[derive(Drop, starknet::Event)]
    struct JobCompleted {
        #[key]
        job_id: u256,
        #[key]
        worker: ContractAddress
    }

    #[derive(Drop, starknet::Event)]
    struct PaymentReleased {
        #[key]
        job_id: u256,
        #[key]
        worker: ContractAddress,
        amount: u256
    }

    #[derive(Drop, starknet::Event)]
    struct ModelRegistered {
        #[key]
        model_id: u256,
        #[key]
        owner: ContractAddress
    }

    #[storage]
    struct Storage {
        // Configuration parameters
        payment_token: ContractAddress,
        treasury: ContractAddress,
        cdc_pool_contract: ContractAddress,
        platform_fee_bps: u16,
        min_job_payment: u256,
        max_job_duration: u64,
        dispute_fee: u256,
        min_allocation_score: u256,
        
        // Counters and state
        next_job_id: u256,
        next_model_id: u256,
        total_jobs: u64,
        active_jobs: u64,
        
        // Core job data - store JobSpec fields separately since JobSpec contains Arrays
        job_types: Map<felt252, JobType>,
        job_model_ids: Map<felt252, ModelId>,
        job_input_hashes: Map<felt252, felt252>,
        job_output_formats: Map<felt252, felt252>,
        job_verification_methods: Map<felt252, VerificationMethod>,
        job_max_rewards: Map<felt252, u256>,
        job_deadlines: Map<felt252, u64>,
        // Note: compute_requirements and metadata arrays would need special handling
        
        job_clients: Map<felt252, ContractAddress>,
        job_workers: Map<felt252, ContractAddress>,
        job_states: Map<felt252, JobState>,
        job_payments: Map<felt252, u256>,
        job_timestamps: Map<felt252, (u64, u64, u64)>, // (created, assigned, completed)
        
        // Model management - store ModelRequirements fields separately  
        model_min_memory: Map<felt252, u32>,
        model_min_compute: Map<felt252, u32>,
        model_gpu_types: Map<felt252, felt252>,
        // Note: framework_dependencies array would need special handling
        
        model_owners: Map<felt252, ContractAddress>,
        model_active: Map<felt252, bool>,
        model_hashes: Map<felt252, felt252>,
        
        // Worker tracking - using felt252 keys
        worker_stats: Map<felt252, WorkerStats>,
        worker_active: Map<felt252, bool>,
        
        // Job indexing for queries - using felt252 keys
        client_jobs: Map<(ContractAddress, u64), felt252>,
        client_job_count: Map<ContractAddress, u64>,
        worker_jobs: Map<(ContractAddress, u64), felt252>,
        worker_job_count: Map<ContractAddress, u64>,
        
        // Model indexing - using felt252 keys
        models_by_owner: Map<(ContractAddress, u64), felt252>,
        models_by_owner_count: Map<ContractAddress, u64>,
        
        // Simple admin control
        admin: ContractAddress,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        admin: ContractAddress,
        payment_token: ContractAddress,
        treasury: ContractAddress,
        cdc_pool_contract: ContractAddress
    ) {
        self.admin.write(admin);
        
        self.payment_token.write(payment_token);
        self.treasury.write(treasury);
        self.cdc_pool_contract.write(cdc_pool_contract);
        
        // Set default configuration
        self.platform_fee_bps.write(250); // 2.5%
        self.min_job_payment.write(1000000000000000000); // 1 CIRO token
        self.max_job_duration.write(86400); // 24 hours
        self.dispute_fee.write(10000000000000000000); // 10 CIRO tokens
        self.min_allocation_score.write(100);
        
        self.next_job_id.write(1);
        self.next_model_id.write(1);
    }

    #[abi(embed_v0)]
    impl JobManagerImpl of IJobManager<ContractState> {
        fn submit_ai_job(
            ref self: ContractState,
            job_spec: JobSpec,
            payment: u256,
            client: ContractAddress
        ) -> JobId {
            // Validate inputs
            let current_time = starknet::get_block_timestamp();
            assert!(payment >= self.min_job_payment.read(), "Payment too low");
            assert!(job_spec.sla_deadline > current_time, "Invalid deadline");
            assert!(job_spec.max_reward > 0, "Invalid max reward");
            
            // Generate new job ID
            let job_id = JobId { value: self.next_job_id.read() };
            self.next_job_id.write(self.next_job_id.read() + 1);
            
            // Convert job ID to felt252 key for storage
            let job_key: felt252 = job_id.value.try_into().unwrap();
            
            // Store job information
            self.job_types.write(job_key, job_spec.job_type);
            self.job_model_ids.write(job_key, job_spec.model_id);
            self.job_input_hashes.write(job_key, job_spec.input_data_hash);
            self.job_output_formats.write(job_key, job_spec.expected_output_format);
            self.job_verification_methods.write(job_key, job_spec.verification_method);
            self.job_max_rewards.write(job_key, job_spec.max_reward);
            self.job_deadlines.write(job_key, job_spec.sla_deadline);
            self.job_clients.write(job_key, client);
            self.job_payments.write(job_key, payment);
            self.job_timestamps.write(job_key, (current_time, 0, 0)); // (created, assigned, completed)
            
            // Update counters
            self.total_jobs.write(self.total_jobs.read() + 1);
            self.active_jobs.write(self.active_jobs.read() + 1);
            
            self.emit(JobSubmitted {
                job_id: job_id.value,
                client,
                payment
            });
            
            job_id
        }

        fn submit_prove_job(
            ref self: ContractState,
            prove_job_data: ProveJobData,
            payment: u256,
            client: ContractAddress
        ) -> JobId {
            // Create a JobSpec for prove jobs
            let job_spec = JobSpec {
                job_type: JobType::ProofGeneration,
                model_id: ModelId { value: 0 }, // Default model for proof jobs
                input_data_hash: prove_job_data.private_inputs_hash,
                expected_output_format: 'proof_format',
                verification_method: VerificationMethod::ZeroKnowledgeProof,
                max_reward: payment,
                sla_deadline: get_block_timestamp() + 3600, // 1 hour deadline
                compute_requirements: array![], // Empty array for now
                metadata: array![] // Empty array for now
            };
            
            // Call the main submit job function
            self.submit_ai_job(job_spec, payment, client)
        }

        fn assign_job_to_worker(
            ref self: ContractState,
            job_id: JobId,
            worker_id: WorkerId
        ) {
            let caller = get_caller_address();
            assert!(caller == self.admin.read(), "Not authorized");
            
            let job_key: felt252 = job_id.value.try_into().unwrap();
            let current_state = self.job_states.read(job_key);
            assert!(current_state == JobState::Queued, "Job not available for assignment");
            
            // Update job state to Processing
            self.job_states.write(job_key, JobState::Processing);
            let (created_at, _, completed_at) = self.job_timestamps.read(job_key);
            self.job_timestamps.write(job_key, (created_at, get_block_timestamp(), completed_at));
            
            // Convert worker_id to address - placeholder implementation
            let worker_address: ContractAddress = 0x1234.try_into().unwrap();
            self.job_workers.write(job_key, worker_address);
            
            self.emit(JobAssigned {
                job_id: job_id.value,
                worker: worker_address
            });
        }

        fn submit_job_result(
            ref self: ContractState,
            job_id: JobId,
            result: JobResult
        ) {
            let caller = get_caller_address();
            let job_key: felt252 = job_id.value.try_into().unwrap();
            let current_state = self.job_states.read(job_key);
            
            assert!(current_state == JobState::Processing, "Job not in processing state");
            
            let worker_address = self.job_workers.read(job_key);
            assert!(worker_address == caller, "Not assigned worker");
            
            // Update job state to Completed
            self.job_states.write(job_key, JobState::Completed);
            let (created_at, assigned_at, _) = self.job_timestamps.read(job_key);
            self.job_timestamps.write(job_key, (created_at, assigned_at, result.execution_time));
            
            self.emit(JobCompleted {
                job_id: job_id.value,
                worker: worker_address
            });
        }

        fn distribute_rewards(ref self: ContractState, job_id: JobId) {
            let job_key: felt252 = job_id.value.try_into().unwrap();
            let job_state = self.job_states.read(job_key);
            
            assert!(job_state == JobState::Completed, "Job not completed");
            
            let payment_amount = self.job_payments.read(job_key);
            let worker_address = self.job_workers.read(job_key);
            
            // Calculate platform fee
            let platform_fee = (payment_amount * self.platform_fee_bps.read().into()) / 10000;
            let worker_payment = payment_amount - platform_fee;
            
            // Transfer tokens
            let token = IERC20Dispatcher { contract_address: self.payment_token.read() };
            token.transfer(worker_address, worker_payment);
            if platform_fee > 0 {
                token.transfer(self.treasury.read(), platform_fee);
            }
            
            self.emit(PaymentReleased {
                job_id: job_id.value,
                worker: 0.try_into().unwrap(),
                amount: worker_payment
            });
        }

        fn register_model(
            ref self: ContractState,
            model_hash: felt252,
            requirements: ModelRequirements,
            pricing: u256
        ) -> ModelId {
            let model_id = ModelId { value: self.next_model_id.read() };
            let model_key: felt252 = model_id.value.try_into().unwrap();
            
            self.model_min_memory.write(model_key, requirements.min_memory_gb);
            self.model_min_compute.write(model_key, requirements.min_compute_units);
            self.model_gpu_types.write(model_key, requirements.required_gpu_type);
            // Note: framework_dependencies array would need special handling
            
            self.model_owners.write(model_key, get_caller_address());
            self.model_active.write(model_key, true);
            self.model_hashes.write(model_key, model_hash);
            
            self.next_model_id.write(self.next_model_id.read() + 1);
            
            self.emit(ModelRegistered {
                model_id: model_id.value,
                owner: get_caller_address()
            });
            
            model_id
        }

        fn get_job_details(self: @ContractState, job_id: JobId) -> JobDetails {
            let job_key: felt252 = job_id.value.try_into().unwrap();
            let job_type = self.job_types.read(job_key);
            let _job_model_id = self.job_model_ids.read(job_key);
            let _job_input_hash = self.job_input_hashes.read(job_key);
            let _job_output_format = self.job_output_formats.read(job_key);
            let _job_verification_method = self.job_verification_methods.read(job_key);
            let _job_max_reward = self.job_max_rewards.read(job_key);
            let _job_deadline = self.job_deadlines.read(job_key);
            let state = self.job_states.read(job_key);
            let client = self.job_clients.read(job_key);
            let worker = self.job_workers.read(job_key);
            let payment_amount = self.job_payments.read(job_key);
            let (created_at, assigned_at, completed_at) = self.job_timestamps.read(job_key);
            let result_hash = 0; // Placeholder, actual result hash would be in job_results
            
            JobDetails {
                job_id,
                job_type: job_type,
                client: client,
                worker: worker,
                state: state,
                payment_amount: payment_amount,
                created_at: created_at,
                assigned_at: assigned_at,
                completed_at: completed_at,
                result_hash: result_hash
            }
        }

        fn get_job_state(self: @ContractState, job_id: JobId) -> JobState {
            let job_key: felt252 = job_id.value.try_into().unwrap();
            let state_value = self.job_states.read(job_key);
            
            state_value
        }

        fn get_worker_stats(self: @ContractState, worker_id: WorkerId) -> WorkerStats {
            let _worker_key: felt252 = worker_id.value;
            // For now return placeholder stats - real implementation would read from storage
            WorkerStats {
                total_jobs_completed: 0,
                success_rate: 100, // Percentage
                average_completion_time: 3600, // 1 hour in seconds
                reputation_score: 1000,
                total_earnings: 0
            }
        }

        fn update_config(ref self: ContractState, config_key: felt252, config_value: felt252) {
            assert!(get_caller_address() == self.admin.read(), "Not authorized");
            
            let _old_value = 0; // Placeholder - would implement _get_config_value helper
            
            // Set new value
            // Implementation would go here - would implement _set_config_value helper
            
            // self.emit(ConfigUpdated {
            //     config_key,
            //     old_value,
            //     new_value: config_value
            // });
        }

        fn pause(ref self: ContractState) {
            assert!(get_caller_address() == self.admin.read(), "Not authorized");
            // self.pausable._pause(); // Assuming PausableComponent is removed
        }

        fn unpause(ref self: ContractState) {
            assert!(get_caller_address() == self.admin.read(), "Not authorized");
            // self.pausable._unpause(); // Assuming PausableComponent is removed
        }

        fn emergency_withdraw(ref self: ContractState, token: ContractAddress, amount: u256) {
            assert!(get_caller_address() == self.admin.read(), "Not authorized");
            let token_dispatcher = IERC20Dispatcher { contract_address: token };
            token_dispatcher.transfer(self.treasury.read(), amount);
        }
    }
} 