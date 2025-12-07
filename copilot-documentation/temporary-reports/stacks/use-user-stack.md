---
title: FireUX `useUser` Stack
origin: use-user.md
archived-on: 2025-11-10
status: draft
---

> Migrated from `use-user.md` on 2025-11-10 during the markdown organisation sweep.

# FireUX Core User Composable Stack

## packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/useUser.ts

```ts
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth.ts'
import { useUserFetch } from './main/useUserFetch.ts'
import { useUserComputed } from './main/useUserComputed.ts'
import { useUserEnsure } from './main/useUserEnsure.ts'
import { useUserUpdate } from './main/useUserUpdate.ts'
import { useUserDelete } from './main/useUserDelete.ts'
import { useUserInterface } from './main/useUserInterface.ts'

/**
 * DO NOT REFACTOR:
 * This composable intentionally returns the grouped refs from useUserFetch:
 *   { user } where user = { coreUser, appUser }
 * Helpers (computed/ensure/update/delete) depend on that exact shape.
 */
export type { User } from 'fireux-core/runtime/models/core/user.model.ts'

export function useUser() {
  const { uid } = useAuth()
  const { user } = useUserFetch(uid.value)
  const interfaceApi = useUserInterface(user)

  return {
    user,
    ...useUserComputed(user),
    ...interfaceApi,
    pillProps: interfaceApi.toPill,
    ...useUserEnsure(user),
    ...useUserUpdate(user),
    ...useUserDelete(user),
  }
}
```

## packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/main/useUserCollection.ts

```ts
import { computed } from 'vue'
import { collection } from 'firebase/firestore'
import { useFirestore, useCollection } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/config/FireUXConfig.ts'
import type {
  AppUser,
  User,
} from 'fireux-core/runtime/models/core/user.model.ts'

export function useUserCollection() {
  const db = useFirestore()
  const { isTenant, appId } = useFireUXConfig()

  const global = useCollection<User>(collection(db, 'users') as any)
  const local =
    isTenant && appId
      ? useCollection<AppUser>(collection(db, 'apps', appId, 'users') as any)
      : null

  const users = computed<User[]>(() => {
    const base = global.value ?? []
    const overlays = local?.value ?? []
    if (!overlays.length) return base

    return base.map((core) => {
      const overlay = overlays.find((entry) => entry.id === core.id)
      return overlay ? { ...core, appUser: overlay } : core
    })
  })

  return { users, global, local }
}
```

## packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/main/useUserComputed.ts

```ts
// FILE: packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/main/useUserComputed.ts
import { computed } from 'vue'
import type {
  User,
  AppUser,
} from 'fireux-core/runtime/models/core/user.model.ts'
import type { UserRefs } from './useUserFetch.ts'

export function useUserComputed(user: UserRefs) {
  const coreUser = user.coreUser as { value: User | null | undefined }
  const appUser = user.appUser as { value: AppUser | null | undefined }

  if (appUser.value) {
    // overlay merge hook reserved for future tenant overlays
  }

  const currentUser = computed(() => coreUser.value ?? null)
  const hasCoreProfile = computed(() => Boolean(coreUser.value))
  const hasAppProfile = computed(() => Boolean(appUser.value))
  const hasAnyProfile = computed(
    () => hasCoreProfile.value || hasAppProfile.value
  )

  return { currentUser, hasCoreProfile, hasAppProfile, hasAnyProfile }
}
```

## packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/main/useUserInterface.ts

```ts
import type { Ref } from 'vue'
import type {
  User,
  AppUser,
} from 'fireux-core/runtime/models/core/user.model.ts'
import type { UserRefs } from './main/useUserFetch.ts'
import type { Pill } from 'fireux-core/runtime/types/pill.model.ts'

export function useUserInterface(
  user: Ref<User | null | undefined> | UserRefs
) {
  const core =
    (user as UserRefs).coreUser?.value ??
    (user as Ref<User | null | undefined>)?.value ??
    null

  const app = (user as UserRefs).appUser?.value as AppUser | undefined

  if (app) {
    // overlay merge reserved for future tenant overlays
  }

  const toPill = (): Pill.Props => {
    const overlay = app as unknown as Partial<User> | undefined
    const source = overlay ?? core

    return {
      avatar: overlay?.avatar ?? core?.avatar ?? '',
      initials: 'A',
      title: source?.display_name ?? '',
      subtitle: source?.handle ? `@${source.handle}` : '',
      badges: source?.profiles ?? [],
      to: source?.id ? `/users/${source.id}` : '',
    }
  }

  return { toPill }
}
```

## packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/main/useUserDelete.ts

```ts
import { ref, type Ref } from 'vue'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'
import type { UserRefs } from './useUserFetch.ts'

type UserSource = Ref<User | null | undefined> | UserRefs | undefined

export function useUserDelete(userRef?: UserSource) {
  const deleting = ref(false)
  const deleteError = ref<Error | null>(null)

  async function deleteUser(id?: string) {
    const resolvedId = (() => {
      if (id) return id
      if (!userRef) return undefined
      const maybeGrouped = userRef as any
      if (maybeGrouped && 'coreUser' in maybeGrouped) {
        return maybeGrouped.coreUser?.value?.id
      }
      return (userRef as Ref<User | null | undefined>).value?.id
    })()

    if (!resolvedId) throw new Error('User id is required')

    deleting.value = true
    deleteError.value = null

    try {
      // Placeholder; real delete not wired yet.
      console.warn('[fireux-core] deleteUser stub – no deletion performed', {
        id: resolvedId,
      })
      return 'not-implemented' as const
    } catch (error: any) {
      deleteError.value =
        error instanceof Error ? error : new Error('Unknown error')
      throw deleteError.value
    } finally {
      deleting.value = false
    }
  }

  return { deleteUser, deleting, deleteError }
}
```

## packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/main/useUserEnsure.ts

```ts
import { useRouter } from 'vue-router'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/config/FireUXConfig.ts'
import { requireUid } from '../../../utils/useEnsureCommon.ts'
import {
  ensureAppMembership as ensureAppMembershipDoc,
  ensureDoc,
  makeHandle,
} from '../../../utils/ensureCommon.ts'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'
import type { UserRefs } from './useUserFetch.ts'

type EnsureUserResult = {
  createdCore: boolean
  createdApp: boolean
  id: string
  displayName: string
}

export function useUserEnsure(_user?: UserRefs) {
  const router = useRouter()
  const { isTenant, appId } = useFireUXConfig()

  const ensureCore = async (): Promise<{
    created: boolean
    id: string
    displayName: string
  }> => {
    const { uid, auth } = await requireUid()
    const displayName = auth?.displayName || 'New User'

    const payload: Partial<User> = {
      id: uid,
      email: auth?.email ?? '',
      display_name: displayName,
      handle: makeHandle(displayName, uid),
    }

    const result = await ensureDoc<User>('users', uid, payload as User)

    if (!result.created) {
      const existing = result.snapshot?.data() as Partial<User> | undefined
      const resolvedDisplayName = existing?.display_name || displayName
      return { created: false, id: uid, displayName: resolvedDisplayName }
    }

    return { created: true, id: uid, displayName }
  }

  const ensureApp = async (): Promise<{ created: boolean }> => {
    if (!isTenant || !appId) return { created: false }
    const { uid } = await requireUid()
    const result = await ensureAppMembershipDoc(appId, uid, 'user')
    return { created: result.created }
  }

  const ensureUser = async (): Promise<EnsureUserResult> => {
    const core = await ensureCore()
    const app = await ensureApp()

    if ((core.created || app.created) && import.meta.client) {
      router.push('/dashboard')
    }

    return {
      createdCore: core.created,
      createdApp: app.created,
      id: core.id,
      displayName: core.displayName,
    }
  }

  return { ensureUser, ensureCore, ensureApp }
}
```

## packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/main/useUserFetch.ts

```ts
// FILE: packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/main/useUserFetch.ts
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'
import type { Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/config/FireUXConfig.ts'
import type {
  User,
  AppUser,
} from 'fireux-core/runtime/models/core/user.model.ts'

/**
 * Minimal user fetch:
 * - Fires global + app listeners (when path pieces exist)
 * - Returns refs directly (no computed merge)
 */
export type UserRefs = {
  coreUser: Ref<User | undefined | null>
  appUser: Ref<AppUser | undefined | null>
}

export function useUserFetch(id: string | null | undefined) {
  const db = useFirestore()
  const { appId } = useFireUXConfig()

  const { data: coreUser } = useDocument<User | undefined>(
    id ? (doc(db, 'users', id) as any) : null
  )

  const { data: appUser } = useDocument<AppUser | undefined>(
    id && appId ? (doc(db, 'apps', appId, 'users', id) as any) : null
  )

  const user: UserRefs = { coreUser, appUser }

  return { user }
}
```

## packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/mutations/useUserUpdate.ts

`useUserUpdate` now composes the dedicated core/app mutation modules and returns a structured object:

```ts
export function useUserUpdate(user: UserRefs, sourceLabel = 'unspecified') {
  const core = useCoreUserUpdate(user)
  const app = useAppUserUpdate(user)

  return {
    core, // { profile, tags, notifications }
    app, // { membership, notifications }
    ...core,
    ...app,
  }
}
```

Callers should access the scoped helpers directly (e.g., `core.profile.rename`, `core.tags.add`, `app.membership.setRole`). Flat aliases have been removed to avoid drifting legacy patterns.

## packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/utils/forms/useUserFormatting.ts

```ts
// FILE: packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/useUserFormattingAndValidation.ts
const MIN_DISPLAY_NAME_LENGTH = 2
const MAX_DISPLAY_NAME_LENGTH = 60
const MIN_HANDLE_LENGTH = 3
const MAX_HANDLE_LENGTH = 30
const MAX_EMAIL_LENGTH = 254
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_BIO_LENGTH = 280

function validateDisplayName(name: string) {
  const value = (name || '').trim()
  if (!value) return { isValid: false, message: 'Name cannot be empty.' }
  if (value.length < MIN_DISPLAY_NAME_LENGTH)
    return { isValid: false, message: 'Name is too short.' }
  if (value.length > MAX_DISPLAY_NAME_LENGTH)
    return { isValid: false, message: 'Name is too long.' }
  return { isValid: true }
}

function formatDisplayName(name: string) {
  const value = (name || '').trim()
  return value
    .split(/\s+/)
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ')
}

function validateHandle(raw: string) {
  const value = String(raw || '').trim()
  if (!value) return { isValid: true }
  const normalized = value.toLowerCase()
  if (normalized.length < MIN_HANDLE_LENGTH)
    return { isValid: false, message: 'Handle too short.' }
  if (normalized.length > MAX_HANDLE_LENGTH)
    return { isValid: false, message: 'Handle too long.' }
  if (!/^[a-z0-9-]+$/.test(normalized)) {
    return {
      isValid: false,
      message: 'Use lowercase letters, numbers, and dashes only.',
    }
  }
  return { isValid: true }
}

function formatHandle(raw: string) {
  let candidate = String(raw || '')
    .trim()
    .toLowerCase()
  candidate = candidate.replaceAll(/^@+/g, '')
  candidate = candidate.replaceAll(/\s+/g, '-')
  candidate = candidate.replaceAll(/[^a-z0-9-]/g, '')
  candidate = candidate.replaceAll(/-+/g, '-')
  candidate = candidate.replaceAll(/^-|-$|_/g, '')
  return candidate.slice(0, MAX_HANDLE_LENGTH)
}

function validateEmail(raw: string) {
  const value = (raw || '').trim()
  if (!value) return { isValid: false, message: 'Email cannot be empty.' }
  if (value.length > MAX_EMAIL_LENGTH)
    return { isValid: false, message: 'Email is too long.' }
  if (!EMAIL_REGEX.test(value))
    return { isValid: false, message: 'Enter a valid email address.' }
  return { isValid: true }
}

function formatEmail(raw: string) {
  return (raw || '').trim().toLowerCase()
}

function validateBio(raw: string) {
  const value = typeof raw === 'string' ? raw.trim() : ''
  if (!value) return { isValid: true }
  if (value.length > MAX_BIO_LENGTH) {
    return {
      isValid: false,
      message: `Bio must be ${MAX_BIO_LENGTH} characters or less.`,
    }
  }
  return { isValid: true }
}

function formatBio(raw: string) {
  if (typeof raw !== 'string') return ''
  return raw.replaceAll('\r\n', '\n').trim()
}

export function useUserFormattingAndValidation() {
  return {
    validateDisplayName,
    formatDisplayName,
    validateHandle,
    formatHandle,
    validateEmail,
    formatEmail,
    validateBio,
    formatBio,
  }
}
```

## packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/utils/forms/usUserValidation.ts

_(file is empty)_

```}

```
