<template>
  <OrganismsIngredientCollectionManager
    :collection="ingredients"
    title="Ingredients"
    description="Browse ingredients for the selected kitchen."
    :link="false"
  />
</template>

<script setup lang="ts">
import type { IngredientInterfaceItem } from '../../../../../composables/fireux/firestore/ingredient/utils/view/useIngredientInterface'

defineProps<{
  ingredients: IngredientInterfaceItem[]
}>()
</script>
