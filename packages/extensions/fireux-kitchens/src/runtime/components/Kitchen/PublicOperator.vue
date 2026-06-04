<template>
  <EntityOperatorPanel
    entity-label="Kitchen"
    title="Kitchen console"
    description="The place owner or kitchen operator manages menus, recipes, ingredients, and kitchen work from the kitchen console."
    operator-label="Place owner"
    :operator-user-pill="operatorUserPill"
    :aligned="aligned"
    :not-aligned="notAligned"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  useUserFetch,
  useUserInterface,
} from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import type { KitchenSurface } from '../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

const props = defineProps<{
  kitchen?: KitchenSurface | null
}>()

const aligned = ['Identity', 'Recipe', 'Ingredient', 'Dish']
const notAligned = [
  'Menu',
  'Supplier',
  'Mise',
  'Order',
  'Team',
  'Station',
]

const claimedBy = computed(() => String(props.kitchen?.claimed_by ?? '').trim())
const { user: ownerUser } = useUserFetch(claimedBy)
const { pill } = useUserInterface()
const operatorUserPill = computed(() => pill(ownerUser.value))
</script>
