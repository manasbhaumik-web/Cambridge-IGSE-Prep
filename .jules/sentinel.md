## 2026-07-29 - [Secure Error Handling and Input Validation]
**Vulnerability:** API endpoints lack input type/length/bounds validation and leak raw error messages to the client.
**Learning:** Raw application errors containing system context can leak internal diagnostics, while unvalidated inputs increase denial of service (DoS) and model manipulation risks.
**Prevention:** Implement strict type and bounds validation helpers for strings and integers, and catch/log all exceptions internally, returning secure generic error responses.
