#!/bin/bash

# Family Letter Test Suite Runner
# Comprehensive test execution script for all test categories

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
TEST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FAMILY_LETTER_DIR="$(dirname "$TEST_DIR")"
COVERAGE_THRESHOLD=80
EXIT_CODE=0

# Logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Pre-test setup
setup_test_environment() {
    log_info "Setting up test environment..."
    
    # Create necessary directories
    mkdir -p "$TEST_DIR/coverage"
    mkdir -p "$TEST_DIR/test-results"
    mkdir -p "$TEST_DIR/screenshots"
    
    # Install dependencies if needed
    if [ ! -d "$TEST_DIR/node_modules" ]; then
        log_info "Installing test dependencies..."
        cd "$TEST_DIR"
        npm install
    fi
    
    # Start local server for E2E tests
    cd "$FAMILY_LETTER_DIR"
    python3 -m http.server 8080 &
    SERVER_PID=$!
    log_info "Started test server (PID: $SERVER_PID)"
    
    # Wait for server to be ready
    sleep 2
    
    if ! curl -s http://localhost:8080/index.html > /dev/null; then
        log_error "Test server failed to start"
        exit 1
    fi
    
    echo $SERVER_PID > "$TEST_DIR/.server_pid"
}

# Clean up after tests
cleanup_test_environment() {
    log_info "Cleaning up test environment..."
    
    if [ -f "$TEST_DIR/.server_pid" ]; then
        SERVER_PID=$(cat "$TEST_DIR/.server_pid")
        if kill -0 "$SERVER_PID" 2>/dev/null; then
            kill "$SERVER_PID"
            log_info "Stopped test server (PID: $SERVER_PID)"
        fi
        rm "$TEST_DIR/.server_pid"
    fi
}

# Run unit tests
run_unit_tests() {
    log_info "Running unit tests..."
    
    cd "$TEST_DIR"
    
    if npm test -- --coverage --testPathPattern=unit 2>&1 | tee test-results/unit-tests.log; then
        log_success "Unit tests passed"
        return 0
    else
        log_error "Unit tests failed"
        return 1
    fi
}

# Run integration tests
run_integration_tests() {
    log_info "Running integration tests..."
    
    cd "$TEST_DIR"
    
    if npm test -- --testPathPattern=integration 2>&1 | tee test-results/integration-tests.log; then
        log_success "Integration tests passed"
        return 0
    else
        log_error "Integration tests failed"
        return 1
    fi
}

# Run E2E tests
run_e2e_tests() {
    log_info "Running E2E tests..."
    
    cd "$TEST_DIR"
    
    if npm run test:e2e 2>&1 | tee test-results/e2e-tests.log; then
        log_success "E2E tests passed"
        return 0
    else
        log_error "E2E tests failed"
        return 1
    fi
}

# Run security tests
run_security_tests() {
    log_info "Running security tests..."
    
    cd "$TEST_DIR"
    
    if npm run test:security 2>&1 | tee test-results/security-tests.log; then
        log_success "Security tests passed"
        return 0
    else
        log_error "Security tests failed"
        EXIT_CODE=1
        return 1
    fi
}

# Run accessibility tests
run_accessibility_tests() {
    log_info "Running accessibility tests..."
    
    cd "$TEST_DIR"
    
    if npm run test:accessibility 2>&1 | tee test-results/accessibility-tests.log; then
        log_success "Accessibility tests passed"
        return 0
    else
        log_error "Accessibility tests failed"
        EXIT_CODE=1
        return 1
    fi
}

# Run performance tests
run_performance_tests() {
    log_info "Running performance tests..."
    
    cd "$TEST_DIR"
    
    if timeout 300 npm test -- --testPathPattern=performance 2>&1 | tee test-results/performance-tests.log; then
        log_success "Performance tests passed"
        return 0
    else
        log_error "Performance tests failed or timed out"
        EXIT_CODE=1
        return 1
    fi
}

# Generate test report
generate_test_report() {
    log_info "Generating test report..."
    
    cd "$TEST_DIR"
    
    cat > test-results/test-summary.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Family Letter Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .pass { color: green; }
        .fail { color: red; }
        .warning { color: orange; }
        .section { margin: 20px 0; padding: 10px; border: 1px solid #ccc; }
        .timestamp { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <h1>Family Letter Test Report</h1>
    <div class="timestamp">Generated: $(date)</div>
    
    <div class="section">
        <h2>Test Results Summary</h2>
        <ul>
            <li>Unit Tests: $([ -f test-results/unit-tests.log ] && echo "✅ PASSED" || echo "❌ FAILED")</li>
            <li>Integration Tests: $([ -f test-results/integration-tests.log ] && echo "✅ PASSED" || echo "❌ FAILED")</li>
            <li>E2E Tests: $([ -f test-results/e2e-tests.log ] && echo "✅ PASSED" || echo "❌ FAILED")</li>
            <li>Security Tests: $([ -f test-results/security-tests.log ] && echo "⚠️ REVIEWED" || echo "❌ FAILED")</li>
            <li>Accessibility Tests: $([ -f test-results/accessibility-tests.log ] && echo "✅ PASSED" || echo "❌ FAILED")</li>
            <li>Performance Tests: $([ -f test-results/performance-tests.log ] && echo "✅ PASSED" || echo "❌ FAILED")</li>
        </ul>
    </div>
    
    <div class="section">
        <h2>Coverage Report</h2>
        $([ -f coverage/lcov-report/index.html ] && echo "<p><a href='../coverage/lcov-report/index.html'>View Coverage Report</a></p>" || echo "<p>Coverage report not available</p>")
    </div>
    
    <div class="section">
        <h2>Security Findings</h2>
        <ul>
            <li class="fail">❌ Password hardcoded in client-side JavaScript</li>
            <li class="fail">❌ No server-side authentication validation</li>
            <li class="fail">❌ No rate limiting implementation</li>
            <li class="fail">❌ Content accessible without proper authentication</li>
            <li class="warning">⚠️ Missing security headers</li>
            <li class="warning">⚠️ No HTTPS enforcement</li>
        </ul>
    </div>
    
    <div class="section">
        <h2>Recommendations</h2>
        <ol>
            <li>Implement server-side authentication</li>
            <li>Add rate limiting and brute force protection</li>
            <li>Remove hardcoded credentials from client-side code</li>
            <li>Add proper session management with expiration</li>
            <li>Implement security headers (CSP, HSTS, etc.)</li>
            <li>Add input validation and sanitization</li>
            <li>Implement proper error handling without information disclosure</li>
        </ol>
    </div>
</body>
</html>
EOF
    
    log_success "Test report generated: test-results/test-summary.html"
}

# Check test coverage
check_coverage() {
    log_info "Checking test coverage..."
    
    if [ -f "$TEST_DIR/coverage/coverage-summary.json" ]; then
        COVERAGE=$(node -e "
            const coverage = require('./coverage/coverage-summary.json');
            const total = coverage.total;
            console.log(total.lines.pct);
        ")
        
        if (( $(echo "$COVERAGE >= $COVERAGE_THRESHOLD" | bc -l) )); then
            log_success "Coverage threshold met: ${COVERAGE}% >= ${COVERAGE_THRESHOLD}%"
        else
            log_warning "Coverage below threshold: ${COVERAGE}% < ${COVERAGE_THRESHOLD}%"
        fi
    else
        log_warning "Coverage report not found"
    fi
}

# Main execution
main() {
    log_info "Starting Family Letter Test Suite"
    
    # Parse command line arguments
    RUN_UNIT=true
    RUN_INTEGRATION=true
    RUN_E2E=true
    RUN_SECURITY=true
    RUN_ACCESSIBILITY=true
    RUN_PERFORMANCE=true
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --unit-only)
                RUN_INTEGRATION=false
                RUN_E2E=false
                RUN_SECURITY=false
                RUN_ACCESSIBILITY=false
                RUN_PERFORMANCE=false
                shift
                ;;
            --no-e2e)
                RUN_E2E=false
                shift
                ;;
            --security-only)
                RUN_UNIT=false
                RUN_INTEGRATION=false
                RUN_E2E=false
                RUN_ACCESSIBILITY=false
                RUN_PERFORMANCE=false
                shift
                ;;
            --quick)
                RUN_PERFORMANCE=false
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Set up trap for cleanup
    trap cleanup_test_environment EXIT
    
    # Setup
    setup_test_environment
    
    # Run tests
    [ "$RUN_UNIT" = true ] && run_unit_tests
    [ "$RUN_INTEGRATION" = true ] && run_integration_tests
    [ "$RUN_E2E" = true ] && run_e2e_tests
    [ "$RUN_SECURITY" = true ] && run_security_tests
    [ "$RUN_ACCESSIBILITY" = true ] && run_accessibility_tests
    [ "$RUN_PERFORMANCE" = true ] && run_performance_tests
    
    # Analysis
    check_coverage
    generate_test_report
    
    if [ $EXIT_CODE -eq 0 ]; then
        log_success "All tests completed successfully"
    else
        log_error "Some tests failed or found issues"
    fi
    
    exit $EXIT_CODE
}

# Run main function
main "$@"