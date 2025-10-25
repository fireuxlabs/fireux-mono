// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/user/useUser.ts
import { computed, shallowRef, type Ref } from 'vue'
import { doc, type DocumentReference } from 'firebase/firestore'
import { useFirestore, useDocument, useCurrentUser } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useFirestoreRead } from '../../operations/useFirestoreRead.ts'
import { useUserComputed } from './useUserComputed.ts'
import { useUserEnsure } from './useUserEnsure.ts'
import { useUserDelete } from './useUserDelete.ts'
import { useUserUpdate } from './useUserUpdate.ts'
import type {
  User,
  CoreUserDoc,
  AppUserDoc,
} from 'fireux-core/runtime/models/core/user.model.ts'

export type { User } from 'fireux-core/runtime/models/core/user.model.ts'

function resolveCurrentUser(): Ref<import('firebase/auth').User | null> {
  if (!import.meta.client) {
    return shallowRef<import('firebase/auth').User | null>(null)
  }
  try {
    return useCurrentUser() as Ref<import('firebase/auth').User | null>
  } catch (error) {
    if (import.meta.dev) {
      console.warn(
        '[useUser] useCurrentUser unavailable. Ensure VueFire auth module is registered.',
        error
      )
    }
    return shallowRef<import('firebase/auth').User | null>(null)
  }
}

export function useUser() {
  const db = useFirestore()
  const { isTenant, appId } = useFireUXConfig()
  const { firestoreFetchCollection } = useFirestoreRead()

  // Auth user (SSR-safe: null ref on server)
  const authUser = resolveCurrentUser()
  const uid = computed(() => authUser.value?.uid ?? null)

  // Core user doc
  const coreRef = computed<DocumentReference<CoreUserDoc> | null>(() =>
    uid.value
      ? (doc(db, 'core-users', uid.value) as DocumentReference<CoreUserDoc>)
      : null
  )
  const { data: coreDoc } = useDocument<CoreUserDoc>(coreRef)

  // App user doc (tenant scope)
  const appRef = computed<DocumentReference<AppUserDoc> | null>(() =>
    uid.value && isTenant && appId
      ? (doc(
          db,
          `apps/${appId}/users`,
          uid.value
        ) as DocumentReference<AppUserDoc>)
      : null
  )
  const { data: appDoc } = useDocument<AppUserDoc>(appRef)

  // Overlay: app (tenant) over core — NO UI fallbacks here
  const user = computed<User | null>(() => {
    const id = uid.value
    if (!id) return null

    const core = coreDoc.value ?? undefined
    const app = isTenant ? appDoc.value ?? undefined : undefined
    const base = app ?? core
    if (!base) return null

    return {
      id,
      display_name: base.display_name,
      avatar: base.avatar,
      handle: base.handle,
      email: base.email,
      profiles: base.profiles,
      role: app?.role,
      userOf: core?.userOf,
      adminOf: core?.adminOf,
      core,
      app,
    }
  })

  // Collections (aligned naming)
  const collection = {
    local:
      isTenant && appId
        ? firestoreFetchCollection<AppUserDoc>(`apps/${appId}/users`)
        : null,
    global: !isTenant
      ? firestoreFetchCollection<CoreUserDoc>('core-users')
      : null,
    fetchGlobal() {
      return this.global
    },
  } as const

  return {
    user,
    collection,
    // helpers & services
    ...useUserComputed(user),
    ...useUserEnsure(user),
    ...useUserDelete(user),
    ...useUserUpdate(user),
  }
}