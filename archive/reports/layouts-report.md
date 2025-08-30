# FireUX Layouts Report (Post-Phase D)

Date: 2025-08-30
Repo: /Users/danielwatson/Dev/fireux

## Summary
- Core layouts registered as keys and global components (prefix: Core).
- Tenants register layout components and keys (Misebox*, Cleanbox*).
- Extensions have a minimal layouts-config hook (components-only for now).
- Core design layout key added and satisfied by design.vue.

## Registered Layout Keys
- Core: default, dashboard, dev, docs, design
- Misebox: MiseboxDefault, MiseboxDashboard, MiseboxDev
- Cleanbox: CleanboxDefault, CleanboxDashboard, CleanboxDev
- Extensions (Jobs, Places): none (hooks present; add later as needed)

## How to Use
- Continue app-level wrappers (projects/*/app/layouts) or use page meta:
  - definePageMeta({ layout: 'MiseboxDashboard' })
  - definePageMeta({ layout: 'CleanboxDefault' })

---

## Package runtime layouts (with contents)

### packages/core/fireux-core/src/runtime/layouts/default.vue

```vue
<template>
  <div class="layout-wrapper">
    <FireLayoutsHeader
      :menu-bar-links="menuBarLinks"
      :mobile-links="mobileLinks"
    />
    <NuxtPage />
    <FireLayoutsDefaultFooter />
  </div>
</template>

<script setup>
const props = defineProps({
  routes: {
    type: Object,
    default: () => ({
      menuBarLinks: [],
      mobileLinks: [],
    }),
  },
})

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
      <FireLayoutsHeader
        :menu-bar-links="routes.menuBarLinks"
        :mobile-links="routes.mobileLinks"
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
            <!-- <FireLayoutsSubHeader :icon-title="subHeader" /> -->
            <NuxtPage />
          </div>
        </main>
      </div>
      <FireLayoutsDefaultFooter />
    </div>
  </ClientOnly>
</template>

<script setup>
const props = defineProps({
  routes: {
    type: Object, // Expecting an object-based structure
    default: () => ({
      menuBarLinks: [],
      mobileLinks: [],
    }),
  },
})

const { menuBarLinks: coreMenuBarLinks, mobileLinks: coreMobileLinks } =
  await useCoreRoutes()

// Merge core routes with additional routes passed via props
const menuBarLinks = [...coreMenuBarLinks, ...(props.routes.menuBarLinks || [])]
const mobileLinks = [
  ...coreMobileLinks.value,
  ...(props.routes.mobileLinks || []),
]

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
  <div class="layout-wrapper">
    <FireDevNav :links="devRoutes.miseboxDevRoutes || []" />
    <NuxtPage />
  </div>
</template>

<script setup>
const props = defineProps({
  devRoutes: {
    type: Object,
    default: () => ({}),
  },
})
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

### packages/core/fireux-core/src/runtime/layouts/design.vue

```vue
<template>
  <CoreDefault />
</template>
```

---

## Tenant runtime layouts (with contents)

### packages/tenants/fireux-misebox/src/runtime/layouts/MiseboxDefault.vue

```vue
<template>
  <CoreDefault :routes="miseboxRoutes" />
</template>

<script setup>
import { getMiseboxRoutes } from '../composables/app/routes/useMiseboxRoutes'

const { hasProfile } = await useAppUser()
const miseboxRoutes = computed(() => getMiseboxRoutes(hasProfile))
</script>
```

### packages/tenants/fireux-misebox/src/runtime/layouts/MiseboxDashboard.vue

```vue
<template>
  <CoreDashboard :routes="miseboxRoutes" />
</template>

<script setup>
import { getMiseboxRoutes } from '../composables/app/routes/useMiseboxRoutes'

const { hasProfile } = await useAppUser()
const miseboxRoutes = computed(() => getMiseboxRoutes(hasProfile))
</script>
```

### packages/tenants/fireux-misebox/src/runtime/layouts/MiseboxDev.vue

```vue
<template>
  <CoreDev :devRoutes="miseboxDevRoutes" />
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

<script setup>
import { getCleanboxRoutes } from '../composables/app/routes/useCleanboxRoutes'

const { hasProfile } = await useAppUser()
const cleanboxRoutes = computed(() => getCleanboxRoutes(hasProfile))
</script>
```

### packages/tenants/fireux-cleanbox/src/runtime/layouts/CleanboxDashboard.vue

```vue
<template>
  <CoreDashboard :routes="cleanboxRoutes" />
</template>

<script setup>
import { getCleanboxRoutes } from '../composables/app/routes/useCleanboxRoutes'

const { hasProfile } = await useAppUser()
const cleanboxRoutes = computed(() => getCleanboxRoutes(hasProfile))
</script>
```

### packages/tenants/fireux-cleanbox/src/runtime/layouts/CleanboxDev.vue

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

---

## Project app layouts (wrappers)

- projects/fireux/fireux-app/app/layouts/default.vue → wraps CoreDefault with pure core routes
- projects/fireux/fireux-app/app/layouts/dev.vue → wraps FireDebugPage
- projects/fireux/fireux-app/app/layouts/dashboard.vue → wraps CoreDashboard with system/app/admin routes
- projects/misebox/misebox-app/app/layouts/* → wrappers mounting Misebox* components
- projects/misebox/niederhorn/app/layouts/* → wrappers mounting Misebox* components
- projects/cleanbox/cleanbox-app/app/layouts/* → wrappers mounting Cleanbox* components
- projects/cleanbox/richies-reinigung/app/layouts/* → wrappers mounting Cleanbox* components

These can remain, or pages may now opt-in to tenant layout keys directly via definePageMeta({ layout: '<TenantKey>' }).
