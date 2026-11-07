<template>
  <UCard>
    <div class="booking-sandbox-configuration">
      <UFormField label="Booking title" name="bookingTitle">
        <UInput
          class="booking-sandbox-configuration__input"
          :model-value="modelValue.serviceName"
          autocomplete="off"
          maxlength="100"
          required
          @update:model-value="updateText('serviceName', $event)"
        />
      </UFormField>
      <UFormField label="Description" name="description">
        <UInput
          class="booking-sandbox-configuration__input"
          :model-value="modelValue.description"
          maxlength="200"
          @update:model-value="updateText('description', $event)"
        />
      </UFormField>
      <UFormField label="Confirm button" name="confirmLabel">
        <UInput
          class="booking-sandbox-configuration__input"
          :model-value="modelValue.confirmLabel"
          maxlength="60"
          @update:model-value="updateText('confirmLabel', $event)"
        />
      </UFormField>
      <UFormField label="Maximum group size" name="maxGroupSize">
        <UInput
          class="booking-sandbox-configuration__input"
          :model-value="modelValue.maxGroupSize"
          type="number"
          min="1"
          max="50"
          step="1"
          @update:model-value="updateMaxGroupSize"
        />
      </UFormField>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { SandboxBookingConfiguration } from '~/models/booking-sandbox'

const props = defineProps<{ modelValue: SandboxBookingConfiguration }>()

const emit = defineEmits<{
  'update:modelValue': [value: SandboxBookingConfiguration]
}>()

function updateText(
  field: 'serviceName' | 'description' | 'confirmLabel',
  value: unknown
) {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: typeof value === 'string' ? value : '',
  })
}

function updateMaxGroupSize(value: unknown) {
  const next = Number(value)
  if (!Number.isInteger(next)) return

  emit('update:modelValue', {
    ...props.modelValue,
    maxGroupSize: Math.min(50, Math.max(1, next)),
  })
}
</script>

<style scoped>
.booking-sandbox-configuration {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: calc(var(--spacing) * 4);
}

.booking-sandbox-configuration__input {
  width: 100%;
}

@media (max-width: 38rem) {
  .booking-sandbox-configuration {
    grid-template-columns: 1fr;
  }
}
</style>
