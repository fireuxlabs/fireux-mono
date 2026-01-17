<!-- packages/core/fireux-core/src/runtime/components/layouts/dev/Nav.vue -->
<template>
  <div class="dev-nav p-2 space-y-4">
    <section v-if="core.length">
      <h3 v-if="!collapsed" class="text-xs font-semibold text-gray-500 mb-2">Core</h3>
      <UNavigationMenu orientation="vertical" :items="core" :collapsed="collapsed" />
    </section>

    <section v-if="ecosystemNav.length">
      <h3 v-if="!collapsed" class="text-xs font-semibold text-gray-500 mb-2">Ecosystem</h3>
      <UNavigationMenu orientation="vertical" :items="ecosystemNav" :collapsed="collapsed" />
    </section>

    <section v-if="ext.length">
      <h3 v-if="!collapsed" class="text-xs font-semibold text-gray-500 mb-2">Extensions</h3>
      <UNavigationMenu orientation="vertical" :items="ext" :collapsed="collapsed" />
    </section>

    <section v-if="!collapsed" class="text-[10px] text-gray-500 space-y-2">
      <div>
        counts: core {{ core.length }} | eco {{ ecosystemNav.length }} | ext
        {{ ext.length }} | all {{ desktop.length }}
      </div>
      <div class="space-y-1">
        <div v-for="item in desktop" :key="item.to">
          {{ item.group || 'none' }} — {{ item.label || item.to }}
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDevNav } from '../../../composables/fireux/app/routing/presets';

withDefaults(
  defineProps<{
    collapsed?: boolean
  }>(),
  {
    collapsed: false,
  }
)

// Collect all dev-layout nav items and group them by meta.group
const { desktop } = useDevNav()
const core = computed(() => desktop.value.filter((i) => i.group === 'core'))

const ecosystemNav = computed(() =>
  desktop.value.filter((item) =>
    Boolean(item.group) && item.group !== 'core' && item.group !== 'ext'
  )
)

const ext = computed(() => desktop.value.filter((i) => i.group === 'ext'))

</script>

<style scoped>
.dev-nav {
  height: 100%;
  overflow: auto;
}
</style>
