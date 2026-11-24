<template>
  <UPage>
    <UPageHeader
      title="Diagnostics · fireux-granite"
      description="Granite ecosystem shell diagnostics."
    />

    <UPageBody class="pagebody">
      <UCard>
        <div>Runtime anchor: <span>portfolio</span></div>
        <div>
          Selected portfolio:
          <span>{{ runtimeId || 'unset' }}</span>
        </div>
        <div>
          Read state: <span>{{ runtimeOutcome }}</span>
        </div>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">

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
    menus: ['diagnostics'],
  },
})

const route = useRoute()
const runtimePortfolio = usePortfolioScope(computed(() => String(route.query.portfolioId || '')))
const runtimeId = computed(() => runtimePortfolio.id.value)
const runtimeOutcome = computed(() => runtimePortfolio.targetOutcome.value)
</script>
