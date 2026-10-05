<template>
  <nav
    class="grid grid-cols-4 gap-1 rounded-xl border border-default bg-elevated p-1"
    aria-label="Industry research stages"
  >
    <UButton
      v-for="stage in stages"
      :key="stage.id"
      :to="{ path: stage.to, query: scope ? { scope } : {} }"
      class="justify-center px-2 text-xs sm:text-sm"
      color="neutral"
      :variant="stage.id === current ? 'solid' : 'outline'"
      :aria-current="stage.id === current ? 'step' : undefined"
    >
      <span class="hidden sm:inline">{{ stage.order }}.</span> {{ stage.label }}
    </UButton>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'
const route = useRoute()
const scope = computed(() =>
  typeof route.query.scope === 'string' ? route.query.scope : ''
)
defineProps<{
  current: 'domain' | 'analysis' | 'tools' | 'capabilities'
}>()

const stages = [
  {
    id: 'domain',
    order: 1,
    label: 'Evidence',
    to: '/search-demand',
  },
  {
    id: 'analysis',
    order: 2,
    label: 'Jobs',
    to: '/search-demand/analysis',
  },
  { id: 'tools', order: 3, label: 'Tools', to: '/search-demand/tools' },
  {
    id: 'capabilities',
    order: 4,
    label: 'Capabilities',
    to: '/search-demand/capabilities',
  },
] as const
</script>
