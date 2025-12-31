import { computed, ref, watchEffect, type ComputedRef, type Ref } from 'vue'

import type { App } from '../../../../../../models/core/app.model'
import type { User } from '../../../../../../models/core/user.model'
import type { UserCard } from '../../user/utils/view/useUserInterface'

type JoinRequestItem = {
  id: string
  title: string
  subtitle?: string
  avatar: string
  to: string
}

type HandleJoinRequests = (uid: string, approve: boolean) => Promise<unknown>

type UserRef = ComputedRef<User | null>

type CardBuilder = ComputedRef<(target?: User | null | undefined) => UserCard.Card>

type Options = {
  app: Ref<App | null | undefined>
  handleJoinRequests: HandleJoinRequests
  fetchedUser: (uid: string) => { user: UserRef }
  card: CardBuilder
}

/**
 * Maps `app.join_requests` to pill-friendly list items and exposes approve/reject helpers.
 */
export function useAppJoinRequests({
  app,
  handleJoinRequests,
  fetchedUser,
  card,
}: Options): {
  items: ComputedRef<JoinRequestItem[]>
  approve: (uid: string) => Promise<unknown>
  reject: (uid: string) => Promise<unknown>
} {
  const cache = new Map<string, UserRef>()
  const hidden = new Set<string>()
  const itemsRef = ref<JoinRequestItem[]>([])

  const ensureUserRef = (uid: string): UserRef => {
    let ref = cache.get(uid)
    if (!ref) {
      ref = fetchedUser(uid).user
      cache.set(uid, ref)
    }
    return ref
  }

  const toUniqueIds = (raw: unknown[]): string[] => {
    const trimmed = raw
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter((uid) => uid.length > 0)

    return Array.from(new Set(trimmed))
  }

  const buildItem = (uid: string): JoinRequestItem => {
    const ref = ensureUserRef(uid)
    const profile = ref.value
    if (!profile) {
      return { id: uid, title: uid, subtitle: '', avatar: '', to: '' }
    }

    const payload = card.value(profile)
    return {
      id: uid,
      title: payload.title,
      subtitle: payload.subtitle,
      avatar: payload.avatar,
      to: payload.to,
    }
  }

  watchEffect(() => {
    const source = app.value?.join_requests
    if (!Array.isArray(source) || source.length === 0) {
      cache.clear()
      hidden.clear()
      itemsRef.value = []
      return
    }

    const ids = toUniqueIds(source)
    const mapped = ids
      .filter((uid) => !hidden.has(uid))
      .map((uid) => buildItem(uid))

    for (const key of Array.from(cache.keys())) {
      if (!ids.includes(key)) cache.delete(key)
    }

    for (const hiddenId of Array.from(hidden)) {
      if (!ids.includes(hiddenId)) hidden.delete(hiddenId)
    }

    itemsRef.value = mapped
  })

  const removeLocal = (uid: string) => {
    hidden.add(uid)
    itemsRef.value = itemsRef.value.filter(
      (item: JoinRequestItem) => item.id !== uid
    )
  }

  const approve = async (uid: string) => {
    removeLocal(uid)
    try {
      await handleJoinRequests(uid, true)
    } catch (error) {
      hidden.delete(uid)
      throw error
    }
  }

  const reject = async (uid: string) => {
    removeLocal(uid)
    try {
      await handleJoinRequests(uid, false)
    } catch (error) {
      hidden.delete(uid)
      throw error
    }
  }

  const items = computed<JoinRequestItem[]>(() => itemsRef.value)

  return { items, approve, reject }
}

export type { JoinRequestItem }
