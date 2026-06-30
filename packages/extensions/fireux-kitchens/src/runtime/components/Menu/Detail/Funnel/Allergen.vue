<template>
  <div class="menu-order-allergen">
    <UIcon
      name="i-lucide-shield-alert"
      class="menu-order-allergen__icon"
      aria-hidden="true"
    />

    <div class="menu-order-allergen__copy">
      <p class="menu-order-placeholder">
        If you have a food allergy or intolerance, please speak to the kitchen before ordering.
      </p>

      <UCheckbox
        class="menu-order-allergen__check"
        :model-value="modelValue"
        label="I understand"
        @update:model-value="$emit('update:modelValue', Boolean($event))"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
}>()

defineEmits<{
  (event: 'update:modelValue', value: boolean): void
}>()
</script>
