# Implementation Plan: WhatsApp-Style Event Chat Webpage

**Branch**: `001-whatsapp-chat-ui` | **Date**: 2026-01-31 | **Spec**: `/Users/dm/code/ananda_bot/specs/001-whatsapp-chat-ui/spec.md`
**Input**: Feature specification from `/Users/dm/code/ananda_bot/specs/001-whatsapp-chat-ui/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Deliver a WhatsApp-style chat webpage served by the existing Node/Fastify app, where users can ask event questions and receive event-backed answers. The UI uses lightweight HTML/CSS/JS with immediate message echo, a typing indicator, and a retry fallback. A minimal JSON API endpoint uses the OpenAI Responses API (structured outputs) to interpret questions and craft responses grounded in canonical event data.

## Technical Context

**Language/Version**: Node.js 20 LTS, TypeScript 5.x  
**Primary Dependencies**: Fastify, Prisma, Luxon (existing); OpenAI API via fetch; no new frontend framework  
**Storage**: PostgreSQL via Prisma for canonical events; no new persistence for web chat session  
**Testing**: Vitest (unit + integration)  
**Target Platform**: Modern evergreen browsers + Node.js server  
**Project Type**: single (server renders/serves the web UI and exposes the API)  
**Performance Goals**: user message echoes in <1s; typical answer returned in <3s; UI maintains smooth scrolling at 60 fps on modern devices  
**Constraints**: accessible, keyboard-friendly UI; responsive layout without horizontal scrolling; avoid logging message content; include support email in no-event fallback  
**Scale/Scope**: single chat session per browser session; no authentication

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Connectors are modular with clear interfaces and independent tests. (Web chat is served as its own route/module, not embedded in other connectors.)
- [x] All features read/write through the canonical Event schema only. (Event answers come from existing canonical event services; no direct connector reads.)
- [x] Consent, privacy, and data minimization requirements are addressed. (No auth; keep messages in-session and avoid storing/logging content.)
- [x] Ingestion reliability and observability (retries, metrics, DLQ) are planned. (No ingestion changes; existing observability remains.)
- [x] WhatsApp responses are event-backed and explainable. (Web chat responses use the same event-backed answer policy and include event references.)

**Post-Design Re-check**: All checks still pass based on the Phase 1 artifacts (data model and API contracts).

## Project Structure

### Documentation (this feature)

```text
specs/001-whatsapp-chat-ui/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── api/
│   └── chatWeb.ts            # New route: serves UI + JSON chat endpoint
├── server.ts
├── app.ts
├── services/
│   └── conversation/
│       └── qaService.ts      # Existing event Q&A logic
├── core/
├── storage/
└── observability/

tests/
├── integration/
│   └── chat-web.test.ts
└── unit/
```

**Structure Decision**: Single project. The web chat UI is served by a Fastify route under `src/api`, and the chat answer logic reuses existing conversation/QA services.

## Complexity Tracking

No constitution violations; no complexity exceptions required.
