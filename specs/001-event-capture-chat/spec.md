# Feature Specification: Event Capture and WhatsApp Calendar Assistant

**Feature Branch**: `001-event-capture-chat`
**Created**: 2026-01-28
**Status**: Draft
**Input**: User description: "i need a system that crawls web pages and whatsapp messages (evolution_api style of connection, not like Whatsapp business official docs say), records events in a calendar, and be able to have a conversation with a user over whatsapp on what events to attend, when and where"

## User Scenarios & Testing *(mandatory)*

## Clarifications

### Session 2026-01-28
- Q: What user scope should the system support? -> A: Single user with one personal calendar.
- Q: What data retention policy should apply to event data? -> A: Retain indefinitely until user deletes.
- Q: How should web crawling frequency be handled? -> A: User-configurable per source.
- Q: How should incomplete events be handled? -> A: Record with missing fields but mark as incomplete.
- Q: How should low-confidence detections be handled? -> A: Discard low-confidence detections.

### User Story 1 - Capture events into a calendar (Priority: P1)

As a user, I can connect my WhatsApp account and provide web sources so that
new events are captured and shown in my calendar.

**Why this priority**: Event capture and a usable calendar view are the core
value; without them, there is no data to chat about.

**Independent Test**: Provide a known event web page and a WhatsApp message
containing an event; confirm both appear as calendar entries with time and
location.

**Acceptance Scenarios**:

1. **Given** an authorized WhatsApp connection and a configured list of web
   sources, **When** new event information appears in those sources, **Then**
   the calendar shows the event with title, date/time, and location.
2. **Given** the same event appears in multiple sources, **When** the system
   records the event, **Then** the calendar shows a single event with merged
   source references.

---

### User Story 2 - Ask about events over WhatsApp (Priority: P2)

As a user, I can ask questions in WhatsApp about upcoming events and receive
clear answers with times and locations.

**Why this priority**: The user experience depends on conversational access to
calendar information once events exist.

**Independent Test**: Ask a question like "What events are happening this
weekend?" and verify the response lists the correct events with details.

**Acceptance Scenarios**:

1. **Given** events exist in the calendar, **When** I ask for events in a
   specified date range, **Then** the response lists matching events with time
   and location.
2. **Given** my question is ambiguous (for example, no date range), **When** I
   ask the question, **Then** the assistant asks a clarifying question.

---

### User Story 3 - Get recommendations on what to attend (Priority: P3)

As a user, I can ask for recommendations on which events to attend based on my
preferences and availability.

**Why this priority**: Recommendations add value beyond listing events and help
with decision-making.

**Independent Test**: Provide preferences and a set of overlapping events; ask
for recommendations and confirm the response surfaces suitable options.

**Acceptance Scenarios**:

1. **Given** multiple events overlap in time, **When** I ask for what to attend,
   **Then** the assistant suggests options that fit my stated preferences and
   availability.

### Edge Cases

- A web source is unreachable or times out during crawling.
- A WhatsApp message mentions an event without a time or location.
- Two events have the same title but are on different dates.
- An event time is in a different time zone or ambiguous.
- Access to a WhatsApp connection is revoked.
- An event page changes after initial capture.
- A message is not an event and should not be recorded.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow a user to connect WhatsApp via a non-official,
  provider-style integration rather than the official WhatsApp program.
- **FR-002**: System MUST let users add, remove, and view web sources to crawl.
- **FR-002a**: System MUST allow users to set a crawl frequency per web source.
- **FR-003**: System MUST retrieve event information from configured web sources.
- **FR-004**: System MUST capture event information from authorized WhatsApp
  messages.
- **FR-005**: System MUST normalize all captured data into a single event
  record with time zone and source provenance.
- **FR-006**: System MUST deduplicate events found across multiple sources.
- **FR-006a**: System MUST record events with missing time or location and mark
  them as incomplete for user review.
- **FR-007**: System MUST present events in a calendar view with date, time,
  location, and title.
- **FR-008**: Users MUST be able to ask natural language questions in WhatsApp
  about upcoming or past events.
- **FR-009**: System MUST respond with event details and ask clarifying
  questions when requests are ambiguous.
- **FR-010**: System MUST support follow-up questions in the same chat session
  without requiring the user to repeat context.
- **FR-010a**: System MUST discard event detections below a defined confidence
  threshold.
- **FR-011**: System MUST allow users to provide preferences or constraints
  (availability, location, interests) for recommendations.
- **FR-012**: System MUST recommend events to attend based on preferences and
  scheduling conflicts.
- **FR-013**: Users MUST be able to delete or export their event data.

### Key Entities *(include if feature involves data)*

- **User**: Authorized person interacting over WhatsApp and viewing calendar.
- **Channel Connection**: An authorized link to WhatsApp for message access.
- **Web Source**: A configured URL or page group used for event crawling.
- **Event**: Canonical record with title, time range, location, and provenance.
- **Event Source**: Metadata linking an event to the originating channel.
- **Calendar**: The collection and view of events for a user.
- **Conversation**: A chat session containing queries and responses.
- **Preference**: User-specified constraints for recommendations.

### Assumptions & Scope

- The user provides the list of web sources; open-ended web discovery is out of
  scope.
- The system supports a single user with one personal calendar.
- Event data is retained until the user deletes it.
- The system does not purchase tickets or RSVP on behalf of the user.
- The primary language for queries is English.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users see newly captured events appear in their calendar within
  10 minutes of appearing in a configured source.
- **SC-002**: At least 90% of a test set of web pages and WhatsApp samples
  produce correct event entries with time and location.
- **SC-003**: 95% of WhatsApp queries return a clear answer or a clarifying
  question within 30 seconds.
- **SC-004**: In user testing, at least 85% of recommendation queries result in
  the user selecting one of the suggested events.
