// Concurrent edit — 2026-07-20 11:52 CEST — Security spine: read private App join requests from their admin-scoped collection.
// Concurrent edit — 2026-07-21 14:52 CEST — Werkbox User projection: consume bounded App-admin request identities without raw Firestore reads.
// Concurrent edit — 2026-07-21 16:25 CEST — Dashboard Admin pass: keep optimistic request removal explicitly typed in Nuxt template checks.
import { computed, ref, watchEffect, type ComputedRef } from 'vue'
import type {
  AppAdminJoinRequest,
} from '../../../models/app-context.model.ts'
import type { UserIdentitySummary } from '../../../../user/models/user-collection.model.ts'
import type { UserCard } from '../../../../user/composables/useUserInterface'

type JoinRequestItem = {
  id: string
  title: string
  subtitle?: string
  avatar: string
  to: string
}

type HandleJoinRequests = (uid: string, approve: boolean) => Promise<unknown>

type CardBuilder = ComputedRef<
  (target?: UserIdentitySummary | null | undefined) => UserCard.Card
>

type Options = {
  requests: ComputedRef<AppAdminJoinRequest[]>
  handleJoinRequests: HandleJoinRequests
  card: CardBuilder
  refresh: () => Promise<void>
}

/** Maps the bounded App-admin join-request projection to list items. */
export function useAppJoinRequests(options: Options): {
  items: ComputedRef<JoinRequestItem[]>
  approve: (uid: string) => Promise<unknown>
  reject: (uid: string) => Promise<unknown>
} {
  const { requests, handleJoinRequests, card, refresh } = options
  const hidden = new Set<string>()
  const itemsRef = ref<JoinRequestItem[]>([])

  const buildItem = (request: AppAdminJoinRequest): JoinRequestItem => {
    const profile = request.user
    if (!profile) {
      return {
        id: request.id,
        title: request.id,
        subtitle: '',
        avatar: '',
        to: '',
      }
    }

    const payload = card.value(profile)
    return {
      id: request.id,
      title: payload.displayName,
      subtitle: payload.handle,
      avatar: payload.avatarUrl,
      to: payload.to,
    }
  }

  const syncItems = () => {
    const source = requests.value
    const ids = new Set(source.map((request) => request.id))
    for (const hiddenId of Array.from(hidden)) {
      if (!ids.has(hiddenId)) hidden.delete(hiddenId)
    }
    itemsRef.value = source
      .filter((request) => !hidden.has(request.id))
      .map(buildItem)
  }

  watchEffect(syncItems)

  const removeLocal = (uid: string) => {
    hidden.add(uid)
    itemsRef.value = itemsRef.value.filter(
      (item: JoinRequestItem) => item.id !== uid
    )
  }

  const mutate = async (uid: string, approve: boolean) => {
    removeLocal(uid)
    try {
      const result = await handleJoinRequests(uid, approve)
      void refresh().catch(() => undefined)
      return result
    } catch (error) {
      hidden.delete(uid)
      syncItems()
      throw error
    }
  }

  const items = computed<JoinRequestItem[]>(() => itemsRef.value)

  return {
    items,
    approve: (uid: string) => mutate(uid, true),
    reject: (uid: string) => mutate(uid, false),
  }
}

export type { JoinRequestItem }
