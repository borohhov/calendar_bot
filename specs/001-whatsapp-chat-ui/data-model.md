# Data Model: WhatsApp-Style Event Chat Webpage

**Feature**: `/Users/dm/code/ananda_bot/specs/001-whatsapp-chat-ui/spec.md`
**Date**: January 31, 2026

## Existing Canonical Entities (unchanged)

### Event
- **Purpose**: Canonical event record used for answers.
- **Key fields**: id, userId, title, startAt, endAt, timezone, locationName, status, confidence.
- **Validation**:
  - title required.
  - timezone required (default to user timezone when missing).

## Session-Scoped Entities (not persisted)

### ConversationSession
- **Purpose**: Represents a single browser session’s chat state.
- **Fields**:
  - id (client-generated)
  - createdAt
  - locale/timezone
  - messages (ordered list of Message)
- **Validation**:
  - id required.
  - messages ordered by timestamp.

### Message
- **Purpose**: A single chat message displayed in the UI.
- **Fields**:
  - id (client-generated)
  - sender (user | assistant)
  - text
  - timestamp
  - status (pending | sent | failed)
  - eventReferences (array of EventReference)
  - kind (answer | no_answer | clarify)
- **Validation**:
  - text required and non-empty for user messages.
  - status transitions: pending → sent | failed.

### EventReference
- **Purpose**: Explainable reference for an assistant answer.
- **Fields**:
  - eventId
  - title
  - startAt
  - timezone
  - sourceLabel (optional)
- **Validation**:
  - eventId required when provided.

## State Transitions

- **Message**: pending → sent | failed
- **ConversationSession**: append-only (messages are added in chronological order)

## Notes

- No new database tables are required for this feature.
- Server responses should reference canonical Event records by id to meet explainability requirements.
