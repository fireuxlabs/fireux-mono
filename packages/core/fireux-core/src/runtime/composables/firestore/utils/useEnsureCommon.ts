// Shared "ensure" helpers used by user/app/profile ensure flows.
// Lives under firestore/utils (not firebase/) to avoid coupling higher levels to storage internals.

import { useRequireUser } from '../../core/firebase/useRequireUser'
import { useImageStorage } from '../../core/firebase/useImageStorage'

export async function requireUid() {
  const auth = await useRequireUser()
  if (!auth?.uid) {
    throw new Error('[ensure] Missing authenticated user')
  }
  return { uid: auth.uid, auth }
}

type AvatarCandidate = {
  source: string
  display: string
}

function resolveStaticAsset(source: string): string | null {
  const trimmed = source.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) return null
  if (trimmed.startsWith('data:')) return null

  // Absolute path served by the app (e.g. /img/foo.png)
  if (trimmed.startsWith('/')) return trimmed

  // Convert ".../public/..." paths to app-root absolute
  const publicMarker = '/public/'
  const idx = trimmed.indexOf(publicMarker)
  if (idx !== -1) {
    const suffix = trimmed.slice(idx + publicMarker.length)
    if (suffix.length > 0) return `/${suffix}`
  }

  return null
}

function isFetchableUrl(source: string): boolean {
  const lower = source.toLowerCase()
  return (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    lower.startsWith('data:') ||
    lower.startsWith('blob:')
  )
}

function normalizeAvatarCandidates(
  inputs: Array<string | null | undefined>,
  fallback: string
): AvatarCandidate[] {
  const seen = new Set<string>()
  const list = [...inputs, fallback]
  const out: AvatarCandidate[] = []

  for (const entry of list) {
    if (typeof entry !== 'string') continue
    const trimmed = entry.trim()
    if (!trimmed) continue

    const staticAsset = resolveStaticAsset(trimmed)
    const candidateSource = staticAsset ?? trimmed

    // Skip non-fetchable relative garbage
    if (!staticAsset && !isFetchableUrl(candidateSource)) continue

    if (seen.has(candidateSource)) continue
    seen.add(candidateSource)

    out.push({ source: candidateSource, display: candidateSource })
  }

  return out
}

/**
 * Picks the first viable avatar candidate and (optionally) uploads it to Firebase Storage.
 * Returns the resulting URL (download URL if uploaded, otherwise original/display URL).
 */
export async function ensureAvatarUrl(
  destPath: string,
  candidates: Array<string | null | undefined>,
  upload = true
): Promise<string> {
  const { uploadImage, getDefaultImageUrl } = useImageStorage()
  const fallback = getDefaultImageUrl()
  const normalized = normalizeAvatarCandidates(candidates, fallback)

  if (!upload) {
    return normalized[0]?.display ?? fallback
  }

  for (const candidate of normalized) {
    try {
      return await uploadImage(destPath, candidate.source)
    } catch (error) {
      if (import.meta.dev) {
        const message =
          error instanceof Error
            ? error.message
            : (() => {
                try {
                  return JSON.stringify(error)
                } catch {
                  return String(error)
                }
              })()
        console.warn('[ensureAvatarUrl] upload failed; trying next', {
          source: candidate.source,
          message,
        })
      }
    }
  }

  return fallback
}
