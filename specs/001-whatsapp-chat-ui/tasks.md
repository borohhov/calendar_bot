---

description: "Task list for WhatsApp-style event chat webpage"
---

# Tasks: WhatsApp-Style Event Chat Webpage

**Input**: Design documents from `/specs/001-whatsapp-chat-ui/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/
**Tests**: Not requested in spec; no test tasks included.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Includes exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create Fastify route module skeleton for web chat in `src/api/http/routes/chatWeb.ts`
- [ ] T002 Register web chat routes in `src/api/http/index.ts` with prefix `/chat`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [ ] T003 Add shared request/response types and input validation helpers in `src/api/http/routes/chatWeb.ts` (use `ValidationError` from `src/core/errors.ts`)
- [ ] T004 Define web chat response helpers in `src/services/conversation/webChatService.ts` for consistent payloads
- [ ] T005 [P] Add OpenAI client wrapper and request helper in `src/services/llm/openaiClient.ts`
- [ ] T006 Add environment configuration for `OPENAI_API_KEY` and optional `OPENAI_MODEL` in `src/config/env.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Ask an event question (Priority: P1) 🎯 MVP

**Goal**: User can ask an event question and receive an event-backed answer in a WhatsApp-like chat UI.

**Independent Test**: Open `/chat`, send a question, and confirm the user bubble appears immediately and the assistant reply returns with event references.

### Implementation for User Story 1

- [ ] T007 [P] [US1] Build WhatsApp-style UI (header, message list, composer, bubbles, typing indicator placeholder) in `src/api/http/views/chat.html`
- [ ] T008 [P] [US1] Implement LLM-backed parsing/answer composition in `src/services/conversation/webChatService.ts` using `openaiClient`, `listEvents`, and event references
- [ ] T009 [US1] Serve `src/api/http/views/chat.html` from GET `/chat` in `src/api/http/routes/chatWeb.ts`
- [ ] T010 [US1] Implement POST `/chat/messages` in `src/api/http/routes/chatWeb.ts` to call `webChatService` and return JSON without logging message content
- [ ] T011 [US1] Implement client-side send flow (append user bubble, clear input, show typing state, render assistant reply, auto-scroll) in `src/api/http/views/chat.html`

**Checkpoint**: User Story 1 functional and independently testable

---

## Phase 4: User Story 2 - Review conversation context (Priority: P2)

**Goal**: User can scroll back and read earlier messages while continuing the chat.

**Independent Test**: Send multiple messages, scroll up to older ones, and confirm new messages do not break scroll behavior.

### Implementation for User Story 2

- [ ] T012 [US2] Ensure the conversation area is scrollable with stable layout on desktop and mobile in `src/api/http/views/chat.html`
- [ ] T013 [US2] Add smart auto-scroll (only jump to bottom if user is near bottom) in `src/api/http/views/chat.html`

**Checkpoint**: User Story 2 functional and independently testable

---

## Phase 5: User Story 3 - Handle unanswered questions (Priority: P3)

**Goal**: If no answer is available, user sees a friendly fallback and can retry.

**Independent Test**: Ask a question with no matching events and confirm fallback message and retry action appear and function.

### Implementation for User Story 3

- [ ] T014 [P] [US3] Return `no_answer` responses with email instruction when no events found in `src/services/conversation/webChatService.ts`
- [ ] T015 [US3] Propagate `no_answer` and `retryAllowed` in POST `/chat/messages` in `src/api/http/routes/chatWeb.ts`
- [ ] T016 [US3] Render fallback bubble, email instruction, and retry button that re-sends the last question in `src/api/http/views/chat.html`

**Checkpoint**: All user stories functional and independently testable

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T017 [P] Add accessibility improvements (ARIA labels, focus styles, keyboard send hints) in `src/api/http/views/chat.html`
- [ ] T018 Verify and update `/specs/001-whatsapp-chat-ui/quickstart.md` with any final endpoint or setup changes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - no dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational; builds on the chat UI from US1
- **User Story 3 (P3)**: Can start after Foundational; builds on the chat API/UI from US1

### Parallel Opportunities

- T007 and T008 can run in parallel (different files)
- T014 can run in parallel with T016 (service + UI)

---

## Parallel Example: User Story 1

```bash
Task: "Build WhatsApp-style UI in src/api/http/views/chat.html"
Task: "Implement event-backed answer logic in src/services/conversation/webChatService.ts"
```

## Parallel Example: User Story 3

```bash
Task: "Return no_answer responses in src/services/conversation/webChatService.ts"
Task: "Render fallback and retry UI in src/api/http/views/chat.html"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Stop and validate User Story 1 independently

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. Add User Story 1 → validate MVP
3. Add User Story 2 → validate
4. Add User Story 3 → validate
5. Polish cross-cutting concerns
