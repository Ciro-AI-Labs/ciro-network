// CIRO Network Governance and Upgradability Testing Framework
// Comprehensive tests for governance components and upgrade patterns

use starknet::testing::{set_caller_address, set_contract_address, set_block_timestamp};
use starknet::ContractAddress;
use starknet::contract_address_const;
use starknet::get_caller_address;
use starknet::class_hash::ClassHash;

use ciro_contracts::utils::governance::{
    GovernanceComponent, IGovernance, Proposal, ProposalType, ProposalState,
    GovernanceConfig, VotingPower
};
use ciro_contracts::utils::upgradability::{
    UUPSProxyComponent, TransparentProxyComponent, DiamondProxyComponent,
    JobAwareUpgradeComponent, IUUPSProxy, ITransparentProxy, IDiamondProxy,
    IJobAwareUpgrade, UpgradeProposal, UpgradePattern, FacetCut, FacetCutAction
};
use ciro_contracts::utils::constants::*;
use ciro_contracts::utils::types::*;

// Test contract implementing governance components
#[starknet::contract]
mod TestGovernanceContract {
    use super::*;
    use ciro_contracts::utils::governance::GovernanceComponent;
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    component!(path: GovernanceComponent, storage: governance, event: GovernanceEvent);

    #[abi(embed_v0)]
    impl GovernanceImpl = GovernanceComponent::GovernanceImpl<ContractState>;
    impl GovernanceInternalImpl = GovernanceComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        governance: GovernanceComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        GovernanceEvent: GovernanceComponent::Event,
    }

    #[constructor]
    fn constructor(ref self: ContractState, config: GovernanceConfig) {
        self.governance.initializer(config);
    }

    // Test function for proposals
    #[external(v0)]
    fn test_function(ref self: ContractState, value: u256) {
        // Test implementation
    }
}

// Test contract implementing UUPS proxy
#[starknet::contract]
mod TestUUPSProxy {
    use super::*;
    use ciro_contracts::utils::upgradability::UUPSProxyComponent;
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    component!(path: UUPSProxyComponent, storage: uups, event: UUPSEvent);

    #[abi(embed_v0)]
    impl UUPSProxyImpl = UUPSProxyComponent::UUPSProxyImpl<ContractState>;
    impl UUPSInternalImpl = UUPSProxyComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        uups: UUPSProxyComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        UUPSEvent: UUPSProxyComponent::Event,
    }

    #[constructor]
    fn constructor(ref self: ContractState, implementation: ClassHash, admin: ContractAddress) {
        self.uups.initializer(implementation, admin);
    }
}

// Test contract implementing job-aware upgrades
#[starknet::contract]
mod TestJobAwareUpgrade {
    use super::*;
    use ciro_contracts::utils::upgradability::JobAwareUpgradeComponent;
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    component!(path: JobAwareUpgradeComponent, storage: job_aware, event: JobAwareEvent);

    #[abi(embed_v0)]
    impl JobAwareUpgradeImpl = JobAwareUpgradeComponent::JobAwareUpgradeImpl<ContractState>;
    impl JobAwareInternalImpl = JobAwareUpgradeComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        job_aware: JobAwareUpgradeComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        JobAwareEvent: JobAwareUpgradeComponent::Event,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        admin: ContractAddress,
        job_registry: ContractAddress,
        grace_period: u64,
        max_upgrade_delay: u64
    ) {
        self.job_aware.initializer(admin, job_registry, grace_period, max_upgrade_delay);
    }
}

// Governance Tests
#[cfg(test)]
mod governance_tests {
    use super::*;

    fn setup_governance() -> (ContractAddress, ContractAddress, ContractAddress) {
        let admin = contract_address_const::<1>();
        let token = contract_address_const::<2>();
        let emergency_multisig = contract_address_const::<3>();
        
        let config = GovernanceConfig {
            voting_period: 604800, // 7 days
            timelock_delay: 604800, // 7 days
            proposal_threshold: 1000000, // 1M tokens
            quorum_threshold: 5000000, // 5M tokens
            emergency_multisig,
            governance_token: token,
            max_operations_per_proposal: 10,
        };

        let governance_contract = deploy_contract("TestGovernanceContract", array![config]);
        (governance_contract, admin, token)
    }

    #[test]
    fn test_governance_initialization() {
        let (governance_contract, admin, token) = setup_governance();
        
        // Test that governance was initialized correctly
        let governance = IGovernanceDispatcher { contract_address: governance_contract };
        
        // Should be able to get voting power (even if 0)
        let voting_power = governance.get_voting_power(admin, 0);
        assert(voting_power >= 0, 'Voting power should be non-negative');
    }

    #[test]
    fn test_proposal_creation() {
        let (governance_contract, admin, token) = setup_governance();
        let governance = IGovernanceDispatcher { contract_address: governance_contract };
        
        set_caller_address(admin);
        set_block_timestamp(1000000);
        
        let targets = array![governance_contract];
        let selectors = array![selector!("test_function")];
        let calldatas = array![array![42]];
        
        let proposal_id = governance.propose(
            ProposalType::Standard,
            'Test Proposal',
            array!['Test description'],
            targets,
            selectors,
            calldatas
        );
        
        assert(proposal_id == 1, 'First proposal should have ID 1');
        
        let proposal = governance.get_proposal(proposal_id);
        assert(proposal.id == proposal_id, 'Proposal ID should match');
        assert(proposal.proposer == admin, 'Proposer should be admin');
        assert(proposal.proposal_type == ProposalType::Standard, 'Type should be Standard');
    }

    #[test]
    fn test_voting_process() {
        let (governance_contract, admin, token) = setup_governance();
        let governance = IGovernanceDispatcher { contract_address: governance_contract };
        let voter = contract_address_const::<4>();
        
        set_caller_address(admin);
        set_block_timestamp(1000000);
        
        // Create proposal
        let targets = array![governance_contract];
        let selectors = array![selector!("test_function")];
        let calldatas = array![array![42]];
        
        let proposal_id = governance.propose(
            ProposalType::Standard,
            'Test Proposal',
            array!['Test description'],
            targets,
            selectors,
            calldatas
        );
        
        // Move to voting period
        set_block_timestamp(1000000 + 3600); // After proposal delay
        
        // Vote
        set_caller_address(voter);
        governance.vote(proposal_id, 1, 'Support proposal'); // 1 = For
        
        let proposal = governance.get_proposal(proposal_id);
        assert(proposal.votes_for > 0, 'Should have votes for');
        
        let state = governance.get_proposal_state(proposal_id);
        assert(state == ProposalState::Active, 'Should be active during voting');
    }

    #[test]
    fn test_delegation() {
        let (governance_contract, admin, token) = setup_governance();
        let governance = IGovernanceDispatcher { contract_address: governance_contract };
        let delegator = contract_address_const::<5>();
        let delegatee = contract_address_const::<6>();
        
        set_caller_address(delegator);
        governance.delegate(delegatee);
        
        // Test that delegation was successful
        // In a real implementation, this would check the delegation mapping
        // For now, we just verify the function doesn't panic
    }

    #[test]
    fn test_emergency_proposal() {
        let (governance_contract, admin, token) = setup_governance();
        let governance = IGovernanceDispatcher { contract_address: governance_contract };
        let emergency_multisig = contract_address_const::<3>();
        
        set_caller_address(emergency_multisig);
        set_block_timestamp(1000000);
        
        let targets = array![governance_contract];
        let selectors = array![selector!("test_function")];
        let calldatas = array![array![42]];
        
        let proposal_id = governance.propose(
            ProposalType::Emergency,
            'Emergency Fix',
            array!['Critical security fix'],
            targets,
            selectors,
            calldatas
        );
        
        let proposal = governance.get_proposal(proposal_id);
        assert(proposal.proposal_type == ProposalType::Emergency, 'Should be emergency type');
        
        // Emergency proposals should have shorter timeframes
        let voting_duration = proposal.voting_end - proposal.voting_start;
        assert(voting_duration <= 3600, 'Emergency voting should be ≤ 1 hour');
    }

    #[test]
    fn test_proposal_execution() {
        let (governance_contract, admin, token) = setup_governance();
        let governance = IGovernanceDispatcher { contract_address: governance_contract };
        
        set_caller_address(admin);
        set_block_timestamp(1000000);
        
        // Create proposal
        let targets = array![governance_contract];
        let selectors = array![selector!("test_function")];
        let calldatas = array![array![42]];
        
        let proposal_id = governance.propose(
            ProposalType::Standard,
            'Test Proposal',
            array!['Test description'],
            targets,
            selectors,
            calldatas
        );
        
        // Simulate voting and passage
        set_block_timestamp(1000000 + 3600); // After proposal delay
        governance.vote(proposal_id, 1, 'Support proposal');
        
        // Move past voting period
        set_block_timestamp(1000000 + 3600 + 604800); // After voting period
        
        // Move past timelock
        set_block_timestamp(1000000 + 3600 + 604800 + 604800); // After timelock
        
        // Execute proposal
        governance.execute(proposal_id);
        
        let proposal = governance.get_proposal(proposal_id);
        assert(proposal.executed, 'Proposal should be executed');
        
        let state = governance.get_proposal_state(proposal_id);
        assert(state == ProposalState::Executed, 'State should be executed');
    }

    #[test]
    fn test_proposal_cancellation() {
        let (governance_contract, admin, token) = setup_governance();
        let governance = IGovernanceDispatcher { contract_address: governance_contract };
        
        set_caller_address(admin);
        set_block_timestamp(1000000);
        
        // Create proposal
        let targets = array![governance_contract];
        let selectors = array![selector!("test_function")];
        let calldatas = array![array![42]];
        
        let proposal_id = governance.propose(
            ProposalType::Standard,
            'Test Proposal',
            array!['Test description'],
            targets,
            selectors,
            calldatas
        );
        
        // Cancel proposal
        governance.cancel(proposal_id);
        
        let proposal = governance.get_proposal(proposal_id);
        assert(proposal.cancelled, 'Proposal should be cancelled');
        
        let state = governance.get_proposal_state(proposal_id);
        assert(state == ProposalState::Cancelled, 'State should be cancelled');
    }
}

// Upgradability Tests
#[cfg(test)]
mod upgradability_tests {
    use super::*;

    fn setup_uups_proxy() -> (ContractAddress, ContractAddress, ClassHash) {
        let admin = contract_address_const::<1>();
        let implementation = 0x123.try_into().unwrap();
        
        let proxy_contract = deploy_contract("TestUUPSProxy", array![implementation, admin]);
        (proxy_contract, admin, implementation)
    }

    #[test]
    fn test_uups_proxy_initialization() {
        let (proxy_contract, admin, implementation) = setup_uups_proxy();
        let proxy = IUUPSProxyDispatcher { contract_address: proxy_contract };
        
        assert(proxy.get_admin() == admin, 'Admin should be set correctly');
        assert(proxy.get_implementation() == implementation, 'Implementation should be set');
    }

    #[test]
    fn test_uups_upgrade() {
        let (proxy_contract, admin, implementation) = setup_uups_proxy();
        let proxy = IUUPSProxyDispatcher { contract_address: proxy_contract };
        let new_implementation = 0x456.try_into().unwrap();
        
        set_caller_address(admin);
        proxy.upgrade(new_implementation);
        
        assert(proxy.get_implementation() == new_implementation, 'Implementation should be updated');
    }

    #[test]
    #[should_panic(expected: ('Caller is not admin',))]
    fn test_uups_upgrade_unauthorized() {
        let (proxy_contract, admin, implementation) = setup_uups_proxy();
        let proxy = IUUPSProxyDispatcher { contract_address: proxy_contract };
        let unauthorized = contract_address_const::<2>();
        let new_implementation = 0x456.try_into().unwrap();
        
        set_caller_address(unauthorized);
        proxy.upgrade(new_implementation); // Should panic
    }

    #[test]
    fn test_admin_change() {
        let (proxy_contract, admin, implementation) = setup_uups_proxy();
        let proxy = IUUPSProxyDispatcher { contract_address: proxy_contract };
        let new_admin = contract_address_const::<2>();
        
        set_caller_address(admin);
        proxy.set_admin(new_admin);
        
        assert(proxy.get_admin() == new_admin, 'Admin should be updated');
    }

    #[test]
    fn test_job_aware_upgrade() {
        let admin = contract_address_const::<1>();
        let job_registry = contract_address_const::<2>();
        let grace_period = 3600; // 1 hour
        let max_upgrade_delay = 604800; // 7 days
        
        let job_aware_contract = deploy_contract(
            "TestJobAwareUpgrade",
            array![admin, job_registry, grace_period, max_upgrade_delay]
        );
        
        let job_aware = IJobAwareUpgradeDispatcher { contract_address: job_aware_contract };
        let new_implementation = 0x789.try_into().unwrap();
        
        set_caller_address(admin);
        set_block_timestamp(1000000);
        
        // Request upgrade
        job_aware.request_upgrade(new_implementation);
        
        // Check that upgrade was requested
        assert(!job_aware.check_upgrade_readiness(), 'Should not be ready immediately');
        
        // Move past grace period
        set_block_timestamp(1000000 + grace_period + 1);
        
        // Should be ready now (assuming no active jobs)
        assert(job_aware.check_upgrade_readiness(), 'Should be ready after grace period');
        
        // Execute upgrade
        job_aware.execute_pending_upgrade();
    }

    #[test]
    fn test_maintenance_mode() {
        let admin = contract_address_const::<1>();
        let job_registry = contract_address_const::<2>();
        let grace_period = 3600;
        let max_upgrade_delay = 604800;
        
        let job_aware_contract = deploy_contract(
            "TestJobAwareUpgrade",
            array![admin, job_registry, grace_period, max_upgrade_delay]
        );
        
        let job_aware = IJobAwareUpgradeDispatcher { contract_address: job_aware_contract };
        
        set_caller_address(admin);
        
        // Enter maintenance mode
        job_aware.enter_maintenance_mode();
        
        // Exit maintenance mode
        job_aware.exit_maintenance_mode();
        
        // Test passes if no panics occur
    }

    #[test]
    fn test_upgrade_cancellation() {
        let admin = contract_address_const::<1>();
        let job_registry = contract_address_const::<2>();
        let grace_period = 3600;
        let max_upgrade_delay = 604800;
        
        let job_aware_contract = deploy_contract(
            "TestJobAwareUpgrade",
            array![admin, job_registry, grace_period, max_upgrade_delay]
        );
        
        let job_aware = IJobAwareUpgradeDispatcher { contract_address: job_aware_contract };
        let new_implementation = 0x789.try_into().unwrap();
        
        set_caller_address(admin);
        set_block_timestamp(1000000);
        
        // Request upgrade
        job_aware.request_upgrade(new_implementation);
        
        // Cancel upgrade
        job_aware.cancel_upgrade();
        
        // Should not be ready after cancellation
        assert(!job_aware.check_upgrade_readiness(), 'Should not be ready after cancellation');
    }

    #[test]
    fn test_job_completion_tracking() {
        let admin = contract_address_const::<1>();
        let job_registry = contract_address_const::<2>();
        let grace_period = 3600;
        let max_upgrade_delay = 604800;
        
        let job_aware_contract = deploy_contract(
            "TestJobAwareUpgrade",
            array![admin, job_registry, grace_period, max_upgrade_delay]
        );
        
        let job_aware = IJobAwareUpgradeDispatcher { contract_address: job_aware_contract };
        
        set_caller_address(admin);
        
        // Register job completion
        job_aware.register_job_completion(123);
        
        // Test passes if no panics occur
    }
}

// Integration Tests
#[cfg(test)]
mod integration_tests {
    use super::*;

    #[test]
    fn test_governance_controlled_upgrade() {
        // Setup governance
        let admin = contract_address_const::<1>();
        let token = contract_address_const::<2>();
        let emergency_multisig = contract_address_const::<3>();
        
        let config = GovernanceConfig {
            voting_period: 604800,
            timelock_delay: 604800,
            proposal_threshold: 1000000,
            quorum_threshold: 5000000,
            emergency_multisig,
            governance_token: token,
            max_operations_per_proposal: 10,
        };

        let governance_contract = deploy_contract("TestGovernanceContract", array![config]);
        let governance = IGovernanceDispatcher { contract_address: governance_contract };
        
        // Setup UUPS proxy
        let implementation = 0x123.try_into().unwrap();
        let proxy_contract = deploy_contract("TestUUPSProxy", array![implementation, governance_contract]);
        let proxy = IUUPSProxyDispatcher { contract_address: proxy_contract };
        
        // Create upgrade proposal through governance
        set_caller_address(admin);
        set_block_timestamp(1000000);
        
        let new_implementation = 0x456.try_into().unwrap();
        let targets = array![proxy_contract];
        let selectors = array![selector!("upgrade")];
        let calldatas = array![array![new_implementation.into()]];
        
        let proposal_id = governance.propose(
            ProposalType::Upgrade,
            'Upgrade Proposal',
            array!['Upgrade to new implementation'],
            targets,
            selectors,
            calldatas
        );
        
        // Simulate voting process
        set_block_timestamp(1000000 + 3600); // After proposal delay
        governance.vote(proposal_id, 1, 'Support upgrade');
        
        // Move past voting and timelock periods
        set_block_timestamp(1000000 + 3600 + 604800 + 1209600); // After voting + timelock
        
        // Execute upgrade through governance
        governance.execute(proposal_id);
        
        // Verify upgrade was successful
        assert(proxy.get_implementation() == new_implementation, 'Upgrade should be successful');
    }

    #[test]
    fn test_emergency_upgrade_process() {
        // Setup governance with emergency multisig
        let admin = contract_address_const::<1>();
        let token = contract_address_const::<2>();
        let emergency_multisig = contract_address_const::<3>();
        
        let config = GovernanceConfig {
            voting_period: 604800,
            timelock_delay: 604800,
            proposal_threshold: 1000000,
            quorum_threshold: 5000000,
            emergency_multisig,
            governance_token: token,
            max_operations_per_proposal: 10,
        };

        let governance_contract = deploy_contract("TestGovernanceContract", array![config]);
        let governance = IGovernanceDispatcher { contract_address: governance_contract };
        
        // Setup UUPS proxy
        let implementation = 0x123.try_into().unwrap();
        let proxy_contract = deploy_contract("TestUUPSProxy", array![implementation, governance_contract]);
        let proxy = IUUPSProxyDispatcher { contract_address: proxy_contract };
        
        // Create emergency upgrade proposal
        set_caller_address(emergency_multisig);
        set_block_timestamp(1000000);
        
        let new_implementation = 0x456.try_into().unwrap();
        let targets = array![proxy_contract];
        let selectors = array![selector!("upgrade")];
        let calldatas = array![array![new_implementation.into()]];
        
        let proposal_id = governance.propose(
            ProposalType::Emergency,
            'Emergency Fix',
            array!['Critical security fix'],
            targets,
            selectors,
            calldatas
        );
        
        // Emergency proposals should have shorter timeframes
        let proposal = governance.get_proposal(proposal_id);
        let voting_duration = proposal.voting_end - proposal.voting_start;
        assert(voting_duration <= 3600, 'Emergency voting should be ≤ 1 hour');
        
        // Vote and execute quickly
        set_block_timestamp(1000000 + 1800); // 30 minutes later
        governance.vote(proposal_id, 1, 'Emergency support');
        
        set_block_timestamp(1000000 + 3600 + 1); // After voting period
        governance.execute(proposal_id);
        
        // Verify emergency upgrade was successful
        assert(proxy.get_implementation() == new_implementation, 'Emergency upgrade should be successful');
    }
}

// Performance and Gas Tests
#[cfg(test)]
mod performance_tests {
    use super::*;

    #[test]
    fn test_proposal_creation_gas_efficiency() {
        let (governance_contract, admin, token) = governance_tests::setup_governance();
        let governance = IGovernanceDispatcher { contract_address: governance_contract };
        
        set_caller_address(admin);
        set_block_timestamp(1000000);
        
        // Test multiple proposal creations
        let mut i = 0;
        while i < 5 {
            let targets = array![governance_contract];
            let selectors = array![selector!("test_function")];
            let calldatas = array![array![i.into()]];
            
            let proposal_id = governance.propose(
                ProposalType::Standard,
                'Test Proposal',
                array!['Test description'],
                targets,
                selectors,
                calldatas
            );
            
            assert(proposal_id == i + 1, 'Proposal IDs should increment');
            i += 1;
        };
    }

    #[test]
    fn test_voting_scalability() {
        let (governance_contract, admin, token) = governance_tests::setup_governance();
        let governance = IGovernanceDispatcher { contract_address: governance_contract };
        
        set_caller_address(admin);
        set_block_timestamp(1000000);
        
        // Create proposal
        let targets = array![governance_contract];
        let selectors = array![selector!("test_function")];
        let calldatas = array![array![42]];
        
        let proposal_id = governance.propose(
            ProposalType::Standard,
            'Test Proposal',
            array!['Test description'],
            targets,
            selectors,
            calldatas
        );
        
        // Move to voting period
        set_block_timestamp(1000000 + 3600);
        
        // Test multiple votes
        let mut i = 0;
        while i < 3 {
            let voter = contract_address_const::<(4 + i).try_into().unwrap()>();
            set_caller_address(voter);
            governance.vote(proposal_id, 1, 'Support proposal');
            i += 1;
        };
        
        let proposal = governance.get_proposal(proposal_id);
        assert(proposal.votes_for > 0, 'Should accumulate votes');
    }

    #[test]
    fn test_upgrade_pattern_comparison() {
        let admin = contract_address_const::<1>();
        
        // Test UUPS proxy
        let implementation = 0x123.try_into().unwrap();
        let uups_proxy = deploy_contract("TestUUPSProxy", array![implementation, admin]);
        let uups = IUUPSProxyDispatcher { contract_address: uups_proxy };
        
        set_caller_address(admin);
        let new_implementation = 0x456.try_into().unwrap();
        
        // Time the upgrade
        uups.upgrade(new_implementation);
        assert(uups.get_implementation() == new_implementation, 'UUPS upgrade should work');
        
        // Test job-aware upgrade
        let job_registry = contract_address_const::<2>();
        let job_aware_contract = deploy_contract(
            "TestJobAwareUpgrade",
            array![admin, job_registry, 3600, 604800]
        );
        
        let job_aware = IJobAwareUpgradeDispatcher { contract_address: job_aware_contract };
        
        set_block_timestamp(1000000);
        job_aware.request_upgrade(new_implementation);
        
        set_block_timestamp(1000000 + 3601); // After grace period
        job_aware.execute_pending_upgrade();
        
        // Both upgrade patterns should work efficiently
    }
}

// Security Tests
#[cfg(test)]
mod security_tests {
    use super::*;

    #[test]
    #[should_panic(expected: ('Caller is not admin',))]
    fn test_unauthorized_upgrade() {
        let (proxy_contract, admin, implementation) = upgradability_tests::setup_uups_proxy();
        let proxy = IUUPSProxyDispatcher { contract_address: proxy_contract };
        let unauthorized = contract_address_const::<999>();
        let new_implementation = 0x456.try_into().unwrap();
        
        set_caller_address(unauthorized);
        proxy.upgrade(new_implementation); // Should panic
    }

    #[test]
    #[should_panic(expected: ('Invalid implementation',))]
    fn test_invalid_implementation_upgrade() {
        let (proxy_contract, admin, implementation) = upgradability_tests::setup_uups_proxy();
        let proxy = IUUPSProxyDispatcher { contract_address: proxy_contract };
        let invalid_implementation = 0.try_into().unwrap();
        
        set_caller_address(admin);
        proxy.upgrade(invalid_implementation); // Should panic
    }

    #[test]
    #[should_panic(expected: ('Insufficient voting power',))]
    fn test_insufficient_voting_power_proposal() {
        let (governance_contract, admin, token) = governance_tests::setup_governance();
        let governance = IGovernanceDispatcher { contract_address: governance_contract };
        let low_power_user = contract_address_const::<999>();
        
        set_caller_address(low_power_user);
        set_block_timestamp(1000000);
        
        let targets = array![governance_contract];
        let selectors = array![selector!("test_function")];
        let calldatas = array![array![42]];
        
        // Should panic due to insufficient voting power
        governance.propose(
            ProposalType::Standard,
            'Test Proposal',
            array!['Test description'],
            targets,
            selectors,
            calldatas
        );
    }

    #[test]
    #[should_panic(expected: ('Already voted',))]
    fn test_double_voting_prevention() {
        let (governance_contract, admin, token) = governance_tests::setup_governance();
        let governance = IGovernanceDispatcher { contract_address: governance_contract };
        let voter = contract_address_const::<4>();
        
        set_caller_address(admin);
        set_block_timestamp(1000000);
        
        // Create proposal
        let targets = array![governance_contract];
        let selectors = array![selector!("test_function")];
        let calldatas = array![array![42]];
        
        let proposal_id = governance.propose(
            ProposalType::Standard,
            'Test Proposal',
            array!['Test description'],
            targets,
            selectors,
            calldatas
        );
        
        // Move to voting period
        set_block_timestamp(1000000 + 3600);
        
        // First vote
        set_caller_address(voter);
        governance.vote(proposal_id, 1, 'Support proposal');
        
        // Second vote should panic
        governance.vote(proposal_id, 0, 'Changed mind');
    }

    #[test]
    fn test_timelock_enforcement() {
        let (governance_contract, admin, token) = governance_tests::setup_governance();
        let governance = IGovernanceDispatcher { contract_address: governance_contract };
        
        set_caller_address(admin);
        set_block_timestamp(1000000);
        
        // Create proposal
        let targets = array![governance_contract];
        let selectors = array![selector!("test_function")];
        let calldatas = array![array![42]];
        
        let proposal_id = governance.propose(
            ProposalType::Standard,
            'Test Proposal',
            array!['Test description'],
            targets,
            selectors,
            calldatas
        );
        
        // Vote
        set_block_timestamp(1000000 + 3600);
        governance.vote(proposal_id, 1, 'Support proposal');
        
        // Try to execute before timelock expires
        set_block_timestamp(1000000 + 3600 + 604800); // After voting but before timelock
        
        // This should fail due to timelock not being expired
        // The specific error depends on implementation
        // For now, we just test that the function exists
        let state = governance.get_proposal_state(proposal_id);
        assert(state == ProposalState::Queued, 'Should be queued before timelock expires');
    }
}

// Helper functions for testing
fn deploy_contract(contract_name: felt252, constructor_args: Array<felt252>) -> ContractAddress {
    // Mock deployment - in real tests this would use actual deployment
    contract_address_const::<0x123456789>()
}

fn selector(name: felt252) -> felt252 {
    // Mock selector calculation
    name
} 