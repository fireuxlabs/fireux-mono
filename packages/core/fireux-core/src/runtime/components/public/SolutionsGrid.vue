<template>
  <div class="fx-solutions-grid">
    <UCard
      v-for="solution in solutions"
      :key="solution.slug"
      variant="subtle"
      class="fx-solutions-grid__card"
    >
      <template #header>
        <div class="fx-solutions-grid__header">
          <UIcon
            :name="solution.icon || 'i-lucide-lightbulb'"
            class="fx-solutions-grid__icon"
          />
          <div class="fx-solutions-grid__heading">
            <h2 class="fx-solutions-grid__title">
              {{ solution.title }}
            </h2>
            <UBadge
              :label="solution.owner?.name || `/solutions/${solution.slug}`"
              color="neutral"
              variant="soft"
              size="sm"
            />
          </div>
        </div>
      </template>

      <p class="fx-solutions-grid__description">
        {{ solution.description }}
      </p>

      <UButton
        :to="solution.to || `/solutions/${solution.slug}`"
        :target="solution.external ? '_blank' : undefined"
        :aria-label="`View ${solution.title}`"
        color="neutral"
        variant="soft"
        icon="i-lucide-arrow-right"
        class="fx-solutions-grid__action"
      />
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { FireuxMetaSolution } from '../../models/system/meta-content.model'

defineProps<{
  solutions: FireuxMetaSolution[]
}>()
</script>
