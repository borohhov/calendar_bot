# Research: Event Site Crawler

**Feature**: `/Users/dm/code/ananda_bot/specs/002-event-crawler/spec.md`
**Date**: January 31, 2026

## Decisions

### 1) Crawl traversal strategy
- **Decision**: Use breadth-first traversal with a depth counter, URL normalization, and a per-job visited set. Default scope is same-site (same hostname or registrable domain), with an optional allowlist to expand.
- **Rationale**: BFS makes depth limits deterministic and avoids deep-path starvation. URL normalization reduces duplicate fetches and supports deduplication.
- **Alternatives considered**: Depth-first traversal (simpler but can over-focus on deep paths); crawling without normalization (higher duplication and cost).

### 2) Politeness, retries, and failure handling
- **Decision**: Use BullMQ jobs with per-host concurrency limits, retry with exponential backoff, and record failed pages with errors. Respect `robots.txt` where feasible, and apply a default crawl delay.
- **Rationale**: Aligns with reliability and privacy principles, reduces risk of bans, and enables observability for failures.
- **Alternatives considered**: Fire-and-forget HTTP fetches (higher failure rates, poor observability); ignoring robots.txt (riskier for compliance).

### 3) Event extraction approach
- **Decision**: Prefer structured data when present (JSON-LD / microdata with schema.org Event), fallback to heuristic extraction with Cheerio + chrono-node for dates/times, and normalize with Luxon.
- **Rationale**: Structured data yields higher precision; heuristics provide coverage where structured markup is absent.
- **Alternatives considered**: Heuristics-only (lower precision); LLM-based extraction (higher cost and privacy concerns).

### 4) Summary generation
- **Decision**: Use extractive summaries from cleaned event description text (first 1–3 sentences, capped length). If no description exists, summarize from title + date/location.
- **Rationale**: Predictable, low-cost, and consistent with privacy constraints.
- **Alternatives considered**: Generative summaries (requires LLM service and raises privacy/latency concerns).

### 5) Deduplication strategy
- **Decision**: Deduplicate within a crawl job using a composite key: normalized title + start time (if present) + canonicalized source URL. Merge sources into a single EventSource collection.
- **Rationale**: Matches existing canonical Event index and reduces duplicates without losing provenance.
- **Alternatives considered**: Hashing full text only (fragile to small edits); global dedup across all users (risk of cross-user leakage).

### 6) Data model changes
- **Decision**: Introduce CrawlJob + CrawlPage entities to store crawl execution state and page outcomes; reuse Event + EventSource for canonical data.
- **Rationale**: Provides traceability and reporting without violating the canonical Event model.
- **Alternatives considered**: Store crawl state only in job metadata (limits reporting and debugging).

## Best Practices Notes

- Use strict timeouts and content-size limits per fetch to avoid memory spikes.
- Log crawl correlation IDs and expose metrics (pages fetched, events captured, failures) via existing observability stack.
- Store only necessary excerpts needed for provenance, avoiding raw full-page dumps.
