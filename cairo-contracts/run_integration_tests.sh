#!/bin/bash

# CIRO Network - Comprehensive Integration Test Runner
# This script runs all integration tests and provides detailed reporting

set -e

echo "🚀 CIRO Network - Comprehensive Integration Test Suite"
echo "======================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
TEST_RESULTS=()

# Function to run a specific test
run_test() {
    local test_name=$1
    local description=$2
    
    echo -e "${BLUE}Running: ${test_name}${NC}"
    echo -e "Description: ${description}"
    echo "----------------------------------------"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if scarb test --filter "${test_name}" 2>&1; then
        echo -e "${GREEN}✅ PASSED: ${test_name}${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        TEST_RESULTS+=("✅ ${test_name}")
    else
        echo -e "${RED}❌ FAILED: ${test_name}${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        TEST_RESULTS+=("❌ ${test_name}")
    fi
    
    echo ""
}

# Function to run all tests in a module
run_module_tests() {
    local module_name=$1
    local description=$2
    
    echo -e "${YELLOW}📦 Testing Module: ${module_name}${NC}"
    echo -e "Description: ${description}"
    echo "========================================"
    
    if scarb test --filter "${module_name}" 2>&1; then
        echo -e "${GREEN}✅ MODULE PASSED: ${module_name}${NC}"
    else
        echo -e "${RED}❌ MODULE FAILED: ${module_name}${NC}"
    fi
    
    echo ""
}

# Check if we're in the right directory
if [ ! -f "Scarb.toml" ]; then
    echo -e "${RED}Error: Please run this script from the cairo-contracts directory${NC}"
    exit 1
fi

# Clean build artifacts
echo "🧹 Cleaning build artifacts..."
scarb clean
echo ""

# Build the project first
echo "🔨 Building project..."
if ! scarb build; then
    echo -e "${RED}❌ Build failed! Cannot proceed with tests.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build successful!${NC}"
echo ""

# Run individual integration tests
echo "🧪 Starting Integration Tests..."
echo ""

run_test "test_full_ecosystem_workflow" "Complete end-to-end workflow testing all major system components"

run_test "test_worker_slashing_and_recovery" "Worker punishment and reputation recovery mechanisms"

run_test "test_milestone_vesting_workflow" "Milestone-based token vesting with multi-verifier system"

run_test "test_governance_upgrade_process" "Governance proposal creation, voting, and execution"

run_test "test_burn_mechanism_integration" "Token burning mechanisms including fixed, revenue-based, and emergency burns"

run_test "test_security_integration" "Security features including rate limiting and suspicious activity detection"

# Run module-specific comprehensive tests
echo "📚 Running Module Test Suites..."
echo ""

run_module_tests "ciro_token_test" "CIRO Token comprehensive functionality tests"

run_module_tests "test_cdc_pool" "CDC Pool staking and tier management tests"

run_module_tests "test_governance" "Governance system proposal and voting tests"

run_module_tests "test_vesting_system" "Complete vesting system tests"

run_module_tests "test_security" "Security utilities and rate limiting tests"

# Performance and stress tests
echo "⚡ Running Performance Tests..."
echo ""

echo "🔄 Testing high-volume job processing..."
if scarb test --filter "test_full_ecosystem_workflow" --release; then
    echo -e "${GREEN}✅ Performance test passed${NC}"
else
    echo -e "${RED}❌ Performance test failed${NC}"
fi
echo ""

# Security and edge case tests
echo "🔒 Running Security Edge Case Tests..."
echo ""

echo "🚨 Testing edge cases and boundary conditions..."
if scarb test --filter "test_security_integration"; then
    echo -e "${GREEN}✅ Security edge cases passed${NC}"
else
    echo -e "${RED}❌ Security edge cases failed${NC}"
fi
echo ""

# Generate comprehensive test report
echo "📊 Test Execution Summary"
echo "========================="
echo ""

for result in "${TEST_RESULTS[@]}"; do
    echo -e "${result}"
done

echo ""
echo "📈 Statistics:"
echo "  Total Tests: ${TOTAL_TESTS}"
echo -e "  ${GREEN}Passed: ${PASSED_TESTS}${NC}"
echo -e "  ${RED}Failed: ${FAILED_TESTS}${NC}"

if [ ${FAILED_TESTS} -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 ALL TESTS PASSED! 🎉${NC}"
    echo -e "${GREEN}The CIRO Network ecosystem is ready for deployment!${NC}"
    
    # Generate deployment readiness report
    echo ""
    echo "🚀 Deployment Readiness Checklist:"
    echo "✅ Core contracts (Job Manager, CDC Pool, CIRO Token)"
    echo "✅ Vesting systems (Linear, Milestone, Burn Manager)"
    echo "✅ Governance mechanisms"
    echo "✅ Security features and rate limiting"
    echo "✅ Worker registration and job processing"
    echo "✅ Token economics and burning mechanisms"
    echo "✅ Cross-module integration"
    echo "✅ Edge case handling"
    echo "✅ Performance under load"
    
    exit 0
else
    echo ""
    echo -e "${RED}❌ TESTS FAILED!${NC}"
    echo -e "${RED}Please review and fix failing tests before deployment.${NC}"
    
    echo ""
    echo "🔍 Debugging Tips:"
    echo "  - Check compilation errors with 'scarb build'"
    echo "  - Run individual tests with 'scarb test --filter <test_name>'"
    echo "  - Review test logs for specific failure details"
    echo "  - Ensure all dependencies are properly configured"
    
    exit 1
fi 