//! # Blockchain Integration
//!
//! This module handles integration with Starknet blockchain.

pub mod client;
pub mod contracts;
pub mod events;
pub mod types;

pub use client::StarknetClient;
pub use contracts::JobManagerContract;
pub use types::*; 