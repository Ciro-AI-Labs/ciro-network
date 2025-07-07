# CIRO Token v3.1 - Enhanced Security Implementation

## Overview

The CIRO Token is the core utility token for the CIRO Network, a decentralized
AI computation platform. This implementation includes comprehensive security
features, progressive governance, worker tier economics, and anti-manipulation
mechanisms.

## 🏗️ Architecture

### Core Components

1. **ERC20 Token**: Standard token functionality with 18 decimals
2. **Worker Tier System**: 8-tier staking system with realistic capital
   deployment thresholds
3. **Progressive Governance**: Time-weighted voting with security measures
4. **Tokenomics Engine**: Automated burn/mint mechanics based on network revenue
5. **Security Framework**: Comprehensive security monitoring and emergency
   systems

### Contract Structure

```
cairo-contracts/
├── src/
│   ├── ciro_token.cairo              # Main token contract
│   ├── interfaces/
│   │   ├── ciro_token.cairo          # Token interface definitions
│   │   ├── job_manager.cairo         # JobManager integration
│   │   ├── cdc_pool.cairo            # CDC Pool integration
│   │   └── paymaster.cairo           # Paymaster integration
│   └── constants.cairo               # Network constants
├── tests/
│   └── ciro_token_test.cairo         # Comprehensive test suite
├── scripts/
│   └── deploy_ciro_token.cairo       # Deployment script
└── README.md                         # This documentation
```

## 🔒 Security Features (v3.1)

### Rate Limiting

- **Inflation Adjustments**: Maximum 2 adjustments per month
- **Transfer Rate Limiting**: 1M tokens per hour per user
- **Large Transfer Controls**: 100K+ token transfers require 2-hour delay

### Anti-Manipulation

- **Large Transfer Queue**: Delayed execution for whale movements
- **Suspicious Activity Monitoring**: Automated threat detection
- **Emergency Council**: Multi-signature emergency response

### Audit & Monitoring

- **Security Audit System**: Regular audit submission and tracking
- **Security Score Monitoring**: Real-time security health tracking
- **Emergency Operation Logging**: Comprehensive emergency action tracking

### Upgradability & Timelock

- **Authorized Upgrades**: Council-approved contract upgrades
- **Critical Operation Timelock**: Time delays for sensitive operations
- **Version Tracking**: Contract version management

## 💰 Tokenomics v3.1

### Supply Management

- **Total Supply**: 1 billion CIRO tokens (fixed)
- **Initial Circulation**: 15% (150M tokens)
- **Progressive Burn**: 30% → 50% → 70% → 80% of revenue over 5 years
- **Revenue-Token Linkage**: 70% of network revenue → automatic burn

### Worker Tier System

| Tier           | USD Threshold | Allocation Multiplier | Performance Bonus |
| -------------- | ------------- | --------------------- | ----------------- |
| Basic          | $100          | 1.0x                  | 5%                |
| Premium        | $500          | 1.2x                  | 10%               |
| Enterprise     | $2,500        | 1.5x                  | 15%               |
| Infrastructure | $10,000       | 2.0x                  | 25%               |
| Fleet          | $50,000       | 2.5x                  | 30%               |
| Datacenter     | $100,000      | 3.0x                  | 35%               |
| Hyperscale     | $250,000      | 4.0x                  | 40%               |
| Institutional  | $500,000      | 5.0x                  | 50%               |

### Large Holder Tiers

| Tier        | CIRO Threshold | USD Threshold | Benefits                   |
| ----------- | -------------- | ------------- | -------------------------- |
| Whale       | 5M+ CIRO       | $2M+ USD      | Enhanced governance rights |
| Institution | 25M+ CIRO      | $10M+ USD     | Protocol governance access |
| HyperWhale  | 100M+ CIRO     | $50M+ USD     | Strategic decision rights  |

## 🗳️ Governance System

### Progressive Governance Rights

- **Basic Tier**: Standard voting power (1.0x multiplier)
- **Long-term Holders (1+ years)**: 1.2x voting power multiplier
- **Veteran Holders (2+ years)**: 1.5x voting power multiplier

### Proposal Types & Thresholds

- **Minor Changes**: 50K CIRO required
- **Major Changes**: 250K CIRO required
- **Protocol Upgrades**: 1M CIRO required
- **Emergency Actions**: 2.5M CIRO required
- **Strategic Decisions**: 5M CIRO required

### Security Measures

- **Proposal Cooldown**: 24-hour minimum between proposals
- **Active Proposal Limit**: Maximum 3 proposals per user
- **Quorum Requirements**: 5% of total supply must participate
- **Supermajority**: 67% approval for critical proposals
- **Emergency Pause**: Council can pause governance for security

## 🔧 API Reference

### Core ERC20 Functions

```cairo
// Standard ERC20
fn name() -> felt252
fn symbol() -> felt252
fn decimals() -> u8
fn total_supply() -> u256
fn balance_of(account: ContractAddress) -> u256
fn transfer(recipient: ContractAddress, amount: u256) -> bool
fn approve(spender: ContractAddress, amount: u256) -> bool
fn allowance(owner: ContractAddress, spender: ContractAddress) -> u256
```

### Worker Tier Functions

```cairo
// Worker tier management
fn get_worker_tier(account: ContractAddress) -> WorkerTier
fn get_worker_tier_benefits(account: ContractAddress) -> WorkerTierBenefits
fn calculate_allocation_priority(account: ContractAddress) -> u32
```

### Governance Functions

```cairo
// Enhanced governance
fn create_typed_proposal(description: felt252, proposal_type: u32,
                        inflation_change: i32, burn_rate_change: i32) -> u256
fn vote_on_proposal(proposal_id: u256, vote_for: bool, voting_power: u256)
fn execute_proposal(proposal_id: u256)
fn get_governance_rights(account: ContractAddress) -> GovernanceRights
fn get_governance_stats() -> GovernanceStats
```

### Security Functions

```cairo
// Rate limiting and security
fn check_inflation_adjustment_rate_limit() -> (bool, u64, u32)
fn submit_security_audit(findings_count: u32, security_score: u32,
                        critical_issues: u32, recommendations: felt252)
fn initiate_large_transfer(to: ContractAddress, amount: u256) -> u256
fn execute_large_transfer(transfer_id: u256)
fn batch_transfer(recipients: Array<ContractAddress>, amounts: Array<u256>) -> bool
fn report_suspicious_activity(activity_type: felt252, severity: u32)
```

### Emergency Functions

```cairo
// Emergency operations
fn emergency_governance_pause(duration: u64)
fn resume_governance()
fn emergency_withdraw(amount: u256, justification: felt252)
fn log_emergency_operation(operation_type: felt252, details: felt252)
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
scarb test

# Run specific test categories
scarb test test_worker_tier
scarb test test_governance
scarb test test_security
scarb test test_tokenomics
```

### Test Coverage

The test suite covers:

- ✅ ERC20 functionality
- ✅ Worker tier calculations
- ✅ Governance proposal lifecycle
- ✅ Security rate limiting
- ✅ Large transfer mechanisms
- ✅ Emergency operations
- ✅ Tokenomics integration
- ✅ Complete user journeys

## 🚀 Deployment

### Prerequisites

1. **Cairo/Starknet Environment**: Set up Cairo development environment
2. **Network Configuration**: Configure target network (mainnet/testnet)
3. **Security Council**: Set up emergency council addresses
4. **Integration Addresses**: JobManager, CDC Pool, Paymaster contracts

### Deployment Steps

1. **Configure Deployment Parameters**:

   ```cairo
   // Update in deploy_ciro_token.cairo
   const OWNER_ADDRESS = 0x...; // Your owner address
   const JOB_MANAGER_ADDRESS = 0x...; // JobManager contract
   const CDC_POOL_ADDRESS = 0x...; // CDC Pool contract
   const PAYMASTER_ADDRESS = 0x...; // Paymaster contract
   ```

2. **Run Deployment Script**:

   ```bash
   # For mainnet
   scarb run deploy_mainnet

   # For testnet
   scarb run deploy_testnet
   ```

3. **Post-Deployment Configuration**:
   - Configure emergency council
   - Submit initial security audit
   - Create initial governance proposal
   - Initialize worker tier system

### Security Checklist

#### Pre-Deployment

- [ ] Code review completed
- [ ] All tests passing
- [ ] Security audit conducted
- [ ] Emergency council configured
- [ ] Deployment parameters verified

#### Post-Deployment

- [ ] Contract deployment verified
- [ ] Security settings configured
- [ ] Emergency council initialized
- [ ] Initial governance proposal created
- [ ] Integration testing completed

## 🔍 Security Considerations

### Rate Limiting

- **Transfer Limits**: Monitor user transfer patterns for abuse
- **Governance Limits**: Prevent governance spam attacks
- **Inflation Limits**: Protect against economic manipulation

### Emergency Procedures

- **Governance Pause**: Emergency council can pause governance
- **Contract Pause**: Emergency pause for critical issues
- **Emergency Withdrawal**: Controlled emergency fund access

### Monitoring Requirements

- **Large Transfers**: Monitor transfers >100K tokens
- **Governance Activity**: Track all proposal and voting activity
- **Security Scores**: Regular audit score updates
- **Suspicious Activity**: Automated threat detection

## 📊 Gas Optimization

### Implemented Optimizations

- **Batch Operations**: Multiple transfers in single transaction
- **Storage Optimization**: Efficient storage layout
- **Event Optimization**: Minimal event emission
- **Computation Caching**: Cache frequently accessed values

### Gas Usage Estimates

- **Standard Transfer**: ~50,000 gas
- **Governance Vote**: ~80,000 gas
- **Batch Transfer (10x)**: ~300,000 gas
- **Large Transfer Initiation**: ~100,000 gas

## 🤝 Integration Guide

### JobManager Integration

```cairo
// Collect fees from job completion
fn collect_job_fee(amount: u256, job_id: u256)

// Distribute rewards to workers
fn distribute_rewards(workers: Array<ContractAddress>, amounts: Array<u256>)
```

### CDC Pool Integration

```cairo
// Worker registration with tier verification
fn register_worker(worker: ContractAddress) -> WorkerTier

// Calculate staking rewards based on tier
fn calculate_staking_rewards(worker: ContractAddress) -> u256
```

### Paymaster Integration

```cairo
// Gas-free transactions
fn pay_gas_fee(user: ContractAddress, gas_cost: u256) -> bool

// Sponsored transaction limits
fn check_sponsorship_eligibility(user: ContractAddress) -> bool
```

## 📈 Performance Monitoring

### Key Metrics

- **Transaction Throughput**: Transactions per second
- **Gas Efficiency**: Average gas per operation
- **Security Score**: Current security health (0-100)
- **Governance Participation**: Voting participation rate
- **Worker Distribution**: Tier distribution statistics

### Monitoring Tools

- **Event Indexing**: Index all contract events
- **Performance Dashboards**: Real-time metrics
- **Security Alerts**: Automated threat notifications
- **Governance Tracking**: Proposal and voting analytics

## 🆘 Emergency Procedures

### Emergency Contacts

- **Primary Security Council**: <emergency@cironetwork.ai>
- **Technical Emergency**: <tech-emergency@cironetwork.ai>
- **Governance Issues**: <governance@cironetwork.ai>

### Emergency Response

1. **Immediate Response**: Emergency council assessment
2. **Security Pause**: Activate emergency pause if needed
3. **Community Communication**: Notify community of issue
4. **Resolution Implementation**: Deploy fixes via governance
5. **Post-Incident Review**: Comprehensive security review

## �� Changelog

### v3.1.0 (Current)

- ✅ Enhanced security features
- ✅ Rate limiting implementation
- ✅ Large transfer controls
- ✅ Emergency operation logging
- ✅ Comprehensive audit system
- ✅ Gas optimization features
- ✅ Batch transfer operations
- ✅ Upgradability framework

### v3.0.0 (Previous)

- ✅ Core tokenomics implementation
- ✅ Worker tier system
- ✅ Basic governance functionality
- ✅ Revenue burn mechanics

## 🤝 Contributing

### Development Setup

1. Clone the repository
2. Install Cairo development environment
3. Run tests to verify setup
4. Create feature branch for changes
5. Submit pull request with tests

### Security Contributions

- Report security issues privately to <security@cironetwork.ai>
- Include detailed reproduction steps
- Provide suggested fixes if possible
- Allow 90 days for fix before public disclosure

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for
details.

## 🔗 Links

- **Documentation**: <https://docs.cironetwork.ai>
- **Community**: <https://discord.gg/cironetwork>
- **Security**: <https://security.cironetwork.ai>
- **Governance**: <https://governance.cironetwork.ai>
- **GitHub**: <https://github.com/cironetwork/contracts>

---

**⚠️ Security Notice**: This contract handles financial assets. Always conduct
thorough testing and security audits before deployment. The emergency council
should be a secure multi-signature wallet.

**🔍 Audit Status**: Contract has been audited for security vulnerabilities.
Latest audit report available at <https://audits.cironetwork.ai>
