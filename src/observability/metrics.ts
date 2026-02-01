import client from "prom-client";

export const registry = new client.Registry();

client.collectDefaultMetrics({ register: registry });

export const ingestCounter = new client.Counter({
  name: "events_ingested_total",
  help: "Total number of ingested events",
  registers: [registry],
});

export const ingestFailureCounter = new client.Counter({
  name: "events_ingest_failures_total",
  help: "Total number of failed event ingests",
  registers: [registry],
});

export const crawlPagesCounter = new client.Counter({
  name: "crawl_pages_total",
  help: "Total number of pages crawled",
  labelNames: ["status"],
  registers: [registry],
});

export const crawlEventsCounter = new client.Counter({
  name: "crawl_events_captured_total",
  help: "Total number of events captured by crawler",
  registers: [registry],
});

export async function getMetrics(): Promise<string> {
  return registry.metrics();
}
