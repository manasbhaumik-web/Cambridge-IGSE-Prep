# Sentinel Security Journal

## 2026-03-05 - Secure Input Validation & Error Handling in Gemini App
**Vulnerability:** Input validation gaps and diagnostic leakage.
- The `/api/ai/*` POST endpoints in `server.ts` accepted unvalidated JSON inputs (like `subject`, `topic`, `message`, `text`, `grade`) without verifying types, lengths, bounds, or formats.
- Errors thrown during API execution leaked internal stack traces or exact Gemini client errors (via `error.message`), leading to information disclosure and diagnostic details leakage.

**Learning:**
- In modern Node.js applications, failure to validate fields at boundaries like HTTP request parameters leaves the application vulnerable to Denial of Service (DoS) through giant inputs, or unexpected runtime exceptions.
- Directly returning runtime errors from API calls (like GoogleGenAI service failures) exposes internal operational details, paths, and integration issues that malicious actors can leverage.

**Prevention:**
- Create distinct validation helpers (`validateString`, `validateInteger`) to systematically sanitize and boundary-check inputs.
- Define a custom `ValidationError` representing user-input violations.
- Distinguish user-input failures (HTTP 400 with precise feedback) from internal backend faults (HTTP 500 with a generic secure message).
- Ensure server bootstrapping is bypassed during testing to prevent EADDRINUSE conflicts while loading the application programmatically.
