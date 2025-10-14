#!/bin/bash

# Simple test script for question generation flow
# This script tests the core functionality without complex error handling

AUTH_TOKEN="Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJuYW1lIjoiR3Jhc3MgR3Jhc3MiLCJlbWFpbCI6ImdyYXNzLmdyYXNzLjI4OEBleGFtcGxlLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdXRoX3RpbWUiOjE3NjA0NjcyNTUsInVzZXJfaWQiOiJMWXNiV2NkZWdrUFlsbGhIVTNiemVlaTJ0NU1xIiwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJncmFzcy5ncmFzcy4yODhAZXhhbXBsZS5jb20iXSwiZ29vZ2xlLmNvbSI6WyI4MTQ0Mjc5MjAwMjc2NTkxOTYyMjAzMDg1OTA5ODI4ODQ5MDgxNjY1Il19LCJzaWduX2luX3Byb3ZpZGVyIjoiZ29vZ2xlLmNvbSJ9LCJpYXQiOjE3NjA0NjcyNTUsImV4cCI6MTc2MDQ3MDg1NSwiYXVkIjoidHJpdmlhLWdhbWVzLTdhODFiIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL3RyaXZpYS1nYW1lcy03YTgxYiIsInN1YiI6IkxZc2JXY2RlZ2tQWWxsaEhVM2J6ZWVpMnQ1TXEifQ."
BASE_URL="http://localhost:5001/trivia-games-7a81b/us-central1"

echo "=== Simple Test: Question Generation Flow ==="
echo

# Step 1: Create a game
echo "1. Creating game..."
GAME_RESPONSE=$(curl -s -X POST \
  "${BASE_URL}/createGame" \
  -H "Authorization: $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "companyName": "naknick.com",
      "industry": "Technology",
      "productDescription": "test product description",
      "questionCount": 5,
      "difficulty": "easy",
      "categories": ["Company Facts"],
      "customCategoryDescription": ""
    }
  }')

echo "Game creation response: $GAME_RESPONSE"

# Check if response contains error
if echo "$GAME_RESPONSE" | grep -q '"error"'; then
    echo "ERROR: Game creation failed"
    exit 1
fi

# Extract game ID using jq if available, otherwise use grep
if command -v jq &> /dev/null; then
    GAME_ID=$(echo "$GAME_RESPONSE" | jq -r '.result.id // .id // empty')
else
    GAME_ID=$(echo "$GAME_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    if [ -z "$GAME_ID" ]; then
        GAME_ID=$(echo "$GAME_RESPONSE" | grep -o '"result":{[^}]*"id":"[^"]*' | cut -d'"' -f6)
    fi
fi

if [ -z "$GAME_ID" ]; then
    echo "ERROR: Failed to extract game ID from response: $GAME_RESPONSE"
    exit 1
fi

echo "Game ID: $GAME_ID"
echo

# Step 2: Generate questions
echo "2. Generating questions for game: $GAME_ID"
echo "This may take 30-60 seconds..."
echo

QUESTION_RESPONSE=$(curl -s -X POST \
  "${BASE_URL}/generateQuestions" \
  -H "Authorization: $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "gameId": "'"$GAME_ID"'"
    }
  }')

echo "Question generation response:"
echo "$QUESTION_RESPONSE"
echo

# Check if question generation succeeded
if echo "$QUESTION_RESPONSE" | grep -q '"error"'; then
    echo "ERROR: Question generation failed"
    exit 1
fi

# Step 3: Check if questions were saved
echo "3. Verifying questions were saved..."
QUESTIONS_COUNT_RESPONSE=$(curl -s -X POST \
  "${BASE_URL}/getGameQuestionsCount" \
  -H "Authorization: $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "gameId": "'"$GAME_ID"'"
    }
  }')

echo "Questions count response: $QUESTIONS_COUNT_RESPONSE"
echo

# Extract question count
if command -v jq &> /dev/null; then
    QUESTION_COUNT=$(echo "$QUESTIONS_COUNT_RESPONSE" | jq -r '.result.count')
else
    QUESTION_COUNT=$(echo "$QUESTIONS_COUNT_RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
fi

if [ -n "$QUESTION_COUNT" ] && [ "$QUESTION_COUNT" -gt 0 ]; then
    echo "✅ SUCCESS: $QUESTION_COUNT questions generated and saved successfully!"
else
    echo "❌ ERROR: No questions found in database"
    exit 1
fi

echo
echo "=== Test Complete ==="
