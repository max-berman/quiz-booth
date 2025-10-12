# Code Review & Build Verification Workflow

## Purpose

This workflow automates the process of reviewing code for mistakes, applying improvements, and verifying the build process to ensure everything works as expected.

---

## 1. File Selection

- **Prompt:** "Which files or directories should I review? (List file paths or use wildcards, e.g., `src/**/*.js`)"
- **Input:** User provides file paths or patterns.
- **Action:** Cline lists the files to be reviewed and asks for confirmation.

---

## 2. Initial Code Scan

- **Action:** Cline scans each file for:
  - Syntax errors
  - Common anti-patterns
  - Potential bugs (e.g., null checks, race conditions, unhandled promises)
  - Code style violations (based on `.clinerules/01-coding.md`)
- **Output:** A list of issues found, categorized by severity (critical, warning, info).

---

## 3. Interactive Review & Fixes

- **Prompt:** "Here are the issues found. How would you like to proceed?"
  - Apply all suggested fixes automatically
  - Review and approve each fix individually
  - Ignore specific issues
- **Action:** Cline applies approved fixes to the codebase.

---

## 4. Run Build Process

- **Action:** Cline runs the project build command using the commands specified in `memory-bank/techContext.md`.
- **Check:** Cline monitors the build output and verifies success.
- **If errors occur:**
  - Cline analyzes and reports the build errors in detail.
  - **Prompt:** "Build failed. Should I attempt to fix the errors, or would you like to address them manually?"

---

## 5. Documentation Update

- **Action:** If changes were made, Cline updates relevant documentation:
  - Updates `CHANGELOG.md` with a summary of changes.
  - Ensures `README.md` reflects any new dependencies or build steps.

---

## 6. Final Report

- **Output:** Cline generates a summary report including:
  - Issues found and fixed
  - Files modified
  - Build status (success/failure)
  - Build logs (if applicable)
  - Recommendations for further improvement

---

## 7. Next Steps

- **Prompt:** "Review complete. Would you like to:
  - Draft a message for the team about these changes?
  - Start a new review for another set of files?
  - Save this session to the memory bank for future reference?"

---

## Notes

- This workflow assumes `memory-bank/techContext.md` contains up-to-date build commands (e.g., `build_command: "npm run build"`).
- For large projects, consider breaking the review into smaller tasks using `/new_task`.
