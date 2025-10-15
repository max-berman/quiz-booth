#!/bin/bash

# Test script for individual LLM provider testing
# This script tests each LLM provider (OpenAI and DeepSeek) individually

AUTH_TOKEN="Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJuYW1lIjoiR3Jhc3MgR3Jhc3MiLCJlbWFpbCI6ImdyYXNzLmdyYXNzLjI4OEBleGFtcGxlLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdXRoX3RpbWUiOjE3NjA0NjcyNTUsInVzZXJfaWQiOiJMWXNiV2NkZWdrUFlsbGhIVTNiemVlaTJ0NU1xIiwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJncmFzcy5ncmFzcy4yODhAZXhhbXBsZS5jb20iXSwiZ29vZ2xlLmNvbSI6WyI4MTQ0Mjc5MjAwMjc2NTkxOTYyMjAzMDg1OTA5ODI4ODQ5MDgxNjY1Il19LCJzaWduX2luX3Byb3ZpZGVyIjoiZ29vZ2xlLmNvbSJ9LCJpYXQiOjE3NjA0NjcyNTUsImV4cCI6MTc2MDQ3MDg1NSwiYXVkIjoidHJpdmlhLWdhbWVzLTdhODFiIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL3RyaXZpYS1nYW1lcy03YTgxYiIsInN1YiI6IkxZc2JXY2RlZ2tQWWxsaEhVM2J6ZWVpMnQ1TXEifQ."
BASE_URL="http://localhost:5001/trivia-games-7a81b/us-central1"

echo "=== Testing Individual LLM Providers ==="
echo

# Function to test a specific LLM provider
test_provider() {
  local provider_name=$1
  echo "=== Testing $provider_name Provider ==="
  echo

  # Step 1: Force the specific provider
  echo "1. Forcing provider: $provider_name"
  FORCE_RESPONSE=$(curl -s -X POST \
    "${BASE_URL}/forceLLMProvider" \
    -H "Authorization: $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "data": {
        "providerName": "'"$provider_name"'"
      }
    }')

  echo "Force provider response: $FORCE_RESPONSE"
  echo

  # Step 2: Create a game
  echo "2. Creating game for $provider_name test..."
  GAME_RESPONSE=$(curl -s -X POST \
    "${BASE_URL}/createGame" \
    -H "Authorization: $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "data": {
        "companyName": "nike.com",
        "industry": "Fashion & Apparel",
        "productDescription": "Shoes",
        "questionCount": 1,
        "difficulty": "medium",
        "categories": ["Company Facts", "Fun Facts"],
        "customCategoryDescription": ""
      }
    }')

  echo "Game creation response: $GAME_RESPONSE"

  # Check if response contains error
  if echo "$GAME_RESPONSE" | grep -q '"error"'; then
    echo "ERROR: Game creation failed for $provider_name"
    return 1
  fi

  # Extract game ID using jq if available, otherwise use grep
  if command -v jq &> /dev/null; then
    GAME_ID=$(echo "$GAME_RESPONSE" | jq -r '.result.id')
  else
    GAME_ID=$(echo "$GAME_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
  fi

  if [ -z "$GAME_ID" ]; then
    echo "ERROR: Failed to extract game ID for $provider_name"
    return 1
  fi

  echo "Game ID: $GAME_ID"
  echo

  # Step 3: Generate questions (this should use the forced provider)
  echo "3. Generating questions with $provider_name for game: $GAME_ID"
  echo "This may take 30-60 seconds..."
  echo

  QUESTION_RESPONSE=$(curl -s -X POST \
    "${BASE_URL}/generateQuestions" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "data": {
        "gameId": "'"$GAME_ID"'"
      }
    }')

  echo "Question generation response:"
  echo "$QUESTION_RESPONSE"
  echo

  # Check if question generation was successful
  if echo "$QUESTION_RESPONSE" | grep -q '"error"'; then
    echo "ERROR: Question generation failed for $provider_name"
    echo "Error details: $QUESTION_RESPONSE"
  else
    echo "SUCCESS: Question generation completed for $provider_name"
    
    # Step 4: Check if questions were saved
    echo "4. Verifying questions were saved for $provider_name..."
    QUESTIONS_COUNT_RESPONSE=$(curl -s -X POST \
      "${BASE_URL}/getGameQuestionsCount" \
      -H "Authorization: Bearer $AUTH_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "data": {
          "gameId": "'"$GAME_ID"'"
        }
      }')

    echo "Questions count response: $QUESTIONS_COUNT_RESPONSE"
    echo
  fi

  # Step 5: Clear forced provider
  echo "5. Clearing forced provider..."
  CLEAR_RESPONSE=$(curl -s -X POST \
    "${BASE_URL}/forceLLMProvider" \
    -H "Authorization: $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "data": {
        "providerName": "clear"
      }
    }')

  echo "Clear provider response: $CLEAR_RESPONSE"
  echo

  echo "=== $provider_name Test Complete ==="
  echo "====================================="
  echo
}

# Test OpenAI provider first
echo "Starting OpenAI provider test..."
test_provider "OpenAI"

# Wait a moment between tests
sleep 5

# Test DeepSeek provider second
echo "Starting DeepSeek provider test..."
test_provider "DeepSeek"

echo "=== All LLM Provider Tests Complete ==="
