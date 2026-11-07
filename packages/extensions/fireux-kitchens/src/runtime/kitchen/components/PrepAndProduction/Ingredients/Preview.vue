<template>
  <div>
    <div>
      <img
        v-if="ingredient.image_url && !imageFailed"
        :src="ingredient.image_url"
        :alt="ingredient.name || 'Ingredient'"
        @error="imageFailed = true"
      />
      <div v-else>
        <UIcon
          :name="category.icon"
          class="ingredient-preview-icon"
          aria-hidden="true"
        />
        <span>No image yet</span>
      </div>
    </div>
    <div>
      <h1 v-if="showHeading">
        {{ ingredient.name || 'Ingredient unavailable' }}
      </h1>
      <UBadge color="neutral" variant="soft" :icon="category.icon">{{
        category.label
      }}</UBadge>
      <div v-if="ingredient.aliases?.length">
        <h2>Also known as</h2>
        <div>
          <span v-for="alias in ingredient.aliases" :key="alias">{{
            alias
          }}</span>
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
