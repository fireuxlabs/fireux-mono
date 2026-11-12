<template>
  <div aria-label="Items preview">
    <nav aria-label="Item preview breadcrumb">
      <UButton v-if="dish" type="button" @click="$emit('show-collection')">
        Items
      </UButton>
      <span v-else>Items</span>

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

    <LandingWorkspacePreviewItemsCollection
      v-if="!dish"
      :dishes="dishes"
      :error="error"
      @select="$emit('select', $event)"
    />
    <LandingWorkspacePreviewItemsDetailSections
      v-if="dish"
      :dish="dish"
      :selected="page"
      @select="$emit('select-page', $event)"
    />
    <LandingWorkspacePreviewItemsDetail
      v-if="dish && page === 'detail'"
      :dish="dish"
    />
    <LandingWorkspacePreviewItemsFinance
      v-else-if="dish && page === 'finance'"
      :dish="dish"
    />
    <LandingWorkspacePreviewItemsSpec
      v-else-if="dish && page === 'spec'"
      :dish="dish"
    />
    <LandingWorkspacePreviewItemsPrepItems
      v-else-if="dish && page === 'prep'"
      :dish="dish"
    />
    <LandingWorkspacePreviewItemsRecipes
      v-else-if="dish && page === 'recipes'"
      :dish="dish"
    />
    <LandingWorkspacePreviewItemsMise v-else-if="dish" :dish="dish" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ItemChildPage, ProductDemoItem } from '~/types/product-demo'

const props = defineProps<{
  dishes: ProductDemoItem[]
  dish: ProductDemoItem | null
  page: ItemChildPage
  error: boolean
}>()

defineEmits<{
  (event: 'select', dishId: string): void
  (event: 'select-page', page: ItemChildPage): void
  (event: 'show-collection'): void
  (event: 'show-detail'): void
}>()

const pageLabels: Record<ItemChildPage, string> = {
  detail: '',
  finance: 'Finance',
  spec: 'Spec',
  prep: 'Prep items',
  recipes: 'Recipes',
}
const pageLabel = computed(() => pageLabels[props.page])
</script>
