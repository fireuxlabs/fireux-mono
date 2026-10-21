<template>
  <div class="space-y-6">
    <div
      class="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-elevated/60"
    >
      <img
        v-if="ingredient.image_url && !imageFailed"
        :src="ingredient.image_url"
        :alt="ingredient.name || 'Ingredient'"
        class="size-full object-contain"
        @error="imageFailed = true"
      />
      <div v-else class="flex flex-col items-center gap-4 text-dimmed">
        <UIcon
          :name="category.icon"
          class="ingredient-preview-icon opacity-40"
          aria-hidden="true"
        />
        <span class="text-sm">No image yet</span>
      </div>
    </div>
    <div class="space-y-3">
      <h1
        v-if="showHeading"
        class="text-2xl font-semibold tracking-tight text-highlighted"
      >
        {{ ingredient.name || 'Ingredient unavailable' }}
      </h1>
      <UBadge color="neutral" variant="soft" :icon="category.icon">{{
        category.label
      }}</UBadge>
      <div v-if="ingredient.aliases?.length" class="space-y-2 pt-2">
        <h2 class="text-xs font-medium text-muted">Also known as</h2>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="alias in ingredient.aliases"
            :key="alias"
            class="rounded-md border border-default px-2.5 py-1 text-sm text-toned"
            >{{ alias }}</span
          >
        </div>
      </div>
    </div>
    <UButton
      :to="`/ingredients/${encodeURIComponent(ingredient.ingredient_id || ingredient.id)}`"
      label="View in ingredient directory"
      icon="i-lucide-arrow-up-right"
      color="neutral"
      variant="outline"
      block
    />
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { IngredientInterfaceItem } from '../../../../ingredient/composables/useIngredientInterface'
import { INGREDIENT_CATEGORY_OPTIONS } from '../../../../ingredient/models/ingredient-taxonomy'
const props = withDefaults(
  defineProps<{ ingredient: IngredientInterfaceItem; showHeading?: boolean }>(),
  { showHeading: true }
)
const imageFailed = ref(false)
const category = computed(
  () =>
    INGREDIENT_CATEGORY_OPTIONS.find(
      (item) => item.value === props.ingredient.category
    ) || { label: 'Uncategorised', icon: 'i-lucide-carrot' }
)
watch(
  () => [props.ingredient.id, props.ingredient.image_url],
  () => {
    imageFailed.value = false
  }
)
</script>
<style scoped>
.ingredient-preview-icon {
  width: 4rem;
  height: 4rem;
}
</style>
