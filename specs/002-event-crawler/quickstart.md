# Quickstart: Event Site Crawler

**Feature**: `/Users/dm/code/ananda_bot/specs/002-event-crawler/spec.md`
**Date**: January 31, 2026

## Prerequisites

- Node.js 20+
- PostgreSQL access via `DATABASE_URL`
- Redis access via `REDIS_URL`

## Setup

1) Install dependencies:

```bash
npm install
```

2) Configure environment variables:

```bash
export DATABASE_URL="postgresql://user:pass@localhost:5432/ananda"
export REDIS_URL="redis://localhost:6379"
```

3) Apply database migrations:

```bash
npm run db:migrate
```

## Run

```bash
npm run dev
```

## Example Request

```bash
curl -X POST http://localhost:3000/api/crawl-jobs \
  -H 'Content-Type: application/json' \
  -d '{"entryUrls":["https://example.com/events"],"maxDepth":2}'
```

## Verify

```bash
curl http://localhost:3000/api/crawl-jobs/{jobId}
curl http://localhost:3000/api/crawl-jobs/{jobId}/events
```
