# Quickstart: Event Capture and WhatsApp Calendar Assistant

## Prerequisites
- Node.js 20 LTS
- PostgreSQL 15+
- Redis 7+

## Environment Variables
- `DATABASE_URL` (PostgreSQL connection string)
- `REDIS_URL`
- `WHATSAPP_PROVIDER_BASE_URL` (Evolution API-style server)
- `WHATSAPP_PROVIDER_TOKEN`
- `APP_BASE_URL` (public URL for webhook callbacks)
- `DEFAULT_TIMEZONE`

## Local Setup
1. Install dependencies: `npm install`
2. Initialize database: `npm run db:migrate`
3. Start services: `npm run dev`

## Configure Web Sources
- Use the API to add web sources and set crawl frequency per source.

## Connect WhatsApp
- Create a WhatsApp connection via the connector endpoint.
- Register webhook callbacks with the provider using `APP_BASE_URL`.

## Validate Ingestion
- Trigger a manual crawl or wait for scheduled job.
- Send a WhatsApp message with an event and verify it appears in the calendar.

## Run Tests
- Unit tests: `npm run test:unit`
- Integration tests: `npm run test:integration`
