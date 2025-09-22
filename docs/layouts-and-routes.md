# Layouts and Routes (Full Listing)

This document aggregates all layout components, their registration config, and the route composables that feed them — across Core, Misebox, and Cleanbox packages. Contents are verbatim from the codebase for easy copy/paste.

---

## Core layouts (components under `packages/core/fireux-core/src/runtime/layouts`)

### default.vue
```vue
<template>
  <ClientOnly>
    <div class="layout-wrapper">
      <LayoutsHeader
        :menu-bar-links="menuBarLinks"
        :mobile-links="mobileLinks"
      />
      <NuxtPage />
      <LayoutsDefaultFooter />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
// Nuxt auto-imported composable; declare for TS when type context misses auto-imports
declare function useCoreRoutes(): any
const props = defineProps<{
  routes?: import('../types/layouts').LayoutRoutes
}>()

const coreRoutes = useCoreRoutes()
const menuBarLinks = [
  ...(Array.isArray(coreRoutes.menuBarLinks) ? coreRoutes.menuBarLinks : []),
  ...(Array.isArray(props.routes?.menuBarLinks)
    ? props.routes.menuBarLinks
    : []),
]
const mobileLinks = [
  ...(Array.isArray(coreRoutes.mobileLinks) ? coreRoutes.mobileLinks : []),
  ...(Array.isArray(props.routes?.mobileLinks) ? props.routes.mobileLinks : []),
]
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

### dev.vue
```vue
<template>
  <ClientOnly>
    <div class="layout-wrapper">
      <DevNav :links="safeDevRoutes.miseboxDevRoutes || []" />
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

### design.vue
```vue
<template>
  <CoreDefault />
</template>
```

### docs.vue
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

        <slot />
      </UPage>
    </UContainer>
  </UMain>
</template>
```

### dashboard.vue
```vue
// fireux-core/src/runtime/layouts/Default.vue (CoreDashboard)

<template>
  <ClientOnly>
    <div class="layout-wrapper">
      <LayoutsHeader
        :menu-bar-links="menuBarLinks"
        :mobile-links="mobileLinks"
      />
      <div class="layout-content">
        <main class="layout-main-content">
          <UNavigationMenu
            v-if="!isMobile"
            class="mt-[var(--header-height)] w-fit"
            orientation="vertical"
            :items="[]"
          />
          <div class="main-section">
            <NuxtPage />
          </div>
        </main>
      </div>
      <LayoutsDefaultFooter />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
const props = defineProps<{
  routes?: import('../types/layouts').LayoutRoutes
}>()

const { menuBarLinks: coreMenuBarLinks, mobileLinks: coreMobileLinks } =
  useCoreRoutes()

// Normalize core arrays (
const baseMenu: any[] = Array.isArray(coreMenuBarLinks)
  ? coreMenuBarLinks
  : ((coreMenuBarLinks as any)?.value ?? [])
const baseMobile: any[] = Array.isArray(coreMobileLinks as any)
  ? (coreMobileLinks as any)
  : ((coreMobileLinks as any)?.value ?? [])

const input = props.routes ?? {}
const menuBarLinks = [...baseMenu, ...(input.menuBarLinks ?? [])]
const mobileLinks = [...baseMobile, ...(input.mobileLinks ?? [])]

// Conservative placeholder; replace with real device check if available
const isMobile: boolean = false

defineOptions({
  name: 'CoreDashboard',
})
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.layout-content {
  display: flex;
  flex-direction: column;
  max-width: 1800px;
  width: 100%;
}
.layout-main-content {
  padding: var(--space-4);
  display: flex;
  flex-direction: row;
  align-items: start;
}
.main-section {
  flex: 1;
  width: 100%;
}
</style>
```

---

## Misebox layouts (`packages/tenants/fireux-misebox/src/runtime/layouts`)

### MiseboxDefault.vue
```vue
<template>
  <CoreDefault :routes="miseboxRoutes" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getMiseboxRoutes } from '../composables/app/routes/useMiseboxRoutes'
import { useUser } from 'fireux-core/runtime/composables/firestore/users/useUser'

const { user } = useUser()
const hasProfile = (profileType: string) => {
  const app = user.value?.app
  if (!app) return false
  const list = Array.isArray(app.app_profiles) ? app.app_profiles : []
  return profileType ? list.includes(profileType) : !!app
}
type LayoutRoutes = { menuBarLinks?: any[]; mobileLinks?: any[] }
const miseboxRoutes = computed<LayoutRoutes>(() => getMiseboxRoutes(hasProfile))
</script>
```

### MiseboxDev.vue
```vue
<template>
  <CoreDev :devRoutes="miseboxDevRoutes" />
</template>

<script setup>
import { getMiseboxDevRoutes } from '../composables/app/routes/useMiseboxDevRoutes'

const miseboxDevRoutes = computed(() => getMiseboxDevRoutes())
</script>
```

### MiseboxDashboard.vue
```vue
<template>
  <CoreDashboard :routes="miseboxRoutes" />
</template>

<script setup lang="ts">
import { getMiseboxRoutes } from '../composables/app/routes/useMiseboxRoutes'
import { computed } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/firestore/users/useUser'

const { user } = useUser()
const hasProfile = (profileType: string) => {
  const app = user.value?.app
  if (!app) return false
  const list = Array.isArray(app.app_profiles) ? app.app_profiles : []
  return profileType ? list.includes(profileType) : !!app
}
type LayoutRoutes = { menuBarLinks?: any[]; mobileLinks?: any[] }
const miseboxRoutes = computed<LayoutRoutes>(() => getMiseboxRoutes(hasProfile))
</script>
```

---

## Cleanbox layouts (`packages/tenants/fireux-cleanbox/src/runtime/layouts`)

### CleanboxDefault.vue
```vue
<template>
  <CoreDefault :routes="cleanboxRoutes" />
</template>

<script setup lang="ts">
import { getCleanboxRoutes } from '../composables/app/routes/useCleanboxRoutes'
import { computed } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/firestore/users/useUser'

const { user } = useUser()
// Adapter: expected signature (profileType: string) => boolean
const hasProfile = (profileType: string) => {
  const app = user.value?.app
  if (!app) return false
  const list = Array.isArray(app.app_profiles) ? app.app_profiles : []
  return profileType ? list.includes(profileType) : !!app
}
type LayoutRoutes = { menuBarLinks?: any[]; mobileLinks?: any[] }
const cleanboxRoutes = computed<LayoutRoutes>(() =>
  getCleanboxRoutes(hasProfile)
)
</script>
```

### CleanboxDev.vue
```vue
<template>
  <CoreDefault :routes="cleanboxDevRoutes" />
</template>

<script setup>
import { getCleanboxDevRoutes } from '../composables/app/routes/useCleanboxDevRoutes'

const cleanboxDevRoutes = computed(() => ({
  menuBarLinks: getCleanboxDevRoutes(),
  mobileLinks: getCleanboxDevRoutes(),
}))
</script>
```

### CleanboxDashboard.vue
```vue
<template>
  <CoreDashboard :routes="cleanboxRoutes" />
</template>

<script setup lang="ts">
import { getCleanboxRoutes } from '../composables/app/routes/useCleanboxRoutes'
import { computed } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/firestore/users/useUser'

const { user } = useUser()
// Adapter: expected signature (profileType: string) => boolean
const hasProfile = (profileType: string) => {
  const app = user.value?.app
  if (!app) return false
  const list = Array.isArray(app.app_profiles) ? app.app_profiles : []
  return profileType ? list.includes(profileType) : !!app
}
type LayoutRoutes = { menuBarLinks?: any[]; mobileLinks?: any[] }
const cleanboxRoutes = computed<LayoutRoutes>(() =>
  getCleanboxRoutes(hasProfile)
)
</script>
```

---

## Layout registration configs

### Core `layouts-config.ts`
```ts
import { addComponentsDir, addLayout } from '@nuxt/kit'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

/**
 * Configure layouts for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 * @param nuxt The Nuxt instance
 */
export function configureLayouts(resolver: any, _nuxt: any) {
  const layoutsDir = resolver.resolve('./runtime/layouts')
  if (!existsSync(layoutsDir)) return

  // Register as layout components (CoreDefault/CoreDashboard/CoreDev/CoreDocs/CoreDesign)
  addComponentsDir({
    path: layoutsDir,
    pattern: '*.vue',
    prefix: 'Core',
    global: true,
    pathPrefix: false,
  })

  // Register layout keys that exist on disk
  // Note: We intentionally do NOT register 'default' here to avoid
  // layer key collisions with app-level app/layouts/default.vue.
  // Apps own their default.vue; core still exposes CoreDefault as a component.
  const keys = ['dashboard', 'dev', 'design', 'docs']
  for (const key of keys) {
    const file = join(layoutsDir, `${key}.vue`)
    if (existsSync(file)) {
      addLayout({ src: file, filename: `fireux-core-${key}.vue` }, key)
    }
  }
}
```

### Misebox `layouts-config.ts`
```ts
import { addComponentsDir, addLayout } from '@nuxt/kit'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

/**
 * Configure misebox layouts for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 * @param nuxt The Nuxt instance
 */
export function configureLayouts(resolver: any, _nuxt: any) {
  const layoutsDir = resolver.resolve('./runtime/layouts')
  if (!existsSync(layoutsDir)) return

  // Register layouts as components for direct use
  addComponentsDir({
    path: layoutsDir,
    pattern: '*.vue',
    global: true,
    pathPrefix: false,
  })

  // Optionally register as Nuxt layout keys
  for (const key of ['MiseboxDefault', 'MiseboxDashboard', 'MiseboxDev']) {
    const f = join(layoutsDir, `${key}.vue`)
    if (existsSync(f))
      addLayout({ src: f, filename: `misebox-${key}.vue` }, key)
  }
}
```

---

## Route composables feeding layouts

### Core `useCoreRoutes.ts`
```ts
import { useAppUserRoutes } from './useAppUserRoutes'
import { useAdminRoutes } from './useAdminRoutes'
import { useSystemRoutes } from './useSystemRoutes'
import { computed } from 'vue'
import { useUser } from '../../firestore/users/useUser'

export function useCoreRoutes() {
  // Always available
  const menuBarLinks = useSystemRoutes()

  // User state (synchronous composable returns computed refs)
  const { user } = useUser()
  const isAppUser = computed(() => !!user.value?.app)
  const isAdmin = computed(() => user.value?.app?.role === 'admin')

  // Computed mobile links
  const mobileLinks = computed(() => {
    let links = [...menuBarLinks]
    if (isAppUser.value) {
      links.push(...useAppUserRoutes())
    }
    if (isAdmin.value) {
      links.push(...useAdminRoutes())
    }
    return links
  })

  return {
    menuBarLinks,
    mobileLinks: mobileLinks.value,
  }
}
```

### Misebox `useMiseboxRoutes.ts`
```ts
import { getJobRoutes } from '../../../../../../../extensions/fireux-jobs/src/runtime/composables/app/routes/useJobRoutes'
// Local type to avoid deep import from core
export interface RouteLink {
  id: string
  label: string
  icon: string
  to: string
  children?: RouteLink[]
}

export function getMiseboxRoutes(hasProfile: (profileType: string) => boolean) {
  // Get package routes
  const jobRoutes = getJobRoutes(hasProfile)

  // General misebox routes
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

  // Filter out "Chefs" from mobile menu if user has chef profile
  // Filter out "Suppliers" from mobile menu if user has supplier profile
  const miseboxMobileRoutes = miseboxRoutes.filter((route) => {
    if (route.id === 'chefs' && hasProfile('chef')) return false
    if (route.id === 'suppliers' && hasProfile('supplier')) return false
    return true
  })

  // Add chef profile route
  if (hasProfile('chef')) {
    miseboxProfileRoutes.push({
      id: 'chef-profile',
      label: 'Chef Profile',
      icon: 'i-lucide-chef-hat',
      to: '/dashboard/chef-profile',
    })
  }

  // Add supplier profile route
  if (hasProfile('supplier')) {
    miseboxProfileRoutes.push({
      id: 'supplier-profile',
      label: 'Supplier Profile',
      icon: 'i-lucide-package',
      to: '/dashboard/supplier-profile',
    })
  }

  return {
    menuBarLinks: [...miseboxRoutes, ...jobRoutes.jobRoutes],
    mobileLinks: [
      ...miseboxProfileRoutes,
      ...jobRoutes.jobProfileRoutes,
      ...miseboxMobileRoutes,
      ...jobRoutes.jobMobileRoutes,
    ],
  }
}
```

### Misebox `useMiseboxDevRoutes.ts`
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
      },
    )
  }

  return { miseboxDevRoutes: routes }
}
```

---

## Pages registration configs

### Core `pages-config.ts`
```ts
export function configurePages(resolver: any, nuxt: any) {
  // Expose module pages under a subdir (Nuxt v4: extends-like registration)
  // Add as layered app dir so pages/layouts/middleware are discovered
  nuxt.options._layers = nuxt.options._layers || []
  nuxt.options._layers.push({
    cwd: resolver.resolve('./runtime'),
    // Nuxt expects a config with srcDir for layer prioritization
    config: { srcDir: resolver.resolve('./runtime') },
  })
}
```

### Misebox `pages-config.ts`
```ts
export function configurePages(resolver: any, nuxt: any) {
  nuxt.options._layers ||= []
  nuxt.options._layers.push({
    cwd: resolver.resolve('./runtime'),
    config: { srcDir: resolver.resolve('./runtime') },
  })
}
```

---

End of document.
\n+---
\n+## Additional route composables
\n+### Cleanbox `useCleanboxRoutes.ts`
```ts
import { getJobRoutes } from '../../../../../../../extensions/fireux-jobs/src/runtime/composables/app/routes/useJobRoutes'
// Local type to avoid deep import from core (not exported to prevent auto-import duplication)
interface RouteLink {
  id: string
  label: string
  icon: string
  to: string
  children?: RouteLink[]
}

export function getCleanboxRoutes(
  hasProfile: (profileType: string) => boolean
) {
  // Get package routes
  const jobRoutes = getJobRoutes(hasProfile)

  // Future: Add cleanbox-specific routes here
  const cleanboxRoutes: RouteLink[] = []

  // Future: Add cleaner profile routes here
  const cleanboxProfileRoutes: RouteLink[] = []

  // Future: Add filtered cleanbox routes here (with profile filtering)
  const cleanboxMobileRoutes: RouteLink[] = []

  // Future development: Check for cleaner profile
  // if (hasProfile('cleaner')) {
  //   cleanboxProfileRoutes.push({
  //     id: 'cleaner-profile',
  //     label: 'Cleaner Profile',
  //     icon: 'i-lucide-spray-can',
  //     to: '/dashboard/cleaner-profile',
  //   })
  // }

  return {
    menuBarLinks: [...cleanboxRoutes, ...jobRoutes.jobRoutes],
    mobileLinks: [
      ...cleanboxProfileRoutes,
      ...jobRoutes.jobProfileRoutes,
      ...cleanboxMobileRoutes,
      ...jobRoutes.jobMobileRoutes,
    ],
  }
}
```

### Cleanbox `useCleanboxDevRoutes.ts`
```ts
// Local type to avoid deep import from core (not exported to prevent auto-import duplication)
interface RouteLink {
  id: string
  label: string
  icon: string
  to: string
  children?: RouteLink[]
}

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

### Jobs `useJobRoutes.ts`
```ts
// Export for public job routes
// Local type to avoid cross-package deep imports
export interface RouteLink {
  id: string
  label: string
  icon: string
  to: string
  children?: RouteLink[]
}

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

  // Filter out "Employers" from mobile menu if user has employer profile
  // Filter out "Professionals" from mobile menu if user has professional profile
  const jobMobileRoutes = jobRoutes.filter((route) => {
    if (route.id === 'employers' && hasProfile('employer')) return false
    if (route.id === 'professionals' && hasProfile('professional')) return false
    return true
  })

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

### Core `useAppUserRoutes.ts`
```ts
import type { RouteLink } from '../../../types/routeLink'

export function useAppUserRoutes(): RouteLink[] {
  const appUserRoutes: RouteLink[] = [
    {
      id: 'dashboard',
      label: 'Overview',
      icon: 'i-lucide-layout-dashboard',
      to: '/dashboard',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: 'i-lucide-user',
      to: '/dashboard/profile',
    },
    {
      id: 'account',
      label: 'Account',
      icon: 'i-lucide-settings',
      to: '/dashboard/account',
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: 'i-lucide-shopping-cart',
      to: '/dashboard/orders',
    },
    {
      id: 'subscriptions',
      label: 'Subscriptions',
      icon: 'i-lucide-credit-card',
      to: '/dashboard/subscriptions',
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: 'i-lucide-heart',
      to: '/dashboard/favorites',
    },
  ]

  return appUserRoutes.length
    ? [
        {
          id: 'user',
          label: 'User',
          icon: 'i-lucide-user-circle',
          children: appUserRoutes,
        },
      ]
    : []
}
```

### Core `useAdminRoutes.ts`
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

