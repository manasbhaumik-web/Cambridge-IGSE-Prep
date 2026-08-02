# Sentinel Security Journal 🛡️

## 2026-03-05 - Secure Input Validation & Error Handling in AI Endpoints
**Vulnerability:** Lack of server-side input validation on API endpoints and raw diagnostic details leakage in HTTP 500 error responses, which could lead to API key disclosure, server resources exhaustion (DoS), and prompt injection vulnerabilities.
**Learning:** Web applications relying heavily on AI models for dynamic content generation must rigorously inspect and bound incoming parameters before passing them to external models. Trusting client-side validation is insufficient and exposes the system to raw, uncontrolled prompts or malicious payloads. In addition, catching database or model integration errors without scrubbing raw messages leaks backend internals.
**Prevention:** Implement server-side schema verification for types, lengths, and bounds. Differentiate validation exceptions (HTTP 400) from unexpected server exceptions (HTTP 500 with generic feedback) to fail securely.
