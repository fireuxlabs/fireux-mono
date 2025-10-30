# App Stack Scripts

## packages/core/fireux-core/src/runtime/pages/apps/index.vue

```ts
<script setup lang="ts">
import { useApp } from 'fireux-core/runtime/composables/firestore/core/app/useApp.ts'
import { useAppCollection } from 'fireux-core/runtime/composables/firestore/core/app/main/useAppCollection.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'

definePageMeta({
  nav: {
    key: 'apps',
    label: 'Apps',
    icon: 'i-lucide-grid',
    order: 40,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Apps',
  description: 'Registered FireUX apps',
})

const { appId, isGlobal } = useFireUXConfig()
const { app, pillProps } = useApp()
const { apps } = useAppCollection()
const currentPill = computed(() => (app.value ? pillProps(app.value) : null))
const currentAppId = computed(() => app.value?.id ?? appId ?? null)

const showAll = ref(isGlobal)
const allApps = computed(() => (showAll.value ? apps.value ?? [] : []))

function loadAllApps() {
  if (showAll.value) return
  showAll.value = true
}
</script>
```

## packages/core/fireux-core/src/runtime/pages/apps/[id].vue

```ts
<script setup lang="ts">
import { useHead } from 'nuxt/app'
import { useRoute } from 'vue-router'
import type { App } from 'fireux-core/runtime/models/core/app.model.ts'
import { useFirestoreRead } from 'fireux-core/runtime/composables/firestore/operations/useFirestoreRead.ts'
import { useAppComputed } from 'fireux-core/runtime/composables/firestore/core/app/main/useAppComputed.ts'

const route = useRoute()
const appId = Array.isArray(route.params.id)
  ? route.params.id[0] ?? ''
  : route.params.id?.toString() ?? ''

const { firestoreFetchDoc } = useFirestoreRead()
const app = appId
  ? firestoreFetchDoc<App>('apps', appId)
  : computed<App | null | undefined>(() => null)
const isLoading = computed(() => Boolean(app.value === undefined))
const headerTitle = computed(() => app.value?.app_name ?? 'App Details')
const pageTitle = computed(() => app.value?.app_name ?? 'App Details')

const { pillProps } = useAppComputed(app)

useHead({
  title: computed(() =>
    app.value?.app_name ? `${app.value.app_name} · App` : 'App Details'
  ),
})
</script>
```

## packages/core/fireux-core/src/runtime/pages/dev/apps.vue

```ts
<script setup lang="ts">
import { useApp } from 'fireux-core/runtime/composables/firestore/core/app/useApp.ts'
import { useAppCollection } from 'fireux-core/runtime/composables/firestore/core/app/main/useAppCollection.ts'
import { useDevClipboard } from '../../composables/dev/useDevClipboard.ts'

definePageMeta({
  layout: 'dev',
  alias: ['/dev/apps'],
  nav: {
    key: 'dev-apps',
    label: 'Apps',
    icon: 'i-lucide-app-window',
    desktop: true,
    group: 'core',
    layouts: ['dev'],
  },
})

const { app, appUsers, isLoading, isInitialized, pillProps } = useApp()
const { apps } = useAppCollection()
const { copyJSON } = useDevClipboard()
</script>
```

## packages/core/fireux-core/src/runtime/pages/dashboard/app.vue

```ts
<script setup lang="ts">
import { useApp } from '../../composables/firestore/core/app/useApp.ts'
import { useUser } from '../../composables/firestore/core/user/_useUser.ts'

const { app } = useApp()
const { isAdmin } = useUser()

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-app',
    label: 'App Settings',
    icon: 'i-lucide-badge-check',
    desktop: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
})

const hero = computed(() => {
  const value = app.value
  if (!value) return null

  const to = value.id ? `/apps/${value.id}` : null
  return {
    pill: {
      to,
      title: value.app_name || value.id,
      subtitle: value.ecosystem || value.role || null,
      avatar: value.avatar_url || value.logo_url || value.wordmark_url || null,
      initials: 'A',
    },
    cellComponent: 'OrganismsAppCardsCell',
    cellProps: {
      app: value,
      to,
    },
  }
})
</script>
```

## packages/core/fireux-core/src/runtime/pages/dashboard/user-profile.vue

```ts
<script setup lang="ts">
import { useUser } from '../../composables/firestore/core/user/_useUser'

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-user-profile',
    label: 'User Profile',
    icon: 'i-lucide-user',
    desktop: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
})

const useHeadFn = (globalThis as any).useHead as
  | undefined
  | ((input: any) => void)
useHeadFn?.({ title: 'Your Profile' })

const { user: userRef, pillProps } = useUser()

const user = computed(() => userRef.value ?? null)

const hero = computed(() => {
  const value = user.value
  if (!value) return null
  return {
    pill: pillProps.value(value),
    cellComponent: 'OrganismsUserCardsCell',
    cellProps: {
      user: value,
    },
  }
})
</script>
```
