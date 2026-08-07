## 2026-08-07 - Secure Backend Input Validation and Error Sanitization
**Vulnerability:** Input fields in API endpoints lacks rigorous type, length, and boundary checking, and unexpected errors are allowed to return detailed developer diagnostics or error messages directly to the client, leading to potential Information Leakage or Denial of Service (DoS) through input overflow.
**Learning:** Raw inputs in key POST endpoints (`/api/ai/*`) are directly processed without validating string lengths or correct types. Unhandled exception pathways (such as upstream API failures or parsed JSON anomalies) could leak developer details, system internals, or crash the server.
**Prevention:**
1. Introduce standardized validator utilities (`validateString`, `validateInteger`) validating types, lengths, and bounds.
2. Create a custom `ValidationError` class to distinguish user-facing input validation issues from internal system failures.
3. Catch all errors in API endpoints; return structured validation details for HTTP 400 and generic error messages for HTTP 500 while logging full diagnostic details securely on the server.
