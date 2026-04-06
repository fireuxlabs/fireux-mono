<template>
  <section class="space-y-6">
    <UCard>
      <template #header><div class="text-sm font-semibold">Workspace Summary</div></template>
      <div class="grid gap-3 sm:grid-cols-4">
        <div class="space-y-1"><div class="text-xs uppercase tracking-[0.16em] text-toned">Mode</div><div class="text-sm font-medium">Demo</div></div>
        <div class="space-y-1"><div class="text-xs uppercase tracking-[0.16em] text-toned">Source</div><div class="text-sm font-medium">Curated demo scenario</div></div>
        <div class="space-y-1"><div class="text-xs uppercase tracking-[0.16em] text-toned">Portfolio Id</div><div class="font-mono text-sm">{{ runtime.id }}</div></div>
        <div class="space-y-1"><div class="text-xs uppercase tracking-[0.16em] text-toned">Is Premium</div><div class="text-sm font-medium">{{ isPremium ? 'true' : 'false' }}</div></div>
      </div>
    </UCard>
    <UCard v-if="!isPremium">
      <div class="flex items-center justify-between gap-4">
        <div class="space-y-1"><div class="text-sm font-semibold">Preview Premium Real Summary</div><p class="text-sm text-dimmed">Show what premium real portfolio collection insights can look like.</p></div>
        <USwitch v-model="showPremiumPreview" />
      </div>
    </UCard>
    <UCard v-if="isPremium || showPremiumPreview">
      <template #header><div class="text-sm font-semibold">Premium Real Preview</div></template>
      <div class="space-y-3">
        <div class="space-y-1"><div class="text-xs uppercase tracking-[0.16em] text-toned">Total Portfolios</div><div class="text-sm font-medium">{{ demoPortfolioCount }}</div></div>
        <p class="text-sm text-dimmed">Preview only. Premium real mode can surface live collection summaries like this.</p>
      </div>
    </UCard>
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useRuntimePortfolioConsole } from '../../../../composables/fireux/app/portfolio-runtime/useRuntimePortfolioConsole'
import { useRuntimePortfolio } from '../../../../composables/fireux/app/portfolio-runtime/useRuntimePortfolio'
const runtime = useRuntimePortfolio()
const { scenarios } = useRuntimePortfolioConsole()
const { isPremium } = useUser()
const showPremiumPreview = ref(false)
const demoPortfolioCount = computed(() => scenarios.value.length)
</script>
