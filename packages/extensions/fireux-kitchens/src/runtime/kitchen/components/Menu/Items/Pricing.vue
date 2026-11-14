<template>
  <UCard id="item-price-choices">
    <template #header><h2>Price & choices</h2></template>
    <UAlert
      v-if="offerError"
      title="Price & choices unavailable"
      description="The saved selling configuration could not be read. Item details remain available."
      color="error"
      variant="soft"
    />
    <form v-else-if="offer" class="fx-card-body-stack" @submit.prevent="save">
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
    <FireDisclosurePanel
      v-if="offer && !offerError"
      title="Bottle deposit"
      :default-open="false"
    >
      <KitchenMenuItemsDeposit
        :value="offer.bottle_deposit"
        :currency="currency"
        :disabled="!canWrite || busy"
        :capture-intent="captureIntent"
        :update="updateDeposit"
      />
    </FireDisclosurePanel>
  </UCard>
</template>
<script setup lang="ts">
import { useKitchenWorkspace } from '../../../composables/workspace/useKitchenWorkspace'
const workspace = useKitchenWorkspace()
const selectedKitchen = workspace.data
import { computed, ref, watch } from 'vue'
import { useKitchenItemContext } from '../../../item/composables/useKitchenItemContext'
import { useItemOfferUpdate } from '../../../item/composables/useItemOfferUpdate'
import { useItemEditorScope } from '../../../composables/item/useItemEditorScope'
import { readPlaceCurrencyCode } from 'fireux-places/runtime/place/utils/place-spine'
import type { ItemChoiceGroup, ItemChoiceSelection } from '../../../item/offer'
import {
  normalizeItemChoiceGroups,
  priceItemChoices,
} from '../../../utils/item-choices'
import { normalizeItemPricingPatch } from '../../../utils/item-pricing'
const { offer, offerError, itemId, kitchenId, canWrite } =
  useKitchenItemContext()
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
  if (
    String(price.value).trim() === '' &&
    !validatedGroups.value?.some((group) => group.pricing === 'full')
  )
    return 'Set a normal price to preview.'
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
  JSON.stringify([kitchenId.value, itemId.value, offer.value, offerError.value])
)
const baseline = ref('')
const draftKey = computed(() => JSON.stringify([price.value, groups.value]))
const dirty = computed(() => draftKey.value !== baseline.value)
function resetDraft() {
  price.value = offer.value?.price ?? ''
  groups.value = normalizeItemChoiceGroups(offer.value?.choice_groups || [])
  previewChoices.value = {}
  baseline.value = draftKey.value
}
watch([kitchenId, itemId], resetDraft, { immediate: true })
watch(sourceKey, () => {
  if (!dirty.value && !busy.value) resetDraft()
})
const captureIntent = useItemEditorScope([kitchenId, itemId, canWrite], () => {
  busy.value = false
  error.value = ''
  message.value = ''
})
const { updateOffer } = useItemOfferUpdate([kitchenId, itemId, canWrite])
async function updateDeposit(value: string) {
  const current = captureIntent()
  if (!canWrite.value || !offer.value || offerError.value || busy.value)
    throw new Error('Price & choices are read-only.')
  const changes = normalizeItemPricingPatch({ bottle_deposit: Number(value) })
  await updateOffer(itemId.value, changes, {
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
  if (!canWrite.value || !offer.value || offerError.value || busy.value) return
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
    })
    await updateOffer(itemId.value, changes, {
      kitchenId: kitchenId.value,
      isCurrent: current,
    })
    if (current()) {
      price.value = changes.price ?? price.value
      baseline.value = draftKey.value
      message.value = 'Pricing saved.'
    }
  } catch (cause) {
    if (current())
      error.value =
        cause instanceof Error ? cause.message : 'Pricing could not be saved.'
  } finally {
    if (current()) busy.value = false
  }
}
</script>
