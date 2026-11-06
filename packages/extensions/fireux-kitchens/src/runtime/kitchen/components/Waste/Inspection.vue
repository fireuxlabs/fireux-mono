<template>
  <section class="grid gap-4">
    <UCard variant="subtle">
      <template #header>
        <div class="card__header">
          <h2>WasteAI development</h2>
          <div class="fx-card__actions">
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

      <ol class="fx-card-body-stack">
        <li>1. Record Waste is registered to WasteAI.</li>
        <li>2. WasteAI and KitchenAI receive the same available action.</li>
        <li>3. The action opens the Waste-owned recording modal.</li>
        <li>4. Submission creates one immutable Kitchen Waste event.</li>
      </ol>
    </UCard>

    <UCard variant="subtle">
      <template #header>
        <div class="fx-card-body-stack">
          <p>Development context</p>
          <h2>
            {{ devContext.headline }}
          </h2>
        </div>
      </template>

      <div class="fx-card-body-stack">
        <section class="fx-card-body-stack">
          <h3>View</h3>
          <p>{{ devContext.description }}</p>
        </section>

        <section class="fx-card-body-stack">
          <h3>Guiding literature</h3>
          <p>{{ devContext.literatureIntroduction }}</p>
          <ul class="list-disc space-y-1 pl-5">
            <li v-for="keyword in devContext.keywords" :key="keyword">
              {{ keyword }}
            </li>
          </ul>
          <p>{{ devContext.literatureSummary }}</p>
        </section>

        <section class="fx-card-body-stack">
          <h3>What people need</h3>
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
