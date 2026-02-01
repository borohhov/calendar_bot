---

description: "Task list for feature implementation"
---

# Tasks: Event Capture and WhatsApp Calendar Assistant

**Input**: Design documents from `specs/001-event-capture-chat/`
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/`

**Tests**: No explicit TDD/testing requirement in the spec, so no test tasks are included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create Fastify app/server bootstrap in `src/app.ts` and `src/server.ts`
- [ ] T002 [P] Add environment schema + loader in `src/config/env.ts`
- [ ] T003 [P] Add logging + metrics bootstrap in `src/observability/logger.ts` and `src/observability/metrics.ts`
- [ ] T004 [P] Add core error types + HTTP error handler in `src/core/errors.ts` and `src/api/http/errorHandler.ts`
- [ ] T005 [P] Add HTTP route registry in `src/api/http/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Define Prisma schema for all entities in `prisma/schema.prisma`
- [ ] T007 [P] Add Prisma client wrapper in `src/storage/prisma.ts`
- [ ] T008 [P] Add connector interfaces + shared types in `src/connectors/interfaces.ts`
- [ ] T009 [P] Implement user repository in `src/storage/repositories/userRepository.ts`
- [ ] T010 [P] Implement event + eventSource repositories in `src/storage/repositories/eventRepository.ts`
- [ ] T011 [P] Implement connection/webSource/preference/conversation repositories in `src/storage/repositories/connectionRepository.ts`, `src/storage/repositories/webSourceRepository.ts`, `src/storage/repositories/preferenceRepository.ts`, and `src/storage/repositories/conversationRepository.ts`
- [ ] T012 Define canonical Event model + Zod validation in `src/core/models/event.ts` and `src/core/validation/eventSchemas.ts`
- [ ] T013 Implement normalization pipeline (timezone, completeness, confidence threshold) in `src/ingest/normalizeEvent.ts`
- [ ] T014 Implement dedupe + merge service in `src/services/events/dedupe.ts`
- [ ] T015 Implement event persistence service wiring repo + dedupe in `src/services/events/eventService.ts`
- [ ] T016 Configure BullMQ connection + queues in `src/scheduler/queues.ts`
- [ ] T017 Implement scheduler worker with retries + DLQ in `src/scheduler/worker.ts`
- [ ] T018 Implement repeatable job registry for web sources in `src/scheduler/scheduler.ts`
- [ ] T019 [P] Implement web extraction utilities (Cheerio + JSON-LD) in `src/connectors/web/extractors.ts`
- [ ] T020 [P] Implement WhatsApp provider client wrapper in `src/connectors/whatsapp/client.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Capture events into a calendar (Priority: P1) 🎯 MVP

**Goal**: Connect WhatsApp + web sources to capture events and show them in a calendar view.

**Independent Test**: Provide a known event web page and a WhatsApp message containing an event; confirm both appear as calendar entries with time and location.

### Implementation for User Story 1

- [ ] T021 [P] [US1] Implement web source service (CRUD + schedule updates) in `src/services/webSources.ts`
- [ ] T022 [US1] Implement web sources routes in `src/api/http/routes/webSources.ts`
- [ ] T023 [P] [US1] Implement WhatsApp connection service in `src/services/connections.ts`
- [ ] T024 [US1] Implement WhatsApp connection routes in `src/api/http/routes/whatsappConnections.ts`
- [ ] T025 [US1] Implement WhatsApp webhook handler (ingest entry point) in `src/api/webhooks/whatsapp.ts`
- [ ] T026 [US1] Implement WhatsApp message ingest pipeline in `src/ingest/whatsappIngest.ts`
- [ ] T027 [US1] Implement web crawl job processor in `src/scheduler/jobs/webCrawlJob.ts`
- [ ] T028 [US1] Implement web ingest pipeline in `src/ingest/webIngest.ts`
- [ ] T029 [US1] Implement event query service (list/detail/delete/export helpers) in `src/services/events/eventQueryService.ts`
- [ ] T030 [US1] Implement events list/detail/delete routes in `src/api/http/routes/events.ts`
- [ ] T031 [US1] Implement events export route in `src/api/http/routes/eventsExport.ts`

**Checkpoint**: User Story 1 should be fully functional and independently testable

---

## Phase 4: User Story 2 - Ask about events over WhatsApp (Priority: P2)

**Goal**: Answer WhatsApp queries about events with clear responses and clarifications.

**Independent Test**: Ask "What events are happening this weekend?" and verify the response lists the correct events with details.

### Implementation for User Story 2

- [ ] T032 [US2] Implement conversation context store (persist + fetch) in `src/services/conversation/contextStore.ts`
- [ ] T033 [US2] Implement query parser with chrono-node date range extraction in `src/services/conversation/queryParser.ts`
- [ ] T034 [US2] Implement Q&A response builder using event queries in `src/services/conversation/qaService.ts`
- [ ] T035 [US2] Implement message router for intent + clarifications in `src/services/conversation/messageRouter.ts`
- [ ] T036 [US2] Wire webhook to conversation router + outbound replies in `src/api/webhooks/whatsapp.ts`

**Checkpoint**: User Story 2 should work independently with stored events

---

## Phase 5: User Story 3 - Get recommendations on what to attend (Priority: P3)

**Goal**: Provide recommendations based on preferences and availability.

**Independent Test**: Provide preferences and overlapping events; ask for recommendations and confirm suitable options are returned.

### Implementation for User Story 3

- [ ] T037 [US3] Implement preference service CRUD in `src/services/recommendations/preferencesService.ts`
- [ ] T038 [US3] Implement preferences routes in `src/api/http/routes/preferences.ts`
- [ ] T039 [US3] Implement recommendation scoring engine in `src/services/recommendations/recommendationService.ts`
- [ ] T040 [US3] Implement recommendation intent routing in `src/services/conversation/intentRouter.ts`
- [ ] T041 [US3] Extend Q&A responses for recommendations in `src/services/conversation/qaService.ts`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T042 [P] Update quickstart with endpoints + webhook flow in `specs/001-event-capture-chat/quickstart.md`
- [ ] T043 [P] Update requirements checklist coverage in `specs/001-event-capture-chat/checklists/requirements.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational (Phase 2) - no dependencies on other stories
- **User Story 2 (P2)**: Starts after Foundational (Phase 2) - integrates with events from US1 but should be independently testable
- **User Story 3 (P3)**: Starts after Foundational (Phase 2) - uses preferences + events, should be independently testable

### Parallel Opportunities

- Setup tasks marked [P] can run in parallel
- Foundational tasks marked [P] can run in parallel (after T006)
- After Foundational completion, US1/US2/US3 can proceed in parallel by different developers
- Within each story, tasks marked [P] can be parallelized

---

## Parallel Example: User Story 1

Task: "Implement web source service (CRUD + schedule updates) in `src/services/webSources.ts`"
Task: "Implement WhatsApp connection service in `src/services/connections.ts`"

## Parallel Example: User Story 2

Task: "Implement conversation context store (persist + fetch) in `src/services/conversation/contextStore.ts`"
Task: "Implement query parser with chrono-node date range extraction in `src/services/conversation/queryParser.ts`"

## Parallel Example: User Story 3

Task: "Implement preference service CRUD in `src/services/recommendations/preferencesService.ts`"
Task: "Implement recommendation scoring engine in `src/services/recommendations/recommendationService.ts`"

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories
