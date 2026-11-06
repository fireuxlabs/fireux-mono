<template>
  <UCard>
    <div class="fx-card__chips">
      <UAvatar
        :src="model.card.imageUrl || undefined"
        icon="i-lucide-carrot"
        size="md"
      />

      <div class="min-w-0 flex-1 space-y-2">
        <div class="card__header">
          <div class="min-w-0">
            <div class="truncate">
              {{ model.title }}
            </div>
            <div v-if="model.subtitle" class="truncate">
              {{ model.subtitle }}
            </div>
          </div>

          <UBadge v-if="model.status" size="xs" variant="soft" color="neutral">
            {{ model.status }}
          </UBadge>
        </div>

        <div class="grid gap-2 sm:grid-cols-2">
          <div v-for="detail in model.details" :key="detail.label">
            <span>{{ detail.label }}:</span>
            {{ detail.value }}
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { IngredientProfile } from '../../composables/useIngredientInterface'

defineProps<{ model: IngredientProfile }>()
</script>
