<template>
  <div aria-label="Dishes preview">
    <nav aria-label="Dish preview breadcrumb">
      <UButton v-if="dish" type="button" @click="$emit('show-collection')">
        Dishes
      </UButton>
      <span v-else>Dishes</span>

      <template v-if="dish">
        <UIcon name="i-lucide-chevron-right" />
        <UButton
          v-if="page !== 'detail'"
          type="button"
          @click="$emit('show-detail')"
        >
          {{ dish.name }}
        </UButton>
        <span v-else>
          {{ dish.name }}
        </span>
      </template>

      <template v-if="dish && page !== 'detail'">
        <UIcon name="i-lucide-chevron-right" />
        <span>{{ pageLabel }}</span>
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
import type { DishChildPage, ProductDemoDish } from '~/types/product-demo'

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
