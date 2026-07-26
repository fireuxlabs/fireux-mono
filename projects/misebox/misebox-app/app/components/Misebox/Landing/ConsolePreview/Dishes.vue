<template>
  <div class="mt-4" aria-label="Dishes preview">
    <nav
      class="mb-3 flex min-w-0 items-center gap-1 text-xs text-muted"
      aria-label="Dish preview breadcrumb"
    >
      <button
        v-if="dish"
        type="button"
        class="font-semibold transition-colors hover:text-highlighted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        @click="$emit('show-collection')"
      >
        Dishes
      </button>
      <span v-else class="font-semibold text-highlighted">Dishes</span>

      <template v-if="dish">
        <UIcon name="i-lucide-chevron-right" class="size-3.5 shrink-0" />
        <button
          v-if="page !== 'detail'"
          type="button"
          class="min-w-0 truncate font-semibold transition-colors hover:text-highlighted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          @click="$emit('show-detail')"
        >
          {{ dish.name }}
        </button>
        <span v-else class="min-w-0 truncate font-semibold text-highlighted">
          {{ dish.name }}
        </span>
      </template>

      <template v-if="dish && page !== 'detail'">
        <UIcon name="i-lucide-chevron-right" class="size-3.5 shrink-0" />
        <span class="truncate font-semibold text-highlighted">{{ pageLabel }}</span>
      </template>
    </nav>

    <MiseboxLandingConsolePreviewDishesCollection
      v-if="!dish"
      :dishes="dishes"
      :error="error"
      @select="$emit('select', $event)"
    />
    <MiseboxLandingConsolePreviewDishesDetail
      v-else-if="page === 'detail'"
      :dish="dish"
      @select-section="$emit('select-page', $event)"
    />
    <MiseboxLandingConsolePreviewDishesFinance
      v-else-if="page === 'finance'"
      :dish="dish"
    />
    <MiseboxLandingConsolePreviewDishesSpec
      v-else-if="page === 'spec'"
      :dish="dish"
    />
    <MiseboxLandingConsolePreviewDishesPrepItems
      v-else-if="page === 'prep'"
      :dish="dish"
    />
    <MiseboxLandingConsolePreviewDishesRecipes
      v-else-if="page === 'recipes'"
      :dish="dish"
    />
    <MiseboxLandingConsolePreviewDishesMise
      v-else
      :dish="dish"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DishChildPage, ProductDemoDish } from './Dishes/types'

const props = defineProps<{
  dishes: ProductDemoDish[]
  dish: ProductDemoDish | null
  page: DishChildPage
  error: boolean
}>()

defineEmits<{
  (event: 'select', dishId: string): void
  (event: 'select-page', page: Exclude<DishChildPage, 'detail'>): void
  (event: 'show-collection'): void
  (event: 'show-detail'): void
}>()

const pageLabels: Record<DishChildPage, string> = {
  detail: '',
  finance: 'Finance',
  spec: 'Spec',
  prep: 'Prep items',
  recipes: 'Recipes',
  mise: 'Mise en place',
}
const pageLabel = computed(() => pageLabels[props.page])
</script>
