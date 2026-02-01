# Tasks: Event Site Crawler

**Branch**: `002-event-crawler`  
**Date**: January 31, 2026  
**Spec**: `/Users/dm/code/ananda_bot/specs/002-event-crawler/spec.md`  
**Plan**: `/Users/dm/code/ananda_bot/specs/002-event-crawler/plan.md`

## Dependency Graph

- P1 (US1) → P2 (US2) → P3 (US3)

## Parallel Execution Examples

- **US1**: API handler (`src/api/crawl-jobs.ts`) and crawler worker (`src/ingest/web-crawler/worker.ts`) can proceed in parallel after foundational tasks.
- **US2**: Link discovery heuristics (`src/ingest/web-crawler/link-discovery.ts`) and event extraction (`src/ingest/web-crawler/extract-event.ts`) can proceed in parallel.
- **US3**: Dedup service (`src/services/event-dedupe.ts`) and persistence mapping (`src/storage/event-writer.ts`) can proceed in parallel.

## Implementation Strategy

Deliver MVP by completing Phase 3 (US1) end-to-end with a minimal crawler depth, event extraction, and job reporting. Add richer link traversal (US2) and dedup (US3) incrementally.

## Phase 1: Setup

- [ ] T001 Create crawler module directories in `src/connectors/web-crawler/` and `src/ingest/web-crawler/`
- [ ] T002 Add skeleton API route file `src/api/crawl-jobs.ts` and register in `src/app.ts`
- [ ] T003 Add BullMQ queue setup for crawler in `src/services/crawl-queue.ts`

## Phase 2: Foundational

- [ ] T004 Define Zod schemas for crawl job input/output in `src/core/crawl-schemas.ts`
- [ ] T005 Add URL canonicalization utilities in `src/ingest/web-crawler/url-utils.ts`
- [ ] T006 Add fetch client with timeouts/content limits in `src/ingest/web-crawler/fetcher.ts`
- [ ] T007 Add crawl job persistence helpers in `src/storage/crawl-jobs.ts`
- [ ] T008 Add crawl page persistence helpers in `src/storage/crawl-pages.ts`

## Phase 3: User Story 1 (P1) - Submit Crawl Job and Capture Events

**Story Goal**: Accept crawl requests, run a depth-limited crawl, extract event basics, summarize, and store job results.

**Independent Test**: POST `/api/crawl-jobs` with a known events page and verify stored events plus job report counts.

- [ ] T009 [US1] Implement POST `/api/crawl-jobs` handler in `src/api/crawl-jobs.ts`
- [ ] T010 [US1] Enqueue crawl job with BullMQ in `src/services/crawl-queue.ts`
- [ ] T011 [US1] Implement crawl worker entry in `src/ingest/web-crawler/worker.ts`
- [ ] T012 [US1] Implement depth-limited traversal in `src/ingest/web-crawler/crawler.ts`
- [ ] T013 [US1] Implement basic event extraction (title, date, source URL) in `src/ingest/web-crawler/extract-event.ts`
- [ ] T014 [US1] Implement summary generation in `src/ingest/web-crawler/summarize.ts`
- [ ] T015 [US1] Persist events + event sources in `src/storage/event-writer.ts`
- [ ] T016 [US1] Update crawl job metrics (pages visited/failed/events) in `src/storage/crawl-jobs.ts`
- [ ] T017 [US1] Implement GET `/api/crawl-jobs/:id` in `src/api/crawl-jobs.ts`

## Phase 4: User Story 2 (P2) - Follow Links to Event Detail Pages

**Story Goal**: Follow listing-page links to capture detail-page descriptions.

**Independent Test**: Run crawl against a listing page that links to event details and verify descriptions are extracted from detail pages.

- [ ] T018 [US2] Implement link discovery rules in `src/ingest/web-crawler/link-discovery.ts`
- [ ] T019 [P] [US2] Enhance extraction to prefer detail pages in `src/ingest/web-crawler/extract-event.ts`
- [ ] T020 [P] [US2] Store discovered-from metadata in `src/storage/crawl-pages.ts`

## Phase 5: User Story 3 (P3) - Avoid Duplicate Events Within a Crawl

**Story Goal**: Deduplicate events captured from multiple pages within a job.

**Independent Test**: Crawl a site with duplicate references and verify only one event is stored with multiple sources.

- [ ] T021 [US3] Implement dedupe key generation in `src/services/event-dedupe.ts`
- [ ] T022 [P] [US3] Apply dedupe before persistence in `src/storage/event-writer.ts`
- [ ] T023 [P] [US3] Record multi-source links in `src/storage/event-writer.ts`

## Phase 6: Polish & Cross-Cutting

- [ ] T024 Add metrics for crawl volume/failures in `src/observability/metrics.ts`
- [ ] T025 Add structured error logging with correlation IDs in `src/observability/logger.ts`
- [ ] T026 Add API endpoint to list job events `GET /api/crawl-jobs/:id/events` in `src/api/crawl-jobs.ts`
- [ ] T027 Add README/update docs for crawler usage in `specs/002-event-crawler/quickstart.md`

## Task Summary

- Total tasks: 27
- Tasks by story: US1 (9), US2 (3), US3 (3)
- Parallel opportunities: T019/T020, T022/T023
- MVP scope: Phase 3 (US1) end-to-end

## Format Validation

All tasks follow the required checklist format with IDs, story labels, and file paths.
