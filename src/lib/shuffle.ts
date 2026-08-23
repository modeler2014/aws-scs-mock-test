export function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function pickRandom<T>(items: T[], count: number): T[] {
  return shuffle(items).slice(0, Math.min(count, items.length))
}

export function filterByDomains<T extends { domain: string }>(
  items: T[],
  domains: string[]
): T[] {
  if (domains.length === 0) return items
  return items.filter((item) => domains.includes(item.domain))
}
