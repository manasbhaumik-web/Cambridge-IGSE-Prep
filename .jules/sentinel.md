# Sentinel Security Journal 🛡️

This journal is used to document CRITICAL security learnings, vulnerability patterns, or rejected security changes with important constraints discovered during development.

## 2026-03-01 - [API Error Leakage and Input Validation in LLM Endpoints]
**Vulnerability:** Input fields to LLM APIs (e.g. topic, grade, numQuestions) were unvalidated, exposing endpoints to Prompt Injection, payload inflation (DoS), and crash vectors. Furthermore, error handling was returning raw `error.message` to clients, exposing internal API details, model configurations, and package structures.
**Learning:** Without strict input validation on parameters integrated directly into LLM prompts, malicious payloads can hijack model instructions or trigger resource-heavy operations (like generating 10,000 questions). Raw error messaging leaks system diagnostics, helping attackers map the application architecture.
**Prevention:** Implement clear string length constraints, type assertions, and integer boundaries on all parameters from request bodies before passing them downstream. Standardize error handlers to log detailed traces internally but return generalized, secure error feedback to clients.
