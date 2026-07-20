// Concurrent edit — 2026-07-20 11:52 CEST — Security spine: read private App join requests from their admin-scoped collection.

import { collection } from 'firebase/firestore'
import { computed, ref, watchEffect, type ComputedRef, type Ref } from 'vue'

import type { App } from '../../../../../../models/core/app.model'
import { AppStorage } from '../../../../../../models/core/app.model'
import {
  AppJoinRequestStorage,
  type AppJoinRequest,
} from '../../../../../../models/core/supporting/app-membership'
import type { User } from '../../../../../../models/core/user.model'
import { useFireUXConfig } from '../../../../app/FireUXConfig'
import { useCollection, useFirestore } from '../../../vuefire'
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
 * Maps the admin-scoped join-request collection to pill-friendly list items.
 */
export function useAppJoinRequests(options: Options): {
  items: ComputedRef<JoinRequestItem[]>
  approve: (uid: string) => Promise<unknown>
  reject: (uid: string) => Promise<unknown>
} {
  const { handleJoinRequests, fetchedUser, card } = options
  const cache = new Map<string, UserRef>()
  const hidden = new Set<string>()
  const itemsRef = ref<JoinRequestItem[]>([])
  const { appId } = useFireUXConfig()
  const db = useFirestore()
  const requestCollection = collection(
    db,
    AppStorage.collection,
    appId,
    AppJoinRequestStorage.collection
  )
  const requests = useCollection<AppJoinRequest>(requestCollection)

  const resolveUserRef = (uid: string): UserRef => {
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
    const ref = resolveUserRef(uid)
    const profile = ref.value
    if (!profile) {
      return { id: uid, title: uid, subtitle: '', avatar: '', to: '' }
    }

    const payload = card.value(profile)
    return {
      id: uid,
      title: payload.displayName,
      subtitle: payload.handle,
      avatar: payload.avatarUrl,
      to: payload.to,
    }
  }

  watchEffect(() => {
    const source = requests.data.value
    if (!Array.isArray(source) || source.length === 0) {
      cache.clear()
      hidden.clear()
      itemsRef.value = []
      return
    }

    const ids = toUniqueIds(
      source.map((request) => request.user_id || request.id)
    )
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
