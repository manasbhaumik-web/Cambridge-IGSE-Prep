# Sentinel's Journal

Welcome to Sentinel's security journal. Below are critical learnings regarding security vulnerabilities, patterns, and mitigations in this codebase.

## 2026-08-04 - Server-Side Request Body Validation and Error Handling Enhancement
**Vulnerability:**
The application server endpoints lacked input parameter type, length, and bounds validation on incoming HTTP POST requests (`/api/ai/generate-question`, `/api/ai/tutor`, `/api/ai/reading-assistance`, `/api/ai/online-igcse-material`). Furthermore, unexpected server-side errors leaked full backend stack traces/error messages back to clients, potentially exposing API internals or diagnostic information.

**Learning:**
Relying solely on frontend validation is insecure. Malicious users can bypass client-side validation and submit malformed or oversized payloads directly to backend handlers (e.g., extremely large chat history arrays leading to out-of-memory denial-of-service). Additionally, raw catch blocks that return exact error details leak sensitive diagnostic/stack trace information.

**Prevention:**
1. Implement rigorous validation helper functions (`validateString`, `validateInteger`) to check types, lengths, and numerical boundaries of all user-supplied input parameters on the server side.
2. Gracefully handle client-side validation failures by returning clear HTTP 400 response status codes with the validation message.
3. Handle unexpected backend failures generically (HTTP 500) while logging the diagnostic error details internally, ensuring no stack traces or developer-level error messages are leaked to the client.
4. Suppress the application server bootstrap during automated unit and integration tests using environment flags (e.g., `process.env.NODE_ENV === "test"`).
