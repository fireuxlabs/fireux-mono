<template>
  <EntityOperatorPanel
    entity-label="Kitchen"
    title="Kitchen console"
    description="Operators manage menus, recipes, ingredients, and kitchen work from the kitchen console."
    operator-label="Operator"
    :operator-user-pill="operatorUserPill"
    :can-edit="canEdit"
    :is-admin-edit="isAdminEdit"
    :edit-to="editTo"
    manage-label="Edit kitchen"
    :aligned="aligned"
    :not-aligned="notAligned"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  useUser,
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
const { currentUser, isAdmin } = useUser()
const canEdit = computed(() =>
  Boolean(isAdmin.value || (claimedBy.value && currentUser.value?.id === claimedBy.value))
)
const isAdminEdit = computed(() =>
  Boolean(
    isAdmin.value &&
      (!claimedBy.value || currentUser.value?.id !== claimedBy.value)
  )
)
const editLocator = computed(() =>
  String(props.kitchen?.slug || props.kitchen?.id || '').trim()
)
const editTo = computed(() =>
  editLocator.value
    ? `/kitchens/${encodeURIComponent(editLocator.value)}/edit`
    : ''
)
</script>
