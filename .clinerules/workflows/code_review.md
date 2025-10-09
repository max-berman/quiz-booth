# Code Review & Build Verification Workflow

## 1. File Selection

- Prompt: "Which files should I review? (List file paths or use wildcards)"
- Input: User provides file paths or patterns (e.g., `src/*.js`)

## 2. Initial Scan

- Action: Cline reads each file and identifies:
  - Syntax errors
  - Common anti-patterns
  - Potential bugs (e.g., null checks, race conditions)
  - Code style violations

## 3. Deep Analysis

- Action: For each file, Cline:
  - Explains each issue found
  - Suggests fixes or improvements
  - References relevant coding standards or best practices

## 4. Interactive Review

- Prompt: "Review my suggestions. Should I apply any fixes automatically?"
- Options:
  - Apply all suggested fixes
  - Review and approve each fix
  - Ignore specific issues

## 5. Apply Approved Changes

- Action: Cline applies the approved fixes to the codebase.

## 6. Run Build Process

- Action: Cline runs the project build command using the commands specified in `memory-bank/techContext.md`.
- Check: Cline verifies that the build completes successfully without errors.
- If errors occur:
  - Cline analyzes and fix the build errors.

## 7. Documentation Update

- Action: If changes are made, Cline updates relevant documentation (e.g., README, CHANGELOG) to reflect improvements.

## 8. Final Report

- Output: Cline generates a summary report of:
  - Issues found and fixed
  - Files modified
  - Build status (success/failure)
  - Recommendations for further improvement
