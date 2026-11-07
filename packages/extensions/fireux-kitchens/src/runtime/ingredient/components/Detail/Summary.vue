<template>
  <UCard>
    <div class="fx-card__chips">
      <UAvatar
        :src="model.card.imageUrl || undefined"
        icon="i-lucide-carrot"
        size="md"
      />

      <div>
        <div class="card__header">
          <div>
            <div class="fx-truncate">
              {{ model.title }}
            </div>
            <div v-if="model.subtitle" class="fx-truncate">
              {{ model.subtitle }}
            </div>
          </div>

          <UBadge v-if="model.status" size="xs" variant="soft" color="neutral">
            {{ model.status }}
          </UBadge>
        </div>

        <div>
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
