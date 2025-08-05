//! Simple test contract to generate events for indexer testing

use starknet::ContractAddress;

#[starknet::interface]
pub trait ITestEvents<TContractState> {
    fn emit_test_event(ref self: TContractState, message: felt252, value: u256);
    fn get_counter(self: @TContractState) -> u256;
}

#[starknet::contract]
pub mod TestEvents {
    use super::ITestEvents;
    use starknet::ContractAddress;

    #[storage]
    struct Storage {
        counter: u256,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        TestEventEmitted: TestEventEmitted,
        CounterIncremented: CounterIncremented,
    }

    #[derive(Drop, starknet::Event)]
    pub struct TestEventEmitted {
        pub message: felt252,
        pub value: u256,
        pub timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct CounterIncremented {
        pub old_value: u256,
        pub new_value: u256,
    }

    #[constructor]
    fn constructor(ref self: ContractState) {
        self.counter.write(0);
        // Emit an event on deployment
        self.emit(Event::TestEventEmitted(TestEventEmitted {
            message: 'Contract Deployed',
            value: 0,
            timestamp: starknet::get_block_timestamp(),
        }));
    }

    #[abi(embed_v0)]
    impl TestEventsImpl of ITestEvents<ContractState> {
        fn emit_test_event(ref self: ContractState, message: felt252, value: u256) {
            let current_counter = self.counter.read();
            self.counter.write(current_counter + 1);
            
            self.emit(Event::TestEventEmitted(TestEventEmitted {
                message,
                value,
                timestamp: starknet::get_block_timestamp(),
            }));
            
            self.emit(Event::CounterIncremented(CounterIncremented {
                old_value: current_counter,
                new_value: current_counter + 1,
            }));
        }

        fn get_counter(self: @ContractState) -> u256 {
            self.counter.read()
        }
    }
}