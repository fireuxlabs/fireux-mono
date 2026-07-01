import {
  computed,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue'
import type {
  MenuFoodAddOn,
  MenuFoodItem,
  MenuFoodOrderItem,
  MenuFoodPriceOption,
} from '../../../../models/kitchen/menu/menu-food.model'

type UseItemOptions = {
  item: MaybeRefOrGetter<MenuFoodItem>
  quantities?: MaybeRefOrGetter<Record<string, number> | undefined>
}

export function useItem(options: UseItemOptions) {
  const item = computed(() => toValue(options.item))
  const quantities = computed(() => toValue(options.quantities) || {})
  const selectedVariantId = ref('')
  const selectedAddOnIds = ref<string[]>([])
  const variantOptions = computed<MenuFoodPriceOption[]>(() =>
    item.value.priceOptions || []
  )
  const addOnOptions = computed<MenuFoodAddOn[]>(() =>
    item.value.addOns || []
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
      item.value.id,
      variant?.id,
      ...selectedAddOns.value.map((addOn: MenuFoodAddOn) => addOn.id),
    ]
      .filter(Boolean)
      .join(':')
  const quantity = computed(() =>
    Number(quantities.value[variantLineId(selectedVariant.value)] || 0)
  )
  const displayPrice = computed(() =>
    selectedVariant.value?.priceLabel || item.value.priceLabel
  )
  const orderItem = computed<MenuFoodOrderItem>(() => ({
    ...item.value,
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
    [variantOptions, addOnOptions, quantities],
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
          (variant) => Number(quantities.value[variantLineId(variant)] || 0) > 0
        )?.id ||
        variantOptions.value[0]?.id ||
        ''
    },
    { immediate: true, deep: true }
  )

  return {
    addOnOptions,
    displayPrice,
    orderItem,
    quantity,
    selectedAddOnIds,
    selectedVariant,
    selectedVariantId,
    toggleAddOn,
    variantOptions,
  }
}
