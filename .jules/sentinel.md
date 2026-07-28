## 2026-03-05 - [Reusable Input Validation and Error Sanitization Pattern]
**Vulnerability:** Under-validated user parameters fed to LLM prompt constructions, combined with raw error message leakage to endpoints, exposing the system to prompt injection, buffer overflow, and diagnostic information leakage.
**Learning:** Destructuring request parameters directly from `req.body` without type or boundary validation lets attackers send malicious payloads. Furthermore, exposing `error.message` on API failure leaks implementation details and API structures.
**Prevention:**
1. Use strong type, length, and range validation for strings, integers, and structured arrays (such as history) before invoking downstream API calls.
2. Intercept and genericize non-validation errors before returning them to client-side. Keep precise, private logs on the server side, but only send sanitize messages (e.g., "Failed to generate question. Please try again later.") to the client.
