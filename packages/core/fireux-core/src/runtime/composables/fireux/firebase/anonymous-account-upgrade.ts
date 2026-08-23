import type { User } from 'firebase/auth'

const STORAGE_KEY = 'fireux-pending-anonymous-account-upgrade'
const MAX_AGE_MS = 60 * 60 * 1000

export type PendingAnonymousAccountUpgrade = {
  uid: string
  idToken: string
  family: string
  targetId: string
  createdAt: number
}

export async function rememberAnonymousAccountUpgrade(
  user: User | null,
  context: { family?: unknown; targetId?: unknown } = {}
) {
  if (!import.meta.client || !user?.uid || !user.isAnonymous) return null
  const existing = readPendingAnonymousAccountUpgrade()
  const pending: PendingAnonymousAccountUpgrade = {
    uid: user.uid,
    idToken: await user.getIdToken(),
    family:
      String(context.family ?? '').trim() ||
      (existing?.uid === user.uid ? existing.family : ''),
    targetId:
      String(context.targetId ?? '').trim() ||
      (existing?.uid === user.uid ? existing.targetId : ''),
    createdAt: Date.now(),
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending))
  return pending
}

export function readPendingAnonymousAccountUpgrade() {
  if (!import.meta.client) return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const value = JSON.parse(raw) as PendingAnonymousAccountUpgrade
    if (
      !value.uid ||
      !value.idToken ||
      !Number.isFinite(value.createdAt) ||
      Date.now() - value.createdAt > MAX_AGE_MS
    ) {
      clearPendingAnonymousAccountUpgrade()
      return null
    }
    return value
  } catch {
    clearPendingAnonymousAccountUpgrade()
    return null
  }
}

export function clearPendingAnonymousAccountUpgrade() {
  if (import.meta.client) sessionStorage.removeItem(STORAGE_KEY)
}
