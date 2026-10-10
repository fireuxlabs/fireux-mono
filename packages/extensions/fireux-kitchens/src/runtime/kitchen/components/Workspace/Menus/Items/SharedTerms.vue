<template>
  <div class="w-full grid gap-3">
    <p v-if="outcome === 'pending'" role="status" class="text-sm text-muted">
      Loading shared prices…
    </p>
    <MoleculesStateCard
      v-else-if="outcome === 'error'"
      state="error"
      title="Shared prices unavailable"
      description="Prices could not be loaded. Try again shortly."
    />
    <UAlert
      v-else-if="!record"
      title="Shared prices unavailable"
      description="Sign in with Kitchen editing access to view these terms."
      color="neutral"
    />
    <div v-if="editorRecord" v-show="outcome === 'ready'" class="grid gap-3">
      <p class="text-sm text-muted">
        Prices and extras are shared with every menu using this item.
      </p>
      <UAlert
        v-if="editorRecord.status !== 'active'"
        title="Shared item archived"
        color="neutral"
      />
      <div v-if="implicit" class="max-w-sm">
        <MoleculesFormsEditableSimpleField
          :key="`${kitchenId}:${sellableId}`"
          :label="`Price (${editorRecord.terms.currency})`"
          type="number"
          :value="editorRecord.terms.prices[implicit.id]"
          :disabled="!canEdit"
          disabled-message="Shared prices cannot be edited right now."
          :validation-function="validatePrice"
          :capture-intent="captureEditorIntent"
          :update="saveImplicitPrice"
        />
      </div>
      <div v-else class="flex flex-wrap gap-2" aria-label="Shared prices">
        <UBadge
          v-for="variant in editorRecord.variants"
          :key="variant.id"
          color="neutral"
          variant="soft"
        >
          {{ variant.label }} ·
          {{ formatPrice(editorRecord.terms.prices[variant.id]!) }}
        </UBadge>
      </div>
      <MoleculesDisclosurePanel title="Prices & extras" size="sm">
        <Options
          :key="`${kitchenId}:${sellableId}`"
          :row="sharedRow"
          :can-write="canEdit"
          :capture-intent="captureEditorIntent"
          shared
          :update-price-options="savePrices"
          :update-add-ons="saveAddOns"
        />
      </MoleculesDisclosurePanel>
      <MoleculesCopyError v-if="saveError" :message="saveError" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import { useRoute } from '#imports'
import { useMenuEditorScope } from '../../../../../menu/composables/useMenuEditorScope'
import type { MenuSectionItemRow } from '../../../../composables/workspace/menus/useKitchenWorkspaceMenuSection'
import { useKitchenSellableTerms } from '../../../../composables/workspace/menus/useKitchenSellableTerms'
import Options from './Options.vue'
const props = defineProps<{
  row: MenuSectionItemRow
  kitchenId: string
  sellableId: string
  canWrite: boolean
}>()
const { scope, record, outcome, canEdit, saveError, update, captureIntent } =
  useKitchenSellableTerms({
    kitchenId: () => props.kitchenId,
    sellableId: () => props.sellableId,
    canWrite: () => props.canWrite,
  })
const editorRecord = shallowRef(record.value)
let editorScope = scope.value
watch(
  [scope, record, outcome],
  ([nextScope, nextRecord, nextOutcome]) => {
    if (
      nextScope !== editorScope ||
      nextOutcome === 'idle' ||
      nextOutcome === 'missing'
    )
      editorRecord.value = null
    editorScope = nextScope
    if (nextOutcome === 'ready' && nextRecord) editorRecord.value = nextRecord
  },
  { immediate: true, flush: 'sync' }
)
const route = useRoute()
const captureRoute = useMenuEditorScope([
  () => route.fullPath,
  () => props.row.id,
  () => props.row.item.kitchen_id,
  () => props.row.item.menu_id,
  () => props.row.item.section_id,
  () => props.kitchenId,
  () => props.sellableId,
  () => props.canWrite,
])
const captureEditorIntent = () => {
  const ownerCurrent = captureIntent()
  const routeCurrent = captureRoute()
  return () => ownerCurrent() && routeCurrent()
}
const implicit = computed(() =>
  editorRecord.value?.variants.length === 1 &&
  editorRecord.value.variants[0]?.implicit
    ? editorRecord.value.variants[0]
    : null
)
const sharedRow = computed<MenuSectionItemRow>(() => ({
  ...props.row,
  price:
    implicit.value && editorRecord.value
      ? editorRecord.value.terms.prices[implicit.value.id]!
      : 0,
  priceOptions: implicit.value
    ? []
    : (editorRecord.value?.variants ?? []).map((variant) => ({
        label: variant.label,
        quantity: variant.quantity,
        unit: variant.unit,
        price: editorRecord.value!.terms.prices[variant.id]!,
      })),
  addOns: editorRecord.value?.terms.add_ons ?? [],
}))
const validatePrice = (value: string) => ({
  isValid:
    value.trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= 0,
  message: 'Enter a price of zero or more.',
})
const formatPrice = (value: number) =>
  new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: editorRecord.value!.terms.currency,
  }).format(value)
async function saveImplicitPrice(
  value: string,
  isSurfaceCurrent?: () => boolean
) {
  if (!record.value || !implicit.value)
    throw new Error('Shared prices cannot be edited right now.')
  if (!validatePrice(value).isValid)
    throw new Error('Enter a price of zero or more.')
  await update(
    {
      ...record.value.terms,
      prices: {
        ...record.value.terms.prices,
        [implicit.value.id]: Number(value),
      },
    },
    isSurfaceCurrent
  )
}
async function savePrices(
  options: MenuSectionItemRow['priceOptions'],
  _title?: string,
  isSurfaceCurrent?: () => boolean
) {
  if (!record.value)
    throw new Error('Shared prices cannot be edited right now.')
  const variants = record.value.variants
  if (
    options.length !== variants.length ||
    options.some((option, index) => {
      const variant = variants[index]!
      return (
        option.label !== variant.label ||
        option.quantity !== variant.quantity ||
        option.unit !== variant.unit
      )
    })
  )
    throw new Error(
      'Shared choices changed. Review the latest values before saving.'
    )
  await update(
    {
      ...record.value.terms,
      prices: Object.fromEntries(
        variants.map((variant, index) => [variant.id, options[index]!.price])
      ),
    },
    isSurfaceCurrent
  )
}
async function saveAddOns(
  addOns: MenuSectionItemRow['addOns'],
  _title?: string,
  isSurfaceCurrent?: () => boolean
) {
  if (!record.value)
    throw new Error('Shared prices cannot be edited right now.')
  await update({ ...record.value.terms, add_ons: addOns }, isSurfaceCurrent)
}
</script>
