<template>
  <section class="space-y-6">
    <UCard>
      <template #header><div class="text-sm font-semibold">Workspace Summary</div></template>
      <div class="grid gap-3 sm:grid-cols-4">
        <div class="space-y-1"><div class="text-xs uppercase tracking-[0.16em] text-toned">Mode</div><div class="text-sm font-medium">Test</div></div>
        <div class="space-y-1"><div class="text-xs uppercase tracking-[0.16em] text-toned">Source</div><div class="text-sm font-medium">Firestore test data</div></div>
        <div class="space-y-1"><div class="text-xs uppercase tracking-[0.16em] text-toned">Portfolio Id</div><div class="font-mono text-sm">{{ runtime.id }}</div></div>
        <div class="space-y-1"><div class="text-xs uppercase tracking-[0.16em] text-toned">Is Premium</div><div class="text-sm font-medium">{{ isPremium ? 'true' : 'false' }}</div></div>
      </div>
    </UCard>
  </section>
</template>
<script setup lang="ts">
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useRuntimePortfolio } from '../../../composables/fireux/app/portfolio-runtime/useRuntimePortfolio'
const runtime = useRuntimePortfolio()
const { isPremium } = useUser()
</script>
