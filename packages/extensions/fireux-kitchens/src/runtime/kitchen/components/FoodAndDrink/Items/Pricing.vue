<template>
  <UCard>
    <template #header
      ><h2 class="font-semibold">Price, options and extras</h2></template
    >
    <form class="space-y-5" @submit.prevent="save">
      <p class="text-sm text-muted">
        Normal prices apply wherever this dish appears. Promotions can override
        the item price.
      </p>
      <UFormField :label="`Normal price (${currency})`"
        ><!-- @vue-generic {string | number, {}} -->
        <UInput
          v-model="price"
          type="number"
          min="0"
          step="0.01"
          :disabled="!canWrite || busy"
      /></UFormField>
      <KitchenFoodAndDrinkItemsPricingOptions
        v-model="options"
        :disabled="!canWrite || busy"
      />
      <KitchenFoodAndDrinkItemsPricingExtras
        v-model="extras"
        :disabled="!canWrite || busy"
      />
      <UButton
        type="submit"
        label="Save pricing"
        :loading="busy"
        :disabled="!canWrite || busy"
      />
      <p v-if="message" role="status">{{ message }}</p>
      <div v-if="error" role="alert">
        <p>{{ error }}</p>
        <MoleculesCopyError :message="error" />
      </div>
    </form>
    <KitchenFoodAndDrinkItemsDeposit
      v-if="dish?.item_kind === 'drink'"
      :value="dish.bottle_deposit"
      :currency="currency"
      :disabled="!canWrite || busy"
      :capture-intent="captureIntent"
      :update="updateDeposit"
    />
  </UCard>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useKitchenWorkspaceDish } from '../../../composables/workspace/dishes/useKitchenWorkspaceDish'
import { useDishUpdate } from '../../../composables/dish/useDishUpdate'
import { useDishEditorScope } from '../../../composables/dish/useDishEditorScope'
import { readPlaceCurrencyCode } from 'fireux-places/runtime/place/utils/place-spine'
import { normalizeDishPricingPatch } from '../../../utils/dish-pricing'
const { dish, dishId, kitchenId, canWrite, selectedKitchen } =
  useKitchenWorkspaceDish()
const currency = computed(() => readPlaceCurrencyCode(selectedKitchen.value))
const price = ref<string | number>('')
const options = ref<
  Array<{
    label: string
    quantity: number
    unit: string
    price: string | number
  }>
>([])
const extras = ref<
  Array<{ id: string; label: string; price: string | number }>
>([])
const busy = ref(false),
  error = ref(''),
  message = ref('')
const sourceKey = computed(() =>
  JSON.stringify([
    kitchenId.value,
    dishId.value,
    dish.value?.price,
    dish.value?.price_options,
    dish.value?.add_ons,
  ])
)
watch(
  sourceKey,
  () => {
    price.value = dish.value?.price ?? ''
    options.value = (dish.value?.price_options || []).map((option) => ({
      ...option,
    }))
    extras.value = (dish.value?.add_ons || []).map((extra) => ({ ...extra }))
  },
  { immediate: true }
)
const captureIntent = useDishEditorScope([kitchenId, dishId, canWrite], () => {
  busy.value = false
  error.value = ''
  message.value = ''
})
const { updateDish } = useDishUpdate([kitchenId, dishId, canWrite])
async function updateDeposit(value: string) {
  const current = captureIntent()
  const changes = normalizeDishPricingPatch({ bottle_deposit: Number(value) })
  await updateDish(dishId.value, changes, {
    kitchenId: kitchenId.value,
    isCurrent: current,
  })
}
const amount = (value: string | number) => {
  if (String(value).trim() === '' || !Number.isFinite(Number(value)))
    throw new Error('Enter a valid price.')
  return Number(value)
}
async function save() {
  if (!canWrite.value || busy.value) return
  const current = captureIntent()
  busy.value = true
  error.value = ''
  message.value = ''
  try {
    const changes = normalizeDishPricingPatch({
      price: amount(price.value),
      price_options: options.value.map((option) => ({
        ...option,
        price: amount(option.price),
      })),
      add_ons: extras.value.map((extra) => ({
        ...extra,
        price: amount(extra.price),
      })),
    })
    await updateDish(dishId.value, changes, {
      kitchenId: kitchenId.value,
      isCurrent: current,
    })
    if (current()) message.value = 'Pricing saved.'
  } catch (cause) {
    if (current())
      error.value =
        cause instanceof Error ? cause.message : 'Pricing could not be saved.'
  } finally {
    if (current()) busy.value = false
  }
}
</script>
