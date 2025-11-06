# FireUX Core App Composable Stack

## packages/core/fireux-core/src/runtime/composables/firestore/core/app/useApp.ts

```ts
import { useFireUXConfig } from '../../../FireUXConfig'
import { useAppFetch } from './main/useAppFetch'
import { useAppComputed } from './main/useAppComputed'
import { useAppEnsure } from './main/useAppEnsure'
import { useAppUpdate } from './main/useAppUpdate'
import { useAppUsers } from './subcollections/useAppUsers'

export function useApp() {
  const { appId } = useFireUXConfig()
  const { app } = useAppFetch(appId)
  const { appUsers } = useAppUsers()
  return {
    app,
    appUsers,
    ...useAppComputed(app),
    ...useAppEnsure(),
    ...useAppUpdate(app),
  }
}
```

## packages/core/fireux-core/src/runtime/composables/firestore/core/app/main/useAppFetch.ts

```ts
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'
import type { App } from 'fireux-core/runtime/models/core/app.model.ts'

/**
 * Fetch a single app document by id.
 * Reactive through VueFire — no computed layer required.
 */
export function useAppFetch(appId: string | null | undefined) {
  const db = useFirestore()
  const docRef = appId ? (doc(db, 'apps', appId) as any) : null
  const { data: app } = useDocument<App | undefined>(docRef)
  return { app }
}
```

## packages/core/fireux-core/src/runtime/composables/firestore/core/app/main/useAppComputed.ts

```ts
import { computed } from 'vue'
import type { Ref } from 'vue'
import type {
  App,
  AppPillProps,
} from 'fireux-core/runtime/models/core/app.model.ts'

export function useAppComputed(app: Ref<App | null | undefined>) {
  const isInitialized = computed(() => Boolean(app.value?.admin_ids?.length))

  const pillProps = (target?: App | null): AppPillProps => ({
    avatar: target?.avatar_url ?? '',
    initials: 'A',
    title: target?.app_name ?? target?.id ?? 'App',
    subtitle: target?.ecosystem ?? '',
    to: target?.id ? `/apps/${target.id}` : '#',
  })

  return { isInitialized, pillProps }
}
```

## packages/core/fireux-core/src/runtime/composables/firestore/core/app/main/useAppInterface.ts

```ts
import type { Ref } from 'vue'
import type { App, AppCard } from 'fireux-core/runtime/models/core/app.model.ts'
import type { Pill } from 'fireux-core/runtime/types/pill.model.ts'

export function useAppInterface(appRef?: Ref<App | null | undefined>) {
  const resolve = () => appRef?.value ?? null

  const toPill = (): Pill.Props => {
    const app = resolve()
    const role = app?.role ?? ''
    const status = app?.status ?? ''

    return {
      avatar: app?.avatar_url ?? '',
      initials: 'A',
      title: app?.app_name ?? '',
      subtitle: app?.ecosystem ?? '',
      badges: [role, status].filter(Boolean),
      to: app?.id ? `/apps/${app.id}` : '',
    }
  }

  const toCell = (): AppCard.Cell & { to?: string } => {
    const app = resolve()
    return {
      id: app?.id ?? '',
      app_name: app?.app_name ?? '',
      role: app?.role ?? 'tenant',
      creator_id: app?.creator_id ?? '',
      admin_ids: app?.admin_ids ?? [],
      created_at: app?.created_at,
      avatar_url: app?.avatar_url ?? '',
      logo_url: app?.logo_url ?? '',
      wordmark_url: app?.wordmark_url ?? '',
      to: app?.id ? `/apps/${app.id}` : '',
    }
  }

  const toProfile = (): AppCard.Profile & { to?: string } => ({
    ...toCell(),
  })

  return { toPill, toCell, toProfile }
}
```

## packages/core/fireux-core/src/runtime/composables/firestore/core/app/main/useAppEnsure.ts

```ts
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import {
  ensureAppMembership as ensureAppMembershipDoc,
  ensureDoc,
} from '../../../utils/ensureCommon.ts'
import { requireUid } from '../../../utils/useEnsureCommon.ts'
import type { App } from 'fireux-core/runtime/models/core/app.model.ts'

type EnsureAppDocResult = { created: boolean; id: string }
type EnsureMembershipResult = { created: boolean }

export function useAppEnsure() {
  const { appId, ecosystem, role, appName } = useFireUXConfig()

  async function ensureAppDoc(): Promise<EnsureAppDocResult> {
    if (!appId || !ecosystem) {
      throw new Error('[ensureAppDoc] missing app configuration')
    }

    const { uid } = await requireUid()
    const payload = {
      id: appId,
      ecosystem,
      role,
      app_name: appName || appId,
      creator_id: uid,
    } as App

    const result = await ensureDoc<App>('apps', appId, payload)
    if (result.created) {
      await ensureAppMembershipDoc(appId, uid, 'admin')
    }

    return { created: result.created, id: appId }
  }

  async function ensureAppMembership(
    uid: string,
    membershipRole: 'admin' | 'user' = 'user'
  ): Promise<EnsureMembershipResult> {
    if (!appId) return { created: false }
    return ensureAppMembershipDoc(appId, uid, membershipRole)
  }

  const ensureApp = () => ensureAppDoc()

  return { ensureApp, ensureAppDoc, ensureAppMembership }
}
```

## packages/core/fireux-core/src/runtime/composables/firestore/core/app/main/useAppUpdate.ts

```ts
import type { Ref } from 'vue'
import type { App } from 'fireux-core/runtime/models/core/app.model.ts'
import type {
  AppUser,
  User,
} from 'fireux-core/runtime/models/core/user.model.ts'
import { arrayRemove, arrayUnion } from 'firebase/firestore'
import { useFirestoreUpdate } from '../../../operations/useFirestoreUpdate.ts'
import { useFirestoreCreate } from '../../../operations/useFirestoreCreate.ts'

export function useAppUpdate(appRef: Ref<App | null | undefined>) {
  const { updateDocument } = useFirestoreUpdate()
  const { setDocument } = useFirestoreCreate()

  const ensureAppId = () => {
    const id = appRef.value?.id
    if (!id) throw new Error('[useAppUpdate] Missing app or app.id')
    return id
  }

  async function updateDescription(description: string) {
    const id = ensureAppId()
    const value = String(description ?? '').trim()
    await updateDocument<App>('apps', id, { description: value })
  }

  async function updateInstagram(url: string) {
    const id = ensureAppId()
    const value = String(url ?? '').trim()
    const sanitized = value.length > 0 ? value : null
    await updateDocument<App>('apps', id, {
      social_links: { instagram: sanitized },
    })
  }

  /**
   * Handles an app join request.
   * - Always removes user from `join_requests[]`
   * - If approve=true, adds minimal doc to `apps/{id}/users/{uid}`
   */
  async function handleJoinRequests(uid: string, approve: boolean) {
    const appId = ensureAppId()
    await updateDocument<App>('apps', appId, {
      join_requests: arrayRemove(uid) as unknown as App['join_requests'],
    })

    if (approve) {
      await setDocument(`apps/${appId}/users`, uid, { id: uid, role: 'user' })
      await updateDocument<User>('users', uid, {
        userOf: arrayUnion(appId) as unknown as string[],
      })
    }
  }

  async function setAppUserAdmin(uid: string, makeAdmin: boolean) {
    const appId = ensureAppId()
    const role = makeAdmin ? 'admin' : 'user'

    let updatedDoc = false
    try {
      await updateDocument<AppUser>(`apps/${appId}/users`, uid, { role })
      updatedDoc = true
    } catch {
      updatedDoc = false
    }

    if (!updatedDoc) {
      await setDocument(`apps/${appId}/users`, uid, { id: uid, role })
    }

    await updateDocument<App>('apps', appId, {
      admin_ids: (makeAdmin
        ? arrayUnion(uid)
        : arrayRemove(uid)) as unknown as App['admin_ids'],
    })

    const userUpdates: Partial<User> = makeAdmin
      ? {
          adminOf: arrayUnion(appId) as unknown as string[],
          userOf: arrayUnion(appId) as unknown as string[],
        }
      : {
          adminOf: arrayRemove(appId) as unknown as string[],
        }

    await updateDocument<User>('users', uid, userUpdates)
  }

  return {
    updateDescription,
    updateInstagram,
    handleJoinRequests,
    setAppUserAdmin,
  }
}
```

## packages/core/fireux-core/src/runtime/composables/firestore/core/app/subcollections/useAppUsers.ts

```ts
import { computed, ref } from 'vue'
import { collection } from 'firebase/firestore'
import { useFirestore, useCollection } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useUserFetch } from 'fireux-core/runtime/composables/firestore/core/user/main/useUserFetch.ts'
import type {
  User,
  AppUser,
} from 'fireux-core/runtime/models/core/user.model.ts'

type AppUserWithCore = Partial<User> & { appUser: AppUser }

/**
 * Fetch /apps/{appId}/users and merge each overlay with its core user.
 */
export function useAppUsers() {
  const db = useFirestore()
  const { appId } = useFireUXConfig()
  if (!appId) return { appUsers: ref<AppUserWithCore[]>([]) }

  const overlays = useCollection<AppUser>(
    collection(db, 'apps', appId, 'users') as any
  )

  const cache: Record<string, ReturnType<typeof useUserFetch>['user']> = {}
  const ensureUserRefs = (uid: string) =>
    (cache[uid] ||= useUserFetch(uid).user)

  const appUsers = computed<AppUserWithCore[]>(() =>
    (overlays.value ?? []).map((overlay) => {
      const { coreUser } = ensureUserRefs(overlay.id)
      const core = coreUser?.value as User | undefined

      return {
        ...(core ?? { id: overlay.id }),
        appUser: overlay,
      }
    })
  )

  return { appUsers }
}
```

```

```
