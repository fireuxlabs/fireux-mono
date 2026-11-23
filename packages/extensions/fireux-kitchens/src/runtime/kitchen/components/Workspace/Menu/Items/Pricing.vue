<template>
  <div id="item-price-choices" class="fx-card-body-stack">
    <UAlert
      v-if="pricingError"
      title="Price & choices unavailable"
      :description="typeof pricingError === 'string' ? pricingError : 'The saved selling configuration could not be read. Replace it with valid pricing.'"
      color="error"
      variant="soft"
    />
    <form v-if="item" class="fx-card-body-stack" @submit.prevent="save">
      <p class="fx-type-caption">
        Menus use these defaults unless the item’s placement sets its own price
        or choices.
      </p>
      <UFormField label="Currency code">
        <UInput
          v-model="currency"
          maxlength="3"
          placeholder="CHF"
          :disabled="!canWrite || busy"
        />
      </UFormField>
      <UFormField
        v-if="!groups.some((group) => group.pricing === 'full')"
        :label="currency ? `Default price (${currency})` : 'Default price'"
        ><!-- @vue-generic {string | number, {}} -->
        <UInput
          v-model="price"
          type="number"
          min="0"
          step="0.01"
          :disabled="!canWrite || busy"
      /></UFormField>
      <KitchenWorkspaceMenuItemsPricingGroups
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
          label="Save pricing"
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
  </div>
</template>
<script setup lang="ts">
import { computed, ref, toRefs, watch } from 'vue'
import { useItemActions } from '../../../../composables/items/useItemActions'
import { useItemEditorScope } from '../../../../composables/items/useItemEditorScope'
import type {
  Item,
  ItemChoiceGroup,
  ItemChoiceSelection,
} from '../../../../models/item.model'
import {
  normalizeItemChoiceGroups,
  priceItemChoices,
} from '../../../../utils/item-choices'
const { item, pricingError, itemId, kitchenId, canWrite } =
  toRefs(defineProps<{
    item: Item | null
    pricingError: unknown
    itemId: string
    kitchenId: string
    canWrite: boolean
  }>())
const currency = ref('')
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
const currencyCode = computed(() => currency.value.trim().toUpperCase())
const formatMoney = (value: number) =>
  new Intl.NumberFormat(
    'en',
    /^[A-Z]{3}$/.test(currencyCode.value)
      ? { style: 'currency', currency: currencyCode.value }
      : { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  ).format(value)
const previewPrice = computed(() => {
  if (
    String(price.value).trim() === '' &&
    !validatedGroups.value?.some((group) => group.pricing === 'full')
  )
    return 'Set a normal price to preview.'
  try {
    return formatMoney(
      priceItemChoices(
        String(price.value).trim() === '' ? undefined : Number(price.value),
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
    itemId.value,
    item.value,
    pricingError.value,
  ])
)
const baseline = ref('')
const draftKey = computed(() =>
  JSON.stringify([price.value, currency.value, groups.value])
)
const dirty = computed(() => draftKey.value !== baseline.value)
function resetDraft() {
  price.value = item.value?.price ?? ''
  currency.value = item.value?.currency_code ?? ''
  groups.value = normalizeItemChoiceGroups(item.value?.choice_groups || [])
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
const { updateItem } = useItemActions([kitchenId, itemId, canWrite])
const amount = (value: string | number) => {
  if (String(value).trim() === '' || !Number.isFinite(Number(value)))
    throw new Error('Enter a valid price.')
  return Number(value)
}
async function save() {
  if (!canWrite.value || !item.value || busy.value) return
  const current = captureIntent()
  busy.value = true
  error.value = ''
  message.value = ''
  try {
    const fullPrices = groups.value.some((group) => group.pricing === 'full')
    const changes = {
      price:
        fullPrices || String(price.value).trim() === ''
          ? null
          : amount(price.value),
      currency_code: currencyCode.value,
      choice_groups: normalizeItemChoiceGroups(groups.value),
    }
    if (pricingError.value && changes.price === null && !fullPrices)
      throw new Error('Enter a valid price or full-price choices to repair this Item.')
    await updateItem(itemId.value, changes, {
      kitchenId: kitchenId.value,
      isCurrent: current,
    })
    if (current()) {
      price.value = changes.price ?? ''
      currency.value = changes.currency_code
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
