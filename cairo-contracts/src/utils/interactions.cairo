// CIRO Network Contract Interaction Patterns
// Secure patterns for inter-contract communication and coordination

use starknet::ContractAddress;
use starknet::call_contract_syscall;
use starknet::SyscallResultTrait;
use starknet::class_hash::ClassHash;
use starknet::syscalls::library_call_syscall;
use starknet::storage::Map;

/// Safe external call wrapper with error handling
pub fn safe_external_call(
    target: ContractAddress,
    selector: felt252,
    calldata: Array<felt252>
) -> Result<Array<felt252>, felt252> {
    match call_contract_syscall(target, selector, calldata.span()) {
        Result::Ok(response) => Result::Ok(response),
        Result::Err(error) => Result::Err('External call failed'),
    }
}

/// Batch external calls with error handling
pub fn batch_external_calls(
    targets: Array<ContractAddress>,
    selectors: Array<felt252>,
    calldatas: Array<Array<felt252>>
) -> Array<Result<Array<felt252>, felt252>> {
    let mut results = ArrayTrait::new();
    let mut i = 0;
    
    while i < targets.len() {
        let target = *targets.at(i);
        let selector = *selectors.at(i);
        let calldata = calldatas.at(i);
        
        let result = safe_external_call(target, selector, calldata.clone());
        results.append(result);
        i += 1;
    }
    
    results
}

/// Contract registry for managing contract addresses
#[starknet::component]
pub mod ContractRegistryComponent {
    use starknet::ContractAddress;
    use starknet::get_caller_address;

    #[storage]
    #[allow(starknet::invalid_storage_member_types)]
    struct Storage {
        contracts: Map<felt252, ContractAddress>,
        admin: ContractAddress,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        ContractUpdated: ContractUpdated,
    }

    #[derive(Drop, starknet::Event)]
    pub struct ContractUpdated {
        pub name: felt252,
        pub old_address: ContractAddress,
        pub new_address: ContractAddress,
    }

    #[generate_trait]
    pub impl InternalImpl<
        TContractState, +HasComponent<TContractState>
    > of InternalTrait<TContractState> {
        fn initializer(ref self: ComponentState<TContractState>, admin: ContractAddress) {
            self.admin.write(admin);
        }

        fn set_contract(
            ref self: ComponentState<TContractState>,
            name: felt252,
            address: ContractAddress
        ) {
            let caller = get_caller_address();
            assert(caller == self.admin.read(), 'Only admin can set contracts');
            
            let old_address = self.contracts.read(name);
            self.contracts.write(name, address);
            
            self.emit(ContractUpdated { name, old_address, new_address: address });
        }

        fn get_contract(
            self: @ComponentState<TContractState>,
            name: felt252
        ) -> ContractAddress {
            let address = self.contracts.read(name);
            assert(address != ContractAddress::default(), 'Contract not found');
            address
        }

        fn safe_call_contract(
            self: @ComponentState<TContractState>,
            contract_name: felt252,
            selector: felt252,
            calldata: Array<felt252>
        ) -> Result<Array<felt252>, felt252> {
            let contract_address = self.get_contract(contract_name);
            safe_external_call(contract_address, selector, calldata)
        }
    }
}

/// Proxy pattern for upgradeable contracts
#[starknet::component]
pub mod ProxyComponent {
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use starknet::class_hash::ClassHash;
    use starknet::syscalls::library_call_syscall;

    #[storage]
    struct Storage {
        implementation: ClassHash,
        admin: ContractAddress,
        initialized: bool,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        Upgraded: Upgraded,
        AdminChanged: AdminChanged,
    }

    #[derive(Drop, starknet::Event)]
    pub struct Upgraded {
        pub implementation: ClassHash,
    }

    #[derive(Drop, starknet::Event)]
    pub struct AdminChanged {
        pub previous_admin: ContractAddress,
        pub new_admin: ContractAddress,
    }

    #[generate_trait]
    pub impl InternalImpl<
        TContractState, +HasComponent<TContractState>
    > of InternalTrait<TContractState> {
        fn initializer(
            ref self: ComponentState<TContractState>,
            implementation: ClassHash,
            admin: ContractAddress
        ) {
            assert(!self.initialized.read(), 'Already initialized');
            self.implementation.write(implementation);
            self.admin.write(admin);
            self.initialized.write(true);
        }

        fn upgrade(ref self: ComponentState<TContractState>, new_implementation: ClassHash) {
            let caller = get_caller_address();
            assert(caller == self.admin.read(), 'Only admin can upgrade');
            
            self.implementation.write(new_implementation);
            self.emit(Upgraded { implementation: new_implementation });
        }

        fn change_admin(ref self: ComponentState<TContractState>, new_admin: ContractAddress) {
            let caller = get_caller_address();
            assert(caller == self.admin.read(), 'Only admin can change admin');
            
            let previous_admin = self.admin.read();
            self.admin.write(new_admin);
            self.emit(AdminChanged { previous_admin, new_admin });
        }

        fn delegate_call(
            self: @ComponentState<TContractState>,
            selector: felt252,
            calldata: Array<felt252>
        ) -> Array<felt252> {
            let implementation = self.implementation.read();
            library_call_syscall(implementation, selector, calldata.span()).unwrap()
        }

        fn get_implementation(self: @ComponentState<TContractState>) -> ClassHash {
            self.implementation.read()
        }

        fn get_admin(self: @ComponentState<TContractState>) -> ContractAddress {
            self.admin.read()
        }
    }
}

/// Event-based communication system
#[starknet::component]
pub mod EventBusComponent {
    use starknet::ContractAddress;
    use starknet::get_caller_address;

    #[storage]
    #[allow(starknet::invalid_storage_member_types)]
    struct Storage {
        event_nonce: u64,
        event_subscribers: Map<(felt252, ContractAddress), bool>,
        subscriber_count: Map<felt252, u32>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        EventEmitted: EventEmitted,
        SubscriberAdded: SubscriberAdded,
        SubscriberRemoved: SubscriberRemoved,
    }

    #[derive(Drop, starknet::Event)]
    pub struct EventEmitted {
        pub event_type: felt252,
        pub data: Array<felt252>,
        pub nonce: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct SubscriberAdded {
        pub event_type: felt252,
        pub subscriber: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    pub struct SubscriberRemoved {
        pub event_type: felt252,
        pub subscriber: ContractAddress,
    }

    #[generate_trait]
    pub impl InternalImpl<
        TContractState, +HasComponent<TContractState>
    > of InternalTrait<TContractState> {
        fn subscribe(
            ref self: ComponentState<TContractState>,
            event_type: felt252,
            subscriber: ContractAddress
        ) {
            if !self.event_subscribers.read((event_type, subscriber)) {
                self.event_subscribers.write((event_type, subscriber), true);
                let count = self.subscriber_count.read(event_type);
                self.subscriber_count.write(event_type, count + 1);
                
                self.emit(SubscriberAdded { event_type, subscriber });
            }
        }

        fn unsubscribe(
            ref self: ComponentState<TContractState>,
            event_type: felt252,
            subscriber: ContractAddress
        ) {
            if self.event_subscribers.read((event_type, subscriber)) {
                self.event_subscribers.write((event_type, subscriber), false);
                let count = self.subscriber_count.read(event_type);
                self.subscriber_count.write(event_type, count - 1);
                
                self.emit(SubscriberRemoved { event_type, subscriber });
            }
        }

        fn emit_event(
            ref self: ComponentState<TContractState>,
            event_type: felt252,
            data: Array<felt252>
        ) {
            let nonce = self.event_nonce.read();
            self.event_nonce.write(nonce + 1);
            
            self.emit(EventEmitted { event_type, data, nonce });
        }

        fn is_subscribed(
            self: @ComponentState<TContractState>,
            event_type: felt252,
            subscriber: ContractAddress
        ) -> bool {
            self.event_subscribers.read((event_type, subscriber))
        }

        fn get_subscriber_count(
            self: @ComponentState<TContractState>,
            event_type: felt252
        ) -> u32 {
            self.subscriber_count.read(event_type)
        }
    }
}

/// Circuit breaker pattern for emergency stops
#[starknet::component]
pub mod CircuitBreakerComponent {
    use starknet::ContractAddress;
    use starknet::get_caller_address;

    #[storage]
    struct Storage {
        circuit_broken: bool,
        failure_count: u32,
        last_failure_time: u64,
        failure_threshold: u32,
        recovery_timeout: u64,
        admin: ContractAddress,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        CircuitBroken: CircuitBroken,
        CircuitReset: CircuitReset,
        FailureRecorded: FailureRecorded,
    }

    #[derive(Drop, starknet::Event)]
    pub struct CircuitBroken {
        pub failure_count: u32,
        pub timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct CircuitReset {
        pub timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct FailureRecorded {
        pub failure_count: u32,
        pub timestamp: u64,
    }

    #[generate_trait]
    pub impl InternalImpl<
        TContractState, +HasComponent<TContractState>
    > of InternalTrait<TContractState> {
        fn initializer(
            ref self: ComponentState<TContractState>,
            admin: ContractAddress,
            failure_threshold: u32,
            recovery_timeout: u64
        ) {
            self.admin.write(admin);
            self.failure_threshold.write(failure_threshold);
            self.recovery_timeout.write(recovery_timeout);
            self.circuit_broken.write(false);
            self.failure_count.write(0);
        }

        fn record_failure(ref self: ComponentState<TContractState>) {
            let current_time = starknet::get_block_timestamp();
            let failure_count = self.failure_count.read() + 1;
            
            self.failure_count.write(failure_count);
            self.last_failure_time.write(current_time);
            
            self.emit(FailureRecorded { failure_count, timestamp: current_time });
            
            // Break circuit if threshold reached
            if failure_count >= self.failure_threshold.read() {
                self.circuit_broken.write(true);
                self.emit(CircuitBroken { failure_count, timestamp: current_time });
            }
        }

        fn reset_circuit(ref self: ComponentState<TContractState>) {
            let caller = get_caller_address();
            assert(caller == self.admin.read(), 'Only admin can reset circuit');
            
            self.circuit_broken.write(false);
            self.failure_count.write(0);
            
            let current_time = starknet::get_block_timestamp();
            self.emit(CircuitReset { timestamp: current_time });
        }

        fn check_circuit(self: @ComponentState<TContractState>) -> bool {
            if !self.circuit_broken.read() {
                return true;
            }
            
            // Check if recovery timeout has passed
            let current_time = starknet::get_block_timestamp();
            let recovery_time = self.last_failure_time.read() + self.recovery_timeout.read();
            
            if current_time >= recovery_time {
                // Auto-reset circuit after timeout
                return true;
            }
            
            false
        }

        fn assert_circuit_closed(self: @ComponentState<TContractState>) {
            assert(self.check_circuit(), 'Circuit breaker is open');
        }

        fn is_circuit_broken(self: @ComponentState<TContractState>) -> bool {
            self.circuit_broken.read()
        }
    }
}

/// Multi-signature pattern for critical operations
#[starknet::component]
pub mod MultiSigComponent {
    use starknet::ContractAddress;
    use starknet::get_caller_address;

    #[storage]
    #[allow(starknet::invalid_storage_member_types)]
    struct Storage {
        owners: Map<ContractAddress, bool>,
        owner_count: u32,
        required_confirmations: u32,
        transaction_count: u32,
        transactions: Map<u32, Transaction>,
        confirmations: Map<(u32, ContractAddress), bool>,
        confirmation_count: Map<u32, u32>,
    }

    #[derive(Drop, Serde, starknet::Store)]
    pub struct Transaction {
        pub to: ContractAddress,
        pub selector: felt252,
        pub calldata: Array<felt252>,
        pub executed: bool,
        pub timestamp: u64,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        TransactionSubmitted: TransactionSubmitted,
        TransactionConfirmed: TransactionConfirmed,
        TransactionExecuted: TransactionExecuted,
        OwnerAdded: OwnerAdded,
        OwnerRemoved: OwnerRemoved,
    }

    #[derive(Drop, starknet::Event)]
    pub struct TransactionSubmitted {
        pub transaction_id: u32,
        pub to: ContractAddress,
        pub selector: felt252,
        pub owner: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    pub struct TransactionConfirmed {
        pub transaction_id: u32,
        pub owner: ContractAddress,
        pub confirmation_count: u32,
    }

    #[derive(Drop, starknet::Event)]
    pub struct TransactionExecuted {
        pub transaction_id: u32,
        pub to: ContractAddress,
        pub selector: felt252,
    }

    #[derive(Drop, starknet::Event)]
    pub struct OwnerAdded {
        pub owner: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    pub struct OwnerRemoved {
        pub owner: ContractAddress,
    }

    #[generate_trait]
    pub impl InternalImpl<
        TContractState, +HasComponent<TContractState>
    > of InternalTrait<TContractState> {
        fn initializer(
            ref self: ComponentState<TContractState>,
            owners: Array<ContractAddress>,
            required_confirmations: u32
        ) {
            assert(owners.len() > 0, 'At least one owner required');
            assert(required_confirmations > 0, 'At least one confirmation required');
            assert(required_confirmations <= owners.len(), 'Too many confirmations required');
            
            let mut i = 0;
            while i < owners.len() {
                let owner = *owners.at(i);
                self.owners.write(owner, true);
                i += 1;
            }
            
            self.owner_count.write(owners.len());
            self.required_confirmations.write(required_confirmations);
        }

        fn submit_transaction(
            ref self: ComponentState<TContractState>,
            to: ContractAddress,
            selector: felt252,
            calldata: Array<felt252>
        ) -> u32 {
            let caller = get_caller_address();
            assert(self.owners.read(caller), 'Only owners can submit transactions');
            
            let transaction_id = self.transaction_count.read();
            self.transaction_count.write(transaction_id + 1);
            
            let transaction = Transaction {
                to,
                selector,
                calldata,
                executed: false,
                timestamp: starknet::get_block_timestamp(),
            };
            
            self.transactions.write(transaction_id, transaction);
            
            // Auto-confirm by submitter
            self.confirmations.write((transaction_id, caller), true);
            self.confirmation_count.write(transaction_id, 1);
            
            self.emit(TransactionSubmitted { transaction_id, to, selector, owner: caller });
            self.emit(TransactionConfirmed { transaction_id, owner: caller, confirmation_count: 1 });
            
            transaction_id
        }

        fn confirm_transaction(
            ref self: ComponentState<TContractState>,
            transaction_id: u32
        ) {
            let caller = get_caller_address();
            assert(self.owners.read(caller), 'Only owners can confirm transactions');
            assert(!self.confirmations.read((transaction_id, caller)), 'Already confirmed');
            
            let transaction = self.transactions.read(transaction_id);
            assert(!transaction.executed, 'Transaction already executed');
            
            self.confirmations.write((transaction_id, caller), true);
            let confirmation_count = self.confirmation_count.read(transaction_id) + 1;
            self.confirmation_count.write(transaction_id, confirmation_count);
            
            self.emit(TransactionConfirmed { transaction_id, owner: caller, confirmation_count });
        }

        fn execute_transaction(
            ref self: ComponentState<TContractState>,
            transaction_id: u32
        ) {
            let caller = get_caller_address();
            assert(self.owners.read(caller), 'Only owners can execute transactions');
            
            let mut transaction = self.transactions.read(transaction_id);
            assert(!transaction.executed, 'Transaction already executed');
            
            let confirmation_count = self.confirmation_count.read(transaction_id);
            assert(confirmation_count >= self.required_confirmations.read(), 'Not enough confirmations');
            
            transaction.executed = true;
            self.transactions.write(transaction_id, transaction);
            
            // Execute the transaction
            call_contract_syscall(
                transaction.to,
                transaction.selector,
                transaction.calldata.span()
            ).unwrap();
            
            self.emit(TransactionExecuted { 
                transaction_id, 
                to: transaction.to, 
                selector: transaction.selector 
            });
        }

        fn is_owner(self: @ComponentState<TContractState>, address: ContractAddress) -> bool {
            self.owners.read(address)
        }

        fn get_confirmation_count(self: @ComponentState<TContractState>, transaction_id: u32) -> u32 {
            self.confirmation_count.read(transaction_id)
        }

        fn is_confirmed(
            self: @ComponentState<TContractState>,
            transaction_id: u32,
            owner: ContractAddress
        ) -> bool {
            self.confirmations.read((transaction_id, owner))
        }
    }
} 