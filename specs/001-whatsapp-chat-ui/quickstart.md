# Quickstart: WhatsApp-Style Event Chat Webpage

**Feature**: `/Users/dm/code/ananda_bot/specs/001-whatsapp-chat-ui/spec.md`
**Date**: January 31, 2026

## Prerequisites

- Node.js 20+
- PostgreSQL access via `DATABASE_URL` (for event data)

## Setup

1) Install dependencies:

```bash
npm install
```

2) Configure environment variables:

```bash
export DATABASE_URL="postgresql://user:pass@localhost:5432/ananda"
export OPENAI_API_KEY="your-openai-api-key"
# Optional overrides:
# export OPENAI_MODEL="gpt-4o-mini"
# export SUPPORT_EMAIL="support@ananda.bot"
```

3) Apply database migrations:

```bash
npm run db:migrate
```

## Run

```bash
npm run dev
```

## Open the Chat UI

- Visit `http://localhost:3000/chat` in a browser.

## Run Without Redis (optional)

If you only want the chat UI and API without background workers, set:

```bash
export DISABLE_WORKERS=true
```

When disabled, worker-dependent endpoints (web sources and crawl jobs) are not registered.

## Example API Request

```bash
curl -X POST http://localhost:3000/api/chat/messages \
  -H 'Content-Type: application/json' \
  -d '{"question":"What events are happening this weekend?","timezone":"America/Los_Angeles"}'
```

## Verify

- The response returns an assistant message and optional event references.
- The UI shows the user message immediately and displays a typing indicator while waiting.
