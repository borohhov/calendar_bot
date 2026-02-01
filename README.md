# Ananda Bot

Local development notes for the event chat and crawler services.

## Setup

### Prerequisites

- Node.js 20 LTS
- PostgreSQL (local or remote)
- Redis (required unless you disable workers)

### Install & configure

```bash
npm install
```

Create a `.env` file (or export these in your shell). Required values:

```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/ananda"
REDIS_URL="redis://localhost:6379"
WHATSAPP_PROVIDER_BASE_URL="https://your-whatsapp-provider.example.com"
WHATSAPP_PROVIDER_TOKEN="your-provider-token"
APP_BASE_URL="http://localhost:3000"
```

Optional (with defaults, or only needed for LLM responses):

```bash
DEFAULT_TIMEZONE="UTC"
OPENAI_API_KEY="your-openai-api-key"
OPENAI_MODEL="gpt-4o-mini"
SUPPORT_EMAIL="your@email.com"
```

Note: `REDIS_URL` is required unless you set `DISABLE_WORKERS=true`.

Run Prisma migrations and generate the client:

```bash
npm run db:migrate
npm run db:generate
```

## Run

Start the development server:

```bash
npm run dev
```

The server exposes the WhatsApp-style web chat at `http://localhost:3000/chat`.

### Run without Redis (optional)

If you only need the chat UI/API and want to skip background workers:

```bash
DISABLE_WORKERS=true
```

When disabled, worker-dependent endpoints (web sources and crawl jobs) are not registered.

### Build & start

```bash
npm run build
npm start
```

## Tests & lint

```bash
npm test
npm run lint
```
