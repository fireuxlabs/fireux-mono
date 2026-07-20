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

      <GranitePortfolioStorage />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-20 22:24 CEST — Repo Efficiency Pass 5 of 6: compose Granite-owned portfolio child diagnostics.
import { computed } from 'vue'
import { useActivePortfolio } from 'fireux-properties/runtime/composables/fireux/console/portfolio/operations/useActivePortfolio'
import GranitePortfolioStorage from '../../components/Dev/PortfolioStorage.vue'

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
