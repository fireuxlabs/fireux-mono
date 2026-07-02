<template>
  <div class="menu-order-allergen">
    <h2 class="menu-order-screen-title">
      Allergy check
    </h2>

    <UIcon
      :name="notice.icon"
      class="menu-order-allergen__icon"
      aria-hidden="true"
    />

    <div class="menu-order-allergen__copy">
      <p class="menu-order-placeholder">
        {{ notice.message }}
      </p>

      <UCheckbox
        class="menu-order-allergen__check"
        :model-value="modelValue"
        :label="notice.checkboxLabel"
        @update:model-value="$emit('update:modelValue', Boolean($event))"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAllergenNotice } from '../../../../composables/fireux/kitchen/order/funnel/shared/useAllergenNotice'

defineProps<{
  modelValue: boolean
}>()

defineEmits<{
  (event: 'update:modelValue', value: boolean): void
}>()

const notice = useAllergenNotice()
</script>
