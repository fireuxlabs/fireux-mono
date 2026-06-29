<template>
  <article :class="['menu-item', item.imageUrl && 'menu-item--with-image']">
    <div
      v-if="item.imageUrl"
      class="menu-item__media"
    >
      <img
        :src="item.imageUrl"
        :alt="item.name"
        loading="lazy"
      >
    </div>

    <div class="menu-item__copy">
      <h3>{{ item.name }}</h3>
      <p
        v-if="orderMode && displayPrice"
        class="menu-item__price menu-item__price--inline"
      >
        {{ displayPrice }}
      </p>
      <p v-if="item.description">
        {{ item.description }}
      </p>

      <MenuDetailItemChoices
        v-if="orderMode && variantOptions.length > 1"
        :label="`${item.name} variants`"
        :options="variantOptions"
        :selected-ids="selectedVariant ? [selectedVariant.id] : []"
        @toggle="selectedVariantId = $event"
      />

      <MenuDetailItemChoices
        v-if="orderMode && addOnOptions.length"
        :label="`${item.name} add-ons`"
        :options="addOnOptions"
        :selected-ids="selectedAddOnIds"
        prefix="+ "
        @toggle="toggleAddOn"
      />
    </div>

    <div
      v-if="item.priceLabel || orderMode"
      class="menu-item__actions"
    >
      <p v-if="!orderMode && item.priceLabel" class="menu-item__price">
        {{ item.priceLabel }}
      </p>

      <MenuDetailItemQuantity
        v-if="orderMode"
        :label="item.name"
        :quantity="quantity"
        @add="$emit('add', orderItem)"
        @remove="$emit('remove', orderItem)"
      />
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
// Menu detail item render spine: source data comes from the public menu manifest model.
import type {
  MenuFoodAddOn,
  MenuFoodItem,
  MenuFoodOrderItem,
  MenuFoodPriceOption,
} from '../../../../models/menu/menu-food.model'

const props = defineProps<{
  item: MenuFoodItem
  orderMode?: boolean
  quantities?: Record<string, number>
}>()

defineEmits<{
  (event: 'add', item: MenuFoodOrderItem): void
  (event: 'remove', item: MenuFoodOrderItem): void
}>()

const selectedVariantId = ref('')
const selectedAddOnIds = ref<string[]>([])
const variantOptions = computed<MenuFoodPriceOption[]>(() =>
  props.item.priceOptions || []
)
const addOnOptions = computed<MenuFoodAddOn[]>(() =>
  props.item.addOns || []
)
const selectedVariant = computed(() =>
  variantOptions.value.find((variant) => variant.id === selectedVariantId.value) ||
  variantOptions.value[0] ||
  null
)
const selectedAddOns = computed(() =>
  selectedAddOnIds.value
    .map((id: string) =>
      addOnOptions.value.find((addOn: MenuFoodAddOn) => addOn.id === id)
    )
    .filter((addOn: MenuFoodAddOn | undefined): addOn is MenuFoodAddOn =>
      Boolean(addOn)
    )
)
const variantLineId = (variant: MenuFoodPriceOption | null) =>
  [
    props.item.id,
    variant?.id,
    ...selectedAddOns.value.map((addOn: MenuFoodAddOn) => addOn.id),
  ]
    .filter(Boolean)
    .join(':')
const quantity = computed(() =>
  Number(props.quantities?.[variantLineId(selectedVariant.value)] || 0)
)
const displayPrice = computed(() =>
  selectedVariant.value?.priceLabel || props.item.priceLabel
)
const orderItem = computed<MenuFoodOrderItem>(() => ({
  ...props.item,
  lineId: variantLineId(selectedVariant.value),
  ...(selectedAddOns.value.length ? { addOns: selectedAddOns.value } : {}),
  ...(selectedVariant.value ? { variant: selectedVariant.value } : {}),
}))

function toggleAddOn(id: string) {
  selectedAddOnIds.value = selectedAddOnIds.value.includes(id)
    ? selectedAddOnIds.value.filter((addOnId: string) => addOnId !== id)
    : [...selectedAddOnIds.value, id].sort()
}

watch(
  [variantOptions, addOnOptions, () => props.quantities],
  () => {
    selectedAddOnIds.value = selectedAddOnIds.value.filter((id: string) =>
      addOnOptions.value.some((addOn: MenuFoodAddOn) => addOn.id === id)
    )

    if (!variantOptions.value.length) {
      selectedVariantId.value = ''
      return
    }

    const selectedStillExists = variantOptions.value.some(
      (variant) => variant.id === selectedVariantId.value
    )
    if (selectedStillExists) return

    selectedVariantId.value =
      variantOptions.value.find(
        (variant) => Number(props.quantities?.[variantLineId(variant)] || 0) > 0
      )?.id ||
      variantOptions.value[0]?.id ||
      ''
  },
  { immediate: true, deep: true }
)
</script>

<style scoped>
.menu-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: start;
  padding-bottom: 0.7rem;
  border-bottom: 1px solid color-mix(in srgb, var(--menu-text) 18%, transparent);
}

.menu-item--with-image {
  grid-template-columns: 5.5rem minmax(0, 1fr) auto;
}

.menu-item:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.menu-item__media {
  overflow: hidden;
  width: 5.5rem;
  aspect-ratio: 1;
  border: 1px solid color-mix(in srgb, var(--menu-text) 12%, transparent);
  border-radius: 0.95rem;
  background: color-mix(in srgb, var(--menu-text) 8%, transparent);
}

.menu-item__media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.menu-item__copy,
.menu-item__actions {
  display: grid;
}

.menu-item__copy {
  gap: 0.2rem;
}

.menu-item__actions {
  gap: 0.45rem;
  justify-items: end;
}

.menu-item h3,
.menu-item p {
  margin: 0;
}

.menu-item h3 {
  font-size: 1.1rem;
  font-weight: 850;
  letter-spacing: -0.03em;
  color: var(--menu-title);
}

.menu-item__copy p {
  color: var(--menu-muted);
  font-size: 0.9rem;
  line-height: 1.35;
}

.menu-item__price {
  color: var(--menu-primary);
  font-size: 0.95rem;
  font-weight: 850;
  white-space: nowrap;
}

.menu-item__price--inline {
  white-space: normal;
}

@media (max-width: 620px) {
  .menu-item--with-image {
    grid-template-columns: 4.75rem minmax(0, 1fr) auto;
    gap: 0.75rem;
  }

  .menu-item__media {
    width: 4.75rem;
    border-radius: 0.8rem;
  }
}
</style>
