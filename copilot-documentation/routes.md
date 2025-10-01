# DEPRECATED — Legacy routes helpers (migrated)

Status: deprecated (2025-09-30)

This document described tenant/core “routes helpers,” which have been removed.

See instead:

- Meta-driven navigation overview: `copilot-documentation/nav.md`
- Migration guide: `copilot-documentation/rout-to-nav.md`

---

# Routes wiring report

Purpose: single place showing the exact source of truth for default layout routes.

---

## Core layout: `packages/core/fireux-core/src/runtime/layouts/default.vue`

```vue
<!-- packages/core/fireux-core/src/runtime/layouts/CoreDefault.vue -->
<template>
  <div class="layout-wrapper">
    <LayoutsDefaultHeader
      :menu-bar-links="finalMenuBarLinks"
      :mobile-links="finalMobileLinks"
    />

    <main class="layout-main">
      <UContainer>
        <NuxtPage />
      </UContainer>
    </main>

    <LayoutsDefaultFooter />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLink } from '../types/routeLink'
import { useCoreRoutes } from '../composables/app/routes/useCoreRoutes'
// Nuxt app config fallback for simpler tenant usage. This function is
// available at runtime via auto-import; we declare it for typing here.
declare function useAppConfig(): any

defineOptions({ name: 'CoreDefault' })

const props = withDefaults(
  defineProps<{
    // New, simpler API: pass all tenant links + id allow-lists,
    // and CoreDefault will filter and merge with core links.
    links?: RouteLink[]
    menuIds?: string[]
    mobileIds?: string[]
    // Back-compat: explicit pre-filtered routes from tenant
    routes?: {
      menuBarLinks?: RouteLink[]
      mobileLinks?: RouteLink[]
    }
  }>(),
  {
    links: undefined,
    menuIds: undefined,
    mobileIds: undefined,
    routes: undefined,
  }
)

// Core owns these ids
const { links } = useCoreRoutes()
const CORE_MENU_IDS = ['home', 'products', 'blog', 'users']
const CORE_MOBILE_IDS = [...CORE_MENU_IDS, 'user', 'admin']

const coreMenuBarLinks = computed<RouteLink[]>(() =>
  links.value.filter((r) => CORE_MENU_IDS.includes(r.id))
)
const coreMobileLinks = computed<RouteLink[]>(() =>
  links.value.filter((r) => CORE_MOBILE_IDS.includes(r.id))
)

// Merge helper: stable merge by id (core-first), drop duplicates
function mergeById(core: RouteLink[], tenant: RouteLink[]): RouteLink[] {
  const out: RouteLink[] = []
  const seen = new Set<string>()
  for (const item of core) {
    if (!seen.has(item.id)) {
      seen.add(item.id)
      out.push(item)
    }
  }
  for (const item of tenant) {
    if (!seen.has(item.id)) {
      seen.add(item.id)
      out.push(item)
    }
  }
  return out
}

// Resolve tenant-provided links
// Optional app config fallback: apps can define app.config.ts { coreLayout: { menuIds, mobileIds } }
const appConfig = (
  typeof useAppConfig === 'function' ? useAppConfig() : {}
) as any
const configMenuIds: string[] | undefined = appConfig?.coreLayout?.menuIds
const configMobileIds: string[] | undefined = appConfig?.coreLayout?.mobileIds

const tenantMenuBarLinks = computed<RouteLink[]>(() => {
  if (props.routes?.menuBarLinks) return props.routes.menuBarLinks
  if (props.links) {
    // If menuIds provided (props or app config), filter by ids; else include all tenant links
    const ids = props.menuIds?.length ? props.menuIds : configMenuIds
    return ids?.length
      ? props.links.filter((r) => ids.includes(r.id))
      : props.links
  }
  return []
})

const tenantMobileLinks = computed<RouteLink[]>(() => {
  if (props.routes?.mobileLinks) return props.routes.mobileLinks
  if (props.links) {
    const ids = props.mobileIds?.length ? props.mobileIds : configMobileIds
    return ids?.length
      ? props.links.filter((r) => ids.includes(r.id))
      : props.links
  }
  return []
})

// Core-first, then tenant-provided, deduped by id
const finalMenuBarLinks = computed<RouteLink[]>(() =>
  mergeById(coreMenuBarLinks.value, tenantMenuBarLinks.value)
)

const finalMobileLinks = computed<RouteLink[]>(() =>
  mergeById(coreMobileLinks.value, tenantMobileLinks.value)
)
</script>
<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.layout-main {
  flex: 1;
  padding-block: var(--spacing-m);
}
</style>
```

---

## Core route types: `packages/core/fireux-core/src/runtime/types/routeLink.ts`

```ts
// Route link interface for navigation items
/**
 * Canonical RouteLink interface for navigation items (used everywhere).
 * id: required, domain-specific identifier (e.g. 'chef', 'jobs', 'admin', etc.)
 */
export interface RouteLink {
  id: string
  label: string
  icon?: string
  // Leaf links have `to`; grouped links omit `to` and provide `children`
  to?: string
  children?: RouteLink[]
}
```

---

## Core route composition: `packages/core/fireux-core/src/runtime/composables/app/routes/useCoreRoutes.ts`

```ts
import { computed } from 'vue'
import { useSystemRoutes } from './useSystemRoutes'
import { useUserRoutes } from './useUserRoutes'
import { useAdminRoutes } from './useAdminRoutes'
import { useUser } from '../../firestore/user/useUser'

export function useCoreRoutes() {
  const systemRoutes = useSystemRoutes()
  const { hasCoreProfile, isAdmin } = useUser()

  const links = computed(() => [
    ...systemRoutes,
    ...(hasCoreProfile.value ? useUserRoutes() : []),
    ...(isAdmin.value ? useAdminRoutes() : []),
  ])

  return { links }
}
```

### System routes: `packages/core/fireux-core/src/runtime/composables/app/routes/useSystemRoutes.ts`

```ts
import type { RouteLink } from '../../../types/routeLink'

export function useSystemRoutes(): RouteLink[] {
  return [
    { id: 'home', label: 'Home', icon: 'i-lucide-home', to: '/' },
    {
      id: 'products',
      label: 'Products',
      icon: 'i-lucide-box',
      to: '/products',
    },
    { id: 'blog', label: 'Blog', icon: 'i-lucide-book', to: '/blog' },
    { id: 'users', label: 'Users', icon: 'i-lucide-users', to: '/users' },
  ]
}
```

### User routes: `packages/core/fireux-core/src/runtime/composables/app/routes/useUserRoutes.ts`

```ts
import type { RouteLink } from '../../../types/routeLink'

export function useUserRoutes(): RouteLink[] {
  const userRoutes: RouteLink[] = [
    {
      id: 'dashboard',
      label: 'Overview',
      icon: 'i-lucide-layout-dashboard',
      to: '/dashboard',
    },
    {
      id: 'user-profile',
      label: 'Profile',
      icon: 'i-lucide-user',
      to: '/dashboard/user-profile',
    },
    {
      id: 'purchases',
      label: 'Purchases',
      icon: 'i-lucide-shopping-cart',
      to: '/dashboard/purchases',
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: 'i-lucide-heart',
      to: '/dashboard/favorites',
    },
    {
      id: 'followers',
      label: 'Followers',
      icon: 'i-lucide-users',
      to: '/dashboard/followers',
    },
  ]

  return userRoutes.length
    ? [
        {
          id: 'user',
          label: 'User',
          icon: 'i-lucide-user-circle',
          children: userRoutes,
        },
      ]
    : []
}
```

### Admin routes: `packages/core/fireux-core/src/runtime/composables/app/routes/useAdminRoutes.ts`

```ts
import type { RouteLink } from '../../../types/routeLink'

export function useAdminRoutes(): RouteLink[] {
  const adminRoutes: RouteLink[] = [
    {
      id: 'admin-overview',
      label: 'Admin Overview',
      icon: 'i-lucide-layout-dashboard',
      to: '/admin',
    },
    {
      id: 'admin-users',
      label: 'Users',
      icon: 'i-lucide-users',
      to: '/admin/users',
    },
    {
      id: 'admin-products',
      label: 'Products',
      icon: 'i-lucide-box',
      to: '/admin/products',
    },
    {
      id: 'admin-blog',
      label: 'Blog',
      icon: 'i-lucide-book',
      to: '/admin/blog',
    },
    {
      id: 'admin-settings',
      label: 'Settings',
      icon: 'i-lucide-sliders',
      to: '/admin/settings',
    },
  ]

  return adminRoutes.length
    ? [
        {
          id: 'admin',
          label: 'Admin',
          icon: 'i-lucide-shield',
          children: adminRoutes,
        },
      ]
    : []
}
```

---

## Misebox tenant: `packages/tenants/fireux-misebox`

### Layout: `src/runtime/layouts/MiseboxDefault.vue`

```vue
<template>
  <CoreDefault :routes="routes" />
</template>

<script setup lang="ts">
import { useMiseboxRoutes } from '../composables/app/routes/useMiseboxRoutes'

const { routes } = useMiseboxRoutes()
</script>
```

### Composable: `src/runtime/composables/app/routes/useMiseboxRoutes.ts`

```ts
// Tenant-only navigation builder (no core links). Provides flat array and pre-filtered subsets.
import { computed } from 'vue'
// Avoid restricted deep imports: rely on Nuxt auto-import for useUser
// and define a minimal local RouteLink type compatible with core.
declare function useUser(): any
interface RouteLink {
  id: string
  label: string
  icon?: string
  to?: string
  children?: RouteLink[]
}
import { getJobRoutes } from '../../../../../../../extensions/fireux-jobs/src/runtime/composables/app/routes/useJobRoutes'

export function useMiseboxRoutes() {
  const { user } = useUser()

  const hasProfile = (profileType: string) => {
    const app = user.value?.app
    if (!app) return false
    const list = Array.isArray(app?.app_profiles) ? app.app_profiles : []
    return list.includes(profileType)
  }

  // Public Misebox discovery routes
  const miseboxPublic: RouteLink[] = [
    { id: 'chefs', label: 'Chefs', icon: 'i-lucide-chef-hat', to: '/chefs' },
    {
      id: 'suppliers',
      label: 'Suppliers',
      icon: 'i-lucide-truck',
      to: '/suppliers',
    },
    {
      id: 'kitchens',
      label: 'Kitchens',
      icon: 'i-lucide-cooking-pot',
      to: '/kitchens',
    },
    {
      id: 'recipes',
      label: 'Recipes',
      icon: 'i-lucide-book-open',
      to: '/recipes',
    },
  ]

  const links = computed<RouteLink[]>(() => {
    // Profile shortcuts (dashboard) conditional
    const profileShortcuts: RouteLink[] = []
    if (hasProfile('chef')) {
      profileShortcuts.push({
        id: 'chef-profile',
        label: 'Chef Profile',
        icon: 'i-lucide-chef-hat',
        to: '/dashboard/chef-profile',
      })
    }
    if (hasProfile('supplier')) {
      profileShortcuts.push({
        id: 'supplier-profile',
        label: 'Supplier Profile',
        icon: 'i-lucide-package',
        to: '/dashboard/supplier-profile',
      })
    }

    // Jobs extension routes (public + profile/dashboard flavor)
    const jobs = getJobRoutes(hasProfile)

    return [
      ...miseboxPublic,
      ...jobs.jobRoutes,
      ...profileShortcuts,
      ...jobs.jobProfileRoutes,
    ]
  })

  // Pre-filtered subsets for layout consumption
  const MENU_IDS = new Set<string>([
    'chefs',
    'suppliers',
    'kitchens',
    'recipes',
    'jobs',
    'employers',
    'professionals',
  ])
  const MOBILE_IDS = new Set<string>([
    ...Array.from(MENU_IDS),
    'chef-profile',
    'supplier-profile',
    'employer-profile',
    'professional-profile',
  ])

  const menuLinks = computed<RouteLink[]>(() =>
    links.value.filter((r) => MENU_IDS.has(r.id))
  )
  const mobileLinks = computed<RouteLink[]>(() =>
    links.value.filter((r) => MOBILE_IDS.has(r.id))
  )

  // Ready-to-pass shape for CoreDefault
  const routes = computed(() => ({
    menuBarLinks: menuLinks.value,
    mobileLinks: mobileLinks.value,
  }))

  return { links, menuLinks, mobileLinks, routes }
}
```

---

## Header component consuming links

`packages/core/fireux-core/src/runtime/components/layouts/default/Header.vue`

```vue
<UNavigationMenu
  v-if="!isMobile"
  orientation="horizontal"
  :items="menuBarLinks"
/>
...
<UNavigationMenu orientation="vertical" :items="mobileLinks" class="w-full" />
```

---

## Auto-import setup for composables

`packages/core/fireux-core/src/config/composables-config.ts`

```ts
import { addImportsDir, type Resolver } from '@nuxt/kit'

export function configureComposables(resolver: Resolver) {
  addImportsDir(resolver.resolve('./runtime/composables'))
  addImportsDir(resolver.resolve('./runtime/composables/**'))
}
```

This ensures `useUser` and other composables are auto-imported across layers.

---

## Jobs extension route provider

`packages/extensions/fireux-jobs/src/runtime/composables/app/routes/useJobRoutes.ts`

```ts
// Export for public job routes
// Local type to avoid cross-package deep imports
import type { RouteLink } from 'fireux-core/runtime/types/routeLink'

export function getJobRoutes(hasProfile: (profileType: string) => boolean) {
  const jobRoutes: RouteLink[] = [
    { id: 'jobs', label: 'Jobs', icon: 'i-lucide-briefcase', to: '/jobs' },
    {
      id: 'employers',
      label: 'Employers',
      icon: 'i-lucide-building-2',
      to: '/employers',
    },
    {
      id: 'professionals',
      label: 'Professionals',
      icon: 'i-lucide-users',
      to: '/professionals',
    },
  ]

  const jobProfileRoutes: RouteLink[] = []
  if (hasProfile('employer')) {
    jobProfileRoutes.push({
      id: 'employer-profile',
      label: 'Employer Profile',
      icon: 'i-lucide-briefcase',
      to: '/dashboard/employer-profile',
    })
  }
  if (hasProfile('professional')) {
    jobProfileRoutes.push({
      id: 'professional-profile',
      label: 'Professional Profile',
      icon: 'i-lucide-user',
      to: '/dashboard/professional-profile',
    })
  }

  return { jobRoutes, jobProfileRoutes }
}
```

Note: This file deep-imports `RouteLink` from core; if your eslint rules disallow it, mirror a local RouteLink type here similar to Misebox to avoid restricted import warnings.

---

## Additional route composables and layouts (full listing)

Below are the remaining route composables and layout files referenced by the routing system, embedded verbatim.

### Core layouts

`packages/core/fireux-core/src/runtime/layouts/landing.vue`

```vue
<template>
  <ClientOnly>
    <div class="layout-wrapper">
      <LayoutsDefaultHeader
        :menu-bar-links="menuBarLinks"
        :mobile-links="mobileLinks"
      />
      <UMain>
        <UContainer>
          <UBanner
            v-if="isDev"
            class="mb-2"
            icon="i-heroicons-wrench-screwdriver"
            color="warning"
            variant="subtle"
            :title="`Welcome to ${appDisplayName} — you are in dev mode`"
          />
          <!-- Dev tools: scoped to landing only -->
          <ClientOnly>
            <div class="dev-tools-corner">
              <AppDebug />
            </div>
          </ClientOnly>
          <NuxtPage />
        </UContainer>
      </UMain>
      <LayoutsDefaultFooter />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
// Nuxt auto-imports composables like computed
import { useCoreRoutes } from '../composables/app/routes/useCoreRoutes'
const { links } = useCoreRoutes()
import { useFireUXConfig } from '../composables/FireUXConfig'
import { computed } from 'vue'

const { appName } = useFireUXConfig()
const appDisplayName = computed(() => appName || 'FireUX')
const isDev = process.dev

const KEEP_MENU = new Set(['home', 'products', 'blog', 'users'])
const KEEP_MOBILE = new Set([...KEEP_MENU, 'user', 'admin'])

const menuBarLinks = computed(() =>
  links.value.filter((r) => KEEP_MENU.has(r.id))
)
const mobileLinks = computed(() =>
  links.value.filter((r) => KEEP_MOBILE.has(r.id))
)

defineOptions({ name: 'CoreLanding' })
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
}
.layout-wrapper > * {
  align-self: stretch;
}
/* Non-blocking position for dev tools button */
.dev-tools-corner {
  position: relative;
}
</style>
```

`packages/core/fireux-core/src/runtime/layouts/portfolio.vue`

```vue
<template>
  <ClientOnly>
    <div>
      <UContainer class="sm:border-x border-default pt-10">
        <LayoutsDefaultHeader
          :menu-bar-links="menuBarLinks"
          :mobile-links="mobileLinks"
        />
        <NuxtPage />
        <LayoutsDefaultFooter />
      </UContainer>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCoreRoutes } from '../composables/app/routes/useCoreRoutes'

const { links } = useCoreRoutes()
const KEEP_MENU = new Set(['home', 'products', 'blog', 'users'])
const KEEP_MOBILE = new Set([...KEEP_MENU, 'user', 'admin'])

const menuBarLinks = computed(() =>
  links.value.filter((r) => KEEP_MENU.has(r.id))
)
const mobileLinks = computed(() =>
  links.value.filter((r) => KEEP_MOBILE.has(r.id))
)

defineOptions({ name: 'CorePortfolio' })
</script>
```

`packages/core/fireux-core/src/runtime/layouts/chat.vue`

```vue
<template>
  <ClientOnly>
    <UDashboardGroup unit="rem">
      <LayoutsDefaultHeader
        :menu-bar-links="menuBarLinks"
        :mobile-links="mobileLinks"
      />
      <!-- Leave sidebar/search to chat pages; render page content here -->
      <NuxtPage />
      <LayoutsDefaultFooter />
    </UDashboardGroup>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCoreRoutes } from '../composables/app/routes/useCoreRoutes'

const { links } = useCoreRoutes()
const KEEP_MENU = new Set(['home', 'products', 'blog', 'users'])
const KEEP_MOBILE = new Set([...KEEP_MENU, 'user', 'admin'])

const menuBarLinks = computed(() =>
  links.value.filter((r) => KEEP_MENU.has(r.id))
)
const mobileLinks = computed(() =>
  links.value.filter((r) => KEEP_MOBILE.has(r.id))
)

defineOptions({ name: 'CoreChat' })
</script>
```

`packages/core/fireux-core/src/runtime/layouts/docs.vue`

```vue
<script setup lang="ts">
import { inject, type Ref } from 'vue'
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
</script>

<template>
  <UMain>
    <UContainer>
      <UPage>
        <template #left>
          <UPageAside>
            <template #top>
              <div class="flex flex-col gap-2 w-[calc(100%+1.25rem)] -mx-2.5">
                <FrameworkSelect />
                <ModuleSelect />
              </div>
            </template>

            <UContentNavigation
              :navigation="navigation"
              highlight
              :ui="{ linkTrailingBadge: 'font-semibold uppercase' }"
            >
              <template #link-title="{ link }">
                <span class="inline-flex items-center gap-0.5">
                  {{ link.title }}

                  <sup
                    v-if="link.module === 'ui-pro'"
                    class="text-[8px] font-medium text-primary"
                    >PRO</sup
                  >
                </span>
              </template>
            </UContentNavigation>
          </UPageAside>
        </template>

        <NuxtPage />
      </UPage>
    </UContainer>
  </UMain>
</template>
```

`packages/core/fireux-core/src/runtime/layouts/dev.vue`

```vue
<template>
  <ClientOnly>
    <div class="layout-wrapper">
      <DevNav :links="safeDevRoutes.miseboxDevRoutes || []" />
      <!-- Debug component removed -->
      <NuxtPage />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
// Vue's computed is auto-imported by Nuxt; declare for TS
declare const computed: <T>(getter: () => T) => import('vue').ComputedRef<T>
const props = defineProps<{
  devRoutes?: import('../types/layouts').DevRoutes
}>()
const safeDevRoutes = computed(
  () => props.devRoutes ?? ({} as import('../types/layouts').DevRoutes)
)
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
}

.layout-wrapper > * {
  align-self: stretch;
}
</style>
```

`packages/core/fireux-core/src/runtime/layouts/dashboard.vue`

```vue
<!-- packages/core/fireux-core/src/runtime/layouts/dashboard.vue -->
<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <LayoutsDashboardProfilesMenu
          :collapsed="collapsed"
          :profiles="profiles"
          v-model:active-id="activeProfileId"
          :show-add="true"
        />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton
          :collapsed="collapsed"
          class="bg-transparent ring-default"
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <LayoutsDashboardUserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <!-- Dashboard page content -->
    <NuxtPage />

    <LayoutsDashboardNotificationsSlideover />
  </UDashboardGroup>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
// Nuxt auto-imports used in templates / setup
declare function useRoute(): { path: string }
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()

const open = ref(false)

// Minimal dummy data for ProfilesMenu (replace from tenant/app later)
type ProfileItem = {
  id: string
  label: string
  icon?: string
  avatar?: { src: string; alt?: string }
  description?: string
}

const profiles = ref<ProfileItem[]>([
  { id: 'p-1', label: 'Acme Inc.', icon: 'i-lucide-building-2' },
  { id: 'p-2', label: 'Globex', icon: 'i-lucide-briefcase' },
  { id: 'p-3', label: 'Initech', icon: 'i-lucide-badge-cent' },
])
const activeProfileId = ref<string | null>(profiles.value[0]?.id ?? null)

const links = [
  [
    {
      label: 'Dashboard',
      icon: 'i-lucide-layout-dashboard',
      to: '/dashboard',
      onSelect: () => {
        open.value = false
      },
    },
    {
      label: 'Profile',
      icon: 'i-lucide-user',
      to: '/dashboard/user-profile',
      onSelect: () => {
        open.value = false
      },
    },
    {
      label: 'Purchases',
      icon: 'i-lucide-shopping-cart',
      to: '/dashboard/purchases',
      onSelect: () => {
        open.value = false
      },
    },
    {
      label: 'Favorites',
      icon: 'i-lucide-heart',
      to: '/dashboard/favorites',
      onSelect: () => {
        open.value = false
      },
    },
    {
      label: 'Settings',
      icon: 'i-lucide-settings',
      defaultOpen: true,
      type: 'trigger',
      children: [
        {
          label: 'General',
          to: '/dashboard/settings',
          exact: true,
          onSelect: () => {
            open.value = false
          },
        },
        // Followers page lives at /dashboard/followers per IA (not a settings child)
        {
          label: 'Notifications',
          to: '/dashboard/settings/notifications',
          onSelect: () => {
            open.value = false
          },
        },
        {
          label: 'Authentication',
          to: '/dashboard/settings/authentication',
          onSelect: () => {
            open.value = false
          },
        },
      ],
    },
  ],
  [],
] satisfies NavigationMenuItem[][]

const groups = computed(() => [
  {
    id: 'links',
    label: 'Go to',
    items: links.flat(),
  },
  {
    id: 'code',
    label: 'Code',
    items: [
      {
        id: 'source',
        label: 'View page source',
        icon: 'i-simple-icons-github',
        to: `https://github.com/nuxt-ui-templates/dashboard/blob/main/app/pages${
          route.path === '/' ? '/index' : route.path
        }.vue`,
        target: '_blank',
      },
    ],
  },
])

defineOptions({ name: 'CoreDashboard' })
</script>
```

`packages/core/fireux-core/src/runtime/layouts/changelog.vue`

```vue
<script setup lang="ts">
import { inject, type Ref } from 'vue'
import type { ContentNavigationItem } from '@nuxt/content'

// Optional content navigation for changelog pages
const navigation = inject<Ref<ContentNavigationItem[]> | undefined>(
  'navigation'
)
defineOptions({ name: 'CoreChangelog' })
</script>

<template>
  <UMain>
    <UContainer>
      <UPage>
        <template #left>
          <UPageAside v-if="navigation">
            <UContentNavigation :navigation="navigation" highlight />
          </UPageAside>
        </template>

        <NuxtPage />
      </UPage>
    </UContainer>
  </UMain>
</template>
```

`packages/core/fireux-core/src/runtime/layouts/starter.vue`

```vue
<template>
  <ClientOnly>
    <div class="layout-wrapper">
      <LayoutsDefaultHeader
        :menu-bar-links="menuBarLinks"
        :mobile-links="mobileLinks"
      />
      <NuxtPage />
      <LayoutsDefaultFooter />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCoreRoutes } from '../composables/app/routes/useCoreRoutes'

const { links } = useCoreRoutes()
const KEEP_MENU = new Set(['home', 'products', 'blog', 'users'])
const KEEP_MOBILE = new Set([...KEEP_MENU, 'user', 'admin'])

const menuBarLinks = computed(() =>
  links.value.filter((r) => KEEP_MENU.has(r.id))
)
const mobileLinks = computed(() =>
  links.value.filter((r) => KEEP_MOBILE.has(r.id))
)

defineOptions({ name: 'CoreStarter' })
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
}
.layout-wrapper > * {
  align-self: stretch;
}
</style>
```

`packages/core/fireux-core/src/runtime/layouts/auth.vue`

```vue
<template>
  <ClientOnly>
    <div class="h-screen flex items-center justify-center px-4">
      <UPageCard variant="subtle" class="max-w-sm w-full">
        <slot />
      </UPageCard>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
defineOptions({ name: 'CoreAuth' })
</script>
```

### Core route composables

`packages/core/fireux-core/src/runtime/composables/app/routes/useSystemRoutes.ts`

```ts
///Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/runtime/composables/app/routes/useSystemRoutes.ts
import type { RouteLink } from '../../../types/routeLink'

export function useSystemRoutes(): RouteLink[] {
  return [
    { id: 'home', label: 'Home', icon: 'i-lucide-home', to: '/' },
    {
      id: 'products',
      label: 'Products',
      icon: 'i-lucide-box',
      to: '/products',
    },
    { id: 'blog', label: 'Blog', icon: 'i-lucide-book', to: '/blog' },
    { id: 'users', label: 'Users', icon: 'i-lucide-users', to: '/users' },
  ]
}
```

`packages/core/fireux-core/src/runtime/composables/app/routes/useUserRoutes.ts`

```ts
// packages/core/fireux-core/src/runtime/composables/app/routes/useUserRoutes.ts
import type { RouteLink } from '../../../types/routeLink'

export function useUserRoutes(): RouteLink[] {
  const userRoutes: RouteLink[] = [
    {
      id: 'dashboard',
      label: 'Overview',
      icon: 'i-lucide-layout-dashboard',
      to: '/dashboard',
    },
    {
      id: 'user-profile',
      label: 'Profile',
      icon: 'i-lucide-user',
      to: '/dashboard/user-profile',
    },
    {
      id: 'purchases',
      label: 'Purchases',
      icon: 'i-lucide-shopping-cart',
      to: '/dashboard/purchases',
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: 'i-lucide-heart',
      to: '/dashboard/favorites',
    },
    {
      id: 'followers',
      label: 'Followers',
      icon: 'i-lucide-users',
      to: '/dashboard/followers',
    },
    // Settings subtree is intentionally not listed here; handled by dashboard layout group
  ]

  return userRoutes.length
    ? [
        {
          id: 'user',
          label: 'User',
          icon: 'i-lucide-user-circle',
          children: userRoutes,
        },
      ]
    : []
}
```

`packages/core/fireux-core/src/runtime/composables/app/routes/useAdminRoutes.ts`

```ts
// packages/fireux-core/src/runtime/composables/utils/adminRoutes.ts

import type { RouteLink } from '../../../types/routeLink'

/**
 * Returns grouped admin routes for navigation.
 * @returns RouteLink[]
 */
export function useAdminRoutes(): RouteLink[] {
  const adminRoutes: RouteLink[] = [
    {
      id: 'admin-overview',
      label: 'Admin Overview',
      icon: 'i-lucide-layout-dashboard',
      to: '/admin',
    },
    {
      id: 'admin-users',
      label: 'Users',
      icon: 'i-lucide-users',
      to: '/admin/users',
    },
    {
      id: 'admin-products',
      label: 'Products',
      icon: 'i-lucide-box',
      to: '/admin/products',
    },
    {
      id: 'admin-blog',
      label: 'Blog',
      icon: 'i-lucide-book',
      to: '/admin/blog',
    },
    {
      id: 'admin-settings',
      label: 'Settings',
      icon: 'i-lucide-sliders',
      to: '/admin/settings',
    },
  ]

  return adminRoutes.length
    ? [
        {
          id: 'admin',
          label: 'Admin',
          icon: 'i-lucide-shield',
          children: adminRoutes,
        },
      ]
    : []
}
```

`packages/core/fireux-core/src/runtime/composables/app/routes/useCoreRoutes.ts`

```ts
// packages/core/fireux-core/src/runtime/composables/app/routes/useCoreRoutes.ts
import { computed } from 'vue'
import { useSystemRoutes } from './useSystemRoutes'
import { useUserRoutes } from './useUserRoutes'
import { useAdminRoutes } from './useAdminRoutes'
import { useUser } from '../../firestore/user/useUser'

export function useCoreRoutes() {
  const systemRoutes = useSystemRoutes()
  const { hasCoreProfile, isAdmin } = useUser()

  const links = computed(() => [
    ...systemRoutes,
    ...(hasCoreProfile.value ? useUserRoutes() : []),
    ...(isAdmin.value ? useAdminRoutes() : []),
  ])

  return { links }
}
```

`packages/core/fireux-core/src/runtime/components/layouts/default/Header.vue`

```vue
<!-- COMMENT: app/components/layouts/default/Header.vue -->
<template>
  <ClientOnly>
    <header class="header">
      <div class="header-content">
        <!-- Left Section: Logo -->
        <div class="left-section">
          <LogoBrand size="large" />
        </div>

        <!-- Desktop Navigation Menu -->
        <UNavigationMenu
          v-if="!isMobile"
          orientation="horizontal"
          :items="menuBarLinks"
        />

        <!-- Right Section: User Profile / Sign-In & Mobile Menu -->
        <div class="right-section">
          <template v-if="route.path !== '/auth'">
            <!-- Auth resolving shimmer -->
            <template v-if="!isAuthResolved">
              <USkeleton
                class="rounded-full"
                style="width: 32px; height: 32px"
              />
            </template>
            <template v-if="isSignedIn">
              <!-- Avatar with dropdown (mobile-friendly) -->
              <UDropdown
                :items="profileMenuItems"
                :popper="{ strategy: 'fixed' }"
              >
                <UTooltip text="Account">
                  <UAvatar
                    :src="avatarSrc"
                    :alt="displayName"
                    size="sm"
                    :text="initials"
                    class="cursor-pointer hover:opacity-80 transition-opacity"
                  />
                </UTooltip>
              </UDropdown>
            </template>
            <template v-else>
              <UButton
                v-if="!isMobile"
                size="sm"
                :loading="isSigningIn"
                @click="handleSignInClick"
              >
                Sign In
              </UButton>
              <UTooltip v-else text="Sign In">
                <UButton
                  size="sm"
                  color="primary"
                  variant="soft"
                  icon="i-heroicons-arrow-right-on-rectangle"
                  :loading="isSigningIn"
                  aria-label="Sign In"
                  @click="handleSignInClick"
                />
              </UTooltip>
            </template>
          </template>
          <UTooltip v-if="isMobile" text="Menu">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-menu"
              aria-label="Open Menu"
              @click="toggleMobileNav"
            />
          </UTooltip>
        </div>
      </div>
    </header>

    <!-- Mobile Navigation Menu -->
    <USlideover
      v-model:open="mobileMenuOpen"
      side="right"
      :ui="{ header: 'p-2 min-h-[60px]' }"
      :close="{
        color: 'primary',
        variant: 'outline',
        class: 'rounded-full',
      }"
    >
      <template #body>
        <div class="mobile-menu-wrapper">
          <UNavigationMenu
            orientation="vertical"
            :items="mobileLinks"
            class="w-full"
          />
        </div>
      </template>
    </USlideover>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { useRouter, useRoute } from 'vue-router'
import { useUser } from '../../../composables/firestore/user/useUser'
import { useAuth } from '../../../composables/firebase/useAuth'

// Unified user
const { /* user, */ initials, displayName, avatarSrc, isSignedIn } = useUser()

const router = useRouter()
const route = useRoute()
const { signInWithGoogle, signOutUser, currentUser } = useAuth()

// Navigation
// Navigation helpers (inline where used)

// Auth action
const isSigningIn = ref(false)
const handleSignInClick = async () => {
  if (isSigningIn.value) return
  isSigningIn.value = true
  try {
    const user = await signInWithGoogle()
    if (user?.uid) {
      // Successful sign-in: go home; downstream onboarding can route as needed
      router.push('/')
    } else {
      // Fallback to auth page for alternative methods (email/password)
      router.push('/auth')
    }
  } catch (error) {
    // On error, route to full auth page and log for diagnostics
    console.warn('[Header] Google sign-in failed:', error)
    router.push('/auth')
  } finally {
    isSigningIn.value = false
  }
}

// Profile dropdown items (grouped)
const profileMenuItems = computed(() => [
  [
    {
      label: 'Dashboard',
      icon: 'i-heroicons-home',
      click: () => router.push('/dashboard'),
    },
    {
      label: 'Sign Out',
      icon: 'i-heroicons-arrow-right-on-rectangle',
      click: async () => {
        await signOutUser()
        router.push('/auth')
      },
    },
  ],
])

// Mobile Navigation
const { width } = useWindowSize()
const isMobile = computed(() => width.value < 1024)
const mobileMenuOpen = ref(false)
const toggleMobileNav = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

// Auth resolved gate (VueFire currentUser is tri-state: undefined ⇒ resolving)
const isAuthResolved = computed(() => currentUser.value !== undefined)

// Close mobile menu on route change
watch(
  () => route.fullPath,
  () => {
    mobileMenuOpen.value = false
  }
)

const props = defineProps<{ menuBarLinks?: any[]; mobileLinks?: any[] }>()
const menuBarLinks = computed(() => props.menuBarLinks ?? [])
const mobileLinks = computed(() => props.mobileLinks ?? [])
</script>

<style scoped>
.header {
  width: 100%;
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2) var(--space-4);
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1200px;
}

.left-section {
  display: flex;
  align-items: center;
}

.right-section {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.mobile-menu-wrapper {
  display: flex;
  justify-content: flex-end;
  padding-right: var(--space-4);
  padding-top: var(--space-8);
}
</style>
```

### Misebox tenant

`packages/tenants/fireux-misebox/src/runtime/layouts/MiseboxDefault.vue`

```vue
<template>
  <CoreDefault
    :links="links"
    :menu-ids="TENANT_MENU_IDS"
    :mobile-ids="TENANT_MOBILE_IDS"
  />
</template>

<script setup lang="ts">
import { useMiseboxRoutes } from '../composables/app/routes/useMiseboxRoutes'

const { links } = useMiseboxRoutes()

const TENANT_MENU_IDS = [
  'chefs',
  'suppliers',
  'kitchens',
  'recipes',
  'jobs',
  'employers',
  'professionals',
]

const TENANT_MOBILE_IDS = [
  ...TENANT_MENU_IDS,
  'chef-profile',
  'supplier-profile',
  'employer-profile',
  'professional-profile',
]
</script>
```

`packages/tenants/fireux-misebox/src/runtime/layouts/MiseboxDev.vue`

```vue
<template>
  <CoreDev :devRoutes="miseboxDevRoutes" />
</template>

<script setup>
import { getMiseboxDevRoutes } from '../composables/app/routes/useMiseboxDevRoutes'
import { computed } from 'vue'

const miseboxDevRoutes = computed(() => getMiseboxDevRoutes())
</script>
```

`packages/tenants/fireux-misebox/src/runtime/layouts/MiseboxDashboard.vue`

```vue
//packages/tenants/fireux-misebox/src/runtime/layouts/MiseboxDashboard.vue
<template>
  <CoreDashboard :routes="miseboxRoutes" />
</template>

<script setup lang="ts">
import { getMiseboxDashboardRoutes } from '../composables/app/routes/useMiseboxDashboardRoutes'
import { computed } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/firestore/user/useUser'

const { user } = useUser()
const hasProfile = (profileType: string) => {
  const app = user.value?.app
  if (!app) return false
  const list = Array.isArray(app.app_profiles) ? app.app_profiles : []
  return profileType ? list.includes(profileType) : !!app
}
type LayoutRoutes = { menuBarLinks?: any[]; mobileLinks?: any[] }
const miseboxRoutes = computed<LayoutRoutes>(() =>
  getMiseboxDashboardRoutes(hasProfile)
)
</script>
```

`packages/tenants/fireux-misebox/src/runtime/composables/app/routes/useMiseboxDashboardRoutes.ts`

```ts
import { getJobDashboardRoutes } from '../../../../../../../extensions/fireux-jobs/src/runtime/composables/app/routes/useJobDashboardRoutes'
import type { RouteLink } from 'fireux-core/runtime/types/routeLink'

export function getMiseboxDashboardRoutes(
  hasProfile: (profileType: string) => boolean
) {
  // Get dashboard profile routes from jobs extension
  const jobRoutes = getJobDashboardRoutes(hasProfile)

  const miseboxProfileRoutes: RouteLink[] = []

  if (hasProfile('chef')) {
    miseboxProfileRoutes.push({
      id: 'chef-profile',
      label: 'Chef Profile',
      icon: 'i-lucide-chef-hat',
      to: '/dashboard/chef-profile',
    })
  }

  if (hasProfile('supplier')) {
    miseboxProfileRoutes.push({
      id: 'supplier-profile',
      label: 'Supplier Profile',
      icon: 'i-lucide-package',
      to: '/dashboard/supplier-profile',
    })
  }

  return {
    // Sidebar/dashboard menu: profiles only
    menuBarLinks: [...miseboxProfileRoutes, ...jobRoutes.jobProfileRoutes],
    // Mobile menu: same set (no public discovery links here)
    mobileLinks: [...miseboxProfileRoutes, ...jobRoutes.jobProfileRoutes],
  }
}
```

`packages/tenants/fireux-misebox/src/runtime/composables/app/routes/useMiseboxDevRoutes.ts`

```ts
// Declare minimal type for Nuxt runtime config to satisfy package-level tsc without Nuxt context
declare function useRuntimeConfig(): { public?: { role?: string } }

export function getMiseboxDevRoutes() {
  const rc =
    typeof useRuntimeConfig === 'function' ? useRuntimeConfig() : undefined
  const role = rc?.public?.role

  const routes = [
    {
      id: 'dev-misebox',
      label: 'Misebox Global',
      icon: 'i-heroicons-beaker',
      to: '/dev/fireux-misebox',
    },
    {
      id: 'dev-jobs',
      label: 'Jobs Global',
      icon: 'i-lucide-briefcase',
      to: '/dev/fireux-jobs',
    },
  ]

  if (role === 'tenant') {
    routes.push(
      {
        id: 'dev-misebox-tenant',
        label: 'Misebox Tenant',
        icon: 'i-heroicons-home-modern',
        to: '/dev/fireux-misebox-tenant',
      },
      {
        id: 'dev-jobs-tenant',
        label: 'Jobs Tenant',
        icon: 'i-lucide-building-2',
        to: '/dev/fireux-jobs-tenant',
      }
    )
  }

  return { miseboxDevRoutes: routes }
}
```

`packages/tenants/fireux-misebox/src/runtime/composables/app/routes/useMiseboxDefaultRoutes.ts`

```ts
import { getJobRoutes } from '../../../../../../../extensions/fireux-jobs/src/runtime/composables/app/routes/useJobRoutes'
import type { RouteLink } from 'fireux-core/runtime/types/routeLink'

export function getMiseboxDefaultRoutes(
  hasProfile: (profileType: string) => boolean
) {
  // Get package routes
  const jobRoutes = getJobRoutes(hasProfile)

  // Public Misebox routes (default layout header)
  const miseboxRoutes: RouteLink[] = [
    {
      id: 'chefs',
      label: 'Chefs',
      icon: 'i-lucide-chef-hat',
      to: '/chefs',
    },
    {
      id: 'suppliers',
      label: 'Suppliers',
      icon: 'i-lucide-truck',
      to: '/suppliers',
    },
    {
      id: 'kitchens',
      label: 'Kitchens',
      icon: 'i-lucide-cooking-pot',
      to: '/kitchens',
    },
    {
      id: 'recipes',
      label: 'Recipes',
      icon: 'i-lucide-book-open',
      to: '/recipes',
    },
  ]

  const miseboxProfileRoutes: RouteLink[] = []

  // Dashboard shortcuts (only if user has those profiles)
  if (hasProfile('chef')) {
    miseboxProfileRoutes.push({
      id: 'chef-profile',
      label: 'Chef Profile',
      icon: 'i-lucide-chef-hat',
      to: '/dashboard/chef-profile',
    })
  }

  if (hasProfile('supplier')) {
    miseboxProfileRoutes.push({
      id: 'supplier-profile',
      label: 'Supplier Profile',
      icon: 'i-lucide-package',
      to: '/dashboard/supplier-profile',
    })
  }

  return {
    // Desktop header: public discovery + jobs public
    menuBarLinks: [...miseboxRoutes, ...jobRoutes.jobRoutes],
    // Mobile menu: dashboard shortcuts (if any) + filtered public + jobs mobile
    mobileLinks: [
      ...miseboxProfileRoutes,
      ...jobRoutes.jobProfileRoutes,
      ...miseboxRoutes,
      ...jobRoutes.jobMobileRoutes,
    ],
  }
}
```

### Cleanbox tenant

`packages/tenants/fireux-cleanbox/src/runtime/layouts/CleanboxDefault.vue`

```vue
<template>
  <CoreDefault :routes="cleanboxRoutes" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCleanboxRoutes } from '../composables/app/routes/useCleanboxRoutes'

// Tenant-only flat links (Cleanbox doesn’t expose public links yet)
const { links } = useCleanboxRoutes()

// Desktop header: allow-list tenant items here when you add them
const CLEANBOX_DESKTOP = new Set<string>([
  // e.g., 'services', 'pricing'
])

// Mobile menu: can include more than desktop if desired
const CLEANBOX_MOBILE = new Set<string>([
  ...CLEANBOX_DESKTOP,
  // e.g., 'my-cleanings'
])

const cleanboxRoutes = computed(() => ({
  menuBarLinks: links.value.filter((r) => CLEANBOX_DESKTOP.has(r.id)),
  mobileLinks: links.value.filter((r) => CLEANBOX_MOBILE.has(r.id)),
}))
</script>
```

`packages/tenants/fireux-cleanbox/src/runtime/layouts/CleanboxDev.vue`

```vue
<template>
  <CoreDefault :routes="cleanboxDevRoutes" />
</template>

<script setup>
import { getCleanboxDevRoutes } from '../composables/app/routes/useCleanboxDevRoutes'
import { computed } from 'vue'

const cleanboxDevRoutes = computed(() => ({
  menuBarLinks: getCleanboxDevRoutes(),
  mobileLinks: getCleanboxDevRoutes(),
}))
</script>
```

`packages/tenants/fireux-cleanbox/src/runtime/layouts/CleanboxDashboard.vue`

```vue
<template>
  <CoreDashboard :routes="cleanboxRoutes" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/firestore/user/useUser'
import type { RouteLink } from 'fireux-core/runtime/types/routeLink'

const { user } = useUser()
// Adapter: expected signature (profileType: string) => boolean
const hasProfile = (profileType: string) => {
  const app = user.value?.app
  if (!app) return false
  const list = Array.isArray(app.app_profiles) ? app.app_profiles : []
  return profileType ? list.includes(profileType) : !!app
}
// For now, Cleanbox shows only core-provided user/admin groups in dashboard
const KEEP_MENU = new Set<RouteLink['id']>(['user', 'admin'])
const KEEP_MOBILE = new Set<RouteLink['id']>([...KEEP_MENU])

// Use core compositor and filter by sets
import { useCoreRoutes } from 'fireux-core/runtime/composables/app/routes/useCoreRoutes'
const { links } = useCoreRoutes()

const cleanboxRoutes = computed(() => ({
  menuBarLinks: links.value.filter((r: RouteLink) => KEEP_MENU.has(r.id)),
  mobileLinks: links.value.filter((r: RouteLink) => KEEP_MOBILE.has(r.id)),
}))
</script>
```

`packages/tenants/fireux-cleanbox/src/runtime/composables/app/routes/useCleanboxRoutes.ts`

```ts
import { computed } from 'vue'
import type { RouteLink } from 'fireux-core/runtime/types/routeLink'

// Flat tenant-only links (currently none)
export function useCleanboxRoutes() {
  // For default layout, we only need a flat list to filter; leave empty until tenant adds public links.
  const links = computed<RouteLink[]>(() => [])
  return { links }
}
```

`packages/tenants/fireux-cleanbox/src/runtime/composables/app/routes/useCleanboxDevRoutes.ts`

```ts
// Local type to avoid deep import from core (not exported to prevent auto-import duplication)
import type { RouteLink } from 'fireux-core/runtime/types/routeLink'

export function getCleanboxDevRoutes() {
  // Core dev routes (from fireux-core)
  const coreDevRoutes: RouteLink[] = [
    {
      id: 'dev-app',
      label: 'App Core',
      icon: 'i-heroicons-cog-6-tooth',
      to: '/dev/app',
    },
  ]

  // Cleanbox-specific dev routes
  const cleanboxDevRoutes: RouteLink[] = [
    {
      id: 'dev-cleanbox',
      label: 'Cleanbox Package',
      icon: 'i-heroicons-sparkles',
      to: '/dev/fireux-cleanbox',
    },
  ]

  // Combine and return complete route structure
  return {
    menuBarLinks: [...coreDevRoutes, ...cleanboxDevRoutes],
    mobileLinks: [...coreDevRoutes, ...cleanboxDevRoutes],
  }
}
```

### Fireux tenant

`packages/tenants/fireux-fireux/src/runtime/layouts/FireuxDefault.vue`

```vue
<template>
  <CoreDefault :routes="fireuxRoutes" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFireuxRoutes } from '../composables/app/routes/useFireuxRoutes'

// Flat tenant-only links (currently none; ready for future)
const { links } = useFireuxRoutes()

// Desktop header: (none for now — CoreDefault already renders core system links)
const DESKTOP_KEEP = new Set<string>([
  // e.g., 'docs', 'changelog' — add when FireUX tenant has public sections
])

// Mobile menu: (none for now — we’re not adding tenant-specific items yet)
const MOBILE_KEEP = new Set<string>([
  ...DESKTOP_KEEP,
  // e.g., 'labs'
])

const fireuxRoutes = computed(() => ({
  menuBarLinks: links.value.filter((r) => DESKTOP_KEEP.has(r.id)),
  mobileLinks: links.value.filter((r) => MOBILE_KEEP.has(r.id)),
}))
</script>
```

`packages/tenants/fireux-fireux/src/runtime/composables/app/routes/useFireuxRoutes.ts`

```ts
// packages/tenants/fireux-fireux/src/runtime/composables/app/routes/useFireuxRoutes.ts
// Flat tenant-only links for FireUX (global). Keep empty for now; core default adds system links.
import type { RouteLink } from '#fireux-core-runtime/types/routeLink'
import { computed } from 'vue'

export function useFireuxRoutes() {
  const links = computed<RouteLink[]>(() => [])
  return { links }
}
```

### Jobs extension

`packages/extensions/fireux-jobs/src/runtime/composables/app/routes/useJobRoutes.ts`

```ts
// Export for public job routes
// Local type to avoid cross-package deep imports
import type { RouteLink } from 'fireux-core/runtime/types/routeLink'

export function getJobRoutes(hasProfile: (profileType: string) => boolean) {
  const jobRoutes: RouteLink[] = [
    {
      id: 'jobs',
      label: 'Jobs',
      icon: 'i-lucide-briefcase',
      to: '/jobs',
    },
    {
      id: 'employers',
      label: 'Employers',
      icon: 'i-lucide-building-2',
      to: '/employers',
    },
    {
      id: 'professionals',
      label: 'Professionals',
      icon: 'i-lucide-users',
      to: '/professionals',
    },
  ]

  const jobProfileRoutes: RouteLink[] = []

  // Do not conditionally hide public routes; UI handles active state/UX.
  const jobMobileRoutes = jobRoutes

  if (hasProfile('employer')) {
    jobProfileRoutes.push({
      id: 'employer-profile',
      label: 'Employer Profile',
      icon: 'i-lucide-building-2',
      to: '/dashboard/employer-profile',
    })
  }

  if (hasProfile('professional')) {
    jobProfileRoutes.push({
      id: 'professional-profile',
      label: 'Professional Profile',
      icon: 'i-lucide-users',
      to: '/dashboard/professional-profile',
    })
  }

  return {
    jobRoutes: jobRoutes,
    jobProfileRoutes: jobProfileRoutes,
    jobMobileRoutes: jobMobileRoutes,
  }
}
```

`packages/extensions/fireux-jobs/src/runtime/composables/app/routes/useJobDashboardRoutes.ts`

```ts
// Dashboard-only job profile routes (no public discovery links)
import type { RouteLink } from 'fireux-core/runtime/types/routeLink'

export function getJobDashboardRoutes(
  hasProfile: (profileType: string) => boolean
) {
  const jobProfileRoutes: RouteLink[] = []

  if (hasProfile('employer')) {
    jobProfileRoutes.push({
      id: 'employer-profile',
      label: 'Employer Profile',
      icon: 'i-lucide-building-2',
      to: '/dashboard/employer-profile',
    })
  }

  if (hasProfile('professional')) {
    jobProfileRoutes.push({
      id: 'professional-profile',
      label: 'Professional Profile',
      icon: 'i-lucide-users',
      to: '/dashboard/professional-profile',
    })
  }

  return {
    // Sidebar/mobile within dashboard should only show profile editors
    jobProfileRoutes,
    jobMobileRoutes: jobProfileRoutes,
  }
}
```
