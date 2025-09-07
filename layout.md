# Layouts report

This document lists all core and tenant layouts, their file contents, and the composables they depend on (routes and app-user state).

## Core layouts (packages/core/fireux-core/src/runtime/layouts)

### default.vue

Path: packages/core/fireux-core/src/runtime/layouts/default.vue

```
[see file below]
```

### dashboard.vue

Path: packages/core/fireux-core/src/runtime/layouts/dashboard.vue

```
[see file below]
```

### dev.vue

Path: packages/core/fireux-core/src/runtime/layouts/dev.vue

```
[see file below]
```

### design.vue

Path: packages/core/fireux-core/src/runtime/layouts/design.vue

```
[see file below]
```

### docs.vue

Path: packages/core/fireux-core/src/runtime/layouts/docs.vue

```
[see file below]
```

## Tenant layouts — fireux-misebox (packages/tenants/fireux-misebox/src/runtime/layouts)

### MiseboxDefault.vue

Path: packages/tenants/fireux-misebox/src/runtime/layouts/MiseboxDefault.vue

Depends on composables:

- getMiseboxRoutes(hasProfile) from packages/tenants/fireux-misebox/src/runtime/composables/app/routes/useMiseboxRoutes.ts
- useAppUser().hasProfile (auto-imported)

```
[see file below]
```

### MiseboxDashboard.vue

Path: packages/tenants/fireux-misebox/src/runtime/layouts/MiseboxDashboard.vue

Depends on composables:

- getMiseboxRoutes(hasProfile)
- useAppUser().hasProfile (auto-imported)

```
[see file below]
```

### MiseboxDev.vue

Path: packages/tenants/fireux-misebox/src/runtime/layouts/MiseboxDev.vue

Depends on composables:

- getMiseboxDevRoutes()

```
[see file below]
```

## Tenant layouts — fireux-cleanbox (packages/tenants/fireux-cleanbox/src/runtime/layouts)

### CleanboxDefault.vue

Path: packages/tenants/fireux-cleanbox/src/runtime/layouts/CleanboxDefault.vue

Depends on composables:

- getCleanboxRoutes(hasProfile) from packages/tenants/fireux-cleanbox/src/runtime/composables/app/routes/useCleanboxRoutes.ts
- useAppUser().hasProfile (auto-imported)

```
[see file below]
```

### CleanboxDashboard.vue

Path: packages/tenants/fireux-cleanbox/src/runtime/layouts/CleanboxDashboard.vue

Depends on composables:

- getCleanboxRoutes(hasProfile)
- useAppUser().hasProfile (auto-imported)

```
[see file below]
```

### CleanboxDev.vue

Path: packages/tenants/fireux-cleanbox/src/runtime/layouts/CleanboxDev.vue

Depends on composables:

- getCleanboxDevRoutes()

```
[see file below]
```

## Referenced route composables

- packages/core/fireux-core/src/runtime/composables/app/routes/useCoreRoutes.ts
- packages/tenants/fireux-misebox/src/runtime/composables/app/routes/useMiseboxRoutes.ts
- packages/tenants/fireux-misebox/src/runtime/composables/app/routes/useMiseboxDevRoutes.ts
- packages/tenants/fireux-cleanbox/src/runtime/composables/app/routes/useCleanboxRoutes.ts
- packages/tenants/fireux-cleanbox/src/runtime/composables/app/routes/useCleanboxDevRoutes.ts

---

Below are the full contents of the files referenced above for easy review.

## File contents

### packages/core/fireux-core/src/runtime/layouts/default.vue

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
declare function useCoreRoutes(): Promise<any>
const props = defineProps<{
  routes?: import('../types/layouts').LayoutRoutes
}>()

const coreRoutes = await useCoreRoutes()
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

### packages/core/fireux-core/src/runtime/layouts/dashboard.vue

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
					</template>
			<LayoutsDefaultFooter />
		</div>
	</ClientOnly>
</template>

<script setup lang="ts">
// Nuxt auto-imported composable; declare for TS shape grace
declare function useCoreRoutes(): Promise<{
	menuBarLinks: any[]
	mobileLinks: any[]
}>
const props = defineProps<{
	routes?: import('../types/layouts').LayoutRoutes
}>()

const { menuBarLinks: coreMenuBarLinks, mobileLinks: coreMobileLinks } =
	await useCoreRoutes()

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

### packages/core/fireux-core/src/runtime/layouts/dev.vue

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

### packages/core/fireux-core/src/runtime/layouts/design.vue

```vue
<template>
  <ClientOnly>
    <CoreDefault />
  </ClientOnly>
</template>
```

### packages/core/fireux-core/src/runtime/layouts/docs.vue

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

### packages/tenants/fireux-misebox/src/runtime/layouts/MiseboxDefault.vue

```vue
<template>
  <ClientOnly>
    <CoreDefault :routes="miseboxRoutes" />
  </ClientOnly>
</template>

<script setup lang="ts">
import { getMiseboxRoutes } from '../composables/app/routes/useMiseboxRoutes'

const { hasProfile } = await useAppUser()
type LayoutRoutes = { menuBarLinks?: any[]; mobileLinks?: any[] }
const miseboxRoutes = computed<LayoutRoutes>(() => getMiseboxRoutes(hasProfile))
</script>
```

### packages/tenants/fireux-misebox/src/runtime/layouts/MiseboxDashboard.vue

```vue
<template>
  <ClientOnly>
    <CoreDashboard :routes="miseboxRoutes" />
  </ClientOnly>
</template>

<script setup lang="ts">
import { getMiseboxRoutes } from '../composables/app/routes/useMiseboxRoutes'

const { hasProfile } = await useAppUser()
type LayoutRoutes = { menuBarLinks?: any[]; mobileLinks?: any[] }
const miseboxRoutes = computed<LayoutRoutes>(() => getMiseboxRoutes(hasProfile))
</script>
```

### packages/tenants/fireux-misebox/src/runtime/layouts/MiseboxDev.vue

```vue
<template>
  <ClientOnly>
    <CoreDev :devRoutes="miseboxDevRoutes" />
  </ClientOnly>
</template>

<script setup>
import { getMiseboxDevRoutes } from '../composables/app/routes/useMiseboxDevRoutes'

const miseboxDevRoutes = computed(() => getMiseboxDevRoutes())
</script>
```

### packages/tenants/fireux-cleanbox/src/runtime/layouts/CleanboxDefault.vue

```vue
<template>
  <CoreDefault :routes="cleanboxRoutes" />
</template>

<script setup lang="ts">
import { getCleanboxRoutes } from '../composables/app/routes/useCleanboxRoutes'
// Nuxt auto-imports; declare types for TS in package context
declare function useAppUser(): Promise<{ hasProfile: any }>
declare const computed: <T>(getter: () => T) => import('vue').ComputedRef<T>

const { hasProfile } = await useAppUser()
type LayoutRoutes = { menuBarLinks?: any[]; mobileLinks?: any[] }
const cleanboxRoutes = computed<LayoutRoutes>(() =>
  getCleanboxRoutes(hasProfile)
)
</script>
```

### packages/tenants/fireux-cleanbox/src/runtime/layouts/CleanboxDashboard.vue

```vue
<template>
  <CoreDashboard :routes="cleanboxRoutes" />
</template>

<script setup lang="ts">
import { getCleanboxRoutes } from '../composables/app/routes/useCleanboxRoutes'
// Nuxt auto-imports; declare types for TS in package context
declare function useAppUser(): Promise<{ hasProfile: any }>
declare const computed: <T>(getter: () => T) => import('vue').ComputedRef<T>

const { hasProfile } = await useAppUser()
type LayoutRoutes = { menuBarLinks?: any[]; mobileLinks?: any[] }
const cleanboxRoutes = computed<LayoutRoutes>(() =>
  getCleanboxRoutes(hasProfile)
)
</script>
```

### packages/tenants/fireux-cleanbox/src/runtime/layouts/CleanboxDev.vue

```vue
<template>
  <ClientOnly>
    <CoreDefault :routes="cleanboxDevRoutes" />
  </ClientOnly>
</template>

<script setup>
import { getCleanboxDevRoutes } from '../composables/app/routes/useCleanboxDevRoutes'

const cleanboxDevRoutes = computed(() => ({
  menuBarLinks: getCleanboxDevRoutes(),
  mobileLinks: getCleanboxDevRoutes(),
}))
</script>
```

### packages/core/fireux-core/src/runtime/composables/app/routes/useCoreRoutes.ts

```typescript
import { useAppUser } from '../../firestore/AppUser/useAppUser'
import { useAppUserRoutes } from './useAppUserRoutes'
import { useAdminRoutes } from './useAdminRoutes'
import { useSystemRoutes } from './useSystemRoutes'
import { computed } from 'vue'

export async function useCoreRoutes() {
  // Always available
  const menuBarLinks = useSystemRoutes()

  // Await user state
  const { isAppUser, isAdmin } = await useAppUser()

  // Computed mobile links
  const mobileLinks = computed(() => {
    let links = [...menuBarLinks]
    if (isAppUser) {
      links.push(...useAppUserRoutes())
    }
    if (isAdmin) {
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

### packages/core/fireux-core/src/runtime/composables/app/routes/useAdminRoutes.ts

```typescript
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

### packages/core/fireux-core/src/runtime/composables/app/routes/useSystemRoutes.ts

```typescript
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
  ]
}
```

### packages/core/fireux-core/src/runtime/composables/app/routes/useAppUserRoutes.ts

```typescript
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

### packages/tenants/fireux-misebox/src/runtime/composables/app/routes/useMiseboxRoutes.ts

```typescript
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

### packages/tenants/fireux-misebox/src/runtime/composables/app/routes/useMiseboxDevRoutes.ts

```typescript
export function getMiseboxDevRoutes() {
  return {
    miseboxDevRoutes: [
      {
        id: 'dev-misebox',
        label: 'Misebox Package',
        icon: 'i-heroicons-beaker',
        to: '/dev/fireux-misebox',
      },
    ],
  }
}
```

### packages/tenants/fireux-cleanbox/src/runtime/composables/app/routes/useCleanboxRoutes.ts

```typescript
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

### packages/tenants/fireux-cleanbox/src/runtime/composables/app/routes/useCleanboxDevRoutes.ts

```typescript
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
