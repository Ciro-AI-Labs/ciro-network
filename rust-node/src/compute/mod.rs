//! # Compute Engine
//!
//! This module handles job execution and compute resource management.

pub mod executor;
pub mod containers;
pub mod gpu;
pub mod verification;

pub use executor::ComputeExecutor; 