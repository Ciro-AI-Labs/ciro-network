# 🚀 CIRO Network - MVP Deployment Quickstart

## Prerequisites Setup (5 minutes)

```bash
# 1. Install Cairo & Starknet tools
curl -L https://install.cairo-lang.org | bash
curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh

# 2. Set up environment
export STARKNET_RPC="https://starknet-goerli.public.blastapi.io"  # Testnet
export NETWORK="goerli"
export DEPLOYER_ADDRESS="your_account_address"
export DEPLOYER_KEYSTORE="deployment-key"
```

## Automated Deployment (10 minutes)

```bash
# Quick deployment to testnet
./scripts/deploy.sh --network goerli

# Dry run first (recommended)
./scripts/deploy.sh --dry-run

# Production deployment
./scripts/deploy.sh --network mainnet
```

## Manual Deployment (if needed)

```bash
# 1. Build contracts
scarb build

# 2. Deploy implementations
starkli declare --keystore $DEPLOYER_KEYSTORE --network $NETWORK target/dev/ciro_contracts_CIROToken.contract_class.json
starkli declare --keystore $DEPLOYER_KEYSTORE --network $NETWORK target/dev/ciro_contracts_JobManagerContract.contract_class.json
starkli declare --keystore $DEPLOYER_KEYSTORE --network $NETWORK target/dev/ciro_contracts_CDCPool.contract_class.json

# 3. Deploy contract instances
starkli deploy --keystore $DEPLOYER_KEYSTORE --network $NETWORK $CLASS_HASH $DEPLOYER_ADDRESS
```

## After Deployment

### 1. Save Contract Addresses

```bash
# Addresses are saved in deployment.json
cat deployment.json
```

### 2. Update Frontend

```typescript
export const CONTRACTS = {
  CIRO_TOKEN: '0x...', // From deployment.json
  JOB_MANAGER: '0x...', // From deployment.json
  CDC_POOL: '0x...', // From deployment.json
};
```

### 3. Test Deployment

```bash
# Verify contracts are responding
starkli call $CIRO_TOKEN_ADDRESS name
starkli call $JOB_MANAGER_ADDRESS get_admin
starkli call $CDC_POOL_ADDRESS get_admin
```

## Upgrade Process (Future)

```bash
# 1. Build new version
scarb build

# 2. Deploy new implementation
NEW_CLASS=$(starkli declare --keystore $DEPLOYER_KEYSTORE target/dev/NewContract.contract_class.json)

# 3. Upgrade (when proxy system is implemented)
starkli invoke --keystore $DEPLOYER_KEYSTORE $PROXY_ADDRESS upgrade $NEW_CLASS
```

## Troubleshooting

| Issue                  | Solution                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------- |
| `scarb not found`      | Install Scarb: `curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh \| sh` |
| `starkli not found`    | Install Cairo: `curl -L https://install.cairo-lang.org \| bash`                                         |
| `STARKNET_RPC not set` | Export RPC URL: `export STARKNET_RPC="https://starknet-goerli.public.blastapi.io"`                      |
| Build errors           | Check compilation errors and fix before deploying                                                       |
| Deploy fails           | Check account balance and network connectivity                                                          |

## Security Checklist

- [ ] Test on testnet first
- [ ] Verify contract addresses in deployment.json
- [ ] Set up multi-sig for admin functions (production)
- [ ] Configure timelock for upgrades (production)
- [ ] Monitor contract health after deployment

## Support

- **Deployment Guide**: See `DEPLOYMENT_GUIDE.md` for detailed instructions
- **Contract Documentation**: Check individual contract files for API details
- **Issues**: Report deployment issues to the development team

---

**⚡ Ready to deploy your CIRO Network MVP in minutes!**
