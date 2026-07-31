# Sentinel Security Journal

This journal records critical security learnings, vulnerability patterns, and architectural security decisions specific to this codebase.

## 2026-03-30 - Secure Input Validation & Error Handling on AI Endpoints
**Vulnerability:** Input data types and bounds on Express/Gemini integration endpoints were unvalidated, and try/catch blocks on those endpoints leaked internal system/API diagnostic details (e.g., raw API exception messages, stack-like error descriptions) to clients.
**Learning:** Raw application/external API errors directly returned to public clients leak configuration details, parameter constraints, and SDK internals. Proper type, length, and bounds checking at boundaries prevents input-based DoS and model abuse.
**Prevention:** Always validate public endpoint inputs (types, lengths, bounds) before execution and catch all unexpected runtime exceptions internally to log them, returning user-safe HTTP 400 for validation errors or HTTP 500 with generic safe error messages.
