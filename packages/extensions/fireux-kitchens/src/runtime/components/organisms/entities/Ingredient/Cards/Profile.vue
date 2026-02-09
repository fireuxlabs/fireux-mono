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
            <div
              v-if="model.prop"
              class="truncate text-xs text-dimmed"
            >
              {{ model.prop }}
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

        <div class="grid gap-1 text-xs text-dimmed sm:grid-cols-2">
          <div>Category: {{ model.category || '—' }}</div>
          <div>Unit: {{ model.unit || '—' }}</div>
          <div>Status: {{ model.status || '—' }}</div>
        </div>

        <div v-if="model.tags.length" class="flex flex-wrap items-center gap-1">
          <UBadge
            v-for="tag in model.tags"
            :key="tag"
            variant="soft"
            color="neutral"
            size="xs"
          >
            {{ tag }}
          </UBadge>
        </div>

        <div v-if="model.allergens.length" class="text-xs text-dimmed">
          Allergens: {{ model.allergens.join(', ') }}
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { IngredientProfile } from '../../../../../composables/fireux/firestore/objects/ingredient/utils/view/useIngredientInterface'

defineProps<{ model: IngredientProfile }>()
</script>
