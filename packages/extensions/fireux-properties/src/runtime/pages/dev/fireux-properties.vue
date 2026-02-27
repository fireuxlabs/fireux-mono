<template>
  <UPage>
    <UPageHeader
      title="Dev · fireux-properties"
      description="Properties runtime and portfolio selection diagnostics."
    />

    <UPageBody class="pagebody space-y-4">
      <UCard>
        <div class="text-sm">
          runtimePortfolioId: <span class="font-mono">{{ runtimePortfolio.id }}</span>
        </div>
        <div class="text-sm">
          runtimePortfolioMode: <span class="font-mono">{{ runtimePortfolio.mode }}</span>
        </div>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRuntimePortfolio } from '../../composables/fireux/app/portfolio-runtime/useRuntimePortfolio'

definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-fireux-properties',
    label: 'fireux-properties',
    icon: 'i-lucide-building',
    group: 'ext',
    desktop: true,
    layouts: ['dev'],
  },
})

const runtime = useRuntimePortfolio()
const runtimePortfolio = computed(() => ({
  id: runtime.id.value || null,
  mode: runtime.mode.value,
}))
</script>
