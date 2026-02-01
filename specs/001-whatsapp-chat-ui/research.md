# Research: WhatsApp-Style Event Chat Webpage

**Feature**: `/Users/dm/code/ananda_bot/specs/001-whatsapp-chat-ui/spec.md`
**Date**: January 31, 2026

## Decisions

### 1) UI delivery approach
- **Decision**: Serve a single HTML page from the Fastify app (GET `/chat`) with lightweight, vanilla JS and CSS (no separate frontend build).
- **Rationale**: Keeps the feature in the existing Node/TypeScript stack, minimizes tooling, and accelerates iteration for a basic UI.
- **Alternatives considered**: Separate frontend app with a build pipeline (more overhead); server-side templates (less flexible for interactive chat).

### 2) Chat exchange protocol
- **Decision**: Use a simple JSON API (`POST /api/chat/messages`) that returns the full assistant message and any event references in one response; the client shows a typing indicator while awaiting the response.
- **Rationale**: Meets the UX requirement without introducing WebSocket/SSE complexity and keeps server logic stateless.
- **Alternatives considered**: WebSocket or SSE streaming (more complex); polling with message IDs (unnecessary for MVP).

### 3) Conversation context handling
- **Decision**: Keep conversation history in the browser session and submit only the latest user question to the API; the backend answers each question independently from canonical events.
- **Rationale**: Avoids storing message content, reduces privacy risk, and aligns with a no-auth MVP.
- **Alternatives considered**: Persist conversation history in the database (more state, privacy concerns); include full transcript in every request (larger payloads).

### 4) Event answer source
- **Decision**: Reuse the existing event Q&A service to generate responses from the canonical Event model and include event references (title/time) when available.
- **Rationale**: Aligns with the constitution’s event-backed response requirement and prevents duplicating business logic.
- **Alternatives considered**: Direct DB queries inside the route (breaks modularity); external LLM-only answers (not event-backed).

### 5) LLM integration
- **Decision**: Use the OpenAI Responses API with structured outputs (JSON schema) to interpret date ranges and draft responses grounded in canonical events.
- **Rationale**: Ensures predictable parsing and keeps responses aligned to known events while adding a natural language layer.
- **Alternatives considered**: Regex/chrono-only parsing (less flexible); unstructured LLM output (less reliable to parse).

## Best Practices Notes

- Keep message content out of logs and metrics; track only counts and latency.
- Ensure keyboard-friendly input and visible focus states for accessibility.
- Use responsive layout constraints to keep the chat composer visible on mobile.
