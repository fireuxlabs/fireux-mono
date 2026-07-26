<template>
  <UCard>
    <div class="flex items-start gap-3">
      <UAvatar
        :src="model.card.imageUrl || undefined"
        icon="i-lucide-carrot"
        size="md"
      />

      <div class="min-w-0 flex-1 space-y-2">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="truncate text-base font-semibold">{{ model.title }}</div>
            <div
              v-if="model.subtitle"
              class="truncate text-xs text-dimmed"
            >
              {{ model.subtitle }}
            </div>
          </div>

          <UBadge
            v-if="model.status"
            size="xs"
            variant="soft"
            color="neutral"
          >
            {{ model.status }}
          </UBadge>
        </div>

        <div class="grid gap-2 text-xs text-dimmed sm:grid-cols-2">
          <div
            v-for="detail in model.details"
            :key="detail.label"
          >
            <span class="font-medium text-toned">{{ detail.label }}:</span>
            {{ detail.value }}
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { IngredientProfile } from '../../../composables/fireux/firestore/ingredient/utils/view/useIngredientInterface'

defineProps<{ model: IngredientProfile }>()
</script>
