#!/bin/bash

# Firebase Functions API Testing Script
# This script tests all Firebase Functions endpoints

# Don't exit on error - we want to continue testing even if some functions fail

# Configuration
FIREBASE_FUNCTIONS_URL="http://127.0.0.1:5001/trivia-games-7a81b/us-central1"
AUTH_EMULATOR_URL="http://localhost:9099"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
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

# Check if required tools are installed
check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v curl &> /dev/null; then
        log_error "curl is required but not installed"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        log_error "jq is required but not installed"
        exit 1
    fi
    
    log_success "All dependencies are available"
}

# Check if Firebase emulators are running
check_emulators() {
    log_info "Checking if Firebase emulators are running..."
    
    if ! curl -s "${FIREBASE_FUNCTIONS_URL}/createGame" > /dev/null; then
        log_error "Firebase Functions emulator is not running on ${FIREBASE_FUNCTIONS_URL}"
        log_error "Please start the emulator with: cd firebase-functions && npm run serve"
        exit 1
    fi
    
    if ! curl -s "${AUTH_EMULATOR_URL}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-1-api-key" > /dev/null; then
        log_error "Firebase Auth emulator is not running on ${AUTH_EMULATOR_URL}"
        log_error "Please start the auth emulator"
        exit 1
    fi
    
    log_success "Firebase emulators are running"
}

# Create a test user and get authentication token
create_test_user() {
    log_info "Creating test user..."
    
    local email="testuser_$(date +%s)@example.com"
    local password="testpassword123"
    
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\",\"returnSecureToken\":true}" \
        "${AUTH_EMULATOR_URL}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-1-api-key")
    
    if echo "$response" | jq -e '.error' > /dev/null; then
        log_error "Failed to create test user: $(echo "$response" | jq -r '.error.message')"
        exit 1
    fi
    
    local id_token=$(echo "$response" | jq -r '.idToken')
    local user_id=$(echo "$response" | jq -r '.localId')
    
    if [ -z "$id_token" ] || [ "$id_token" = "null" ]; then
        log_error "Failed to get authentication token"
        exit 1
    fi
    
    log_success "Test user created: $email (ID: $user_id)"
    
    # Export variables for use in other functions
    export TEST_USER_ID="$user_id"
    export TEST_USER_EMAIL="$email"
    export TEST_ID_TOKEN="$id_token"
}

# Test function with authentication
test_function() {
    local function_name="$1"
    local data="$2"
    local description="$3"
    
    log_info "Testing $function_name: $description"
    
    # Wrap data in "data" object for callable functions
    local wrapped_data="{\"data\": $data}"
    
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TEST_ID_TOKEN" \
        -d "$wrapped_data" \
        "${FIREBASE_FUNCTIONS_URL}/${function_name}")
    
    if echo "$response" | jq -e '.error' > /dev/null; then
        local error_msg=$(echo "$response" | jq -r '.error.message')
        log_warning "$function_name failed: $error_msg"
        echo "$response" | jq .
        return 1
    else
        log_success "$function_name completed successfully"
        echo "$response" | jq .
        return 0
    fi
}

# Test function without authentication (should fail)
test_function_unauthenticated() {
    local function_name="$1"
    local data="$2"
    local description="$3"
    
    log_info "Testing $function_name without authentication: $description"
    
    # Wrap data in "data" object for callable functions
    local wrapped_data="{\"data\": $data}"
    
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$wrapped_data" \
        "${FIREBASE_FUNCTIONS_URL}/${function_name}")
    
    if echo "$response" | jq -e '.error' > /dev/null; then
        local error_msg=$(echo "$response" | jq -r '.error.message')
        if [[ "$error_msg" == *"authenticated"* ]]; then
            log_success "$function_name correctly rejected unauthenticated request"
            return 0
        else
            log_warning "$function_name returned unexpected error: $error_msg"
            return 1
        fi
    else
        log_error "$function_name should have failed without authentication but succeeded"
        return 1
    fi
}

# Main test function
run_tests() {
    log_info "Starting Firebase Functions API tests..."
    
    # Check dependencies and emulators
    check_dependencies
    check_emulators
    
    # Create test user
    create_test_user
    
    echo
    log_info "=== Testing Game Functions ==="
    
    # Test createGame
    test_function "createGame" '{
        "title": "Test Trivia Game",
        "description": "Technology Industry",
        "questionCount": 5,
        "difficulty": "medium",
        "categories": ["Company Facts", "Industry Knowledge"],
        "companyName": "TechCorp Inc",
        "productDescription": "A leading technology company specializing in innovative solutions"
    }' "Create a new trivia game"
    
    # Store the game ID for subsequent tests
    local game_response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TEST_ID_TOKEN" \
        -d '{"data": {
            "title": "API Test Game",
            "description": "Test Industry",
            "questionCount": 3,
            "difficulty": "easy",
            "categories": ["General Knowledge"],
            "companyName": "Test Company",
            "productDescription": "Test description"
        }}' \
        "${FIREBASE_FUNCTIONS_URL}/createGame")
    
    local game_id=$(echo "$game_response" | jq -r '.result.id')
    export TEST_GAME_ID="$game_id"
    
    if [ -n "$game_id" ] && [ "$game_id" != "null" ]; then
        log_success "Created test game with ID: $game_id"
        
        # Test getGame
        test_function "getGame" "{\"gameId\": \"$game_id\"}" "Get game by ID"
        
        # Test getGamesByUser
        test_function "getGamesByUser" "{}" "Get all games for current user"
        
        # Test updateGameTitle
        test_function "updateGameTitle" "{\"gameId\": \"$game_id\", \"gameTitle\": \"Updated Game Title\"}" "Update game title"
        
        # Test updateGamePrizes with flexible prize format
        test_function "updateGamePrizes" "{\"gameId\": \"$game_id\", \"prizes\": {\"1st_place\": \"$100 Gift Card\", \"2nd_place\": \"$50 Amazon Gift Card\", \"top_10\": \"Company Swag\"}}" "Update game prizes with flexible format"
        
        # Test createGame with prizes
        test_function "createGame" '{
            "title": "Game with Prizes",
            "description": "Test Industry",
            "questionCount": 5,
            "difficulty": "medium",
            "categories": ["General Knowledge"],
            "companyName": "Prize Test Company",
            "productDescription": "Testing prize functionality",
            "prizes": [
                {"placement": "1st Place", "prize": "$100"},
                {"placement": "2nd Place", "prize": "$50"},
                {"placement": "Top 10", "prize": "Special Recognition"}
            ]
        }' "Create game with prize array"
        
        # Test updateGame
        test_function "updateGame" "{\"gameId\": \"$game_id\", \"updates\": {\"difficulty\": \"hard\", \"isPublic\": true}}" "Update game properties"
        
        echo
        log_info "=== Testing Question Functions ==="
        
        # Test generateQuestions (this might fail due to missing DeepSeek API key)
        test_function "generateQuestions" "{\"gameId\": \"$game_id\"}" "Generate questions for game"
        
        # Test getQuestions
        test_function "getQuestions" "{\"gameId\": \"$game_id\"}" "Get questions for game"
        
        # Test generateSingleQuestion
        test_function "generateSingleQuestion" "{\"gameId\": \"$game_id\"}" "Generate single question"
        
        echo
        log_info "=== Testing Usage Functions ==="
        
        # Test trackUsage
        test_function "trackUsage" "{\"eventType\": \"test_event\", \"metadata\": {\"test\": \"data\"}}" "Track usage event"
        
        # Test getUsage
        test_function "getUsage" "{}" "Get usage statistics"
        
        echo
        log_info "=== Testing Authentication Requirements ==="
        
        # Test functions without authentication (should fail)
        test_function_unauthenticated "createGame" '{"title": "Unauthenticated Test"}' "Create game without auth"
        test_function_unauthenticated "getGamesByUser" "{}" "Get user games without auth"
        test_function_unauthenticated "updateGame" "{\"gameId\": \"$game_id\", \"updates\": {}}" "Update game without auth"
        
    else
        log_error "Failed to create test game - cannot proceed with dependent tests"
    fi
    
    echo
    log_info "=== Testing Complete ==="
    log_success "All API tests completed"
    
    # Summary
    echo
    log_info "Test Summary:"
    log_info "User ID: $TEST_USER_ID"
    log_info "User Email: $TEST_USER_EMAIL"
    if [ -n "$TEST_GAME_ID" ]; then
        log_info "Test Game ID: $TEST_GAME_ID"
    fi
    log_info "Functions Base URL: $FIREBASE_FUNCTIONS_URL"
}

# Run the tests
run_tests

# Cleanup function (optional - uncomment if you want to delete test data)
# cleanup() {
#     log_info "Cleaning up test data..."
#     # Add cleanup logic here if needed
# }
# trap cleanup EXIT
