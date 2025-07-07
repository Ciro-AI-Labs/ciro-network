// CIRO Network Utilities Module
// Shared data structures, storage patterns, and optimization utilities

pub mod constants;
pub mod types;
pub mod storage;
pub mod security;
pub mod interactions;
pub mod governance;
pub mod upgradability;

// Re-export commonly used utilities
pub use storage::{IterableMapping, DynamicArray, PackedFlags};
pub use constants::*;
pub use types::*;
pub use security::{
    AccessControlComponent, ReentrancyGuardComponent, PausableComponent,
    StakeAuthComponent, ReputationComponent, signature_utils, timelock_utils, rate_limit_utils
};
pub use interactions::{
    ContractRegistryComponent, ProxyComponent, EventBusComponent, 
    CircuitBreakerComponent, MultiSigComponent, safe_external_call, batch_external_calls
}; 