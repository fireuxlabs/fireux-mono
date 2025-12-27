<!-- packages/core/fireux-core/src/runtime/components/layouts/dev/Nav.vue -->
<template>
  <div class="dev-nav p-2 space-y-4">
    <section v-if="core.length">
      <h3 class="text-xs font-semibold text-gray-500 mb-2">Core</h3>
      <UNavigationMenu orientation="vertical" :items="core" />
    </section>

    <section v-if="ecosystemNav.length">
      <h3 class="text-xs font-semibold text-gray-500 mb-2">Ecosystem</h3>
      <UNavigationMenu orientation="vertical" :items="ecosystemNav" />
    </section>

    <section v-if="ext.length">
      <h3 class="text-xs font-semibold text-gray-500 mb-2">Extensions</h3>
      <UNavigationMenu orientation="vertical" :items="ext" />
    </section>

    <!-- Debug: show grouped links and ecosystem when ?debug=devnav -->
    <UCard v-if="showDebug" class="mt-3">
      <template #header>
        <h2>DevNav Debug</h2>
      </template>
      <DevJsonPanel :data="{ ecosystem, core, ecosystemNav, ext }" />
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDevNav } from '../../../composables/fireux/app/routing/presets'
import { useFireUXConfig } from '../../../composables/fireux/app/FireUXConfig'
const route = useRoute()

// Collect all dev-layout nav items and group them by meta.group
const { desktop } = useDevNav()
const { ecosystem } = useFireUXConfig()

const core = computed(() => desktop.value.filter((i) => i.group === 'core'))

// Track known ecosystem groups so we can surface multiple ecosystems when present
const ECOSYSTEM_GROUPS = new Set(['misebox', 'cleanbox', 'ecosystem'])
const normalisedEcosystem =
  typeof ecosystem === 'string' ? ecosystem.toLowerCase() : ''

const isEcosystemGroup = (group?: string) => {
  if (!group) return false
  const name = group.toLowerCase()
  if (normalisedEcosystem && name === normalisedEcosystem) return true
  return ECOSYSTEM_GROUPS.has(name)
}

const ecosystemNav = computed(() =>
  desktop.value.filter((item) => isEcosystemGroup(item.group))
)

const ext = computed(() => desktop.value.filter((i) => i.group === 'ext'))

const showDebug = computed(() => {
  const q = route.query?.debug
  if (q === 'devnav') return true
  if (q === '1' || q === 'true') return true
  return false
})

/*
Dev pages inventory (grouped, meta-driven)

- core
  - packages/core/fireux-core/src/runtime/pages/dev/index.vue
    meta: { layout: 'dev', nav: { key: 'dev-index', label: 'Overview', icon: 'i-lucide-wrench', desktop: true, group: 'core', layouts: ['dev'] } }
  - packages/core/fireux-core/src/runtime/pages/dev/app.vue
    meta: { layout: 'dev', alias: ['/dev/apps'], nav: { key: 'dev-app', label: 'Apps', icon: 'i-lucide-settings', desktop: true, group: 'core', layouts: ['dev'] } }
  - packages/core/fireux-core/src/runtime/pages/dev/fireux-core.vue
    meta: { layout: 'dev', nav: { key: 'dev-fireux-core', label: 'FireUX Core', icon: 'i-lucide-cpu', desktop: true, group: 'core', layouts: ['dev'] } }
  - packages/core/fireux-core/src/runtime/pages/dev/users.vue
    meta: { layout: 'dev', nav: { key: 'dev-users', label: 'Users', icon: 'i-lucide-users', desktop: true, group: 'core', layouts: ['dev'] } }

- misebox (ecosystem)
  - packages/ecosystem/fireux-misebox/src/runtime/pages/dev/index.vue
    meta: { layout: 'dev', nav: { key: 'dev-tenant-index', label: 'Tenant Overview', icon: 'i-lucide-wrench', desktop: true, group: 'misebox', layouts: ['dev'] } }
  - packages/ecosystem/fireux-misebox/src/runtime/pages/dev/fireux-misebox.vue
    meta: { layout: 'dev', alias: ['/dev/fireux-misebox-tenant'], nav: { key: 'dev-tenant-misebox-global', label: 'Misebox Global', icon: 'i-lucide-globe-2', desktop: true, group: 'misebox', layouts: ['dev'] } }
  - packages/ecosystem/fireux-misebox/src/runtime/pages/dev/fireux-misebox-tenant.vue
    meta: { layout: 'dev', nav: { key: 'dev-tenant-misebox-app', label: 'Misebox App', icon: 'i-lucide-badge-check', desktop: true, group: 'misebox', layouts: ['dev'] } } [deleted]

- app
  - projects/fireux/fireux-app/app/pages/dev/design/index.vue
    meta: { layout: 'dev', nav: { key: 'dev-design', label: 'Design', icon: 'i-lucide-palette', desktop: true, group: 'app', layouts: ['dev'] } } [removed; now public under /pages/design]

- ext
  - packages/extensions/fireux-jobs/src/runtime/pages/dev/fireux-jobs.vue
    meta: { layout: 'dev', nav: { key: 'dev-ext-jobs', label: 'Jobs (Ext)', icon: 'i-lucide-briefcase', desktop: true, group: 'ext', layouts: ['dev'] } }

Notes
- Core stubs without definePageMeta are intentionally excluded from groups (e.g., core: fireux-jobs.vue, fireux-misebox.vue).
- The ecosystem section title uses the current ecosystem from FireUXConfig.
*/
</script>

<style scoped>
.dev-nav {
  height: 100%;
  overflow: auto;
}
</style>
