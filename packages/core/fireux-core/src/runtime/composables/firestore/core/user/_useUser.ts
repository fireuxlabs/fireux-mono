import { computed } from 'vue'

import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useAuth } from 'fireux-core/runtime/composables/firebase/useAuth.ts'
import {
  createOverlayAccessors,
  mergeOverlayCollection,
} from '../../_shared/overlay.ts'
import { useUserComputed } from './useUserComputed.ts'
import { useFirestoreRead } from '../../operations/useFirestoreRead.ts'
import { useUserUpdate } from './useUserUpdate.ts'

import type {
  AppUser,
  User,
} from 'fireux-core/runtime/models/core/user.model.ts'

type UserDoc = Omit<User, 'appUser'>

const mergeUser = (
  core: UserDoc | null,
  overlay: AppUser | null,
  fallbackId: string | undefined,
  isTenant: boolean
): User | null => {
  if (!core) return null
  const id = core.id ?? fallbackId
  if (!id) return null

  return {
    ...core,
    id,
    role: isTenant ? overlay?.role ?? core.role : core.role,
    appUser: isTenant ? overlay ?? null : null,
  }
}

export type { User } from 'fireux-core/runtime/models/core/user.model.ts'

/**
 * Returns current user (core merged with tenant overlay when available) plus a by-id accessor.
 */
export function useUser() {
  const { uid } = useAuth()
  const { isTenant, appId } = useFireUXConfig()

  const { current, byId } = createOverlayAccessors<UserDoc, AppUser, User>({
    id: uid,
    key: 'users',
    requireCore: true,
    map: ({ id, isTenant, core, app }) => {
      if (!core) return null
      return {
        ...core,
        id: core.id ?? id,
        role: isTenant ? app?.role ?? core.role : core.role,
        appUser: isTenant ? app ?? null : null,
      }
    },
  })

  const helpers = useUserComputed(current)
  const { firestoreFetchCollection } = useFirestoreRead()
  const updates = useUserUpdate(current)

  const globalRef = firestoreFetchCollection<UserDoc>('users')
  const localRef =
    isTenant && appId
      ? firestoreFetchCollection<AppUser>(`apps/${appId}/users`)
      : null

  const collectionValue = computed<User[]>(() =>
    mergeOverlayCollection<UserDoc, AppUser, User>({
      cores: globalRef.value ?? [],
      overlays: localRef?.value ?? [],
      isTenant,
      appId: appId ?? null,
      requireCore: true,
      map: ({ id, core, app, isTenant }) => mergeUser(core, app, id, isTenant),
    })
  )

  const collection = Object.assign(collectionValue, {
    local: localRef,
    global: globalRef,
    fetchGlobal: () => globalRef,
  })

  function fetchedUser(id: string) {
    return { user: byId(id) }
  }

  return {
    user: current,
    fetchedUser,
    collection,
    ...helpers,
    ...updates,
  }
}
