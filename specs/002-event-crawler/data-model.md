# Data Model: Event Site Crawler

**Feature**: `/Users/dm/code/ananda_bot/specs/002-event-crawler/spec.md`
**Date**: January 31, 2026

## Existing Canonical Entities (unchanged)

### Event
- **Purpose**: Canonical event record used by all connectors.
- **Key fields**: id, userId, title, normalizedTitle, description, startAt, endAt, timezone, locationName, locationAddress, status, completeness, confidence, createdAt, updatedAt.
- **Validation**:
  - title required; normalizedTitle derived from title.
  - startAt optional but required for high-confidence completeness.
  - timezone required; default to user timezone when missing.

### EventSource
- **Purpose**: Provenance for each event.
- **Key fields**: id, eventId, sourceType, sourceRef, extractedAt, rawExcerptHash, confidence, metadata, webSourceId, channelConnectionId.
- **Validation**:
  - sourceType = "web" for crawler ingestion.
  - sourceRef is the canonicalized URL of the event page.

### WebSource
- **Purpose**: User-owned web source configuration.
- **Key fields**: id, userId, name, url, crawlFrequencyMinutes, status, lastCrawledAt.

## New Entities

### CrawlJob
- **Purpose**: Track a single crawl execution.
- **Fields**:
  - id (UUID)
  - userId (owner)
  - webSourceId (optional link to WebSource)
  - entryUrls (array of strings)
  - maxDepth (int)
  - allowExternal (bool)
  - status (queued | running | completed | failed | canceled)
  - pagesVisited (int)
  - pagesFailed (int)
  - eventsCaptured (int)
  - startedAt, completedAt
  - errorSummary (string?)
  - createdAt, updatedAt
- **Relationships**:
  - CrawlJob 1:N CrawlPage
  - CrawlJob N:M Event (via EventSource metadata linkage)
- **Validation**:
  - maxDepth >= 0
  - entryUrls non-empty

### CrawlPage
- **Purpose**: Record per-page fetch/parsing results for reporting and debugging.
- **Fields**:
  - id (UUID)
  - crawlJobId
  - url (canonicalized)
  - depth (int)
  - status (fetched | skipped | failed | blocked)
  - httpStatus (int?)
  - contentHash (string?)
  - parsedAt (DateTime?)
  - error (string?)
  - discoveredFrom (string?)
- **Relationships**:
  - CrawlPage N:1 CrawlJob
  - CrawlPage N:M Event (linked via EventSource metadata.sourcePageId)
- **Validation**:
  - depth <= maxDepth
  - url required and valid

## State Transitions

- **CrawlJob**: queued → running → completed | failed | canceled
- **CrawlPage**: fetched → parsed | failed | skipped

## Notes

- EventSource.metadata should include crawlJobId and crawlPageId to preserve provenance without violating the canonical Event model requirement.
- If global dedup is later required, add a separate cross-user dedup table to avoid cross-user leakage.
