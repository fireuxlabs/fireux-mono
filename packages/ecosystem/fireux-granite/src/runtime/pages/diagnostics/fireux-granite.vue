<template>
  <UPage>
    <UPageHeader
      title="Diagnostics · fireux-granite"
      description="Granite ecosystem shell diagnostics."
    />

    <UPageBody class="pagebody space-y-4">
      <UCard>
        <div class="text-sm">
          Runtime anchor: <span class="font-medium">portfolio</span>
        </div>
        <div class="text-sm">
          Selected portfolio:
          <span class="font-mono">{{ runtimeId || 'unset' }}</span>
        </div>
        <div class="text-sm">
          Read state: <span class="font-medium">{{ runtimeOutcome }}</span>
        </div>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { usePortfolioWorkspace } from '../../../../../../extensions/fireux-properties/src/runtime/portfolio/composables/workspace/usePortfolioWorkspace'

// Concurrent edit — 2026-07-20 22:24 CEST — Repo Efficiency Pass 5 of 6: compose Granite-owned portfolio child diagnostics.
import { computed } from 'vue'
import { usePortfolioScope } from 'fireux-properties/runtime/portfolio/composables/usePortfolioScope'

definePageMeta({
  layout: 'diagnostics',
  nav: {
    key: 'dev-fireux-granite',
    label: 'Granite',
    icon: 'i-lucide-building-2',
    desktop: true,
    group: 'granite',
    layouts: ['diagnostics'],
  },
})

const runtimePortfolio = usePortfolioScope(usePortfolioWorkspace().id)
const runtimeId = computed(() => runtimePortfolio.id.value)
const runtimeOutcome = computed(() => runtimePortfolio.targetOutcome.value)
</script>
