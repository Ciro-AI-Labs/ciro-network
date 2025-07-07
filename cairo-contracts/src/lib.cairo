// CIRO Network Smart Contracts
// Main library file for Cairo 2.x smart contracts

pub mod interfaces {
    pub mod cdc_pool;
    pub mod job_manager;
    pub mod ciro_token;
    pub mod paymaster;
    pub mod proof_verifier;  // NEW: ZK proof generation & verification
}

pub mod utils {
    pub mod constants;
    pub mod security;
    pub mod types;
    pub mod storage;
    pub mod interactions;
    pub mod governance;
    pub mod upgradability;
}

// Core contract implementations
pub mod job_manager;
pub mod cdc_pool;
pub mod ciro_token;

// Vesting and tokenomics system (directory-based module) 
// TODO: Temporarily disabled due to OpenZeppelin 0.20.0 compatibility issues
// These contracts need storage access trait updates and component structure changes
// Will be re-enabled in separate vesting update task
// pub mod vesting {
//     pub mod linear_vesting_with_cliff;
//     pub mod milestone_vesting;
//     pub mod burn_manager;
//     pub mod treasury_timelock;
// }

#[cfg(test)]
pub mod tests; 