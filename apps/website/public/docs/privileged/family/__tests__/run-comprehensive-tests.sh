#!/bin/bash

# Comprehensive Test Runner for Candlefish AI Family Letter Security
# This script runs all test suites with proper reporting and error handling

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
TEST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$TEST_DIR/.." && pwd)"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RESULTS_DIR="$TEST_DIR/results"
LOG_FILE="$RESULTS_DIR/test-run-$TIMESTAMP.log"

# Create results directory
mkdir -p "$RESULTS_DIR"

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}" | tee -a "$LOG_FILE"
}

print_header() {
    echo -e "\n${BLUE}================================================${NC}" | tee -a "$LOG_FILE"
    echo -e "${BLUE} $1${NC}" | tee -a "$LOG_FILE"
    echo -e "${BLUE}================================================${NC}\n" | tee -a "$LOG_FILE"
}

# Function to run test suite with error handling
run_test_suite() {
    local suite_name=$1
    local command=$2
    local description=$3

    print_header "Running $suite_name"
    print_status $BLUE "Description: $description"
    print_status $BLUE "Command: $command"

    local start_time=$(date +%s)

    if eval "$command" 2>&1 | tee -a "$LOG_FILE"; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        print_status $GREEN "✅ $suite_name completed successfully in ${duration}s"
        return 0
    else
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        print_status $RED "❌ $suite_name failed after ${duration}s"
        return 1
    fi
}

# Function to check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"

    # Check Node.js
    if command -v node >/dev/null 2>&1; then
        local node_version=$(node --version)
        print_status $GREEN "✅ Node.js found: $node_version"
    else
        print_status $RED "❌ Node.js not found. Please install Node.js"
        exit 1
    fi

    # Check npm
    if command -v npm >/dev/null 2>&1; then
        local npm_version=$(npm --version)
        print_status $GREEN "✅ npm found: $npm_version"
    else
        print_status $RED "❌ npm not found. Please install npm"
        exit 1
    fi

    # Check if dependencies are installed
    if [ -d "$TEST_DIR/node_modules" ]; then
        print_status $GREEN "✅ Dependencies found"
    else
        print_status $YELLOW "⚠️  Dependencies not found. Installing..."
        cd "$TEST_DIR"
        npm install
        if [ $? -eq 0 ]; then
            print_status $GREEN "✅ Dependencies installed successfully"
        else
            print_status $RED "❌ Failed to install dependencies"
            exit 1
        fi
    fi
}

# Function to install Playwright browsers if needed
install_playwright() {
    print_header "Playwright Setup"

    cd "$TEST_DIR"
    if npm run playwright:install 2>&1 | tee -a "$LOG_FILE"; then
        print_status $GREEN "✅ Playwright browsers installed/updated"
    else
        print_status $YELLOW "⚠️  Playwright browser installation failed, continuing anyway"
    fi
}

# Function to generate summary report
generate_summary() {
    local total_tests=$1
    local passed_tests=$2
    local failed_tests=$3
    local duration=$4

    print_header "Test Summary Report"

    echo "Test Execution Summary" | tee -a "$LOG_FILE"
    echo "=====================" | tee -a "$LOG_FILE"
    echo "Timestamp: $(date)" | tee -a "$LOG_FILE"
    echo "Total Test Suites: $total_tests" | tee -a "$LOG_FILE"
    echo "Passed: $passed_tests" | tee -a "$LOG_FILE"
    echo "Failed: $failed_tests" | tee -a "$LOG_FILE"
    echo "Total Duration: ${duration}s" | tee -a "$LOG_FILE"
    echo "Success Rate: $(( passed_tests * 100 / total_tests ))%" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"

    if [ $failed_tests -eq 0 ]; then
        print_status $GREEN "🎉 All test suites passed!"
    else
        print_status $RED "⚠️  $failed_tests test suite(s) failed"
    fi

    echo "Results saved to: $LOG_FILE" | tee -a "$LOG_FILE"
    echo "Coverage report: $TEST_DIR/coverage/lcov-report/index.html" | tee -a "$LOG_FILE"
}

# Parse command line arguments
QUICK_MODE=false
SKIP_E2E=false
SECURITY_ONLY=false
UNIT_ONLY=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --quick)
            QUICK_MODE=true
            shift
            ;;
        --skip-e2e)
            SKIP_E2E=true
            shift
            ;;
        --security-only)
            SECURITY_ONLY=true
            shift
            ;;
        --unit-only)
            UNIT_ONLY=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --quick         Run only essential tests (faster)"
            echo "  --skip-e2e      Skip end-to-end tests"
            echo "  --security-only Run only security tests"
            echo "  --unit-only     Run only unit tests"
            echo "  --verbose       Enable verbose output"
            echo "  --help          Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                    # Run all tests"
            echo "  $0 --quick           # Quick test run"
            echo "  $0 --security-only   # Security tests only"
            echo "  $0 --skip-e2e        # Skip E2E tests"
            exit 0
            ;;
        *)
            print_status $RED "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Main execution
main() {
    local start_time=$(date +%s)
    local total_tests=0
    local passed_tests=0
    local failed_tests=0

    print_header "Candlefish AI Family Letter Security - Comprehensive Test Suite"
    print_status $BLUE "Starting test execution at $(date)"
    print_status $BLUE "Test directory: $TEST_DIR"
    print_status $BLUE "Log file: $LOG_FILE"

    # Check prerequisites
    check_prerequisites

    # Change to test directory
    cd "$TEST_DIR"

    # Install Playwright if needed
    if [ "$SKIP_E2E" = false ] && [ "$UNIT_ONLY" = false ] && [ "$SECURITY_ONLY" = false ]; then
        install_playwright
    fi

    # Define test suites
    if [ "$SECURITY_ONLY" = true ]; then
        # Security tests only
        run_test_suite "Security Tests" "npm run test:security" "Vulnerability prevention and attack simulation tests"
        total_tests=$((total_tests + 1))
        [ $? -eq 0 ] && passed_tests=$((passed_tests + 1)) || failed_tests=$((failed_tests + 1))

    elif [ "$UNIT_ONLY" = true ]; then
        # Unit tests only
        run_test_suite "Unit Tests" "npm run test:unit" "Individual component and function tests"
        total_tests=$((total_tests + 1))
        [ $? -eq 0 ] && passed_tests=$((passed_tests + 1)) || failed_tests=$((failed_tests + 1))

    elif [ "$QUICK_MODE" = true ]; then
        # Quick mode - essential tests only
        run_test_suite "Unit Tests" "npm run test:unit" "Individual component and function tests"
        total_tests=$((total_tests + 1))
        [ $? -eq 0 ] && passed_tests=$((passed_tests + 1)) || failed_tests=$((failed_tests + 1))

        run_test_suite "API Tests" "npm run test:api" "Backend API endpoint tests"
        total_tests=$((total_tests + 1))
        [ $? -eq 0 ] && passed_tests=$((passed_tests + 1)) || failed_tests=$((failed_tests + 1))

        run_test_suite "Security Tests" "npm run test:security" "Critical security vulnerability tests"
        total_tests=$((total_tests + 1))
        [ $? -eq 0 ] && passed_tests=$((passed_tests + 1)) || failed_tests=$((failed_tests + 1))

    else
        # Full test suite

        # 1. Unit Tests
        run_test_suite "Unit Tests" "npm run test:unit" "Individual component and function tests"
        total_tests=$((total_tests + 1))
        [ $? -eq 0 ] && passed_tests=$((passed_tests + 1)) || failed_tests=$((failed_tests + 1))

        # 2. API Tests
        run_test_suite "API Tests" "npm run test:api" "Backend authentication and document API tests"
        total_tests=$((total_tests + 1))
        [ $? -eq 0 ] && passed_tests=$((passed_tests + 1)) || failed_tests=$((failed_tests + 1))

        # 3. Component Tests
        run_test_suite "Component Tests" "npm run test:components" "Frontend component integration tests"
        total_tests=$((total_tests + 1))
        [ $? -eq 0 ] && passed_tests=$((passed_tests + 1)) || failed_tests=$((failed_tests + 1))

        # 4. Integration Tests
        run_test_suite "Integration Tests" "npm run test:integration" "API communication and session management tests"
        total_tests=$((total_tests + 1))
        [ $? -eq 0 ] && passed_tests=$((passed_tests + 1)) || failed_tests=$((failed_tests + 1))

        # 5. Security Tests
        run_test_suite "Security Tests" "npm run test:security" "Vulnerability prevention and attack simulation tests"
        total_tests=$((total_tests + 1))
        [ $? -eq 0 ] && passed_tests=$((passed_tests + 1)) || failed_tests=$((failed_tests + 1))

        # 6. Performance Tests
        run_test_suite "Performance Tests" "npm run test:performance" "Load performance and optimization tests"
        total_tests=$((total_tests + 1))
        [ $? -eq 0 ] && passed_tests=$((passed_tests + 1)) || failed_tests=$((failed_tests + 1))

        # 7. Accessibility Tests
        run_test_suite "Accessibility Tests" "npm run test:accessibility" "WCAG 2.1 AA compliance tests"
        total_tests=$((total_tests + 1))
        [ $? -eq 0 ] && passed_tests=$((passed_tests + 1)) || failed_tests=$((failed_tests + 1))

        # 8. Coverage Report
        run_test_suite "Coverage Report" "npm run test:coverage" "Code coverage analysis with thresholds"
        total_tests=$((total_tests + 1))
        [ $? -eq 0 ] && passed_tests=$((passed_tests + 1)) || failed_tests=$((failed_tests + 1))

        # 9. End-to-End Tests (if not skipped)
        if [ "$SKIP_E2E" = false ]; then
            run_test_suite "End-to-End Tests" "npm run test:e2e" "Complete user journey and browser automation tests"
            total_tests=$((total_tests + 1))
            [ $? -eq 0 ] && passed_tests=$((passed_tests + 1)) || failed_tests=$((failed_tests + 1))
        fi
    fi

    # Generate summary
    local end_time=$(date +%s)
    local total_duration=$((end_time - start_time))

    generate_summary $total_tests $passed_tests $failed_tests $total_duration

    # Exit with appropriate code
    if [ $failed_tests -eq 0 ]; then
        print_status $GREEN "🎉 Test execution completed successfully!"
        exit 0
    else
        print_status $RED "❌ Test execution completed with failures"
        exit 1
    fi
}

# Trap to handle cleanup on exit
cleanup() {
    print_status $YELLOW "Cleaning up..."
    # Add any cleanup tasks here
}

trap cleanup EXIT

# Execute main function
main "$@"
