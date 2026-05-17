<template>
  <UPage>
    <UPageHeader
      title="Dev · fireux-granite"
      description="Granite ecosystem shell diagnostics."
    />

    <UPageBody class="pagebody space-y-4">
      <UCard>
        <div class="text-sm">Runtime anchor: <span class="font-medium">portfolio</span></div>
        <div class="text-sm">Selected portfolio: <span class="font-mono">{{ runtimeId || 'unset' }}</span></div>
        <div class="text-sm">Runtime mode: <span class="font-medium">{{ runtimeMode }}</span></div>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useActivePortfolio } from 'fireux-properties/runtime/composables/fireux/console/portfolio/operations/useActivePortfolio'

definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-fireux-granite',
    label: 'Granite',
    icon: 'i-lucide-building-2',
    desktop: true,
    group: 'granite',
    layouts: ['dev'],
  },
})

const runtimePortfolio = useActivePortfolio()
const runtimeId = computed(() => runtimePortfolio.id.value)
const runtimeMode = computed(() => runtimePortfolio.mode.value)
</script>
