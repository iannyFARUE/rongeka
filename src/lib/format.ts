export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/**
 * Returns a human-readable relative date string.
 * Consistent across all components (replaces 3 divergent inline implementations).
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date()
  const d = new Date(date)
  if (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  ) {
    return "Today"
  }
  const diff = Date.now() - d.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 1) return "Yesterday"
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

/** Returns "{count} {singular}" or "{count} {plural}", e.g. pluralise(1, "item") → "1 item" */
export function pluralise(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`
}
