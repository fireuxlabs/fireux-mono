<template>
  <div class="mt-5" aria-label="Recipes preview">
    <template v-if="recipes.length">
      <div class="grid max-h-[24rem] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
        <article
          v-for="recipe in recipes"
          :key="recipe.id"
          class="rounded-xl border border-default bg-default p-3 shadow-sm"
        >
          <p class="text-sm font-semibold text-highlighted">{{ recipe.name }}</p>
          <div class="mt-2 flex flex-wrap gap-1.5">
            <UBadge color="neutral" variant="soft" size="sm">{{ recipe.yield }}</UBadge>
            <UBadge color="neutral" variant="outline" size="sm">
              {{ recipe.ingredientCount }} ingredients
            </UBadge>
          </div>
          <p class="mt-2 text-xs leading-5 text-muted">{{ recipe.method.join(' ') }}</p>
        </article>
      </div>
    </template>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      :title="error ? 'Recipes preview unavailable' : 'No recipes found'"
      :description="error
        ? 'The Deanos recipe records could not be loaded.'
        : 'This Kitchen does not have any recipes yet.'"
    />
  </div>
</template>

<script setup lang="ts">
import type { MiseboxProductDemo } from '~/composables/product-demo/useMiseboxProductDemo'

type ProductDemoRecipe =
  MiseboxProductDemo['console']['recipes'][number]

defineProps<{
  error: boolean
  recipes: ProductDemoRecipe[]
}>()
</script>
