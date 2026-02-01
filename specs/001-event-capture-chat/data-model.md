# Data Model: Event Capture and WhatsApp Calendar Assistant

## Entities

### User
- **Fields**: id, phone, displayName, timezone, createdAt, updatedAt
- **Validation**: timezone required; phone unique
- **Relationships**: has many ChannelConnections, WebSources, Events,
Preferences, Conversations

### ChannelConnection
- **Fields**: id, userId, channelType (whatsapp), provider (evolution-style),
status (pending|active|revoked), authMetadata, lastSyncAt, createdAt, revokedAt
- **Validation**: provider and channelType required; userId required
- **Relationships**: belongs to User; has many Conversations

### WebSource
- **Fields**: id, userId, name, url, crawlFrequencyMinutes, status
(active|paused), lastCrawledAt, createdAt
- **Validation**: url valid; crawlFrequencyMinutes > 0
- **Relationships**: belongs to User; produces EventSources

### Event
- **Fields**: id, userId, title, description, startAt, endAt, timezone,
locationName, locationAddress, status (confirmed|tentative|canceled),
completeness (complete|incomplete), confidence (0-1), createdAt, updatedAt
- **Validation**: title required; startAt required for complete events; timezone
required; confidence in [0,1]
- **Relationships**: belongs to User; has many EventSources

### EventSource
- **Fields**: id, eventId, sourceType (web|whatsapp), sourceRef, extractedAt,
rawExcerptHash, confidence, metadata
- **Validation**: sourceType required; extractedAt required
- **Relationships**: belongs to Event; references WebSource or ChannelConnection

### Preference
- **Fields**: id, userId, preferredCategories, preferredLocations,
availabilityRules, avoidTimes, createdAt, updatedAt
- **Validation**: userId required
- **Relationships**: belongs to User

### Conversation
- **Fields**: id, userId, channelConnectionId, startedAt, lastMessageAt,
contextJson
- **Validation**: userId and channelConnectionId required
- **Relationships**: belongs to User and ChannelConnection

## Relationships (summary)
- User 1..N ChannelConnections
- User 1..N WebSources
- User 1..N Events
- Event 1..N EventSources
- User 1..N Conversations
- User 1..1 Preferences

## Deduplication Rules
- Primary dedupe key: userId + normalizedTitle + startAt (rounded to minutes).
- Secondary signals: locationName and sourceRef hashes.
- If dedupe hit, merge provenance into EventSources and update confidence.

## State Transitions
- ChannelConnection: pending -> active -> revoked
- WebSource: active <-> paused
- Event: incomplete -> complete; any -> canceled (if source indicates)

## Ingestion Validation Rules
- Events missing time or location are stored as incomplete.
- Low-confidence detections are discarded before persistence.
