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
</script>

<style scoped>
.dev-nav {
  height: 100%;
  overflow: auto;
}
</style>
