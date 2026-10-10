<template>
  <div class="grid gap-4">
    <MoleculesCopyError v-if="actionError" :message="actionError" />
    <div v-if="!shared || row.priceOptions.length" class="grid gap-3">
      <div class="flex items-center justify-between gap-3">
        <p class="text-sm font-medium text-highlighted">Variant prices</p>
        <UBadge color="neutral" variant="soft">
          {{ row.priceOptions.length }}
        </UBadge>
      </div>

      <p v-if="!row.priceOptions.length" class="text-sm text-dimmed">
        No variants. Add required sizes or mutually exclusive choices here.
      </p>

      <div
        v-for="(option, optionIndex) in editableOptions"
        :key="`${row.id}-${optionIndex}`"
        class="grid gap-3 rounded-md border border-default p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
      >
        <p v-if="shared" class="self-center text-sm font-medium">
          {{ option.label }}
        </p>
        <MoleculesFormsEditableSimpleField
          v-else
          label="Option label"
          :value="option.label"
          placeholder="Option label"
          :disabled="!canWrite"
          disabled-message="This menu is read-only."
          :validation-function="validateOptionLabel"
          :capture-intent="captureScope"
          :update="option.saveLabel"
        />

        <MoleculesFormsEditableSimpleField
          label="Option price"
          type="number"
          :value="option.price"
          placeholder="0"
          :disabled="!canWrite"
          disabled-message="This menu is read-only."
          :validation-function="validateVariantPrice"
          :capture-intent="captureScope"
          :update="option.savePrice"
        />

        <div v-if="!shared" class="flex items-end">
          <UButton
            color="error"
            variant="ghost"
            icon="i-lucide-trash-2"
            :aria-label="`Remove ${option.label || 'variant'}`"
            :disabled="!canWrite"
            @click="runAction(() => removePriceOption(optionIndex))"
          />
        </div>
      </div>

      <div
        v-if="canWrite && !shared"
        class="grid gap-3 rounded-md border border-dashed border-default p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
      >
        <UFormField label="New variant label">
          <UInput
            v-model="variantDraft.label"
            placeholder="For example: 40 cm"
          />
        </UFormField>

        <UFormField label="Full item price">
          <UInput
            v-model="variantDraft.price"
            type="number"
            min="0.01"
            step="0.5"
            placeholder="0"
          />
        </UFormField>

        <div class="flex items-end">
          <UButton
            icon="i-lucide-plus"
            :disabled="!canAddVariant()"
            @click="runAction(addPriceOption)"
          >
            Add
          </UButton>
        </div>
      </div>
    </div>

    <div class="grid gap-3">
      <div class="flex items-center justify-between gap-3">
        <p class="text-sm font-medium text-highlighted">Add-ons</p>
        <UBadge color="neutral" variant="soft">
          {{ row.addOns.length }}
        </UBadge>
      </div>

      <p v-if="!row.addOns.length" class="text-sm text-dimmed">
        No optional extras.
      </p>

      <div
        v-for="(addOn, addOnIndex) in editableAddOns"
        :key="`${row.id}-add-on-${addOnIndex}`"
        class="grid gap-3 rounded-md border border-default p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
      >
        <MoleculesFormsEditableSimpleField
          label="Add-on label"
          :value="addOn.label"
          placeholder="Add-on label"
          :disabled="!canWrite"
          disabled-message="This menu is read-only."
          :validation-function="validateOptionLabel"
          :capture-intent="captureScope"
          :update="addOn.saveLabel"
        />

        <MoleculesFormsEditableSimpleField
          label="Add-on price"
          type="number"
          :value="addOn.price"
          placeholder="0"
          :disabled="!canWrite"
          disabled-message="This menu is read-only."
          :validation-function="validateAddOnPrice"
          :capture-intent="captureScope"
          :update="addOn.savePrice"
        />

        <div class="flex items-end">
          <UButton
            color="error"
            variant="ghost"
            icon="i-lucide-trash-2"
            :aria-label="`Remove ${addOn.label || 'add-on'}`"
            :disabled="!canWrite"
            @click="runAction(() => removeAddOn(addOnIndex))"
          />
        </div>
      </div>

      <div
        v-if="canWrite"
        class="grid gap-3 rounded-md border border-dashed border-default p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
      >
        <UFormField label="New add-on label">
          <UInput
            v-model="addOnDraft.label"
            placeholder="For example: Extra cheese"
          />
        </UFormField>

        <UFormField label="Additional price">
          <UInput
            v-model="addOnDraft.price"
            type="number"
            min="0"
            step="0.5"
            placeholder="0"
          />
        </UFormField>

        <div class="flex items-end">
          <UButton
            icon="i-lucide-plus"
            :disabled="!canAddAddOn()"
            @click="runAction(addAddOn)"
          >
            Add
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute } from '#imports'
import { useMenuEditorScope } from '../../../../../menu/composables/useMenuEditorScope'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import type { MenuSectionItemRow } from '../../../../composables/workspace/menus/useKitchenWorkspaceMenuSection'

type PriceOptions = MenuSectionItemRow['priceOptions']
type AddOns = MenuSectionItemRow['addOns']
type OptionDraft = {
  label: string
  price: number | string
}

const props = defineProps<{
  row: MenuSectionItemRow
  shared?: boolean
  canWrite: boolean
  captureIntent?: () => () => boolean
  updatePriceOptions: (
    options: PriceOptions,
    title: string,
    isCurrent?: () => boolean
  ) => Promise<void>
  updateAddOns: (
    addOns: AddOns,
    title: string,
    isCurrent?: () => boolean
  ) => Promise<void>
}>()

const editableOptions = computed(() =>
  props.row.priceOptions.map((option, index) => ({
    ...option,
    saveLabel: (value: string, isCurrent?: () => boolean) =>
      saveOptionLabel(index, value, isCurrent),
    savePrice: (value: string, isCurrent?: () => boolean) =>
      saveOptionPrice(index, value, isCurrent),
  }))
)
const editableAddOns = computed(() =>
  props.row.addOns.map((addOn, index) => ({
    ...addOn,
    saveLabel: (value: string, isCurrent?: () => boolean) =>
      saveAddOnLabel(index, value, isCurrent),
    savePrice: (value: string, isCurrent?: () => boolean) =>
      saveAddOnPrice(index, value, isCurrent),
  }))
)
const actionError = ref('')
async function runAction(action: () => Promise<void>) {
  const isCurrent = captureScope()
  actionError.value = ''
  try {
    await action()
  } catch (error) {
    if (!isCurrent()) return
    actionError.value =
      error instanceof Error ? error.message : 'Could not save this change.'
  }
}

const variantDraft = reactive<OptionDraft>({
  label: '',
  price: props.row.price,
})
const addOnDraft = reactive<OptionDraft>({ label: '', price: 0 })
const route = useRoute()
const captureLocal = useMenuEditorScope(
  [
    () => route.fullPath,
    () => props.row.id,
    () => props.row.item.kitchen_id,
    () => props.row.item.menu_id,
    () => props.row.item.section_id,
    () => (props.captureIntent ? undefined : props.canWrite),
    () => JSON.stringify(props.row.priceOptions),
    () => JSON.stringify(props.row.addOns),
    () => variantDraft.label,
    () => variantDraft.price,
    () => addOnDraft.label,
    () => addOnDraft.price,
  ],
  () => {
    actionError.value = ''
  }
)
const captureScope = () => {
  const localCurrent = captureLocal()
  const ownerCurrent = props.captureIntent?.() ?? (() => props.canWrite)
  return () => localCurrent() && ownerCurrent()
}
const text = (value: unknown) => String(value ?? '').trim()
const money = (value: unknown) => {
  const number = Number(value)
  if (!text(value) || !Number.isFinite(number) || number < 0)
    throw new Error('Enter a price of zero or more.')
  return number
}
const optionKey = (value: unknown) => normalizeSlug(value)

const validateOptionLabel = (value: string) => ({
  isValid: Boolean(text(value)),
  message: text(value) ? '' : 'A label is required.',
})
const validateVariantPrice = (value: string) =>
  props.shared
    ? validateAddOnPrice(value)
    : {
        isValid:
          Boolean(text(value)) &&
          Number.isFinite(Number(value)) &&
          Number(value) > 0,
        message:
          Boolean(text(value)) &&
          Number.isFinite(Number(value)) &&
          Number(value) > 0
            ? ''
            : 'Enter the full item price above zero.',
      }
const validateAddOnPrice = (value: string) => ({
  isValid:
    Boolean(text(value)) &&
    Number.isFinite(Number(value)) &&
    Number(value) >= 0,
  message:
    Boolean(text(value)) && Number.isFinite(Number(value)) && Number(value) >= 0
      ? ''
      : 'Enter an additional price of zero or more.',
})

const canAddVariant = () => {
  const key = optionKey(variantDraft.label)

  return Boolean(
    key &&
      validateVariantPrice(String(variantDraft.price)).isValid &&
      !props.row.priceOptions.some((option) => optionKey(option.label) === key)
  )
}
const canAddAddOn = () => {
  const key = optionKey(addOnDraft.label)

  return Boolean(
    key &&
      validateAddOnPrice(String(addOnDraft.price)).isValid &&
      !props.row.addOns.some(
        (addOn) => optionKey(addOn.id) === key || optionKey(addOn.label) === key
      )
  )
}

const currentAction = (isSurfaceCurrent?: () => boolean) => {
  if (!props.canWrite || (isSurfaceCurrent && !isSurfaceCurrent()))
    throw new Error('These prices cannot be edited right now.')
  const isCurrent = captureScope()
  return () => isCurrent() && (isSurfaceCurrent?.() ?? true)
}
const saveOptionLabel = (
  index: number,
  value: string,
  isSurfaceCurrent?: () => boolean
) => {
  const isCurrent = currentAction(isSurfaceCurrent)
  if (!validateOptionLabel(value).isValid)
    throw new Error('A label is required.')
  return props.updatePriceOptions(
    props.row.priceOptions.map((option, optionIndex) =>
      optionIndex === index ? { ...option, label: text(value) } : option
    ),
    'Variant label saved',
    isCurrent
  )
}
const saveOptionPrice = (
  index: number,
  value: string,
  isSurfaceCurrent?: () => boolean
) => {
  const isCurrent = currentAction(isSurfaceCurrent)
  if (!validateVariantPrice(value).isValid)
    throw new Error(
      props.shared
        ? 'Enter a price of zero or more.'
        : 'Enter the full item price above zero.'
    )
  return props.updatePriceOptions(
    props.row.priceOptions.map((option, optionIndex) =>
      optionIndex === index ? { ...option, price: money(value) } : option
    ),
    'Variant price saved',
    isCurrent
  )
}
const saveAddOnLabel = (
  index: number,
  value: string,
  isSurfaceCurrent?: () => boolean
) => {
  const isCurrent = currentAction(isSurfaceCurrent)
  if (!validateOptionLabel(value).isValid)
    throw new Error('A label is required.')
  return props.updateAddOns(
    props.row.addOns.map((addOn, addOnIndex) =>
      addOnIndex === index ? { ...addOn, label: text(value) } : addOn
    ),
    'Add-on label saved',
    isCurrent
  )
}
const saveAddOnPrice = (
  index: number,
  value: string,
  isSurfaceCurrent?: () => boolean
) => {
  const isCurrent = currentAction(isSurfaceCurrent)
  const price = money(value)
  return props.updateAddOns(
    props.row.addOns.map((addOn, addOnIndex) =>
      addOnIndex === index ? { ...addOn, price } : addOn
    ),
    'Add-on price saved',
    isCurrent
  )
}
async function addPriceOption() {
  if (!canAddVariant() || !props.canWrite || props.shared) return
  const isCurrent = currentAction()
  await props.updatePriceOptions(
    [
      ...props.row.priceOptions,
      {
        label: text(variantDraft.label),
        quantity: 0,
        unit: '',
        price: money(variantDraft.price),
      },
    ],
    'Variant added',
    isCurrent
  )
  if (isCurrent())
    Object.assign(variantDraft, { label: '', price: props.row.price })
}
const removePriceOption = (index: number) => {
  const isCurrent = currentAction()
  if (props.shared) throw new Error('Shared choices cannot be removed here.')
  return props.updatePriceOptions(
    props.row.priceOptions.filter((_, optionIndex) => optionIndex !== index),
    'Variant removed',
    isCurrent
  )
}
async function addAddOn() {
  if (!canAddAddOn() || !props.canWrite) return
  const isCurrent = currentAction()
  const label = text(addOnDraft.label)
  await props.updateAddOns(
    [
      ...props.row.addOns,
      { id: optionKey(label), label, price: money(addOnDraft.price) },
    ],
    'Add-on added',
    isCurrent
  )
  if (isCurrent()) Object.assign(addOnDraft, { label: '', price: 0 })
}
const removeAddOn = (index: number) => {
  const isCurrent = currentAction()
  return props.updateAddOns(
    props.row.addOns.filter((_, addOnIndex) => addOnIndex !== index),
    'Add-on removed',
    isCurrent
  )
}
</script>
