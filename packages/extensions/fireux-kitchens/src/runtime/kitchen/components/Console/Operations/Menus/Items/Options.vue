<template>
  <div class="grid gap-4">
    <div class="grid gap-3">
      <div class="flex items-center justify-between gap-3">
        <p class="text-sm font-medium text-highlighted">
          Variant prices
        </p>
        <UBadge color="neutral" variant="soft">
          {{ row.priceOptions.length }}
        </UBadge>
      </div>

      <p v-if="!row.priceOptions.length" class="text-sm text-dimmed">
        No variants. Add required sizes or mutually exclusive choices here.
      </p>

      <div
        v-for="(option, optionIndex) in row.priceOptions"
        :key="`${row.id}-${optionIndex}`"
        class="grid gap-3 rounded-md border border-default p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
      >
        <MoleculesFormsFirestoreSimpleField
          label="Option label"
          :firebase-value="option.label"
          placeholder="Option label"
          :disabled="!canWrite"
          disabled-message="This menu is read-only."
          :validation-function="validateOptionLabel"
          :update-function="(value) => saveOptionLabel(optionIndex, value)"
        />

        <MoleculesFormsFirestoreSimpleField
          label="Option price"
          type="number"
          :firebase-value="option.price"
          placeholder="0"
          :disabled="!canWrite"
          disabled-message="This menu is read-only."
          :validation-function="validateVariantPrice"
          :update-function="(value) => saveOptionPrice(optionIndex, value)"
        />

        <div class="flex items-end">
          <UButton
            color="error"
            variant="ghost"
            icon="i-lucide-trash-2"
            :aria-label="`Remove ${option.label || 'variant'}`"
            :disabled="!canWrite"
            @click="removePriceOption(optionIndex)"
          />
        </div>
      </div>

      <div
        v-if="canWrite"
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
            :model-value="variantDraft.price"
            type="number"
            min="0.01"
            step="0.5"
            placeholder="0"
            @update:model-value="variantDraft.price = money($event)"
          />
        </UFormField>

        <div class="flex items-end">
          <UButton
            icon="i-lucide-plus"
            :disabled="!canAddVariant()"
            @click="addPriceOption"
          >
            Add
          </UButton>
        </div>
      </div>
    </div>

    <div class="grid gap-3">
      <div class="flex items-center justify-between gap-3">
        <p class="text-sm font-medium text-highlighted">
          Add-ons
        </p>
        <UBadge color="neutral" variant="soft">
          {{ row.addOns.length }}
        </UBadge>
      </div>

      <p v-if="!row.addOns.length" class="text-sm text-dimmed">
        No optional extras.
      </p>

      <div
        v-for="(addOn, addOnIndex) in row.addOns"
        :key="`${row.id}-add-on-${addOnIndex}`"
        class="grid gap-3 rounded-md border border-default p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
      >
        <MoleculesFormsFirestoreSimpleField
          label="Add-on label"
          :firebase-value="addOn.label"
          placeholder="Add-on label"
          :disabled="!canWrite"
          disabled-message="This menu is read-only."
          :validation-function="validateOptionLabel"
          :update-function="(value) => saveAddOnLabel(addOnIndex, value)"
        />

        <MoleculesFormsFirestoreSimpleField
          label="Add-on price"
          type="number"
          :firebase-value="addOn.price"
          placeholder="0"
          :disabled="!canWrite"
          disabled-message="This menu is read-only."
          :validation-function="validateAddOnPrice"
          :update-function="(value) => saveAddOnPrice(addOnIndex, value)"
        />

        <div class="flex items-end">
          <UButton
            color="error"
            variant="ghost"
            icon="i-lucide-trash-2"
            :aria-label="`Remove ${addOn.label || 'add-on'}`"
            :disabled="!canWrite"
            @click="removeAddOn(addOnIndex)"
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
            :model-value="addOnDraft.price"
            type="number"
            min="0"
            step="0.5"
            placeholder="0"
            @update:model-value="addOnDraft.price = money($event)"
          />
        </UFormField>

        <div class="flex items-end">
          <UButton
            icon="i-lucide-plus"
            :disabled="!canAddAddOn()"
            @click="addAddOn"
          >
            Add
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import type { MenuSectionItemRow } from '../../../../../composables/console/operations/Menus/useKitchenConsoleMenuSection'

type PriceOptions = MenuSectionItemRow['priceOptions']
type AddOns = MenuSectionItemRow['addOns']
type OptionDraft = {
  label: string
  price: number
}

const props = defineProps<{
  row: MenuSectionItemRow
  canWrite: boolean
  updatePriceOptions: (options: PriceOptions, title: string) => Promise<void>
  updateAddOns: (addOns: AddOns, title: string) => Promise<void>
}>()

const variantDraft = reactive<OptionDraft>({ label: '', price: props.row.price })
const addOnDraft = reactive<OptionDraft>({ label: '', price: 0 })
const text = (value: unknown) => String(value ?? '').trim()
const money = (value: unknown) => {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(0, number) : 0
}
const optionKey = (value: unknown) => normalizeSlug(value)

const validateOptionLabel = (value: string) => ({
  isValid: Boolean(text(value)),
  message: text(value) ? '' : 'A label is required.',
})
const validateVariantPrice = (value: string) => ({
  isValid: Number(value) > 0,
  message: Number(value) > 0 ? '' : 'Enter the full item price above zero.',
})
const validateAddOnPrice = (value: string) => ({
  isValid: Number.isFinite(Number(value)) && Number(value) >= 0,
  message:
    Number.isFinite(Number(value)) && Number(value) >= 0
      ? ''
      : 'Enter an additional price of zero or more.',
})

const canAddVariant = () => {
  const key = optionKey(variantDraft.label)

  return Boolean(
    key &&
    variantDraft.price > 0 &&
    !props.row.priceOptions.some((option) => optionKey(option.label) === key)
  )
}
const canAddAddOn = () => {
  const key = optionKey(addOnDraft.label)

  return Boolean(
    key &&
    !props.row.addOns.some((addOn) =>
      optionKey(addOn.id) === key || optionKey(addOn.label) === key
    )
  )
}

const saveOptionLabel = (index: number, value: string) =>
  props.updatePriceOptions(
    props.row.priceOptions.map((option, optionIndex) =>
      optionIndex === index ? { ...option, label: text(value) } : option
    ),
    'Variant label saved'
  )

const saveOptionPrice = (index: number, value: string) =>
  props.updatePriceOptions(
    props.row.priceOptions.map((option, optionIndex) =>
      optionIndex === index ? { ...option, price: money(value) } : option
    ),
    'Variant price saved'
  )

const saveAddOnLabel = (index: number, value: string) =>
  props.updateAddOns(
    props.row.addOns.map((addOn, addOnIndex) =>
      addOnIndex === index ? { ...addOn, label: text(value) } : addOn
    ),
    'Add-on label saved'
  )

const saveAddOnPrice = (index: number, value: string) =>
  props.updateAddOns(
    props.row.addOns.map((addOn, addOnIndex) =>
      addOnIndex === index ? { ...addOn, price: money(value) } : addOn
    ),
    'Add-on price saved'
  )

async function addPriceOption() {
  if (!canAddVariant()) return

  await props.updatePriceOptions([
    ...props.row.priceOptions,
    {
      label: text(variantDraft.label),
      quantity: 0,
      unit: '',
      price: variantDraft.price,
    },
  ], 'Variant added')
  Object.assign(variantDraft, { label: '', price: props.row.price })
}

const removePriceOption = (index: number) =>
  props.updatePriceOptions(
    props.row.priceOptions.filter((_, optionIndex) => optionIndex !== index),
    'Variant removed'
  )

async function addAddOn() {
  if (!canAddAddOn()) return

  const label = text(addOnDraft.label)
  await props.updateAddOns([
    ...props.row.addOns,
    {
      id: optionKey(label),
      label,
      price: addOnDraft.price,
    },
  ], 'Add-on added')
  Object.assign(addOnDraft, { label: '', price: 0 })
}

const removeAddOn = (index: number) =>
  props.updateAddOns(
    props.row.addOns.filter((_, addOnIndex) => addOnIndex !== index),
    'Add-on removed'
  )
</script>
