<template>
  <UAlert
    v-if="pending"
    color="neutral"
    variant="soft"
    title="Loading ingredients"
    description="Fetching ingredients for the selected kitchen."
  />

  <OrganismsIngredientCollectionManager
    v-else
    :collection="ingredients"
    title="Ingredients"
    description="Browse ingredients for the selected kitchen."
    :link="false"
  />
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
