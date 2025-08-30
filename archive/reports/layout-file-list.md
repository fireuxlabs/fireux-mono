# FireUX Layout Files (Full Contents)

This document lists all layout-related files discovered across packages and projects, with their absolute paths and full contents.

---

## Package runtime layouts

### /Users/danielwatson/Dev/fireux/packages/core/fireux-core/src/runtime/layouts/default.vue

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
// FireUX uses pure core - no additional routes needed
const coreRoutes = await useCoreRoutes()
const menuBarLinks = [
  ...(Array.isArray(coreRoutes.menuBarLinks) ? coreRoutes.menuBarLinks : []),
]
const mobileLinks = [
  ...(Array.isArray(coreRoutes.mobileLinks) ? coreRoutes.mobileLinks : []),
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

### /Users/danielwatson/Dev/fireux/packages/core/fireux-core/src/runtime/layouts/dashboard.vue

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

### /Users/danielwatson/Dev/fireux/packages/core/fireux-core/src/runtime/layouts/dev.vue

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

### /Users/danielwatson/Dev/fireux/packages/core/fireux-core/src/runtime/layouts/docs.vue

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

### /Users/danielwatson/Dev/fireux/packages/tenants/fireux-misebox/src/runtime/layouts/MiseboxDefault.vue

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

### /Users/danielwatson/Dev/fireux/packages/tenants/fireux-misebox/src/runtime/layouts/MiseboxDashboard.vue

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

### /Users/danielwatson/Dev/fireux/packages/tenants/fireux-misebox/src/runtime/layouts/MiseboxDev.vue

```vue
<template>
  <CoreDev :devRoutes="miseboxDevRoutes" />
</template>

<script setup>
import { getMiseboxDevRoutes } from '../composables/app/routes/useMiseboxDevRoutes'

const miseboxDevRoutes = computed(() => getMiseboxDevRoutes())
</script>
```

### /Users/danielwatson/Dev/fireux/packages/tenants/fireux-cleanbox/src/runtime/layouts/CleanboxDefault.vue

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

### /Users/danielwatson/Dev/fireux/packages/tenants/fireux-cleanbox/src/runtime/layouts/CleanboxDashboard.vue

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

### /Users/danielwatson/Dev/fireux/packages/tenants/fireux-cleanbox/src/runtime/layouts/CleanboxDev.vue

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

## Project app layouts

### /Users/danielwatson/Dev/fireux/projects/fireux/fireux-app/app/layouts/default.vue

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
// FireUX uses pure core - no additional routes needed
const coreRoutes = await useCoreRoutes()
const menuBarLinks = [
  ...(Array.isArray(coreRoutes.menuBarLinks) ? coreRoutes.menuBarLinks : []),
]
const mobileLinks = [
  ...(Array.isArray(coreRoutes.mobileLinks) ? coreRoutes.mobileLinks : []),
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

### /Users/danielwatson/Dev/fireux/projects/fireux/fireux-app/app/layouts/dev.vue

```vue
<template>
  <ClientOnly>
    <FireDebugPage>
      <NuxtPage />
    </FireDebugPage>
  </ClientOnly>
</template>

<script setup>
// FireUX dev layout - passes dev data to debug page
</script>
```

### /Users/danielwatson/Dev/fireux/projects/fireux/fireux-app/app/layouts/dashboard.vue

```vue
<template>
  <ClientOnly>
    <CoreDashboard :routes="routes" />
  </ClientOnly>
</template>

<script setup>
const systemRoutes = useSystemRoutes()
const { isAppUser, isAdmin } = useAppUser()
const appUserGroup = useAppUserRoutes() || []
const adminGroup = useAdminRoutes() || []

const routes = {
  menuBarLinks: [...systemRoutes],
  mobileLinks: [
    ...systemRoutes,
    ...(isAppUser ? appUserGroup : []),
    ...(isAdmin ? adminGroup : []),
  ],
  dashboardLinks: [
    ...(isAppUser ? appUserGroup : []),
    ...(isAdmin ? adminGroup : []),
  ],
}
</script>
```

### /Users/danielwatson/Dev/fireux/projects/misebox/niederhorn/app/layouts/default.vue

```vue
<template>
  <MiseboxDefault />
</template>
```

### /Users/danielwatson/Dev/fireux/projects/misebox/niederhorn/app/layouts/dev.vue

```vue
<template>
  <MiseboxDev />
</template>
```

### /Users/danielwatson/Dev/fireux/projects/misebox/niederhorn/app/layouts/dashboard.vue

```vue
<template>
  <MiseboxDashboard />
</template>
```

### /Users/danielwatson/Dev/fireux/projects/cleanbox/cleanbox-app/app/layouts/default.vue

```vue
<template>
  <CleanboxDefault />
</template>
```

### /Users/danielwatson/Dev/fireux/projects/cleanbox/cleanbox-app/app/layouts/dev.vue

```vue
<template>
  <CleanboxDev />
</template>
```

### /Users/danielwatson/Dev/fireux/projects/cleanbox/cleanbox-app/app/layouts/dashboard.vue

```vue
// cleanbox-app/layouts/dashboard
<template>
  <ClientOnly>
    <CoreDashboard :routes="routes" />
  </ClientOnly>
</template>

<script setup>
const systemRoutes = useSystemRoutes()
const { isAppUser, isAdmin } = useAppUser()
const appUserGroup = useAppUserRoutes() || []
const adminGroup = useAdminRoutes() || []

const jobPublicRoutes = getJobRoutes() || []
let jobPrivateRoutes = []

if (import.meta.client) {
  jobPrivateRoutes = (await getJobProfileRoutes()) || []
}

const routes = {
  menuBarLinks: [...systemRoutes, ...jobPublicRoutes],
  mobileLinks: [
    ...systemRoutes,
    ...jobPublicRoutes,
    ...(isAppUser ? jobPrivateRoutes : []),
    ...(isAppUser ? appUserGroup : []),
    ...(isAdmin ? adminGroup : []),
  ],
  dashboardLinks: [
    ...(isAppUser ? jobPrivateRoutes : []),
    ...(isAppUser ? appUserGroup : []),
    ...(isAdmin ? adminGroup : []),
  ],
}
</script>
```

### /Users/danielwatson/Dev/fireux/projects/misebox/misebox-app/app/layouts/default.vue

```vue
<template>
  <MiseboxDefault />
</template>
```

### /Users/danielwatson/Dev/fireux/projects/misebox/misebox-app/app/layouts/dev.vue

```vue
<template>
  <MiseboxDev />
</template>
```

### /Users/danielwatson/Dev/fireux/projects/misebox/misebox-app/app/layouts/dashboard.vue

```vue
<template>
  <MiseboxDashboard />
</template>
```

### /Users/danielwatson/Dev/fireux/projects/cleanbox/richies-reinigung/app/layouts/default.vue

```vue
//richies-reinigung layout/default
<template>
  <CleanboxDefault />
</template>
```

### /Users/danielwatson/Dev/fireux/projects/cleanbox/richies-reinigung/app/layouts/dev.vue

```vue
<template>
  <CleanboxDev />
</template>
```

### /Users/danielwatson/Dev/fireux/projects/cleanbox/richies-reinigung/app/layouts/dashboard.vue

```vue
// richies-reinigung/layouts/dashboard
<template>
  <CleanboxDashboard />
</template>
```
