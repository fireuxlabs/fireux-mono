<template>
  <div class="menu-order-basket-dialog__host">
    <UModal
      v-model:open="openModel"
      description="Review your items and choices."
      :portal="false"
      title="Your basket"
      :ui="modalUi"
      @after:leave="$emit('after-leave')"
    >
      <template #body>
        <div
          class="menu-order-basket-dialog"
          data-menu-basket-review="local"
          :data-menu-basket-lines="lines.length"
        >
          <article
            v-for="line in lines"
            :key="line.id"
            class="menu-order-basket-dialog__line"
            :data-menu-basket-line="line.itemId"
          >
            <strong
              class="menu-order-basket-dialog__quantity"
              :aria-label="`Quantity ${line.quantity}`"
            >
              {{ line.quantity }}×
            </strong>

            <div class="menu-order-basket-dialog__identity">
              <h3 class="fx-type-card-title">{{ line.name }}</h3>
              <p v-if="line.variant">{{ line.variant.label }}</p>
              <ul v-if="line.addOns.length">
                <li v-for="addOn in line.addOns" :key="addOn.id">
                  {{ addOn.label }}
                </li>
              </ul>
            </div>

            <strong class="menu-order-basket-dialog__line-total">
              {{ formatPrice(line.unitPrice * line.quantity) }}
            </strong>

            <button
              type="button"
              class="menu-order-basket-dialog__remove"
              data-menu-action="remove-basket-line"
              :aria-label="`Remove ${line.name} from basket`"
              @click="$emit('remove', line.id)"
            >
              <UIcon name="i-lucide-trash-2" aria-hidden="true" />
            </button>
          </article>

          <p v-if="!lines.length" class="menu-order-basket-dialog__empty" role="status">
            Your basket is empty.
          </p>
        </div>
      </template>

      <template #footer>
        <div class="menu-order-basket-dialog__footer-content">
          <div class="menu-order-basket-dialog__footer-copy">
            <span>{{ quantityLabel }}</span>
            <strong>{{ totalLabel }}</strong>
          </div>

          <div
            v-if="actionLabel"
            class="menu-order-basket-dialog__next"
          >
            <span v-if="selectionLabel">
              <UIcon name="i-lucide-clock-3" aria-hidden="true" />
              {{ selectionLabel }}
            </span>
            <button
              type="button"
              data-menu-action="continue-basket"
              @click="continueBasket"
            >
              {{ actionLabel }}
              <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
            </button>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatCurrencyAmount } from 'fireux-core/runtime/models/core/money.model'
import type { MenuOrderBasketLine } from '../../../composables/fireux/menu/order/useMenuOrderBasket'

const props = defineProps<{
  actionLabel?: string
  currencyCode: string
  lines: MenuOrderBasketLine[]
  open: boolean
  selectionLabel?: string
  totalLabel: string
}>()

const emit = defineEmits<{
  (event: 'update:open', open: boolean): void
  (event: 'remove', lineId: string): void
  (event: 'continue', trigger: HTMLButtonElement): void
  (event: 'after-leave'): void
}>()

const modalUi = {
  overlay: 'menu-order-basket-dialog__overlay',
  content: 'menu-order-basket-dialog__content',
  header: 'menu-order-basket-dialog__header',
  title: 'menu-order-basket-dialog__title',
  description: 'menu-order-basket-dialog__description',
  close: 'menu-order-basket-dialog__close',
  body: 'menu-order-basket-dialog__body',
  footer: 'menu-order-basket-dialog__footer',
}
const openModel = computed({
  get: () => props.open,
  set: (open: boolean) => emit('update:open', open),
})
const quantity = computed(() =>
  props.lines.reduce((sum, line) => sum + line.quantity, 0)
)
const quantityLabel = computed(() =>
  `${quantity.value} ${quantity.value === 1 ? 'item' : 'items'}`
)

function formatPrice(price: number) {
  return formatCurrencyAmount(price, {
    currencyCode: props.currencyCode,
    format: 'code',
  })
}

function continueBasket(event: MouseEvent) {
  const trigger = event.currentTarget
  if (trigger instanceof HTMLButtonElement) emit('continue', trigger)
}
</script>

<style scoped>
.menu-order-basket-dialog__host {
  display: contents;
}

:deep(.menu-order-basket-dialog__overlay) {
  z-index: 60;
  background: rgb(15 23 42 / 62%);
  backdrop-filter: blur(3px);
}

:deep(.menu-order-basket-dialog__content) {
  z-index: 61;
  width: min(calc(100vw - 2rem), 42rem);
  max-width: 42rem;
  max-height: min(52rem, calc(100dvh - 2rem));
  border: 1px solid color-mix(in srgb, var(--menu-primary) 28%, transparent);
  border-radius: var(--menu-radius);
  background: var(--menu-bg);
  color: var(--menu-text);
  box-shadow: 0 1.5rem 5rem rgb(15 23 42 / 28%);
}

:deep(.menu-order-basket-dialog__header),
:deep(.menu-order-basket-dialog__footer) {
  border-color: color-mix(in srgb, var(--menu-text) 12%, transparent);
}

:deep(.menu-order-basket-dialog__title) {
  color: var(--menu-title);
  font-family: var(--menu-title-font);
  font-size: 1.4rem;
}

:deep(.menu-order-basket-dialog__description),
:deep(.menu-order-basket-dialog__close) {
  color: var(--menu-muted);
}

:deep(.menu-order-basket-dialog__body) {
  overflow-y: auto;
}

.menu-order-basket-dialog {
  display: grid;
  gap: calc(var(--spacing) * 4);
}

.menu-order-basket-dialog__line {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr) max-content max-content;
  gap: calc(var(--spacing) * 3);
  align-items: start;
  padding: calc(var(--spacing) * 4);
  border: 1px solid color-mix(in srgb, var(--menu-text) 14%, transparent);
  border-radius: var(--menu-radius-control);
}

.menu-order-basket-dialog__quantity {
  min-width: 2ch;
  color: var(--menu-primary);
  font-size: var(--text-sm);
  font-variant-numeric: tabular-nums;
}

.menu-order-basket-dialog__identity {
  display: grid;
  gap: 0.3rem;
  min-width: 0;
}

.menu-order-basket-dialog__identity h3,
.menu-order-basket-dialog__identity p,
.menu-order-basket-dialog__identity ul {
  margin: 0;
}

.menu-order-basket-dialog__identity h3 {
  color: var(--menu-title);
  font-family: var(--menu-title-font);
  font-size: var(--text-base);
  overflow-wrap: anywhere;
}

.menu-order-basket-dialog__identity p,
.menu-order-basket-dialog__identity ul {
  color: var(--menu-muted);
  font-size: 0.8rem;
  line-height: 1.45;
}

.menu-order-basket-dialog__identity ul {
  padding-inline-start: 1.1rem;
}

.menu-order-basket-dialog__line-total {
  color: var(--menu-primary);
  font-size: 0.9rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.menu-order-basket-dialog__remove {
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: var(--ui-radius);
  background: transparent;
  color: var(--menu-muted);
  cursor: pointer;
  font: inherit;
}

.menu-order-basket-dialog__remove:hover {
  background: color-mix(in srgb, var(--menu-primary) 8%, transparent);
  color: var(--menu-primary);
}

.menu-order-basket-dialog__remove:focus-visible {
  border-radius: var(--ui-radius);
  outline: 2px solid var(--menu-primary);
  outline-offset: 0.25rem;
}

.menu-order-basket-dialog__empty {
  margin: 0;
  color: var(--menu-muted);
  text-align: center;
}

.menu-order-basket-dialog__footer-content {
  display: grid;
  width: 100%;
  gap: 0.8rem;
}

.menu-order-basket-dialog__footer-copy {
  display: flex;
  width: 100%;
  justify-content: space-between;
  gap: calc(var(--spacing) * 4);
  color: var(--menu-muted);
  font-size: 0.9rem;
  font-weight: var(--font-weight-extrabold);
}

.menu-order-basket-dialog__footer-copy strong {
  color: var(--menu-primary);
  font-variant-numeric: tabular-nums;
}

.menu-order-basket-dialog__next {
  display: grid;
  gap: 0.6rem;
}

.menu-order-basket-dialog__next > span {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  color: var(--menu-muted);
  font-size: 0.78rem;
  font-weight: var(--font-weight-extrabold);
}

.menu-order-basket-dialog__next button {
  display: flex;
  justify-content: space-between;
  gap: calc(var(--spacing) * 4);
  align-items: center;
  width: 100%;
  padding: 0.72rem 0.85rem;
  border: 1px solid var(--menu-primary);
  border-radius: var(--menu-radius-control);
  background: var(--menu-primary);
  color: var(--menu-bg);
  cursor: pointer;
  font: inherit;
  font-weight: var(--font-weight-black);
}

.menu-order-basket-dialog__next button:focus-visible {
  outline: 2px solid var(--menu-primary);
  outline-offset: 2px;
}

@media (max-width: 35rem) {
  :deep(.menu-order-basket-dialog__content) {
    width: calc(100vw - 1rem);
    max-height: calc(100dvh - 1rem);
  }

  .menu-order-basket-dialog__line {
    grid-template-columns: max-content minmax(0, 1fr) max-content;
  }

  .menu-order-basket-dialog__line-total {
    grid-column: 2;
  }

  .menu-order-basket-dialog__remove {
    grid-column: 3;
    grid-row: 1;
  }
}
</style>
