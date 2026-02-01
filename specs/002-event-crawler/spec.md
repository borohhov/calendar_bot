# Feature Specification: Event Site Crawler

**Feature Branch**: `002-event-crawler`  
**Created**: January 31, 2026  
**Status**: Draft  
**Input**: User description: "need a crawler that parses websites and finds event data. The entry points will be given as input, the crawler needs to be able to go 2-x levels deeper by clicking on links, reading event descriptions and summarizing them in its database"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Submit Crawl Job and Capture Events (Priority: P1)

As a user, I submit one or more website entry points and a maximum link depth, and the system finds event pages, extracts event details, and stores them with summaries.

**Why this priority**: This is the core value: turning entry sites into structured event records.

**Independent Test**: Can be tested by submitting a small site with known event pages and verifying stored event records with summaries.

**Acceptance Scenarios**:

1. **Given** a list of entry URLs and a maximum depth of 2, **When** a crawl job runs, **Then** the system stores events with required fields (title, start date, source URL) and a summary for each captured event.
2. **Given** a crawl job completes, **When** I view the job results, **Then** I can see counts of pages visited, events captured, and pages that failed to parse.

---

### User Story 2 - Follow Links to Event Detail Pages (Priority: P2)

As a user, I want the crawler to navigate from listing pages to event detail pages so the system can capture richer event descriptions.

**Why this priority**: Many sites list events on index pages but keep descriptions on detail pages.

**Independent Test**: Can be tested on a site with a listing page linking to event detail pages.

**Acceptance Scenarios**:

1. **Given** an entry page that links to event detail pages, **When** the crawl job runs within depth limits, **Then** the system captures event details from the linked pages, not only from the listing page.

---

### User Story 3 - Avoid Duplicate Events Within a Crawl (Priority: P3)

As a user, I want duplicate event records consolidated so I do not see multiple copies of the same event from different pages.

**Why this priority**: Duplicate events reduce trust and increase cleanup work.

**Independent Test**: Can be tested with a site that links to the same event from multiple pages.

**Acceptance Scenarios**:

1. **Given** multiple pages that reference the same event, **When** a crawl job runs, **Then** the system stores a single event record and associates it with all relevant source pages.

---

### Edge Cases

- What happens when a site has no events within the crawl depth?
- How does the system handle circular links that could cause repeated visits?
- What happens when an event page is missing a date or time?
- How does the system handle pages that block access or return errors?
- What happens when events span multiple days or have multiple occurrences?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST accept one or more entry URLs and a maximum crawl depth for each crawl job.
- **FR-002**: The system MUST follow links discovered on pages up to the configured depth and MUST NOT traverse beyond that depth.
- **FR-003**: The system MUST restrict crawling to the same site as the entry URL by default, unless explicitly configured otherwise for the job.
- **FR-004**: The system MUST extract event data including, at minimum, title, start date, and source URL when available.
- **FR-005**: The system MUST capture event descriptions from detail pages when present.
- **FR-006**: The system MUST generate and store a concise summary (1–3 sentences) for each captured event.
- **FR-007**: The system MUST record crawl job outcomes, including pages visited, events captured, and pages that failed to parse.
- **FR-008**: The system MUST deduplicate events within a single crawl job.
- **FR-009**: The system MUST retain source page references for each event so the original content can be verified.

### Requirement Acceptance Criteria

- **FR-001** is satisfied when a user can submit entry URLs with a maximum depth and the job is accepted.
- **FR-002** is satisfied when controlled tests show no pages are visited beyond the configured depth.
- **FR-003** is satisfied when pages from other sites are not visited unless the job explicitly allows them.
- **FR-004** is satisfied when captured events include title, start date, and source URL whenever available.
- **FR-005** is satisfied when event descriptions are captured from detail pages when present.
- **FR-006** is satisfied when each captured event has a 1–3 sentence summary stored.
- **FR-007** is satisfied when each job report includes page visit counts, event counts, and parse failures.
- **FR-008** is satisfied when duplicate event references result in one stored event per job.
- **FR-009** is satisfied when each stored event has at least one source page reference.

### Key Entities *(include if feature involves data)*

- **Crawl Job**: Represents a crawl request with entry URLs, maximum depth, status, timestamps, and result counts.
- **Source Page**: A visited page with URL, visit status, and relation to captured events.
- **Event**: A structured event record with title, dates/times, description, summary, location (if available), and source references.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a curated test set of at least 50 known events across at least 5 sites, the system captures required fields (title, start date, source URL) for at least 90% of events.
- **SC-002**: 100% of captured events include a stored summary of 1–3 sentences.
- **SC-003**: In controlled depth tests, 0 pages are crawled beyond the configured maximum depth.
- **SC-004**: At least 95% of crawl jobs produce a completed job report with counts for pages visited, events captured, and pages that failed to parse.

## Assumptions & Dependencies

- Entry URLs are provided by a trusted user or process.
- By default, crawling is limited to the same site as each entry URL to control scope.
- Only publicly accessible pages are in scope.

## Out of Scope

- Paid or authenticated content requiring user credentials.
- Manual editing or curation of events after capture.
- Real-time updates or continuous crawling beyond explicitly triggered jobs.
