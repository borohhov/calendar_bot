import * as cheerio from "cheerio";
import { canonicalizeUrl, resolveUrl, isHttpUrl } from "./url-utils";

const SKIP_PROTOCOLS = ["mailto:", "tel:", "javascript:"];

export function discoverLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const links = new Set<string>();

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");
    if (!href) return;
    const trimmed = href.trim();
    if (SKIP_PROTOCOLS.some((protocol) => trimmed.toLowerCase().startsWith(protocol))) return;
    if (trimmed.startsWith("#")) return;

    const resolved = resolveUrl(baseUrl, trimmed);
    if (!resolved) return;

    try {
      const url = new URL(resolved);
      if (!isHttpUrl(url)) return;
      const canonical = canonicalizeUrl(url.toString());
      if (!canonical) return;
      links.add(canonical);
    } catch {
      return;
    }
  });

  return Array.from(links);
}
