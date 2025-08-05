#!/bin/bash

# CIRO Network Contract Verification Script
# Tests all deployed contracts and updates the registry with current status

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contract addresses from registry
CIRO_TOKEN="0x03c0f7574905d7cbc2cca18d6c090265fa35b572d8e9dc62efeb5339908720d8"
TREASURY_TIMELOCK="0x04736828c69fda6977bdb97c982db6bf1bbcae0396a2faac450b2ec7338089c7"
CDC_POOL="0x05f73c551dbfda890090c8ee89858992dfeea9794a63ad83e6b1706e9836aeba"
JOB_MANAGER="0x00bf025663b8a7c7e43393f082b10afe66bd9ddb06fb5e521e3adbcf693094bd"

# Test accounts
DEPLOYER_ADDR="0x737c361e784a8f58508c211d50e397059590a416c373ed527b9a45287eacfc2"
TEST_ACCOUNT="0x02f5248a6b08cd6a52cb9db812e98c675be165cf803a56ac06aefbce74d1f2ca"

NETWORK="sepolia"

echo -e "${BLUE}🔍 CIRO Network Contract Verification${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Function to test contract call
test_call() {
    local contract=$1
    local function=$2
    local params=$3
    local description=$4
    
    echo -n "Testing $description... "
    
    if result=$(starkli call "$contract" "$function" $params --network "$NETWORK" 2>/dev/null); then
        echo -e "${GREEN}✅ PASS${NC}"
        echo "  Result: $result"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        return 1
    fi
}

echo -e "${YELLOW}📋 Testing CIRO Token Contract${NC}"
echo "Contract: $CIRO_TOKEN"
echo ""

# CIRO Token Read Functions
test_call "$CIRO_TOKEN" "name" "" "Token Name"
test_call "$CIRO_TOKEN" "symbol" "" "Token Symbol"
test_call "$CIRO_TOKEN" "decimals" "" "Token Decimals"
test_call "$CIRO_TOKEN" "total_supply" "" "Total Supply"
test_call "$CIRO_TOKEN" "balance_of" "$DEPLOYER_ADDR" "Deployer Balance"
test_call "$CIRO_TOKEN" "balance_of" "$TEST_ACCOUNT" "Test Account Balance"

echo ""
echo -e "${YELLOW}🏛️ Testing Treasury Timelock Contract${NC}"
echo "Contract: $TREASURY_TIMELOCK"
echo ""

# Treasury Timelock Read Functions
test_call "$TREASURY_TIMELOCK" "get_required_approvals" "" "Required Approvals"
test_call "$TREASURY_TIMELOCK" "get_timelock_delay" "" "Timelock Delay"
test_call "$TREASURY_TIMELOCK" "is_multisig_member" "$TEST_ACCOUNT" "Is Multisig Member"

echo ""
echo -e "${YELLOW}💰 Testing CDC Pool Contract${NC}"
echo "Contract: $CDC_POOL"
echo ""

# CDC Pool Read Functions
test_call "$CDC_POOL" "get_total_staked" "" "Total Staked"
test_call "$CDC_POOL" "get_pool_info" "" "Pool Info"
test_call "$CDC_POOL" "get_user_stake" "$TEST_ACCOUNT" "User Stake"

echo ""
echo -e "${YELLOW}⚡ Testing Job Manager Contract${NC}"
echo "Contract: $JOB_MANAGER"
echo ""

# Job Manager Read Functions
test_call "$JOB_MANAGER" "get_total_jobs" "" "Total Jobs"
test_call "$JOB_MANAGER" "get_job_count" "" "Job Count"
test_call "$JOB_MANAGER" "is_worker_registered" "$TEST_ACCOUNT" "Is Worker Registered"

echo ""
echo -e "${BLUE}📊 Verification Summary${NC}"
echo -e "${BLUE}======================${NC}"
echo "Verification completed at: $(date)"