#!/bin/bash

# CIRO Network - Mainnet Readiness Verification Script
# Comprehensive validation of all deployment preparation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Verification tracking
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Function to run a verification check
verify_check() {
    local check_name="$1"
    local check_command="$2"
    local success_message="$3"
    local failure_message="$4"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    echo -e "${BLUE}[CHECK $TOTAL_CHECKS] $check_name${NC}"
    
    if eval "$check_command" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ $success_message${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}❌ $failure_message${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

# Function to verify file exists
verify_file_exists() {
    local file_path="$1"
    local description="$2"
    
    verify_check \
        "File Existence: $description" \
        "[ -f \"$file_path\" ]" \
        "$description exists at $file_path" \
        "$description not found at $file_path"
}

# Function to verify directory exists
verify_dir_exists() {
    local dir_path="$1"
    local description="$2"
    
    verify_check \
        "Directory Existence: $description" \
        "[ -d \"$dir_path\" ]" \
        "$description directory exists at $dir_path" \
        "$description directory not found at $dir_path"
}

# Function to verify script is executable
verify_executable() {
    local script_path="$1"
    local description="$2"
    
    verify_check \
        "Script Executable: $description" \
        "[ -x \"$script_path\" ]" \
        "$description script is executable" \
        "$description script is not executable"
}

echo -e "${PURPLE}"
echo "🔍 CIRO Network - Mainnet Readiness Verification"
echo "================================================="
echo -e "${NC}"

echo -e "${YELLOW}📋 Verifying mainnet preparation components...${NC}"
echo ""

# 1. Core Contract Verification
echo -e "${BLUE}🏗️  Core Contract Infrastructure${NC}"
verify_file_exists "src/ciro_token.cairo" "CIRO Token Contract"
verify_file_exists "src/cdc_pool.cairo" "CDC Pool Contract"
verify_file_exists "src/job_manager.cairo" "Job Manager Contract"
verify_file_exists "src/lib.cairo" "Main Library File"

# 2. Vesting System Verification
echo -e "\n${BLUE}📅 Vesting System Infrastructure${NC}"
verify_file_exists "src/vesting/linear_vesting_with_cliff.cairo" "Linear Vesting Contract"
verify_file_exists "src/vesting/milestone_vesting.cairo" "Milestone Vesting Contract"
verify_file_exists "src/vesting/burn_manager.cairo" "Burn Manager Contract"

# 3. Utility Modules Verification
echo -e "\n${BLUE}🔧 Utility Modules${NC}"
verify_file_exists "src/utils/constants.cairo" "Constants Module"
verify_file_exists "src/utils/types.cairo" "Types Module"
verify_file_exists "src/utils/security.cairo" "Security Module"
verify_file_exists "src/utils/interactions.cairo" "Interactions Module"
verify_file_exists "src/utils/governance.cairo" "Governance Module"
verify_file_exists "src/utils/upgradability.cairo" "Upgradability Module"

# 4. Interface Contracts Verification
echo -e "\n${BLUE}🔌 Interface Contracts${NC}"
verify_file_exists "src/interfaces/ciro_token.cairo" "Token Interface"
verify_file_exists "src/interfaces/cdc_pool.cairo" "Pool Interface"
verify_file_exists "src/interfaces/job_manager.cairo" "Job Manager Interface"

# 5. Security Framework Verification
echo -e "\n${BLUE}🔒 Security Framework${NC}"
verify_dir_exists "security" "Security Directory"
verify_file_exists "security/SECURITY_AUDIT_CHECKLIST.md" "Security Audit Checklist"
verify_file_exists "security/security_audit_tools.cairo" "Security Audit Tools"

# 6. Gas Optimization Verification
echo -e "\n${BLUE}⚡ Gas Optimization Framework${NC}"
verify_dir_exists "optimization" "Optimization Directory"
verify_file_exists "optimization/GAS_OPTIMIZATION_GUIDE.md" "Gas Optimization Guide"

# 7. Deployment Scripts Verification
echo -e "\n${BLUE}🚀 Deployment Infrastructure${NC}"
verify_dir_exists "scripts" "Scripts Directory"
verify_file_exists "scripts/deploy_mainnet.cairo" "Cairo Deployment Contract"
verify_file_exists "scripts/deploy_mainnet.sh" "Shell Deployment Script"
verify_executable "scripts/deploy_mainnet.sh" "Mainnet Deployment Script"

# 8. Test Infrastructure Verification
echo -e "\n${BLUE}🧪 Test Infrastructure${NC}"
verify_dir_exists "tests" "Tests Directory"
verify_file_exists "tests/integration_test.cairo" "Integration Test Suite"
verify_file_exists "tests/mod.cairo" "Test Module File"
verify_file_exists "run_integration_tests.sh" "Integration Test Runner"
verify_executable "run_integration_tests.sh" "Integration Test Runner Script"

# 9. Documentation Verification
echo -e "\n${BLUE}📚 Documentation${NC}"
verify_file_exists "INTEGRATION_TESTING.md" "Integration Testing Documentation"
verify_file_exists "DEPLOYMENT_STATUS.md" "Deployment Status Documentation"
verify_file_exists "INTEGRATION_TESTING_SUMMARY.md" "Integration Testing Summary"
verify_file_exists "MAINNET_PREPARATION_SUMMARY.md" "Mainnet Preparation Summary"

# 10. Configuration Files Verification
echo -e "\n${BLUE}⚙️  Configuration Files${NC}"
verify_file_exists "Scarb.toml" "Scarb Configuration"
verify_file_exists "../Cargo.toml" "Cargo Configuration"

# 11. Build Verification
echo -e "\n${BLUE}🔨 Build System Verification${NC}"
verify_check \
    "Project Compilation" \
    "scarb build" \
    "Project compiles successfully without errors" \
    "Project compilation failed"

# 12. Contract Size Verification
echo -e "\n${BLUE}📏 Contract Size Verification${NC}"
if [ -d "target/dev" ]; then
    contract_count=$(find target/dev -name "*contract_class.json" | wc -l)
    if [ "$contract_count" -ge 6 ]; then
        echo -e "${GREEN}✅ All contract artifacts generated ($contract_count contracts)${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}❌ Insufficient contract artifacts ($contract_count < 6)${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
else
    echo -e "${RED}❌ Target directory not found - build required${NC}"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
fi

# 13. Git Status Verification
echo -e "\n${BLUE}📝 Git Status Verification${NC}"
verify_check \
    "Git Repository Status" \
    "git status >/dev/null 2>&1" \
    "Git repository is properly initialized" \
    "Git repository not properly initialized"

# Calculate success rate
SUCCESS_RATE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

echo ""
echo -e "${PURPLE}📊 Verification Results Summary${NC}"
echo "================================"
echo -e "Total Checks: ${TOTAL_CHECKS}"
echo -e "Passed: ${GREEN}${PASSED_CHECKS}${NC}"
echo -e "Failed: ${RED}${FAILED_CHECKS}${NC}"
echo -e "Success Rate: ${SUCCESS_RATE}%"

echo ""
if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "${GREEN}🎉 MAINNET READINESS VERIFICATION: PASSED${NC}"
    echo -e "${GREEN}✅ All systems ready for mainnet deployment${NC}"
    echo ""
    echo -e "${BLUE}📋 Next Steps:${NC}"
    echo "1. Set deployment environment variables"
    echo "2. Run final security audit"
    echo "3. Execute deployment script"
    echo "4. Monitor deployment progress"
    exit 0
else
    echo -e "${RED}❌ MAINNET READINESS VERIFICATION: FAILED${NC}"
    echo -e "${RED}⚠️  $FAILED_CHECKS check(s) failed - address issues before deployment${NC}"
    echo ""
    echo -e "${YELLOW}🔧 Recommended Actions:${NC}"
    echo "1. Review failed checks above"
    echo "2. Fix any missing files or configurations"
    echo "3. Re-run verification script"
    echo "4. Ensure all tests pass before deployment"
    exit 1
fi 