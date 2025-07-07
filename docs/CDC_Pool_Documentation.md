# CIRO Network CDC Pool Contract Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture & Integration](#architecture--integration)
3. [Core Features](#core-features)
4. [API Reference](#api-reference)
5. [Worker Management](#worker-management)
6. [Staking & Economics](#staking--economics)
7. [Job Allocation System](#job-allocation-system)
8. [Security & Administration](#security--administration)
9. [Deployment Guide](#deployment-guide)
10. [Integration Examples](#integration-examples)

---

## Overview

The **CDC Pool (Compute Distributed Cluster Pool)** is the central worker management contract in the CIRO Network ecosystem. It coordinates compute resources, manages worker registration, handles CIRO token staking, and provides intelligent job allocation based on worker capabilities and tier status.

### Key Responsibilities

- **Worker Registration**: Capability-based worker onboarding with proof verification
- **CIRO Token Staking**: Secure token staking for worker tier advancement
- **Job Allocation**: Intelligent worker-to-job matching based on requirements
- **Reward Distribution**: Automated CIRO token payments for completed work
- **Reputation Management**: Performance-based reputation scoring system
- **Security Enforcement**: Slashing mechanisms and fraud prevention

---

## Architecture & Integration

### Contract Dependencies

```
CDC Pool
├── CIRO Token Contract ────────── Token operations & tier benefits
├── JobMgr Contract ───────────── Job assignment & completion tracking
├── OpenZeppelin AccessControl ── Role-based security
├── Pausable Contract ─────────── Emergency controls
└── ReentrancyGuard ──────────── Security protection
```

### Integration Points

| Contract | Functions Used | Purpose |
|----------|----------------|---------|
| **CIRO Token** | `transfer()`, `transfer_from()`, `approve()` | Staking deposits & reward payments |
| **JobMgr** | Queries worker tiers & allocation scores | Job assignment optimization |
| **Price Oracle** | `get_ciro_price()` | USD value calculations for tiers |

---

## Core Features

### 🔧 Worker Registration System

- **Capability Declaration**: GPU, CPU, RAM, storage specifications
- **Hardware Features**: CUDA, OpenGL, FP16, tensor cores support
- **Proof Verification**: Resource proof validation and indexing
- **Status Management**: Active, inactive, suspended worker states

### 💰 CIRO Token Staking

- **Flexible Staking**: Variable amounts with optional lock periods
- **USD Value Tracking**: Real-time price oracle integration
- **Tier Progression**: Automatic tier updates based on stake value
- **Unstaking Process**: Time-delayed withdrawal with security checks

### 🎯 Intelligent Job Allocation

- **Capability Matching**: Hardware requirement vs capability scoring
- **Tier-Based Priority**: Higher tiers receive preferential assignment
- **Performance History**: Reputation integration for allocation decisions
- **Load Balancing**: Optimal worker distribution across jobs

### ⭐ Reputation & Performance

- **Multi-Factor Scoring**: Performance, quality, and response time metrics
- **Weighted Averages**: Historical performance with recent bias
- **Tier Requirements**: Minimum reputation thresholds per tier
- **Slashing Integration**: Reputation impact from penalty actions

---

## API Reference

### Worker Management

#### `register_worker(capabilities: WorkerCapabilities, proof_of_resources: Span<felt252>)`

Register a new worker with hardware capabilities and resource proofs.

**Parameters:**

- `capabilities`: Complete hardware specification structure
- `proof_of_resources`: Array of proof hashes for verification

**Requirements:**

- Caller must not be already registered
- Valid capability specifications required
- Proof of resources must be provided

**Example:**

```rust
let capabilities = WorkerCapabilities {
    gpu_memory_gb: 24,
    cpu_cores: 32,
    ram_gb: 128,
    storage_gb: 2000,
    network_bandwidth_mbps: 1000,
    cuda_support: true,
    tensor_cores: true,
    gpu_model: 'RTX4090',
    cpu_model: 'Intel-Xeon'
};
cdc_pool.register_worker(capabilities, array!['proof1', 'proof2'].span());
```

#### `update_worker_capabilities(capabilities: WorkerCapabilities, proof_of_resources: Span<felt252>)`

Update existing worker's hardware capabilities with new proof verification.

#### `get_worker_profile(worker: ContractAddress) -> WorkerProfile`

Retrieve complete worker information including capabilities, status, and performance metrics.

### Staking Operations

#### `stake(amount: u256, lock_period: u64)`

Stake CIRO tokens to increase worker tier and benefits.

**Parameters:**

- `amount`: CIRO tokens to stake (requires prior approval)
- `lock_period`: Optional lock duration in seconds (0 for no lock)

**Requirements:**

- Worker must be registered
- Sufficient CIRO token balance and approval
- Amount must be greater than 0

#### `get_stake_usd_value(worker: ContractAddress) -> u256`

Calculate current USD value of worker's staked CIRO tokens.

#### `request_unstake(amount: u256)`

Initiate token withdrawal process with security delay.

#### `complete_unstake()`

Complete token withdrawal after delay period expires.

### Job Allocation & Scoring

#### `get_worker_tier(worker: ContractAddress) -> WorkerTier`

Get current worker tier based on stake value and reputation.

**Returns:** Worker tier from Basic to Institutional (8 tiers total)

#### `get_tier_allocation_score(worker: ContractAddress, requirements: JobRequirements) -> u32`

Calculate worker suitability score for specific job requirements.

**Returns:** Score from 0-100 based on capability match and tier bonuses

**Scoring Factors:**

- Hardware capability match (60% weight)
- Worker tier bonus (25% weight)
- Reputation score (15% weight)

#### `get_worker_tier_benefits(tier: WorkerTier) -> TierBenefits`

Retrieve tier-specific benefits including bonus percentages and privileges.

### Reward & Reputation

#### `distribute_reward(worker_id: WorkerId, base_reward: u256, performance_bonus: u256)`

Distribute CIRO tokens to worker upon job completion.

**Requirements:**

- Caller must have COORDINATOR_ROLE
- Worker must be active and registered
- Sufficient contract CIRO token balance

#### `update_reputation(worker_id: WorkerId, job_id: u256, performance_score: u32, response_time: u64, quality_score: u32)`

Update worker reputation based on job performance metrics.

**Parameters:**

- `performance_score`: Overall performance rating (0-100)
- `response_time`: Job completion time in seconds
- `quality_score`: Work quality assessment (0-100)

### Security & Administration

#### `slash_worker(worker_id: WorkerId, reason: SlashReason, evidence_hash: felt252)`

Apply penalties to workers for violations or poor performance.

**Slash Reasons:**

- `JOB_ABANDONMENT`: Worker fails to complete assigned jobs
- `POOR_QUALITY`: Consistent low-quality work submissions
- `MISCONDUCT`: Protocol violations or malicious behavior
- `FRAUD`: Fraudulent capability claims
- `SECURITY_BREACH`: Security violations

**Requirements:**

- Caller must have SLASHER_ROLE
- Evidence hash must be provided for audit trail
- Worker must have sufficient stake for slashing

---

## Worker Management

### Worker Tier System

The CDC Pool implements an 8-tier worker classification system based on CIRO token stake value:

| Tier | USD Threshold | Reputation Required | Bonus Rate |
|------|---------------|-------------------|------------|
| **Basic** | $100 | 0 | 100 bps |
| **Premium** | $500 | 100 | 250 bps |
| **Enterprise** | $5,000 | 500 | 500 bps |
| **Infrastructure** | $25,000 | 1,000 | 750 bps |
| **Fleet** | $100,000 | 2,500 | 1000 bps |
| **Datacenter** | $250,000 | 5,000 | 1250 bps |
| **Hyperscale** | $500,000 | 10,000 | 1500 bps |
| **Institutional** | $500,000+ | 25,000 | 2000 bps |

### Worker Lifecycle

```
Registration → Capability Verification → Staking → Tier Assignment → Job Eligibility
     ↓                    ↓                  ↓           ↓              ↓
Proof Required → Hardware Validation → CIRO Tokens → Automatic → Ready for Work
```

### Performance Tracking

Workers are continuously evaluated on:

- **Response Time**: Speed of job acceptance and completion
- **Quality Score**: Work output quality assessment
- **Reliability**: Job completion rate and consistency
- **Availability**: Online time and responsiveness

---

## Staking & Economics

### Staking Mechanism

Workers stake CIRO tokens to:

1. **Demonstrate Commitment**: Economic skin in the game
2. **Advance Tiers**: Higher stakes unlock better job opportunities
3. **Earn Enhanced Rewards**: Tier-based bonus multipliers
4. **Access Premium Features**: Advanced capabilities and priority

### Economic Incentives

```
Higher Stake → Higher Tier → Better Jobs → More Rewards → Reinvestment Cycle
```

### Unstaking Process

1. **Request Phase**: Worker initiates unstaking request
2. **Delay Period**: 7-day security delay (configurable)
3. **Completion**: Tokens returned after delay expires

**Security Features:**

- Slashing protection during delay period
- Partial unstaking support
- Emergency unstaking for slashed workers

---

## Job Allocation System

### Allocation Algorithm

The CDC Pool uses a sophisticated scoring system to match workers with jobs:

```rust
Total Score = (Capability Score × 0.6) + (Tier Bonus × 0.25) + (Reputation × 0.15)
```

### Capability Matching

Jobs specify requirements and workers are scored based on how well their capabilities match:

```rust
pub struct JobRequirements {
    min_gpu_memory_gb: u32,
    min_cpu_cores: u32,
    min_ram_gb: u32,
    requires_cuda: bool,
    requires_tensor_cores: bool,
    estimated_duration_minutes: u32,
}
```

### Scoring Examples

| Worker Capability | Job Requirement | Score Component |
|------------------|-----------------|-----------------|
| 24GB GPU | 16GB required | 100% match |
| 32 CPU cores | 16 cores required | 100% match |
| No CUDA | CUDA required | 0% match |
| RTX 4090 | High-end GPU preferred | Bonus points |

---

## Security & Administration

### Role-Based Access Control

| Role | Permissions | Functions |
|------|-------------|-----------|
| **DEFAULT_ADMIN_ROLE** | Contract administration | All admin functions |
| **COORDINATOR_ROLE** | Job coordination | Reward distribution, reputation updates |
| **SLASHER_ROLE** | Security enforcement | Worker slashing, penalty application |
| **ORACLE_ROLE** | Price updates | CIRO price feed management |

### Security Features

1. **Rate Limiting**: Prevents spam and abuse
2. **Slashing Mechanisms**: Economic penalties for violations
3. **Proof Verification**: Hardware capability validation
4. **Emergency Controls**: Pause/unpause functionality
5. **Reentrancy Protection**: Attack prevention
6. **Timelocked Operations**: Delayed sensitive operations

### Monitoring & Alerts

The contract emits comprehensive events for monitoring:

```rust
#[event]
#[derive(Drop, starknet::Event)]
enum Event {
    WorkerRegistered: WorkerRegistered,
    StakeDeposited: StakeDeposited,
    RewardDistributed: RewardDistributed,
    WorkerSlashed: WorkerSlashed,
    ReputationUpdated: ReputationUpdated,
}
```

---

## Deployment Guide

### Prerequisites

1. **CIRO Token Contract**: Must be deployed and configured
2. **JobMgr Contract**: Required for integration
3. **Price Oracle**: For USD value calculations
4. **Admin Accounts**: For role assignment and configuration

### Deployment Script

```rust
// Deploy CDC Pool
let constructor_args = array![
    admin_address.into(),           // Admin role
    ciro_token_address.into(),      // CIRO token contract
    job_manager_address.into(),     // JobMgr integration
    price_oracle_address.into()     // Price feed
];

let cdc_pool_class = declare("CDCPool").unwrap();
let cdc_pool_address = cdc_pool_class.deploy(@constructor_args).unwrap();
```

### Post-Deployment Configuration

1. **Role Assignment**:

   ```rust
   cdc_pool.grant_role(COORDINATOR_ROLE, job_manager_address);
   cdc_pool.grant_role(SLASHER_ROLE, security_admin_address);
   cdc_pool.grant_role(ORACLE_ROLE, price_oracle_address);
   ```

2. **Parameter Configuration**:

   ```rust
   cdc_pool.update_ciro_price(1000000); // $1.00 initial price
   cdc_pool.configure_unstaking_delay(604800); // 7 days
   ```

3. **Integration Setup**:
   - Register CDC Pool address in JobMgr contract
   - Configure CIRO Token allowances
   - Set up monitoring and alerting

### Testnet Deployment

For testnet deployment, use the provided test configuration:

```rust
// Testnet-specific parameters
const TESTNET_UNSTAKING_DELAY: u64 = 3600; // 1 hour for testing
const TESTNET_MIN_STAKE: u256 = 100000000; // 100 CIRO minimum
```

---

## Integration Examples

### JobMgr Integration

```rust
// In JobMgr contract
impl JobManagerImpl {
    fn assign_job_to_worker(&mut self, job_id: u256, requirements: JobRequirements) {
        // Query CDC Pool for best worker
        let workers = self.cdc_pool.get_eligible_workers(requirements);
        
        for worker in workers {
            let score = self.cdc_pool.get_tier_allocation_score(worker, requirements);
            if score >= 70 { // Minimum acceptable score
                // Assign job to this worker
                self.assign_job(job_id, worker);
                break;
            }
        }
    }
}
```

### CIRO Token Integration

```rust
// Staking workflow
impl WorkerStaking {
    fn stake_tokens(&mut self, amount: u256) {
        // Approve CDC Pool to spend tokens
        self.ciro_token.approve(self.cdc_pool_address, amount);
        
        // Stake in CDC Pool
        self.cdc_pool.stake(amount, 0); // No lock period
        
        // Check new tier
        let new_tier = self.cdc_pool.get_worker_tier(self.worker_address);
    }
}
```

### Frontend Integration

```typescript
// Worker registration via frontend
async function registerWorker(capabilities: WorkerCapabilities) {
    const proofOfResources = await generateResourceProofs(capabilities);
    
    const tx = await cdcPoolContract.register_worker(
        capabilities,
        proofOfResources
    );
    
    await tx.wait();
    return await cdcPoolContract.get_worker_profile(workerAddress);
}
```

---

## Best Practices

### For Workers

1. **Accurate Capabilities**: Provide honest hardware specifications
2. **Maintain Reputation**: Deliver quality work consistently
3. **Stake Strategically**: Balance tier advancement with risk
4. **Stay Active**: Regular participation improves scoring

### For Operators

1. **Monitor Performance**: Track worker metrics and network health
2. **Secure Operations**: Use multi-sig for administrative functions
3. **Regular Updates**: Keep price oracles and parameters current
4. **Emergency Preparedness**: Have response procedures ready

### For Developers

1. **Event Monitoring**: Subscribe to contract events for real-time updates
2. **Error Handling**: Implement robust error handling for all operations
3. **Gas Optimization**: Use batch operations where possible
4. **Security First**: Always validate inputs and handle edge cases

---

## Troubleshooting

### Common Issues

1. **Worker Registration Fails**
   - Check capability specifications are valid
   - Ensure proof of resources is provided
   - Verify worker is not already registered

2. **Staking Transaction Reverts**
   - Confirm CIRO token approval is sufficient
   - Check minimum stake requirements for target tier
   - Verify worker is registered and active

3. **Job Allocation Score Low**
   - Review worker capabilities vs job requirements
   - Consider increasing CIRO stake for tier advancement
   - Improve reputation through quality work delivery

4. **Reward Distribution Fails**
   - Ensure coordinator role is properly assigned
   - Check contract has sufficient CIRO token balance
   - Verify worker is active and eligible

---

## Gas Optimization

### Efficient Operations

- **Batch Operations**: Use batch functions for multiple actions
- **Storage Optimization**: Minimize storage reads/writes
- **Event Efficiency**: Emit only necessary events
- **Calculation Caching**: Cache expensive computations

### Recommended Gas Limits

| Operation | Estimated Gas | Recommended Limit |
|-----------|---------------|-------------------|
| Worker Registration | 200,000 | 300,000 |
| Token Staking | 150,000 | 250,000 |
| Reward Distribution | 100,000 | 200,000 |
| Reputation Update | 80,000 | 150,000 |

---

## Security Considerations

### Audit Recommendations

1. **Formal Verification**: Critical functions should be formally verified
2. **External Audits**: Professional security audit before mainnet
3. **Bug Bounty**: Ongoing incentive program for vulnerability discovery
4. **Monitoring**: Real-time monitoring for suspicious activities

### Known Attack Vectors

1. **Sybil Attacks**: Multiple fake workers from same entity
2. **Capability Fraud**: False hardware capability claims
3. **Collusion**: Workers and job submitters working together
4. **Economic Attacks**: Manipulation of token prices or stakes

### Mitigation Strategies

1. **Proof of Resources**: Hardware verification requirements
2. **Reputation System**: Long-term performance tracking
3. **Slashing Mechanisms**: Economic penalties for violations
4. **Rate Limiting**: Prevent spam and abuse
5. **Oracle Security**: Secure price feed mechanisms

---

## Conclusion

The CDC Pool contract provides a comprehensive worker management system that seamlessly integrates with the CIRO Network ecosystem. Through intelligent job allocation, economic incentives, and robust security measures, it creates a fair and efficient marketplace for distributed compute resources.

The contract is designed for production deployment with enterprise-grade security, comprehensive monitoring, and flexible configuration options. Regular maintenance and monitoring ensure optimal performance and security.

For additional support and updates, refer to the CIRO Network documentation and community resources.

---

*Last Updated: January 2024*  
*Contract Version: v1.0.0*  
*Documentation Version: v1.0.0*
