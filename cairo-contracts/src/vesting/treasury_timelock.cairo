//! Treasury Timelock Contract
//! CIRO Network - Secure Multi-Sig Treasury Management
//! Implements timelocked operations with multi-signature approval

use starknet::ContractAddress;

#[starknet::interface]
pub trait ITreasuryTimelock<TContractState> {
    // Core timelock functions
    fn propose_transaction(ref self: TContractState, target: ContractAddress, value: u256, data: Array<felt252>, description: felt252) -> u256;
    fn approve_transaction(ref self: TContractState, tx_id: u256);
    fn execute_transaction(ref self: TContractState, tx_id: u256);
    fn cancel_transaction(ref self: TContractState, tx_id: u256);
    
    // Emergency functions
    fn emergency_pause(ref self: TContractState, reason: felt252);
    fn emergency_cancel_all(ref self: TContractState);
    
    // View functions
    fn get_transaction(self: @TContractState, tx_id: u256) -> TimelockTransaction;
    fn get_pending_transactions(self: @TContractState) -> Array<u256>;
    fn can_execute(self: @TContractState, tx_id: u256) -> bool;
    fn get_required_approvals(self: @TContractState) -> u32;
    
    // Administration
    fn update_timelock_delay(ref self: TContractState, new_delay: u64);
    fn add_multisig_member(ref self: TContractState, member: ContractAddress);
    fn remove_multisig_member(ref self: TContractState, member: ContractAddress);
    fn update_threshold(ref self: TContractState, new_threshold: u32);
}

#[derive(Drop, Serde, starknet::Store)]
pub struct TimelockTransaction {
    pub tx_id: u256,
    pub proposer: ContractAddress,
    pub target: ContractAddress,
    pub value: u256,
    pub data_hash: felt252,
    pub description: felt252,
    pub created_time: u64,
    pub execution_time: u64,
    pub approvals: u32,
    pub executed: bool,
    pub cancelled: bool,
    pub approval_threshold: u32
}

// Component imports
use openzeppelin::access::accesscontrol::AccessControlComponent;
use openzeppelin::security::reentrancyguard::ReentrancyGuardComponent;
use openzeppelin::security::pausable::PausableComponent;

#[starknet::contract]
mod TreasuryTimelock {
    use super::*;
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp, storage::Map};

    // Component declarations
    component!(path: AccessControlComponent, storage: access_control, event: AccessControlEvent);
    component!(path: ReentrancyGuardComponent, storage: reentrancy_guard, event: ReentrancyGuardEvent);
    component!(path: PausableComponent, storage: pausable, event: PausableEvent);

    // Embedded implementations
    #[abi(embed_v0)]
    impl AccessControlImpl = AccessControlComponent::AccessControlImpl<ContractState>;
    #[abi(embed_v0)]
    impl ReentrancyGuardImpl = ReentrancyGuardComponent::ReentrancyGuardImpl<ContractState>;
    #[abi(embed_v0)]
    impl PausableImpl = PausableComponent::PausableImpl<ContractState>;

    // Internal implementations
    impl AccessControlInternalImpl = AccessControlComponent::InternalImpl<ContractState>;
    impl ReentrancyGuardInternalImpl = ReentrancyGuardComponent::InternalImpl<ContractState>;
    impl PausableInternalImpl = PausableComponent::InternalImpl<ContractState>;

    const ADMIN_ROLE: felt252 = 0x0;
    const MULTISIG_ROLE: felt252 = 'MULTISIG';
    const EMERGENCY_ROLE: felt252 = 'EMERGENCY';

    #[storage]
    struct Storage {
        #[substorage(v0)]
        access_control: AccessControlComponent::Storage,
        #[substorage(v0)]
        reentrancy_guard: ReentrancyGuardComponent::Storage,
        #[substorage(v0)]
        pausable: PausableComponent::Storage,

        // Core storage
        transactions: Map<u256, TimelockTransaction>,
        approvals: Map<(u256, ContractAddress), bool>,
        next_tx_id: u256,
        timelock_delay: u64,
        multisig_threshold: u32,
        multisig_count: u32,
        multisig_members: Map<ContractAddress, bool>
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        AccessControlEvent: AccessControlComponent::Event,
        #[flat]
        ReentrancyGuardEvent: ReentrancyGuardComponent::Event,
        #[flat]
        PausableEvent: PausableComponent::Event,
        
        TransactionProposed: TransactionProposed,
        TransactionApproved: TransactionApproved,
        TransactionExecuted: TransactionExecuted,
        TransactionCancelled: TransactionCancelled
    }

    #[derive(Drop, starknet::Event)]
    struct TransactionProposed {
        #[key]
        tx_id: u256,
        proposer: ContractAddress,
        target: ContractAddress,
        value: u256,
        execution_time: u64
    }

    #[derive(Drop, starknet::Event)]
    struct TransactionApproved {
        #[key]
        tx_id: u256,
        approver: ContractAddress,
        approvals: u32,
        threshold: u32
    }

    #[derive(Drop, starknet::Event)]
    struct TransactionExecuted {
        #[key]
        tx_id: u256,
        executor: ContractAddress
    }

    #[derive(Drop, starknet::Event)]
    struct TransactionCancelled {
        #[key]
        tx_id: u256,
        canceller: ContractAddress
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        multisig_members: Array<ContractAddress>,
        threshold: u32,
        timelock_delay: u64,
        admin: ContractAddress
    ) {
        self.access_control.initializer();
        self.access_control._grant_role(ADMIN_ROLE, admin);
        self.reentrancy_guard.initializer();
        self.pausable.initializer();

        let member_count: u32 = multisig_members.len().try_into().unwrap();
        assert(threshold > 0 && threshold <= member_count, 'Invalid threshold');
        
        self.multisig_threshold.write(threshold);
        self.multisig_count.write(member_count);
        self.timelock_delay.write(timelock_delay);
        self.next_tx_id.write(1);

        let mut i = 0;
        loop {
            if i >= multisig_members.len() {
                break;
            }
            let member = *multisig_members.at(i);
            self.multisig_members.write(member, true);
            self.access_control._grant_role(MULTISIG_ROLE, member);
            i += 1;
        };
    }

    #[abi(embed_v0)]
    impl TreasuryTimelockImpl of super::ITreasuryTimelock<ContractState> {
        fn propose_transaction(ref self: ContractState, target: ContractAddress, value: u256, data: Array<felt252>, description: felt252) -> u256 {
            self.access_control.assert_only_role(MULTISIG_ROLE);
            self.pausable.assert_not_paused();

            let tx_id = self.next_tx_id.read();
            let current_time = get_block_timestamp();
            let execution_time = current_time + self.timelock_delay.read();

            let tx = TimelockTransaction {
                tx_id,
                proposer: get_caller_address(),
                target,
                value,
                data_hash: self._hash_data(data),
                description,
                created_time: current_time,
                execution_time,
                approvals: 1,
                executed: false,
                cancelled: false,
                approval_threshold: self.multisig_threshold.read()
            };

            self.transactions.write(tx_id, tx);
            self.approvals.write((tx_id, get_caller_address()), true);
            self.next_tx_id.write(tx_id + 1);

            self.emit(TransactionProposed {
                tx_id,
                proposer: get_caller_address(),
                target,
                value,
                execution_time
            });

            tx_id
        }

        fn approve_transaction(ref self: ContractState, tx_id: u256) {
            self.access_control.assert_only_role(MULTISIG_ROLE);
            
            let mut tx = self.transactions.read(tx_id);
            assert(!tx.executed && !tx.cancelled, 'Invalid transaction state');
            assert(!self.approvals.read((tx_id, get_caller_address())), 'Already approved');

            tx.approvals += 1;
            self.transactions.write(tx_id, tx);
            self.approvals.write((tx_id, get_caller_address()), true);

            self.emit(TransactionApproved {
                tx_id,
                approver: get_caller_address(),
                approvals: tx.approvals,
                threshold: tx.approval_threshold
            });
        }

        fn execute_transaction(ref self: ContractState, tx_id: u256) {
            self.access_control.assert_only_role(MULTISIG_ROLE);
            self.reentrancy_guard.start();

            let mut tx = self.transactions.read(tx_id);
            assert(!tx.executed && !tx.cancelled, 'Invalid transaction state');
            assert(tx.approvals >= tx.approval_threshold, 'Insufficient approvals');
            assert(get_block_timestamp() >= tx.execution_time, 'Timelock not expired');

            tx.executed = true;
            self.transactions.write(tx_id, tx);

            // Execute the transaction
            // Note: Actual execution would require call_contract_syscall
            
            self.emit(TransactionExecuted {
                tx_id,
                executor: get_caller_address()
            });

            self.reentrancy_guard.end();
        }

        fn cancel_transaction(ref self: ContractState, tx_id: u256) {
            let tx = self.transactions.read(tx_id);
            assert(get_caller_address() == tx.proposer || self.access_control.has_role(ADMIN_ROLE, get_caller_address()), 'Unauthorized');
            assert(!tx.executed && !tx.cancelled, 'Invalid transaction state');

            let mut updated_tx = tx;
            updated_tx.cancelled = true;
            self.transactions.write(tx_id, updated_tx);

            self.emit(TransactionCancelled {
                tx_id,
                canceller: get_caller_address()
            });
        }

        fn emergency_pause(ref self: ContractState, reason: felt252) {
            self.access_control.assert_only_role(EMERGENCY_ROLE);
            self.pausable._pause();
        }

        fn emergency_cancel_all(ref self: ContractState) {
            self.access_control.assert_only_role(EMERGENCY_ROLE);
            // Implementation would cancel all pending transactions
        }

        fn get_transaction(self: @ContractState, tx_id: u256) -> TimelockTransaction {
            self.transactions.read(tx_id)
        }

        fn get_pending_transactions(self: @ContractState) -> Array<u256> {
            let mut pending = ArrayTrait::new();
            let total = self.next_tx_id.read();
            let mut i = 1;
            
            loop {
                if i >= total {
                    break;
                }
                let tx = self.transactions.read(i);
                if !tx.executed && !tx.cancelled {
                    pending.append(i);
                }
                i += 1;
            };
            
            pending
        }

        fn can_execute(self: @ContractState, tx_id: u256) -> bool {
            let tx = self.transactions.read(tx_id);
            !tx.executed && !tx.cancelled && 
            tx.approvals >= tx.approval_threshold && 
            get_block_timestamp() >= tx.execution_time
        }

        fn get_required_approvals(self: @ContractState) -> u32 {
            self.multisig_threshold.read()
        }

        fn update_timelock_delay(ref self: ContractState, new_delay: u64) {
            self.access_control.assert_only_role(ADMIN_ROLE);
            self.timelock_delay.write(new_delay);
        }

        fn add_multisig_member(ref self: ContractState, member: ContractAddress) {
            self.access_control.assert_only_role(ADMIN_ROLE);
            
            assert(!self.multisig_members.read(member), 'Member already exists');
            self.multisig_members.write(member, true);
            self.access_control._grant_role(MULTISIG_ROLE, member);
            self.multisig_count.write(self.multisig_count.read() + 1);
        }

        fn remove_multisig_member(ref self: ContractState, member: ContractAddress) {
            self.access_control.assert_only_role(ADMIN_ROLE);
            
            assert(self.multisig_members.read(member), 'Member not found');
            let new_count = self.multisig_count.read() - 1;
            assert(self.multisig_threshold.read() <= new_count, 'Would break threshold');
            
            self.multisig_members.write(member, false);
            self.access_control._revoke_role(MULTISIG_ROLE, member);
            self.multisig_count.write(new_count);
        }

        fn update_threshold(ref self: ContractState, new_threshold: u32) {
            self.access_control.assert_only_role(ADMIN_ROLE);
            
            let member_count = self.multisig_count.read();
            assert(new_threshold > 0 && new_threshold <= member_count, 'Invalid threshold');
            self.multisig_threshold.write(new_threshold);
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn _hash_data(self: @ContractState, data: Array<felt252>) -> felt252 {
            // Simple hash implementation - in production use proper hashing
            let mut hash: felt252 = 0;
            let mut i = 0;
            loop {
                if i >= data.len() {
                    break;
                }
                hash = hash + *data.at(i);
                i += 1;
            };
            hash
        }
    }
} 