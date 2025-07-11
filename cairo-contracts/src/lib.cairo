// CIRO Network Smart Contracts
// Main library file for Cairo 2.x smart contracts

mod cdc_pool;
mod ciro_token;
mod job_manager;

mod interfaces {
    pub mod cdc_pool;
    pub mod ciro_token;
    pub mod job_manager;
    pub mod proof_verifier;
    // TODO: Create these interface files when needed
    // mod reputation_manager;
    // mod task_allocator;
}

mod utils {
    pub mod constants;
    pub mod types;
    pub mod security;
    pub mod interactions;
    pub mod governance;
    pub mod upgradability;
}

mod vesting {
    pub mod linear_vesting_with_cliff;
    pub mod milestone_vesting;
    pub mod burn_manager;
    // pub mod treasury_timelock;  // Temporarily disabled due to OpenZeppelin issues
}

mod governance {
    pub mod governance_treasury;
}

// Tests are located in the tests/ directory and managed by snforge