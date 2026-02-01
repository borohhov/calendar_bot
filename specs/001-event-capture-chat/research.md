# Research: Event Capture and WhatsApp Calendar Assistant

## Decision: API framework
**Decision**: Use Fastify for HTTP and webhook endpoints.
**Rationale**: Strong performance, built-in schema validation hooks, and a clean
plugin model for modular connectors.
**Alternatives considered**: Express (simpler but fewer built-in primitives),
NestJS (heavier framework and more ceremony).

## Decision: Database and ORM
**Decision**: PostgreSQL with Prisma ORM.
**Rationale**: Relational modeling fits event provenance and dedupe; Prisma
provides migrations and typed queries aligned with TypeScript.
**Alternatives considered**: SQLite (insufficient for concurrency), MongoDB
(less suitable for relational constraints and dedupe joins).

## Decision: Job scheduling and retries
**Decision**: BullMQ with Redis for scheduled crawling, retries, and DLQ.
**Rationale**: Centralized scheduling with repeatable jobs and backoff policies
meets reliability and observability requirements.
**Alternatives considered**: node-cron (no queue or DLQ), Agenda (less active
maintenance).

## Decision: Web crawling and extraction
**Decision**: Use node-fetch + Cheerio with JSON-LD/schema.org extraction and
fallback regex parsing.
**Rationale**: Many event pages publish structured data; Cheerio enables
deterministic extraction without heavy browser automation.
**Alternatives considered**: Headless browser (higher operational cost).

## Decision: Date/time parsing
**Decision**: Luxon for time zones and chrono-node for natural language parsing.
**Rationale**: Luxon offers robust time zone handling; chrono-node helps parse
relative phrases from messages.
**Alternatives considered**: date-fns (no built-in time zone support).

## Decision: Observability
**Decision**: Pino for structured logs and Prometheus metrics exporter.
**Rationale**: Low overhead logging and standard metrics integration for
ingestion volume, failures, and latency.
**Alternatives considered**: Winston (heavier), OpenTelemetry only (larger
setup footprint).

## Decision: WhatsApp connector approach
**Decision**: Integrate with an Evolution API-style provider via HTTP + webhook
callbacks, managed through a dedicated connector module.
**Rationale**: Matches the non-official integration requirement while keeping
provider-specific code isolated.
**Alternatives considered**: Official WhatsApp Business API (explicitly out of
scope).
