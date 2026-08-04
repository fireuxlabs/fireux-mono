<template>
  <div class="menu-order-item-dialog__host">
    <UModal
      v-model:open="openModel"
      :description="item.description || 'Choose this item’s options and quantity.'"
      :portal="false"
      :title="item.name"
      :ui="modalUi"
      @after:leave="$emit('after-leave')"
    >
      <template #body>
        <div
          class="menu-order-item-dialog"
          data-menu-order-configurator="true"
          :data-menu-item-id="item.id"
        >
        <fieldset
          v-if="variantOptions.length > 1"
          class="menu-order-item-dialog__group"
          data-menu-option-group="variant"
        >
          <legend>Choose one</legend>
          <label
            v-for="variant in variantOptions"
            :key="variant.id"
            class="menu-order-item-dialog__choice"
          >
            <input
              v-model="selectedVariantId"
              type="radio"
              :name="`${accessibilityId}-variant`"
              :value="variant.id"
            >
            <span>{{ variant.label }}</span>
            <strong>{{ formatPrice(variant.price) }}</strong>
          </label>
          <p v-if="!selectedVariant" class="menu-order-item-dialog__hint">
            Select one option to continue.
          </p>
        </fieldset>

        <div
          v-else-if="selectedVariant"
          class="menu-order-item-dialog__single-option"
          data-menu-option-group="variant"
        >
          <span>{{ selectedVariant.label }}</span>
          <strong>{{ formatPrice(selectedVariant.price) }}</strong>
        </div>

        <fieldset
          v-if="addOnOptions.length"
          class="menu-order-item-dialog__group"
          data-menu-option-group="add-on"
        >
          <legend>Optional extras</legend>
          <label
            v-for="addOn in addOnOptions"
            :key="addOn.id"
            class="menu-order-item-dialog__choice"
          >
            <input
              type="checkbox"
              :checked="selectedAddOnIds.includes(addOn.id)"
              @change="toggleAddOn(addOn.id, $event)"
            >
            <span>{{ addOn.label }}</span>
            <strong>{{ addOnPrice(addOn.price) }}</strong>
          </label>
        </fieldset>

          <MenuOrderQuantity v-model="quantity" />
        </div>
      </template>

      <template #footer>
        <button
          type="button"
          class="menu-order-item-dialog__add"
          data-menu-action="add-to-basket"
          :disabled="!canAdd"
          @click="addToBasket"
        >
          <span>{{ canAdd ? 'Add to basket' : 'Choose an option' }}</span>
          <strong v-if="lineTotalLabel">{{ lineTotalLabel }}</strong>
        </button>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { formatCurrencyAmount } from '../../../utils/currency-display'
import type { MenuManifestItem } from '../../../models/kitchen/menu/menu-detail.model'
import type { MenuOrderBasketInput } from '../../../composables/fireux/menu/order/useMenuOrderBasket'
import {
  defaultMenuOrderPriceOption,
  menuOrderPositivePrice,
  resolveMenuOrderAddOns,
  resolveMenuOrderPriceOptions,
} from '../../../utils/menu-order-options'

const props = defineProps<{
  currencyCode: string
  initialVariantId?: string
  item: MenuManifestItem
  open: boolean
}>()

const emit = defineEmits<{
  (event: 'update:open', open: boolean): void
  (event: 'add', input: MenuOrderBasketInput): void
  (event: 'after-leave'): void
}>()

const modalUi = {
  overlay: 'menu-order-item-dialog__overlay',
  content: 'menu-order-item-dialog__content',
  header: 'menu-order-item-dialog__header',
  title: 'menu-order-item-dialog__title',
  description: 'menu-order-item-dialog__description',
  close: 'menu-order-item-dialog__close',
  body: 'menu-order-item-dialog__body',
  footer: 'menu-order-item-dialog__footer',
}
const accessibilityId = useId()
const selectedVariantId = ref('')
const selectedAddOnIds = ref<string[]>([])
const quantity = ref(1)
const openModel = computed({
  get: () => props.open,
  set: (open: boolean) => emit('update:open', open),
})
const resolvedVariantOptions = computed(() =>
  resolveMenuOrderPriceOptions(props.item.priceOptions)
)
const resolvedAddOnOptions = computed(() => resolveMenuOrderAddOns(props.item.addOns))
const variantOptions = computed(() => resolvedVariantOptions.value || [])
const defaultVariant = computed(() =>
  defaultMenuOrderPriceOption(variantOptions.value)
)
const addOnOptions = computed(() => resolvedAddOnOptions.value || [])
const orderDataValid = computed(() =>
  resolvedVariantOptions.value !== null && resolvedAddOnOptions.value !== null
)
const itemIdentityValid = computed(() =>
  Boolean(String(props.item.id || '').trim() && String(props.item.name || '').trim())
)
const selectedVariant = computed(() =>
  variantOptions.value.find(({ id }) => id === selectedVariantId.value) || null
)
const selectedAddOns = computed(() =>
  addOnOptions.value.filter(({ id }) => selectedAddOnIds.value.includes(id))
)
const basePrice = computed(() => {
  if (!orderDataValid.value) return 0
  if (variantOptions.value.length) return Number(selectedVariant.value?.price || 0)

  return menuOrderPositivePrice(props.item.price) ? Number(props.item.price) : 0
})
const unitPrice = computed(() =>
  basePrice.value + selectedAddOns.value.reduce(
    (total, { price }) => total + Number(price),
    0
  )
)
const lineTotal = computed(() => unitPrice.value * quantity.value)
const canAdd = computed(() =>
  orderDataValid.value &&
  itemIdentityValid.value &&
  menuOrderPositivePrice(basePrice.value) &&
  menuOrderPositivePrice(unitPrice.value) &&
  menuOrderPositivePrice(lineTotal.value) &&
  Number.isInteger(quantity.value) &&
  quantity.value >= 1 &&
  quantity.value <= 99
)
const lineTotalLabel = computed(() =>
  canAdd.value ? formatPrice(lineTotal.value) : ''
)

watch(
  () => [props.item, props.initialVariantId] as const,
  () => {
    selectedVariantId.value = variantOptions.value.some(
      ({ id }) => id === props.initialVariantId
    )
      ? props.initialVariantId || ''
      : defaultVariant.value?.id || ''
    selectedAddOnIds.value = []
    quantity.value = 1
  },
  { immediate: true }
)

function toggleAddOn(id: string, event: Event) {
  const checked = event.target instanceof HTMLInputElement && event.target.checked

  selectedAddOnIds.value = checked
    ? [...new Set([...selectedAddOnIds.value, id])].sort()
    : selectedAddOnIds.value.filter((addOnId: string) => addOnId !== id)
}

function addToBasket() {
  if (!canAdd.value) return

  emit('add', {
    item: props.item,
    variantId: selectedVariant.value?.id,
    addOnIds: selectedAddOns.value.map(({ id }) => id),
    quantity: quantity.value,
  })
}

function formatPrice(price: number) {
  return formatCurrencyAmount(price, {
    currencyCode: props.currencyCode,
    format: 'code',
  })
}

function addOnPrice(price: number) {
  return price > 0 ? `+ ${formatPrice(price)}` : 'No extra charge'
}
</script>

<style scoped>
.menu-order-item-dialog__host {
  display: contents;
}

:deep(.menu-order-item-dialog__overlay) {
  z-index: 60;
  background: rgb(15 23 42 / 62%);
  backdrop-filter: blur(3px);
}

:deep(.menu-order-item-dialog__content) {
  z-index: 61;
  width: min(calc(100vw - 2rem), 38rem);
  max-width: 38rem;
  max-height: min(48rem, calc(100dvh - 2rem));
  border: 1px solid color-mix(in srgb, var(--menu-primary) 28%, transparent);
  border-radius: var(--menu-radius);
  background: var(--menu-bg);
  color: var(--menu-text);
  box-shadow: 0 1.5rem 5rem rgb(15 23 42 / 28%);
}

:deep(.menu-order-item-dialog__header) {
  border-bottom: 1px solid color-mix(in srgb, var(--menu-text) 12%, transparent);
}

:deep(.menu-order-item-dialog__title) {
  color: var(--menu-title);
  font-family: var(--menu-title-font);
  font-size: 1.4rem;
  line-height: 1.2;
}

:deep(.menu-order-item-dialog__description) {
  color: var(--menu-muted);
  line-height: var(--leading-normal);
}

:deep(.menu-order-item-dialog__close) {
  color: var(--menu-text);
}

:deep(.menu-order-item-dialog__body) {
  overflow-y: auto;
}

:deep(.menu-order-item-dialog__footer) {
  border-top: 1px solid color-mix(in srgb, var(--menu-text) 12%, transparent);
}

.menu-order-item-dialog {
  display: grid;
  gap: calc(var(--spacing) * 6);
}

.menu-order-item-dialog__group {
  display: grid;
  gap: 0.65rem;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.menu-order-item-dialog__group legend {
  margin-bottom: 0.35rem;
  color: var(--menu-title);
  font-size: 0.8rem;
  font-weight: var(--font-weight-black);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
}

.menu-order-item-dialog__choice,
.menu-order-item-dialog__single-option {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) max-content;
  gap: calc(var(--spacing) * 3);
  align-items: center;
  padding: 0.85rem;
  border: 1px solid color-mix(in srgb, var(--menu-text) 16%, transparent);
  border-radius: var(--menu-radius-control);
  color: var(--menu-text);
  cursor: pointer;
}

.menu-order-item-dialog__single-option {
  grid-template-columns: minmax(0, 1fr) max-content;
  cursor: default;
}

.menu-order-item-dialog__choice:has(input:checked) {
  border-color: var(--menu-primary);
  background: color-mix(in srgb, var(--menu-primary) 8%, var(--menu-bg));
}

.menu-order-item-dialog__choice input {
  width: 1.1rem;
  height: 1.1rem;
  accent-color: var(--menu-primary);
}

.menu-order-item-dialog__choice strong,
.menu-order-item-dialog__single-option strong {
  color: var(--menu-primary);
  font-size: 0.84rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.menu-order-item-dialog__hint {
  margin: 0;
  color: var(--menu-muted);
  font-size: 0.8rem;
}

.menu-order-item-dialog__add {
  display: flex;
  width: 100%;
  min-height: 3rem;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 4);
  padding: calc(var(--spacing) * 3) calc(var(--spacing) * 4);
  border: 1px solid var(--menu-primary);
  border-radius: var(--menu-radius-control);
  background: var(--menu-primary);
  color: var(--menu-bg);
  cursor: pointer;
  font: inherit;
  font-weight: var(--font-weight-black);
}

.menu-order-item-dialog__add:disabled {
  border-color: color-mix(in srgb, var(--menu-text) 16%, transparent);
  background: color-mix(in srgb, var(--menu-text) 8%, var(--menu-bg));
  color: var(--menu-muted);
  cursor: not-allowed;
}

@media (max-width: 35rem) {
  :deep(.menu-order-item-dialog__content) {
    width: calc(100vw - 1rem);
    max-height: calc(100dvh - 1rem);
  }
}
</style>
