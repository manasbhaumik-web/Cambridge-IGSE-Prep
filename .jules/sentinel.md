# Sentinel Security Journal

## 2026-03-05 - Raw Error Message Leakage and Unvalidated Express Payloads
**Vulnerability:** The application's backend API endpoints accepted client requests without validating types, lengths, or bounds. Furthermore, when unexpected exceptions occurred, the raw `error.message` was directly serialized in HTTP 500 responses and leaked to the frontend, exposing internal diagnostic details.
**Learning:** In LLM-integrated Node.js applications, omitting server-side input validation can lead to prompt injection or application state inconsistencies. Simultaneously, returning raw error objects to the client leaks architectural detail (such as library names or API key configurations) when downstreams fail.
**Prevention:** Implement strict type and length boundaries on all incoming request fields using dedicated server-side validation helpers. Isolate client-facing validation errors (which can be safely returned under HTTP 400 with descriptive text) from backend execution faults, which must be logged privately and returned as generic, safe HTTP 500 messages.
