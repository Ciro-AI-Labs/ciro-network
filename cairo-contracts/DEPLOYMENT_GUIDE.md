# CIRO Network Smart Contracts - MVP Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the CIRO Network
smart contracts for MVP development with full upgrade capabilities. The
contracts are deployed using proxy patterns to enable seamless upgrades while
preserving state and addresses.

## Architecture Overview

The CIRO Network DePIN platform consists of three core contracts:

1. **CIRO Token** - ERC20 token with governance and tokenomics
2. **Job Manager** - Manages compute job lifecycle and worker assignments
3. **CDC Pool** - Manages worker registration, staking, and rewards

## Upgrade Strategy

Instead of modifying contract code, we use **proxy deployment patterns** which
provide:

- ✅ **Immediate Deployment** - Deploy current contracts without code changes
- ✅ **Zero Downtime Upgrades** - Upgrade implementation while preserving state
- ✅ **Preserved Addresses** - Users always interact with the same contract
  addresses
- ✅ **State Preservation** - All data persists through upgrades
- ✅ **Emergency Controls** - Admin functions for critical situations

### Supported Upgrade Patterns

1. **Transparent Proxy** - Standard upgradeable proxy (recommended for most
   contracts)
2. **UUPS Proxy** - Universal Upgradeable Proxy Standard (gas efficient)
3. **Diamond Proxy** - Modular upgrades for complex contracts
4. **Beacon Proxy** - Centralized upgrade management

## Prerequisites

### Development Environment

```bash
# Cairo and Starknet tools
curl -L https://install.cairo-lang.org | bash
starkli --version

# Scarb build system
curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh
scarb --version
```

### Network Configuration

```bash
# Mainnet
export STARKNET_RPC="https://starknet-mainnet.public.blastapi.io"
export NETWORK="mainnet"

# Testnet (for testing)
export STARKNET_RPC="https://starknet-goerli.public.blastapi.io"
export NETWORK="goerli"
```

### Account Setup

```bash
# Create deployment account
starkli account oz init --keystore deployment-key
starkli account deploy --keystore deployment-key --network $NETWORK

# Set environment variables
export DEPLOYER_ADDRESS="your_account_address"
export DEPLOYER_KEYSTORE="deployment-key"
```

## Deployment Steps

### Step 1: Build Contracts

```bash
# Clean and build
scarb clean
scarb build

# Verify successful compilation
ls target/dev/
```

### Step 2: Deploy Implementation Contracts

Deploy the core logic contracts (these will be proxied):

```bash
# Deploy CIRO Token implementation
CIRO_TOKEN_CLASS=$(starkli declare \
  --keystore $DEPLOYER_KEYSTORE \
  --network $NETWORK \
  target/dev/ciro_contracts_CIROToken.contract_class.json)

# Deploy Job Manager implementation
JOB_MANAGER_CLASS=$(starkli declare \
  --keystore $DEPLOYER_KEYSTORE \
  --network $NETWORK \
  target/dev/ciro_contracts_JobManagerContract.contract_class.json)

# Deploy CDC Pool implementation
CDC_POOL_CLASS=$(starkli declare \
  --keystore $DEPLOYER_KEYSTORE \
  --network $NETWORK \
  target/dev/ciro_contracts_CDCPool.contract_class.json)
```

### Step 3: Deploy Proxy Contracts

Create proxy contracts that point to the implementations:

#### Option A: Transparent Proxy (Recommended)

```bash
# Deploy transparent proxy for CIRO Token
CIRO_TOKEN_PROXY=$(starkli deploy \
  --keystore $DEPLOYER_KEYSTORE \
  --network $NETWORK \
  $TRANSPARENT_PROXY_CLASS \
  $CIRO_TOKEN_CLASS \
  $DEPLOYER_ADDRESS \  # Admin address
  0x0)  # No initializer data

# Deploy transparent proxy for Job Manager
JOB_MANAGER_PROXY=$(starkli deploy \
  --keystore $DEPLOYER_KEYSTORE \
  --network $NETWORK \
  $TRANSPARENT_PROXY_CLASS \
  $JOB_MANAGER_CLASS \
  $DEPLOYER_ADDRESS \
  0x0)

# Deploy transparent proxy for CDC Pool
CDC_POOL_PROXY=$(starkli deploy \
  --keystore $DEPLOYER_KEYSTORE \
  --network $NETWORK \
  $TRANSPARENT_PROXY_CLASS \
  $CDC_POOL_CLASS \
  $DEPLOYER_ADDRESS \
  0x0)
```

#### Option B: UUPS Proxy (Gas Efficient)

```bash
# Deploy UUPS proxy contracts
# Note: UUPS requires implementation contracts to have upgrade logic built-in
```

### Step 4: Initialize Contracts

Initialize the deployed proxy contracts:

```bash
# Initialize CIRO Token
starkli invoke \
  --keystore $DEPLOYER_KEYSTORE \
  --network $NETWORK \
  $CIRO_TOKEN_PROXY \
  initialize \
  $DEPLOYER_ADDRESS  # Admin address

# Initialize Job Manager
starkli invoke \
  --keystore $DEPLOYER_KEYSTORE \
  --network $NETWORK \
  $JOB_MANAGER_PROXY \
  initialize \
  $DEPLOYER_ADDRESS \  # Admin
  $CIRO_TOKEN_PROXY \  # CIRO token address
  $CDC_POOL_PROXY     # CDC pool address

# Initialize CDC Pool
starkli invoke \
  --keystore $DEPLOYER_KEYSTORE \
  --network $NETWORK \
  $CDC_POOL_PROXY \
  initialize \
  $DEPLOYER_ADDRESS \  # Admin
  $CIRO_TOKEN_PROXY \  # CIRO token address
  $JOB_MANAGER_PROXY  # Job manager address
```

### Step 5: Verify Deployment

```bash
# Check contract states
starkli call $CIRO_TOKEN_PROXY name
starkli call $JOB_MANAGER_PROXY get_admin
starkli call $CDC_POOL_PROXY get_admin

# Verify proxy implementations
starkli call $CIRO_TOKEN_PROXY get_implementation
starkli call $JOB_MANAGER_PROXY get_implementation
starkli call $CDC_POOL_PROXY get_implementation
```

## Contract Addresses (Save These!)

After successful deployment, record these addresses:

```bash
# Core Contract Proxies (USE THESE IN YOUR DAPP)
CIRO_TOKEN_ADDRESS=$CIRO_TOKEN_PROXY
JOB_MANAGER_ADDRESS=$JOB_MANAGER_PROXY
CDC_POOL_ADDRESS=$CDC_POOL_PROXY

# Implementation Contracts (for upgrade reference)
CIRO_TOKEN_IMPL=$CIRO_TOKEN_CLASS
JOB_MANAGER_IMPL=$JOB_MANAGER_CLASS
CDC_POOL_IMPL=$CDC_POOL_CLASS

# Save to file
cat > deployment.json << EOF
{
  "network": "$NETWORK",
  "deployed_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "contracts": {
    "ciro_token": {
      "proxy": "$CIRO_TOKEN_PROXY",
      "implementation": "$CIRO_TOKEN_CLASS"
    },
    "job_manager": {
      "proxy": "$JOB_MANAGER_PROXY",
      "implementation": "$JOB_MANAGER_CLASS"
    },
    "cdc_pool": {
      "proxy": "$CDC_POOL_PROXY",
      "implementation": "$CDC_POOL_CLASS"
    }
  }
}
EOF
```

## Performing Upgrades

When you need to upgrade contracts (add features, fix bugs, etc.):

### Step 1: Deploy New Implementation

```bash
# Build updated contracts
scarb build

# Deploy new implementation
NEW_IMPLEMENTATION=$(starkli declare \
  --keystore $DEPLOYER_KEYSTORE \
  --network $NETWORK \
  target/dev/ciro_contracts_UpdatedContract.contract_class.json)
```

### Step 2: Upgrade Proxy

```bash
# Upgrade the proxy to point to new implementation
starkli invoke \
  --keystore $DEPLOYER_KEYSTORE \
  --network $NETWORK \
  $CONTRACT_PROXY \
  upgrade \
  $NEW_IMPLEMENTATION
```

### Step 3: Verify Upgrade

```bash
# Verify new implementation is active
starkli call $CONTRACT_PROXY get_implementation

# Test new functionality
starkli call $CONTRACT_PROXY new_function_name
```

## Security Considerations

### Multi-Signature Setup (Recommended)

```bash
# Deploy multi-sig wallet for admin functions
MULTISIG_ADDRESS=$(starkli deploy \
  --keystore $DEPLOYER_KEYSTORE \
  --network $NETWORK \
  $MULTISIG_CLASS \
  $ADMIN1_ADDRESS \
  $ADMIN2_ADDRESS \
  $ADMIN3_ADDRESS \
  2)  # Require 2 of 3 signatures

# Transfer admin rights to multi-sig
starkli invoke \
  --keystore $DEPLOYER_KEYSTORE \
  --network $NETWORK \
  $CONTRACT_PROXY \
  transfer_admin \
  $MULTISIG_ADDRESS
```

### Timelock Setup (Production)

```bash
# Deploy timelock contract with 48-hour delay
TIMELOCK_ADDRESS=$(starkli deploy \
  --keystore $DEPLOYER_KEYSTORE \
  --network $NETWORK \
  $TIMELOCK_CLASS \
  172800)  # 48 hours in seconds

# Set timelock as admin
starkli invoke \
  --keystore $DEPLOYER_KEYSTORE \
  --network $NETWORK \
  $CONTRACT_PROXY \
  transfer_admin \
  $TIMELOCK_ADDRESS
```

## Frontend Integration

Update your frontend to use the proxy addresses:

```typescript
// contracts.ts
export const CONTRACTS = {
  CIRO_TOKEN: '0x...', // Use proxy address
  JOB_MANAGER: '0x...', // Use proxy address
  CDC_POOL: '0x...', // Use proxy address
} as const;

// The proxy addresses never change, even after upgrades!
```

## Testing Upgrades

### Local Testing

```bash
# Start local devnet
starknet-devnet --host 127.0.0.1 --port 5050

# Deploy contracts to local network
export STARKNET_RPC="http://127.0.0.1:5050"
# ... run deployment steps ...

# Test upgrade process
# ... deploy new implementation and upgrade ...
```

### Testnet Testing

```bash
# Deploy to goerli testnet first
export NETWORK="goerli"
export STARKNET_RPC="https://starknet-goerli.public.blastapi.io"

# Follow deployment steps
# Test all functionality
# Test upgrade process
```

## Emergency Procedures

### Pause Contracts

```bash
# Pause contract operations if needed
starkli invoke \
  --keystore $DEPLOYER_KEYSTORE \
  --network $NETWORK \
  $CONTRACT_PROXY \
  pause
```

### Emergency Upgrade

```bash
# If critical bug found, upgrade immediately
# (assuming admin controls are set up properly)
starkli invoke \
  --keystore $DEPLOYER_KEYSTORE \
  --network $NETWORK \
  $CONTRACT_PROXY \
  emergency_upgrade \
  $NEW_SAFE_IMPLEMENTATION
```

## Monitoring and Maintenance

### Health Checks

```bash
#!/bin/bash
# health_check.sh

# Check if contracts are responding
starkli call $CIRO_TOKEN_PROXY total_supply
starkli call $JOB_MANAGER_PROXY get_job_count
starkli call $CDC_POOL_PROXY get_total_staked

echo "All contracts healthy ✅"
```

### Upgrade Notifications

Set up monitoring to notify when upgrades occur:

```bash
# Monitor upgrade events
starkli events \
  --from-block latest \
  --to-block latest \
  --address $CONTRACT_PROXY \
  --keys Upgraded
```

## Conclusion

This deployment strategy provides:

- ✅ **Immediate MVP Deployment** - Deploy without code changes
- ✅ **Future-Proof Upgrades** - Add features seamlessly
- ✅ **Production Security** - Multi-sig and timelock controls
- ✅ **Zero Downtime** - Upgrades don't affect users
- ✅ **State Preservation** - All data persists through upgrades

Your contracts are now ready for MVP deployment and can evolve with your DePIN
platform needs!

## Next Steps

1. **Deploy to testnet** and verify all functionality
2. **Test upgrade process** with a dummy upgrade
3. **Set up monitoring** and health checks
4. **Configure security controls** (multi-sig, timelock)
5. **Deploy to mainnet** when ready
6. **Launch MVP** and iterate with upgrades

For questions or support, refer to the project documentation or contact the
development team.
