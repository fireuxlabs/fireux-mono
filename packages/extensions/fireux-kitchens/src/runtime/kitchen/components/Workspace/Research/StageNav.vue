<template>
  <nav aria-label="Capability research stages" class="flex flex-wrap gap-2">
    <UButton
      v-for="stage in stages"
      :key="stage.id"
      :to="stage.to"
      color="neutral"
      :variant="current === stage.id ? 'solid' : 'outline'"
      size="sm"
    >
      {{ stage.label }}
    </UButton>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  basePath: string
  current: 'evidence' | 'analysis' | 'tools'
}>()

const stages = computed(() => [
  { id: 'evidence' as const, label: '1 · Evidence', to: props.basePath },
  { id: 'analysis' as const, label: '2 · Analysis', to: `${props.basePath}/analysis` },
  { id: 'tools' as const, label: '3 · Tools', to: `${props.basePath}/tools` },
])
</script>
