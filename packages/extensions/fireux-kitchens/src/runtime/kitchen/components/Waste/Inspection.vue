<template>
  <section class="grid gap-4">
    <UCard variant="subtle">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 class="font-semibold text-highlighted">WasteAI development</h2>
          <div class="flex items-center gap-2">
            <UButton
              to="/workspace/kitchen/stock/waste/search-demand"
              color="neutral"
              variant="outline"
              size="xs"
              icon="i-lucide-search"
            >
              Search demand
            </UButton>
            <UBadge color="primary" variant="soft">Connected</UBadge>
          </div>
        </div>
      </template>

      <ol class="grid gap-2 text-sm text-toned">
        <li>1. Record Waste is registered to WasteAI.</li>
        <li>2. WasteAI and KitchenAI receive the same available action.</li>
        <li>3. The action opens the Waste-owned recording modal.</li>
        <li>4. Submission creates one immutable Kitchen Waste event.</li>
      </ol>
    </UCard>

    <UCard variant="subtle">
      <template #header>
        <div class="grid gap-1">
          <p class="m-0 text-xs font-medium uppercase tracking-wide text-muted">
            Development context
          </p>
          <h2 class="m-0 font-semibold text-highlighted">
            {{ devContext.headline }}
          </h2>
        </div>
      </template>

      <div class="grid gap-5 text-sm text-toned">
        <section class="grid gap-2">
          <h3 class="m-0 font-semibold text-highlighted">View</h3>
          <p class="m-0">{{ devContext.description }}</p>
        </section>

        <section class="grid gap-3">
          <h3 class="m-0 font-semibold text-highlighted">Guiding literature</h3>
          <p class="m-0">{{ devContext.literatureIntroduction }}</p>
          <ul class="list-disc space-y-1 pl-5">
            <li v-for="keyword in devContext.keywords" :key="keyword">
              {{ keyword }}
            </li>
          </ul>
          <p class="m-0">{{ devContext.literatureSummary }}</p>
        </section>

        <section class="grid gap-2">
          <h3 class="m-0 font-semibold text-highlighted">What people need</h3>
          <ul class="list-disc space-y-1 pl-5">
            <li v-for="need in devContext.needs" :key="need">{{ need }}</li>
          </ul>
        </section>
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { wasteAIContext } from '../../models/waste-ai'

const devContext = wasteAIContext.devContext
</script>
