<!-- packages/core/fireux-core/src/runtime/components/layouts/diagnostics/Nav.vue -->
<template>
  <div class="diagnostics-nav p-2 space-y-4">
    <section v-if="core.length">
      <h3 v-if="!collapsed" class="mb-2 text-xs font-semibold text-muted">Core</h3>
      <UNavigationMenu orientation="vertical" :items="core" :collapsed="collapsed" />
    </section>

    <section v-if="ecosystemNav.length">
      <h3 v-if="!collapsed" class="mb-2 text-xs font-semibold text-muted">Ecosystem</h3>
      <UNavigationMenu orientation="vertical" :items="ecosystemNav" :collapsed="collapsed" />
    </section>

    <section v-if="ext.length">
      <h3 v-if="!collapsed" class="mb-2 text-xs font-semibold text-muted">Extensions</h3>
      <UNavigationMenu orientation="vertical" :items="ext" :collapsed="collapsed" />
    </section>

    <section v-if="!collapsed" class="space-y-2 text-[10px] text-muted">
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
import { useDiagnosticsNav } from '../../../composables/navigation/useDiagnosticsNav';

withDefaults(
  defineProps<{
    collapsed?: boolean
  }>(),
  {
    collapsed: false,
  }
)

// Collect all diagnostics-layout nav items and group them by meta.group
const { desktop } = useDiagnosticsNav()
const core = computed(() => desktop.value.filter((i) => i.group === 'core'))

const ecosystemNav = computed(() =>
  desktop.value.filter((item) =>
    Boolean(item.group) && item.group !== 'core' && item.group !== 'ext'
  )
)

const ext = computed(() => desktop.value.filter((i) => i.group === 'ext'))

</script>

<style scoped>
.diagnostics-nav {
  height: 100%;
  overflow: auto;
}
</style>
