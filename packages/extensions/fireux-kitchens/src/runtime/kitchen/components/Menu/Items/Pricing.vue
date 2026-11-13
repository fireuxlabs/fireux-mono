<template>
  <UCard id="item-price-choices">
    <template #header><h2>Price & choices</h2></template>
    <form class="fx-card-body-stack" @submit.prevent="save">
      <UFormField
        v-if="!groups.some((group) => group.pricing === 'full')"
        :label="`Normal price (${currency})`"
        ><!-- @vue-generic {string | number, {}} -->
        <UInput
          v-model="price"
          type="number"
          min="0"
          step="0.01"
          :disabled="!canWrite || busy"
      /></UFormField>
      <KitchenMenuItemsPricingGroups
        v-model="groups"
        :disabled="!canWrite || busy"
        :currency="currency"
      />
      <FireDisclosurePanel title="Try the choices" :default-open="false">
        <template v-if="validatedGroups">
          <MenuItemChoices
            :groups="validatedGroups"
            v-model="previewChoices"
            :money="formatMoney"
            show-names
          />
          <p role="status">{{ previewPrice }}</p>
        </template>
        <p v-else>Complete the group names, choices and limits to preview.</p>
      </FireDisclosurePanel>
      <div class="fx-card__actions">
        <UButton
          type="submit"
          label="Save changes"
          :loading="busy"
          :disabled="!canWrite || busy"
        />
        <UButton
          label="Cancel changes"
          color="neutral"
          variant="ghost"
          :disabled="busy"
          @click="resetDraft"
        />
      </div>
      <p v-if="message" role="status">{{ message }}</p>
      <div v-if="error" role="alert">
        <p>{{ error }}</p>
        <FireCopyError :message="error" />
      </div>
    </form>
    <KitchenMenuItemsDeposit
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
import { useKitchenWorkspace } from '../../../composables/workspace/useKitchenWorkspace'
const workspace = useKitchenWorkspace()
const selectedKitchen = workspace.data
import { computed, ref, watch } from 'vue'
import { useKitchenItemContext } from '../../../item/composables/useKitchenItemContext'
import { useItemUpdate } from '../../../composables/item/useItemUpdate'
import { useItemEditorScope } from '../../../composables/item/useItemEditorScope'
import { readPlaceCurrencyCode } from 'fireux-places/runtime/place/utils/place-spine'
import type {
  ItemChoiceGroup,
  ItemChoiceSelection,
} from '../../../models/item-choice.model'
import {
  readItemChoiceGroups,
  normalizeItemChoiceGroups,
  priceItemChoices,
} from '../../../utils/item-choices'
import { normalizeItemPricingPatch } from '../../../utils/item-pricing'
const {
  item: dish,
  itemId: dishId,
  kitchenId,
  canWrite,
} = useKitchenItemContext()
const currency = computed(() => readPlaceCurrencyCode(selectedKitchen.value))
const price = ref<string | number>('')
const groups = ref<ItemChoiceGroup[]>([])
const previewChoices = ref<ItemChoiceSelection>({})
const validatedGroups = computed(() => {
  try {
    return normalizeItemChoiceGroups(groups.value)
  } catch {
    return null
  }
})
const formatMoney = (value: number) =>
  new Intl.NumberFormat('en', {
    style: 'currency',
    currency: currency.value,
  }).format(value)
const previewPrice = computed(() => {
  try {
    return formatMoney(
      priceItemChoices(
        Number(price.value || 0),
        validatedGroups.value || [],
        previewChoices.value
      ).unitMinor / 100
    )
  } catch (error) {
    return error instanceof Error ? error.message : 'Review choices.'
  }
})
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
    dish.value?.choice_groups,
  ])
)
function resetDraft() {
  price.value = dish.value?.price ?? ''
  groups.value = dish.value ? readItemChoiceGroups(dish.value) : []
  previewChoices.value = {}
}
watch(sourceKey, resetDraft, { immediate: true })
const captureIntent = useItemEditorScope([kitchenId, dishId, canWrite], () => {
  busy.value = false
  error.value = ''
  message.value = ''
})
const { updateItem } = useItemUpdate([kitchenId, dishId, canWrite])
async function updateDeposit(value: string) {
  const current = captureIntent()
  const changes = normalizeItemPricingPatch({ bottle_deposit: Number(value) })
  await updateItem(dishId.value, changes, {
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
    const changes = normalizeItemPricingPatch({
      price: groups.value.some((group) => group.pricing === 'full')
        ? 0
        : amount(price.value),
      choice_groups: normalizeItemChoiceGroups(groups.value),
      price_options: [],
      add_ons: [],
    })
    await updateItem(dishId.value, changes, {
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
