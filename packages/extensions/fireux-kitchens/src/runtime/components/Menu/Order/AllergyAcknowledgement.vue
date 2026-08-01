<!-- Concurrent edit — 2026-07-29 12:44 CEST — Menu Order funnel pass: keep the allergy acknowledgement inside every canonical ordering checkout. -->
<template>
  <UAlert
    class="menu-order-allergy-acknowledgement"
    :color="invalid ? 'error' : 'neutral'"
    data-menu-order-allergy-acknowledgement
    icon="i-lucide-shield-alert"
    title="Allergy check"
    variant="soft"
  >
    <template #description>
      <div class="menu-order-allergy-acknowledgement__body">
        <p id="menu-order-allergy-acknowledgement-description">
          If you have a food allergy or intolerance, please speak to the
          Kitchen before sending your order.
        </p>

        <UCheckbox
          aria-describedby="menu-order-allergy-acknowledgement-description"
          :disabled="disabled"
          label="I understand"
          :model-value="modelValue"
          @update:model-value="
            $emit('update:modelValue', Boolean($event))
          "
        />
      </div>
    </template>
  </UAlert>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  disabled?: boolean
  invalid?: boolean
  modelValue: boolean
}>(), {
  disabled: false,
  invalid: false,
})

defineEmits<{
  (event: 'update:modelValue', value: boolean): void
}>()
</script>

<style scoped>
.menu-order-allergy-acknowledgement {
  text-align: left;
}

.menu-order-allergy-acknowledgement__body {
  display: grid;
  gap: calc(var(--spacing) * 3);
}

.menu-order-allergy-acknowledgement__body p {
  margin: 0;
}
</style>
