<template>
  <UCard v-if="recipe">
    <div class="flex items-start gap-3">
      <UAvatar
        icon="i-lucide-book-copy"
        size="md"
      />

      <div class="min-w-0 flex-1 space-y-2">
        <div class="min-w-0">
          <div class="truncate text-base font-semibold">
            {{ recipe.name }}
          </div>
          <div
            v-if="recipe.source_language"
            class="text-xs text-dimmed"
          >
            Source language: {{ recipe.source_language }}
          </div>
        </div>

        <p
          v-if="recipe.description"
          class="text-sm text-dimmed"
        >
          {{ recipe.description }}
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Recipe } from '../../../../models/recipe.model'

defineProps<{
  recipe: Recipe | null
}>()
</script>
