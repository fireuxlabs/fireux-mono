<template>
  <div class="menu-order-quantity" data-menu-option-group="quantity">
    <span :id="labelId">Quantity</span>
    <div class="menu-order-quantity__stepper" :aria-labelledby="labelId">
      <button
        type="button"
        aria-label="Decrease quantity"
        :disabled="modelValue <= 1"
        @click="change(-1)"
      >
        <UIcon name="i-lucide-minus" aria-hidden="true" />
      </button>
      <output aria-live="polite">{{ modelValue }}</output>
      <button
        type="button"
        aria-label="Increase quantity"
        :disabled="modelValue >= 99"
        @click="change(1)"
      >
        <UIcon name="i-lucide-plus" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'

const props = defineProps<{
  modelValue: number
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: number): void
}>()

const labelId = `${useId()}-label`

function change(delta: number) {
  emit('update:modelValue', Math.min(99, Math.max(1, props.modelValue + delta)))
}
</script>

<style scoped>
.menu-order-quantity {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 4);
  color: var(--menu-title);
  font-weight: var(--font-weight-extrabold);
}

.menu-order-quantity__stepper {
  display: grid;
  grid-template-columns: 2.5rem 2.5rem 2.5rem;
  align-items: center;
  border: 1px solid color-mix(in srgb, var(--menu-text) 18%, transparent);
  border-radius: var(--menu-radius-control);
  overflow: hidden;
}

.menu-order-quantity__stepper button {
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  place-items: center;
  border: 0;
  background: color-mix(in srgb, var(--menu-primary) 8%, var(--menu-bg));
  color: var(--menu-primary);
  cursor: pointer;
}

.menu-order-quantity__stepper button:disabled {
  color: var(--menu-muted);
  cursor: not-allowed;
  opacity: 0.55;
}

.menu-order-quantity__stepper output {
  color: var(--menu-text);
  font-size: 0.95rem;
  font-weight: var(--font-weight-black);
  text-align: center;
}
</style>
