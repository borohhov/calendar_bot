<!--
Sync Impact Report
Version change: template -> 1.0.0
Modified principles:
- Template placeholder 1 -> I. Modular Channel Connectors
- Template placeholder 2 -> II. Canonical Event Model
- Template placeholder 3 -> III. Consent, Privacy, and Data Minimization
- Template placeholder 4 -> IV. Reliable Ingestion & Observability
- Template placeholder 5 -> V. Explainable, Event-Backed Responses
Added sections:
- Architecture & Technology Constraints
- Development Workflow & Quality Gates
Removed sections: None
Templates requiring updates:
- .specify/templates/plan-template.md ✅ updated
- .specify/templates/spec-template.md ✅ no change
- .specify/templates/tasks-template.md ✅ no change
- .specify/templates/commands/*.md ⚠ pending (directory missing)
Follow-up TODOs: None
-->
# Ananda Bot Constitution
<!-- Example: Spec Constitution, TaskFlow Constitution, etc. -->

## Core Principles

### I. Modular Channel Connectors
Each channel integration (WhatsApp, web, email, etc.) MUST be implemented as a
self-contained module with a clear interface for authentication, ingestion,
rate limits, and error handling. Connectors MUST NOT embed cross-channel
business logic. Each connector MUST be independently testable with mocks or
fixtures.

### II. Canonical Event Model
All captured data MUST be normalized into a single canonical Event schema that
is time zone aware and includes provenance (source, confidence, and timestamps).
The calendar view and WhatsApp Q&A MUST read only from canonical events (no
direct connector reads). Ingestion MUST be idempotent with deduplication rules.

### III. Consent, Privacy, and Data Minimization
Ingestion MUST require explicit user authorization per channel and comply with
provider terms. Store only the minimum data needed to answer calendar-related
questions. Secrets MUST be encrypted at rest and in transit. Users MUST be able
to delete or export their data. Logs MUST avoid storing sensitive message
content.

### IV. Reliable Ingestion & Observability
Ingestion MUST be resilient to transient failures (retries, backoff, and a
dead-letter path). No event can be dropped silently; failures MUST be recorded
with structured logs and correlation IDs. The system MUST expose metrics for
ingestion volume, failures, and latency. Backfill/replay MUST be possible for
each connector.

### V. Explainable, Event-Backed Responses
WhatsApp responses MUST be grounded in recorded events and include clear
references (time window, event title, or source). If information is missing or
ambiguous, the assistant MUST ask a clarifying question rather than guess. All
times MUST be expressed with the user's time zone context.

## Architecture & Technology Constraints

- **Runtime**: Node.js with TypeScript is mandatory for all services and tooling.
- **Module layout**: Separate modules for connectors, normalization, storage,
  calendar views, and WhatsApp interactions. Shared domain types live in a
  dedicated `core` or `domain` package.
- **Interfaces**: All module boundaries MUST be expressed via typed contracts
  (TypeScript interfaces or schemas).
- **Storage**: A persistent event store is required; choose the database during
  planning and document it in specs (TODO if unknown).
- **Scheduling**: Channel polling or webhook handling MUST be centralized to
  avoid per-connector cron sprawl.

## Development Workflow & Quality Gates

- **Quality gates**: TypeScript typecheck and lint MUST pass for every change.
- **Testing**: Each connector MUST include integration tests for ingestion and
  normalization. Event normalization MUST include schema validation tests.
- **Review**: Changes to the canonical Event schema or privacy behavior require
  explicit review and migration notes.
- **Docs**: Any new connector MUST include setup docs and rate limit notes.
- **Specification-first**: No implementation is allowed without an approved
  specification. If a spec is missing, work MUST stop and a spec MUST be
  created first.
- **Command preflight**: Any automation or command template MUST read and
  acknowledge this constitution before executing. If it cannot, it MUST abort.

## Governance
<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

This constitution supersedes all other project guidance. Amendments require a
documented rationale, version bump, and review. Every plan/spec MUST include a
Constitution Check confirming adherence to all principles. The LLM MUST refuse
to suggest amendments unless it is creating the required stories for those
amendments. Versioning follows semantic rules: MAJOR for breaking governance
changes, MINOR for new principles or material expansions, PATCH for
clarifications.

**Version**: 1.0.1 | **Ratified**: 2026-01-28 | **Last Amended**: 2026-02-01
<!-- Example: Version: 2.1.1 | Ratified: 2025-06-13 | Last Amended: 2025-07-16 -->
