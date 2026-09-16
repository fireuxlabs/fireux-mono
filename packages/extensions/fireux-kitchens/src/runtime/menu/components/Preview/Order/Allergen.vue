<template>
  <div class="menu-order-allergen">
    <h2 class="menu-order-screen-title">Allergy check</h2>

    <div class="menu-order-allergen__body">
      <div class="menu-order-allergen__copy">
        <UIcon
          :name="notice.icon"
          class="menu-order-allergen__icon"
          aria-hidden="true"
        />

        <p class="menu-order-placeholder">
          {{ notice.message }}
        </p>
      </div>

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
defineProps<{
  modelValue: boolean
}>()

defineEmits<{
  (event: 'update:modelValue', value: boolean): void
}>()

const notice = {
  checkboxLabel: 'I understand',
  icon: 'i-lucide-shield-alert',
  message:
    'If you have a food allergy or intolerance, please speak to the kitchen before ordering.',
}
</script>
