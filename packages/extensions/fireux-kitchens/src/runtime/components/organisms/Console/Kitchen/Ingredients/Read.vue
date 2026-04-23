<template>
  <ConsoleKitchenChildLayout
    description="Selected kitchen and ingredient collection in scope."
    item-label="Ingredients"
    :item-count="countLabel"
    :pending="pending"
    pending-title="Loading ingredients"
    pending-description="Fetching ingredients for the selected kitchen."
  >
    <OrganismsIngredientCollectionManager
      :collection="ingredients"
      title="Ingredients"
      description="Browse ingredients for the selected kitchen."
      :link="false"
    />
  </ConsoleKitchenChildLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { IngredientInterfaceItem } from '../../../../../composables/fireux/firestore/ingredient/utils/view/useIngredientInterface'

const props = defineProps<{
  ingredients: IngredientInterfaceItem[]
  pending: boolean
}>()

const countLabel = computed(() => String(props.ingredients.length))
</script>
