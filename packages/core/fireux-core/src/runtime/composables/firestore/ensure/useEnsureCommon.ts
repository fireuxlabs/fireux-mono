import { useRequireUser } from '../../firebase/useRequireUser'
import { useImageStorage } from '../../firebase/useImageStorage'

/**
 * Resolve the authenticated Firebase user and ensure a UID is present.
 */
export async function requireUid() {
  const auth = await useRequireUser()
  if (!auth?.uid) {
    throw new Error('[ensure] Missing authenticated user')
  }
  return { uid: auth.uid, auth }
}

/**
 * Upload an avatar to Storage with graceful fallbacks.
 * - Attempts upload for each provided candidate in order.
 * - Falls back to the default image when all uploads fail.
 * - When upload=false, simply returns the first non-empty candidate.
 */
type AvatarCandidate = {
  source: string
  display: string
}

function resolveStaticAsset(source: string): string | null {
  const trimmed = source.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) return null
  if (trimmed.startsWith('data:')) return null

  if (trimmed.startsWith('/')) {
    return trimmed
  }

  const publicMarker = '/public/'
  const markerIndex = trimmed.indexOf(publicMarker)
  if (markerIndex !== -1) {
    const suffix = trimmed.slice(markerIndex + publicMarker.length)
    if (suffix.length > 0) {
      return `/${suffix}`
    }
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
  const normalized: AvatarCandidate[] = []

  for (const entry of list) {
    if (typeof entry !== 'string') continue
    const trimmed = entry.trim()
    if (!trimmed) continue

    const staticAsset = resolveStaticAsset(trimmed)
    const candidateSource = staticAsset ?? trimmed

    if (!staticAsset && !isFetchableUrl(candidateSource)) {
      continue
    }

    if (seen.has(candidateSource)) continue
    seen.add(candidateSource)

    normalized.push({ source: candidateSource, display: candidateSource })
  }

  return normalized
}

export async function ensureAvatarUrl(
  destPath: string,
  candidates: Array<string | null | undefined>,
  upload = true
): Promise<string> {
  const { uploadImage, getDefaultImageUrl } = useImageStorage()
  const fallback = getDefaultImageUrl()
  const normalizedCandidates = normalizeAvatarCandidates(candidates, fallback)

  if (!upload) {
    return normalizedCandidates[0]?.display ?? fallback
  }

  for (const candidate of normalizedCandidates) {
    try {
      return await uploadImage(destPath, candidate.source)
    } catch (error) {
      if (import.meta.dev) {
        const message = (() => {
          if (error instanceof Error) return error.message
          if (typeof error === 'string') return error
          try {
            return JSON.stringify(error)
          } catch {
            return String(error)
          }
        })()
        console.warn('[ensureAvatarUrl] upload failed, trying next candidate', {
          source: candidate.source,
          message,
        })
      }
    }
  }

  return fallback
}
