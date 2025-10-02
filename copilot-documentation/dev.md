# Dev Pages (Full Source)

Note: Generated on 2025-10-02. This file aggregates the full contents of dev pages across the monorepo for quick reference. The live app uses route meta (layouts:['dev']) and nav.group for navigation.

---

## packages/core/fireux-core/src/runtime/pages/dev/index.vue

```vue
<template>
  <div class="page">
    <h1>Development Tools</h1>

    <section v-if="groups.Core.length" class="group">
      <h2>Core</h2>
      <div class="dev-links">
        <UButton
          v-for="item in groups.Core"
          :key="item.key"
          :to="item.to"
          :icon="item.icon"
          :label="item.label"
        />
      </div>
    </section>

    <section v-if="groups.Tenancy.length" class="group">
      <h2>Tenancy</h2>
      <div class="dev-links">
        <UButton
          v-for="item in groups.Tenancy"
          :key="item.key"
          :to="item.to"
          color="primary"
          :icon="item.icon"
          :label="item.label"
        />
      </div>
    </section>

    <section v-if="groups.Modules.length" class="group">
      <h2>Modules</h2>
      <div class="dev-links">
        <UButton
          v-for="item in groups.Modules"
          :key="item.key"
          :to="item.to"
          color="primary"
          :icon="item.icon"
          :label="item.label"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Development Tools',
  layout: 'dev',
  nav: {
    key: 'dev-index',
    label: 'Overview',
    icon: 'i-lucide-wrench',
    desktop: true,
    group: 'core',
    layouts: ['dev'],
  },
})

import { useDevPages } from '../../composables/app/dev'
const { groups } = useDevPages()
</script>

<style scoped>
.dev-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}
.group + .group {
  margin-top: 24px;
}
</style>
```

---

## packages/core/fireux-core/src/runtime/pages/dev/app.vue

```vue
<template>
  <div>
    <UCard>
      <template #header>
        <h1>🔧 App Development Tools</h1>
      </template>
      <p>App: {{ app?.app_name || 'None' }}</p>
      <p>Tenancy: {{ tenancyDisplay }}</p>
    </UCard>

    <UCard v-if="app">
      <h2>Components</h2>

      <h3>Pill</h3>
      <OrganismsAppCardsPill :app="app" />

      <USeparator />

      <h3>Cell</h3>
      <OrganismsAppCardsCell :app="app" />

      <USeparator />

      <h3>Profile</h3>
      <OrganismsAppCardsProfile :app="app" />
    </UCard>

    <UCard>
      <DevJson :data="{ app }" title="App JSON" />
    </UCard>
  </div>
</template>

<script setup>
// Use dev layout + nav meta
definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-app',
    label: 'App Config',
    icon: 'i-lucide-settings',
    desktop: true,
    group: 'core',
    layouts: ['dev'],
  },
})

// Get app information
const { app, appTenancy, tenancyDisplay } = useApp()
</script>
```

---

## packages/core/fireux-core/src/runtime/pages/dev/fireux-core.vue

```vue
<template>
  <div>
    <UCard>
      <h1>FireUX Core - Apps</h1>
      <p>App: {{ app?.name || app?.id || 'None' }}</p>
    </UCard>

    <UCard v-if="app">
      <h2>Components</h2>

      <h3>Pill</h3>
      <OrganismsAppCardsPill :app="app" />

      <USeparator />

      <h3>Cell</h3>
      <OrganismsAppCardsCell :app="app" />

      <USeparator />

      <h3>Profile</h3>
      <OrganismsAppCardsProfile :app="app" />
    </UCard>

    <UCard>
      <DevJson
        :data="{
          currentApp: app,
          computedProps: { isInitialized },
          collection: { total: apps?.length || 0, apps },
        }"
        title="Apps JSON"
      />
    </UCard>

    <UCard>
      <h2>All Apps ({{ apps?.length || 0 }})</h2>

      <div v-if="apps?.length">
        <OrganismsAppCardsCell
          v-for="appItem in apps"
          :key="appItem.id"
          :app="appItem"
        />
      </div>

      <p v-else>No apps found</p>
    </UCard>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-fireux-core',
    label: 'FireUX Core',
    icon: 'i-lucide-cpu',
    desktop: true,
    group: 'core',
    layouts: ['dev'],
  },
})

const { app, apps, isInitialized } = useApp()
</script>
```

---

## packages/core/fireux-core/src/runtime/pages/dev/users.vue

```vue
<template>
  <div>
    <!-- Summary (read-only) -->
    <UCard>
      <template #header>
        <h1>👥 Users (Dev)</h1>
      </template>

      <div
        class="grid"
        style="display: grid; gap: 12px; grid-template-columns: 1fr"
      >
        <div>
          <h2>Status</h2>
          <ul>
            <li>hasCoreProfile: {{ hasCoreProfile }}</li>
            <li v-if="hasAppProfile !== undefined">
              hasAppProfile: {{ hasAppProfile }}
            </li>
            <li>isAdmin: {{ isAdmin }}</li>
            <li>displayName: {{ displayName || '—' }}</li>
            <li>initials: {{ initials || '—' }}</li>
          </ul>
        </div>

        <USeparator />

        <!-- No actions: Dev pages are read-only; use DevJson for inspection only. -->
      </div>
    </UCard>

    <!-- Current user JSON -->
    <UCard style="margin-top: 16px">
      <DevJson :data="user ?? null" title="Current User" :defaultOpen="true" />
    </UCard>

    <!-- Collections overview (read-only) -->
    <div
      style="
        margin-top: 16px;
        display: grid;
        gap: 16px;
        grid-template-columns: 1fr;
      "
    >
      <UCard v-if="isTenant">
        <template #header>
          <h2>Local Collection (apps/{{ appId }}/users)</h2>
        </template>
        <p>Total: {{ localCount }}</p>
        <DevJson :data="localFirst" title="First Local (up to 5)" />
      </UCard>

      <UCard>
        <template #header>
          <h2>Global Collection (core-users)</h2>
        </template>
        <p>Total: {{ globalCount }}</p>
        <DevJson :data="globalFirst" title="First Global (up to 5)" />
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
// Nuxt auto-imports declaration for TS in package
declare const definePageMeta: (meta: any) => void
definePageMeta({
  title: 'Users',
  layout: 'dev',
  nav: {
    key: 'dev-users',
    label: 'Users',
    icon: 'i-lucide-users',
    desktop: true,
    group: 'core',
    layouts: ['dev'],
  },
})

import { computed } from 'vue'
import { useFireUXConfig } from '../../composables/FireUXConfig'
import { useUser } from '../../composables/firestore/user/useUser'

// Unified user API
const {
  user,
  collection,
  hasCoreProfile,
  hasAppProfile,
  isAdmin,
  displayName,
  initials,
} = useUser()

// Env (tenant vs global)
const { role, appId } = useFireUXConfig()
const isTenant = role === 'tenant'

// Collections
const localCount = computed(() => collection.local?.value?.length ?? 0)
const globalCount = computed(() => collection.global?.value?.length ?? 0)

const localFirst = computed(() => (collection.local?.value ?? []).slice(0, 5))
const globalFirst = computed(() => (collection.global?.value ?? []).slice(0, 5))
</script>

<style scoped>
/* Keep styling minimal; rely on UCard + DevJson */
</style>
```

---

## packages/tenants/fireux-misebox/src/runtime/pages/dev/index.vue

```vue
<template>
  <div class="page">
    <h1>Development Tools</h1>

    <div class="dev-links">
      <!-- Core dev links -->
      <UButton to="/dev/app">App Config</UButton>
      <UButton to="/dev/fireux-core">FireUX Core</UButton>
      <UButton to="/dev/design">Design System</UButton>
      <UButton to="/dev/users">Users</UButton>

      <!-- Tenant/Extension dev links -->
      <UButton to="/dev/fireux-misebox" color="primary">Misebox Global</UButton>
      <UButton to="/dev/fireux-jobs" color="primary">Jobs Global</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Development Tools',
  layout: 'dev',
  nav: {
    key: 'dev-tenant-index',
    label: 'Tenant Overview',
    icon: 'i-lucide-wrench',
    desktop: true,
    group: 'misebox',
    layouts: ['dev'],
  },
})
</script>

<style scoped>
.dev-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}
</style>
```

---

## packages/tenants/fireux-misebox/src/runtime/pages/dev/fireux-misebox.vue

```vue
<template>
  <div>
    <UCard>
      <template #header>
        <h1>🍳 Global Chefs Collection</h1>
      </template>
      <p>Total Global Chefs: {{ globalChefs?.length || 0 }}</p>
      <DevJson
        :data="{ total: globalChefs?.length || 0, chefs: globalChefs }"
        title="Global Chefs JSON"
      />
    </UCard>

    <div style="margin-top: 16px; display: grid; gap: 16px">
      <UCard>
        <template #header>
          <h2>👤 Current Chef (global)</h2>
        </template>
        <DevJson
          :data="profile.current?.global || null"
          title="Current Global Chef"
        />
      </UCard>
    </div>

    <UCard style="margin-top: 16px">
      <template #header>
        <h1>🚚 Global Suppliers Collection</h1>
      </template>
      <p>Total Global Suppliers: {{ globalSuppliers?.length || 0 }}</p>
      <DevJson
        :data="{
          total: globalSuppliers?.length || 0,
          suppliers: globalSuppliers,
        }"
        title="Global Suppliers JSON"
      />
    </UCard>

    <div style="margin-top: 16px; display: grid; gap: 16px">
      <UCard>
        <template #header>
          <h2>👤 Current Supplier (global)</h2>
        </template>
        <DevJson
          :data="supplierProfile.current?.global || null"
          title="Current Global Supplier"
        />
      </UCard>
    </div>
  </div>
</template>

<script setup>
// Read-only global view using the unified profile composable
import { ref, onMounted } from 'vue'
import { chefConfig } from '../../models/profiles/Chef.model'
import { supplierConfig } from '../../models/profiles/Supplier.model'
definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-tenant-misebox-global',
    label: 'Misebox Global',
    icon: 'i-lucide-globe-2',
    desktop: true,
    group: 'misebox',
    layouts: ['dev'],
  },
})

// Use the useProfile composable to fetch global chefs
const profile = useProfile(chefConfig)
onMounted(() => {
  // Ensure global list is loaded in both roles
  profile.collection?.fetchGlobal?.()
})
// Ref of the global collection array; fallback to empty ref for SSR safety
const globalChefs = profile.collection?.fetchGlobal?.() ?? ref([])

// Suppliers: mirror the same pattern for global view
const supplierProfile = useProfile(supplierConfig)
onMounted(() => {
  supplierProfile.collection?.fetchGlobal?.()
})
const globalSuppliers = supplierProfile.collection?.fetchGlobal?.() ?? ref([])
</script>
```

---

## packages/tenants/fireux-misebox/src/runtime/pages/dev/fireux-misebox-tennant.vue

```vue
<template>
  <div>
    <UCard>
      <template #header>
        <h1>🏷️ App Chefs Collection</h1>
      </template>
      <p>Total App Chefs: {{ localChefs?.length || 0 }}</p>
      <DevJson
        :data="{ total: localChefs?.length || 0, chefs: localChefs }"
        title="App Chefs JSON"
      />
    </UCard>

    <div style="margin-top: 16px">
      <UCard>
        <template #header>
          <h2>👤 Current Chef (app mirror)</h2>
        </template>
        <DevJson
          :data="profile.current?.appMirror || null"
          title="Current App Chef"
        />
      </UCard>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { chefConfig } from '../../models/profiles/Chef.model'

definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-tenant-misebox-app',
    label: 'Misebox App',
    icon: 'i-lucide-badge-check',
    desktop: true,
    group: 'misebox',
    layouts: ['dev'],
  },
})

// Use local (app-scoped) collection and current app mirror when in tenant role
const profile = useProfile(chefConfig)
const localChefs = profile.collection?.local ?? ref([])
</script>
```

---

## packages/extensions/fireux-jobs/src/runtime/pages/dev/fireux-jobs.vue

```vue
<template>
  <div>
    <UCard>
      <template #header>
        <h1>🏢 Global Employers Collection</h1>
      </template>
      <p>Total Global Employers: {{ globalEmployers?.length || 0 }}</p>
      <DevJson
        :data="{
          total: globalEmployers?.length || 0,
          employers: globalEmployers,
        }"
        title="Global Employers JSON"
      />
    </UCard>

    <div style="margin-top: 16px; display: grid; gap: 16px">
      <UCard>
        <template #header>
          <h2>👤 Current Employer (global)</h2>
        </template>
        <DevJson
          :data="employerProfile.current?.global || null"
          title="Current Global Employer"
        />
      </UCard>
    </div>

    <UCard style="margin-top: 16px">
      <template #header>
        <h1>🧑‍🍳 Global Professionals Collection</h1>
      </template>
      <p>Total Global Professionals: {{ globalProfessionals?.length || 0 }}</p>
      <DevJson
        :data="{
          total: globalProfessionals?.length || 0,
          professionals: globalProfessionals,
        }"
        title="Global Professionals JSON"
      />
    </UCard>

    <div style="margin-top: 16px; display: grid; gap: 16px">
      <UCard>
        <template #header>
          <h2>👤 Current Professional (global)</h2>
        </template>
        <DevJson
          :data="professionalProfile.current?.global || null"
          title="Current Global Professional"
        />
      </UCard>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { employerConfig } from '../../models/profiles/Employer.model'
import { professionalConfig } from '../../models/profiles/Professional.model'

definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-ext-jobs',
    label: 'Jobs (Ext)',
    icon: 'i-lucide-briefcase',
    desktop: true,
    group: 'ext',
    layouts: ['dev'],
  },
})

// Employers
const employerProfile = useProfile(employerConfig)
const globalEmployers = employerProfile.collection?.fetchGlobal?.() ?? ref([])

// Professionals
const professionalProfile = useProfile(professionalConfig)
const globalProfessionals =
  professionalProfile.collection?.fetchGlobal?.() ?? ref([])

onMounted(() => {
  employerProfile.collection?.fetchGlobal?.()
  professionalProfile.collection?.fetchGlobal?.()
})
</script>
```

---

## projects/fireux/fireux-app/app/pages/dev/design/index.vue

```vue
<!-- COMMENT: moved from core: packages/core/fireux-core/src/runtime/pages/dev/design/index.vue -->
<script setup>
definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-design',
    label: 'Design',
    icon: 'i-lucide-palette',
    desktop: true,
    group: 'app',
    layouts: ['dev'],
  },
})
const sections = [
  {
    name: 'Atoms',
    icon: 'i-lucide-box',
    pages: ['colors', 'img', 'tokens', 'typography'],
  },
]
const getPagePath = (section, page) =>
  `/dev/design/${section.toLowerCase()}/${page}`
</script>

<template>
  <div class="design-layout">
    <aside class="sidebar">
      <h2>Design System</h2>
      <nav v-for="section in sections" :key="section.name">
        <h3><UIcon :name="section.icon" class="icon" /> {{ section.name }}</h3>
        <ul>
          <li v-for="page in section.pages" :key="page">
            <NuxtLink :to="getPagePath(section.name, page)">
              {{ page.replace('-', ' ') }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </aside>

    <main class="content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.design-layout {
  display: flex;
  height: 100vh;
}
.sidebar {
  width: 250px;
  background: var(--ui-bg-elevated);
  padding: 1rem;
  border-right: 1px solid var(--ui-border-muted);
  overflow-y: auto;
}
.sidebar h2 {
  text-align: center;
  margin-bottom: 1rem;
}
.sidebar h3 {
  margin-top: 1rem;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
}
.icon {
  margin-right: 0.5rem;
}
ul {
  list-style: none;
  padding-left: 1rem;
}
li {
  margin-bottom: 0.5rem;
}
li a {
  text-decoration: none;
  color: var(--ui-text);
  font-weight: 500;
}
li a:hover {
  color: var(--ui-primary);
}
.content {
  flex-grow: 1;
  padding: 2rem;
  overflow-y: auto;
}
</style>
```
