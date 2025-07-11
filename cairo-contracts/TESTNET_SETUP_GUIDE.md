# CIRO Network Testnet Setup Guide

## 🎯 Quick Start

**YES, we should absolutely launch to testnet first!** This guide will help you deploy CIRO Network to Starknet Sepolia testnet for safe testing before mainnet.

## 📋 Prerequisites

1. **Install Starkli** (Starknet CLI):
   ```bash
   curl https://get.starkli.sh | sh
   source ~/.starkli/env
   starkliup
   ```

2. **Install Scarb** (Cairo build tool):
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh
   ```

3. **Get Testnet ETH**:
   - [Starknet Sepolia Faucet](https://starknet-faucet.vercel.app/)
   - [Alchemy Faucet](https://www.alchemy.com/faucets/starknet-sepolia)

## 🚀 Deployment Options

### Option 1: Simple Automated Deployment (Recommended)

```bash
# Build contracts first
scarb build

# Run the simplified deployment script
./scripts/deploy_testnet_simple.sh
```

The script will:
1. ✅ Check prerequisites
2. ✅ Build contracts
3. ✅ Create testnet account
4. ⚠️  Ask you to fund the account
5. ✅ Deploy account to testnet
6. ✅ Declare contracts
7. ✅ Deploy contracts
8. ✅ Create monitoring tools

### Option 2: Manual Step-by-Step Deployment

If you prefer more control, here's the manual process:

#### Step 1: Create Account
```bash
# Generate a private key (save this securely!)
PRIVATE_KEY="0x$(openssl rand -hex 32)"

# Create account config
starkli account oz init testnet_account.json --private-key "$PRIVATE_KEY" -f

# Get the account address
starkli account fetch testnet_account.json
```

#### Step 2: Fund Account
Fund the account address with testnet ETH from the faucets above.

#### Step 3: Deploy Account
```bash
starkli account deploy testnet_account.json --rpc https://starknet-sepolia.public.blastapi.io
```

#### Step 4: Build and Declare Contracts
```bash
# Build contracts
scarb build

# Declare CIRO Token
TOKEN_CLASS=$(starkli declare target/dev/ciro_contracts_CIROToken.contract_class.json \
  --account testnet_account.json \
  --rpc https://starknet-sepolia.public.blastapi.io)

# Declare CDC Pool
POOL_CLASS=$(starkli declare target/dev/ciro_contracts_CDCPool.contract_class.json \
  --account testnet_account.json \
  --rpc https://starknet-sepolia.public.blastapi.io)

# Declare Job Manager
JOB_CLASS=$(starkli declare target/dev/ciro_contracts_JobManager.contract_class.json \
  --account testnet_account.json \
  --rpc https://starknet-sepolia.public.blastapi.io)
```

#### Step 5: Deploy Contracts
```bash
# Get your deployer address
DEPLOYER=$(cat testnet_account.json | grep -o '"address":"[^"]*"' | cut -d'"' -f4)

# Deploy CIRO Token
TOKEN_ADDR=$(starkli deploy $TOKEN_CLASS \
  'CIRO Token Testnet' 'CIRO-TEST' 18 1000000000000000000000000 0 $DEPLOYER \
  --account testnet_account.json \
  --rpc https://starknet-sepolia.public.blastapi.io)

# Deploy CDC Pool
POOL_ADDR=$(starkli deploy $POOL_CLASS \
  $TOKEN_ADDR $DEPLOYER \
  --account testnet_account.json \
  --rpc https://starknet-sepolia.public.blastapi.io)

# Deploy Job Manager
JOB_ADDR=$(starkli deploy $JOB_CLASS \
  $TOKEN_ADDR $POOL_ADDR $DEPLOYER \
  --account testnet_account.json \
  --rpc https://starknet-sepolia.public.blastapi.io)
```

## 📊 After Deployment

### Monitoring Your Contracts

1. **View on Explorer**:
   - Go to [Sepolia Starkscan](https://sepolia.starkscan.co)
   - Search for your contract addresses

2. **Use Monitoring Script** (if you used automated deployment):
   ```bash
   ./monitor_testnet_simple.sh testnet_contracts.json
   ```

3. **Manual Monitoring**:
   ```bash
   # Check token name
   starkli call $TOKEN_ADDR "name" --rpc https://starknet-sepolia.public.blastapi.io
   
   # Check pool status
   starkli call $POOL_ADDR "get_total_staked" --rpc https://starknet-sepolia.public.blastapi.io
   
   # Check job count
   starkli call $JOB_ADDR "get_job_count" --rpc https://starknet-sepolia.public.blastapi.io
   ```

### Interacting with Contracts

1. **Use Interaction Script** (if you used automated deployment):
   ```bash
   ./interact_testnet.sh testnet_contracts.json testnet_deployer
   ```

2. **Manual Interaction Examples**:
   ```bash
   # Check your token balance
   starkli call $TOKEN_ADDR "balance_of" $DEPLOYER --rpc https://starknet-sepolia.public.blastapi.io
   
   # Mint tokens (as owner)
   starkli invoke $TOKEN_ADDR "mint" $DEPLOYER 1000000000000000000000 \
     --account testnet_account.json --rpc https://starknet-sepolia.public.blastapi.io
   
   # Stake tokens in pool
   starkli invoke $POOL_ADDR "stake" 1000000000000000000000 \
     --account testnet_account.json --rpc https://starknet-sepolia.public.blastapi.io
   ```

## 🧪 Testing Strategy

### Phase 1: Contract Validation (Day 1-3)
- ✅ Verify all contracts deployed successfully
- ✅ Test basic token operations (mint, transfer, burn)
- ✅ Test staking and unstaking
- ✅ Test job submission and execution flows

### Phase 2: Integration Testing (Day 4-7)
- ✅ Test full worker registration flow
- ✅ Test job lifecycle management
- ✅ Test reward distribution
- ✅ Test slashing mechanisms

### Phase 3: Stress Testing (Day 8-14)
- ✅ Submit multiple concurrent jobs
- ✅ Test with multiple workers
- ✅ Test edge cases and error conditions
- ✅ Performance and gas optimization validation

### Phase 4: User Acceptance (Day 15-30)
- ✅ Beta user testing
- ✅ Feedback collection
- ✅ Bug fixes and improvements
- ✅ Final testnet validation

## 🔧 Tools and Resources

### Essential Files Created
- `testnet_contracts.json` - Contract addresses
- `testnet_declarations.json` - Class hashes
- `testnet_account.json` - Account configuration
- `monitor_testnet_simple.sh` - Monitoring script
- `interact_testnet.sh` - Interaction script

### Useful Commands
```bash
# Check account balance
starkli balance $DEPLOYER --rpc https://starknet-sepolia.public.blastapi.io

# Get transaction receipt
starkli receipt $TX_HASH --rpc https://starknet-sepolia.public.blastapi.io

# Call any contract function
starkli call $CONTRACT_ADDR "function_name" [args] --rpc https://starknet-sepolia.public.blastapi.io

# Invoke any contract function
starkli invoke $CONTRACT_ADDR "function_name" [args] --account testnet_account.json --rpc https://starknet-sepolia.public.blastapi.io
```

### Network Information
- **Network**: Starknet Sepolia
- **RPC URL**: https://starknet-sepolia.public.blastapi.io
- **Explorer**: https://sepolia.starkscan.co
- **Faucets**: 
  - https://starknet-faucet.vercel.app/
  - https://www.alchemy.com/faucets/starknet-sepolia

## 🚨 Important Notes

1. **Security**: This is testnet - tokens have no value
2. **Private Keys**: Save your private key securely for continued access
3. **Funding**: You'll need testnet ETH for transactions
4. **Rate Limits**: Faucets have daily limits - plan accordingly
5. **Network Issues**: Testnet can be slow or unstable - be patient

## ✅ Success Checklist

- [ ] All prerequisites installed
- [ ] Account created and funded
- [ ] All 3 contracts deployed successfully
- [ ] Basic functionality tested
- [ ] Monitoring set up
- [ ] Integration tests passing
- [ ] Ready for beta user testing

## 📞 Getting Help

If you encounter issues:
1. Check the logs in `testnet_deployment_*.log`
2. Verify account has sufficient testnet ETH
3. Check contract addresses in Starkscan
4. Try increasing gas limits if transactions fail
5. Make sure you're using the latest starkli version

---

**Ready to deploy?** Choose your deployment method above and get started! 🚀 