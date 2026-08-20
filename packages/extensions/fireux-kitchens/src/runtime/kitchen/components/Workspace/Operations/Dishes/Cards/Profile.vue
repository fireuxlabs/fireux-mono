<template>
  <UCard v-if="dish">
    <div class="space-y-6">
      <div class="flex items-start gap-3">
        <UAvatar
          :src="dish.image || undefined"
          :alt="dish.name || 'Dish'"
          icon="i-lucide-utensils"
          size="lg"
          class="shrink-0"
        />

        <div class="min-w-0 space-y-2">
          <h2 class="text-2xl font-semibold text-highlighted">
            {{ dish.name }}
          </h2>
          <p
            v-if="dish.description"
            class="max-w-2xl text-sm text-dimmed"
          >
            {{ dish.description }}
          </p>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Dish } from '../../../../../models/dish.model.ts'

defineProps<{
  dish: Dish | null
}>()
</script>
