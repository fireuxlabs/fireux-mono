<template>
  <div class="space-y-4">
    <UButton
      :to="`/workspace/kitchen/menus/${encodeURIComponent(menuSlug)}`"
      @click="rememberView(menuSlug, 'content', $event)"
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
            <h2 class="text-base font-semibold text-highlighted">
              {{ section.label }}
            </h2>
            <p v-if="section.date" class="mt-1 text-sm text-muted">
              {{ section.date }}
            </p>
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
            <h3 class="text-sm font-semibold text-highlighted">
              {{ row.label }}
            </h3>
            <p v-if="row.dish?.description" class="text-sm text-dimmed">
              {{ row.dish.description }}
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UBadge color="neutral" variant="soft">{{
              formatItemPrice(row)
            }}</UBadge>
            <UButton
              size="sm"
              color="neutral"
              variant="soft"
              icon="i-lucide-pencil"
              :to="{
                path: `/workspace/kitchen/food/dishes/${encodeURIComponent(row.dishId)}`,
                query: { menu: menuSlug, section: sectionId },
              }"
            >
              Full dish
            </UButton>
            <USwitch
              :model-value="row.item.status !== 'archived'"
              :label="row.item.status === 'archived' ? 'Off menu' : 'On menu'"
              :disabled="!canWrite || savingAvailability === row.id"
              @update:model-value="setAvailability(row, $event)"
            />
          </div>

          <div class="w-full max-w-sm">
            <MoleculesFormsEditableSimpleField
              label="Menu price"
              type="number"
              :value="row.price"
              :disabled="!canWrite"
              disabled-message="Kitchen editing access is required."
              :validation-function="validatePrice"
              :update="(value) => saveItemPrice(row, value)"
            />
          </div>
          <MoleculesDisclosurePanel
            class="w-full"
            title="Variants, extras & dish details"
            size="sm"
          >
            <div class="mt-3 grid gap-4 rounded-lg border border-default p-3">
              <div class="grid gap-4 md:grid-cols-2">
                <MoleculesFormsEditableSimpleField
                  label="Dish name"
                  :value="row.label"
                  placeholder="Dish name"
                  :maxlength="160"
                  :disabled="!canWrite"
                  disabled-message="This menu is read-only."
                  :validation-function="validateDishName"
                  :update="(value) => saveDishName(row, value)"
                />
              </div>

              <MoleculesFormsEditableSimpleField
                label="Dish description"
                type="textarea"
                :rows="3"
                :value="row.dish?.description || ''"
                placeholder="Dish description"
                :maxlength="800"
                :disabled="!canWrite"
                disabled-message="This menu is read-only."
                :update="(value) => saveDishDescription(row, value)"
              />

              <ItemsOptions
                :row="row"
                :can-write="canWrite"
                :update-price-options="updatePriceOptionsFor(row)"
                :update-add-ons="updateAddOnsFor(row)"
              />
            </div>
          </MoleculesDisclosurePanel>
        </article>
      </div>

      <p v-else class="text-sm text-dimmed">
        No dishes have been added to this section yet.
      </p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useMenuRecordNavigation } from '../../../../composables/workspace/menus/useMenuRecordNavigation'
const { rememberView } = useMenuRecordNavigation()
import { ref } from 'vue'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import {
  type MenuSectionItemRow,
  useKitchenWorkspaceMenuSection,
} from '../../../../composables/workspace/menus/useKitchenWorkspaceMenuSection'
import ItemsOptions from './Options.vue'

const {
  kitchenId,
  menuId,
  menuSlug,
  sectionId,
  section,
  itemRows,
  pending,
  canWrite,
  currencyCode,
  updateItem,
  updateDish,
} = useKitchenWorkspaceMenuSection()
const toast = useToastify()
const text = (value: unknown) => String(value ?? '').trim()
const money = (value: unknown) => Number(value)
const validatePrice = (value: string) => ({
  isValid:
    value.trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= 0,
  message: 'Enter a price of zero or more.',
})
const savingAvailability = ref('')
async function setAvailability(row: MenuSectionItemRow, available: boolean) {
  savingAvailability.value = row.id
  try {
    await saveItemPatch(
      row,
      { status: available ? 'active' : 'archived' },
      available ? 'Item available' : 'Item taken off menu'
    )
  } catch (error) {
    toast.add({
      title: 'Could not change availability',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'error',
    })
  } finally {
    savingAvailability.value = ''
  }
}

const formatPrice = (price: number) =>
  price
    ? new Intl.NumberFormat('de-CH', {
        style: 'currency',
        currency: currencyCode.value || 'CHF',
      }).format(price)
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

        return [
          formatOptionUnit(option.label, option.quantity, option.unit),
          price,
        ]
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
  await updateItem(
    kitchenId.value,
    menuId.value,
    sectionId.value,
    row.id,
    patch
  )
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

const updatePriceOptionsFor =
  (row: MenuSectionItemRow) =>
  (priceOptions: MenuSectionItemRow['priceOptions'], title: string) =>
    saveItemPatch(row, { price_options: priceOptions }, title)

const updateAddOnsFor =
  (row: MenuSectionItemRow) =>
  (addOns: MenuSectionItemRow['addOns'], title: string) =>
    saveItemPatch(row, { add_ons: addOns }, title)
</script>
