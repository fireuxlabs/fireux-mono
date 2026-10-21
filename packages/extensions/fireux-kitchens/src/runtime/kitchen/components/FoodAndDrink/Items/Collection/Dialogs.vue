<template>
  <UModal
    :open="Boolean(createKind)"
    :title="createKind === 'drink' ? 'Add drink' : 'Add dish'"
    @update:open="closeCreate"
  >
    <template #body>
      <KitchenFoodAndDrinkItemsCreate
        v-if="createKind"
        :key="createKind"
        :item-kind="createKind"
        @created="createKind = null"
      />
    </template>
  </UModal>
  <UModal
    v-model:open="organise"
    title="Organise categories"
    :ui="{ content: 'sm:max-w-3xl' }"
  >
    <template #body><KitchenFoodAndDrinkItemsCategories /></template>
  </UModal>
  <USlideover
    v-model:open="aiOpen"
    title="Kitchen AI"
    :description="catalogue.title"
    :ui="{ content: 'sm:max-w-xl' }"
  >
    <template #body
      ><WorkspaceKitchenAICapability
        :capability="catalogue.itemKind === 'drink' ? 'drinks' : 'dishes'"
        :suggestions="suggestions"
        :action-targets="actionTargets"
    /></template>
  </USlideover>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from '#imports'
import { useKitchenDishesContext } from '../../../../composables/workspace/dishes/useKitchenDishesContext'
import {
  buildMissingDishImageSuggestions,
  buildMissingDrinkImageSuggestions,
} from '../../../../models/capability-suggestions'

const { catalogue, dishes, kitchenId, outcome, readOnly } =
  useKitchenDishesContext()
const createKind = ref<'food' | 'drink' | null>(null)
const organise = ref(false)
const aiOpen = ref(false)
const route = useRoute()
const router = useRouter()

function openCreate(kind: 'food' | 'drink') {
  if (!readOnly.value && ['ready', 'empty'].includes(outcome.value))
    createKind.value = kind
}
function closeCreate(open: boolean) {
  if (!open) createKind.value = null
}
function openCategories() {
  organise.value = true
}
function openAI() {
  aiOpen.value = true
}

watch(kitchenId, () => {
  createKind.value = null
  organise.value = false
  aiOpen.value = false
})
watch(
  () => [route.query.create, outcome.value, readOnly.value],
  () => {
    const kind = route.query.create
    if (kind !== 'food' && kind !== 'drink') return
    if (readOnly.value || !['ready', 'empty'].includes(outcome.value)) return
    openCreate(kind)
    void router.replace({ query: { ...route.query, create: undefined } })
  },
  { immediate: true }
)

const suggestions = computed(() =>
  catalogue.itemKind === 'drink'
    ? buildMissingDrinkImageSuggestions(dishes.value)
    : buildMissingDishImageSuggestions(
        dishes.value.filter((dish) => dish.item_kind === 'food')
      )
)
const actionTargets = computed(() =>
  dishes.value.flatMap((dish) =>
    ['update', 'delete'].map((action) => ({
      actionId: `kitchen.${dish.item_kind === 'drink' ? 'drinks' : 'dishes'}.${action}-${dish.item_kind === 'drink' ? 'drink' : 'dish'}`,
      targetId: dish.id,
      label: dish.name,
    }))
  )
)
defineExpose({ openCreate, openCategories, openAI })
</script>
