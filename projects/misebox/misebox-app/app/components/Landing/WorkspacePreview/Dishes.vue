<template>
  <div class="mt-4" aria-label="Dishes preview">
    <nav
      class="mb-3 flex min-w-0 items-center gap-1"
      aria-label="Dish preview breadcrumb"
    >
      <button
        v-if="dish"
        type="button"
        class="transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        @click="$emit('show-collection')"
      >
        Dishes
      </button>
      <span v-else>Dishes</span>

      <template v-if="dish">
        <UIcon name="i-lucide-chevron-right" />
        <button
          v-if="page !== 'detail'"
          type="button"
          class="min-w-0 truncate transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          @click="$emit('show-detail')"
        >
          {{ dish.name }}
        </button>
        <span v-else class="min-w-0 truncate">
          {{ dish.name }}
        </span>
      </template>

      <template v-if="dish && page !== 'detail'">
        <UIcon name="i-lucide-chevron-right" />
        <span class="truncate">{{ pageLabel }}</span>
      </template>
    </nav>

    <LandingWorkspacePreviewDishesCollection
      v-if="!dish"
      :dishes="dishes"
      :error="error"
      @select="$emit('select', $event)"
    />
    <LandingWorkspacePreviewDishesDetailSections
      v-if="dish"
      :dish="dish"
      :selected="page"
      @select="$emit('select-page', $event)"
    />
    <LandingWorkspacePreviewDishesDetail
      v-if="dish && page === 'detail'"
      :dish="dish"
    />
    <LandingWorkspacePreviewDishesFinance
      v-else-if="dish && page === 'finance'"
      :dish="dish"
    />
    <LandingWorkspacePreviewDishesSpec
      v-else-if="dish && page === 'spec'"
      :dish="dish"
    />
    <LandingWorkspacePreviewDishesPrepItems
      v-else-if="dish && page === 'prep'"
      :dish="dish"
    />
    <LandingWorkspacePreviewDishesRecipes
      v-else-if="dish && page === 'recipes'"
      :dish="dish"
    />
    <LandingWorkspacePreviewDishesMise v-else-if="dish" :dish="dish" />
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
  (event: 'select-page', page: DishChildPage): void
  (event: 'show-collection'): void
  (event: 'show-detail'): void
}>()

const pageLabels: Record<DishChildPage, string> = {
  detail: '',
  finance: 'Finance',
  spec: 'Spec',
  prep: 'Prep items',
  recipes: 'Recipes',
}
const pageLabel = computed(() => pageLabels[props.page])
</script>
