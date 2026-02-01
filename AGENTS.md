# ananda_bot Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-28

## Active Technologies
- Node.js 20 LTS, TypeScript 5.x + Fastify, Prisma, BullMQ/Redis, Cheerio, Luxon, chrono-node, Zod (002-event-crawler)
- PostgreSQL via Prisma (002-event-crawler)
- Node.js 20 LTS, TypeScript 5.x + Fastify, Prisma, Luxon (existing); no new frontend framework (001-whatsapp-chat-ui)
- PostgreSQL via Prisma for canonical events; no new persistence for web chat session (001-whatsapp-chat-ui)

- Node.js 20 LTS, TypeScript 5.x + Fastify, Prisma, BullMQ/Redis, Cheerio, Luxon, (001-event-capture-chat)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

Node.js 20 LTS, TypeScript 5.x: Follow standard conventions

## Recent Changes
- 001-whatsapp-chat-ui: Added Node.js 20 LTS, TypeScript 5.x + Fastify, Prisma, Luxon (existing); no new frontend framework
- 002-event-crawler: Added Node.js 20 LTS, TypeScript 5.x + Fastify, Prisma, BullMQ/Redis, Cheerio, Luxon, chrono-node, Zod


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
