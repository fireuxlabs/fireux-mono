<template>
  <div class="menu-order-allergen">
    <UIcon
      :name="icon"
      class="menu-order-allergen__icon"
      aria-hidden="true"
    />

    <div class="menu-order-allergen__copy">
      <p class="menu-order-placeholder">
        {{ notice }}
      </p>

      <UCheckbox
        class="menu-order-allergen__check"
        :model-value="modelValue"
        :label="checkboxLabel"
        @update:model-value="$emit('update:modelValue', Boolean($event))"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFunnelAllergen } from '../../../../composables/fireux/public/menu/useFunnelAllergen'

defineProps<{
  modelValue: boolean
}>()

defineEmits<{
  (event: 'update:modelValue', value: boolean): void
}>()

const { icon, notice, checkboxLabel } = useFunnelAllergen()
</script>
