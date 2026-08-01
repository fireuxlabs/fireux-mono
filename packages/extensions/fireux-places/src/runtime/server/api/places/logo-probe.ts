import type { LogoCandidate } from './logo-candidates'
import { log } from './logo-logging'
import {
  PROBE_CONCURRENCY,
  PROBE_TIMEOUT_MS,
  PROBE_TOTAL_TIMEOUT_MS,
} from './logo-settings'

async function looksLikeImage(
  url: string,
  totalSignal: AbortSignal
): Promise<boolean> {
  try {
    const head = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: { accept: 'image/*' },
      signal: AbortSignal.any([
        totalSignal,
        AbortSignal.timeout(PROBE_TIMEOUT_MS),
      ]),
    })
    if (head.ok) {
      const ct = (head.headers.get('content-type') || '').toLowerCase()
      return isImageContentType(ct)
    }
  } catch {
    // Some servers reject HEAD, so try GET before giving up.
  }
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { accept: 'image/*' },
      signal: AbortSignal.any([
        totalSignal,
        AbortSignal.timeout(PROBE_TIMEOUT_MS),
      ]),
    })
    if (!res.ok) {
      await res.body?.cancel()
      return false
    }
    const ct = (res.headers.get('content-type') || '').toLowerCase()
    await res.body?.cancel()
    return isImageContentType(ct)
  } catch {
    return false
  }
}

export function isImageContentType(ct: string): boolean {
  return ct.startsWith('image/') || ct.includes('svg') || ct.includes('xml')
}

function scoreCandidate(candidate: LogoCandidate): number {
  let score = 0
  const url = candidate.url.toLowerCase()

  if (url.endsWith('.svg')) score += 100
  else if (url.endsWith('.png') || url.endsWith('.webp')) score += 90
  else if (url.endsWith('.ico')) score += 80
  else score += 70

  if (candidate.source === 'inline-logo') score += 20
  if (candidate.source === 'common-path') score += 15
  if (candidate.source === 'homepage-icon') score += 10
  if (candidate.source === 'social-logo') score += 5

  if (url.includes('logo')) score += 15
  if (url.includes('apple-touch-icon')) score += 10
  if (url.includes('favicon')) score += 5

  if (url.includes('32x32') || url.includes('16x16')) score -= 15
  if (url.includes('192x192') || url.includes('512x512')) score += 5

  return score
}

export async function probeCandidates(
  candidates: LogoCandidate[]
): Promise<Array<LogoCandidate & { score: number }>> {
  const results: Array<LogoCandidate & { score: number }> = []
  const queue = [...candidates]
  const totalSignal = AbortSignal.timeout(PROBE_TOTAL_TIMEOUT_MS)
  const workers = Array.from(
    { length: Math.min(PROBE_CONCURRENCY, queue.length || 1) },
    () => worker()
  )
  await Promise.all(workers)
  return results

  async function worker() {
    while (queue.length) {
      const candidate = queue.shift()
      if (!candidate) return
      const ok = await looksLikeImage(candidate.url, totalSignal)
      if (!ok) continue
      const score = scoreCandidate(candidate)
      log('candidate ok', { ...candidate, score })
      results.push({ ...candidate, score })
    }
  }
}

export function isAbortError(error: unknown): boolean {
  return (
    !!error &&
    typeof error === 'object' &&
    'name' in error &&
    String((error as { name?: unknown }).name) === 'AbortError'
  )
}
