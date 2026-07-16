<template>
  <div class="space-y-4">
    <UButton
      :to="`/console/kitchen/menus/${encodeURIComponent(menuId)}`"
      color="neutral"
      variant="ghost"
      icon="i-lucide-arrow-left"
      size="sm"
    >
      Back to sections
    </UButton>

    <UAlert
      v-if="!section"
      color="neutral"
      variant="soft"
      :title="pending ? 'Loading section' : 'Section not found'"
      description="Choose an existing menu section."
    />

    <UCard v-else>
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-semibold text-highlighted">{{ section.label }}</h2>
            <p class="text-sm text-dimmed">Dish-backed items in this section.</p>
          </div>
          <UBadge color="neutral" variant="soft">{{ itemRows.length }}</UBadge>
        </div>
      </template>

      <div v-if="itemRows.length" class="space-y-3">
        <article
          v-for="row in itemRows"
          :key="row.id"
          class="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-default bg-default p-3"
        >
          <div class="min-w-0 flex-1">
            <h3 class="text-sm font-semibold text-highlighted">{{ row.label }}</h3>
            <p v-if="row.dish?.description" class="text-sm text-dimmed">
              {{ row.dish.description }}
            </p>
            <p class="text-xs text-dimmed">Dish: {{ row.dishId }}</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UBadge color="neutral" variant="soft">{{ formatItemPrice(row) }}</UBadge>
            <UButton
              size="sm"
              color="neutral"
              variant="soft"
              icon="i-lucide-pencil"
              :to="`/console/kitchen/dishes/${encodeURIComponent(row.dishId)}`"
            >
              Full dish
            </UButton>
            <UButton
              size="sm"
              color="error"
              variant="ghost"
              icon="i-lucide-archive"
              :disabled="!canWrite"
              @click="archive(row.id)"
            />
          </div>

          <UCollapsible class="w-full">
            <UButton
              block
              color="neutral"
              variant="soft"
              size="sm"
              trailing-icon="i-lucide-chevron-down"
            >
              Edit item
            </UButton>

            <template #content>
              <div class="mt-3 grid gap-4 rounded-lg border border-default p-3">
                <div class="grid gap-4 md:grid-cols-2">
                  <MoleculesFormsFirestoreSimpleField
                    label="Dish name"
                    :firebase-value="row.label"
                    placeholder="Dish name"
                    :maxlength="160"
                    :disabled="!canWrite"
                    disabled-message="This menu is read-only."
                    :validation-function="validateDishName"
                    :update-function="(value) => saveDishName(row, value)"
                  />

                  <MoleculesFormsFirestoreSimpleField
                    label="Menu price"
                    type="number"
                    :firebase-value="row.price"
                    placeholder="0"
                    :disabled="!canWrite"
                    disabled-message="This menu is read-only."
                    :update-function="(value) => saveItemPrice(row, value)"
                  />
                </div>

                <MoleculesFormsFirestoreSimpleField
                  label="Dish description"
                  type="textarea"
                  :rows="3"
                  :firebase-value="row.dish?.description || ''"
                  placeholder="Dish description"
                  :maxlength="800"
                  :disabled="!canWrite"
                  disabled-message="This menu is read-only."
                  :update-function="(value) => saveDishDescription(row, value)"
                />

                <ItemsOptions
                  :row="row"
                  :can-write="canWrite"
                  :update-price-options="updatePriceOptionsFor(row)"
                  :update-add-ons="updateAddOnsFor(row)"
                />
              </div>
            </template>
          </UCollapsible>
        </article>
      </div>

      <p v-else class="text-sm text-dimmed">
        No dishes have been added to this section yet.
      </p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import {
  type MenuSectionItemRow,
  useKitchenConsoleMenuSection,
} from '../../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenuSection'
import ItemsOptions from './Options.vue'

const {
  kitchenId,
  menuId,
  sectionId,
  section,
  itemRows,
  pending,
  canWrite,
  archiveItem,
  updateItem,
  updateDish,
} = useKitchenConsoleMenuSection()
const toast = useToastify()
const text = (value: unknown) => String(value ?? '').trim()
const money = (value: unknown) => {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(0, number) : 0
}

const formatPrice = (price: number) =>
  price
    ? new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(price)
    : ''
const formatOptionUnit = (label: string, quantity: number, unit: string) => {
  if (label) return label
  if (unit === 'gram') return `${quantity} g`
  if (unit === 'piece') return `${quantity} pc`

  return [quantity, unit].filter(Boolean).join(' ')
}
const formatItemPrice = (row: MenuSectionItemRow) => {
  if (row.priceOptions.length) {
    return row.priceOptions
      .map((option) => {
        const price = formatPrice(option.price)
        if (!price) return ''

        return [formatOptionUnit(option.label, option.quantity, option.unit), price]
          .filter(Boolean)
          .join(' ')
      })
      .filter(Boolean)
      .join(' / ')
  }

  return formatPrice(row.price) || 'No price'
}
const validateDishName = (value: string) => ({
  isValid: Boolean(text(value)),
  message: text(value) ? '' : 'Dish name is required.',
})
async function saveItemPatch(
  row: MenuSectionItemRow,
  patch: Record<string, unknown>,
  title: string
) {
  await updateItem(kitchenId.value, menuId.value, sectionId.value, row.id, patch)
  toast.add({ title, color: 'success', icon: 'i-lucide-check' })
}

async function saveDishPatch(
  row: MenuSectionItemRow,
  patch: Record<string, unknown>,
  title: string
) {
  await updateDish(row.dishId, patch, { kitchenId: kitchenId.value })
  toast.add({ title, color: 'success', icon: 'i-lucide-check' })
}

const saveDishName = (row: MenuSectionItemRow, value: string) =>
  saveDishPatch(row, { name: text(value) }, 'Dish name saved')

const saveDishDescription = (row: MenuSectionItemRow, value: string) =>
  saveDishPatch(row, { description: text(value) }, 'Dish description saved')

const saveItemPrice = (row: MenuSectionItemRow, value: string) =>
  saveItemPatch(row, { price: money(value) }, 'Menu price saved')

const updatePriceOptionsFor = (row: MenuSectionItemRow) =>
  (priceOptions: MenuSectionItemRow['priceOptions'], title: string) =>
    saveItemPatch(row, { price_options: priceOptions }, title)

const updateAddOnsFor = (row: MenuSectionItemRow) =>
  (addOns: MenuSectionItemRow['addOns'], title: string) =>
    saveItemPatch(row, { add_ons: addOns }, title)

async function archive(itemId: string) {
  try {
    await archiveItem(kitchenId.value, menuId.value, sectionId.value, itemId)
    toast.add({ title: 'Item archived', color: 'success', icon: 'i-lucide-check' })
  } catch (error) {
    toast.add({
      title: 'Could not archive item',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
  }
}
</script>
