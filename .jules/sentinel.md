# Sentinel Security Journal 🛡️

This journal records critical security learnings, unique vulnerability patterns, or rejected security constraints for this application.

## 2026-03-05 - Safe Error Handling and Input Containment in Node/Express AI Backends
**Vulnerability:** Endpoints accepted direct, unsanitized client-side parameters and passed them to AI prompting routines, exposing potential prompt injection, Denial of Service (DoS) via oversized request payloads, and schema disruption. Additionally, internal exceptions leaked detailed stack traces and original library errors directly to the client.
**Learning:** When using Express alongside LLM integration libraries (like `@google/genai`), uncaught exceptions can leak diagnostic internals or Google API keys if the full trace or raw messages are returned. Client-side input must always be strictly vetted for boundaries and structure prior to logic dispatch.
**Prevention:** Use type and boundary validation helpers (like `validateString`, `validateInteger`, and `validateHistory`) at the entry points of all controllers. Distinguish client-side format failures (returning `400 Bad Request` with custom `ValidationError` messages) from backend errors (returning a generic `500 Internal Server Error` and logging actual traces only to standard error).
