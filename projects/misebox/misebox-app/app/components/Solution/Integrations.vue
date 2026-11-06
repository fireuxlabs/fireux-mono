<template>
  <UCard variant="subtle">
    <template #header>
      <h2 class="fx-type-section-title">Integrations</h2>
    </template>

    <div class="fx-card-body-stack">
      <p class="fx-type-caption">
        {{ integrations.body }}
      </p>

      <div class="grid gap-3 md:grid-cols-3">
        <UCard v-for="item in integrations.items" :key="item.name">
          <div class="flex items-center gap-2">
            <UIcon :name="item.icon" />
            <h3 class="fx-type-card-heading">
              {{ item.name }}
            </h3>
          </div>
          <p class="mt-2 fx-type-caption">
            {{ item.body }}
          </p>
          <UButton
            v-if="item.to"
            :to="item.to"
            :target="item.external ? '_blank' : undefined"
            :external="item.external"
            color="neutral"
            variant="ghost"
            size="xs"
            trailing-icon="i-lucide-arrow-up-right"
          >
            {{ item.cta }}
          </UButton>
        </UCard>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { MiseboxSolution } from '../../utils/miseboxSolutions'

defineProps<{
  integrations: MiseboxSolution['integrations']
}>()
</script>
