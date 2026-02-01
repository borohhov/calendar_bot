export function summarizeText(text: string, maxSentences = 3, maxLength = 500): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";

  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
  const summary = sentences.slice(0, maxSentences).join(" ");
  if (summary.length <= maxLength) return summary;
  return `${summary.slice(0, maxLength - 3).trim()}...`;
}
